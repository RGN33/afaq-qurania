from http.server import BaseHTTPRequestHandler
import json
import yt_dlp

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        video_url = data.get('url')

        # إعدادات متقدمة لتخطي حظر الـ IP
        ydl_opts = {
            'format': 'best',
            'quiet': True,
            'no_warnings': True,
            # محاكاة متصفح حقيقي بالكامل
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
                'Sec-Fetch-Mode': 'navigate',
                'Referer': 'https://www.tiktok.com/',
                'Origin': 'https://www.tiktok.com/',
            }
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                # تيك توك يوفر الرابط المباشر في خانة url أو entries
                download_link = info.get('url') or info.get('entries', [{}])[0].get('url')
                
            if not download_link:
                raise Exception("لم نتمكن من العثور على رابط تحميل مباشر")

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'download_link': download_link}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            # إرجاع رسالة الخطأ لتظهر في الموقع
            self.wfile.write(json.dumps({'error': str(e)}).encode())
