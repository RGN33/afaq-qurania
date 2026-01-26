'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bot, Palette, Video, Loader2, 
  CheckCircle, Download, ArrowRight, Send, RefreshCcw 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useResources } from '@/hooks/useResources';
import { ResourceCard } from './ResourceCard';

export function SearchBot() {
  // --- حالات البحث وطلب الملحقات ---
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: resources } = useResources();

  // --- حالات محرك التيك توك ---
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [videoResult, setVideoResult] = useState<any>(null);
  const [showTools, setShowTools] = useState(false);

  // 1. منطق البحث الذكي
  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    const q = query.toLowerCase().trim();
    return resources.filter((res: any) => 
      (res.title?.toLowerCase().includes(q)) || (res.title_ar?.includes(q))
    );
  }, [query, resources]);

  // 2. إرسال طلب للأدمن عند عدم وجود نتائج
  const handleRequestAdmin = async () => {
    if (!query.trim()) return;
    setIsSubmitting(true);
    try {
      await supabase.from('requests').insert({ search_query: query.trim() });
      toast.success("تم إرسال طلبك، سيتم الإضافة خلال 24 ساعة");
      setQuery('');
      setHasSearched(false);
    } catch {
      toast.error("حدث خطأ في الإرسال");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. محرك تحميل التيك توك (يربط بالباك إند)
  const handleTikTokProcess = async () => {
    if (!tiktokUrl.includes('tiktok.com')) return toast.error("الرابط غير صحيح");
    setIsDownloading(true); setVideoResult(null); setProgress(20); setStatusText("جاري استخراج الفيديو...");
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tiktokUrl.trim() }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setProgress(100); setStatusText("تم بنجاح!");
        setTimeout(() => { setVideoResult(data); setIsDownloading(false); }, 500);
      } else { throw new Error(data.message); }
    } catch (err: any) {
      toast.error(err.message || "فشل التحميل"); setIsDownloading(false); setProgress(0);
    }
  };

  // كلاس موحد لجميع الكروت لضمان تناسق الحجم والشكل
  const cardBaseStyle = "bg-white/5 dark:bg-[#0a1a14]/60 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 border border-white/10 dark:border-emerald-900/30 shadow-2xl transition-all w-full";

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6 text-right" dir="rtl">
      
      {/* قسم البحث الذكي */}
      <motion.div layout className={cardBaseStyle}>
        <div className="flex items-center gap-4 mb-8 justify-start">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
            <Bot className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-800 dark:text-emerald-50">البحث الذكي</h3>
            <p className="text-[11px] text-slate-400 dark:text-emerald-500/60 font-bold uppercase tracking-widest">مكتبة آفاق قرآنية</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Input 
            value={query} 
            onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}}
            placeholder="ابحث عن ملحقاتك هنا..." 
            className="h-16 rounded-2xl bg-slate-50 dark:bg-black/20 border-none ring-1 ring-slate-100 dark:ring-emerald-900/50 px-6 text-base dark:text-emerald-50 outline-none transition-all" 
          />
          <button onClick={() => setHasSearched(true)} className="w-16 h-16 rounded-2xl bg-emerald-900 dark:bg-emerald-700 text-white flex items-center justify-center hover:bg-black transition-all shadow-lg active:scale-95">
            <Search className="h-6 w-6" />
          </button>
        </div>

        <AnimatePresence>
          {hasSearched && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {searchResults.map((res: any) => <ResourceCard key={res.id} resource={res} compact />)}
                </div>
              ) : (
                <div className="p-8 bg-slate-50/50 dark:bg-emerald-900/10 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-emerald-900/30 text-center space-y-5">
                   <p className="text-sm text-slate-500 dark:text-emerald-400 font-bold">هذا الملحق غير متوفر حالياً</p>
                   <Button onClick={handleRequestAdmin} disabled={isSubmitting} className="w-full h-14 bg-emerald-900 dark:bg-emerald-700 rounded-2xl font-bold flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : <><Send className="h-5 w-5" /> اطلب الآن (سيتم الإضافة خلال 24 ساعة)</>}
                   </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* قسم مستخرج الألوان */}
      <Link to="/color-extractor" className="group block">
        <div className={`${cardBaseStyle} p-6 sm:p-7 flex items-center justify-between hover:bg-white/10 dark:hover:bg-emerald-900/20`}>
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-emerald-50 text-base">مستخرج الألوان الإسلامي</h3>
              <p className="text-[10px] text-slate-400 dark:text-emerald-500/60 font-medium tracking-tight">نسق ألوان تصميمك باحترافية من صورك</p>
            </div>
          </div>
          <ArrowRight className="h-6 w-6 text-slate-300 dark:text-emerald-900 rotate-180 group-hover:text-emerald-500 transition-colors" />
        </div>
      </Link>

      {/* زر عرض الأدوات */}
      <div className="flex justify-center py-2">
        <button onClick={() => setShowTools(!showTools)} className="text-[10px] font-black text-slate-400 dark:text-emerald-500/40 uppercase tracking-[0.3em] hover:text-emerald-500 transition-colors underline underline-offset-8">
          {showTools ? "إخفاء الأدوات الإضافية" : "عرض المزيد من الأدوات"}
        </button>
      </div>

      {/* قسم محمل التيك توك - تم توحيد الحجم */}
      <AnimatePresence>
        {showTools && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: 20 }} className={cardBaseStyle}>
            <div className="flex items-center gap-5 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-900 dark:bg-emerald-700 text-white flex items-center justify-center shadow-lg">
                <Video className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-emerald-50 text-lg">محمل تيك توك الذكي</h4>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-500 font-bold tracking-tight">تحميل بدون علامة مائية • يدعم الوضع الليلي</p>
              </div>
            </div>

            {isDownloading && (
              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-[10px] font-black text-emerald-800 dark:text-emerald-500 px-1">
                  <span>{statusText}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-black/20 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-emerald-900/30">
                  <motion.div className="h-full bg-emerald-800 dark:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]" animate={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {!videoResult ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  value={tiktokUrl} 
                  onChange={(e) => setTiktokUrl(e.target.value)} 
                  placeholder="ضع رابط تيك توك هنا..." 
                  className="flex-1 h-14 rounded-2xl bg-slate-50 dark:bg-black/20 border-none ring-1 ring-slate-100 dark:ring-emerald-900/50 px-5 text-left dir-ltr text-sm dark:text-emerald-50 outline-none" 
                />
                <button 
                  onClick={handleTikTokProcess} 
                  disabled={isDownloading || !tiktokUrl} 
                  className="w-full sm:w-auto px-10 h-14 rounded-2xl bg-emerald-900 dark:bg-emerald-700 text-white font-bold text-sm shadow-xl active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isDownloading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "استخراج الفيديو"}
                </button>
              </div>
            ) : (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-8 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800/50 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800/30 shrink-0">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-black text-emerald-900 dark:text-emerald-400 underline underline-offset-4 decoration-2">تم تجهيز الفيديو بنجاح!</h5>
                    <p className="text-[10px] text-slate-500 dark:text-emerald-500/60 truncate mt-2 font-bold italic">{videoResult?.videoInfo?.title}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => window.open(videoResult.downloadLink, '_blank')} 
                    className="flex-1 h-14 bg-emerald-800 dark:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all"
                  >
                    <Download className="h-5 w-5" /> تحميل الآن
                  </button>
                  <button 
                    onClick={() => { setVideoResult(null); setTiktokUrl(''); setProgress(0); }} 
                    className="h-14 px-8 bg-white dark:bg-black/20 text-emerald-900 dark:text-emerald-400 rounded-2xl font-bold text-xs border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all"
                  >
                    <RefreshCcw className="h-4 w-4" /> فيديو آخر
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
