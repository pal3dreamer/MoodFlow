import http.server
import socketserver
import sys

PORT = 7860

class DummyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        html = """
        <html>
            <head><title>Starting Service...</title></head>
            <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                <h1>Service is starting...</h1>
                <p>Downloading AI models in the background. Please wait.</p>
                <p>Once finished, this space will proxy to the main API.</p>
            </body>
        </html>
        """
        self.wfile.write(html.encode('utf-8'))

# Run server
try:
    with socketserver.TCPServer(("", PORT), DummyHandler) as httpd:
        print(f"Dummy server running at port {PORT}")
        httpd.serve_forever()
except Exception as e:
    print(f"Failed to start dummy server: {e}")
