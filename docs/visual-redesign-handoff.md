# 视觉改造交接文档（给 AI 助手）

> 生成日期：2026-08-27
> 用途：本文档记录了"网站视觉改造"需求调研阶段的全部决策和上下文，供接手的 AI 助手直接开始实现。
> 协作模式说明：本项目采用"任务卡模式"（学习为主、产品为果），实现时请先讲设计决策再动手，用中文交流。

---

## 一、项目背景速查

| 项目 | 信息 |
|------|------|
| 网站 | haoriver.site（腾讯云域名 + 备案，DNS A 记录 @/www → 120.77.2.164） |
| 服务器 | 阿里云 2核2G（约1.6G可用）Ubuntu + 宝塔面板，FinalShell SSH 操作 |
| 前端 | Vue 3 + Vite + Vue Router，产物在 `frontend/dist`，Nginx 静态服务 |
| 后端 | FastAPI，宝塔 Python 项目管理器（项目名 haoriver-backend），监听 127.0.0.1:8000 |
| 数据库 | MySQL，库 `haoriver`，表 `collections` |
| 数据链路 | 浏览器 → Nginx(443) → dist / `/api` 反代 → FastAPI(8000) → MySQL |
| GitHub | weiwenhao-0316/personal-site（服务器 HTTPS 拉取） |
| 服务器项目路径 | /www/wwwroot/haoriver/personal-site |
| 后端环境变量 | 服务器 `backend/.env`（不走 Git） |

更多背景见：`AI开发提示词.md`、`交接文档-给同事.md`、`docs/server-deploy-guide.md`、`docs/roadmap.md`

---

## 二、本次改造已确定的决策（用户已逐项拍板）

### 2.1 改造范围
**收藏页（/collection）为主角 + 全站风格统一**。配色、字体、卡片质感等全局变量更新后，其他页面自动继承；不逐页重做布局。

### 2.2 视觉风格：燕麦鼠尾草（清新 + 温暖 + 治愈）
设计关键词：苹果风的简洁克制 + 治愈系的温暖 + 动态微交互。

### 2.3 卡片信息结构：纯 B 站风（极简）
卡片只展示：**大封面 + 两行标题 + 平台/时间**。
- 标签、批注、状态：功能全部保留，但收进"编辑"弹窗，不在卡片上露出
- 编辑/删除按钮：悬停卡片时才浮现（平时隐藏）
- 点击卡片：新标签页打开收藏的链接

### 2.4 封面图策略：后端自动抓取
- 添加/编辑收藏点保存时，若封面为空，后端同步抓取链接页面的 `og:image` 元数据存入数据库
- 抓取超时上限 2 秒，失败则封面留空，前端显示彩色渐变兜底封面
- 实现方式选定：**保存时后端同步抓取**（不做前端实时预览、不做定时任务）

---

## 三、设计规格（Design Tokens）

更新 `frontend/src/style.css` 的 `:root`（当前值是灰绿系，以下为改造目标值）：

```
--bg: #F6F4EE                页面背景（燕麦色）
--surface: rgba(255,255,255,.8)    半透明面板
--surface-strong: #FFFFFF    卡片（纯白）
--text-primary: #2B332E      主文字
--text-secondary: #7C8579    次要文字
--text-tertiary: #98a096     辅助文字
--accent: #6F9D98            强调色（鼠尾草绿）
--accent-deep: #416F6B       深强调色（按钮等）
--accent-warm: #C98F70       暖色点缀
--accent-soft: rgba(111,157,152,.12)  浅强调背景（标签等）
--border: #E7E4D9            边框
--shadow-card: 0 4px 14px rgba(80,100,90,.08)   卡片阴影
--shadow-card-hover: 0 10px 28px rgba(80,100,90,.14)  悬停阴影
--radius: 18px               常规圆角
--radius-card: 14px          卡片圆角
```

渐变兜底封面（收藏无封面图时，按收藏 id hash 从下面循环取色）：
```
linear-gradient(135deg, #A8C5BF, #6F9D98)
linear-gradient(135deg, #C9D8C0, #8FAF8B)
linear-gradient(135deg, #D9C3B2, #C98F70)
linear-gradient(135deg, #F3D9B8, #D9A05B)
```

字体：保持现有 `--font-display`（Noto Serif SC）与 `--font-body`（DM Sans + 中文回退）不变。

微交互要求（苹果风关键）：
- 卡片悬停：轻微上浮（translateY(-4px)）+ 阴影加深 + 封面微放大（scale 1.03），过渡 0.25s ease
- 分类筛选切换、卡片增删：淡入淡出过渡
- 弹窗：毛玻璃遮罩（backdrop-filter: blur）+ 圆角 20px+

