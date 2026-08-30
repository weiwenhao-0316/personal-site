# ZCode 交接文档（haoriver.site 个人网站）

- 本次更新日期：2026-08-30
- 交接人：ZCode（上一阶段主力开发助手，负责 2026-08-27 视觉改造上线、排错、Notes 迁移开发）
- 本次更新摘要：核对至 commit `19acea7`（已全部推送 GitHub）。新增内容为：收藏页视觉改造与封面自动抓取全链路、排错问答录、health 接口返回提交号、AI开发提示词重写（含部署剧本）、Notes 笔记迁移前后端代码。已核实服务器 `notes` 表建表成功；**Notes 功能的线上终验（服务器 build、后端重启、浏览器验收）未确认完成**，是接手后第一优先事项。
- 信息来源说明：本文综合了①当前代码与 Git 历史②项目文档③与用户的对话记录。凡只来自对话截图而无法从代码验证的，均标注"（对话确认）"；凡根据代码推断的，均标注"（推断）"。

---

## 1. 项目定位与当前目标

- **要解决的问题**：用户（计算机专业准大三学生）需要一个属于自己的个人网站，承载收藏、笔记、资料库、AI 对话等内容，数据不随浏览器丢失。
- **目标用户**：用户本人为主（个人生产工具），同时作为作品集对外展示（域名已备案，正式产品定位）。
- **明确的属性**：这是一个**学习型项目与个人产品双重定位**——用户明确采用"任务卡模式"，要求 AI 先讲设计决策再动手、解释为什么，产品是学习过程的成果。用户自述目标是"先把网站基础功能雏形做好，少报错，高效率"。
- **当前优先级最高的产品目标**：数据上云（把仍在浏览器本地的 Notes/Library/Vault 数据迁到 MySQL），已确认"先功能后界面"的路线。
- **用户明确推迟的事项**：P0 中的数据库每日自动备份（用户说"P0，先不做"）；ESLint/ruff/deploy skill 等工程化工具链（用户取消安装，决定功能稳定后再上）。

## 2. 已完成内容（附证据）

### 前端页面与路由
- 路由表：`frontend/src/router/index.js`。页面：`/`(Home)、`/collection`、`/notes`、`/library`、`/chat`、`/projects`、`/vault`；`/blog`→`/notes`、`/tools`→`/library` 重定向。
- 设计系统：`frontend/src/style.css` `:root` 燕麦鼠尾草 tokens（--bg #F6F4EE、--accent #6F9D98 等）。改于 2026-08 视觉改造，commit `9c86fcc`。
- 收藏页 B 站风卡片：`frontend/src/views/Collection.vue`（16:10 封面、两行标题、平台·相对时间、悬停浮现编辑/删除、TransitionGroup 筛选过渡）。
- NavBar 与新背景融合：`frontend/src/components/NavBar.vue`。

### 数据层（关键：各 store 存储方式现状）
| Store | 存储方式 | 证据 |
|-------|---------|------|
| `useCollectionStore.js` | MySQL（经 `/api/collections`） | 代码 + 多轮线上验证 |
| `useNotesStore.js` | MySQL（经 `/api/notes`，commit `19acea7`） | 代码已确认；**线上是否生效未验证** |
| `useLibraryStore.js` | 浏览器 localStorage | 代码 `localStorage.getItem` |
| `useVault.js` | 浏览器 IndexedDB（库 personal-vault） | 代码 |
| `useWallpaperStore.js` | 浏览器 IndexedDB（库 personal-site-ui） | 代码 |

### 后端 API（`backend/`）
- `main.py`：`/api/health`（返回 status + **commit 提交号**，commit `eebdd8c`）、`/api/chat`（DeepSeek SSE 流式）、注册 collections 与 notes 路由。
- `collections_api.py`：收藏 CRUD 四接口 + `fetch_cover`（og:image 抓取）+ `fetch_bilibili_cover`（B 站官方 API 兜底，绕机房 412 反爬）+ `to_https`（入库 https 化）。`get_db` 带 `CLIENT.FOUND_ROWS`（修复 UPDATE 误报 404，commit `e58d37e`）。
- `notes_api.py`：笔记 CRUD 四接口（commit `ff7c74a`），完全照抄 collections 模板。
- `requirements.txt`：fastapi/uvicorn/openai/python-dotenv/pymysql/requests。

### 数据库
- 库 `haoriver`。表 `collections`（url/cover 已扩容 VARCHAR(2048)、title VARCHAR(500)，对话确认）。
- 表 `notes`：已由用户在服务器执行 `docs/migration-notes.sql` 建表成功，含 2 条种子数据（对话截图确认：命令静默成功；推断：SQL 文件随 commit `ff7c74a` 才存在，能执行成功说明服务器已 pull 至 `19acea7`）。

