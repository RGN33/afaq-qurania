import { useState, useEffect, useCallback } from 'react';
import { Resource } from './useResources'; // تأكد من استيراد النوع الصحيح
import { toast } from 'sonner'; // لإظهار رسائل نجاح للمستخدم

export function useSavedResources() {
  const [savedResources, setSavedResources] = useState<Resource[]>([]);

  // 1. تحميل المحفوظات من المتصفح عند بداية التشغيل
  useEffect(() => {
    const stored = localStorage.getItem('afaq-saved-resources');
    if (stored) {
      try {
        setSavedResources(JSON.parse(stored));
      } catch (e) {
        console.error("خطأ في قراءة المحفوظات", e);
      }
    }
  }, []);

  // 2. دالة الحفظ أو الحذف (تبديل)
  const toggleSave = useCallback((resource: Resource) => {
    setSavedResources((prev) => {
      const isAlreadySaved = prev.some((item) => item.id === resource.id);
      let newResources;

      if (isAlreadySaved) {
        // إذا كان موجود، نحذفه
        newResources = prev.filter((item) => item.id !== resource.id);
        toast.info("تم الحذف من المحفوظات");
      } else {
        // إذا مش موجود، نضيفه بالكامل
        newResources = [...prev, resource];
        toast.success("تم الحفظ في المحفوظات");
      }

      // حفظ القائمة الجديدة في ذاكرة المتصفح
      localStorage.setItem('afaq-saved-resources', JSON.stringify(newResources));
      return newResources;
    });
  }, []);

  // 3. دالة للتحقق هل العنصر محفوظ أم لا
  const isSaved = useCallback(
    (resourceId: string) => savedResources.some((item) => item.id === resourceId),
    [savedResources]
  );

  return { savedResources, toggleSave, isSaved, isLoading: false };
}
