import { useState, useMemo } from 'react';
import { Search, Bot, Palette, ArrowRight, Video, Download, Loader2, PlusCircle, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-react';
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
  
  // حالات محمل تيك توك المتقدمة
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStep, setDownloadStep] = useState('');
  const [finalVideoLink, setFinalVideoLink] = useState<string | null>(null);

  const { data: resources } = useResources();

  // 1. منطق البحث الذكي (عربي وإنجليزي)
  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    const q = query.toLowerCase();
    return resources.filter((res) => 
      (res.title?.toLowerCase().includes(q)) || (res.title_ar?.includes(q))
    );
  }, [query, resources]);

  // 2. إرسال طلب للأدمن عند عدم وجود نتائج
  const handleSubmitRequest = async () => {
    if (!query.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await supabase.from('requests').insert({ search_query: query.trim() });
      toast.success("تم إرسال طلبك للأدمن بنجاح");
    } catch { toast.error("فشل إرسال الطلب"); }
    finally { setIsSubmitting(false); }
  };

  // 3. ✨ دالة التحميل الذكية (حل مشكلة الفشل على الموبايل)
  const handleTikTokDownload = async () => {
    if (!tiktokUrl.includes('tiktok.com')) {
      toast.error("يرجى إدخال رابط تيك توك صحيح");
      return;
    }

    setIsDownloading(true);
    setFinalVideoLink(null); // مسح الرابط القديم
    setDownloadStep("جاري تخطي الحظر واستخراج الفيديو...");

    try {
      // نكلم الـ API الجاهز مباشرة
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`);
      const responseData = await res.json();

      if (responseData.code === 0 && responseData.data.play) {
        // بدلاً من window.open، نحفظ الرابط ليظهر في زر التحميل
        setFinalVideoLink(responseData.data.play);
        toast.success("تم تجهيز الفيديو! اضغط على زر التحميل بالأسفل");
      } else {
        toast.error("فشل الاستخراج، قد يكون الفيديو خاصاً أو محذوفاً");
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال، جرب مرة أخرى");
    } finally {
      setIsDownloading(false);
      setDownloadStep("");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 space-y-6 text-right" dir="rtl">
      
      {/* 1. مساعد البحث الرئيسي (كبير وسهل اللمس) */}
      <motion.div layout className="glass-card rounded-3xl p-6 border border-primary/10 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Bot className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">مساعد البحث</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input 
            value={query} 
            onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}} 
            placeholder="ابحث عن ملحقاتك (خطوط، فيديوهات...)" 
            className="h-14 text-base bg-background/50 border-primary/20" 
          />
          <Button onClick={() => setHasSearched(true)} className="h-14 px-8 shadow-lg shadow-primary/20">
            <Search className="h-5 w-5" />
          </Button>
        </div>
        
        {/* نتائج البحث */}
        <AnimatePresence>
          {hasSearched && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {searchResults.slice(0, 4).map((res) => <ResourceCard key={res.id} resource={res} compact />)}
                </div>
              ) : (
                <div className="text-center p-4 bg-secondary/20 rounded-2xl">
                  <p className="text-sm mb-3 italic">غير متوفر؟ اطلبه من الأدمن فوراً!</p>
                  <Button onClick={handleSubmitRequest} disabled={isSubmitting} className="w-full">إرسال طلب للأدمن</Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 2. أداة مستخرج الألوان */}
      <Link to="/color-extractor" className="group block glass-card rounded-2xl p-5 border border-primary/20 hover:border-primary/50 transition-all shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold">مستخرج الألوان الإسلامي</h4>
              <p className="text-[10px] text-muted-foreground">استخرج باليتة ألوان احترافية من أي صورة</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-primary rotate-180" />
        </div>
      </Link>

      {/* 3. زر "المزيد من الأدوات" (فاصل جمالي) */}
      <div className="relative py-2 flex justify-center">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <Button variant="outline" onClick={() => setShowMoreTools(!showMoreTools)} className="rounded-full bg-background px-6 text-xs z-10 border-border">
          {showMoreTools ? "إخفاء الأدوات الإضافية" : "المزيد من الأدوات"}
        </Button>
      </div>

      {/* 4. ✨ محمل تيك توك المطور (حل مشكلة الموبايل الجذرية) */}
      <AnimatePresence>
        {showMoreTools && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 10 }} 
            className="p-6 glass-card rounded-3xl border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-transparent shadow-xl"
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white shadow-lg">
                    <Video className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">محمل تيك توك الذكي</h4>
                    {isDownloading && <p className="text-[10px] text-pink-500 animate-pulse mt-1">{downloadStep}</p>}
                  </div>
                </div>
              </div>

              {/* إذا لم يتم استخراج الرابط بعد، نظهر حقل الإدخال */}
              {!finalVideoLink ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    placeholder="ضع رابط الفيديو هنا..." 
                    className="h-14 text-sm bg-background/50 border-pink-500/10" 
                    value={tiktokUrl} 
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    disabled={isDownloading}
                  />
                  <Button 
                    onClick={handleTikTokDownload} 
                    disabled={isDownloading || !tiktokUrl} 
                    className="bg-[#FE2C55] h-14 w-full sm:w-20 shadow-lg shadow-pink-500/20 active:scale-95 transition-transform"
                  >
                    {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
                  </Button>
                </div>
              ) : (
                /* ✨ هنا الحل: زر التحميل النهائي الذي لا يمنعه الموبايل */
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-3">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3">
                    <CheckCircle className="text-green-500 h-6 w-6" />
                    <span className="text-xs font-bold text-green-700">الفيديو جاهز! اضغط الزر بالأسفل لفتحه وتحميله.</span>
                  </div>
                  <Button 
                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-xl shadow-green-500/20 flex gap-2 active:scale-95 transition-all"
                    onClick={() => { 
                      window.open(finalVideoLink, '_blank'); 
                      setFinalVideoLink(null); // تصفير الحالة بعد التحميل
                      setTiktokUrl('');
                    }}
                  >
                    <Download className="h-5 w-5" /> اضغط هنا للتحميل المباشر
                  </Button>
                </motion.div>
              )}
              
              <div className="flex items-start gap-2 bg-yellow-500/5 p-3 rounded-xl border border-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <p className="text-[9px] text-yellow-700 leading-relaxed">
                  إذا واجهت مشكلة في التحميل على الموبايل، يرجى استخدام متصفح Chrome أو Safari والتأكد من عدم حظر النوافذ المنبثقة.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
