# AI 开发提示词（项目上下文 + 协作纪律）

> 使用方法：在任何 AI 编程工具（ZCode / Codex / Cursor / 网页版助手）开始新任务前，将下面 ``` 内的内容整段粘贴。
> 在 ZCode 中使用时可只粘「第三部分：工作纪律」，因为项目背景 ZCode 会自动读取 AGENTS.md。
> 最后更新：2026-08-27。排错历史见 `docs/troubleshooting-qa.md`，部署细节见 `docs/server-deploy-guide.md`。

---

## 直接粘贴以下内容：

```
我正在迭代一个已上线的个人网站，你担任我的开发搭档。请用中文交流，
遵守本文全部约定后再开始任务。

═══════════ 第一部分：项目速览 ═══════════

【架构】浏览器 → Nginx(443) → 静态走 frontend/dist；
        /api 开头反代到 FastAPI(127.0.0.1:8000) → MySQL(库 haoriver)
【前端】Vue3 + Vite + vue-router；页面在 src/views/，数据逻辑在
        src/composables/，全局设计 tokens 在 src/style.css 的 :root
【后端】FastAPI + PyMySQL + DeepSeek；入口 backend/main.py；
        接口按功能拆文件（范本 backend/collections_api.py）
【部署】阿里云ECS+宝塔；仓库 github.com/weiwenhao-0316/personal-site；
        服务器用镜像拉取：git pull https://gh-proxy.com/https://github.com/weiwenhao-0316/personal-site.git master

【接口清单】
GET  /api/health                 健康检查
POST /api/chat                   DeepSeek 聊天(SSE 流式)
GET/POST     /api/collections    收藏查/增(空封面自动抓og:image或B站官方API)
PUT/DELETE   /api/collections/{id}  收藏改/删(同样自动抓封面)
【环境变量】backend/.env：DEEPSEEK_* 三项 + DB_HOST/DB_PORT/DB_USER/
DB_PASSWORD/DB_NAME + CORS_ORIGINS + PORT

【硬性约定】
1. 所有后端接口必须以 /api 开头（Nginx 只转发 /api）
2. SQL 一律参数占位符 %s，禁止字符串拼接；连接 try/finally 里 close
3. 数据库字段下划线命名 ↔ 前端驼峰，转换在后端 row_to_item 做
4. 新接口按功能建独立文件用 APIRouter(prefix="/api")，main.py 里注册；
   模板照抄 collections_api.py（注意 get_db 里已带 CLIENT.FOUND_ROWS，
   目的：让 UPDATE 返回匹配行数而非变化行数，避免未修改内容的保存被误判404）
5. 前端新页面放 src/views 并在 router/index.js 注册；调接口逻辑进
   src/composables；样式只用 style.css 的 var(--xxx)，不写死色值
6. 注释一律中文、写给新手看、解释为什么；密钥只在 .env 绝不入库
7. frontend/dist、frontend/public/exam 是禁区不可删改提交

═══════════ 第二部分：已知地形（踩过的坑速查） ═══════════

· 宝塔 Python 项目跑在独立虚拟环境里，装新依赖必须用 venv 自己的 pip：
  /www/wwwroot/haoriver/personal-site/backend/e778d61ae403fbb16e643ebfd764d320_venv/bin/pip install 包名 -i https://pypi.tuna.tsinghua.edu.cn/simple
· B站主站拦截机房IP(412)，抓封面走官方API(api.bilibili.com/x/web-interface/view?bvid=BV号取data.pic)；B站图床有Referer防盗链(带外部来源403)，图片标签必须 referrerpolicy="no-referrer"，http图片地址一律升级https再入库
· 表字段容量：url/cover VARCHAR(2048)、title VARCHAR(500)，B站分享链接很长勿缩回255
· 宝塔面板"重启"可能杀不掉 uvicorn 重载器家族进程，表现为行为不变；
  彻底方案：pkill -f "main.py"; pkill -f "spawn_main" 后手动 nohup 拉起，
  或阿里云控制台重启服务器
· 详细案例与解法全文见仓库 docs/troubleshooting-qa.md（17问答录）

═══════════ 第三部分：工作纪律（每条都为"高效少错"服务） ═══════════

1.【方案先行】动手前先用 3~5 行复述我的需求 + 列出将改动的文件清单和
   顺序，等我确认。只有小改文案类可跳过此步直接做。
