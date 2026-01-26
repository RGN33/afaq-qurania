import axios from 'axios';

// دالة لتنظيف الرابط وفك الاختصارات (vt.tiktok)
async function getLongUrl(url) {
  try {
    const response = await axios.get(url, {
      maxRedirects: 10,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
      }
    });
    return response.request.res.responseUrl || url;
  } catch {
    return url; // إذا فشل فك الاختصار، نستخدم الرابط الأصلي
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'POST only' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, message: 'الرابط مفقود' });

  try {
    // 1. فك الرابط المختصر أولاً لضمان أفضل نتائج
    const cleanUrl = await getLongUrl(url.trim());

    // --- المصدر الأول: TikWM (الأسرع عادةً) ---
    try {
      const res1 = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`);
      if (res1.data && res1.data.code === 0) {
        return res.status(200).json({
          success: true,
          downloadLink: res1.data.data.play,
          videoInfo: { title: res1.data.data.title || 'فيديو تيك توك' },
          longUrl: cleanUrl
        });
      }
    } catch (e) { console.log("Source 1 Failed"); }

    // --- المصدر الثاني: TiklyDown (موثوق جداً) ---
    try {
      const res2 = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(cleanUrl)}`);
      if (res2.data && res2.data.video) {
        return res.status(200).json({
          success: true,
          downloadLink: res2.data.video.noWatermark || res2.data.video.watermark,
          videoInfo: { title: res2.data.title || 'فيديو تيك توك' },
          longUrl: cleanUrl
        });
      }
    } catch (e) { console.log("Source 2 Failed"); }

    // --- المصدر الثالث: عودة للمصدر الأساسي بتنسيق مختلف ---
    try {
      const res3 = await axios.post('https://api.tikwm.com/api/', new URLSearchParams({ url: cleanUrl }));
      if (res3.data && res3.data.code === 0) {
         return res.status(200).json({
           success: true,
           downloadLink: res3.data.data.play,
           videoInfo: { title: res3.data.data.title },
           longUrl: cleanUrl
         });
      }
    } catch (e) { console.log("Source 3 Failed"); }

    throw new Error('جميع المصادر لم تستجب حالياً');

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'فشل استخراج الفيديو. جرب رابطاً آخر أو تأكد أن الحساب عام.'
    });
  }
}
