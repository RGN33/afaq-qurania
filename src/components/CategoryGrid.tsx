import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Folder, Type, Video, Sparkles, Music, Image, Layout, LucideIcon } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

const iconMap: Record<string, LucideIcon> = {
  folder: Folder,
  type: Type,
  video: Video,
  sparkles: Sparkles,
  music: Music,
  image: Image,
  layout: Layout,
};

const getIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Folder;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

export function CategoryGrid() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="h-32 rounded-xl bg-secondary"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {/* تم إضافة .slice(0, 6) هنا لعرض أول 6 أقسام فقط */}
      {categories?.slice(0, 6).map((category) => {
        const Icon = getIcon(category.icon);
        return (
          <motion.div
            key={category.id}
            variants={itemVariants}
            whileHover={{ 
              y: -8, 
              scale: 1.03,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              to={`/category/${category.slug}`}
              className="block group"
            >
              <div className="relative h-32 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-border overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:border-primary/30">
                <motion.div 
                  className="absolute inset-0 islamic-pattern opacity-30"
                  animate={{ 
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{ 
                    duration: 20, 
                    repeat: Infinity, 
                    repeatType: "reverse" 
                  }}
                />
                <div className="relative h-full flex flex-col items-center justify-center gap-3">
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                    whileHover={{ 
                      rotate: [0, -10, 10, 0],
                      scale: 1.1,
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <Icon className="h-6 w-6 text-primary" />
                  </motion.div>
                  <motion.span 
                    className="font-semibold text-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {category.name_ar}
                  </motion.span>
                </div>
                
                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ 
                    background: "radial-gradient(circle at center, hsl(var(--primary) / 0.1), transparent 70%)" 
                  }}
                />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
