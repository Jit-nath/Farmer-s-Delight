from os import getenv
from huggingface_hub import InferenceClient
from langchain_core.runnables import Runnable
from langchain_core.prompt_values import StringPromptValue

MODEL_NAME = getenv("CHAT_MODEL")
hf_token = getenv("HF_TOKEN")

client = InferenceClient(model=MODEL_NAME, token=hf_token)

class HuggingFaceRunnable(Runnable):
    def __init__(self, client: InferenceClient):
        self.client = client

    def invoke(self, input, config=None) -> str:  # type: ignore
        # Convert LangChain PromptValue -> string if needed
        if isinstance(input, StringPromptValue):
            input = input.to_string()

        if not isinstance(input, str):
            raise TypeError(f"Expected str, got {type(input)}")

        if not input.strip():
            raise ValueError("No prompt text provided")

        response = self.client.text_generation(
            input,
            max_new_tokens=512,
            do_sample=True,
            temperature=0.7,
            top_p=0.95,
            top_k=40,
            repetition_penalty=1.1,
            stop_sequences=["</s>", "Human:", "Assistant:"]
        )

        return response.strip()

hf_runnable = HuggingFaceRunnable(client=client)

def generate_answer_without_rag(question: str):
    """Generate an answer without using RAG"""
    try:
        general_prompt = f"Human: {question}\n\nAssistant:"
        answer = hf_runnable.invoke(general_prompt)
        return answer
    except Exception as e:
        return f"Error: {str(e)}"
