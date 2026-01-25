import { useState, useMemo } from 'react';
import { Search, Bot, CheckCircle, XCircle, Sparkles, Palette, ArrowRight, Video, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useResources } from '@/hooks/useResources';
import { supabase } from '@/integrations/supabase/client';
import { ResourceCard } from './ResourceCard';
import { toast } from 'sonner';

function fuzzyMatch(text: string, query: string): boolean {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  if (textLower.includes(queryLower)) return true;
  const queryWords = queryLower.split(/\s+/);
  return queryWords.every((word) => textLower.includes(word));
}

export function SearchBot() {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  
  // حالات خاصة بمحمل تيك توك
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: resources } = useResources();

  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    return resources.filter(
      (resource) =>
        fuzzyMatch(resource.title, query) || fuzzyMatch(resource.title_ar, query)
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

  const handleSubmitRequest = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!query.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await supabase.from('requests').insert({ search_query: query.trim() });
      setRequestSubmitted(true);
      toast.success("تم إرسال طلبك بنجاح");
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // دالة وهمية للتحميل (سيتم ربطها بالبايثون لاحقاً)
  const handleTikTokDownload = () => {
    if (!tiktokUrl.includes('tiktok.com')) {
      toast.error("يرجى إدخال رابط تيك توك صحيح");
      return;
    }
    setIsDownloading(true);
    // محاكاة لعملية البحث عن الفيديو
    setTimeout(() => {
      setIsDownloading(false);
      toast.info("جاري تجهيز الفيديو بدون علامة مائية...");
    }, 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 space-y-4">
      {/* 1. صندوق مساعد البحث الرئيسي */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass-card rounded-2xl p-6 relative z-10 shadow-xl shadow-primary/5 border border-primary/10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">مساعد البحث</h3>
            <p className="text-xs text-muted-foreground">ابحث عن الموارد الإسلامية</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setHasSearched(false); }}
            onKeyDown={handleKeyDown}
            placeholder="ابحث عن خط، فيديو..."
            className="flex-1 h-11"
          />
          <Button onClick={handleSearch} className="gap-2 h-11 px-6 shadow-lg shadow-primary/20">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">بحث</span>
          </Button>
        </div>

        {/* نتائج البحث */}
        <AnimatePresence>
          {hasSearched && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
              {searchResults.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {searchResults.slice(0, 4).map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} compact />
                  ))}
                </div>
              ) : (
                <div className="bg-secondary/30 p-4 rounded-xl text-center">
                  <p className="text-sm mb-2">غير موجود؟ اطلبه الآن!</p>
                  <Button onClick={handleSubmitRequest} disabled={isSubmitting} size="sm">
                    {isSubmitting ? 'جاري الإرسال...' : 'أرسل الطلب'}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 2. مستطيل "مستخرج الألوان الذكي" */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Link 
          to="/color-extractor" 
          className="group block relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 hover:border-primary/40 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                <Palette className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">مستخرج الألوان الذكي</h4>
                <p className="text-xs text-muted-foreground">حول أي صورة إلى باليتة ألوان احترافية</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-primary opacity-50 group-hover:opacity-100 transition-all" />
          </div>
        </Link>
      </motion.div>

      {/* 3. ✨ مستطيل "محمل تيك توك بدون علامة مائية" */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-pink-500/10 via-transparent to-transparent border border-pink-500/20 hover:border-pink-500/40 transition-all shadow-sm">
          {/* تأثير بصري خفيف خلف الأيقونة */}
          <div className="absolute -left-4 -top-4 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-colors" />
          
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#000000] dark:bg-[#ffffff] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Video className="h-6 w-6 text-white dark:text-black" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">محمل تيك توك الذكي</h4>
                  <p className="text-xs text-muted-foreground">تحميل الفيديوهات بدون علامة مائية بجودة عالية</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-pink-500 bg-pink-500/10 px-2 py-1 rounded-full uppercase">
                <Sparkles className="h-3 w-3" /> مميز
              </div>
            </div>

            {/* حقل إدخال الرابط المدمج */}
            <div className="flex gap-2">
              <Input 
                placeholder="ضع رابط الفيديو هنا..." 
                className="h-10 text-xs border-pink-500/20 focus:ring-pink-500/20 bg-background/50"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
              />
              <Button 
                size="sm" 
                onClick={handleTikTokDownload}
                disabled={isDownloading}
                className="bg-[#FE2C55] hover:bg-[#ef2950] text-white rounded-lg px-4 transition-all shrink-0"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
