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

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      // يمكنك إضافة toast هنا لإعلام المستخدم بنسخ الرابط
    }
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(resource); // نرسل المورد بالكامل وليس الـ ID فقط
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
        'group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300',
        compact && 'flex items-center gap-3 p-3'
      )}
    >
      {compact ? (
        <>
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
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
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate text-sm">{resource.title_ar}</h4>
            <p className="text-xs text-muted-foreground truncate">{resource.title}</p>
          </div>
          <div className="flex items-center gap-1">
            {/* زر الحفظ في الوضع المصغر */}
            <Button size="icon" variant="ghost" onClick={handleToggleSave} className="h-8 w-8">
              <Bookmark className={cn('h-4 w-4', saved && 'fill-primary text-primary')} />
            </Button>
            <Button size="icon" variant="ghost" asChild className="h-8 w-8">
              <a href={resource.mega_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
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
                <Download className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
            <div className="absolute top-2 right-2 flex gap-2">
               <Button 
                variant="secondary" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{resource.title_ar}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{resource.title}</p>
            
            <div className="flex items-center gap-2">
              <Button asChild className="flex-1 gap-2 shadow-sm">
                <a href={resource.mega_link} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                  تحميل
                </a>
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleSave}
                className={cn('transition-all duration-300', saved && 'text-primary border-primary bg-primary/5')}
              >
                <motion.div
                  animate={saved ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Bookmark className={cn('h-4 w-4', saved && 'fill-primary')} />
                </motion.div>
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
