import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme";

// استيراد الصفحات الأساسية
import Index from "./pages/Index";
import Category from "./pages/Category";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import Saved from "./pages/Saved"; 
import ColorExtractor from "./pages/ColorExtractor"; // ✨ السطر المضاف لتعريف أداة الألوان
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* الصفحة الرئيسية */}
            <Route path="/" element={<Index />} />
            
            {/* صفحات الأقسام والمحتوى */}
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/color-extractor" element={<ColorExtractor />} /> {/* ✨ تعريف رابط أداة الألوان */}
            
            {/* صفحات الإدارة */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            
            {/* صفحة الخطأ 404 - يجب أن تكون دائماً في الأخير */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
