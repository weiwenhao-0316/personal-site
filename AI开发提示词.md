# AI 开发提示词（项目上下文，给 AI 助手用）

> 使用方法：打开 AI 编程助手（Qoder / Claude Code 等），将下面 ``` 内的内容整段粘贴，AI 即可接手。
> 最后更新：2026-08-25。本文档内容已与源代码核对一致；部署原理与历史操作细节见 `docs/server-deploy-guide.md`。

---

## 直接粘贴以下内容：

```
我正在维护一个已部署上线的个人网站，需要你作为开发 + 部署助手。以下是项目完整上下文，请仔细阅读后确认理解，然后问我想做什么。请用中文交流。

## 项目概况

- 网站：haoriver.site（腾讯云域名，已备案，DNS A 记录 @ 和 www 均指向阿里云服务器 120.77.2.164）
- 服务器：阿里云 2核2G（实际约 1.6G 可用内存），Ubuntu，宝塔面板管理，通过 FinalShell（SSH）操作
- 已安装：宝塔、Nginx（含 Let's Encrypt SSL）、Python 项目管理器、MySQL、Node.js 20
- GitHub：weiwenhao-0316/personal-site，服务器用 HTTPS 方式拉取

## 技术架构与数据链路

浏览器 → Nginx(443) → 静态请求走 frontend/dist；/api 开头的请求反向代理到 FastAPI(127.0.0.1:8000) → MySQL（库 haoriver）

- 前端：Vue 3 + Vite + Vue Router（history 模式，Nginx 已配 try_files 兜底，刷新不 404）
- 后端：FastAPI + PyMySQL + DeepSeek API，由宝塔 Python 项目管理器运行（项目名 haoriver-backend，systemd 服务，监听 127.0.0.1:8000）
- 数据库：MySQL，库名 haoriver，已有表 collections（收藏）
- 注意：线上没有 api 子域名，API 走同源 /api 反向代理

## 目录结构

```
personal-site/
├── frontend/                        # Vue 3 前端（主要开发区域）
│   ├── src/
│   │   ├── main.js                  # Vue 入口
│   │   ├── App.vue                  # 根组件：NavBar + <router-view>
│   │   ├── style.css                # 全局样式 + :root CSS 变量（设计系统）
│   │   ├── components/
│   │   │   └── NavBar.vue           # 顶部导航栏
│   │   ├── composables/
│   │   │   ├── useCollectionStore.js  # 收藏：调后端 /api/collections（已接 MySQL）
│   │   │   ├── useNotesStore.js       # 笔记：浏览器本地存储
│   │   │   ├── useLibraryStore.js     # 文件库：浏览器本地存储
│   │   │   ├── useVault.js            # 仓库：IndexedDB
│   │   │   └── useWallpaperStore.js   # 壁纸：浏览器本地存储
│   │   ├── data/
│   │   │   └── siteContent.js       # 站点内容数据
│   │   ├── router/
│   │   │   └── index.js             # 路由（见下表）
│   │   └── views/
│   │       ├── Home.vue             # 首页
│   │       ├── Collection.vue       # 收藏（已接 MySQL）
│   │       ├── Notes.vue            # 笔记
│   │       ├── Library.vue          # 文件库
│   │       ├── Chat.vue             # AI 对话（DeepSeek，SSE 流式）
│   │       ├── Projects.vue         # 项目展示
│   │       └── Vault.vue            # 文件仓库（IndexedDB）
│   ├── public/exam/                 # 备考资料 docx 文件（体积大，勿删）
│   ├── .env                         # 本地开发：VITE_API_URL=http://localhost:8000
│   ├── .env.production              # 生产：VITE_API_URL=https://haoriver.site（同源，不是 api 子域）
│   └── dist/                        # 构建产物，Nginx 站点根目录指向这里
├── backend/
│   ├── main.py                      # FastAPI 主文件：/api/health、/api/chat、注册 collections 路由
│   ├── collections_api.py           # 收藏 CRUD 四接口（GET/POST/PUT/DELETE /api/collections）
│   ├── requirements.txt             # fastapi, uvicorn, openai, python-dotenv, pymysql
│   └── .env.example                 # 环境变量模板
├── docs/
│   └── server-deploy-guide.md       # 宝塔部署详细指南（部署疑问先查这里）
└── .qoder/skills/baota-deploy/      # 部署经验 Skill
```

## 页面路由表（以 router/index.js 为准）