### 部署与文档
- 阿里云 ECS + 宝塔 + Nginx（SSL）+ 镜像拉取流程，详见 `docs/server-deploy-guide.md`。
- `docs/troubleshooting-qa.md`：17 问排错问答录（含全部已修复问题的根因与验证方式）。
- `AGENTS.md`：项目规范（已同步接口清单、健康检查新返回结构、清理记录）。
- `AI开发提示词.md`：2026-08-27 重写，含"工作纪律七条"与"部署固定剧本"（第五部分）。
- 仓库清理：Vercel 遗留、.bak、dist.zip、gen_doc.js 等已删（commit `838ec7c`/`46c4772`）。

## 3. 当前进度

| 阶段 | 任务 | 状态 | 证据 | 完成标准 |
|------|------|------|------|---------|
| 视觉改造 | style.css tokens + Collection 卡片重构 | 已完成 | commit `9c86fcc`；本地浏览器截图验证 | 线上样式符合设计规格（已达成） |
| 视觉改造 | 封面自动抓取（og:image + B 站 API + https 化 + 防盗链） | **代码已完成，线上终验未确认** | commit `85a995e`/`0064342`；服务器探针证实 412、403 根因 | 线上添加 B 站链接显示真实封面 |
| 视觉改造 | FOUND_ROWS 404 修复 | 代码已完成，线上验证未回报 | commit `e58d37e` | 线上"无改动保存"不报 404 |
| 运维 | health 返回 commit 号 | 代码已完成（本地验证输出 `546dcb3`），线上未验证 | commit `eebdd8c` | curl 返回的 commit = 最新提交号 |
| P1 上云 | Notes 迁移（后端+前端+SQL） | **进行中**：代码已推送、表已建，待服务器 build + 后端重启 + 浏览器验收 | commit `ff7c74a`/`19acea7`；建表截图 | 笔记页种子数据可见，增删改可用，无痕窗口数据仍在 |
| P1 上云 | Library 迁移 | 未开始 | 代码仍是 localStorage | 同 Notes 模板 |
| P2 | 收藏分类角标/分页/统一加载态 | 未开始 | — | — |
| P3 | Vault 文件上传 | 未开始（需先出方案） | — | — |
| 工程化 | ESLint/ruff/deploy skill | 用户明确推迟 | npm install 被用户取消，工作区干净 | — |

**整体判断（谨慎）**：代码层面 P1 Notes 迁移开发完成度约 90%（仅差部署执行与验收）；收藏封面功能代码完成但用户从未回报"线上看到真实封面"的终验。产品整体处于"核心功能雏形 + 数据上云进行到第二站"的阶段。

## 4. 最近工作记录（2026-08-27 ~ 08-30）

| 时间序 | 做了什么 | 为什么 | 涉及文件 | 验证方式 | 部署状态 |
|--------|---------|--------|---------|---------|---------|
| 1 | 仓库清理 + AGENTS.md 建立 | 产品化诉求 | 根目录、AGENTS.md、.gitignore | git status 干净 | 已随 `git pull` 生效（无代码影响） |
| 2 | 视觉改造（tokens/卡片/NavBar/store 渐变） | 交接文档实现清单 | style.css、Collection.vue、NavBar.vue、useCollectionStore.js | 本地 build + 浏览器截图 | 已上线（用户截图确认新版式） |
| 3 | 封面抓取 + B 站 API 兜底 + 防盗链修复 | B 站风卡片需要真实封面 | collections_api.py、Collection.vue、useCollectionStore.js、requirements.txt | 本地抓取测试、服务器 412/403 探针 | `0064342` 已推送；**线上部署与终验未确认** |
| 4 | FOUND_ROWS 修复 | "未修改内容保存"误报 404 | collections_api.py | 本地抓取回归 | 同上 |
| 5 | health 返回 commit；AI 提示词重写 | 部署验证利器 + 协作纪律 | main.py、AI开发提示词.md | 本地验证 commit 输出 | 已推送；线上未验证 |
| 6 | Notes 迁移前后端 + SQL | P1 数据上云第一站 | notes_api.py、main.py、useNotesStore.js、Notes.vue、docs/migration-notes.sql | 本地路由清单 + npm build 通过；服务器建表成功（对话确认） | **进行中**：服务器 build 与后端重启未确认 |

**仍需用户手动操作**（接手 AI 注意）：Notes 上线的服务器侧收尾（见第 7 节任务 1）。

## 5. 未完成事项与技术债（P0/P1/P2）

