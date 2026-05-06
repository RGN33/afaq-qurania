import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { ResourceCard } from '@/components/ResourceCard';
import { useCategories } from '@/hooks/useCategories';
import { useResources } from '@/hooks/useResources';
import { Button } from '@/components/ui/button';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories } = useCategories();
  const category = categories?.find((c) => c.slug === slug);
  const { data: resources, isLoading } = useResources(category?.id);

  if (!category && !isLoading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            القسم غير موجود
          </h1>
          <Button asChild>
            <Link to="/">العودة للرئيسية</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span className="text-foreground">{category?.name_ar}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {category?.name_ar}
            </h1>
            <p className="text-muted-foreground">
              تصفح مجموعتنا من {category?.name_ar}
            </p>
          </div>

          {/* Resources Grid */}
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-xl bg-secondary animate-pulse"
                />
              ))}
            </div>
          ) : resources?.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <ResourceCard resource={resource} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                لا توجد موارد في هذا القسم حتى الآن
              </p>
              <Button asChild variant="outline">
                <Link to="/">تصفح الأقسام الأخرى</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
