// src/components/SearchBot.tsx (جزء البحث المصلح)
const searchResults = useMemo(() => {
  if (!query.trim() || !resources) return [];
  return resources.filter((resource) => {
    // التأكد من البحث في العناوين العربية والإنجليزية
    const titleAr = resource.title_ar?.toLowerCase() || "";
    const titleEn = resource.title?.toLowerCase() || "";
    const searchLow = query.toLowerCase();
    return titleAr.includes(searchLow) || titleEn.includes(searchLow);
  });
}, [query, resources]);

const handleSearch = () => {
  if (query.trim()) {
    setHasSearched(true);
    setRequestSubmitted(false);
    // تسجيل عملية البحث في الكونسول للتأكد
    console.log("Searching for:", query);
  }
};

const handleSubmitRequest = async () => {
  if (!query.trim() || isSubmitting) return;
  setIsSubmitting(true);
  try {
    // إرسال طلب البحث للأدمن في جدول requests في Supabase
    const { error } = await supabase
      .from('requests')
      .insert({ search_query: query.trim() });
    
    if (error) throw error;
    setRequestSubmitted(true);
    toast.success("تم إرسال طلبك بنجاح للأدمن");
  } catch (error) {
    console.error('Error submitting request:', error);
    toast.error("فشل إرسال الطلب، حاول مرة أخرى");
  } finally {
    setIsSubmitting(false);
  }
};
