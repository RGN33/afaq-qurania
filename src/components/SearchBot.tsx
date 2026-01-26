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
      toast.success("تم إرسال طلبك، سيتم الإضافة خلال 24 ساعة");
      setQuery(''); setHasSearched(false);
    } catch { toast.error("فشل الإرسال"); } finally { setIsSubmitting(false); }
  };

  const handleTikTokProcess = async () => {
    if (!tiktokUrl.includes('tiktok.com')) return toast.error("الرابط غير صحيح");
    setIsDownloading(true); setVideoResult(null); setProgress(20);
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tiktokUrl.trim() }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setProgress(100);
        setTimeout(() => { setVideoResult(data); setIsDownloading(false); }, 400);
      } else { throw new Error(data.message); }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ"); setIsDownloading(false); setProgress(0);
    }
  };

  // إعدادات الأنيميشن الهادئ لعدم القفز فوق العناصر
  const smoothTransition = { type: "spring", stiffness: 260, damping: 30 };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4 text-right" dir="rtl">
      
      {/* 1. كارت البحث - حجم مدمج وتصميم هادئ */}
      <motion.div 
        layout
        transition={smoothTransition}
        className="bg-white/5 dark:bg-[#0a1a14]/60 backdrop-blur-xl rounded-[1.5rem] p-5 border border-white/10 dark:border-emerald-900/20 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-5 justify-start">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
            <Bot className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm sm:text-base dark:text-emerald-50">البحث الذكي</h3>
        </div>

        <div className="flex gap-2">
          <Input 
            value={query} 
            onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}}
            placeholder="عن ماذا تبحث؟" 
            className="h-12 rounded-xl bg-black/20 border-none ring-1 ring-white/10 px-5 text-sm dark:text-emerald-50 focus:ring-emerald-500/40" 
          />
          <Button onClick={() => setHasSearched(true)} className="h-12 w-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center hover:bg-emerald-600 transition-all active:scale-95">
            <Search className="h-5 w-5" />
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-4"
            >
              {searchResults.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {searchResults.slice(0, 4).map((res: any) => <ResourceCard key={res.id} resource={res} compact />)}
                </div>
              ) : (
                <Button 
                  onClick={handleRequestAdmin} 
                  disabled={isSubmitting} 
                  variant="outline" 
                  className="w-full h-11 border-dashed border-emerald-900/30 text-emerald-500 rounded-xl text-xs hover:bg-emerald-900/10"
                >
                  {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "غير متوفر، اطلب الآن (إضافة خلال 24 ساعة)"}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 2. مستخرج الألوان - حجم مدمج ونفس التصميم */}
      <Link to="/color-extractor" className="block group">
        <div className="bg-white/5 dark:bg-[#0a1a14]/60 backdrop-blur-xl rounded-[1.2rem] p-4 border border-white/10 dark:border-emerald-900/20 flex items-center justify-between hover:bg-white/10 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:rotate-6 transition-transform">
              <Palette className="h-5 w-5" />
            </div>
            <h3 className="font-bold dark:text-emerald-50 text-sm">مستخرج الألوان الإسلامي</h3>
          </div>
          <ArrowRight className="h-4 w-4 text-emerald-900 rotate-180 group-hover:text-emerald-500 transition-colors" />
        </div>
      </Link>

      <div className="flex justify-center">
        <button onClick={() => setShowTools(!showTools)} className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-[0.2em] hover:text-emerald-500 transition-colors py-2">
          {showTools ? "إخفاء الأدوات" : "عرض المزيد من الأدوات"}
        </button>
      </div>

      {/* 3. محمل تيك توك - حجم متناسق مع البقية */}
      <AnimatePresence>
        {showTools && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 10 }} 
            className="bg-white/5 dark:bg-[#0a1a14]/60 backdrop-blur-xl rounded-[1.5rem] p-5 border border-white/10 dark:border-emerald-900/20 space-y-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Video className="h-5 w-5" />
              </div>
              <h4 className="font-bold dark:text-emerald-50 text-sm">محمل تيك توك الذكي</h4>
            </div>

            {isDownloading && (
              <div className="w-full bg-black/30 h-1 rounded-full overflow-hidden">
                <motion.div className="h-full bg-emerald-600" animate={{ width: `${progress}%` }} />
              </div>
            )}

            {!videoResult ? (
              <div className="flex gap-2">
                <input 
                  value={tiktokUrl} 
                  onChange={(e) => setTiktokUrl(e.target.value)} 
                  placeholder="ضع الرابط هنا..." 
                  className="flex-1 h-11 rounded-xl bg-black/20 border-none ring-1 ring-white/5 px-4 text-left dir-ltr text-xs dark:text-emerald-50 outline-none focus:ring-emerald-500/30" 
                />
                <Button 
                  onClick={handleTikTokProcess} 
                  disabled={isDownloading || !tiktokUrl} 
                  className="px-5 h-11 bg-emerald-700 text-white rounded-xl font-bold text-xs"
                >
                  {isDownloading ? <Loader2 className="animate-spin h-4 w-4" /> : "تحميل"}
                </Button>
              </div>
            ) : (
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="p-4 bg-emerald-600/10 rounded-xl border border-emerald-500/20 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <p className="text-[10px] text-emerald-100 truncate flex-1 font-bold">تم التجهيز بنجاح!</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => window.open(videoResult.downloadLink, '_blank')} className="flex-1 h-10 bg-emerald-600 text-white rounded-lg text-xs font-bold">تحميل الآن</Button>
                  <Button onClick={() => setVideoResult(null)} variant="ghost" className="h-10 px-3 text-emerald-400 hover:bg-emerald-500/10"><RefreshCcw className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
