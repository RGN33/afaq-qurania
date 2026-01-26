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

  const handleTikTokProcess = async () => {
    if (!tiktokUrl.includes('tiktok.com')) return toast.error("الرابط غير صحيح");
    setIsDownloading(true); setVideoResult(null); setProgress(20); setStatusText("جاري المعالجة...");
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

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6 text-right" dir="rtl">
      
      {/* 1. مساعد البحث الذكي (العودة للشكل الأصلي الفخم) */}
      <motion.div layout className="bg-white dark:bg-[#0a1a14]/80 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 dark:border-emerald-900/30 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <Bot className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">البحث الذكي</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">مكتبة آفاق قرآنية</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Input 
            value={query} 
            onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}}
            placeholder="عن ماذا تبحث؟" 
            className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-slate-100 dark:ring-slate-700 px-6" 
          />
          <Button onClick={() => setHasSearched(true)} className="h-16 w-16 rounded-2xl bg-emerald-900 dark:bg-emerald-700 hover:bg-black transition-all">
            <Search className="h-6 w-6" />
          </Button>
        </div>

        <AnimatePresence>
          {hasSearched && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8">
              {searchResults.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {searchResults.map((res: any) => <ResourceCard key={res.id} resource={res} compact />)}
                </div>
              ) : (
                <div className="p-8 bg-slate-50 dark:bg-slate-800/20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
                   <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">الملحق غير متوفر حالياً</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 2. مستخرج الألوان */}
      <Link to="/color-extractor" className="group block">
        <div className="bg-white dark:bg-[#0a1a14]/80 rounded-[2rem] p-6 border border-slate-100 dark:border-emerald-900/30 flex items-center justify-between hover:border-emerald-500/50 transition-all">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">مستخرج الألوان الإسلامي</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-tight">باليتة ألوان احترافية من صورك</p>
            </div>
          </div>
          <ArrowRight className="h-6 w-6 text-slate-300 dark:text-slate-700 rotate-180 group-hover:text-emerald-500 transition-colors" />
        </div>
      </Link>

      {/* 3. محمل تيك توك - حجم مدمج ومتناسق */}
      <div className="flex justify-center pt-2">
        <button onClick={() => setShowTools(!showTools)} className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] hover:text-emerald-700 transition-colors underline underline-offset-[10px] decoration-2">
          {showTools ? "إخفاء الأدوات" : "عرض المزيد من الأدوات"}
        </button>
      </div>

      <AnimatePresence>
        {showTools && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0a1a14]/80 rounded-[2.5rem] p-8 border border-slate-100 dark:border-emerald-900/30 shadow-2xl space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900 dark:bg-emerald-700 text-white flex items-center justify-center">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">محمل تيك توك الذكي</h4>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold tracking-tight">بدون علامة مائية • روابط مختصرة</p>
              </div>
            </div>

            {!videoResult ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  value={tiktokUrl} 
                  onChange={(e) => setTiktokUrl(e.target.value)} 
                  placeholder="ضع الرابط هنا..." 
                  className="flex-1 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-slate-100 dark:ring-slate-700 px-5 text-left dir-ltr shadow-inner" 
                />
                <Button onClick={handleTikTokProcess} disabled={isDownloading || !tiktokUrl} className="h-14 px-10 bg-emerald-900 dark:bg-emerald-700 rounded-2xl font-bold">
                  {isDownloading ? <Loader2 className="animate-spin h-5 w-5" /> : "تحميل"}
                </Button>
              </div>
            ) : (
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800 space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                  <p className="text-xs font-bold dark:text-emerald-100 truncate flex-1">{videoResult?.videoInfo?.title}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => window.open(videoResult.downloadLink, '_blank')} className="flex-1 h-12 bg-emerald-900 dark:bg-emerald-700 rounded-xl font-bold">تحميل الآن</Button>
                  <Button onClick={() => setVideoResult(null)} variant="outline" className="h-12 rounded-xl dark:border-emerald-800 dark:text-emerald-400"><RefreshCcw className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
