from .units.memory_unit import with_history
from dotenv import load_dotenv

load_dotenv(dotenv_path="./src/.env")

# wrapper function
def model(user_input: str, session_id: str = "default") -> str:
    result = with_history.invoke(
        {"input": user_input},
        config={"configurable": {"session_id": session_id}},
    )
    return result