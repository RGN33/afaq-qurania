import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { SearchBot } from '@/components/SearchBot';
import { CategoryGrid } from '@/components/CategoryGrid';
import { LatestResources } from '@/components/LatestResources';

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <motion.div 
          className="absolute inset-0 islamic-pattern opacity-50"
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center mb-12"
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.span
                animate={{ 
                  textShadow: [
                    "0 0 0px transparent",
                    "0 0 20px rgba(27, 67, 50, 0.2)",
                    "0 0 0px transparent",
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                آفاق قرآنية
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              مكتبتك الشاملة للموارد الإسلامية - خطوط، فيديوهات، تأثيرات والمزيد
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <SearchBot />
          </motion.div>
        </div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/5 blur-xl"
          animate={{ 
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-accent/10 blur-xl"
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 7, repeat: Infinity }}
        />
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2 
              className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              الأقسام
            </motion.h2>
            <CategoryGrid />
          </motion.div>
        </div>
      </section>

      {/* Latest Resources Section */}
      <section className="py-12 md:py-16 bg-secondary/30 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2 
              className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              آخر الإضافات
            </motion.h2>
            <LatestResources />
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
