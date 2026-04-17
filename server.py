#!/usr/bin/env python3
"""
Simple HTTP Server for Day Planner App
Run this script to serve the app locally on your network
"""

import http.server
import socketserver
import webbrowser
import socket
import sys
from pathlib import Path

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers to prevent caching
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()

def get_local_ip():
    """Get the local IP address of the machine"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Connect to a public DNS server (doesn't actually send data)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "localhost"

def main():
    # Change to the directory where this script is located
    script_dir = Path(__file__).parent
    import os
    os.chdir(script_dir)
    
    local_ip = get_local_ip()
    
    print("=" * 60)
    print("📅 Day Planner - Local Server")
    print("=" * 60)
    print(f"\n✅ Server running on:")
    print(f"   • Local:     http://localhost:{PORT}")
    print(f"   • Network:   http://{local_ip}:{PORT}")
    print(f"\n📱 To access from iPad:")
    print(f"   1. Make sure your iPad is on the same WiFi network")
    print(f"   2. Open Safari and go to: http://{local_ip}:{PORT}")
    print(f"\n💡 Tips:")
    print(f"   • You can also add this to your iPad home screen")
    print(f"   • Tasks will sync across devices on the same browser/localStorage")
    print(f"   • Press Ctrl+C to stop the server")
    print("=" * 60 + "\n")
    
    # Try to open in default browser
    try:
        webbrowser.open(f'http://localhost:{PORT}')
        print("Opening in your default browser...\n")
    except:
        pass
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 Server stopped")
            sys.exit(0)

if __name__ == "__main__":
    main()
