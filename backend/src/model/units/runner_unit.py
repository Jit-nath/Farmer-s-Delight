import os
from typing import Optional, Any
from langchain_core.runnables import Runnable, RunnableConfig
from langchain_core.prompt_values import StringPromptValue
from huggingface_hub import InferenceClient

MODEL_NAME: Optional[str] = os.getenv("CHAT_MODEL")
HF_TOKEN: Optional[str] = os.getenv("HF_TOKEN")

if not MODEL_NAME:
    raise EnvironmentError("CHAT_MODEL environment variable is not set")
if not HF_TOKEN:
    raise EnvironmentError("HF_TOKEN environment variable is not set")

client = InferenceClient(model=MODEL_NAME, token=HF_TOKEN)


class HuggingFaceRunnable(Runnable):
    def __init__(self, client: InferenceClient):
        self.client = client

    def invoke(
        self,
        input: Any,
        config: Optional[RunnableConfig] = None,
        **kwargs: Any,
    ) -> str:
        # --- Normalize LangChain inputs ---
        if isinstance(input, StringPromptValue):
            input = input.to_string()

        if not isinstance(input, str):
            raise TypeError(f"Expected str, got {type(input)}")

        if not input.strip():
            raise ValueError("Prompt text cannot be empty")

        # Call Hugging Face API
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
