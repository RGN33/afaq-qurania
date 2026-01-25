import { motion } from 'framer-motion';
import { Bookmark, LayoutGrid } from 'lucide-react';
import { ResourceCard } from '@/components/ResourceCard';
import { useSavedResources } from '@/hooks/useSavedResources'; // الهوك الذي ظهر في ملفاتك سابقاً

export default function Saved() {
  const { savedResources, isLoading } = useSavedResources();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header القسم */}
      <section className="relative py-12 overflow-hidden bg-primary/5 border-b border-border">
        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Bookmark className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-bold text-foreground mb-2"
          >
            المحفوظات
          </motion.h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            جميع الموارد والملحقات التي قمت بحفظها للرجوع إليها لاحقاً
          </p>
        </div>
      </section>

      {/* قائمة المحفوظات */}
      <div className="container py-12">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-secondary rounded-xl animate-pulse" />
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-secondary/20 rounded-2xl border-2 border-dashed border-border"
          >
            <LayoutGrid className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-semibold text-foreground mb-2">قائمة المحفوظات فارغة</h2>
            <p className="text-muted-foreground mb-6">لم تقم بحفظ أي موارد حتى الآن</p>
            <Link to="/" className="inline-flex items-center justify-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              استعرض الموارد
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