| 级别 | 事项 | 风险 | 建议完成标准 |
|------|------|------|-------------|
| P0 | **全站 API 无任何鉴权**：/api/collections、/api/notes 的增删改公网任何人可调，/api/chat 可被白嫖 DeepSeek 额度（无费用控制、无限流、无消息长度限制） | 数据可被恶意清空；AI 费用失控 | 至少加一个简单 token 校验（前端+后端约定头）或后台管理口令；chat 接口加消息条数/长度上限 |
| P0 | **数据库无备份**（用户推迟中，建议再确认一次）：数据单点在服务器磁盘 | 磁盘故障=全部数据丢失 | 宝塔计划任务每日备份，保留 7 份；每月下载一份到本地 |
| P1 | Library 仍 localStorage、Vault/Wallpaper 仍 IndexedDB | 换设备数据丢失 | Library 照 Notes 模板迁移；Vault 需先做文件上传方案 |
| P1 | Notes/Library/Collection 列表无分页 | 数据量大后接口慢、页面长 | 后端 LIMIT/OFFSET + 前端加载更多 |
| P2 | 无测试、无 lint（用户明确推迟）、无 CI/CD、无监控 | 回归靠手工 | 至少后端加 pytest 冒烟 + ruff |
| P2 | 后端进程以 root 运行（宝塔默认配置） | 最小权限未落实 | 宝塔改运行用户为普通用户 |
| P2 | 前端交互用 window.alert/confirm，无 loading 态 | 体验粗糙 | 统一 toast + loading 组件 |
| P2 | `backend/.env.example` 过时（只有 DEEPSEEK 三项，缺 DB_*/CORS_ORIGINS/PORT） | 新环境部署踩坑 | 按实际所需补齐模板 |
| P2 | `backend/routes/`、`backend/services/` 空目录残留 | 轻微混乱 | 下次清理删除或启用 |

## 6. 已知问题和失败尝试（根因 + 修复 + 验证方式）

| # | 问题 | 根因 | 修复 | 验证方式与状态 |
|---|------|------|------|--------------|
| 1 | 装了 requests 仍 ModuleNotFoundError | 宝塔项目跑在独立 venv，裸 pip 装到系统 Python | 用 venv 完整路径 pip 安装 | 模块管理显示 requests 2.32.5 + health 通（对话确认） |
| 2 | 保存收藏报错，日志 `1406 Data too long for column 'url'` | B 站分享链接超 255 字符 | ALTER 三列扩容至 500/2048/2048 | `SHOW COLUMNS` 确认 varchar(2048)（对话截图） |
| 3 | phpMyAdmin 三连崩（查 mysql.user 拒绝、执行 SQL 报 syntax near ''） | 宝塔打包的 phpMyAdmin 自身缺陷（栈轨迹全部指向 /www/server/phpmyadmin） | 弃用 GUI，改 mysql 命令行 | notes 建表命令行执行成功 |
| 4 | 宝塔点重启行为不变（旧行为持续） | uvicorn reload 派生子进程家族，面板按钮杀不干净 | `/proc/PID/cmdline` 取证确认 → `pkill -f "main.py"; pkill -f "spawn_main"` → `nohup venv/bin/python3 main.py > /tmp/backend.log 2>&1 &` 手动拉起 | 裂图出现=cover 有值，证明新代码生效（对话截图） |
| 5 | 服务器抓不到 B 站封面（本地正常） | B 站主站反爬拦截机房 IP，返回 412 + 3400 字节风控页 | 新增 `fetch_bilibili_cover`：提取 BV 号调官方 view 接口取 data.pic | 服务器探针 412 确认根因；本地 API 抓取成功 |
| 6 | 封面 URL 拿到但卡片裂图 | B 站图床 Referer 防盗链（带外部来源 403，四格矩阵实测）+ http 混合内容风险 | img 加 `referrerpolicy="no-referrer"`；前端读取与后端入库均 https 化 | 本地四格矩阵 403/200 对照；**线上终验未回报** |
| 7 | "收藏不存在"但记录明明在 | MySQL UPDATE 默认统计"变化行数"，无改动保存返回 0 被误判 | `client_flag=CLIENT.FOUND_ROWS` | 本地回归；**线上未回报** |
| 8 | git pull 失败（GnuTLS/connect reset） | 国内服务器/本机直连 GitHub 不稳 | 服务器用镜像前缀 `git pull https://gh-proxy.com/https://github.com/weiwenhao-0316/personal-site.git master`；本机 push 需开代理 | 多次 pull/push 成功 |
| 9 | venv 报 No such file or directory | 实际路径结尾是 `bin/python3` 不是 `bin/python`（差一个字符） | Tab 补全/ls 核实 | 后续命令执行成功 |

**仍未解决的问题**：以上 4/6/7 的线上终验（见第 3 节）；无其他已知未解决项。

## 7. 下一步建议（按优先级，最多 5 项）

