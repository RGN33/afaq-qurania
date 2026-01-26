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
  // --- حالات البحث ---
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  
  // --- حالات تيك توك ---
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');

  const { data: resources } = useResources();
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. منطق البحث الذكي
  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    const q = query.toLowerCase();
    return resources.filter((res) => 
      (res.title?.toLowerCase().includes(q)) || (res.title_ar?.includes(q))
    );
  }, [query, resources]);

  // 2. إرسال طلب للأدمن (مع رسالة الـ 24 ساعة)
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

  // 3. آلية العمل لتيك توك (تكلم الباك إند المطور)
  const handleTikTokDownload = async () => {
    if (!tiktokUrl.trim() || isDownloading) return;
    
    if (!tiktokUrl.includes('tiktok.com')) {
      return toast.error("الرابط غير صحيح، انسخه من تيك توك");
    }

    setIsDownloading(true);
    setVideoResult(null);
    setProgress(10);
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
        setStatusText("اكتمل الاستخراج!");
        setTimeout(() => {
          setVideoResult(data.downloadLink);
          setVideoTitle(data.videoInfo.title);
          setIsDownloading(false);
        }, 500);
      } else {
        throw new Error(data.message || "فشل الاستخراج");
      }
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

  // إعدادات الأنيميشن الهادئ
  const smoothTransition = { type: "spring", stiffness: 200, damping: 25 };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 space-y-4 text-right" dir="rtl">
      
      {/* كارت البحث الذكي */}
      <motion.div 
        layout 
        transition={smoothTransition}
        className="bg-white/5 dark:bg-emerald-950/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 dark:border-emerald-900/30 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-5 justify-start">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Bot className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-sm sm:text-base dark:text-emerald-50">مساعد البحث الذكي</h3>
        </div>

        <div className="flex gap-2">
          <Input 
            value={query} 
            onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}}
            placeholder="ابحث عن ملحقاتك..." 
            className="h-12 bg-black/10 dark:bg-black/40 border-none ring-1 ring-white/10 focus:ring-emerald-500/40 px-4 text-sm" 
          />
          <Button onClick={() => setHasSearched(true)} className="h-12 px-6 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl">
            <Search className="h-5 w-5" />
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 overflow-hidden"
            >
              {searchResults.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {searchResults.slice(0, 4).map((res) => <ResourceCard key={res.id} resource={res} compact />)}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] text-center text-slate-400">الملحق غير متوفر حالياً</p>
                  <Button 
                    onClick={handleSubmitRequest} 
                    disabled={isSubmitting} 
                    className="w-full h-11 bg-emerald-900/40 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/60 rounded-xl text-xs"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "اطلب من الأدمن (الإضافة خلال 24 ساعة)"}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* مستخرج الألوان (نفس الاستايل المدمج) */}
      <Link to="/color-extractor" className="block group">
        <div className="bg-white/5 dark:bg-emerald-950/10 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/10 dark:border-emerald-900/30 flex items-center justify-between hover:bg-white/10 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:rotate-6 transition-transform">
              <Palette className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm dark:text-emerald-50">مستخرج الألوان الإسلامي</h4>
          </div>
          <ArrowRight className="h-4 w-4 text-emerald-900 rotate-180 group-hover:text-emerald-500" />
        </div>
      </Link>

      {/* زر المزيد */}
      <div className="flex justify-center py-2">
        <button onClick={() => setShowMoreTools(!showMoreTools)} className="text-[9px] font-black text-slate-500 dark:text-emerald-900 uppercase tracking-widest hover:text-emerald-600 transition-colors underline underline-offset-8">
          {showMoreTools ? "إخفاء الأدوات" : "المزيد من الأدوات"}
        </button>
      </div>

      {/* محمل تيك توك (موحد التصميم واللون) */}
      <AnimatePresence>
        {showMoreTools && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="bg-white/5 dark:bg-emerald-950/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 dark:border-emerald-900/30 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-lg">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm dark:text-emerald-50">محمل تيك توك الذكي</h4>
                  {isDownloading && <p className="text-[9px] text-emerald-500 animate-pulse">{statusText}</p>}
                </div>
              </div>
              {isDownloading && <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />}
            </div>

            {isDownloading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-bold text-emerald-500 px-1">
                  <span>{statusText}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <motion.div className="h-full bg-emerald-600" animate={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {!videoResult ? (
              <div className="flex gap-2">
                <input 
                  value={tiktokUrl} 
                  onChange={(e) => setTiktokUrl(e.target.value)} 
                  placeholder="ضع الرابط هنا..." 
                  className="flex-1 h-12 bg-black/10 dark:bg-black/40 border-none ring-1 ring-white/10 rounded-xl px-4 text-xs dark:text-emerald-50 outline-none focus:ring-emerald-500/40" 
                />
                <Button 
                  onClick={handleTikTokDownload} 
                  disabled={isDownloading || !tiktokUrl.trim()} 
                  className="px-6 h-12 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  {isDownloading ? "جاري..." : "تحميل"}
                </Button>
              </div>
            ) : (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <p className="text-[10px] text-emerald-100 font-bold truncate flex-1">{videoTitle || "تم تجهيز الفيديو"}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="h-11 flex-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold"
                    onClick={() => window.open(videoResult, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 ml-2" /> حفظ الفيديو
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-11 px-4 text-emerald-400 hover:bg-emerald-500/10"
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
    </div>
  );
}
