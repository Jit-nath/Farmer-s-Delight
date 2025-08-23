import os
from typing import Optional
from langchain_core.runnables import Runnable
from huggingface_hub import InferenceClient
from langchain_core.runnables import Runnable, RunnableConfig
from typing import Any
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME: Optional[str] = os.getenv("CHAT_MODEL")
HF_TOKEN: Optional[str] = os.getenv("HF_TOKEN")

if not MODEL_NAME:
    raise EnvironmentError("CHAT_MODEL environment variable is not set")
if not HF_TOKEN:
    raise EnvironmentError("HF_TOKEN environment variable is not set")

client = InferenceClient(model=MODEL_NAME, token=HF_TOKEN)


class HuggingFaceRunnable(Runnable[str, str]):
    def __init__(self, client: InferenceClient):
        self.client = client

    def invoke(
        self,
        input: str,
        config: Optional[RunnableConfig] = None,
        **kwargs: Any,
    ) -> str:
        if not input.strip():
            raise ValueError("Prompt text cannot be empty")

        response = self.client.chat_completion(
            messages=[{"role": "user", "content": input}],
            max_tokens=1024,
            stream=False,
        )

        # --- Normalize response ---
        if isinstance(response, dict) and "choices" in response:
            try:
                return response["choices"][0]["message"]["content"].strip()
            except Exception:
                pass
        if isinstance(response, dict) and "generated_text" in response:
            return response["generated_text"].strip()

        raise ValueError(f"Unexpected response format: {response}")


hf_runnable = HuggingFaceRunnable(client=client)