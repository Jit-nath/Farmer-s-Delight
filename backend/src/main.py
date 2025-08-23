import socket
from flask import Flask
from flask_socketio import SocketIO
from videos.route import videos_bp

from marketplace.route import products_bp
from home.route import home_bp
from chat.route import chat_bp, socketio
from user.route import user_bp


# Helper to get LAN IP
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
app.register_blueprint(products_bp, url_prefix="/products")
app.register_blueprint(chat_bp, url_prefix="/chat")
app.register_blueprint(user_bp, url_prefix="/user")
app.register_blueprint(home_bp, url_prefix="/")

socketio.init_app(
    app,
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
    async_mode="threading",
    ping_timeout=60,
    ping_interval=25,
    transports=["polling", "websocket"],
    allow_upgrades=True,
    cookie=False,
)

if __name__ == "__main__":
    print(f"Starting server at http://{localIP}:{port}")
    socketio.run(app, host="0.0.0.0", port=port, debug=True, allow_unsafe_werkzeug=True)
