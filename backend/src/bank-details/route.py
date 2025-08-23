from flask import Blueprint, jsonify
import sqlite3
import os
import logging
from contextlib import contextmanager
from functools import wraps

bank_bp = Blueprint("bank", __name__)

# Configuration
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "database.db")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@contextmanager
def get_db_connection():
    """Context manager for database connections with automatic cleanup"""
    conn = None
    try:
        if not os.path.exists(DB_PATH):
            logger.error(f"Database file not found: {DB_PATH}")
            raise FileNotFoundError(f"Database file not found: {DB_PATH}")

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row

        # Enable foreign key constraints
        conn.execute("PRAGMA foreign_keys = ON")

        yield conn
    except sqlite3.Error as e:
        logger.error(f"Database error: {e}")
        if conn:
            conn.rollback()
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()


def handle_database_errors(f):
    """Decorator to handle database errors gracefully"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except FileNotFoundError as e:
            logger.error(f"Database file error: {e}")
            return jsonify({"error": "Database unavailable"}), 503
        except sqlite3.Error as e:
            logger.error(f"Database error: {e}")
            return jsonify({"error": "Database error occurred"}), 500
        except Exception as e:
            logger.error(f"Unexpected error in {f.__name__}: {e}")
            return jsonify({"error": "Internal server error"}), 500

    return decorated_function


def validate_user_id(user_id):
    """Validate user ID parameter"""
    if not isinstance(user_id, int) or user_id <= 0:
        return False
    # Additional validation: reasonable range check
    if user_id > 2147483647:  # Max 32-bit signed integer
        return False
    return True


@bank_bp.route("/<int:user_id>", methods=["GET"])
@handle_database_errors
def get_bank_details(user_id):
    # Input validation
    if not validate_user_id(user_id):
        logger.warning(f"Invalid user ID requested: {user_id}")
        return jsonify({"error": "Invalid user ID"}), 400

    try:
        with get_db_connection() as conn:
            # Get bank details from database
            bank_details = conn.execute(
                "SELECT * FROM bank_details WHERE user_id = ?", (user_id,)
            ).fetchone()

            if bank_details:
                details_dict = dict(bank_details)
                details_dict.pop("user_id", None)

                logger.info(f"Successfully retrieved bank details for user {user_id}")
                return (
                    jsonify(
                        {
                            "user_id": user_id,
                            "bank_name": "State Bank of India",
                            "bank_details": details_dict,
                            "status": "success",
                        }
                    ),
                    200,
                )
            else:
                logger.info(f"Bank details not found for user: {user_id}")
                return (
                    jsonify({"error": "Bank details not found", "status": "error"}),
                    404,
                )

    except sqlite3.Error as e:
        logger.error(
            f"Database error occurred while retrieving bank details for user {user_id}: {e}"
        )
        return jsonify({"error": "Database error occurred"}), 500


# Health check endpoint
@bank_bp.route("/health", methods=["GET"])
def health_check():
    """Simple health check endpoint"""
    try:
        with get_db_connection() as conn:
            conn.execute("SELECT 1").fetchone()
        return jsonify({"status": "healthy", "database": "connected"}), 200
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({"status": "unhealthy", "database": "disconnected"}), 503
