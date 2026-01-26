import json
from http.server import BaseHTTPRequestHandler
import requests

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # 1. قراءة الرابط المرسل من ريأكت
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            tiktok_url = data.get('url')

            if not tiktok_url:
                raise ValueError("No URL provided")

            # 2. تتبع الرابط وتنظيفه (خلف الكواليس)
            # نستخدم allow_redirects=True للوصول للرابط الأصلي
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            response = requests.head(tiktok_url, headers=headers, allow_redirects=True, timeout=10)
            
            # تنظيف الرابط من الزوائد (حذف أي شيء بعد علامة الاستفهام)
            clean_url = response.url.split('?')[0]

            # 3. إرسال الرابط النظيف للأداة الجاهزة
            api_url = f"https://www.tikwm.com/api/?url={clean_url}"
            api_response = requests.get(api_url, headers=headers, timeout=10)
            result_data = api_response.json()

            # 4. إرسال النتيجة النهائية لريأكت
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*') # لضمان عملها على الموبايل
            self.end_headers()
            
            if result_data.get('code') == 0:
                final_response = {'download_link': result_data['data']['play']}
            else:
                final_response = {'error': 'فشل الاستخراج من المصدر'}

            self.wfile.write(json.dumps(final_response).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
