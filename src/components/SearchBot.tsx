import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, Bot, Palette, ArrowRight, Video, Loader2, CheckCircle, Sparkles, ExternalLink } from 'lucide-react';
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
  const [originalUrl, setOriginalUrl] = useState<string>('');

  const { data: resources } = useResources();
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false); // لمنع الضغط المتكرر
  const lastPasteTimeRef = useRef(0); // لتتبع وقت اللصق الأخير

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

  // ✨ حل مشكلة الروابط المختصرة خلف الكواليس
  const resolveTikTokUrl = useCallback(async (url: string): Promise<string> => {
    try {
      // إذا كان الرابط قصيراً (vt.tiktok.com)، نحوله إلى رابط طويل
      if (url.includes('vt.tiktok.com') || url.includes('vm.tiktok.com')) {
        setStatusText("جاري تحويل الرابط المختصر...");
        
        // محاولة الحصول على الرابط النهائي عبر fetch
        const response = await fetch(url, {
          method: 'HEAD',
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        // البحث عن الرابط النهائي في headers
        const location = response.headers.get('location');
        if (location && location.includes('tiktok.com')) {
          return location;
        }
        
        // إذا لم نجد، نعيد الرابط الأصلي
        return url;
      }
      
      return url;
    } catch (error) {
      console.log('فشل تحويل الرابط، سيتم استخدام الرابط الأصلي:', error);
      return url;
    }
  }, []);

  // ✨ محرك التحميل الذكي المحسن
  const handleTikTokDownload = useCallback(async () => {
    // منع الضغط المتكرر
    if (isProcessingRef.current || !tiktokUrl.trim()) return;
    
    let cleanUrl = tiktokUrl.trim();
    
    if (!cleanUrl.includes('tiktok.com')) {
      toast.error("الرابط غير صحيح، تأكد من نسخه من تيك توك");
      return;
    }

    // تفعيل قفل المعالجة
    isProcessingRef.current = true;
    setIsDownloading(true);
    setVideoResult(null);
    setProgress(5);
    setOriginalUrl(cleanUrl);

    // ⏳ تايمر وهمي احترافي
    const isShortLink = cleanUrl.includes('vt.tiktok.com');
    setStatusText(isShortLink ? "جاري تحويل الرابط المختصر..." : "جاري الاتصال بالسيرفر...");

    // تنظيف أي مؤقت سابق
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return prev;
        }
        // تسريع التقدم في البداية، ثم إبطاءه
        return prev + (prev < 40 ? 8 : 4);
      });
    }, 350);

    try {
      // 🔧 الخطوة 1: حل الروابط المختصرة
      let resolvedUrl = cleanUrl;
      if (isShortLink) {
        resolvedUrl = await resolveTikTokUrl(cleanUrl);
        setProgress(25);
        setStatusText("تم تحويل الرابط، جاري الاستخراج...");
      }

      // 🔧 الخطوة 2: استخراج الفيديو باستخدام API
      setStatusText("جاري فك تشفير الفيديو...");
      
      // محاولة باستخدام tikwm API
      const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(resolvedUrl)}`;
      const res = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const data = await res.json();

      // تنظيف المؤقت
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (data.code === 0 && data.data.play) {
        setProgress(100);
        setStatusText("اكتمل الاستخراج بنجاح!");
        
        // تأخير قصير لإظهار 100%
        setTimeout(() => {
          setVideoResult(data.data.play);
          setIsDownloading(false);
          isProcessingRef.current = false;
          toast.success("تم تجهيز الفيديو بدون علامة مائية");
        }, 600);
      } else {
        throw new Error("فشل في استخراج الفيديو");
      }
    } catch (error) {
      // تنظيف المؤقت في حالة الخطأ
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      setIsDownloading(false);
      isProcessingRef.current = false;
      setProgress(0);
      
      // رسالة خطأ ذكية مع حلول
      toast.error(
        <div className="text-right space-y-2">
          <p className="font-bold">فشل الاستخراج</p>
          <div className="text-xs space-y-1">
            <p>• جرب الرابط الطويل من متصفح سطح المكتب</p>
            <p>• تأكد أن الفيديو ليس خاصاً (Private)</p>
            <p>• جرب إعادة تحميل الصفحة والمحاولة مرة أخرى</p>
          </div>
        </div>,
        {
          duration: 5000
        }
      );
    }
  }, [tiktokUrl, resolveTikTokUrl]);

  // معالجة اللصق في حقل الإدخال (حل مشكلة الهاتف)
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    // منع اللصق السريع المتكرر
    const now = Date.now();
    if (now - lastPasteTimeRef.current < 1000) {
      e.preventDefault();
      toast.info("يرجى الانتظار قليلاً قبل اللصق مرة أخرى");
      return;
    }
    lastPasteTimeRef.current = now;
    
    const pastedText = e.clipboardData.getData('text');
    setTiktokUrl(pastedText);
    
    // إظهار رسالة تأكيد
    setTimeout(() => {
      if (pastedText.includes('tiktok.com')) {
        toast.success("تم التعرف على رابط تيك توك");
      }
    }, 100);
  }, []);

  // تنظيف المؤقت عند فك التركيب
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

  // فتح الرابط في نافذة جديدة مع تحسينات للهاتف
  const openVideoLink = useCallback(() => {
    if (!videoResult) return;
    
    // إنشاء رابط قابل للتنزيل
    const downloadLink = document.createElement('a');
    downloadLink.href = videoResult;
    downloadLink.target = '_blank';
    downloadLink.rel = 'noopener noreferrer';
    downloadLink.download = 'tiktok-video.mp4';
    
    // إضافة نص تحفيزي للهاتف
    toast.info(
      <div className="text-right space-y-1">
        <p className="font-bold">جاري فتح الفيديو</p>
        <p className="text-xs">اضغط على "تحميل" أو "Download" في المتصفح</p>
      </div>,
      { duration: 3000 }
    );
    
    // فتح الرابط
    downloadLink.click();
    
    // إعادة تعيين بعد فترة
    setTimeout(() => {
      resetTikTokState();
    }, 2000);
  }, [videoResult, resetTikTokState]);

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
            className="h-14 px-8 bg-primary hover:bg-primary/90 active:scale-95 transition-transform"
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
                  className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] transition-transform"
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'أرسل طلب للأدمن'}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 2. مستخرج الألوان */}
      <Link 
        to="/color-extractor" 
        className="group block glass-card rounded-2xl p-4 border border-primary/20 hover:border-primary/40 transition-all shadow-md active:scale-[0.98]"
        onClick={(e) => {
          // منع النقر السريع المتكرر على الهاتف
          if (e.detail > 1) e.preventDefault();
        }}
      >
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
          className="rounded-full bg-background px-6 text-[10px] font-bold z-10 border-border hover:text-primary transition-colors active:scale-95"
        >
          {showMoreTools ? "إخفاء الأدوات" : "المزيد من الأدوات"}
        </Button>
      </div>

      {/* 3. محمل تيك توك المطور والمحسن */}
      <AnimatePresence>
        {showMoreTools && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="p-6 glass-card rounded-3xl border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-transparent shadow-xl relative"
          >
            <div className="flex flex-col gap-5 text-right">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FE2C55] to-black flex items-center justify-center text-white shadow-lg">
                    <Video className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base">محمل تيك توك الذكي</h4>
                    {isDownloading && <p className="text-[10px] text-pink-500 animate-pulse mt-1">{statusText}</p>}
                  </div>
                </div>
                {isDownloading && <Loader2 className="h-5 w-5 animate-spin text-pink-500" />}
              </div>

              {/* شريط التقدم الوهمي المحسن */}
              <AnimatePresence>
                {isDownloading && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                    <div className="flex justify-between text-xs">
                      <span className="text-pink-500 font-medium">{statusText}</span>
                      <span className="font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-pink-500/10 h-2.5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-[#FE2C55] to-pink-400" 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!videoResult ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    placeholder="الصق رابط تيك توك هنا..." 
                    className="h-14 text-sm sm:text-base bg-background/50 border-pink-500/10 focus:border-pink-500/30" 
                    value={tiktokUrl} 
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    onPaste={handlePaste}
                    disabled={isDownloading}
                  />
                  <Button 
                    onClick={handleTikTokDownload} 
                    disabled={isDownloading || !tiktokUrl.trim()} 
                    className="h-14 w-full sm:w-auto bg-gradient-to-r from-[#FE2C55] to-pink-600 shadow-lg shadow-pink-500/20 active:scale-95 transition-all font-bold disabled:opacity-50"
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
                  className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30 rounded-2xl space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <div>
                      <h5 className="text-sm font-bold text-green-700">تم استخراج الفيديو بنجاح!</h5>
                      <p className="text-xs text-green-600 mt-1">بدون علامة مائية وبجودة عالية</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      className="h-14 flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 active:scale-95"
                      onClick={openVideoLink}
                    >
                      <div className="flex items-center gap-2 justify-center">
                        <ExternalLink className="h-4 w-4" />
                        <span>تحميل الفيديو الآن</span>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-14 rounded-xl border-green-500/30 hover:border-green-500/50 active:scale-95"
                      onClick={resetTikTokState}
                    >
                      رابط جديد
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {/* نصائح للمستخدم */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center space-y-1"
              >
                <p className="text-[10px] text-muted-foreground bg-pink-500/5 py-2 px-3 rounded-lg">
                  <span className="font-bold text-pink-500">💡 نصائح:</span> يدعم الروابط المختصرة • يعمل على جميع الأجهزة • يفضل استخدام شبكة Wi-Fi
                </p>
                {originalUrl.includes('vt.') && (
                  <p className="text-[9px] text-amber-600 bg-amber-500/10 py-1 px-2 rounded">
                    🔄 تم تحويل الرابط المختصر تلقائياً
                  </p>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
