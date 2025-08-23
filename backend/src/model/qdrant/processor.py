import pandas as pd
import os
from langchain_qdrant import QdrantVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

# Configuration
EXCEL_PATH = "./knowledge.xlsx"
MODEL_NAME = "BAAI/bge-large-en"
QDRANT_URL = "http://localhost:6333"
COLLECTION_NAME = "agriculture_knowledge"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

COLUMN_NAMES = [
    "Sl No.",
    "Year",
    "Month",
    "Day",
    "State",
    "District",
    "Sector",
    "Season",
    "Crop",
    "Sl No.-Q",
    "Question",
    "Sl No.-A",
    "Answer",
]


def main():
    if not os.path.exists(EXCEL_PATH):
        raise FileNotFoundError(f"Excel file not found at {EXCEL_PATH}")

    print("Loading and processing Excel knowledge base...")

    # Read and process all sheets
    try:
        xls = pd.ExcelFile(EXCEL_PATH)
        sheet_names = xls.sheet_names
        print(f"Found {len(sheet_names)} sheets in the Excel file: {sheet_names}")

        # Read and combine all sheets with proper column names
        all_sheets = []
        for sheet in sheet_names:
            # Read sheet without header and assign custom column names
            sheet_df = pd.read_excel(xls, sheet_name=sheet, header=None)

            # Assign column names only if we have the expected number of columns
            if len(sheet_df.columns) == len(COLUMN_NAMES):
                sheet_df.columns = COLUMN_NAMES
                print(f"   Sheet '{sheet}' loaded with {len(sheet_df)} rows")
                all_sheets.append(sheet_df)
            else:
                print(
                    f"   Sheet '{sheet}' has {len(sheet_df.columns)} columns (expected {len(COLUMN_NAMES)}). Skipping."
                )

        # Combine all valid sheets
        if all_sheets:
            df = pd.concat(all_sheets, ignore_index=True)
        else:
            raise ValueError("No valid sheets found with correct column structure")

    except Exception as e:
        print(f" Error processing Excel file: {e}")
        print(" Trying fallback method...")
        # Fallback: try reading as single sheet
        df = pd.read_excel(EXCEL_PATH, header=None)
        if len(df.columns) == len(COLUMN_NAMES):
            df.columns = COLUMN_NAMES
        else:
            print(
                f" Fallback failed. Found {len(df.columns)} columns (expected {len(COLUMN_NAMES)})"
            )
            raise

    # Clean and prepare the data
    df = clean_dataframe(df)

    # Create meaningful content from the key columns
    print("Creating meaningful content from key columns...")
    df["content"] = df.apply(
        lambda row: (
            f"Crop: {row['Crop']} | "
            f"State: {row['State']}, District: {row['District']} | "
            f"Season: {row['Season']} | "
            f"Question: {row['Question']} | "
            f"Answer: {row['Answer']}"
        ),
        axis=1,
    )

    # Extract metadata
    print("Extracting metadata...")
    metadata_columns = [
        "Sl No.",
        "Year",
        "Month",
        "Day",
        "State",
        "District",
        "Sector",
        "Season",
        "Crop",
        "Sl No.-Q",
        "Sl No.-A",
    ]
    df["metadata"] = df[metadata_columns].to_dict(orient="records")

    # Ensure we have valid content
    if df.empty:
        print(" No valid data found after processing. Exiting.")
        return

    print(f" Processed {len(df)} agriculture knowledge entries")

    # Convert to LangChain documents
    documents = [
        Document(page_content=row["content"], metadata=row["metadata"])
        for _, row in df.iterrows()
    ]
    print(f" Created {len(documents)} documents")

    # Split documents into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Split into {len(chunks)} knowledge chunks")

    # Initialize embeddings
    embeddings = HuggingFaceEmbeddings(
        model_name=MODEL_NAME,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": False},
    )
    print(" Embedding model loaded")

    # Create vector store
    print(" Storing vectors in Qdrant...")
    QdrantVectorStore.from_documents(
        chunks,
        embeddings,
        url=QDRANT_URL,
        collection_name=COLLECTION_NAME,
        prefer_grpc=False,
        force_recreate=True,
    )
    print(f" Agriculture knowledge stored! Collection: {COLLECTION_NAME}")


def clean_dataframe(df):
    # Fill NaN values with empty strings
    df = df.fillna("")

    # Convert all columns to string to avoid type issues
    for col in df.columns:
        df[col] = df[col].astype(str).str.strip()

    # Remove empty rows where all columns are empty
    df = df[df.astype(bool).any(axis=1)]

    return df


if __name__ == "__main__":
    main()