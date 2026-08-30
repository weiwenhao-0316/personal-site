# AI 项目交接文档

> 生成者：Qoder
> 最后核对时间：2026-08-30
> 本次更新摘要：首次创建。基于 2026-08-30 本地代码库（HEAD=`19acea7`，工作区干净、与 origin/master 同步）、docs 文档、以及 Qoder 与用户在 2026-08-25 ~ 08-27 的历史对话整理。本文档为只读核查产物，核查期间未修改任何代码、配置或部署环境。

---

## 1. 项目定位与当前目标

- **想解决什么问题**：为作者打造一个"个人收纳库"——收纳收藏的博主/视频链接、学习笔记、沉淀的理念，同时作为学习软件工程的实战载体。
- **目标用户**：主要给自己用（可展示给同学），兼顾未来雇主/面试官的展示价值。依据：历史对话中用户明确表达"拿给同学看、介绍"的使用场景。
- **当前优先级最高的产品目标**：视觉与体验打磨（已完成收藏页改版），随后继续数据上云（Notes 已完成，Library/Vault 未开始）。
- **项目性质**：**学习型项目优先，产品为果**。用户明确表态"学到东西为主，把产品做出来是次要的"，采用"任务卡模式"迭代（每张任务卡 = 一个功能点 + 一个知识点），为实习做准备。协作规范见 `AGENTS.md` 与 `docs/roadmap.md`。

## 2. 已完成内容

### 前端

| 内容 | 证据 |
|---|---|
| 7 个页面路由：`/`、`/collection`、`/notes`、`/library`、`/chat`、`/projects`、`/vault`；`/blog`→`/notes`、`/tools`→`/library` 重定向 | `frontend/src/router/index.js` |
| 收藏页 B 站风卡片墙（大封面+两行标题+平台·时间，悬停浮现编辑/删除，批注收进弹窗） | `frontend/src/views/Collection.vue`（commit `9c86fcc`） |
| 收藏 store 已接后端 `/api/collections`，含渐变兜底封面（按 id 哈希取 4 色渐变） | `frontend/src/composables/useCollectionStore.js` |
| 笔记 store 已接后端 `/api/notes`（已脱离 localStorage） | `frontend/src/composables/useNotesStore.js`、`frontend/src/views/Notes.vue`（commit `19acea7`） |
| Library（`useLibraryStore.js`）、Vault（`useVault.js`，IndexedDB）、Wallpaper（`useWallpaperStore.js`）仍为浏览器本地存储 | 各 composable 源码 |
| 全站设计系统"燕麦鼠尾草"：`--bg:#F6F4EE`、`--accent:#6F9D98`、`--accent-warm:#C98F70`、`--radius-card:14px` 等 | `frontend/src/style.css` `:root`（commit `9c86fcc`） |
| AI 聊天 SSE 流式（DeepSeek），带后端连接状态检测 | `frontend/src/views/Chat.vue` |
| 封面图片防图床防盗链：`referrerpolicy="no-referrer"` | `Collection.vue`（commit `0064342`） |

### 后端 API

| 接口 | 说明 | 定义位置 |
|---|---|---|
| `GET /api/health` | 健康检查，返回 `{"status":"ok","commit":短提交号}`（commit `eebdd8c`） | `backend/main.py` |
| `POST /api/chat` | DeepSeek 聊天，SSE 流式 | `backend/main.py` |
| `GET/POST /api/collections`、`PUT/DELETE /api/collections/{id}` | 收藏 CRUD，新增/更新时封面为空则自动抓取（`fetch_cover`：og:image 正则 + B 站官方接口兜底，2 秒超时，失败返回空串） | `backend/collections_api.py` |
| `GET/POST /api/notes`、`PUT/DELETE /api/notes/{id}` | 笔记 CRUD（commit `ff7c74a`，刻意复制 collections 骨架、不抽公共模块，理由写在文件头注释） | `backend/notes_api.py` |
| `GET /api/docs`、`GET /api/openapi.json` | Swagger（特意置于 `/api` 前缀下以通过 Nginx 反代） | `backend/main.py` |

Pydantic 模型做入参校验（`CollectionPayload`、`NotePayload`）；SQL 全部参数化；数据库连接均带 `CLIENT.FOUND_ROWS` 标记（commit `e58d37e`）。

### 数据库与存储

