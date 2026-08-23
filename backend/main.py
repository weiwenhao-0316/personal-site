import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import OpenAI
from pydantic import BaseModel

# 【第3关改动1】docs_url="/api/docs"：
# FastAPI 自带接口测试页面（Swagger），默认在 /docs，
# 但你的 Nginx 只把 /api 开头的请求转发给后端，
# 所以把测试页挪到 /api/docs 下，线上才能访问到。
app = FastAPI(
    docs_url="/api/docs",
    redoc_url=None,
    openapi_url="/api/openapi.json",
)

origins = os.getenv("CORS_ORIGINS", "")
allow_origins = origins.split(",") if origins else [
    "http://localhost:5173",
    "https://haoriver.site",
    "https://www.haoriver.site",
    "https://frontend-nu-three-68.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 【第3关改动2】注册收藏接口：
# 把 collections_api.py 里的 4 个接口挂到 app 上，
# 从此 /api/collections 就存在了。
from collections_api import router as collections_router

app.include_router(collections_router)

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY", "sk-placeholder"),
    base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
)

MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")


@app.get("/api/health")
def health():
    return {"status": "ok"}


class ChatRequest(BaseModel):
    messages: list[dict]


@app.post("/api/chat")
async def chat(req: ChatRequest):
    stream = client.chat.completions.create(
        model=MODEL,
        messages=req.messages,
        stream=True,
    )

    def generate():
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield f"data: {chunk.choices[0].delta.content}\n\n"
        yield "data: [DONE]\n\n"


    return StreamingResponse(generate(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
