"""
收藏功能 API —— 第3关核心文件
作用：把 collections 表的数据通过网址（接口）暴露出去，让前端能用 HTTP 请求读写数据库

命名小知识：这个文件提供的 4 个接口正好是 CRUD：
  Create(增) / Read(查) / Update(改) / Delete(删)
后端开发 90% 的工作都是在写 CRUD，记住这个词。
"""

import json
import os
import re
import uuid
from datetime import date
from urllib.parse import urljoin

import pymysql
from pymysql.constants import CLIENT
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# APIRouter = "分组路由"。
# 把收藏相关的接口集中在一个文件里，最后由 main.py 统一注册，
# 这样 main.py 不会越来越臃肿（项目一大，代码要按功能拆文件）。
# prefix="/api" 表示这个文件里所有网址都自动加上 /api 前缀。
router = APIRouter(prefix="/api")


# ---------- 第 1 部分：数据库连接 ----------

def get_db():
    """
    创建并返回一个数据库连接。
    账号密码全部从环境变量读取，绝不写死在代码里 —— 这叫配置分离：
    代码可以放心传到 GitHub（人人可见），密码只存在于 .env 文件和服务器上。
    """
    # client_flag=FOUND_ROWS 是个关键细节：
    # MySQL 默认只统计"内容真的变了"的行数。这样"点了保存但什么都没改"时，
    # UPDATE 会返回 0，update 接口会把它误判成"收藏不存在"报 404。
    # 加上这个参数后，UPDATE 返回的是"匹配到几行"，语义才符合我们的预期。
    return pymysql.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),   # 数据库地址（服务器上就是本机）
        port=int(os.getenv("DB_PORT", "3306")),   # MySQL 默认端口，固定常识：3306
        user=os.getenv("DB_USER", "haoriver"),    # 用普通账号，不用 root（最小权限原则）
        password=os.getenv("DB_PASSWORD", ""),    # 密码从环境变量来
        database=os.getenv("DB_NAME", "haoriver"),# 连哪个库
        charset="utf8mb4",                        # 和建库时的字符集一致，中文不乱码
        cursorclass=pymysql.cursors.DictCursor,   # 查询结果返回字典，而不是一坨元组
        client_flag=CLIENT.FOUND_ROWS,
    )


def row_to_item(row):
    """
    把数据库里的一行，转成前端认识的格式。
    数据库列名用下划线（created_at），前端字段用驼峰（createdAt），
    后端的一个重要职责就是给两边"当翻译"。
    """
    # tags 在数据库里存的是 JSON 字符串 '["a","b"]'，转回真正的数组
    try:
        row["tags"] = json.loads(row["tags"]) if row["tags"] else []
    except Exception:
        row["tags"] = []
    # 把 created_at 重命名为 createdAt，并转成字符串
    row["createdAt"] = str(row.pop("created_at"))
    return row


# ---------- 第 1.5 部分：封面自动抓取 ----------

# 目标页面的服务器会拒绝"没有浏览器标识"的请求（403 反爬），
# 所以带上一个普通的浏览器 User-Agent 伪装成正常访问。
FETCH_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
)

# og:image 的 content 可以写在 property 前面或后面、可以用单引号或双引号，
# 所以这里写了两个方向的正则。og:image:url 是老写法，一并兼容。
_OG_IMAGE_PATTERNS = (
    re.compile(r'<meta[^>]+property=["\']og:image(?:\:url)?["\'][^>]*content=["\']([^"\']+)', re.I),
    re.compile(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]*property=["\']og:image(?:\:url)?["\']', re.I),
)


def fetch_bilibili_cover(url: str) -> str:
    """
    B 站专用兜底：主站视频页对"数据中心 IP"有反爬（直接回 412 拦截页），
    但官方数据接口是给程序用的，风控宽松得多。
    从任意形态的 B 站链接里提取 BV 号（BV + 10位字母数字），调接口拿封面。
    同样遵守铁律：任何失败返回空字符串。
    """
    match = re.search(r"(BV[0-9A-Za-z]{10})", url)
    if not match:
        return ""
    try:
        resp = requests.get(
            f"https://api.bilibili.com/x/web-interface/view?bvid={match.group(1)}",
            headers={"User-Agent": FETCH_UA, "Referer": "https://www.bilibili.com/"},
            timeout=2,
        )
        pic = ((resp.json().get("data") or {}).get("pic")) or ""
        return pic if pic.startswith("http") else ""
    except Exception:
        return ""


