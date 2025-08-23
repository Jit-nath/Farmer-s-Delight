# create-bank-details.py
import sqlite3

DB_PATH = "database.db"


def insert_bank_details():
    bank_details = {
        1: {
            "customer_name": "Jit Debnath",
            "age": 22,
            "address": "Nadia, West Bengal, India",
            "account_number": "37693580219",
            "ifsc_code": "SBIN0000456",
            "branch": "Nadia Main Branch",
            "account_type": "Savings Account",
            "balance": 125000.50,
            "currency": "INR",
            "customer_id": "SBIX001234",
            "micr_code": "741002001",
            "branch_address": "College Para, Krishnagar, Nadia - 741101",
            "loan_amount": 500000.00,
            "government_subsidy": 25000.00,
            "loan_type": "Crop Cultivation Loan",
        },
        2: {
            "customer_name": "Arun Bhaskar",
            "age": 28,
            "address": "South 24 Pargana, West Bengal, India",
            "account_number": "52019843761",
            "ifsc_code": "SBIN0000789",
            "branch": "Baruipur Branch",
            "account_type": "Current Account",
            "balance": 2876340.25,
            "currency": "INR",
            "customer_id": "SBIX005678",
            "micr_code": "700144001",
            "branch_address": "Baruipur Station Road, South 24 Parganas - 700144",
            "loan_amount": 800000.00,
            "government_subsidy": 0.00,
            "loan_type": "Farm Equipment Loan",
        },
        3: {
            "customer_name": "Narendra Modi",
            "age": 70,
            "address": "Murshidabad, West Bengal, India",
            "account_number": "91432056718",
            "ifsc_code": "SBIN0000234",
            "branch": "Baharampur Branch",
            "account_type": "Pension Account",
            "balance": 75680.75,
            "currency": "INR",
            "customer_id": "SBIX009876",
            "micr_code": "742101001",
            "branch_address": "N.H. 34, Baharampur, Murshidabad - 742101",
            "loan_amount": 1000000.00,
            "government_subsidy": 10000.00,
            "loan_type": "Agricultural Loan",
        },
        4: {
            "customer_name": "Mukesh Ambani",
            "age": 60,
            "address": "Nadia, West Bengal, India",
            "account_number": "65328019427",
            "ifsc_code": "SBIN0000678",
            "branch": "Kalyani Branch",
            "account_type": "Premium Account",
            "balance": 10000000.00,
            "currency": "INR",
            "customer_id": "SBIX004321",
            "micr_code": "741235001",
            "branch_address": "Kalyani Central Plaza, Nadia - 741235",
            "loan_amount": 20000000.00,
            "government_subsidy": 500000.00,
            "loan_type": "Agribusiness Expansion Loan",
        },
    }

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS bank_details (
            user_id INTEGER PRIMARY KEY,
            customer_name TEXT NOT NULL,
            age INTEGER NOT NULL,
            address TEXT NOT NULL,
            account_number TEXT UNIQUE NOT NULL,
            ifsc_code TEXT NOT NULL,
            branch TEXT NOT NULL,
            account_type TEXT NOT NULL,
            balance REAL NOT NULL,
            currency TEXT NOT NULL,
            customer_id TEXT NOT NULL,
            micr_code TEXT NOT NULL,
            branch_address TEXT NOT NULL,
            loan_amount REAL NOT NULL,
            government_subsidy REAL NOT NULL,
            loan_type TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES user (id)
        )
    """
    )

    for user_id, details in bank_details.items():
        cursor.execute(
            """
            INSERT OR REPLACE INTO bank_details 
            (user_id, customer_name, age, address, account_number, ifsc_code, branch, 
             account_type, balance, currency, customer_id, micr_code, branch_address, 
             loan_amount, government_subsidy, loan_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                details["customer_name"],
                details["age"],
                details["address"],
                details["account_number"],
                details["ifsc_code"],
                details["branch"],
                details["account_type"],
                details["balance"],
                details["currency"],
                details["customer_id"],
                details["micr_code"],
                details["branch_address"],
                details["loan_amount"],
                details["government_subsidy"],
                details["loan_type"],
            ),
        )

    conn.commit()
    conn.close()
    print(f"Inserted/Updated {len(bank_details)} bank details into the database.")


if __name__ == "__main__":
    insert_bank_details()
