'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bot, Palette, Video, Loader2, Copy, Check, 
  CheckCircle, Download, ArrowRight, Sparkles, Send 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// استيراد المكونات الأساسية - تأكد أن المسارات صحيحة في مشروعك
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useResources } from '@/hooks/useResources';
import { ResourceCard } from './ResourceCard';

export function SearchBot() {
  // --- 1. حالات البحث (Search States) ---
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: resources } = useResources();

  // --- 2. حالات تيك توك (TikTok States) ---
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [videoResult, setVideoResult] = useState<any>(null);
  const [showTools, setShowTools] = useState(false);

  // --- 3. منطق البحث الذكي ---
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
      toast.success("تم إرسال طلبك للأدمن بنجاح");
      setQuery('');
      setHasSearched(false);
    } catch {
      toast.error("فشل في إرسال الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 4. مُحرك التحميل (TikTok Logic) ---
  const handleTikTokProcess = async () => {
    if (!tiktokUrl.includes('tiktok.com')) return toast.error("يرجى وضع رابط تيك توك صحيح");
    
    setIsDownloading(true);
    setVideoResult(null);
    setProgress(15);
    setStatusText("جاري معالجة الرابط...");

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
          setVideoResult(data);
          setIsDownloading(false);
        }, 500);
      } else {
        throw new Error(data.message || "فشل الاستخراج");
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
      setIsDownloading(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-8 text-right" dir="rtl">
      
      {/* قسم البحث الذكي */}
      <motion.div layout className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-7 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8 justify-start">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-inner">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">مساعد البحث الذكي</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase">ابحث في مكتبة آفاق قرآنية</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input 
            value={query} 
            onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}}
            placeholder="عن ماذا تبحث؟" 
            className="h-14 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 px-6 shadow-inner" 
          />
          <Button onClick={() => setHasSearched(true)} className="h-14 w-14 rounded-2xl bg-emerald-900 shadow-lg active:scale-95 transition-all">
            <Search className="h-5 w-5" />
          </Button>
        </div>

        <AnimatePresence>
          {hasSearched && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {searchResults.map((res: any) => <ResourceCard key={res.id} resource={res} compact />)}
                </div>
              ) : (
                <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 text-center space-y-4">
                   <p className="text-xs text-slate-500 font-bold">الملحق غير متوفر حالياً</p>
                   <Button onClick={handleRequestAdmin} disabled={isSubmitting} className="w-full h-11 bg-emerald-900 rounded-xl gap-2 text-xs font-bold">
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />} اطلب من الأدمن
                   </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* مستخرج الألوان */}
      <Link to="/color-extractor" className="block group">
        <div className="bg-white/90 rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center justify-between hover:bg-emerald-50/20 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">مستخرج الألوان الإسلامي</h3>
              <p className="text-[10px] text-slate-400 font-medium">حول صورك لباليتة ألوان احترافية</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-300 rotate-180" />
        </div>
      </Link>

      <div className="flex justify-center">
        <button onClick={() => setShowTools(!showTools)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-800 underline decoration-2 underline-offset-8 transition-colors">
          {showTools ? "إخفاء الأدوات" : "المزيد من الأدوات"}
        </button>
      </div>

      {/* مُحمل تيك توك المدمج والأنيق */}
      <AnimatePresence>
        {showTools && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 15 }}
            className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-900 text-white flex items-center justify-center shadow-lg">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">محمل تيك توك الذكي</h4>
                <p className="text-[10px] text-emerald-700/70 font-bold tracking-tighter">أعلى جودة • بدون علامة مائية</p>
              </div>
            </div>

            {isDownloading && (
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black text-emerald-800 px-1">
                  <span>{statusText}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-emerald-50 h-1.5 rounded-full overflow-hidden border border-emerald-100/50">
                  <motion.div className="h-full bg-emerald-800" animate={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {!videoResult ? (
              <div className="flex gap-2">
                <input 
                  value={tiktokUrl} 
                  onChange={(e) => setTiktokUrl(e.target.value)} 
                  placeholder="ضع الرابط هنا..." 
                  className="flex-1 h-12 rounded-xl bg-slate-50/50 border border-slate-100 px-5 text-left dir-ltr text-xs focus:ring-2 focus:ring-emerald-800 outline-none transition-all shadow-inner" 
                />
                <button 
                  onClick={handleTikTokProcess} 
                  disabled={isDownloading || !tiktokUrl} 
                  className="px-6 h-12 rounded-xl bg-emerald-900 text-white font-bold text-xs shadow-md hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                  {isDownloading ? <Loader2 className="animate-spin h-4 w-4" /> : "استخراج"}
                </button>
              </div>
            ) : (
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="p-5 bg-emerald-50/50 rounded-[1.5rem] border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-emerald-800 shadow-sm border border-emerald-100">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="max-w-[150px] sm:max-w-[220px]">
                    <p className="text-[10px] font-black text-emerald-900">تم الاستخراج بنجاح</p>
                    <p className="text-[9px] text-emerald-700/60 truncate font-bold">{videoResult?.videoInfo?.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.open(videoResult.downloadLink, '_blank')} 
                  className="h-10 px-4 bg-emerald-800 text-white rounded-lg font-bold text-[10px] flex items-center gap-2 hover:bg-black transition-all shadow-sm"
                >
                  <Download className="h-4 w-4" /> تحميل
                </button>
              </motion.div>
            )}
            
            <div className="text-center pt-2">
              <span className="text-[9px] text-slate-400 font-bold px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                ✨ يدعم الروابط المختصرة تلقائياً
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
