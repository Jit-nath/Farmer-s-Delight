import socket
from flask import Flask
from flask_socketio import SocketIO
from videos.route import videos_bp

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        print("Could not determine local IP using localhost")
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip

localIP = get_local_ip()
port = 5000

app = Flask(__name__)
app.register_blueprint(videos_bp, url_prefix="/videos")

socketio = SocketIO(app, cors_allowed_origins="*")

if __name__ == "__main__":
    print(f"Starting server at http://{localIP}:{port}")
    socketio.run(app, host="0.0.0.0", port=port)
    print("Server started successfully.")