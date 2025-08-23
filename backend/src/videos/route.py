import os
from flask import Blueprint, jsonify, send_from_directory

videos_bp = Blueprint('videos', __name__)

VIDEO_FOLDER = os.path.join(os.path.dirname(__file__), "files")

@videos_bp.route("/")
def list_videos():
    files = os.listdir(VIDEO_FOLDER)
    
    video_files = [f for f in files if os.path.isfile(os.path.join(VIDEO_FOLDER, f)) and f.endswith('.mp4')]
    return jsonify([f"/videos/{filename}" for filename in video_files])

@videos_bp.route("/<path:filename>")
def get_video(filename):
    return send_from_directory(VIDEO_FOLDER, filename)