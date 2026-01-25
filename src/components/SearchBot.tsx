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
  const [showMoreTools, setShowMoreTools] = useState(false);
  
  // حالات محمل تيك توك
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadResult, setDownloadResult] = useState<string | null>(null);

  const { data: resources } = useResources();

  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    return resources.filter(res => 
      res.title.toLowerCase().includes(query.toLowerCase()) || 
      res.title_ar.includes(query)
    );
  }, [query, resources]);

  // ✨ دالة الربط مع كود البايثون
  const handleTikTokDownload = async () => {
    if (!tiktokUrl.includes('tiktok.com')) {
      toast.error("عذراً عمر، الرابط يبدو غير صحيح!");
      return;
    }

    setIsDownloading(true);
    setDownloadResult(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tiktokUrl }),
      });

      const data = await response.json();

      if (response.ok && data.download_link) {
        setDownloadResult(data.download_link);
        toast.success("تم استخراج الفيديو بنجاح!");
        // فتح الرابط في نافذة جديدة للتحميل
        window.open(data.download_link, '_blank');
      } else {
        toast.error(data.error || "فشل استخراج الفيديو، جرب رابطاً آخر.");
      }
    } catch (error) {
      console.error("خطأ في الاتصال بالسيرفر:", error);
      toast.error("حدث خطأ في الاتصال بمحرك البايثون.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 space-y-4">
      
      {/* 1. صندوق البحث */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-primary/10 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-right">مساعد البحث الذكي</h3>
            <p className="text-[10px] text-muted-foreground uppercase text-right">آفاق قرآنية</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setHasSearched(false); }} placeholder="ابحث عن ملحقاتك..." className="h-11 text-right" />
          <Button onClick={() => setHasSearched(true)} className="h-11 px-6"><Search className="h-4 w-4" /></Button>
        </div>
      </motion.div>

      {/* 2. مستخرج الألوان (أساسي) */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Link to="/color-extractor" className="group block glass-card rounded-2xl p-4 border border-primary/20 hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <Palette className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm">مستخرج الألوان الإسلامي</h4>
            </div>
            <ArrowRight className="h-4 w-4 opacity-30 group-hover:opacity-100" />
          </div>
        </Link>
      </motion.div>

      {/* 3. زر المزيد من الأدوات */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center">
          <Button variant="outline" size="sm" onClick={() => setShowMoreTools(!showMoreTools)} className="rounded-full bg-background px-4 text-[11px] font-bold text-muted-foreground border-border">
            {showMoreTools ? "عرض أقل" : "المزيد من الأدوات"}
          </Button>
        </div>
      </div>

      {/* 4. الأدوات الإضافية (محمل تيك توك) */}
      <AnimatePresence>
        {showMoreTools && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
            <div className="glass-card rounded-2xl p-5 border border-pink-500/20 bg-gradient-to-r from-pink-500/5 to-transparent">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center"><Video className="h-5 w-5 text-white" /></div>
                    <h4 className="font-bold text-sm">محمل تيك توك بدون حقوق</h4>
                  </div>
                  {downloadResult && (
                    <a href={downloadResult} target="_blank" className="text-[10px] text-pink-500 font-bold underline">جاهز للتحميل</a>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="ضع رابط الفيديو هنا..." 
                    className="h-10 text-xs bg-background/50"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                  />
                  <Button 
                    size="sm" 
                    className="bg-[#FE2C55] hover:bg-[#ef2950] shrink-0"
                    onClick={handleTikTokDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