---

## 四、实现清单

### 4.1 全局（1 个文件）
- [x] `frontend/src/style.css`：按上面 tokens 更新 `:root`，检查全站页面是否顺带受益
- [x] 检查 `NavBar.vue` 与整体背景融合度（半透明白底 + 浅边框）

### 4.2 前端收藏页
- [x] `frontend/src/views/Collection.vue` 重构卡片：
  - 网格布局 `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`，封面比例约 16:10
  - 卡片内容：封面（有图显图，无图显渐变兜底）→ 两行标题（-webkit-line-clamp: 2）→ 平台 · 相对时间
  - 编辑/删除按钮悬停浮现；批注/状态/标签只在编辑弹窗内展示和修改
  - 顶部：页面标题 + 简介 + 分类筛选胶囊（选中态 = 实心 --accent，未选中 = 白底浅影）
- [x] `useCollectionStore.js`：接口未动；兜底渐变已按设计规格更新为 4 条鼠尾草色，并改为按收藏 id 哈希取色

### 4.3 后端封面抓取
- [x] `backend/requirements.txt`：新增 `requests`
- [x] `backend/collections_api.py` 实现了 `fetch_cover(url) -> str`：
  - 用 requests GET 目标页面，带常见浏览器 User-Agent，`timeout=2`，跟随重定向（兼容 b23.tv 短链）
  - 用正则提取 `<meta property="og:image" content="...">`（注意 og:image / og:image:url 两种写法、单双引号）
  - 任何异常/超时/提取失败 → 返回空字符串（前端渐变兜底），绝不让保存失败
- [x] 在 `create_collection` 和 `update_collection` 中：当 `payload.cover` 为空且 `payload.url` 是 http 链接时，调用 `fetch_cover` 填充
- [x] 本地测试：用真实 B 站视频链接、b23.tv 短链、普通文章链接各测一遍

### 4.4 不做的事（YAGNI）
- 不引入图片上传/存储（封面只用外链或渐变）
- 不做前端实时封面预览
- 不重做其他页面的布局

---

## 五、当前代码现状要点

- 路由表（`frontend/src/router/index.js`）：`/`、`/collection`、`/notes`、`/library`、`/chat`、`/projects`、`/vault`；`/blog`→`/notes`、`/tools`→`/library`
- `Collection.vue` 现状：已有卡片网格 + 分类筛选 + 增删改查弹窗（444 行，含教学注释），本次在其基础上重构卡片展示层
- `collections` 表字段：id / platform / title / url / cover / category / tags(JSON字符串) / note / created_at / status —— **字段已够用，本次不改表结构**
- 后端接口：`GET/POST /api/collections`、`PUT/DELETE /api/collections/{id}`、`GET /api/health`、`POST /api/chat`、`GET /api/docs`
- 代码中含 `【第3关改动】` `【第5关改动】` 类教学注释，本次改造触及的文件可顺手改写成面向维护者的简洁注释（但不要大范围重构）

---

## 六、部署流程（改完必须执行）

```
1. 本地：git add . && git commit -m "feat: ..." && git push（conventional commits）
2. 服务器 FinalShell：
   cd /www/wwwroot/haoriver/personal-site && git pull
   git log --oneline -2        # 确认拉到最新提交
3. 前端改动 → cd frontend && npm run build
4. 后端改动 → 先检查 8000 端口有无旧进程占用，再到宝塔 Python 项目管理器重启
   （本次新增了 requests 依赖，重启前确认依赖已安装）
5. 验证：
   curl http://127.0.0.1:8000/api/health   # {"status":"ok"}
   浏览器打开 /collection，添加一条 B 站链接，验证封面自动抓取
```

注意事项：
- 服务器内存小，别同时跑多余服务
- `.env` 不走 Git；`frontend/public/exam/` 大文件勿删
- git pull 网络失败用镜像前缀（如 gh-proxy.com）或本地打包 dist 上传

---

## 七、验收标准

1. /collection 页面视觉上达到"燕麦鼠尾草 + 纯 B 站风卡片"效果，卡片悬停有微动效
2. 添加一条 B 站视频链接（不填封面），保存后卡片显示真实视频封面
3. 封面抓取失败时（如无效链接），卡片显示渐变兜底，不报错
4. 批注/标签/状态功能在编辑弹窗中完整可用
5. 全站其他页面无样式崩坏（背景、导航、文字颜色和谐）
6. 已按部署流程上线，浏览器抽查通过
