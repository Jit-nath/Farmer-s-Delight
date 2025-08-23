#  to generate some mock product data

import sqlite3

DB_PATH = "./database.db"  # Change path if needed

def insert_farmer_products():
    products = [
        ("Tractor", 15000.00, "Heavy-duty tractor for plowing and hauling"),
        ("Irrigation Pump", 450.00, "Electric water pump for field irrigation"),
        ("Fertilizer - Organic", 25.50, "20kg organic fertilizer for crop growth"),
        ("Wheat Seeds", 12.00, "High-yield wheat seeds, 10kg pack"),
        ("Pesticide Spray Kit", 85.00, "Handheld pesticide sprayer, 15L capacity"),
        ("Solar Water Pump", 1200.00, "Eco-friendly solar-powered water pump"),
        ("Harvesting Sickle", 7.50, "Traditional sickle for manual harvesting"),
        ("Drip Irrigation Kit", 250.00, "Complete drip irrigation setup for 1 acre"),
        ("Cow Feed - Nutritional Mix", 30.00, "Balanced diet mix for dairy cows, 25kg bag"),
        ("Greenhouse Film", 200.00, "UV-protected greenhouse covering film, 200 microns")
    ]

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT
        )
    """)

    cursor.executemany(
        "INSERT INTO products (name, price, description) VALUES (?, ?, ?)",
        products
    )

    conn.commit()
    conn.close()
    print(f"Inserted {len(products)} farmer products into the database.")

if __name__ == "__main__":
    insert_farmer_products()