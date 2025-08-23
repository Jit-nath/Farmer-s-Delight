import socket
from flask import Flask
from marketplace.route import products_bp
from home.route import home_bp
from chat.route import chat_bp, socketio
from users.route import user_bp
from videos.route import videos_bp


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
app.register_blueprint(products_bp, url_prefix="/products")
app.register_blueprint(chat_bp, url_prefix="/chat")
app.register_blueprint(user_bp, url_prefix="/user")
app.register_blueprint(videos_bp, url_prefix="/videos")
app.register_blueprint(home_bp, url_prefix="/")

socketio.init_app(
    app,
    cors_allowed_origins="*",
    transports=["polling", "websocket"],  # type: ignore
)

if __name__ == "__main__":
    print(f"Starting server at http://{localIP}:{port}")
    socketio.run(app, host="0.0.0.0", port=port, debug=False)
