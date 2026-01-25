import { useState, useMemo } from 'react';
import { Search, Bot, CheckCircle, XCircle, Sparkles, Palette, ArrowRight, Video, Download, Loader2, ChevronDown, PlusCircle } from 'lucide-react';
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
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: resources } = useResources();

  // إصلاح منطق البحث (يدعم عربي وإنجليزي)
  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    const q = query.toLowerCase();
    return resources.filter((res) => 
      (res.title?.toLowerCase().includes(q)) || (res.title_ar?.includes(q))
    );
  }, [query, resources]);

  const handleSearch = () => {
    if (query.trim()) {
      setHasSearched(true);
      setRequestSubmitted(false);
    }
  };

  // إرسال طلب البحث للأدمن في حال عدم وجود نتائج
  const handleSubmitRequest = async () => {
    if (!query.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('requests').insert({ search_query: query.trim() });
      if (error) throw error;
      setRequestSubmitted(true);
      toast.success("تم إرسال طلبك للأدمن بنجاح");
    } catch (error) {
      toast.error("فشل في إرسال الطلب");
    } finally { setIsSubmitting(false); }
  };

 // ✨ النسخة المحدثة بناءً على فكرتك (Direct Video Link)
  const handleTikTokDownload = async () => {
    if (!tiktokUrl.includes('tiktok.com')) {
      toast.error("يا عمر، الرابط لازم يكون من تيك توك!");
      return;
    }

    setIsDownloading(true);
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tiktokUrl }),
      });

      const data = await res.json();

      if (res.ok && data.download_link) {
        // ✨ هنا السحر: فتح الرابط في صفحة جديدة كفيديو خام
        // استخدمنا 'noreferrer' عشان نخفي هوية موقعك عن تيك توك تماماً
        const newWindow = window.open(data.download_link, '_blank', 'noopener,noreferrer');
        
        if (newWindow) {
          toast.success("تم استخراج الفيديو! سيفتح الآن للمعاينة والتحميل");
        } else {
          toast.error("المتصفح منع فتح النافذة، يرجى السماح بالـ Pop-ups");
        }
      } else {
        // رسالة أوضح في حالة الحظر من تيك توك للسيرفر
        toast.error(data.error || "عذراً، تيك توك رفض طلب السيرفر حالياً");
      }
    } catch (error) {
      toast.error("فشل الاتصال بمحرك البايثون");
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 space-y-4 text-right" dir="rtl">
      
      {/* صندوق البحث الرئيسي */}
      <motion.div layout className="glass-card rounded-2xl p-6 border border-primary/10 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Bot className="h-5 w-5" /></div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">مساعد البحث الذكي</h3>
            <p className="text-[10px] text-muted-foreground">ابحث في موارد آفاق قرآنية</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input value={query} onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="عن ماذا تبحث اليوم؟" className="h-11" />
          <Button onClick={handleSearch} className="h-11 px-6 shadow-lg shadow-primary/20"><Search className="h-4 w-4" /></Button>
        </div>

        <AnimatePresence>
          {hasSearched && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {searchResults.slice(0, 4).map((res) => <ResourceCard key={res.id} resource={res} compact />)}
                </div>
              ) : (
                <div className="p-4 bg-secondary/20 rounded-xl text-center">
                  <p className="text-xs mb-3 italic">الملحق غير متوفر؟ اطلبه الآن!</p>
                  <Button onClick={handleSubmitRequest} disabled={isSubmitting} size="sm">{isSubmitting ? "جاري الإرسال..." : "إرسال للأدمن"}</Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* أداة الألوان (أساسية) */}
      <Link to="/color-extractor" className="group block glass-card rounded-2xl p-4 border border-primary/20 hover:border-primary/50 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white group-hover:rotate-12 transition-transform shadow-lg"><Palette className="h-5 w-5" /></div>
            <h4 className="font-bold text-sm">مستخرج الألوان الإسلامي</h4>
          </div>
          <ArrowRight className="h-4 w-4 opacity-30 rotate-180" />
        </div>
      </Link>

      {/* زر المزيد من الأدوات */}
      <div className="relative py-2 flex justify-center">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <Button variant="outline" size="sm" onClick={() => setShowMoreTools(!showMoreTools)} className="rounded-full bg-background px-4 text-[10px] font-bold text-muted-foreground z-10">
          {showMoreTools ? "عرض أقل" : "المزيد من الأدوات"}
        </Button>
      </div>

      {/* محمل تيك توك (مخفي) */}
      <AnimatePresence>
        {showMoreTools && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-5 glass-card rounded-2xl border border-pink-500/20 bg-gradient-to-r from-pink-500/5 to-transparent">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white"><Video className="h-5 w-5" /></div>
                <h4 className="font-bold text-sm">محمل تيك توك بدون حقوق</h4>
              </div>
              <div className="flex gap-2">
                <Input placeholder="ضع رابط الفيديو هنا..." className="h-10 text-xs bg-background/50" value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} />
                <Button onClick={handleTikTokDownload} disabled={isDownloading} className="bg-[#FE2C55] hover:bg-[#ef2950] shrink-0 h-10">
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
