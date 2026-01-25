import json
from http.server import BaseHTTPRequestHandler
import urllib.request

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        input_url = json.loads(post_data).get('url')

        try:
            # 1. المرحلة الأولى: فك تشفير الرابط المختصر خلف الكواليس
            # نستخدم User-Agent محترف لمنع الحظر أثناء التتبع
            req = urllib.request.Request(
                input_url, 
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            )
            
            with urllib.request.urlopen(req) as resp:
                # هذا هو الرابط الطويل الحقيقي بعد التوجيه
                final_long_url = resp.geturl()

            # 2. المرحلة الثانية: إرسال الرابط الطويل لـ TikWM
            api_url = f"https://www.tikwm.com/api/?url={final_long_url}"
            api_req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
            
            with urllib.request.urlopen(api_req) as api_resp:
                data = json.loads(api_resp.read().decode())
                
            # إرجاع النتيجة النهائية
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'download_link': data['data']['play']}).encode())
            
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({'error': "فشل في تتبع الرابط، تأكد من صحته"}).encode())