| 路由 | 页面 | 数据存储 |
|------|------|---------|
| / | Home 首页 | - |
| /collection | Collection 收藏 | 服务器 MySQL（已迁移完成） |
| /notes | Notes 笔记 | 浏览器本地 |
| /library | Library 文件库 | 浏览器本地 |
| /chat | Chat AI 对话 | 后端 DeepSeek SSE |
| /projects | Projects 项目展示 | 硬编码 |
| /vault | Vault 文件仓库 | 浏览器 IndexedDB |
| /blog | 重定向 → /notes | - |
| /tools | 重定向 → /library | - |

## 后端接口清单

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/health | GET | 健康检查，返回 {"status":"ok"} |
| /api/collections | GET / POST | 查询全部收藏 / 新增（id 由后端 UUID 生成） |
| /api/collections/{id} | PUT / DELETE | 更新 / 删除指定收藏 |
| /api/chat | POST | DeepSeek 聊天，SSE 流式返回 |
| /api/docs | GET | Swagger 接口测试页（特意挪到 /api 下，否则线上访问不到） |

后端环境变量（.env）：DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME（MySQL）；DEEPSEEK_API_KEY / DEEPSEEK_BASE_URL / DEEPSEEK_MODEL；CORS_ORIGINS；PORT=8000

## 设计系统（定义在 style.css :root）

当前主题是清新的绿灰色系：

```
--bg: #eef2ec              背景
--surface / --surface-strong / --surface-muted   半透明卡片层级
--text-primary: #202520    主文字
--text-secondary / --text-tertiary               次要/辅助文字
--accent: #6f9d98          强调色（灰绿）
--accent-deep: #416f6b     深绿
--accent-warm: #c98f70     暖色点缀
--accent-soft              浅强调背景
--border / --border-light  边框
--shadow-sm/md/lg          阴影三档
--radius: 18px / --radius-lg: 30px / --radius-xl: 42px
--font-display: Noto Serif SC（衬线）
--font-body: DM Sans + 中文回退
```

新页面直接引用 var(--xxx)，保持风格统一。

## 服务器关键路径

- 项目目录：/www/wwwroot/haoriver/personal-site
- 后端环境变量：/www/wwwroot/haoriver/personal-site/backend/.env（不走 Git，在服务器上直接改）
- Nginx 站点配置：/www/server/panel/vhost/nginx/haoriver.site.conf
- 站点根目录：/www/wwwroot/haoriver/personal-site/frontend/dist
- 后端服务：宝塔 Python 项目管理器 → haoriver-backend（systemd 托管，监听 127.0.0.1:8000）

## 部署流程（每次更新代码必须遵循）

1. 本地：git add . → git commit -m "描述" → git push（commit 用 conventional commits 格式；冲突用 git pull --rebase 解决）
2. 服务器 FinalShell：cd /www/wwwroot/haoriver/personal-site → git pull，并用 git log --oneline -2 确认拉到了最新提交
3. 前端有改动 → cd frontend && npm run build；后端有改动 → 宝塔重启 Python 项目（重启前先检查 8000 端口有没有旧进程占用）
4. git pull 网络失败 → 用镜像前缀（如 gh-proxy.com）或本地打包 dist 后上传覆盖
5. 验证：服务器上 curl http://127.0.0.1:8000/api/health 返回 {"status":"ok"}；浏览器打开网站抽查功能

## 重要注意事项

1. 服务器内存小（约 1.6G），不要让 MySQL + PHP + Nginx + Python 后端之外的服务同时跑，资源耗尽会导致面板卡死（停掉无关服务可释放约 500MB）
2. .env 含密钥，绝不在代码里写死、绝不提交 Git
3. frontend/public/exam/ 下的 docx 文件体积大，不要随意删除
4. 本地开发同时起前端（npm run dev，5173 端口）和后端（python main.py，8000 端口）
5. 如不确定服务器是否为最新代码，先执行 git pull 并用 git log 验证，再做任何操作

## 已知待办

1. Notes / Library / Vault 数据还在浏览器本地，计划分批迁移到 MySQL（参照收藏功能的迁移方式：后端加 CRUD 接口 + 前端 store 改调接口）
2. Projects 页面数据是硬编码的，可改为动态加载
3. 部分页面移动端体验可继续优化

## 参考资料

- 部署原理、常见问题、维护命令：docs/server-deploy-guide.md
- 部署经验 Skill：.qoder/skills/baota-deploy/SKILL.md

请确认你已理解以上内容，然后告诉我今天想做什么。
```
