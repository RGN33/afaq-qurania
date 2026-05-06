'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Type, ArrowRight, RefreshCw, Sliders, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function FontPreview() {
  const [text, setText] = useState('آفاق قرآنية: الجمال في التفاصيل');
  const [fontSize, setFontSize] = useState(60);
  const [fontFamily, setFontFamily] = useState('inherit');
  const [fontName, setFontName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // دالة معالجة رفع ملف الخط
  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التأكد أن الملف هو ملف خط
      if (!file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
        toast.error("يرجى رفع ملف خط صحيح (TTF, OTF)");
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const fontData = event.target?.result as string;
        const customFontName = `CustomFont_${Date.now()}`;
        
        try {
          // تسجيل الخط في المتصفح برمجياً
          const fontFace = new FontFace(customFontName, `url(${fontData})`);
          await fontFace.load();
          document.fonts.add(fontFace);
          
          setFontFamily(customFontName);
          setFontName(file.name);
          setIsUploading(false);
          toast.success("تم رفع الخط وتفعيله بنجاح!");
        } catch (err) {
          toast.error("حدث خطأ أثناء تحميل الخط");
          setIsUploading(false);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 text-right" dir="rtl">
      {/* Header القسم - نفس ستايل مستخرج الألوان */}
      <section className="relative py-16 overflow-hidden bg-primary/5 border-b border-border">
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        <div className="container relative z-10 text-center px-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Type className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold text-foreground mb-3">معاينة الخطوط الخاصة</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">ارفع ملف الخط من جهازك وقم بتجربته فوراً قبل استخدامه في تصاميمك</p>
        </div>
      </section>

      <div className="container py-12 px-4 max-w-5xl">
        <div className="grid gap-8 md:grid-cols-3">
          
          {/* الجانب الأيمن: التحكم والرفع */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <div className="w-2 h-8 bg-primary rounded-full" />
              إعدادات المعاينة
            </h3>

            {/* منطقة الرفع */}
            <motion.div layout className="glass-card p-6 rounded-3xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center relative overflow-hidden bg-white/5">
              <input type="file" onChange={handleFontUpload} className="hidden" id="font-upload" accept=".ttf,.otf,.woff,.woff2" />
              <AnimatePresence mode="wait">
                {fontName ? (
                  <motion.div key="font-loaded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Type className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm truncate max-w-[150px]">{fontName}</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">تم التحميل</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('font-upload')?.click()} className="rounded-full gap-2 text-[10px]">
                      <RefreshCw className="h-3 w-3" /> تغيير الخط
                    </Button>
                  </motion.div>
                ) : (
                  <motion.label key="placeholder" htmlFor="font-upload" className="cursor-pointer flex flex-col items-center gap-4 text-center p-4">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center animate-pulse">
                      <Upload className="h-8 w-8 text-primary opacity-40" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-sm">ارفع ملف الخط</p>
                      <p className="text-[10px] text-muted-foreground">TTF, OTF مدعوم</p>
                    </div>
                  </motion.label>
                )}
              </AnimatePresence>
            </motion.div>

            {/* التحكم في الحجم */}
            <div className="glass-card p-6 rounded-3xl border border-border space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold flex items-center gap-2"><Sliders className="h-3 w-3" /> حجم الخط</span>
                <span className="text-xs font-mono text-primary">{fontSize}px</span>
              </div>
              <input 
                type="range" min="20" max="150" value={fontSize} 
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-primary/10 rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          {/* الجانب الأيسر: منطقة الكتابة والمعاينة */}
          <div className="md:col-span-2 space-y-6">
             <div className="glass-card rounded-[2.5rem] border border-border overflow-hidden">
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="اكتب شيئاً هنا..."
                  className="w-full p-6 bg-transparent border-none outline-none text-right min-h-[120px] text-lg resize-none"
                />
             </div>

             <motion.div 
               layout
               className="glass-card rounded-[2.5rem] border border-primary/10 min-h-[300px] flex items-center justify-center p-10 bg-white/5 relative group"
             >
                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-[10px] text-primary font-bold bg-primary/10 px-3 py-1 rounded-full border border-primary/20 flex items-center gap-2">
                     <RefreshCw className="h-3 w-3" /> معاينة حية
                   </p>
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={fontFamily + fontSize}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ 
                      fontFamily: fontFamily, 
                      fontSize: `${fontSize}px`,
                      lineHeight: 1.5 
                    }}
                    className="text-center break-words w-full"
                  >
                    {text}
                  </motion.p>
                </AnimatePresence>
             </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
