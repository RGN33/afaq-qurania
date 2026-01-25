import { motion } from 'framer-motion';
import { Bookmark, LayoutGrid, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResourceCard } from '@/components/ResourceCard';
import { useSavedResources } from '@/hooks/useSavedResources';

export default function Saved() {
  const { savedResources, isLoading } = useSavedResources();

  return (
    <div className="min-h-screen bg-background">
      {/* قسم العنوان العلوي بنفس ستايل الموقع */}
      <section className="relative py-16 overflow-hidden bg-primary/5 border-b border-border">
        {/* النقش الإسلامي المتحرك - للحفاظ على الهوية البصرية */}
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        
        <div className="container relative z-10 text-center px-4">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20"
          >
            <Bookmark className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-bold text-foreground mb-3"
          >
            المحفوظات
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-md mx-auto"
          >
            الموارد والملحقات التي قمت بحفظها محلياً للوصول السريع إليها
          </motion.p>
        </div>
      </section>

      {/* قائمة العناصر */}
      <div className="container py-12 px-4 sm:px-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-secondary/50 rounded-2xl animate-pulse border border-border" />
            ))}
          </div>
        ) : savedResources && savedResources.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {savedResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ResourceCard resource={resource} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-6 glass-card rounded-3xl border-2 border-dashed border-border max-w-lg mx-auto"
          >
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
              <LayoutGrid className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">لا توجد محفوظات</h2>
            <p className="text-muted-foreground mb-8">
              لم تقم بحفظ أي ملحقات بعد. ابدأ باستكشاف الموارد وأضف ما يعجبك هنا!
            </p>
            <Link to="/">
              <Button className="gap-2 px-8 h-12 rounded-xl">
                <ArrowLeft className="h-4 w-4" />
                العودة للرئيسية
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
