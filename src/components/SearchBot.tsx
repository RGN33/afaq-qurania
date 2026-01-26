'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
  // --- حالات البحث ---
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: resources } = useResources();

  // --- حالات تيك توك ---
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [videoResult, setVideoResult] = useState<any>(null);
  const [showTools, setShowTools] = useState(false);

  // منطق البحث
  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    const q = query.toLowerCase().trim();
    return resources.filter((res: any) => 
      (res.title?.toLowerCase().includes(q)) || (res.title_ar?.includes(q))
    );
  }, [query, resources]);

  // دالة طلب ملحق
  const handleRequestAdmin = async () => {
    if (!query.trim()) return;
    setIsSubmitting(true);
    try {
      await supabase.from('requests').insert({ search_query: query.trim() });
      toast.success("تم إرسال طلبك بنجاح");
      setQuery(''); setHasSearched(false);
    } catch { toast.error("فشل الإرسال"); } finally { setIsSubmitting(false); }
  };

  // --- محرك التيك توك ---
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
        setProgress(100); setStatusText("اكتمل بنجاح!");
        setTimeout(() => { setVideoResult(data); setIsDownloading(false); }, 500);
      } else { throw new Error(data.message); }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ"); setIsDownloading(false); setProgress(0);
    }
  };

  // دالة إعادة التعيين (تحميل فيديو آخر)
  const resetTikTok = () => {
    setVideoResult(null);
    setTiktokUrl('');
    setProgress(0);
    setStatusText('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-12 space-y-6 text-right" dir="rtl">
      
      {/* 1. كارت البحث الذكي */}
      <motion.div layout className="bg-white dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-emerald-900/5 transition-all">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <Bot className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">البحث الذكي</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">مكتبة آفاق قرآنية</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input 
            value={query} 
            onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}}
            placeholder="عن ماذا تبحث؟" 
            className="flex-1 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-slate-100 dark:ring-slate-700 px-6 text-base dark:text-white focus:ring-2 focus:ring-emerald-700 outline-none transition-all shadow-inner" 
          />
          <button onClick={() => setHasSearched(true)} className="w-16 h-16 rounded-2xl bg-emerald-900 dark:bg-emerald-700 text-white flex items-center justify-center hover:bg-black dark:hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
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
                <div className="p-8 bg-slate-50/50 dark:bg-slate-800/20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-4">
                   <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">الملحق غير متوفر</p>
                   <Button onClick={handleRequestAdmin} disabled={isSubmitting} className="w-full h-12 bg-emerald-900 dark:bg-emerald-700 rounded-xl font-bold">
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : "اطلب من الأدمن الآن"}
                   </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 2. كارت مستخرج الألوان */}
      <Link to="/color-extractor" className="group block">
        <div className="bg-white dark:bg-slate-900/60 rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-emerald-200 dark:hover:border-emerald-800 transition-all shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">مستخرج الألوان الإسلامي</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">نسق ألوان تصميمك باحترافية</p>
            </div>
          </div>
          <ArrowRight className="h-6 w-6 text-slate-200 dark:text-slate-700 rotate-180 group-hover:text-emerald-600 transition-colors" />
        </div>
      </Link>

      {/* زر التبديل */}
      <div className="flex justify-center pt-2">
        <button onClick={() => setShowTools(!showTools)} className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] hover:text-emerald-700 transition-colors underline underline-offset-[10px] decoration-2">
          {showTools ? "إخفاء الأدوات" : "عرض المزيد من الأدوات"}
        </button>
      </div>

      {/* 3. محمل تيك توك المطور (خيار فيديو آخر) */}
      <AnimatePresence>
        {showTools && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-8"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900 dark:bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">محمل تيك توك الذكي</h4>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold tracking-tight">بدون علامة مائية • يدعم الهاتف والوضع الليلي</p>
              </div>
            </div>

            {isDownloading && (
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black text-emerald-800 dark:text-emerald-400 px-1">
                  <span>{statusText}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                  <motion.div className="h-full bg-emerald-800 dark:bg-emerald-500 shadow-[0_0_10px_rgba(6,78,59,0.2)]" animate={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {!videoResult ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  value={tiktokUrl} 
                  onChange={(e) => setTiktokUrl(e.target.value)} 
                  placeholder="الصق الرابط هنا..." 
                  className="flex-1 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-slate-100 dark:ring-slate-700 px-5 text-left dir-ltr text-sm dark:text-white focus:ring-2 focus:ring-emerald-700 outline-none transition-all shadow-inner" 
                />
                <button 
                  onClick={handleTikTokProcess} 
                  disabled={isDownloading || !tiktokUrl} 
                  className="w-full sm:w-auto px-10 h-14 rounded-2xl bg-emerald-900 dark:bg-emerald-600 text-white font-bold text-sm shadow-xl active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isDownloading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "تحميل الفيديو"}
                </button>
              </div>
            ) : (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800 shrink-0">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-black text-emerald-900 dark:text-emerald-400 underline underline-offset-4">تم التجهيز بنجاح!</h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1 font-bold">{videoResult?.videoInfo?.title}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => window.open(videoResult.downloadLink, '_blank')} 
                    className="flex-1 h-14 bg-emerald-800 dark:bg-emerald-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-3 shadow-lg hover:bg-black transition-all"
                  >
                    <Download className="h-5 w-5" /> حفظ في الاستوديو
                  </button>
                  <button 
                    onClick={resetTikTok} 
                    className="h-14 px-6 bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-400 rounded-2xl font-bold text-xs border border-emerald-100 dark:border-emerald-800 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                  >
                    <RefreshCcw className="h-4 w-4" /> فيديو آخر
                  </button>
                </div>
              </motion.div>
            )}
            
            <div className="text-center pt-2">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold px-5 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-700 inline-block shadow-sm">
                ✨ يدعم جميع الروابط ومقاطع الهاتف
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
