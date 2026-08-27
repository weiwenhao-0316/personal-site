"""
笔记功能 API —— P1 数据上云第一站
作用：把笔记从浏览器 localStorage 迁移到服务器 MySQL，
     通过 /api/notes 提供增删改查，换设备也能看到同一份笔记。

本文件完全照抄 collections_api.py 的成熟模板（同一套骨架）：
  连接函数 → 数据转换 → 校验模型 → 四个 CRUD 接口
刻意让 notes 自带一份 get_db 而不是抽公共模块：
  收藏功能刚在生产环境跑稳，不为省十行代码去动它 —— 稳定优先。
"""

import json
import os
import uuid
from datetime import date
from typing import Optional

import pymysql
from fastapi import APIRouter, HTTPException
from pymysql.constants import CLIENT
from pydantic import BaseModel

router = APIRouter(prefix="/api")


# ---------- 第 1 部分：数据库连接 ----------

def get_db():
    """与 collections_api.get_db 相同的连接配置（含 FOUND_ROWS 标记）。"""
    return pymysql.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "haoriver"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "haoriver"),
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        client_flag=CLIENT.FOUND_ROWS,
    )


def row_to_item(row):
    """
    数据库行 → 前端格式。
    date 是业务字段（YYYY-MM-DD 字符串），转成字符串给前端；
    created_at 只是入库时间，前端不需要，直接丢弃；
    tags 存的是 JSON 字符串，转回真数组。
    """
    row["date"] = str(row["date"])
    row.pop("created_at", None)
    try:
        row["tags"] = json.loads(row["tags"]) if row["tags"] else []
    except Exception:
        row["tags"] = []
    return row


# ---------- 第 2 部分：数据校验模型 ----------

class NotePayload(BaseModel):
    """声明前端提交的笔记必须长这样；格式不对 FastAPI 自动回 422。"""
    title: str = "未命名笔记"
    mood: str = "记录"
    excerpt: str = ""
    content: str = ""
    tags: list = []                    # 入库时转 JSON 字符串
    date: Optional[str] = None         # 不传就用今天的日期


# ---------- 第 3 部分：四个 CRUD 接口 ----------

@router.get("/notes")
def list_notes():
    """【查】GET /api/notes —— 返回全部笔记，按日期倒序、新创建的靠前"""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM notes ORDER BY date DESC, created_at DESC")
            rows = cur.fetchall()
        return [row_to_item(r) for r in rows]
    finally:
        conn.close()


@router.post("/notes")
def create_note(payload: NotePayload):
    """【增】POST /api/notes —— 新增一条笔记，id 由后端 UUID 生成"""
    new_id = str(uuid.uuid4())
    note_date = payload.date or date.today().isoformat()
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO notes
                   (id, date, mood, title, excerpt, content, tags, created_at)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())""",
                (new_id, note_date, payload.mood, payload.title,
                 payload.excerpt, payload.content,
                 json.dumps(payload.tags, ensure_ascii=False)),
            )
        conn.commit()
        return {"id": new_id, "message": "创建成功"}
    finally:
        conn.close()


@router.put("/notes/{note_id}")
def update_note(note_id: str, payload: NotePayload):
    """【改】PUT /api/notes/某个id —— 更新指定笔记（日期沿用原值不覆盖）"""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            affected = cur.execute(
                """UPDATE notes SET
                   mood=%s, title=%s, excerpt=%s, content=%s, tags=%s
                   WHERE id=%s""",
                (payload.mood, payload.title, payload.excerpt, payload.content,
                 json.dumps(payload.tags, ensure_ascii=False), note_id),
            )
        conn.commit()
        if affected == 0:
            raise HTTPException(status_code=404, detail="笔记不存在")
        return {"id": note_id, "message": "更新成功"}
    finally:
        conn.close()


@router.delete("/notes/{note_id}")
def delete_note(note_id: str):
    """【删】DELETE /api/notes/某个id —— 删除指定笔记"""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            affected = cur.execute("DELETE FROM notes WHERE id=%s", (note_id,))
        conn.commit()
        if affected == 0:
            raise HTTPException(status_code=404, detail="笔记不存在")
        return {"id": note_id, "message": "删除成功"}
    finally:
        conn.close()
