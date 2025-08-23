from flask import Blueprint, jsonify, request
import sqlite3
import os

products_bp = Blueprint("products", __name__)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "database.db")


# establish connection
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# GET all products
@products_bp.route("/", methods=["GET"])
def get_products():
    conn = get_db_connection()
    products = conn.execute("SELECT * FROM products").fetchall()
    conn.close()
    return jsonify([dict(product) for product in products])


# GET product by id
@products_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    conn = get_db_connection()
    product = conn.execute(
        "SELECT * FROM products WHERE id = ?", (product_id,)
    ).fetchone()
    conn.close()
    if product:
        return jsonify(dict(product))
    return jsonify({"error": "Product not found"}), 404
