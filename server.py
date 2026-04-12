#!/usr/bin/env python3
"""Simple HTTP server with no-cache headers to prevent browser caching during development."""
import http.server
import os

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = http.server.HTTPServer(('', 8000), NoCacheHTTPRequestHandler)
    print("Serving on http://localhost:8000 (no-cache mode)")
    server.serve_forever()
