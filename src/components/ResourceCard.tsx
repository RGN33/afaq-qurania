import { Download, Bookmark, Share2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Resource } from '@/hooks/useResources';
import { useSavedResources } from '@/hooks/useSavedResources';
import { cn } from '@/lib/utils';

interface ResourceCardProps {
  resource: Resource;
  compact?: boolean;
  index?: number;
}

export function ResourceCard({ resource, compact, index = 0 }: ResourceCardProps) {
  const { isSaved, toggleSave } = useSavedResources();
  const saved = isSaved(resource.id);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.title_ar,
          text: `تحقق من هذا المورد: ${resource.title_ar}`,
          url: resource.mega_link,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(resource.mega_link);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={cn(
        'group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl transition-shadow',
        compact && 'flex items-center gap-3 p-3'
      )}
    >
      {compact ? (
        <>
          <motion.div 
            className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-secondary"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            {resource.thumbnail_url ? (
              <img
                src={resource.thumbnail_url}
                alt={resource.title_ar}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Download className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </motion.div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">{resource.title_ar}</h4>
            <p className="text-xs text-muted-foreground truncate">{resource.title}</p>
          </div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button size="icon" variant="ghost" asChild>
              <a href={resource.mega_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        </>
      ) : (
        <>
          <div className="aspect-video bg-secondary relative overflow-hidden">
            {resource.thumbnail_url ? (
              <motion.img
                src={resource.thumbnail_url}
                alt={resource.title_ar}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Download className="h-12 w-12 text-muted-foreground/50" />
                </motion.div>
              </div>
            )}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="p-4">
            <motion.h3 
              className="font-semibold text-foreground mb-1 line-clamp-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              {resource.title_ar}
            </motion.h3>
            <motion.p 
              className="text-sm text-muted-foreground mb-4 line-clamp-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              {resource.title}
            </motion.p>
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <motion.div 
                className="flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button asChild className="w-full gap-2">
                  <a href={resource.mega_link} target="_blank" rel="noopener noreferrer">
                    <motion.div
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Download className="h-4 w-4" />
                    </motion.div>
                    تحميل
                  </a>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleSave(resource.id)}
                  className={cn(saved && 'text-accent border-accent bg-accent/10')}
                >
                  <motion.div
                    animate={saved ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} />
                  </motion.div>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.15, rotate: 15 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
