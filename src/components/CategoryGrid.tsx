import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Type, Video, Sparkles, Music, Image, Layout, ChevronDown, LucideIcon } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';

// خريطة الأيقونات كما هي في مشروعك
const iconMap: Record<string, LucideIcon> = {
  folder: Folder, type: Type, video: Video, sparkles: Sparkles, music: Music, image: Image, layout: Layout,
};

const getIcon = (iconName: string): LucideIcon => iconMap[iconName] || Folder;

// إعدادات الأنيميشن "الفخم"
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 } // ظهور العناصر واحد وراء الآخر بسلاسة
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 } 
  },
  exit: { opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.2 } }
};

export function CategoryGrid() {
  const { data: categories, isLoading } = useCategories();
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  // المنطق: عرض 6 أقسام أو الكل
  const displayedCategories = isExpanded ? categories : categories?.slice(0, 6);

  return (
    <div className="flex flex-col items-center space-y-10">
      <motion.div 
        layout // ✨ سحر الـ Layout لموازنة العناصر تلقائياً عند التمدد
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full"
      >
        <AnimatePresence mode="popLayout">
          {displayedCategories?.map((category) => {
            const Icon = getIcon(category.icon);
            return (
              <motion.div
                key={category.id}
                layout // ✨ الحفاظ على انسيابية الحركة لكل كارت
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <Link to={`/category/${category.slug}`} className="block group">
                  <div className="relative h-32 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                    <div className="absolute inset-0 islamic-pattern opacity-10 group-hover:opacity-20 transition-opacity" />
                    <div className="relative h-full flex flex-col items-center justify-center gap-3 p-4">
                      <motion.div 
                        className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                        whileHover={{ rotate: [0, -15, 15, 0] }}
                      >
                        <Icon className="h-6 w-6 text-primary" />
                      </motion.div>
                      <span className="font-bold text-foreground text-sm sm:text-base tracking-wide">
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

      {/* زر "المزيد" بتصميم متناسق مع الموقع */}
      {categories && categories.length > 6 && (
        <motion.div layout>
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="group relative h-12 px-10 rounded-full border-primary/20 bg-background hover:bg-primary/5 transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-2 font-semibold text-primary">
              {isExpanded ? 'عرض أقل' : 'عرض المزيد'}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.4 }}
              >
                <ChevronDown className="h-5 w-5" />
              </motion.div>
            </span>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
