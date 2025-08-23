# Generate some mock user data

import sqlite3

DB_PATH = "database.db"


def insert_farmer_details():
    farmers = [
        ("TEST001","Jit Debnath", 22, "Nadia, West Bengal, India."),
        ("TEST002","Arun Bhaskar", 28, "South 24 Pargana, India."),
        ("TEST003","Narendra Modi", 70, "Murshidabad, India."),
        ("TEST004","Mukesh Ambani", 60, "Nadia, India.")
    ]

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            location TEXT NOT NULL
        )
    """
    )

    cursor.executemany(
        "INSERT INTO user (user_id, name, age, location) VALUES (?, ?, ?, ?)", farmers
    )

    conn.commit()
    conn.close()
    print(f"Inserted {len(farmers)} farmer details into the database.")


if __name__ == "__main__":
    insert_farmer_details()
