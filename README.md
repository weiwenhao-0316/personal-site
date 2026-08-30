# haoriver.site

这是一个以学习为主、兼顾对外展示的个人数字空间。它用于收纳收藏、笔记、学习资料和项目记录，并逐步形成“输入、整理、输出”的个人内容闭环。

当前项目不是多用户 SaaS，也不是已经完成的正式知识管理产品。现在的目标是先把一个边界清楚、可以稳定使用的个人版本跑通，再逐步补齐安全、测试、文件存储和自动化运维。

## 当前状态

当前代码位于数据上云阶段：

| 模块 | 当前实现 | 状态 |
|---|---|---|
| Home | 静态首页、最近更新、当前建设路线 | 可用，内容仍是静态配置 |
| Collection | Vue 页面 + FastAPI + MySQL 收藏 CRUD | 代码已完成，线上终验待确认 |
| Notes | Vue 页面 + FastAPI + MySQL 笔记 CRUD | 代码已完成，线上终验待确认 |
| Library | `localStorage` 资料库 | 暂不迁移，作为本地功能使用 |
| Vault | `IndexedDB` 文件和链接仓库 | 暂不迁移，文件上云方案待定 |
| Projects | 硬编码项目卡片 | 暂不做动态化 |
| Chat | FastAPI 代理 DeepSeek 的 SSE 聊天 | 基础功能可用，鉴权和限流未完成 |
| Wallpaper | 浏览器 `IndexedDB` 首页壁纸 | 本地功能 |

更详细的当前事实、进度和待确认事项见 `docs/product-spec.md`、`docs/roadmap.md` 和 `AGENTS.md`。

## 技术架构

```text
浏览器
  └── Vue 3 + Vite + Vue Router
        ├── 本地 localStorage / IndexedDB
        └── /api 请求
              └── FastAPI
                    ├── MySQL
                    └── DeepSeek OpenAI-compatible API
```

线上部署形态：Nginx 托管 `frontend/dist/`，并把 `/api` 请求反向代理到本机 FastAPI。部署在阿里云 ECS + 宝塔面板，具体步骤见 `docs/server-deploy-guide.md`。

## 项目结构

```text
frontend/
  src/views/          页面
  src/components/     可复用组件
  src/composables/    数据和浏览器存储逻辑
  src/router/         路由
  src/data/           静态展示数据
backend/
  main.py             FastAPI 入口、health、chat
  collections_api.py  收藏 API
  notes_api.py        笔记 API
docs/
  product-spec.md     产品定义草案
  roadmap.md          阶段路线和任务卡
  ai-handoffs/        不同 AI 的项目交接记录
```

## 本地开发

### 前端

```bash
cd frontend
npm install
npm run dev
```

默认地址：`http://localhost:5173`。

当前 `frontend/.env` 指向线上 API。开发涉及收藏或笔记写入时要特别小心，避免把测试数据写入线上数据库。若要连接本地后端，请将本地配置改为：

```text
VITE_API_URL=http://localhost:8000
```

该文件属于本地配置，不要提交真实环境变量。

### 后端

先准备 `backend/.env`，至少配置：

```text
DEEPSEEK_API_KEY=已配置的密钥
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=数据库用户
DB_PASSWORD=数据库密码
DB_NAME=haoriver
CORS_ORIGINS=http://localhost:5173
PORT=8000
```

然后执行：

```bash
cd backend
python -m venv .venv
python -m pip install -r requirements.txt
python main.py
```

后端地址：`http://localhost:8000`。

验证接口：

```bash
curl http://127.0.0.1:8000/api/health
```

接口文档：`http://127.0.0.1:8000/api/docs`。

## 构建与部署

构建前端：

```bash
cd frontend
npm run build
```

服务器更新需要人工执行：

1. 本地检查代码和构建结果。
2. 推送 GitHub。
3. 服务器 `git pull`。
4. 前端改动执行 `npm run build`。
5. 后端改动重启 FastAPI。
6. 用 `/api/health` 和核心页面进行验收。

宝塔、Nginx、DNS、SSL 和服务器重启不要由 AI 自动执行，除非用户明确授权。完整部署剧本见 `docs/server-deploy-guide.md`。

## 当前已知限制

- Collection 和 Notes 的 API 没有鉴权，公网环境下任何人都可能读取或修改数据。
- Chat 暂无限流和消息大小限制，存在费用滥用风险。
- `fetch_cover` 会由服务器请求用户提交的网页地址，后续需要补 URL 校验和 SSRF 防护。
- Library、Vault、Wallpaper 仍是浏览器本地存储，尚未实现完整跨设备同步。
- 数据库还没有正式的迁移版本管理和自动备份流程。
- 当前没有完整的自动化测试、Lint、CI/CD 和监控。

这些限制属于后续阶段，不代表第一阶段必须全部解决。每次开发只处理一个边界清楚、可以验收的任务。

## 协作规则

- 先确认目标和完成标准，再开始写代码。
- AI 开始工作前先检查当前代码、Git 状态和相关文档。
- 一次只处理一张任务卡，不进行无关重构。
- AI 必须说明修改了什么、为什么修改、如何验证、哪些内容没有验证。
- 服务器、数据库、DNS、Nginx 和生产环境操作需要用户确认。
- 不得读取、输出或提交 API Key、密码、Token 和 SSH 密钥。
- 任务完成后更新相关进度或交接文档，避免不同 AI 重复工作。

具体项目规则见 `AGENTS.md`。
