# AGENTS.md — 项目说明与协作规则

个人网站（haoriver.site）：Vue 3 前端 + FastAPI 后端 + MySQL 数据库，部署在阿里云 ECS 的宝塔面板上，Nginx 托管前端静态文件并把 `/api` 请求反向代理给后端。

## 一、项目结构

```
personal-site/
├── frontend/                  # 前端（Vue 3 + Vite + vue-router）
│   ├── index.html             # HTML 壳，唯一的页面入口
│   ├── vite.config.js         # Vite 构建配置
│   ├── .env                   # 本地开发环境变量（VITE_API_URL）
│   ├── .env.production        # 打包时的环境变量（VITE_API_URL）
│   ├── public/exam/           # 大文件资源，勿删
│   └── src/
│       ├── main.js            # JS 入口：创建 Vue 应用、挂载路由
│       ├── style.css          # 全站设计系统（:root 设计 tokens + 公共组件样式）
│       ├── App.vue            # 根组件（页面布局 + 导航）
│       ├── router/index.js    # 路由表：网址 → 页面组件的映射
│       ├── views/             # 页面组件（Home/Chat/Collection/Notes 等）
│       ├── components/        # 可复用小组件（NavBar）
│       └── composables/       # 数据逻辑层（useCollectionStore 等负责调后端接口）
├── backend/                   # 后端（Python FastAPI）
│   ├── main.py                # 后端入口：创建 app、/api/health、/api/chat
│   ├── collections_api.py     # 收藏功能 CRUD 接口（/api/collections）+ 封面抓取 fetch_cover
│   ├── requirements.txt       # Python 依赖清单
│   ├── .env                   # 环境变量（密钥、数据库账密，不进 Git）
│   └── .env.example           # 环境变量模板（内容已过时，实际所需见下文）
├── docs/                      # 部署指南、路线图、需求交接文档
├── AGENTS.md                  # 本文件：给 AI 助手的协作规范
└── AI开发提示词.md / 交接文档-给同事.md / 网站架构设计文档.md   # 项目上下文文档
```

设计系统说明（2026-08 视觉改造后）：全站配色为"燕麦鼠尾草"风格，所有颜色/阴影/圆角定义在 `frontend/src/style.css` 的 `:root` 设计 tokens 里，改风格只需改那里；收藏页（Collection.vue）是 B 站风卡片（大封面 + 两行标题 + 平台·时间），封面的渐变兜底色定义在 `useCollectionStore.js`，按收藏 id 哈希取色。

后端 `.env` 实际需要的全部环境变量：

- `DEEPSEEK_API_KEY` / `DEEPSEEK_BASE_URL` / `DEEPSEEK_MODEL` — AI 聊天接口用
- `DB_HOST` / `DB_PORT`（默认 3306）/ `DB_USER` / `DB_PASSWORD` / `DB_NAME` — MySQL 连接
- `CORS_ORIGINS`（可选，逗号分隔的跨域白名单）、`PORT`（默认 8000）

## 二、本地启动

前端（默认 5173 端口）：

```bash
cd frontend
npm install
npm run dev
```

后端（默认 8000 端口，需先配好 `backend/.env`）：

```bash
cd backend
pip install -r requirements.txt
python main.py        # 开发模式，带热重载
```

验证：`curl http://127.0.0.1:8000/api/health` 应返回 `{"status":"ok"}`；接口测试页在 `http://127.0.0.1:8000/api/docs`。

注意：当前 `frontend/.env` 里 `VITE_API_URL=https://haoriver.site`，本地开发时前端会直接请求**线上**接口。想连本地后端就把它改成 `http://localhost:8000`（这属于本地配置，改完不用提交）。

## 三、前后端如何连接

- 前端所有请求地址由 `frontend/.env`（开发）或 `frontend/.env.production`（打包）里的 `VITE_API_URL` 决定，代码里通过 `import.meta.env.VITE_API_URL` 读取（见 `useCollectionStore.js` 和 `Chat.vue`）。
- 线上 `VITE_API_URL=https://haoriver.site`，Nginx 把 `/api` 开头的请求反代到本机 8000 端口的 FastAPI，前后端同源，无跨域问题。
- **所有后端接口必须以 `/api` 开头**，否则线上 Nginx 不会转发。

