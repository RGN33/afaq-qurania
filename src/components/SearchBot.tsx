import { useState, useMemo } from 'react';
import { Search, Bot, CheckCircle, XCircle, Sparkles, Palette, ArrowRight, Video, Download, Loader2, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';
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
  const [showMoreTools, setShowMoreTools] = useState(false); // ✨ حالة التحكم في الزحمة
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: resources } = useResources();

  // منطق البحث (كما هو)
  const searchResults = useMemo(() => {
    if (!query.trim() || !resources) return [];
    return resources.filter(res => 
      res.title.toLowerCase().includes(query.toLowerCase()) || 
      res.title_ar.includes(query)
    );
  }, [query, resources]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 space-y-4">
      
      {/* 1. صندوق البحث (دائماً ظاهر) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 relative z-10 border border-primary/10 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base">مساعد البحث</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">البحث الذكي في الموارد</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input 
            value={query} 
            onChange={(e) => { setQuery(e.target.value); setHasSearched(false); }}
            placeholder="عن ماذا تبحث اليوم؟" 
            className="h-11"
          />
          <Button onClick={() => setHasSearched(true)} className="h-11 px-6">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {/* نتائج البحث تظهر هنا عند البحث */}
      </motion.div>

      {/* 2. الأداة الأساسية: مستخرج الألوان */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Link to="/color-extractor" className="group block glass-card rounded-2xl p-4 border border-primary/20 hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <Palette className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm">مستخرج الألوان</h4>
            </div>
            <ArrowRight className="h-4 w-4 opacity-30 group-hover:opacity-100" />
          </div>
        </Link>
      </motion.div>

      {/* 3. ✨ زر "المزيد من الأدوات" المبتكر */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowMoreTools(!showMoreTools)}
            className="rounded-full bg-background px-4 text-[11px] font-bold text-muted-foreground hover:text-primary border-border"
          >
            {showMoreTools ? (
              <span className="flex items-center gap-1"><ChevronUp className="h-3 w-3" /> عرض أقل</span>
            ) : (
              <span className="flex items-center gap-1"><PlusCircle className="h-3 w-3" /> المزيد من الأدوات</span>
            )}
          </Button>
        </div>
      </div>

      {/* 4. الأدوات الإضافية (مخفية) */}
      <AnimatePresence>
        {showMoreTools && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="space-y-4 overflow-hidden"
          >
            {/* محمل تيك توك */}
            <div className="glass-card rounded-2xl p-5 border border-pink-500/20 bg-gradient-to-r from-pink-500/5 to-transparent">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-sm">محمل تيك توك</h4>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="ضع رابط الفيديو هنا..." 
                    className="h-10 text-xs bg-background/50"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                  />
                  <Button size="sm" className="bg-[#FE2C55] hover:bg-[#ef2950] shrink-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* أي أداة مستقبلية ستوضع هنا */}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
