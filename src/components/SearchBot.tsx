import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, Bot, Palette, ArrowRight, Video, Loader2, CheckCircle, Sparkles, Download, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useResources } from '@/hooks/useResources';
import { supabase } from '@/integrations/supabase/client';
import { ResourceCard } from './ResourceCard';
import { toast } from 'sonner';

// --- المكونات الفرعية لتحسين الأداء وتنظيم الكود ---

const SearchHeader = () => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
      <Bot className="h-5 w-5" />
    </div>
    <div className="text-right">
      <h3 className="font-bold text-base sm:text-lg">مساعد البحث الذكي</h3>
      <p className="text-[10px] text-muted-foreground italic">ابحث عن الملحقات أو اطلبها من الأدمن</p>
    </div>
  </div>
);

const ColorExtractorLink = () => (
  <Link 
    to="/color-extractor" 
    className="group block glass-card rounded-2xl p-5 border border-primary/20 hover:border-primary/40 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
          <Palette className="h-6 w-6" />
        </div>
        <div className="text-right">
          <h4 className="font-bold text-sm sm:text-base">مستخرج الألوان الإسلامي</h4>
          <p className="text-[10px] text-muted-foreground font-medium">حول صورك لباليتة ألوان احترافية لتصاميمك</p>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-primary rotate-180 opacity-50 group-hover:opacity-100 transition-opacity" />
    </div>
  </Link>
);

// --- المكون الرئيسي للمحرّك والواجهة ---

export function SearchBot() {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  
  // حالات محمل تيك توك المتقدمة
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [videoResult, setVideoResult] = useState<string | null>(null);

  const { data: resources } = useResources();
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // تنظيف المؤقت عند تدمير المكون
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // منطق البحث الذكي (عربي/إنجليزي)
  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    const q = query.toLowerCase().trim();
    return resources.filter((res) => 
      (res.title?.toLowerCase().includes(q)) || 
      (res.title_ar?.toLowerCase().includes(q))
    );
  }, [query, resources]);

  // إرسال طلب ملحق للأدمن
  const handleSubmitRequest = async () => {
    if (!query.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('requests').insert({ search_query: query.trim() });
      if (error) throw error;
      toast.success("تم إرسال طلبك للأدمن بنجاح");
      setQuery('');
      setHasSearched(false);
    } catch (error) {
      toast.error("حدث خطأ أثناء إرسال الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 محرك التحميل المرتبط بـ Python Backend (حل مشكلة الروابط المختصرة)
  const handleTikTokDownload = useCallback(async () => {
    if (!tiktokUrl.includes('tiktok.com')) {
      toast.error("يرجى إدخال رابط تيك توك صحيح");
      return;
    }

    setIsDownloading(true);
    setVideoResult(null);
    setProgress(5);
    
    // تحديد الحالة بناءً على نوع الرابط
    const isShortLink = tiktokUrl.includes('vt.tiktok.com');
    setStatusText(isShortLink ? "جاري تتبع الرابط المختصر خلف الكواليس..." : "جاري الاتصال بالسيرفر وتنظيف الرابط...");

    // شريط تقدم وهمي تفاعلي
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + (isShortLink ? 3 : 6)));
    }, 450);

    try {
      // 🔗 إرسال الرابط لملف api/download.py للمعالجة
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tiktokUrl.trim() }),
      });
      
      const data = await response.json();

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      if (response.ok && data.download_link) {
        setProgress(100);
        setStatusText("اكتمل فك التشفير بنجاح!");
        setTimeout(() => {
          setVideoResult(data.download_link);
          setIsDownloading(false);
          toast.success("الفيديو جاهز الآن");
        }, 500);
      } else {
        throw new Error(data.error || "فشل الاستخراج");
      }
    } catch (error) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setIsDownloading(false);
      setProgress(0);
      toast.error("فشل في معالجة الرابط، جرب الرابط الطويل من المتصفح");
    }
  }, [tiktokUrl]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 space-y-6 text-right" dir="rtl">
      
      {/* صندوق البحث الرئيسي */}
      <motion.div layout className="glass-card rounded-[2rem] p-6 border border-primary/10 shadow-2xl relative overflow-hidden">
        <SearchHeader />
        <div className="flex flex-col sm:flex-row gap-3">
          <Input 
            value={query} 
            onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}} 
            onKeyDown={(e) => e.key === 'Enter' && setHasSearched(true)}
            placeholder="ابحث عن ملحقاتك (خطوط، خلفيات...)" 
            className="h-14 text-right bg-background/40 border-primary/10 focus-visible:ring-primary/20 rounded-2xl" 
          />
          <Button onClick={() => setHasSearched(true)} className="h-14 px-8 shadow-lg shadow-primary/10 rounded-2xl active:scale-95 transition-transform">
            <Search className="h-5 w-5" />
          </Button>
        </div>
        
        <AnimatePresence>
          {hasSearched && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {searchResults.slice(0, 4).map((res) => <ResourceCard key={res.id} resource={res} compact />)}
                </div>
              ) : (
                <div className="text-center p-6 bg-secondary/20 rounded-2xl border border-dashed border-border/50">
                   <p className="text-sm text-muted-foreground mb-4 font-medium italic">عذراً، لم نجد نتائج. هل نطلبها لك؟</p>
                   <Button onClick={handleSubmitRequest} disabled={isSubmitting} className="w-full h-12 rounded-xl bg-gradient-to-r from-primary/80 to-primary">
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "إرسال طلب للأدمن"}
                   </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* رابط مستخرج الألوان */}
      <ColorExtractorLink />

      {/* زر عرض المزيد من الأدوات */}
      <div className="relative py-2 flex justify-center">
        <div className="absolute inset-0 flex items-center px-10"><span className="w-full border-t border-border/50" /></div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowMoreTools(!showMoreTools)} 
          className="rounded-full bg-background px-6 text-[10px] font-bold z-10 border-border shadow-sm hover:text-primary transition-all active:scale-95"
        >
          {showMoreTools ? "إخفاء الأدوات" : "المزيد من الأدوات"}
        </Button>
      </div>

   {/* 3. محمل تيك توك - تصميم مدمج وأنيق */}