现有接口：

| 方法 | 路径 | 作用 | 定义位置 |
|------|------|------|---------|
| GET | `/api/health` | 健康检查（返回 status + 当前 commit 号） | `backend/main.py` |
| POST | `/api/chat` | AI 聊天（SSE 流式） | `backend/main.py` |
| GET/POST | `/api/collections` | 收藏 列表/新增（新增时自动抓取封面） | `backend/collections_api.py` |
| PUT/DELETE | `/api/collections/{id}` | 收藏 改/删（更新时同样自动抓取封面） | `backend/collections_api.py` |
| GET/POST | `/api/notes` | 笔记 列表/新增 | `backend/notes_api.py` |
| PUT/DELETE | `/api/notes/{id}` | 笔记 改/删 | `backend/notes_api.py` |

封面抓取（`fetch_cover`，定义在 `collections_api.py`）：新增/更新收藏时若封面为空且链接是 http(s)，后端同步 GET 目标页面（2 秒超时、跟随重定向以兼容 b23.tv 短链），用正则提取 `og:image` 存库；B 站链接走官方数据接口兜底（主站拦截机房 IP）；入库地址统一 https 化。任何失败都返回空串、绝不阻断保存，前端用渐变兜底封面。图片标签带 `referrerpolicy="no-referrer"` 绕过图床防盗链。

## 四、构建与部署

前端构建：

```bash
cd frontend
npm run build        # 产物在 frontend/dist/，纯静态文件
```

服务器更新流程（宝塔 + 阿里云 ECS，详见 `docs/server-deploy-guide.md`）：

1. 本地改完代码 → push 到 GitHub
2. 服务器 `cd /www/wwwroot/haoriver/personal-site && git pull`
3. 前端有改动：`cd frontend && npm run build`（Nginx 根目录直接指向 `dist/`，无需其他操作）
4. 后端有改动：宝塔 Python 项目管理器里重启 `haoriver-backend`
5. 验证：`curl https://haoriver.site/api/health`

## 五、改动代码时必须遵守的规则

1. **密钥与配置分离**：API Key、数据库密码只写在 `.env`（已被 .gitignore 排除），绝不硬编码进代码、绝不提交到 Git。`backend/.env` 和 `frontend/.env` 都不能提交。
2. **接口必须带 `/api` 前缀**（Nginx 只转发 `/api`），FastAPI 的 docs/openapi 路径也要保持在 `/api/` 下。
3. **SQL 一律用参数占位符**（`cur.execute(sql, (参数,))`），禁止字符串拼接，防 SQL 注入。
4. **数据库连接用完必须关闭**（现有代码用 `try/finally: conn.close()` 的写法，新代码照做）。
5. **后端新接口**：按功能建独立文件（参照 `collections_api.py`），用 `APIRouter(prefix="/api")`，最后在 `main.py` 里 `include_router` 注册，不要把接口全堆进 `main.py`。
6. **前端新页面**：组件放 `src/views/`，必须在 `src/router/index.js` 注册路由才能访问；调后端的逻辑放 `src/composables/`（参照 `useCollectionStore.js`），不要在页面组件里直接写 fetch 地址拼接。
7. **改动要重新构建/重启才生效**：前端改完必须 `npm run build`（线上），后端改完必须在宝塔重启，别以为改了代码线上就会变。
8. **不要动这些东西**：`frontend/dist/`（构建产物）、`frontend/public/exam/`（1.3M 大文件资源）。Vercel 遗留文件和 `.bak` 备份已于 2026-08-27 清理，同类文件（`*.bak`、`*.zip`、`.vercel/`）已被 .gitignore 排除，不要再提交进来。
9. **保持现有代码风格**：注释用中文、写给新手看（解释"为什么"而不只是"是什么"）；数据库字段下划线命名、前端字段驼峰命名，转换在后端做（参照 `row_to_item`）。
10. **部署相关的服务器操作**（宝塔、Nginx、DNS）不要自动化执行，改动前先和用户确认。
