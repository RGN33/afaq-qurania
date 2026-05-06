import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Copy, Palette, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
// @ts-ignore
import ColorThief from 'colorthief';

export default function ColorExtractor() {
  const [colors, setColors] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const rgbToHex = (r: number, g: number, b: number) => 
    '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsExtracting(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = () => {
    const colorThief = new ColorThief();
    if (imgRef.current) {
      const palette = colorThief.getPalette(imgRef.current, 6);
      const hexColors = palette.map((rgb: number[]) => rgbToHex(rgb[0], rgb[1], rgb[2]));
      setColors(hexColors);
      setIsExtracting(false);
      toast.success("تم استخراج الألوان بنجاح!");
    }
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`تم نسخ الكود: ${color}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header القسم */}
      <section className="relative py-16 overflow-hidden bg-primary/5 border-b border-border">
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        <div className="container relative z-10 text-center px-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Palette className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold text-foreground mb-3">مستخرج الألوان الذكي</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">ارفع صورتك واستخرج منها باليتة ألوان إسلامية متناسقة لتصاميمك</p>
        </div>
      </section>

      <div className="container py-12 px-4 max-w-4xl">
        <div className="grid gap-8 md:grid-cols-2">
          {/* منطقة الرفع */}
          <motion.div layout className="glass-card p-6 rounded-3xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
            <input type="file" onChange={handleImageUpload} className="hidden" id="color-upload" accept="image/*" />
            <AnimatePresence mode="wait">
              {image ? (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full h-full flex flex-col items-center">
                  <img ref={imgRef} src={image} onLoad={onImageLoad} className="max-h-64 rounded-xl object-contain shadow-2xl mb-4" crossOrigin="anonymous" />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('color-upload')?.click()} className="rounded-full gap-2">
                    <RefreshCw className="h-4 w-4" /> تغيير الصورة
                  </Button>
                </motion.div>
              ) : (
                <motion.label key="placeholder" htmlFor="color-upload" className="cursor-pointer flex flex-col items-center gap-4 text-center p-8">
                  <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center animate-bounce">
                    <Upload className="h-10 w-10 text-primary opacity-40" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-lg">اضغط لرفع الصورة</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG تصل إلى 10MB</p>
                  </div>
                </motion.label>
              )}
            </AnimatePresence>
          </motion.div>

          {/* منطقة النتائج */}
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <div className="w-2 h-8 bg-primary rounded-full" />
              باليتة الألوان المستخرجة
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <AnimatePresence>
                {colors.map((color, index) => (
                  <motion.div
                    key={color}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative flex items-center gap-3 p-3 glass-card rounded-2xl border border-border hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => copyColor(color)}
                  >
                    <div className="w-12 h-12 rounded-xl shadow-inner" style={{ backgroundColor: color }} />
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase">كود اللون</p>
                      <p className="font-mono font-bold text-sm">{color}</p>
                    </div>
                    <Copy className="h-4 w-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                  </motion.div>
                ))}
              </AnimatePresence>
              {!image && [1,2,3,4,5,6].map(i => (
                <div key={i} className="h-20 bg-secondary/30 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
