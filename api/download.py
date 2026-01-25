from http.server import BaseHTTPRequestHandler
import json
import yt_dlp

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        video_url = data.get('url')

        ydl_opts = {
            'format': 'best', # طلب أفضل جودة
            'quiet': True,
            'no_warnings': True,
            # محاكاة متصفح حقيقي لتقليل احتمالية الحظر
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.tiktok.com/',
            }
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # استخراج البيانات فقط دون تحميل
                info = ydl.extract_info(video_url, download=False)
                # تيك توك يضع الرابط النقي أحياناً في 'url' أو 'formats'
                direct_link = info.get('url')
                
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'download_link': direct_link}).encode())
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({'error': "تيك توك يرفض الطلب حالياً، جرب رابطاً آخر"}).encode())
