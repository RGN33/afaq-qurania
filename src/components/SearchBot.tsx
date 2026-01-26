'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, Bot, Palette, ArrowRight, Video, Loader2, CheckCircle, Sparkles, ExternalLink, RefreshCcw, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useResources } from '@/hooks/useResources';
import { supabase } from '@/integrations/supabase/client';
import { ResourceCard } from './ResourceCard';
import { toast } from 'sonner';

export function SearchBot() {
  // --- حالات البحث والطلب ---
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  
  // --- حالات تيك توك الذكية ---
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');

  const { data: resources } = useResources();
  const isProcessingRef = useRef(false);

  // 1. منطق البحث الذكي
  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    const q = query.toLowerCase();
    return resources.filter((res) => 
      (res.title?.toLowerCase().includes(q)) || (res.title_ar?.includes(q))
    );
  }, [query, resources]);

  // 2. إرسال طلب للأدمن (مع الالتزام بـ 24 ساعة)
  const handleSubmitRequest = async () => {
    if (!query.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await supabase.from('requests').insert({ search_query: query.trim() });
      toast.success("تم إرسال طلبك بنجاح، سيتم الإضافة خلال 24 ساعة");
      setQuery('');
      setHasSearched(false);
    } catch { 
      toast.error("فشل الإرسال"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // 3. آلية التيك توك (تربط بالباك إند الخاص بك لضمان فك الروابط المختصرة)
  const handleTikTokDownload = async () => {
    if (!tiktokUrl.trim() || isDownloading) return;
    if (!tiktokUrl.includes('tiktok.com')) return toast.error("الرابط غير صحيح");

    setIsDownloading(true);
    setVideoResult(null);
    setProgress(15);
    setStatusText("جاري الاتصال بالسيرفر...");

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tiktokUrl.trim() }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setProgress(100);
        setStatusText("تم الاستخراج!");
        setTimeout(() => {
          setVideoResult(data.downloadLink);
          setVideoTitle(data.videoInfo.title);
          setIsDownloading(false);
        }, 500);
      } else { throw new Error(data.message); }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
      setIsDownloading(false);
      setProgress(0);
    }
  };

  const resetTikTok = () => {
    setVideoResult(null);
    setTiktokUrl('');
    setProgress(0);
  };

  // أنيميشن هادئ جداً لمنع الـ "قفز" المفاجئ
  const smoothTransition = { type: "spring", stiffness: 220, damping: 28 };

  // الاستايل الموحد للكروت (نفس الحجم والمظهر الزجاجي)
  const cardStyle = "bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-5 sm:p-7 border border-emerald-50 shadow-2xl shadow-emerald-900/5 w-full";

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 space-y-4 text-right" dir="rtl">
      
      {/* البحث الذكي */}
      <motion.div layout transition={smoothTransition} className={cardStyle}>
        <div className="flex items-center gap-3 mb-6 justify-start">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Bot className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-sm sm:text-base dark:text-emerald-50">مساعد البحث الذكي</h3>
        </div>

        <div className="flex gap-2">
          <Input 
            value={query} 
            onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}}
            placeholder="ابحث عن ملحقاتك..." 
            className="h-12 bg-slate-100/50 dark:bg-black/20 border-none ring-1 ring-emerald-500/10 px-4 text-sm" 
          />
          <button onClick={() => setHasSearched(true)} className="h-12 w-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-lg active:scale-95">
            <Search className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -5 }}
              className="mt-4"
            >
              {searchResults.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {searchResults.slice(0, 4).map((res) => <ResourceCard key={res.id} resource={res} compact />)}
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] text-center text-slate-400">الملحق غير متوفر حالياً</p>
                  <Button 
                    onClick={handleSubmitRequest} 
                    disabled={isSubmitting} 
                    className="w-full h-11 bg-emerald-900/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/10 rounded-xl text-xs"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "اطلب من الأدمن (سيتم الإضافة خلال 24 ساعة)"}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* مستخرج الألوان */}
      <Link to="/color-extractor" className="block group">
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl rounded-[1.2rem] p-4 border border-emerald-50 flex items-center justify-between hover:bg-white/90 transition-all shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:rotate-6 transition-transform">
              <Palette className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm dark:text-emerald-50">مستخرج الألوان الإسلامي</h4>
          </div>
          <ArrowRight className="h-4 w-4 text-emerald-800 rotate-180 group-hover:text-emerald-500" />
        </div>
      </Link>

      <div className="flex justify-center">
        <button onClick={() => setShowMoreTools(!showMoreTools)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-700 transition-colors py-2">
          {showMoreTools ? "إخفاء الأدوات" : "المزيد من الأدوات"}
        </button>
      </div>

      {/* محمل تيك توك (مطابق تماماً لباقي الاستايل) */}
      <AnimatePresence>
        {showMoreTools && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.98 }} 
            className={cardStyle}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-lg">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm dark:text-emerald-50">محمل تيك توك الذكي</h4>
                {isDownloading && <p className="text-[9px] text-emerald-600 animate-pulse">{statusText}</p>}
              </div>
            </div>

            {isDownloading && (
              <div className="w-full bg-slate-100 dark:bg-black/20 h-1 rounded-full overflow-hidden mb-4">
                <motion.div className="h-full bg-emerald-600" animate={{ width: `${progress}%` }} />
              </div>
            )}

            {!videoResult ? (
              <div className="flex gap-2">
                <input 
                  value={tiktokUrl} 
                  onChange={(e) => setTiktokUrl(e.target.value)} 
                  placeholder="ضع الرابط هنا..." 
                  className="flex-1 h-12 bg-slate-100/50 dark:bg-black/20 border-none ring-1 ring-emerald-500/10 rounded-xl px-4 text-xs dark:text-emerald-50 outline-none" 
                />
                <Button 
                  onClick={handleTikTokDownload} 
                  disabled={isDownloading || !tiktokUrl.trim()} 
                  className="px-6 h-12 bg-emerald-800 text-white rounded-xl text-xs font-bold"
                >
                  تحميل
                </Button>
              </div>
            ) : (
              <motion.div initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <p className="text-[10px] text-emerald-800 dark:text-emerald-200 font-bold truncate flex-1">{videoTitle || "تم تجهيز الفيديو"}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="h-11 flex-1 bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-lg"
                    onClick={() => window.open(videoResult, '_blank')}
                  >
                    <Download className="h-4 w-4 ml-2" /> حفظ الفيديو
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-11 px-4 text-emerald-600 hover:bg-emerald-500/5"
                    onClick={resetTikTok}
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* ميزة معاينة الخطوط */}
<Link to="/font-preview" className="block group">
  <div className="bg-white/5 dark:bg-[#0a1a14]/60 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/10 dark:border-emerald-900/20 flex items-center justify-between hover:bg-white/10 transition-all">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center group-hover:rotate-12 transition-transform">
        <Type className="h-5 w-5" />
      </div>
      <h3 className="font-bold dark:text-emerald-50 text-sm">معاينة الخطوط العربية</h3>
    </div>
    <ArrowRight className="h-4 w-4 text-emerald-900 rotate-180 group-hover:text-emerald-500 transition-colors" />
  </div>
</Link>
    </div>
  );
}
