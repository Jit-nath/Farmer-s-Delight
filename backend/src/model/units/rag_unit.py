import os
from langchain_qdrant import QdrantVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from qdrant_client import QdrantClient


MODEL_NAME = os.getenv("CHAT_MODEL")
HF_TOKEN = os.getenv("HF_TOKEN")

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "agriculture_knowledge")
EMBEDDING_MODEL = "BAAI/bge-large-en"


if not HF_TOKEN:
    raise ValueError(
        "Please set the HF_TOKEN environment variable to your Hugging Face API token."
    )
if not QDRANT_URL:
    raise ValueError(
        "Please set the QDRANT_URL environment variable to your Qdrant URL."
    )
if not COLLECTION_NAME:
    raise ValueError(
        "Please set the COLLECTION_NAME environment variable to your collection name."
    )


GREETINGS = [
    "hi",
    "hello",
    "hey",
    "greetings",
    "good morning",
    "good afternoon",
    "good evening",
]



# Initialize embeddings
embeddings = HuggingFaceEmbeddings(
    model_name=EMBEDDING_MODEL, model_kwargs={"device": "cpu"}
)

# Create Qdrant client
qdrant_client = QdrantClient(url=QDRANT_URL, prefer_grpc=False)

# Connect to existing vector store
vector_store = QdrantVectorStore(
    client=qdrant_client, collection_name=COLLECTION_NAME, embedding=embeddings
)

 



