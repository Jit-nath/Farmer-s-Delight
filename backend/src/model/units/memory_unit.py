from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import (
    RunnableLambda,
    RunnableParallel,
    RunnablePassthrough,
)
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory


from .runner_unit import hf_runnable
from .rag_unit import vector_store

# ---- 1) Setup ----
chat = hf_runnable
retriever = vector_store.as_retriever(search_kwargs={"k": 3})

store = {}


def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]


# ---- 2) Prompts ----
CONDENSE_QUESTION_PROMPT = PromptTemplate.from_template(
    "Given the chat history and a follow-up question, rephrase the question:\n\nHistory: {history}\n\nQuestion: {input}"
)

RAG_PROMPT = PromptTemplate.from_template(
    """You are a professional farming advisor.

**Domain restriction:**  
If the user asks any question **not related to farming**, politely say:  
“Sorry, I'm unable to answer questions unrelated to farming.”

**Greeting & Farewell handling:**  
- If the user's input ({question}) is only a greeting (e.g., “hi”, “hello”), reply with a short friendly greeting in the same language, then stop.  
- If the input is only a farewell (e.g., “bye”, “goodbye”), reply with a short farewell in the same language, then stop.  
- If greeting/farewell is mixed with a question, put a one-line greeting/farewell at the top (same language), then proceed to answer the rest.

**Farming advice flow (when valid):**  
1. **Short answer** (1-2 sentences) — direct and actionable.  
2. **Immediate steps** (1-3 numbered actions).  
3. **Missing info?** If essential details (such as crop, location, season, issue) are missing, show them as: `Falta: ...` (or equivalent in the user's language), then optionally ask a brief clarifying question.  
4. **Context used** — 1-2 bullet points summarizing what you relied on.  
5. **Confidence & assumptions** — High/Medium/Low + a short note.

If you can't answer due to missing context, say so and ask specifically for what's needed—but keep it short and farmer-friendly, with no jargon."""
)


def format_docs(docs):
    return "\n\n".join([d.page_content for d in docs])


# ---- 3) Chains ----
condense = (
    {
        "history": RunnableLambda(lambda x: x["history"]),
        "input": RunnableLambda(lambda x: x["input"]),
    }
    | CONDENSE_QUESTION_PROMPT
    | chat
    | StrOutputParser()
)

retrieve = (
    {"question": condense}
    | RunnableLambda(lambda x: x["question"])
    | retriever
    | RunnableLambda(lambda docs: {"context": format_docs(docs)})
)

rag = (
    RunnableParallel(
        context=RunnableLambda(lambda x: x.get("context")),
        question=condense,
    )
    | RAG_PROMPT
    | chat
    | StrOutputParser()
)

chain = (
    RunnableParallel(
        history=RunnableLambda(lambda x: x.get("history", "")),
        input=RunnablePassthrough(),
    )
    | RunnableParallel(
        context=retrieve,
        input=RunnableLambda(lambda x: x["input"]),
        history=RunnableLambda(lambda x: x["history"]),  # <-- keep history alive
    )
    | RunnableLambda(
        lambda x: {
            "history": x["history"],  # type: ignore
            "context": x["context"],  # type: ignore
            "input": x["input"],  # type: ignore
        }
    )
    | rag
)

with_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
    output_messages_key="answer",
)