<AnimatePresence>
  {showTools && (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-5"
    >
      {/* العنوان المصغر */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-900 text-white flex items-center justify-center shadow-md">
          <Video className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm">محمل تيك توك الذكي</h4>
          <p className="text-[10px] text-emerald-600/70 font-medium">أعلى جودة • بدون علامة مائية</p>
        </div>
      </div>

      {/* شريط التقدم النحيف */}
      <AnimatePresence>
        {isDownloading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-bold text-emerald-800 uppercase px-1">
              <span>{statusText}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-emerald-50 h-1.5 rounded-full overflow-hidden border border-emerald-100/50">
              <motion.div 
                className="h-full bg-emerald-800" 
                animate={{ width: `${progress}%` }} 
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!videoResult ? (
        <div className="flex gap-2">
          <input 
            value={tiktokUrl} 
            onChange={(e) => setTiktokUrl(e.target.value)} 
            placeholder="ضع الرابط هنا..." 
            className="flex-1 h-12 rounded-xl bg-slate-50/50 border border-slate-100 px-4 text-left dir-ltr text-xs focus:ring-2 focus:ring-emerald-800 outline-none transition-all shadow-inner" 
          />
          <button 
            onClick={handleTikTokProcess} 
            disabled={isDownloading || !tiktokUrl} 
            className="px-6 h-12 rounded-xl bg-emerald-900 text-white font-bold text-xs shadow-md hover:bg-black transition-all active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="animate-spin h-4 w-4" /> : "تحميل"}
          </button>
        </div>
      ) : (
        <motion.div 
          initial={{ scale: 0.95 }} 
          animate={{ scale: 1 }} 
          className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-emerald-800 shadow-sm">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="max-w-[120px] sm:max-w-[200px]">
              <p className="text-[10px] font-bold text-emerald-900 truncate">تم التجهيز بنجاح</p>
              <p className="text-[9px] text-emerald-700/60 truncate">{videoResult?.videoInfo?.title}</p>
            </div>
          </div>
          
          <button 
            onClick={() => window.open(videoResult.downloadLink, '_blank')} 
            className="h-10 px-4 bg-emerald-800 text-white rounded-lg font-bold text-[10px] flex items-center gap-2 hover:bg-black transition-all shadow-sm"
          >
            <Download className="h-4 w-4" /> حفظ الفيديو
          </button>
        </motion.div>
      )}

      {/* تذييل بسيط */}
      <div className="text-center">
        <span className="text-[9px] text-slate-400 font-medium px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
          ✨ يدعم الروابط المختصرة تلقائياً
        </span>
      </div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
}
