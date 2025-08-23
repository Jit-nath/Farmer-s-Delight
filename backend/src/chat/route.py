import json
from flask import Blueprint
from flask_socketio import SocketIO, send
from model.model import model as chat_model  # alias to avoid shadowing

chat_bp = Blueprint("chat", __name__)
socketio = SocketIO()


def process_message(msg: dict) -> dict:
    """Wrapper around chat_model to handle user message dicts."""
    user_id = msg.get("userID")
    context = msg.get("context", "")

    answer = chat_model(context, session_id=user_id)  # type: ignore

    return {"userID": user_id, "context": answer}


@socketio.on("message", namespace="/chat")
def handle_message(msg: dict):
    """Handles incoming WebSocket messages."""
    result = process_message(msg)
    response_data = {
        "answer": result["context"],
        "status": "success",
        "userID": result["userID"],
    }
    send(json.dumps(response_data), namespace="/chat")
