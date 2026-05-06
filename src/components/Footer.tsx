import { Send, MessageCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function Footer() {
  const { data: settings } = useSiteSettings();

  return (
    <motion.footer 
      className="border-t border-border bg-card"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="container py-12">
        <motion.div 
          className="grid gap-8 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* About */}
          <motion.div variants={itemVariants}>
            <motion.h3 
              className="text-lg font-bold text-primary mb-4"
              whileHover={{ x: 5 }}
            >
              آفاق قرآنية
            </motion.h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              منصة موارد إسلامية متخصصة في توفير المحتوى الإسلامي للمصممين وصناع المحتوى.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-primary mb-4">تواصل معنا</h3>
            <div className="flex flex-wrap gap-2">
              {settings?.telegram && (
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-2"
                  >
                    <a href={settings.telegram} target="_blank" rel="noopener noreferrer">
                      <Send className="h-4 w-4" />
                      تيليجرام
                    </a>
                  </Button>
                </motion.div>
              )}
              {settings?.whatsapp && (
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-2"
                  >
                    <a href={settings.whatsapp} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      واتساب
                    </a>
                  </Button>
                </motion.div>
              )}
              {settings?.email && (
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-2"
                  >
                    <a href={`mailto:${settings.email}`}>
                      <Mail className="h-4 w-4" />
                      البريد
                    </a>
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-primary mb-4">إخلاء المسؤولية</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              المحتوى الإسلامي مقدم للمنفعة الدينية. جميع الأصول مملوكة لمنشئيها الأصليين.
            </p>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-8 pt-8 border-t border-border text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} آفاق قرآنية. جميع الحقوق محفوظة.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
