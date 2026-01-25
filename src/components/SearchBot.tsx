import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, Bot, Palette, ArrowRight, Video, Loader2, CheckCircle, Sparkles, Download, ExternalLink, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useResources } from '@/hooks/useResources';
import { supabase } from '@/integrations/supabase/client';
import { ResourceCard } from './ResourceCard';
import { toast } from 'sonner';

// --- مكونات فرعية لتحسين الأداء (Sub-components) ---
const ColorExtractorLink = () => (
  <Link to="/color-extractor" className="group block glass-card rounded-2xl p-5 border border-primary/20 hover:border-primary/40 transition-all shadow-md">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
          <Palette className="h-6 w-6" />
        </div>
        <div className="text-right">
          <h4 className="font-bold text-sm sm:text-base">مستخرج الألوان الإسلامي</h4>
          <p className="text-[10px] text-muted-foreground italic">استلهم ألوان تصميمك القادم من أي صورة</p>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-primary rotate-180" />
    </div>
  </Link>
);

export function SearchBot() {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  
  // حالات تيك توك المتقدمة
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [videoResult, setVideoResult] = useState<string | null>(null);

  const { data: resources } = useResources();
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // تصفية نتائج البحث (عربي وإنجليزي)
  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    const q = query.toLowerCase().trim();
    return resources.filter((res) => 
      (res.title?.toLowerCase().includes(q)) || (res.title_ar?.toLowerCase().includes(q))
    );
  }, [query, resources]);

  // إرسال طلب للأدمن
  const handleSubmitRequest = async () => {
    if (!query.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await supabase.from('requests').insert({ search_query: query.trim() });
      toast.success("تم إرسال طلبك لعمر بنجاح! سيتم البحث عن الملحق.");
      setHasSearched(false);
    } catch { toast.error("فشل إرسال الطلب"); }
    finally { setIsSubmitting(false); }
  };

  // 🚀 محرك التحميل المرتبط بسيرفر البايثون (لحل مشكلة الروابط المختصرة)
  const handleTikTokDownload = useCallback(async () => {
    if (!tiktokUrl.includes('tiktok.com')) {
      toast.error("يرجى إدخال رابط تيك توك صحيح");
      return;
    }

    setIsDownloading(true);
    setVideoResult(null);
    setProgress(5);
    setStatusText("جاري تتبع الرابط وفك التشفير...");

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + (tiktokUrl.includes('vt.') ? 3 : 7)));
    }, 450);

    try {
      // 🔗 نرسل الطلب لسيرفرنا (api/download) ليقوم هو بتوسيع الرابط خلف الكواليس
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tiktokUrl.trim() }),
      });
      const data = await res.json();

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      if (res.ok && data.download_link) {
        setProgress(100);
        setStatusText("اكتمل الاستخراج بنجاح!");
        setTimeout(() => {
          setVideoResult(data.download_link);
          setIsDownloading(false);
          toast.success("تم تجهيز الفيديو! يمكنك التحميل الآن.");
        }, 500);
      } else {
        throw new Error(data.error || "API Error");
      }
    } catch (error) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setIsDownloading(false);
      setProgress(0);
      toast.error("تيك توك يرفض الطلب حالياً، جرب لاحقاً");
    }
  }, [tiktokUrl]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 space-y-5 text-right" dir="rtl">
      
      {/* صندوق البحث الرئيسي */}
      <motion.div layout className="glass-card rounded-3xl p-6 border border-primary/10 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Bot className="h-5 w-5" /></div>
          <h3 className="font-bold text-base sm:text-lg">مساعد البحث الذكي</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Input 
            value={query} 
            onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}} 
            onKeyDown={(e) => e.key === 'Enter' && setHasSearched(true)}
            placeholder="ابحث عن ملحقاتك (خطوط، خلفيات...)" 
            className="h-14 text-sm sm:text-base bg-background/50 border-primary/10 focus-visible:ring-primary/20" 
          />
          <Button onClick={() => setHasSearched(true)} className="h-14 px-8 shadow-lg shadow-primary/20 active:scale-95 transition-transform">
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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-6 bg-secondary/30 rounded-2xl border border-dashed border-border">
                   <p className="text-sm text-muted-foreground mb-4 font-medium italic">لم نجد الملحق، هل تريد طلبه من الأدمن؟</p>
                   <Button onClick={handleSubmitRequest} disabled={isSubmitting} className="w-full h-12 rounded-xl">
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "إرسال طلب للأدمن"}
                   </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <ColorExtractorLink />

      {/* زر "المزيد من الأدوات" */}
      <div className="relative py-2 flex justify-center">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowMoreTools(!showMoreTools)} 
          className="rounded-full bg-background px-6 text-[10px] font-bold z-10 border-border hover:text-primary transition-all active:scale-95 shadow-sm"
        >
          {showMoreTools ? "إخفاء الأدوات" : "المزيد من الأدوات"}
        </Button>
      </div>

      {/* محمل تيك توك المطور للموبايل */}
      <AnimatePresence>
        {showMoreTools && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 15 }}
            className="p-6 glass-card rounded-3xl border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-transparent shadow-xl relative overflow-hidden"
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-right">
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white shadow-lg"><Video className="h-6 w-6" /></div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base">محمل تيك توك الذكي</h4>
                    {isDownloading && <p className="text-[10px] text-pink-500 animate-pulse mt-1 font-bold">{statusText}</p>}
                  </div>
                </div>
                {isDownloading && <Loader2 className="h-5 w-5 animate-spin text-pink-500" />}
              </div>

              {isDownloading && (
                <div className="w-full bg-pink-500/10 h-2 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-pink-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                </div>
              )}

              {!videoResult ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    value={tiktokUrl} 
                    onChange={(e) => setTiktokUrl(e.target.value)} 
                    placeholder="ضع رابط (vt) أو رابط الكمبيوتر..." 
                    className="h-14 bg-background/50 border-pink-500/10 focus-visible:ring-pink-500/20 text-right" 
                    disabled={isDownloading}
                  />
                  <Button 
                    onClick={handleTikTokDownload} 
                    disabled={isDownloading || !tiktokUrl} 
                    className="h-14 bg-[#FE2C55] hover:bg-[#ef2950] font-bold px-8 shadow-lg shadow-pink-500/20 active:scale-95 transition-all w-full sm:w-auto"
                  >
                    {isDownloading ? <Sparkles className="animate-pulse h-5 w-5" /> : "استخراج"}
                  </Button>
                </div>
              ) : (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-green-700 font-bold text-xs">
                    <CheckCircle className="h-5 w-5" /> 
                    <span>الفيديو جاهز بدون علامة مائية!</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all" 
                      onClick={() => { window.open(videoResult, '_blank', 'noopener,noreferrer'); setVideoResult(null); setTiktokUrl(''); }}
                    >
                      <Download className="h-5 w-5" /> تحميل الفيديو الآن
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-14 rounded-xl border-green-500/20 hover:bg-green-500/5" 
                      onClick={() => { setVideoResult(null); setTiktokUrl(''); }}
                    >
                      إلغاء
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