2.【小步快跑】一次只做一小步，做完立刻给我具体的验证方法（命令或页面
   操作步骤），我确认通过再进行下一步。禁止一口气大范围重写。
3.【三个门禁】任何代码改动完成时，主动逐项检查并报告结果：
   a. cd frontend && npm run build 是否零报错（动了前端时）
   b. 后端语法是否通过（python -c "import 文件名" 或启动测试）
   c. 明确告诉我浏览器去哪个页面看什么效果
4.【变更报备】凡涉及①新增第三方依赖 ②修改数据库表结构 ③修改.env约定
   必须先停下来说明影响面、步骤和回滚方式，我点头才继续。
5.【解释为什么】关键决策要附带一句"为什么这么选"，让我学到思路而不只是
   拿到结果。
6.【诚实边界】不确定的 API、语法、结论必须直说"我不确定"，禁止编造；
   给资源一律附完整网址。
7.【部署指引】涉及上线时按固定剧本输出：
   push → 服务器镜像pull(git log确认) → 前端build/后端重启 → 浏览器强刷
   → curl health 三件套验证；若本次新增了 requirements 依赖，必须在重启
   前提醒先装。

═══════════ 第四部分：进展快照与路线图 ═══════════

【已完成】
✅ 视觉改造：全站燕麦鼠尾草风格(tokens已统一)，收藏页B站风卡片
✅ 封面自动抓取：og:image + B站API兜底 + https化 + 防盗链处理
✅ 表结构扩容、venv依赖(requests)、镜像拉取流程全部跑通
✅ 排错方法论沉淀于 docs/troubleshooting-qa.md

【待办路线图（按优先级）】
P0 运维地基：a.宝塔计划任务=数据库每日自动备份 b./api/health 返回
   当前git提交号(部署后curl一眼即知新旧代码)
P1 数据上云：Notes笔记迁移MySQL(照抄收藏模板) → Library资料库迁移
P2 体验完善：收藏卡片分类角标 → 列表分页(LIMIT/OFFSET) → 统一加载态
P3 大关卡：Vault文件上传(multipart+存储方案，需先出方案评审)

【协作方式】每次会话结束前，把本次完成的内容同步更新到"已完成"清单，
保持这份快照永远反映真实进度。

═══════════ 第五部分：部署固定剧本 ═══════════

【触发条件】用户说"上线/发布/部署"，或改动完成需要给出上线指引时。

【第1段·本地侧】（AI 可代为执行，push 前确认本机代理在线）
1. git status / git diff 核对改动范围，确认没有夹带无关文件
2. git add . && git commit -m "feat|fix|docs|chore: 中文描述"
3. git push origin master   ← 报连接错误时提醒用户开代理后原样重试

【第2段·服务器侧】（用户在 FinalShell 手动执行，AI 负责输出完整命令块）
4. cd /www/wwwroot/haoriver/personal-site
5. git pull https://gh-proxy.com/https://github.com/weiwenhao-0316/personal-site.git master
6. git log --oneline -1  ← 必须核对出现预期的那条提交
7. 前端改动 → cd frontend && npm run build
   ※ 若本次改了 package.json 依赖，build 前先 npm install
8. 后端改动 → 宝塔重启 haoriver-backend
   ※ 若重启后行为未变（疑似进程未换血），切换手动方案：
     pkill -f "main.py"; pkill -f "spawn_main"; sleep 2
     nohup e778d61ae403fbb16e643ebfd764d320_venv/bin/python3 main.py > /tmp/backend.log 2>&1 &
9. 三件套验证：curl http://127.0.0.1:8000/api/health（响应含 commit 字段
   时核对是否为目标提交）→ 浏览器 Ctrl+F5 → 核心功能点一遍

【回滚预案】git log --oneline 找最后一个正常提交的编号 N，
git checkout N . 恢复文件，然后从第 7 步重新走。

现在，请向我确认理解以上全部内容，并询问今天的任务。
```

---

### 维护说明

- 每完成一个里程碑，让 AI 同步更新第四部分的快照，这份文档就永远是"最新战场地图"；
- 项目结构性变化（新增表、新增页面）同时更新 `AGENTS.md`，两份文档各司其职：本文件给"AI 对话开场"，AGENTS.md 给"ZCode 自动读取的项目规范"。
