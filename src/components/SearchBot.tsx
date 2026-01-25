import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, Bot, Palette, ArrowRight, Video, Loader2, CheckCircle, Sparkles, ExternalLink, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useResources } from '@/hooks/useResources';
import { supabase } from '@/integrations/supabase/client';
import { ResourceCard } from './ResourceCard';
import { toast } from 'sonner';

export function SearchBot() {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');

  const { data: resources } = useResources();
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const lastPasteTimeRef = useRef(0);

  // منطق البحث الذكي
  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    const q = query.toLowerCase();
    return resources.filter((res) => 
      (res.title?.toLowerCase().includes(q)) || (res.title_ar?.includes(q))
    );
  }, [query, resources]);

  // دالة إرسال طلب للأدمن
  const handleSubmitRequest = useCallback(async () => {
    if (!query.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await supabase.from('requests').insert({ search_query: query.trim() });
      toast.success("تم إرسال طلبك بنجاح");
    } catch { 
      toast.error("فشل الإرسال"); 
    } finally { 
      setIsSubmitting(false); 
    }
  }, [query, isSubmitting]);

  // ✨ محول الروابط المختصرة
  const resolveShortUrl = useCallback(async (url: string): Promise<string> => {
    try {
      // إذا كان الرابط مختصراً، نحوله إلى رابط طويل
      if (url.includes('vt.tiktok.com') || url.includes('vm.tiktok.com')) {
        setStatusText("جاري تحويل الرابط المختصر...");
        
        // استخدام fetch مع redirect لمعرفة الرابط النهائي
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch(url, {
            method: 'GET',
            redirect: 'manual',
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (response.status === 301 || response.status === 302) {
            const location = response.headers.get('location');
            if (location && location.includes('tiktok.com')) {
              return location;
            }
          }
        } catch {
          // في حالة فشل الـ fetch، نستخدم الرابط الأصلي
        } finally {
          clearTimeout(timeoutId);
        }
      }
      return url;
    } catch (error) {
      console.log('فشل تحويل الرابط:', error);
      return url;
    }
  }, []);

  // ✨ طريقة تحميل بديلة باستخدام API آخر
  const fetchAlternativeDownload = useCallback(async (url: string) => {
    try {
      // المحاولة الثانية: استخدام API بديل
      setStatusText("جربنا مصدر ثاني للتحميل...");
      
      const api2Response = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
      const api2Data = await api2Response.json();
      
      if (api2Data.video && api2Data.video.noWatermark) {
        return {
          videoUrl: api2Data.video.noWatermark,
          title: api2Data.desc || 'فيديو تيك توك'
        };
      }
      
      // المحاولة الثالثة
      setStatusText("نحاول من مصدر آخر...");
      const api3Response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`);
      const api3Data = await api3Response.json();
      
      if (api3Data.code === 0 && api3Data.data.play) {
        return {
          videoUrl: api3Data.data.play,
          title: api3Data.data.title || 'فيديو تيك توك'
        };
      }
      
      throw new Error('جميع المصادر فشلت');
    } catch (error) {
      throw error;
    }
  }, []);

  // ✨ محرك التحميل الرئيسي المحسن
  const handleTikTokDownload = useCallback(async () => {
    if (isProcessingRef.current || !tiktokUrl.trim()) return;
    
    let cleanUrl = tiktokUrl.trim();
    
    // تحقق من الرابط
    if (!cleanUrl.includes('tiktok.com')) {
      toast.error(
        <div className="text-right">
          <p className="font-bold">الرابط غير صحيح</p>
          <p className="text-xs">تأكد من نسخ رابط تيك توك صحيح</p>
        </div>
      );
      return;
    }

    isProcessingRef.current = true;
    setIsDownloading(true);
    setVideoResult(null);
    setProgress(5);
    setVideoTitle('');

    // تنظيف المؤقتات السابقة
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // شريط التقدم الوهمي مع رسائل متغيرة
    const messages = [
      "جاري التحقق من الرابط...",
      "جاري تحويل الرابط المختصر...",
      "جاري الاتصال بالسيرفر...",
      "جاري فك تشفير الفيديو...",
      "جاري إزالة العلامة المائية...",
      "جاري تجهيز الفيديو..."
    ];
    
    let messageIndex = 0;
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        
        // تغيير الرسالة كل 15%
        if (prev % 15 === 0 && messageIndex < messages.length - 1) {
          messageIndex++;
          setStatusText(messages[messageIndex]);
        }
        
        return prev + 5;
      });
    }, 400);

    try {
      // 🔧 الخطوة 1: حل الروابط المختصرة
      const resolvedUrl = await resolveShortUrl(cleanUrl);
      setProgress(25);

      // 🔧 الخطوة 2: محاولة التنزيل من مصدر بديل
      const result = await fetchAlternativeDownload(resolvedUrl);
      
      // تنظيف المؤقت
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setProgress(100);
      setStatusText("اكتمل الاستخراج بنجاح!");
      setVideoTitle(result.title);
      
      setTimeout(() => {
        setVideoResult(result.videoUrl);
        setIsDownloading(false);
        isProcessingRef.current = false;
        toast.success(
          <div className="text-right">
            <p className="font-bold">تم تجهيز الفيديو</p>
            <p className="text-xs">بدون علامة مائية وبجودة عالية</p>
          </div>
        );
      }, 600);

    } catch (error) {
      // تنظيف المؤقت
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      setIsDownloading(false);
      isProcessingRef.current = false;
      setProgress(0);
      
      toast.error(
        <div className="text-right space-y-2">
          <p className="font-bold">فشل في استخراج الفيديو</p>
          <div className="text-xs space-y-1">
            <p>• قد يكون الفيديو خاصاً أو محذوفاً</p>
            <p>• جرب رابط تيك توك الطويل من المتصفح</p>
            <p>• تأكد من اتصال الإنترنت وأعد المحاولة</p>
          </div>
        </div>,
        { duration: 6000 }
      );
    }
  }, [tiktokUrl, resolveShortUrl, fetchAlternativeDownload]);

  // معالجة اللصق
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const now = Date.now();
    if (now - lastPasteTimeRef.current < 1000) {
      e.preventDefault();
      toast.info("انتظر قليلاً قبل اللصق مرة أخرى");
      return;
    }
    lastPasteTimeRef.current = now;
    
    const pastedText = e.clipboardData.getData('text');
    setTiktokUrl(pastedText);
  }, []);

  // تنظيف المؤقتات
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // إعادة تعيين حالة TikTok
  const resetTikTokState = useCallback(() => {
    setVideoResult(null);
    setTiktokUrl('');
    setProgress(0);
    setStatusText('');
    setVideoTitle('');
    isProcessingRef.current = false;
  }, []);

  // معالجة تغيير البحث
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setHasSearched(false);
  }, []);

  // تبديل عرض الأدوات الإضافية
  const toggleShowMoreTools = useCallback(() => {
    setShowMoreTools(prev => !prev);
  }, []);

  // فتح الرابط في نافذة جديدة
  const openVideoLink = useCallback(() => {
    if (!videoResult) return;
    
    // إنشاء رابط للتنزيل
    const link = document.createElement('a');
    link.href = videoResult;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // إضافة اسم ملف
    const fileName = videoTitle 
      ? `${videoTitle.replace(/[^\w\s]/gi, '').substring(0, 30)}.mp4`
      : 'tiktok-video.mp4';
    link.download = fileName;
    
    // إضافة الرسالة للمستخدم
    toast.info(
      <div className="text-right space-y-1">
        <p className="font-bold">جاري فتح الفيديو</p>
        <p className="text-xs">اضغط على "حفظ" أو "Download" في المتصفح</p>
      </div>,
      { duration: 3000 }
    );
    
    // فتح الرابط
    link.click();
    
    // إعادة التعيين بعد 2 ثانية
    setTimeout(() => {
      resetTikTokState();
    }, 2000);
  }, [videoResult, videoTitle, resetTikTokState]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 space-y-5 text-right" dir="rtl">
      
      {/* 1. مساعد البحث الرئيسي */}
      <motion.div layout className="glass-card rounded-3xl p-6 border border-primary/10 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base sm:text-lg">مساعد البحث الذكي</h3>
        </div>
        <div className="flex gap-2">
          <Input 
            value={query} 
            onChange={handleQueryChange}
            placeholder="ابحث عن ملحقاتك..." 
            className="h-14 bg-background/50 border-primary/20 focus:border-primary/40" 
            onKeyDown={(e) => e.key === 'Enter' && query.trim() && setHasSearched(true)}
          />
          <Button 
            onClick={() => query.trim() && setHasSearched(true)} 
            className="h-14 px-8 bg-primary hover:bg-primary/90"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
        <AnimatePresence>
          {hasSearched && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 overflow-hidden"
            >
              {searchResults.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {searchResults.slice(0, 4).map((res) => <ResourceCard key={res.id} resource={res} compact />)}
                </div>
              ) : (
                <Button 
                  onClick={handleSubmitRequest} 
                  disabled={isSubmitting} 
                  className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'أرسل طلب للأدمن'}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 2. مستخرج الألوان */}
      <Link to="/color-extractor" className="group block glass-card rounded-2xl p-4 border border-primary/20 hover:border-primary/40 transition-all shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base">مستخرج الألوان الإسلامي</h4>
              <p className="text-[10px] text-muted-foreground">حول صورك لباليتة ألوان احترافية</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-primary rotate-180" />
        </div>
      </Link>

      {/* زر المزيد */}
      <div className="relative py-2 flex justify-center">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleShowMoreTools} 
          className="rounded-full bg-background px-6 text-[10px] font-bold z-10 border-border hover:text-primary"
        >
          {showMoreTools ? "إخفاء الأدوات" : "المزيد من الأدوات"}
        </Button>
      </div>

      {/* 3. محمل تيك توك مع التصميم الأصلي */}
      <AnimatePresence>
        {showMoreTools && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="glass-card rounded-3xl p-6 border border-primary/20 shadow-xl"
          >
            <div className="flex flex-col gap-5 text-right">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                    <Video className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base">محمل تيك توك الذكي</h4>
                    {isDownloading && <p className="text-[10px] text-primary animate-pulse mt-1">{statusText}</p>}
                  </div>
                </div>
                {isDownloading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              </div>

              {/* شريط التقدم */}
              <AnimatePresence>
                {isDownloading && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                    <div className="flex justify-between text-xs">
                      <span className="text-primary font-medium">{statusText}</span>
                      <span className="font-bold text-primary">{progress}%</span>
                    </div>
                    <div className="w-full bg-primary/10 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary" 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!videoResult ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    placeholder="ضع رابط فيديو تيك توك..." 
                    className="h-14 bg-background/50 border-primary/20" 
                    value={tiktokUrl} 
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    onPaste={handlePaste}
                    disabled={isDownloading}
                  />
                  <Button 
                    onClick={handleTikTokDownload} 
                    disabled={isDownloading || !tiktokUrl.trim()} 
                    className="h-14 bg-primary hover:bg-primary/90"
                  >
                    {isDownloading ? (
                      <div className="flex items-center gap-2">
                        <Sparkles className="animate-pulse h-5 w-5" />
                        <span>جاري الاستخراج</span>
                      </div>
                    ) : "استخراج الفيديو"}
                  </Button>
                </div>
              ) : (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }}
                  className="p-4 bg-primary/10 border border-primary/20 rounded-2xl space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div>
                      <h5 className="text-sm font-bold">تم استخراج الفيديو بنجاح!</h5>
                      {videoTitle && <p className="text-xs text-muted-foreground mt-1">{videoTitle}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      className="h-14 flex-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                      onClick={openVideoLink}
                    >
                      <div className="flex items-center gap-2 justify-center">
                        <ExternalLink className="h-4 w-4" />
                        <span>تحميل الفيديو الآن</span>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-14 rounded-xl"
                      onClick={resetTikTokState}
                    >
                      رابط جديد
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {/* معلومات للمستخدم */}
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground bg-primary/5 py-2 px-3 rounded-lg">
                  <span className="font-bold text-primary">✨ يدعم:</span> الروابط المختصرة • بدون علامة مائية • جميع الأجهزة
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
