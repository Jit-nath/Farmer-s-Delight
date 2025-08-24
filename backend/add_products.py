#  to generate some mock product data
import sqlite3

DB_PATH = "./database.db"  # Change path if needed


def insert_farmer_products():
    products = [
        (
            "Tractor",
            1199999.00,
            "Heavy-duty tractor for plowing and hauling",
            "https://picsum.photos/200/300",
            4.5,
            127,
            23,
        ),
        (
            "Irrigation Pump",
            19999.00,
            "Electric water pump for field irrigation",
            "https://picsum.photos/200/300",
            4.2,
            89,
            156,
        ),
        (
            "Fertilizer - Organic",
            249.50,
            "20kg organic fertilizer for crop growth",
            "https://picsum.photos/200/300",
            4.8,
            203,
            342,
        ),
        (
            "Wheat Seeds",
            99.00,
            "High-yield wheat seeds, 10kg pack",
            "https://picsum.photos/200/300",
            4.6,
            156,
            278,
        ),
        (
            "Pesticide Spray Kit",
            1759.00,
            "Handheld pesticide sprayer, 15L capacity",
            "https://picsum.photos/200/300",
            3.9,
            67,
            89,
        ),
        (
            "Solar Water Pump",
            96499.00,
            "Eco-friendly solar-powered water pump",
            "https://picsum.photos/200/300",
            4.7,
            98,
            45,
        ),
        (
            "Harvesting Sickle",
            59.00,
            "Traditional sickle for manual harvesting",
            "https://picsum.photos/200/300",
            4.3,
            134,
            234,
        ),
        (
            "Drip Irrigation Kit",
            1990.00,
            "Complete drip irrigation setup for 1 acre",
            "https://picsum.photos/200/300",
            4.4,
            76,
            67,
        ),
        (
            "Cow Feed - Nutritional Mix",
            239.00,
            "Balanced diet mix for dairy cows, 25kg bag",
            "https://picsum.photos/200/300",
            4.6,
            145,
            189,
        ),
        (
            "Greenhouse Film",
            1599.00,
            "UV-protected greenhouse covering film, 200 microns",
            "https://picsum.photos/200/300",
            4.1,
            82,
            56,
        ),
    ]
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            image_url TEXT,
            rating REAL NOT NULL,
            reviews REAL NOT NULL,
            sold INTEGER NOT NULL
        )
    """
    )
    cursor.executemany(
        "INSERT INTO products (name, price, description, image_url, rating, reviews, sold) VALUES (?, ?, ?, ?, ?, ?, ?)",
        products,
    )
    conn.commit()
    conn.close()
    print(
        f"Inserted {len(products)} farmer products with ratings, reviews, and sold count into the database."
    )


if __name__ == "__main__":
    insert_farmer_products()
