import { useState, useMemo } from 'react';
import { Search, Bot, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const handleSubmitRequest = async () => {
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
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="glass-card rounded-2xl p-6"
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
            <h3 className="font-semibold text-foreground">مساعد البحث</h3>
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
          className="flex gap-2"
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
            placeholder="ابحث عن خط، فيديو، تأثير..."
            className="flex-1"
          />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={handleSearch} className="gap-2">
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Search className="h-4 w-4" />
              </motion.div>
              بحث
            </Button>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="mt-4 overflow-hidden"
            >
              {searchResults.length > 0 ? (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className="flex items-center gap-2 text-sm text-primary"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </motion.div>
                    <span>تم العثور على {searchResults.length} نتيجة</span>
                  </motion.div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {searchResults.slice(0, 4).map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                      >
                        <ResourceCard resource={resource} compact />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div 
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <XCircle className="h-4 w-4" />
                    </motion.div>
                    <span>لم يتم العثور على نتائج لـ "{query}"</span>
                  </motion.div>
                  
                  <AnimatePresence mode="wait">
                    {!requestSubmitted ? (
                      <motion.div 
                        key="request-form"
                        className="bg-secondary/50 rounded-lg p-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <p className="text-sm text-foreground mb-3">
                          لم نجد ما تبحث عنه، لكننا سنضيفه خلال 24 ساعة!
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={handleSubmitRequest}
                            disabled={isSubmitting}
                            size="sm"
                            variant="default"
                          >
                            {isSubmitting ? (
                              <motion.span
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                جاري الإرسال...
                              </motion.span>
                            ) : (
                              'أرسل الطلب'
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="success"
                        className="bg-primary/10 rounded-lg p-4 flex items-center gap-2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.2, 1] }}
                          transition={{ delay: 0.1 }}
                        >
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </motion.div>
                        <span className="text-sm text-foreground">
                          تم إرسال طلبك بنجاح! سنعمل على إضافته قريباً.
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
