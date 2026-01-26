'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Type, 
  ArrowRight, 
  Download, 
  Maximize2, 
  Settings2, 
  Palette,
  Layout
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ARABIC_FONTS = [
  { name: 'خط تجوال', family: "'Tajawal', sans-serif" },
  { name: 'خط الأميري', family: "'Amiri', serif" },
  { name: 'خط كايرو', family: "'Cairo', sans-serif" },
  { name: 'خط المراعى', family: "'Almarai', sans-serif" },
  { name: 'خط نوتو', family: "'Noto Naskh Arabic', serif" },
];

export default function FontPreview() {
  const [text, setText] = useState('آفاق قرآنية: جمال التصميم وروح الإبداع');
  const [fontSize, setFontSize] = useState(48);
  const [selectedFont, setSelectedFont] = useState(ARABIC_FONTS[0].family);

  return (
    <div className="min-h-screen bg-[#050c0a] text-emerald-50 p-4 sm:p-10 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* الرأس (Header) */}
        <div className="flex items-center justify-between">
          <Link to="/" className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-emerald-900/20 transition-all">
            <ArrowRight className="h-6 w-6" />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Type className="h-8 w-8 text-emerald-500" />
              معاينة الخطوط العربية
            </h1>
            <p className="text-[10px] text-emerald-500/60 uppercase tracking-[0.3em] mt-1">Font Typography Preview</p>
          </div>
          <div className="w-12 h-12" /> {/* موازن بصري */}
        </div>

        {/* لوحة التحكم (Control Panel) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/10 shadow-2xl space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-emerald-500/80 mr-2">نص المعاينة</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-black/40 border-none ring-1 ring-white/10 rounded-2xl p-5 text-xl text-center focus:ring-emerald-500/50 outline-none transition-all resize-none h-32"
                placeholder="اكتب النص هنا..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center px-2">
                  <label className="text-xs font-bold text-emerald-500/80">حجم الخط</label>
                  <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">{fontSize}px</span>
                </div>
                <input 
                  type="range" min="16" max="150" value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/10 shadow-2xl flex flex-col gap-4">
            <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
              <Layout className="h-4 w-4 text-emerald-500" />
              اختر الخط
            </h4>
            <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {ARABIC_FONTS.map((font) => (
                <button
                  key={font.family}
                  onClick={() => setSelectedFont(font.family)}
                  style={{ fontFamily: font.family }}
                  className={`w-full p-4 rounded-2xl text-right transition-all border ${
                    selectedFont === font.family 
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/20 scale-[1.02]' 
                    : 'bg-black/20 text-emerald-100/60 border-white/5 hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg">{font.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* منطقة المعاينة الكبيرة (Main Preview) */}
        <motion.div 
          layout
          className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 sm:p-20 border border-white/10 shadow-2xl min-h-[300px] flex items-center justify-center relative overflow-hidden group"
        >
          <div className="absolute top-6 left-6 flex gap-2">
            <button className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-emerald-500/20 text-emerald-500 transition-all opacity-0 group-hover:opacity-100">
              <Maximize2 className="h-5 w-5" />
            </button>
            <button className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-emerald-500/20 text-emerald-500 transition-all opacity-0 group-hover:opacity-100">
              <Download className="h-5 w-5" />
            </button>
          </div>
          
          <motion.p 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={`${selectedFont}-${fontSize}`}
            style={{ 
              fontFamily: selectedFont,
              fontSize: `${fontSize}px`,
              lineHeight: 1.4
            }}
            className="text-center leading-relaxed drop-shadow-2xl"
          >
            {text}
          </motion.p>
        </motion.div>

        {/* تذييل الصفحة */}
        <div className="text-center py-6">
          <p className="text-[9px] text-emerald-500/40 font-bold tracking-[0.4em] uppercase">Afaq Qurania Design Assets • 2026</p>
        </div>
      </div>
    </div>
  );
}
