import { useState, useMemo } from 'react';
import { Search, Bot, CheckCircle, XCircle, Sparkles, Palette, ArrowRight } from 'lucide-react'; // أضفنا Palette و ArrowRight
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom'; // أضفنا Link للتوجيه
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useResources } from '@/hooks/useResources';
import { supabase } from '@/integrations/supabase/client';
import { ResourceCard } from './ResourceCard';

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
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSubmitRequest = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!query.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await supabase.from('requests').insert({ search_query: query.trim() });
      setRequestSubmitted(true);
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 space-y-4">
      {/* صندوق مساعد البحث الرئيسي */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="glass-card rounded-2xl p-6 relative z-10 shadow-xl shadow-primary/5"
      >
        <motion.div 
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
            animate={{ 
              boxShadow: [
                "0 0 0 0 rgba(27, 67, 50, 0.2)",
                "0 0 0 10px rgba(27, 67, 50, 0)",
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Bot className="h-5 w-5 text-primary" />
            </motion.div>
          </motion.div>
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">مساعد البحث</h3>
            <p className="text-xs text-muted-foreground">ابحث عن الموارد الإسلامية</p>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="mr-auto"
          >
            <Sparkles className="h-4 w-4 text-accent" />
          </motion.div>
        </motion.div>

        <motion.div 
          className="flex gap-2 relative z-20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHasSearched(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder="ابحث عن خط، فيديو..."
            className="flex-1 text-sm sm:text-base h-11 cursor-text touch-manipulation focus:ring-primary/20"
          />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <Button onClick={handleSearch} className="gap-2 h-11 px-4 touch-manipulation shadow-lg shadow-primary/20">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">بحث</span>
            </Button>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="h-4 w-4" />
                    <span>تم العثور على {searchResults.length} نتيجة</span>
                  </div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {searchResults.slice(0, 4).map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ResourceCard resource={resource} compact />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <motion.div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    <span>لا توجد نتائج لـ "{query}"</span>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {!requestSubmitted ? (
                      <motion.div 
                        key="request-form"
                        className="bg-secondary/50 rounded-lg p-4 relative z-30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <p className="text-xs sm:text-sm text-foreground mb-3">
                          سنضيفه خلال 24 ساعة بإذن الله!
                        </p>
                        <Button
                          onClick={handleSubmitRequest}
                          disabled={isSubmitting}
                          size="sm"
                          className="w-full sm:w-auto h-10 touch-manipulation relative z-40"
                        >
                          {isSubmitting ? 'جاري الإرسال...' : 'أرسل الطلب'}
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div className="bg-primary/10 rounded-lg p-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span className="text-xs sm:text-sm text-foreground">تم الإرسال بنجاح!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ✨ مستطيل "مستخرج الألوان الذكي" - تمت إضافته هنا بشكل انسيابي */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Link 
          to="/color-extractor" 
          className="group block relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 hover:border-primary/40 transition-all shadow-sm"
        >
          {/* تأثير توهج خلفي (Glow) */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4 text-right">
              <motion.div 
                className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20"
                whileHover={{ rotate: 15, scale: 1.1 }}
              >
                <Palette className="h-6 w-6" />
              </motion.div>
              <div>
                <h4 className="font-bold text-foreground text-sm sm:text-base">مستخرج الألوان الذكي</h4>
                <p className="text-xs text-muted-foreground">حول أي صورة إلى باليتة ألوان احترافية لتصاميمك</p>
              </div>
            </div>
            
            <motion.div 
              className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300"
              whileHover={{ x: -5 }}
            >
              <ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </motion.div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