| 内容 | 证据 |
|---|---|
| MySQL 库 `haoriver`，表 `collections`（id/platform/title/url/cover/category/tags(JSON)/note/created_at/status） | `backend/collections_api.py` SQL |
| 表 `notes` 建表脚本 + 2 条种子数据（幂等设计） | `docs/migration-notes.sql`（commit `ff7c74a`） |
| 数据分层现状：收藏+笔记在 MySQL；Library 在 localStorage；Vault 在 IndexedDB | 各 composable |
| 后端 `.env`（DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME、DEEPSEEK_*、CORS_ORIGINS、PORT） | 已配置，未展示；变量清单见 `AGENTS.md` 第一节 |

### 部署与运维

- 阿里云 2核2G Ubuntu + 宝塔面板；Nginx(443, Let's Encrypt, 强制 HTTPS) 托管 `frontend/dist`，`/api` 反代 `127.0.0.1:8000`，已配 `try_files` SPA 兜底。证据：`docs/server-deploy-guide.md`、`.qoder/skills/baota-deploy/SKILL.md`
- 后端由宝塔 Python 项目管理器运行（项目名 `haoriver-backend`，systemd）；依赖版本已锁定在 `backend/requirements.txt`（fastapi 0.115.6 / pymysql 1.1.1 / requests 2.32.3 等）
- 部署五步法 + 上线验证（`curl https://haoriver.site/api/health` 看 commit 号）：`AGENTS.md` 第四节

### 最近视觉或交互改造

2026-08-27 完成的"燕麦鼠尾草 + 纯 B 站风收藏页"改造（commit `9c86fcc`），决策过程与规格见 `docs/visual-redesign-handoff.md`；上线当天的排错过程记录为 17 问问答录 `docs/troubleshooting-qa.md`。

## 3. 当前进度

| 阶段 / 任务 | 状态 | 证据 | 完成标准 |
|---|---|---|---|
| 服务器部署（宝塔+Nginx+SSL） | 已完成 | `docs/server-deploy-guide.md`、网站线上可访问（本次未实测） | 已达成 |
| 收藏接入 MySQL | 已完成 | `6bbe31e`、`914f4f7` | 已达成 |
| 视觉改造（配色+收藏卡片+封面抓取） | 已完成 | `9c86fcc` 及后续 3 个 fix 提交 | 已达成 |
| 笔记接入 MySQL | 代码已完成 | `ff7c74a`、`19acea7`、`docs/migration-notes.sql` | 线上生效依赖服务器执行建表脚本 + git pull + 重启后端（见第 4 节，状态待用户确认） |
| Library / Vault 数据上云 | 未开始 | 本地存储代码仍在 | `docs/roadmap.md` C2/C3 |
| 工程化清理（.bak/遗留文件） | 大部分完成 | `46c4772`；但本地仍有未跟踪残留（见第 7 节） | 工作区与仓库一致 |
| README + LICENSE | 未开始 | 仓库根目录无这两个文件 | `docs/roadmap.md` 阶段 B1（roadmap 中未单列，为 2026-08-27 对话中提出） |
| 测试 / Lint / CI / 监控 | 未开始 | 无相关配置 | `docs/roadmap.md` 阶段 B3/E |
| 鉴权 | 未开始 | 接口无任何认证 | `docs/roadmap.md` E1 |
| 产品定义文档（任务卡 #1） | 未开始 | 无 `docs/product-spec.md` | `docs/roadmap.md` A1-A3 |

**整体判断（不给百分比）**：部署与"数据上云"主线推进到一半（2/4 模块入库），视觉改造已完成一轮；工程化基建（测试/CI/鉴权/门面文件）整体未开始。

## 4. 最近工作记录

以下按提交时间倒序，均来自 `git log`（08-27 当天 11 个提交）：

1. **笔记迁移 MySQL**（`ff7c74a`、`19acea7`）：新增 `notes_api.py` + `migration-notes.sql`，前端 `useNotesStore.js`/`Notes.vue` 切换到接口。这是路线图 C 阶段的第一个模块。是否已部署：**无法远程确认**，需用户在服务器执行建表脚本、`git pull`、重启后端，并用 `/api/health` 的 commit 字段核对（应显示 `19acea7` 对应的短号）。
2. **健康检查返回 commit 号**（`eebdd8c`）：解决"线上跑的到底是不是新代码"的验证难题。
3. **重写 `AI开发提示词.md`**（`546dcb3`）：同步现状并新增工作纪律。
4. **封面三连修复**（`e58d37e` FOUND_ROWS 误报 404 → `85a995e` B 站官方接口兜底 → `0064342` 防盗链+混合内容）：均为视觉改造上线当天暴露的真实问题，过程详见 `docs/troubleshooting-qa.md` Q10-Q12。
5. **仓库清理 + `AGENTS.md`**（`46c4772`）：删除 Vercel 遗留与 `gen_doc.js`（-1026 行），建立协作规范。

Qoder 亲历部分（08-25~08-27 对话）：重写两份过时交接文档并推送（`020b87d`）；制定 `docs/roadmap.md`；通过视觉伙伴完成风格调研（用户拍板：范围=收藏页+全站统一、风格=燕麦鼠尾草、卡片=纯 B 站风、封面=后端自动抓取）；编写 `docs/visual-redesign-handoff.md` 供后续 AI 实施。

## 5. 未完成事项与技术债

| 优先级 | 问题或任务 | 风险 | 建议完成标准 |
|---|---|---|---|
| P0 | 全站接口无鉴权：任何人可增删改收藏与笔记 | 数据可被破坏；个人站暂可接受，但风险随内容增多上升 | 至少实现"主人模式"简单鉴权（如访问密钥或登录+JWT），方案需用户拍板 |
| P0 | `/api/chat` 无限流、无长度校验 | DeepSeek 费用失控、恶意请求打满 2G 内存服务器 | 加请求频率限制与 messages 长度上限 |
| P1 | 无数据库备份 | 单点故障，数据全丢 | 宝塔计划任务每日 `mysqldump` + 保留 7 份 |
| P1 | 数据存储未统一（Library 在 localStorage、Vault 在 IndexedDB） | 换设备数据不可见 | 按 `docs/roadmap.md` C2/C3 迁移 |
| P1 | 无测试、无 Lint、无 CI/CD | 回归靠手测；坏代码可直接推到线上 | 最小可用：GitHub Actions 跑前端构建检查（roadmap B3） |
| P1 | 仓库缺 `README.md` 与 `LICENSE` | 仓库门面无，不符合正式开源项目标准 | 补齐（roadmap 阶段 B1 剩余项） |
| P2 | 后端以 root 运行（宝塔项目配置） | 安全纵深不足 | 了解风险即可，个人站可暂缓 |
| P2 | `backend/routes/`、`backend/services/` 空目录、`main.py` 教学注释（`【第3关改动】`）仍在 | 工程卫生 | 随手清理/改写 |
| P2 | `backend/.env.example` 内容过时（缺 DB_* 与 CORS/PORT） | 新环境照着配会缺项 | 按 `AGENTS.md` 第一节清单更新 |
| P2 | 前端其余页面的加载态/错误态未系统核查 | 体验不一致 | 逐页核查（本次未做） |

## 6. 已知问题和失败尝试

全部详情见 `docs/troubleshooting-qa.md`（17 问），此处摘要与验证方式：

| 问题 | 根因 | 解决 | 修复后验证方式 |
|---|---|---|---|
| 收藏原样保存报 404 | PyMySQL 默认不计"值未变的行"为 affected | 连接加 `CLIENT.FOUND_ROWS`（`e58d37e`） | 对未修改的收藏点保存，应提示成功而非"收藏不存在" |
| B 站链接封面抓不到 | 机房 IP 被 B 站反爬拦截（412） | 改走 B 站官方数据接口兜底（`85a995e`） | 新增一条 B 站视频链接，保存后卡片出真实封面 |
| 封面裂图 | 图床防盗链 403 + http/https 混合内容 | 入库地址 https 化 + `referrerpolicy="no-referrer"`（`0064342`） | 浏览器打开收藏页无裂图、控制台无 mixed content 警告 |
| 服务器装 requests 后仍报 ModuleNotFoundError | 宝塔项目 venv 与系统 Python 不同 | 在项目 venv 内安装（QA Q5） | 宝塔重启后端后保存收藏不报错 |
| 数据库列太短 1406 错误 | 标题列长度不足 | 扩容列长度（QA Q7） | 保存长标题成功 |
| git pull 失败（GnuTLS） | 服务器访问 GitHub 网络不稳 | 镜像前缀（如 `gh-proxy.com`）（QA Q3） | pull 成功且 `git log` 确认提交 |

**仍未解决/无法确认**：线上是否已运行 `19acea7` 及 notes 表是否已建——本次核查在本地进行，无法访问服务器，需用户按部署五步法核对。

## 7. 文档、代码与历史对话的不一致

1. **`docs/roadmap.md` 进度表严重滞后**：文档说任务卡 #1"产品定义与信息架构"待启动、无后续记录；代码实际已完成视觉改造、笔记迁移等大量工作。代码为事实，文档待更新。
2. **`docs/server-deploy-guide.md` 2.3 节写"本项目不需要 MySQL"**：现在 MySQL 是核心依赖。文档是迁移前写的，未更新。
3. **`AGENTS.md` 结构图中列有 `网站架构设计文档.md`**：该 `.md` 文件本地存在，但其 `.docx` 原版已于 `46c4772` 删除；本次未核查该 `.md` 内容是否与现状一致，交给后续 AI 判断。
4. **本地工作区残留未跟踪文件**（`git status` 显示 `?? docs/ai-handoffs/`，另有目录清单可见）：`backend/routes/`、`backend/services/` 空目录；`backend/main.py.bak`、`backend/requirements.txt.bak`、`Collection.vue.bak`、`frontend/dist.zip`、`frontend/.vercel/`——均已被 `.gitignore` 排除但本地仍在；`docs/ai-handoffs/` 下两个中文文档与 `docs/交接文档模板` 未入库。是否清理/入库需用户决定。
5. **`frontend/.env` 指向线上**：`VITE_API_URL=https://haoriver.site`，本地开发默认请求线上接口（`AGENTS.md` 已说明这是有意为之，但易踩坑）。
6. **`交接文档-给同事.md` 已过期**：其页面状态表仍写"笔记=浏览器本地、待迁移"，而代码已迁移完成。该文档写于 08-25，之后未再更新。
7. **历史对话局限**：本文档作者（Qoder）可访问自己 08-25~08-27 的对话；08-27 晚间的笔记迁移、17 问排错等工作由其他会话（推测为 ZCode）完成，**无法读取该部分历史对话**，相关事实均以代码与提交记录为准。

## 8. 下一步建议

| 优先级 | 任务 | 目标 | 为什么现在做 | 涉及模块 | 验收标准 | 需用户确认 |
|---|---|---|---|---|---|---|
| 1 | 核对并上线笔记功能 | 服务器执行 `docs/migration-notes.sql`、`git pull`、重启后端 | 代码已完成但线上状态未验证，避免"以为上线了" | 服务器 + `/api/health`、`/api/notes` | health 返回最新 commit；浏览器增删改笔记成功 | 是（全部为服务器操作） |
| 2 | 更新 `docs/roadmap.md` 与 `交接文档-给同事.md` 进度 | 文档与代码对齐，消除第 7 节 1/6 项矛盾 | 文档失真已开始误导进度判断 | 仅文档 | 进度表覆盖至笔记迁移；无"笔记待迁移"类过时表述 | 否 |
| 3 | 补齐 `README.md` + `LICENSE`，清理本地残留文件 | 完成路线图阶段 B1，仓库达到正式产品门面标准 | 清理已做一半，趁热打铁 | 仓库根目录 | GitHub 仓库首页有完整 README（截图/启动方式/架构）；`.bak`/空目录处理完毕 | 是（清理范围需确认） |
| 4 | `/api/chat` 限流 + 输入校验 | 控制 AI 费用与服务器风险 | 当前接口完全裸奔，属 P0 风险中最易落地的一项 | `backend/main.py` | 超频请求被拒（429）；超长 messages 被拒（422） | 是（限流阈值） |
| 5 | Library 迁移 MySQL（路线 C2） | 数据上云第三个模块，复用成熟模板 | 笔记刚跑通，方法论最新鲜 | `notes_api.py` 模式 + `useLibraryStore.js` | Library 数据跨设备可见；旧本地数据有迁移或放弃的明确决定 | 是（旧数据去留） |

## 交接结论

- 当前项目阶段：数据上云中期（收藏、笔记已入库），视觉改造完成第一轮，工程化基建未开始
- 当前最重要的未完成事项：线上部署状态核对（笔记功能）+ 接口无鉴权/无限流的 P0 风险
- 下一位 AI 应先做什么：让用户执行 `curl https://haoriver.site/api/health` 核对线上 commit，确认笔记功能是否已上线，再决定从建议清单哪项开始
- 仍需用户确认的问题：① 服务器是否已执行 `migration-notes.sql` 并重启后端；② 鉴权方案取向（主人模式 vs JWT）；③ 本地残留文件（.bak/空目录/未入库文档）的清理范围；④ Library/Vault 旧本地数据的去留
- 本文档最后核对时间：2026-08-30
