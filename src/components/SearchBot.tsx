import { useState, useMemo } from 'react';
import { Search, Bot, Palette, ArrowRight, Video, Download, Loader2, PlusCircle, CheckCircle, Sparkles, link2 } from 'lucide-react';
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
  
  // حالات محمل تيك توك الاحترافية
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [videoResult, setVideoResult] = useState<string | null>(null);

  const { data: resources } = useResources();

  // منطق البحث الذكي
  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    const q = query.toLowerCase();
    return resources.filter((res) => 
      (res.title?.toLowerCase().includes(q)) || (res.title_ar?.includes(q))
    );
  }, [query, resources]);

  // ✨ محرك التحميل الذكي (يدعم الروابط المختصرة VT)
  const handleTikTokDownload = async () => {
    let cleanUrl = tiktokUrl.trim();
    
    if (!cleanUrl.includes('tiktok.com')) {
      toast.error("الرابط غير صحيح، تأكد من نسخه من تيك توك");
      return;
    }

    setIsDownloading(true);
    setVideoResult(null);
    setProgress(5);

    // ⏳ تايمر وهمي احترافي متفاعل مع نوع الرابط
    const isShortLink = cleanUrl.includes('vt.tiktok.com');
    setStatusText(isShortLink ? "جاري فك تشفير الرابط المختصر..." : "جاري الاتصال بالسيرفر...");

    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + 5));
    }, 300);

    try {
      // إرسال الرابط للـ API (الأداة تتعامل مع الـ Redirects بشكل أفضل عند إرسالها كـ Param)
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`);
      const data = await res.json();

      clearInterval(interval);

      if (data.code === 0 && data.data.play) {
        setProgress(100);
        setStatusText("اكتمل الاستخراج بنجاح!");
        setTimeout(() => {
          setVideoResult(data.data.play);
          setIsDownloading(false);
        }, 500);
        toast.success("تم تجهيز الفيديو بدون علامة مائية");
      } else {
        throw new Error("Failed to Fetch");
      }
    } catch (error) {
      clearInterval(interval);
      setIsDownloading(false);
      setProgress(0);
      // رسالة خطأ ذكية
      toast.error(
        <div className="text-right">
          <p className="font-bold">فشل الاستخراج</p>
          <p className="text-[10px]">الروابط المختصرة (vt) أحياناً يحظرها تيك توك، جرب الرابط الطويل من المتصفح.</p>
        </div>
      );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 space-y-5 text-right" dir="rtl">
      
      {/* 1. مساعد البحث الرئيسي */}
      <motion.div layout className="glass-card rounded-3xl p-6 border border-primary/10 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Bot /></div>
          <h3 className="font-bold text-base sm:text-lg">مساعد البحث الذكي</h3>
        </div>
        <div className="flex gap-2">
          <Input 
            value={query} 
            onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}} 
            placeholder="ابحث عن ملحقاتك..." 
            className="h-12 sm:h-14 bg-background/50 border-primary/20" 
          />
          <Button onClick={() => setHasSearched(true)} className="h-12 sm:h-14 px-6 sm:px-8">
            <Search className="h-5 w-5" />
          </Button>
        </div>
        <AnimatePresence>
          {hasSearched && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {searchResults.slice(0, 4).map((res) => <ResourceCard key={res.id} resource={res} compact />)}
                </div>
              ) : (
                <Button className="w-full h-12 rounded-xl">أرسل طلب للأدمن</Button>
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
              <Palette />
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
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowMoreTools(!showMoreTools)} 
          className="rounded-full bg-background px-6 text-[10px] font-bold z-10 border-border"
        >
          {showMoreTools ? "إخفاء الأدوات" : "المزيد من الأدوات"}
        </Button>
      </div>

      {/* 3. محمل تيك توك المطور (يدعم VT و PC) */}
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
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white shadow-lg"><Video /></div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base">محمل تيك توك الذكي</h4>
                    {isDownloading && <p className="text-[10px] text-pink-500 animate-pulse mt-1">{statusText}</p>}
                  </div>
                </div>
                {isDownloading && <Loader2 className="h-5 w-5 animate-spin text-pink-500" />}
              </div>

              {/* شريط التقدم الوهمي */}
              {isDownloading && (
                <div className="w-full bg-pink-500/10 h-1.5 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-pink-500" animate={{ width: `${progress}%` }} />
                </div>
              )}

              {!videoResult ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    placeholder="ضع رابط (vt.tiktok) أو الرابط العادي..." 
                    className="h-14 text-sm sm:text-base bg-background/50 border-pink-500/10" 
                    value={tiktokUrl} 
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    disabled={isDownloading}
                  />
                  <Button 
                    onClick={handleTikTokDownload} 
                    disabled={isDownloading || !tiktokUrl} 
                    className="bg-[#FE2C55] h-14 w-full sm:w-28 shadow-lg shadow-pink-500/20 active:scale-95 transition-all font-bold"
                  >
                    {isDownloading ? <Sparkles className="animate-pulse h-5 w-5" /> : "استخراج"}
                  </Button>
                </div>
              ) : (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-xs font-bold text-green-700">تم فك تشفير الرابط بنجاح!</span>
                  </div>
                  <Button 
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg"
                    onClick={() => { window.open(videoResult, '_blank'); setVideoResult(null); setTiktokUrl(''); }}
                  >
                    تحميل الفيديو الآن
                  </Button>
                </motion.div>
              )}
              
              <p className="text-[9px] text-muted-foreground text-center bg-pink-500/5 py-1 rounded-lg">
                * الروابط المختصرة (vt) قد تستغرق وقتاً أطول قليلاً للمعالجة
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
