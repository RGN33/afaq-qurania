import { useState, useMemo } from 'react';
import { Search, Bot, Palette, ArrowRight, Video, Download, Loader2, PlusCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useResources } from '@/hooks/useResources';
import { supabase } from '@/integrations/supabase/client';
import { ResourceCard } from './ResourceCard';
import { toast } from 'sonner';

export function SearchBot() {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStep, setDownloadStep] = useState('');
  const [finalVideoLink, setFinalVideoLink] = useState<string | null>(null);

  const { data: resources } = useResources();

  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    const q = query.toLowerCase();
    return resources.filter((res) => 
      (res.title?.toLowerCase().includes(q)) || (res.title_ar?.includes(q))
    );
  }, [query, resources]);

  const handleSubmitRequest = async () => {
    if (!query.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await supabase.from('requests').insert({ search_query: query.trim() });
      toast.success("تم إرسال طلبك للأدمن بنجاح");
    } catch { toast.error("فشل في إرسال الطلب"); }
    finally { setIsSubmitting(false); }
  };

  const handleTikTokDownload = async () => {
    if (!tiktokUrl.includes('tiktok.com')) {
      toast.error("يرجى إدخال رابط تيك توك صحيح");
      return;
    }

    setIsDownloading(true);
    setFinalVideoLink(null);
    setDownloadProgress(10);
    setDownloadStep("جاري فحص الرابط...");

    try {
      // محاكاة خطوات المعالجة
      setTimeout(() => { setDownloadProgress(40); setDownloadStep("تخطي حظر تيك توك..."); }, 1000);
      setTimeout(() => { setDownloadProgress(70); setDownloadStep("استخراج الفيديو بدون حقوق..."); }, 2000);

      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`);
      const responseData = await res.json();

      if (responseData.code === 0 && responseData.data.play) {
        setDownloadProgress(100);
        setDownloadStep("اكتمل التجهيز!");
        setFinalVideoLink(responseData.data.play);
        toast.success("تم تجهيز الفيديو بنجاح");
      } else {
        throw new Error("API Error");
      }
    } catch (error) {
      toast.error("تيك توك يرفض الطلب حالياً، جرب لاحقاً");
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 space-y-4 text-right" dir="rtl">
      {/* صندوق البحث */}
      <motion.div layout className="glass-card rounded-2xl p-6 border border-primary/10 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Bot className="h-5 w-5" /></div>
          <h3 className="font-bold text-sm sm:text-base">مساعد البحث الذكي</h3>
        </div>
        <div className="flex gap-2">
          <Input value={query} onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}} placeholder="ابحث عن ملحقاتك..." className="h-11" />
          <Button onClick={() => setHasSearched(true)} className="h-11 px-6"><Search className="h-4 w-4" /></Button>
        </div>
        <AnimatePresence>
          {hasSearched && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {searchResults.slice(0, 4).map((res) => <ResourceCard key={res.id} resource={res} compact />)}
                </div>
              ) : (
                <Button onClick={handleSubmitRequest} disabled={isSubmitting} size="sm" className="w-full">طلب الملحق من الأدمن</Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* أداة الألوان */}
      <Link to="/color-extractor" className="group block glass-card rounded-2xl p-4 border border-primary/20 hover:border-primary/50 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white"><Palette className="h-5 w-5" /></div>
            <h4 className="font-bold text-sm">مستخرج الألوان الإسلامي</h4>
          </div>
          <ArrowRight className="h-4 w-4 opacity-30 rotate-180" />
        </div>
      </Link>

      {/* زر المزيد */}
      <div className="relative py-2 flex justify-center">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <Button variant="outline" size="sm" onClick={() => setShowMoreTools(!showMoreTools)} className="rounded-full bg-background px-4 text-[10px] font-bold z-10 border-border">
          {showMoreTools ? "إخفاء الأدوات" : "المزيد من الأدوات"}
        </Button>
      </div>

      {/* محمل تيك توك المطور */}
      <AnimatePresence>
        {showMoreTools && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-5 glass-card rounded-2xl border border-pink-500/20 bg-gradient-to-r from-pink-500/5 to-transparent">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white"><Video className="h-5 w-5" /></div>
                  <h4 className="font-bold text-sm">محمل تيك توك (بدون حقوق)</h4>
                </div>
                {isDownloading && <span className="text-[10px] text-pink-500 animate-pulse">{downloadStep}</span>}
              </div>

              {isDownloading && (
                <div className="w-full bg-pink-500/10 h-1.5 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-pink-500" initial={{ width: 0 }} animate={{ width: `${downloadProgress}%` }} />
                </div>
              )}

              {!finalVideoLink ? (
                <div className="flex gap-2">
                  <Input placeholder="ضع الرابط هنا..." className="h-10 text-xs bg-background/50 border-pink-500/10" value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} disabled={isDownloading} />
                  <Button onClick={handleTikTokDownload} disabled={isDownloading || !tiktokUrl} className="bg-[#FE2C55] hover:bg-[#ef2950] h-10">
                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  </Button>
                </div>
              ) : (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col gap-3">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-xs font-bold text-green-600">الفيديو جاهز للتحميل المباشر!</span>
                  </div>
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold" onClick={() => { window.open(finalVideoLink, '_blank'); setFinalVideoLink(null); setTiktokUrl(''); setIsDownloading(false); }}>
                    تحميل الفيديو الآن
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