1. **完成 Notes 迁移的线上收尾**
   - 目标：让笔记功能真正在线上生效。
   - 为什么现在做：代码已推送、表已建，只差两步执行——不做完，笔记页线上会报"笔记数据获取失败"（线上后端很可能还在跑没有 /api/notes 路由的旧进程）。
   - 涉及：服务器侧 `cd frontend && npm run build`；宝塔重启 haoriver-backend（或 pkill+nohup 手动方案，剧本见 AI开发提示词.md 第五部分）。
   - 验收：`curl http://127.0.0.1:8000/api/health` 返回 commit=`19acea7`；浏览器笔记页见 2 条种子笔记，增删改可用，无痕窗口数据仍在。
   - 需用户确认：是（服务器操作一贯由用户执行）。

2. **线上验证收藏封面与 404 修复（零开发量）**
   - 目标：确认 `0064342`/`e58d37e` 已被服务器加载。
   - 为什么：这两项修复从未获得用户回报的终验，是"声称完成"与"实际生效"之间最后的缝。
   - 涉及：仅操作，无代码。
   - 验收：收藏页老卡片封面从渐变/裂图变真实图（老数据需编辑清空封面再保存触发重抓）；无改动点保存不报 404。
   - 需用户确认：是。

3. **API 鉴权最小实现**
   - 目标：写接口（POST/PUT/DELETE）加共享密钥校验（如请求头 X-Admin-Token 对比 backend/.env 配置项），chat 接口加每条消息长度与次数上限。
   - 为什么：公网可写是当前最大安全隐患，P1 后续迁移会继续扩大暴露面。
   - 涉及：collections_api.py、notes_api.py、main.py、backend/.env（新增配置项）。
   - 验收：无 token 的写请求返回 401；带 token 正常；前端 store 统一带头。
   - 需用户确认：是（涉及 .env 约定变化，按工作纪律必须报备）。

4. **数据库每日备份**
   - 目标：宝塔计划任务配置备份数据库，保留 7 份。
   - 为什么：数据单点风险，配置成本 5 分钟；用户此前推迟，建议再次提醒。
   - 涉及：仅宝塔面板操作（用户手动）。
   - 验收：/www/backup/database 出现 .sql.gz 文件。
   - 需用户确认：是。

5. **Library 迁移 MySQL（P1 第二站）**
   - 目标：照 Notes 模板完成资料库上云。
   - 为什么：套路完全复用，是用户练熟全流程的最佳材料；Notes 收尾后顺路做。
   - 涉及：library_api.py（新建）、main.py、useLibraryStore.js、Library.vue、docs/migration-library.sql。
   - 验收：同 Notes。
   - 需用户确认：是。

## 文档与代码不一致清单（交后续 AI 判断，勿擅自改动）

1. `交接文档-给同事.md:42` 写"`.env` 开发：VITE_API_URL=http://localhost:8000"，但实际 `frontend/.env` 为 `https://haoriver.site`（`AGENTS.md` 的描述与代码一致）。判断：交接文档此句过时。
2. `docs/roadmap.md` 停留在 2026-08-25 状态：阶段二仅记录收藏完成，不含视觉改造、Notes 迁移、health commit 等后续进展。判断：整体滞后，接手后更新任务前先与用户确认是否补记。
3. `AI开发提示词.md` 第四部分把"health 返回提交号"列为 P0 待办，但该代码实际已完成推送（`eebdd8c`）。判断：提示词文档滞后一格，仅差部署验证。
4. `backend/.env.example` 与实际所需环境变量不符（AGENTS.md 已标注"内容已过时"，属已知记录，非新发现）。
5. 本次对话早期生成的 `AGENTS.md` 曾写 backend 含 `api/index.py`/`vercel.json`/`Procfile`，随后同一会话内清理删除（commit `838ec7c`）并已改写 AGENTS.md 相应描述。当前 AGENTS.md 与代码一致。

## 交接结论

- 当前项目阶段：核心功能雏形完成（视觉改造收官、收藏功能闭环），数据上云进行到第二站（Notes 代码完成、部署收尾中）。
- 当前最重要的未完成事项：Notes 迁移的线上收尾（服务器 npm run build + 重启后端 + 浏览器验收）；以及收藏封面/404 修复的线上终验。
- 下一位 AI 应先做什么：与用户一起完成上表任务 1 和任务 2（均为执行/验证，几乎无开发量），确认线上 health 返回 commit=19acea7 后，再与用户讨论是否启动 API 鉴权（任务 3）。
- 仍需用户确认的问题：①数据库备份是否维持"暂不做"的决定；②是否接受"API 加最小鉴权"的方案（涉及 .env 新增配置项）；③ESLint/ruff 等工程化工具是否继续推迟。
- 本文档最后核对时间：2026-08-30
