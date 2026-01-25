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
  
  // حالات محمل تيك توك
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: resources } = useResources();

  // منطق البحث الذكي (عربي وإنجليزي)
  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    const searchLow = query.toLowerCase();
    return resources.filter((res) => 
      (res.title?.toLowerCase().includes(searchLow)) || 
      (res.title_ar?.includes(searchLow))
    );
  }, [query, resources]);

  const handleSearch = () => {
    if (query.trim()) {
      setHasSearched(true);
      setRequestSubmitted(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // إرسال طلب للأدمن عند عدم وجود نتيجة
  const handleSubmitRequest = async () => {
    if (!query.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('requests').insert({ search_query: query.trim() });
      if (error) throw error;
      setRequestSubmitted(true);
      toast.success("تم إرسال طلبك للأدمن بنجاح");
    } catch (error) {
      console.error('Error:', error);
      toast.error("فشل في إرسال الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  // منطق تحميل تيك توك المربوط بالبايثون
  const handleTikTokDownload = async () => {
    if (!tiktokUrl.includes('tiktok.com')) {
      toast.error("يرجى إدخال رابط تيك توك صحيح");
      return;
    }
    setIsDownloading(true);
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tiktokUrl }),
      });
      const data = await response.json();
      if (response.ok && data.download_link) {
        window.open(data.download_link, '_blank');
        toast.success("بدأ التحميل بدون علامة مائية");
      } else {
        toast.error(data.error || "عذراً، تيك توك حظر الطلب حالياً");
      }
    } catch (error) {
      toast.error("خطأ في الاتصال بمحرك التحميل");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 space-y-5 text-right" dir="rtl">
      
      {/* 1. مساعد البحث الرئيسي */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 relative z-10 border border-primary/10 shadow-2xl shadow-primary/5"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">مساعد البحث الذكي</h3>
            <p className="text-xs text-muted-foreground italic">ابحث عن أرقى الملحقات الإسلامية</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input 
            value={query} 
            onChange={(e) => { setQuery(e.target.value); setHasSearched(false); }}
            onKeyDown={handleKeyDown}
            placeholder="عن ماذا تبحث اليوم ؟" 
            className="h-12 text-sm focus-visible:ring-primary/30"
          />
          <Button onClick={handleSearch} className="h-12 px-6 shadow-lg shadow-primary/20">
            <Search className="h-5 w-5" />
          </Button>
        </div>

        <AnimatePresence>
          {hasSearched && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {searchResults.slice(0, 4).map((res) => (
                    <ResourceCard key={res.id} resource={res} compact />
                  ))}
                </div>
              ) : (
                <div className="p-5 bg-secondary/30 rounded-2xl text-center border border-dashed border-border">
                  <p className="text-sm mb-3">هذا الملحق غير متوفر حالياً، هل تريد طلبه؟</p>
                  <Button onClick={handleSubmitRequest} disabled={isSubmitting} size="sm">
                    {isSubmitting ? "جاري الإرسال..." : "أرسل الطلب للأدمن"}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 2. مستخرج الألوان (رئيسي) */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Link to="/color-extractor" className="group block glass-card rounded-2xl p-5 border border-primary/20 hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
                <Palette className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold">مستخرج الألوان الإسلامي</h4>
                <p className="text-xs text-muted-foreground">استلهم باليتة ألوانك من أي صورة</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-primary opacity-30 group-hover:opacity-100 rotate-180 transition-all" />
          </div>
        </Link>
      </motion.div>

      {/* 3. زر المزيد من الأدوات */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowMoreTools(!showMoreTools)} 
            className="rounded-full bg-background px-6 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            {showMoreTools ? "إخفاء الأدوات الإضافية" : "المزيد من الأدوات"}
          </Button>
        </div>
      </div>

      {/* 4. محمل تيك توك (مخفي) */}
      <AnimatePresence>
        {showMoreTools && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="space-y-4"
          >
            <div className="glass-card rounded-2xl p-5 border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-transparent">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white"><Video className="h-5 w-5" /></div>
                  <h4 className="font-bold text-sm">محمل تيك توك بدون علامة مائية</h4>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="ضع رابط الفيديو هنا..." 
                    className="h-11 text-xs bg-background/50 border-pink-500/10 focus-visible:ring-pink-500/20"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                  />
                  <Button 
                    onClick={handleTikTokDownload} 
                    disabled={isDownloading} 
                    className="bg-[#FE2C55] hover:bg-[#ef2950] shrink-0 h-11 px-5"
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
