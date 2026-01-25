import { useState } from 'react'; // ✨ أضفنا هذه للاستخدام
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Type, Video, Sparkles, Music, Image, Layout, ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, LucideIcon> = {
  folder: Folder, type: Type, video: Video, sparkles: Sparkles, music: Music, image: Image, layout: Layout,
};

const getIcon = (iconName: string): LucideIcon => iconMap[iconName] || Folder;

export function CategoryGrid() {
  const { data: categories, isLoading } = useCategories();
  const [showAll, setShowAll] = useState(false); // ✨ حالة التحكم في العرض

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  // تحديد الأقسام المعروضة بناءً على حالة الزر
  const displayedCategories = showAll ? categories : categories?.slice(0, 6);

  return (
    <div className="space-y-8">
      <motion.div 
        layout // ✨ لضمان نعومة الحركة عند توسيع الشبكة
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence>
          {displayedCategories?.map((category) => {
            const Icon = getIcon(category.icon);
            return (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={`/category/${category.slug}`} className="block group">
                  <div className="relative h-32 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 islamic-pattern opacity-20" />
                    <div className="relative h-full flex flex-col items-center justify-center gap-2 p-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground text-center line-clamp-1">
                        {category.name_ar}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* ✨ زر "المزيد" الاحترافي */}
      {categories && categories.length > 6 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-4"
        >
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="gap-2 rounded-full px-8 border-primary/20 hover:bg-primary/5 transition-all"
          >
            {showAll ? (
              <>
                عرض أقل <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                عرض المزيد <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
