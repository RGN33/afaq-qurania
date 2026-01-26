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
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: resources } = useResources();

  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [videoResult, setVideoResult] = useState<any>(null);
  const [showTools, setShowTools] = useState(false);

  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    const q = query.toLowerCase().trim();
    return resources.filter((res: any) => 
      (res.title?.toLowerCase().includes(q)) || (res.title_ar?.includes(q))
    );
  }, [query, resources]);

  const handleRequestAdmin = async () => {
    if (!query.trim()) return;
    setIsSubmitting(true);
    try {
      await supabase.from('requests').insert({ search_query: query.trim() });
      toast.success("تم إرسال طلبك");
      setQuery(''); setHasSearched(false);
    } catch { toast.error("فشل الإرسال"); } finally { setIsSubmitting(false); }
  };

  const handleTikTokProcess = async () => {
    if (!tiktokUrl.includes('tiktok.com')) return toast.error("الرابط غير صحيح");
    setIsDownloading(true); setVideoResult(null); setProgress(20); setStatusText("جاري الاستخراج...");
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tiktokUrl.trim() }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setProgress(100); setStatusText("تم!");
        setTimeout(() => { setVideoResult(data); setIsDownloading(false); }, 500);
      } else { throw new Error(data.message); }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ"); setIsDownloading(false); setProgress(0);
    }
  };

  const resetTikTok = () => {
    setVideoResult(null); setTiktokUrl(''); setProgress(0); setStatusText('');
  };

  // كلاسات موحدة لكل الكروت لضمان نفس الحجم
  const cardClasses = "bg-white/5 dark:bg-[#0a1a14]/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-7 border border-white/10 dark:border-emerald-900/30 shadow-2xl transition-all";

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-5 text-right" dir="rtl">
      
      {/* 1. كارت البحث - نفس الحجم */}
      <motion.div layout className={cardClasses}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg dark:text-emerald-50">البحث الذكي</h3>
            <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest">مكتبة آفاق قرآنية</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input 
            value={query} 
            onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}}
            placeholder="عن ماذا تبحث؟" 
            className="flex-1 h-13 rounded-xl bg-black/20 border border-white/5 px-5 text-sm dark:text-emerald-50 outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all" 
          />
          <button onClick={() => setHasSearched(true)} className="w-13 h-13 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 transition-all active:scale-95">
            <Search className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence>
          {hasSearched && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5">
              {searchResults.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {searchResults.map((res: any) => <ResourceCard key={res.id} resource={res} compact />)}
                </div>
              ) : (
                <Button onClick={handleRequestAdmin} disabled={isSubmitting} className="w-full h-11 bg-emerald-600/20 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-bold hover:bg-emerald-600/30">
                  {isSubmitting ? 'جاري الإرسال...' : 'هذا الملحق غير متوفر، اطلبه الآن'}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 2. كارت مستخرج الألوان - مدمج ونفس العرض */}
      <Link to="/color-extractor" className="block group">
        <div className={`${cardClasses} p-5 sm:p-5 flex items-center justify-between hover:bg-white/10 dark:hover:bg-emerald-900/20`}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold dark:text-emerald-50 text-base">مستخرج الألوان الإسلامي</h3>
              <p className="text-[10px] text-emerald-500/60 font-medium">نسق ألوان تصميمك باحترافية</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-emerald-900 rotate-180 group-hover:text-emerald-500 transition-colors" />
        </div>
      </Link>

      <div className="flex justify-center py-1">
        <button onClick={() => setShowTools(!showTools)} className="text-[9px] font-black text-emerald-500/40 uppercase tracking-[0.3em] hover:text-emerald-500 transition-colors underline underline-offset-8">
          {showTools ? "إخفاء الأدوات" : "عرض المزيد من الأدوات"}
        </button>
      </div>

      {/* 3. محمل تيك توك - تم تصغيره ليتطابق مع البقية */}
      <AnimatePresence>
        {showTools && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={cardClasses}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/20">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold dark:text-emerald-50 text-base">محمل تيك توك الذكي</h4>
                <p className="text-[9px] text-emerald-500 font-bold tracking-tight">بدون علامة مائية • الوضع الليلي</p>
              </div>
            </div>

            {isDownloading && (
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-[9px] font-black text-emerald-500 px-1">
                  <span>{statusText}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <motion.div className="h-full bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]" animate={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {!videoResult ? (
              <div className="flex gap-2">
                <input 
                  value={tiktokUrl} 
                  onChange={(e) => setTiktokUrl(e.target.value)} 
                  placeholder="ضع الرابط هنا..." 
                  className="flex-1 h-12 rounded-xl bg-black/20 border border-white/5 px-4 text-left dir-ltr text-xs dark:text-emerald-50 outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all" 
                />
                <button 
                  onClick={handleTikTokProcess} 
                  disabled={isDownloading || !tiktokUrl} 
                  className="px-6 h-12 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isDownloading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : "تحميل"}
                </button>
              </div>
            ) : (
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="p-4 bg-emerald-600/10 rounded-2xl border border-emerald-500/20 space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <p className="text-[10px] text-emerald-100 truncate flex-1 font-bold">{videoResult?.videoInfo?.title}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.open(videoResult.downloadLink, '_blank')} className="flex-1 h-11 bg-emerald-600 text-white rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 shadow-lg">
                    <Download className="h-4 w-4" /> حفظ الفيديو
                  </button>
                  <button onClick={resetTikTok} className="h-11 px-4 bg-white/5 text-emerald-400 rounded-xl font-bold text-[10px] border border-white/5 flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                    <RefreshCcw className="h-4 w-4" /> جديد
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
