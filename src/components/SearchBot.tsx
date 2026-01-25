import { useState, useMemo, useEffect } from 'react';
import { Search, Bot, Palette, ArrowRight, Video, Download, Loader2, PlusCircle, AlertCircle } from 'lucide-react';
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
  const [downloadStep, setDownloadStep] = useState(''); // رسائل التايمر الوهمي
  const [downloadProgress, setDownloadProgress] = useState(0);

  const { data: resources } = useResources();

  // منطق البحث الذكي
  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    const q = query.toLowerCase();
    return resources.filter((res) => 
      (res.title?.toLowerCase().includes(q)) || (res.title_ar?.includes(q))
    );
  }, [query, resources]);

  // دالة محمل تيك توك مع التايمر الوهمي والرسائل المحسنة
  const handleTikTokDownload = async () => {
    if (!tiktokUrl.includes('tiktok.com')) {
      toast.error("عذراً عمر، الرابط غير صحيح، تأكد من نسخه من تيك توك");
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    
    // ⏳ نظام التايمر الوهمي لإضفاء لمسة احترافية
    const steps = [
      { p: 20, m: "جاري الاتصال بخوادم تيك توك..." },
      { p: 50, m: "جاري استخراج الفيديو بدون علامة مائية..." },
      { p: 85, m: "يتم الآن تجهيز رابط التحميل المباشر..." },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setDownloadProgress(steps[currentStep].p);
        setDownloadStep(steps[currentStep].m);
        currentStep++;
      }
    }, 800);

    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`);
      const responseData = await res.json();

      clearInterval(interval); // إيقاف التايمر الوهمي فور استلام البيانات

      if (responseData.code === 0 && responseData.data.play) {
        setDownloadProgress(100);
        setDownloadStep("اكتمل الاستخراج! يفتح الآن...");
        
        setTimeout(() => {
          window.open(responseData.data.play, '_blank', 'noopener,noreferrer');
          setIsDownloading(false);
          setTiktokUrl(''); // تنظيف الحقل
        }, 500);
        
        toast.success("تم تجهيز الفيديو بنجاح");
      } else {
        throw new Error("API Error");
      }
    } catch (error) {
      clearInterval(interval);
      setIsDownloading(false);
      // ❌ رسائل خطأ احترافية بناءً على الموقف
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-bold">فشل التحميل مؤقتاً</span>
          <span className="text-xs">قد يكون الفيديو خاصاً، أو السيرفر مشغول. جرب رابطاً آخر بعد قليل.</span>
        </div>,
        { duration: 5000 }
      );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 space-y-4 text-right" dir="rtl">
      
      {/* مساعد البحث الرئيسي */}
      <motion.div layout className="glass-card rounded-2xl p-6 border border-primary/10 shadow-xl">
        <div className="flex items-center gap-3 mb-4 text-right">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Bot className="h-5 w-5" /></div>
          <div><h3 className="font-bold text-sm sm:text-base">مساعد البحث الذكي</h3></div>
        </div>
        <div className="flex gap-2">
          <Input value={query} onChange={(e) => {setQuery(e.target.value); setHasSearched(false);}} placeholder="عن ماذا تبحث اليوم؟" className="h-11 text-right" />
          <Button onClick={() => setHasSearched(true)} className="h-11 px-6"><Search className="h-4 w-4" /></Button>
        </div>
        {/* نتائج البحث (كما هي) */}
      </motion.div>

      {/* أداة الألوان */}
      <Link to="/color-extractor" className="group block glass-card rounded-2xl p-4 border border-primary/20 hover:border-primary/50 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg"><Palette className="h-5 w-5" /></div>
            <h4 className="font-bold text-sm">مستخرج الألوان الإسلامي</h4>
          </div>
          <ArrowRight className="h-4 w-4 opacity-30 rotate-180" />
        </div>
      </Link>

      {/* زر المزيد من الأدوات */}
      <div className="relative py-2 flex justify-center">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <Button variant="outline" size="sm" onClick={() => setShowMoreTools(!showMoreTools)} className="rounded-full bg-background px-4 text-[10px] font-bold z-10">
          {showMoreTools ? "إخفاء الأدوات" : "المزيد من الأدوات"}
        </Button>
      </div>

      {/* محمل تيك توك المطور */}
      <AnimatePresence>
        {showMoreTools && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="p-5 glass-card rounded-2xl border border-pink-500/20 bg-gradient-to-r from-pink-500/5 to-transparent"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white"><Video className="h-5 w-5" /></div>
                  <h4 className="font-bold text-sm">محمل تيك توك بدون حقوق</h4>
                </div>
                {isDownloading && (
                  <span className="text-[10px] font-bold text-pink-500 animate-pulse">{downloadStep}</span>
                )}
              </div>

              {/* شريط التقدم الوهمي */}
              {isDownloading && (
                <div className="w-full bg-pink-500/10 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${downloadProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Input 
                  placeholder="ضع رابط الفيديو هنا..." 
                  className="h-10 text-xs bg-background/50 border-pink-500/10" 
                  value={tiktokUrl} 
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  disabled={isDownloading}
                />
                <Button 
                  onClick={handleTikTokDownload} 
                  disabled={isDownloading || !tiktokUrl} 
                  className="bg-[#FE2C55] hover:bg-[#ef2950] h-10 px-4 transition-all"
                >
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                </Button>
              </div>
              
              <p className="text-[9px] text-muted-foreground text-center">
                سيفتح الفيديو في نافذة جديدة، اضغط مطولاً أو كليك يمين لحفظه
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
