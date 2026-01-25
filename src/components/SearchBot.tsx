import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, Bot, Palette, ArrowRight, Video, Loader2, CheckCircle, Sparkles, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useResources } from '@/hooks/useResources';
import { supabase } from '@/integrations/supabase/client';
import { ResourceCard } from './ResourceCard';
import { toast } from 'sonner';

// تعريف شكل البيانات (TypeScript Interface)
interface Resource {
  id: string;
  title: string;
  title_ar: string | null;
  [key: string]: any;
}

export function SearchBot() {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [videoResult, setVideoResult] = useState<string | null>(null);

  const { data: resources } = useResources() as { data: Resource[] | null };
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // منطق البحث الذكي
  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    const q = query.toLowerCase().trim();
    return resources.filter((res) => 
      (res.title?.toLowerCase().includes(q)) || 
      (res.title_ar?.toLowerCase().includes(q))
    );
  }, [query, resources]);

  // دالة تحميل تيك توك المحدثة
  const handleTikTokDownload = useCallback(async () => {
    if (!tiktokUrl.includes('tiktok.com')) {
      toast.error("يرجى إدخال رابط تيك توك صحيح");
      return;
    }

    setIsDownloading(true);
    setVideoResult(null);
    setProgress(5);
    setStatusText(tiktokUrl.includes('vt.tiktok.com') ? "جاري معالجة الرابط المختصر..." : "جاري الاتصال بالسيرفر...");

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + 5));
    }, 400);

    try {
      const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl.trim())}`);
      const data = await response.json();

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      if (data.code === 0 && data.data.play) {
        setProgress(100);
        setStatusText("اكتمل الاستخراج!");
        setTimeout(() => {
          setVideoResult(data.data.play);
          setIsDownloading(false);
        }, 500);
      } else {
        throw new Error();
      }
    } catch (error) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setIsDownloading(false);
      setProgress(0);
      toast.error("فشل استخراج الفيديو، جرب مرة أخرى");
    }
  }, [tiktokUrl]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 space-y-5 text-right" dir="rtl">
      
      {/* مساعد البحث */}
      <motion.div layout className="glass-card rounded-3xl p-6 border border-primary/10 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Bot /></div>
          <h3 className="font-bold text-base sm:text-lg">مساعد البحث الذكي</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input value={query} onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}} placeholder="ابحث عن ملحقاتك..." className="h-14 text-right" />
          <Button onClick={() => setHasSearched(true)} className="h-14 px-8"><Search /></Button>
        </div>
        
        <AnimatePresence>
          {hasSearched && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {searchResults.slice(0, 4).map((res) => <ResourceCard key={res.id} resource={res} compact />)}
                </div>
              ) : (
                <Button className="w-full h-12 rounded-xl" onClick={() => toast.info("سيتم إرسال طلبك للأدمن")}>طلب إضافة من الأدمن</Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* مستخرج الألوان */}
      <Link to="/color-extractor" className="group block glass-card rounded-2xl p-4 border border-primary/20 hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg"><Palette /></div>
            <h4 className="font-bold text-sm">مستخرج الألوان الإسلامي</h4>
          </div>
          <ArrowRight className="h-5 w-5 text-primary rotate-180" />
        </div>
      </Link>

      {/* محمل تيك توك */}
      <div className="glass-card rounded-3xl p-6 border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-transparent">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white"><Video /></div>
          <h4 className="font-bold text-sm sm:text-base">محمل تيك توك بدون علامة مائية</h4>
        </div>

        {isDownloading && (
          <div className="mb-4">
            <div className="flex justify-between text-[10px] mb-1 font-bold text-pink-500">
              <span>{statusText}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-pink-500/10 h-1.5 rounded-full overflow-hidden">
              <motion.div className="h-full bg-pink-500" animate={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {!videoResult ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <Input value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="ضع رابط الفيديو هنا..." className="h-14 bg-background/50 border-pink-500/10" />
            <Button onClick={handleTikTokDownload} disabled={isDownloading || !tiktokUrl} className="h-14 bg-[#FE2C55] hover:bg-[#ef2950] font-bold px-8">
              {isDownloading ? <Loader2 className="animate-spin" /> : "استخراج"}
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-green-700 font-bold text-xs"><CheckCircle className="h-4 w-4" /> الفيديو جاهز!</div>
            <div className="flex gap-2">
              <Button className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white" onClick={() => { window.open(videoResult, '_blank'); setVideoResult(null); setTiktokUrl(''); }}>تحميل الآن</Button>
              <Button variant="outline" className="h-12" onClick={() => setVideoResult(null)}>إلغاء</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