def fetch_cover(url: str) -> str:
    """
    抓取链接页面的 og:image 作为收藏封面。
    原则：绝不让保存失败 —— 超时、反爬、没有题图……任何异常都返回空字符串，
    由前端显示渐变兜底封面。
    timeout=2 表示总超时上限 2 秒，不能让用户点"保存"等太久。
    """
    try:
        resp = requests.get(
            url,
            headers={"User-Agent": FETCH_UA},
            timeout=2,
            allow_redirects=True,  # b23.tv 等短链要跟随跳转才能到正文页
        )
        html = resp.text[:100_000]  # og:meta 都在页面头部，读前 10 万字符足够
        for pattern in _OG_IMAGE_PATTERNS:
            match = pattern.search(html)
            if not match:
                continue
            src = (match.group(1) or "").strip()
            if src.startswith("//"):            # 协议相对地址 //xxx.com/a.jpg
                src = "https:" + src
            elif src.startswith("/"):           # 相对地址 /a.jpg
                src = urljoin(resp.url, src)
            if src.lower().startswith(("http://", "https://")):
                return src
        # 网页里没找到题图时，对 B 站链接再试一次官方数据接口
        # （主站拦截机房 IP，但接口一般放行，见 fetch_bilibili_cover 的说明）
        if "bilibili.com" in url or "b23.tv" in url:
            return fetch_bilibili_cover(url)
        return ""
    except Exception:
        return ""


# ---------- 第 2 部分：数据校验模型 ----------

class CollectionPayload(BaseModel):
    """
    Pydantic 模型：声明"前端提交的数据必须长这样"。
    好处：请求格式不对时，FastAPI 自动返回 422 错误，根本不会碰到你的业务代码。
    = 后面是默认值，前端不传就用默认值。
    """
    platform: str = "Web"
    title: str = "未命名收藏"
    url: str = "#"
    cover: str = ""
    category: str = "未分类"
    tags: list = []          # 数组在入库时会转成 JSON 字符串
    note: str = ""
    status: str = "待整理"


# ---------- 第 3 部分：四个 CRUD 接口 ----------

@router.get("/collections")
def list_collections():
    """【查】GET /api/collections —— 返回全部收藏，按创建日期倒序"""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM collections ORDER BY created_at DESC")
            rows = cur.fetchall()  # fetchall = 取出所有结果行
        return [row_to_item(r) for r in rows]
    finally:
        conn.close()  # 连接用完必须关！不然数据库连接会被耗光（经典新手坑）


@router.post("/collections")
def create_collection(payload: CollectionPayload):
    """【增】POST /api/collections —— 新增一条收藏"""
    new_id = str(uuid.uuid4())  # UUID：全球唯一的随机 ID，不用担心重复
    # 封面为空且是正常网页链接时，后端同步抓取 og:image（最多等 2 秒，失败也不影响保存）
    if not payload.cover and payload.url.startswith(("http://", "https://")):
        payload.cover = fetch_cover(payload.url)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # SQL 里的 %s 是"占位符"，参数通过第二个元组传进去。
            # 绝对不能用字符串拼接 SQL！那样会被 SQL 注入攻击（安全第一课）。
            cur.execute(
                """INSERT INTO collections
                   (id, platform, title, url, cover, category, tags, note, created_at, status)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (new_id, payload.platform, payload.title, payload.url,
                 payload.cover, payload.category, json.dumps(payload.tags, ensure_ascii=False),
                 payload.note, date.today(), payload.status),
            )
        conn.commit()  # 增删改必须 commit 才真正写进数据库，否则会自动回滚
        return {"id": new_id, "message": "创建成功"}
    finally:
        conn.close()


@router.put("/collections/{item_id}")
def update_collection(item_id: str, payload: CollectionPayload):
    """【改】PUT /api/collections/某个id —— 全量更新这条收藏"""
    if not payload.cover and payload.url.startswith(("http://", "https://")):
        payload.cover = fetch_cover(payload.url)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            affected = cur.execute(
                """UPDATE collections SET
                   platform=%s, title=%s, url=%s, cover=%s, category=%s,
                   tags=%s, note=%s, status=%s
                   WHERE id=%s""",
                (payload.platform, payload.title, payload.url, payload.cover,
                 payload.category, json.dumps(payload.tags, ensure_ascii=False),
                 payload.note, payload.status, item_id),
            )
        conn.commit()
        if affected == 0:  # 没有匹配到任何行 = 这个 id 不存在
            raise HTTPException(status_code=404, detail="收藏不存在")
        return {"id": item_id, "message": "更新成功"}
    finally:
        conn.close()


@router.delete("/collections/{item_id}")
def remove_collection(item_id: str):
    """【删】DELETE /api/collections/某个id —— 删除这条收藏"""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            affected = cur.execute("DELETE FROM collections WHERE id=%s", (item_id,))
        conn.commit()
        if affected == 0:
            raise HTTPException(status_code=404, detail="收藏不存在")
        return {"id": item_id, "message": "删除成功"}
    finally:
        conn.close()
