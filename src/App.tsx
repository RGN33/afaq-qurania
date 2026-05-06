import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme";

// استيراد الصفحات الأساسية
import Index from "./pages/Index";

// Lazy-loaded routes
const Category = React.lazy(() => import("./pages/Category"));
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const Admin = React.lazy(() => import("./pages/Admin"));
const Saved = React.lazy(() => import("./pages/Saved"));
const ColorExtractor = React.lazy(() => import("./pages/ColorExtractor"));
const FontPreview = React.lazy(() => import("./pages/FontPreview"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <Routes>
              {/* الصفحة الرئيسية */}
              <Route path="/" element={<Index />} />
              
              {/* صفحات الأقسام والمحتوى والأدوات */}
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/color-extractor" element={<ColorExtractor />} />
              <Route path="/font-preview" element={<FontPreview />} />
              
              {/* صفحات الإدارة */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={<Admin />} />
              
              {/* صفحة الخطأ 404 - يجب أن تكون دائماً في الأخير */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
