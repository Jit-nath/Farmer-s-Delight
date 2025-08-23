from flask import Blueprint, jsonify, request

home_bp = Blueprint("home", __name__)


# GET all products
@home_bp.route("/", methods=["GET"])
def get_products():
    return jsonify(
        "Home URL",
        {
            "URL_LISTS": {
                "products": "/products",
                "chat": "/chat",
            }
        },
    )
