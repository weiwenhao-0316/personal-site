const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, ExternalHyperlink,
  TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, TabStopType, TabStopPosition
} = require("docx");

// ===== Color Palette =====
const C = {
  primary: "1A1A2E",
  accent: "2E75B6",
  accent2: "D4A843",
  text: "333333",
  muted: "666666",
  light: "F4F6F9",
  border: "CCCCCC",
  headerBg: "1A1A2E",
  headerFg: "FFFFFF",
  tableHeader: "E8EDF4",
  white: "FFFFFF",
};

// ===== Reusable helpers =====
const border = { style: BorderStyle.SINGLE, size: 1, color: C.border };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: "Arial", size: 32, bold: true, color: C.primary })],
    spacing: { before: 360, after: 200 },
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: C.accent })],
    spacing: { before: 280, after: 160 },
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: C.primary })],
    spacing: { before: 200, after: 120 },
  });
}

function p(text) {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    children: [new TextRun({ text, font: "Arial", size: 21, color: C.text })],
  });
}

function bullet(text, ref = "bullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60, line: 340 },
    children: [new TextRun({ text, font: "Arial", size: 21, color: C.text })],
  });
}

function numItem(text, ref = "numbers") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60, line: 340 },
    children: [new TextRun({ text, font: "Arial", size: 21, color: C.text })],
  });
}

function boldP(text) {
  return new Paragraph({
    spacing: { after: 80, line: 360 },
    children: [new TextRun({ text, font: "Arial", size: 21, bold: true, color: C.primary })],
  });
}

function tableHeaderCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: C.tableHeader, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({
      children: [new TextRun({ text, font: "Arial", size: 20, bold: true, color: C.primary })],
    })],
  });
}

function tableCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({
      children: [new TextRun({ text, font: "Arial", size: 20, color: C.text })],
    })],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: "", font: "Arial", size: 12 })] });
}

function spacer(h = 200) {
  return new Paragraph({ spacing: { after: h }, children: [new TextRun({ text: "", font: "Arial", size: 12 })] });
}

// ===== Cover page =====
function coverPage() {
  return [
    emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: "TECHNICAL DESIGN DOCUMENT", font: "Arial", size: 24, color: C.accent, bold: true })],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: "个人站点系统设计文档", font: "Arial", size: 44, bold: true, color: C.primary })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: "haoriver.site", font: "Arial", size: 28, color: C.muted })],
    }),
    emptyLine(), emptyLine(),
    new Paragraph({
      spacing: { after: 0, line: 340 },
      children: [
        new TextRun({ text: "版本：", font: "Arial", size: 21, color: C.muted }),
        new TextRun({ text: "v1.0", font: "Arial", size: 21, color: C.text }),
      ],
    }),
    new Paragraph({
      spacing: { after: 0, line: 340 },
      children: [
        new TextRun({ text: "日期：", font: "Arial", size: 21, color: C.muted }),
        new TextRun({ text: "2026 年 5 月 12 日", font: "Arial", size: 21, color: C.text }),
      ],
    }),
    new Paragraph({
      spacing: { after: 0, line: 340 },
      children: [
        new TextRun({ text: "作者：", font: "Arial", size: 21, color: C.muted }),
        new TextRun({ text: "魏文兵", font: "Arial", size: 21, color: C.text }),
      ],
    }),
    new Paragraph({
      spacing: { after: 0, line: 340 },
      children: [
        new TextRun({ text: "域名：", font: "Arial", size: 21, color: C.muted }),
        new TextRun({ text: "haoriver.site", font: "Arial", size: 21, color: C.accent }),
      ],
    }),
    new Paragraph({
      spacing: { before: 600 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "— 本文档为该项目技术设计与实现细节的完整记录 —", font: "Arial", size: 18, color: C.muted })],
    }),
  ];
}

// ===== TOC page =====
function tocPage() {
  return [
    h1("目  录"),
    emptyLine(),
    new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ===== Section builders =====
function section1Overview() {
  return [
    h1("一、项目概述"),
    h2("1.1 项目背景"),
    p("随着人工智能技术的快速发展，个人开发者也需要一个综合性数字平台来展示技术能力、分享学习成果，并为特定用户群体提供实用工具与内容服务。haoriver.site 正是基于这一需求构建的个人全栈站点，集成了 AI 对话、内容管理、文件托管等核心能力。"),
    h2("1.2 项目目标"),
    bullet("构建一个高可用、可扩展的个人站点，展示项目作品与技术成长记录"),
    bullet("集成大语言模型（LLM）能力，提供实时 AI 对话服务"),
    bullet("托管并分发西藏高考备考资料（历史、政治、文综），服务特定考生群体"),
    bullet("形成可复用的全栈项目模板，降低后续项目启动成本"),
    h2("1.3 核心功能"),
    bullet("AI 实时对话：基于 DeepSeek 大模型的流式对话，支持 Server-Sent Events (SSE) 逐字输出"),
    bullet("备考资料库：托管 21 份西藏高考复习资料（Word 文档），按学科分类，支持一键下载"),
    bullet("内容展示：首页目录导航、项目展示、成长记录等多页面架构"),
    bullet("响应式设计：适配桌面端与移动端浏览器"),
    spacer(),
  ];
}

function section2Architecture() {
  return [
    h1("二、系统架构"),
    h2("2.1 整体架构"),
    p("本系统采用前后端分离架构（BFF 模式），前端为 Vue 3 单页应用（SPA），后端为 Python FastAPI 服务。两者独立部署于 Vercel 云平台，通过 HTTPS 协议通信。AI 能力通过调用第三方 DeepSeek API 实现。"),
    emptyLine(),
    boldP("架构层次划分："),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2400, 2400, 2200, 2360],
      rows: [
        new TableRow({ children: [
          tableHeaderCell("层次", 2400), tableHeaderCell("技术组件", 2400),
          tableHeaderCell("部署平台", 2200), tableHeaderCell("职责", 2360),
        ]}),
        new TableRow({ children: [
          tableCell("表现层", 2400), tableCell("Vue 3 + Vite + Router", 2400),
          tableCell("Vercel CDN", 2200), tableCell("页面渲染、路由导航、用户交互", 2360),
        ]}),
        new TableRow({ children: [
          tableCell("服务层", 2400), tableCell("FastAPI + OpenAI SDK", 2400),
          tableCell("Vercel Serverless", 2200), tableCell("API 网关、请求处理、SSE 流式转发", 2360),
        ]}),
        new TableRow({ children: [
          tableCell("AI 层", 2400), tableCell("DeepSeek API", 2400),
          tableCell("DeepSeek 云端", 2200), tableCell("大语言模型推理与流式生成", 2360),
        ]}),
        new TableRow({ children: [
          tableCell("存储层", 2400), tableCell("Vercel Static Files", 2400),
          tableCell("Vercel Edge", 2200), tableCell("静态资源托管与 CDN 分发", 2360),
        ]}),
      ],
    }),
    spacer(),
    h2("2.2 请求链路"),
    p("用户浏览器 → haoriver.site（前端 SPA）→ api.haoriver.site（后端 FastAPI）→ api.deepseek.com（AI 推理）"),
    p("静态资源请求直接由 Vercel CDN 响应，不经过后端服务，降低服务端负载。"),
    spacer(),
  ];
}

function section3TechStack() {
  return [
    h1("三、技术栈"),
    h2("3.1 前端技术"),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2800, 3260, 3300],
      rows: [
        new TableRow({ children: [
          tableHeaderCell("技术", 2800), tableHeaderCell("版本", 3260), tableHeaderCell("用途", 3300),
        ]}),
        new TableRow({ children: [
          tableCell("Vue 3", 2800), tableCell("3.x (Composition API)", 3260),
          tableCell("前端框架，使用 <script setup> 语法", 3300),
        ]}),
        new TableRow({ children: [
          tableCell("Vite", 2800), tableCell("6.4", 3260),
          tableCell("构建工具，开发服务器与生产打包", 3300),
        ]}),
        new TableRow({ children: [
          tableCell("Vue Router", 2800), tableCell("4.x", 3260),
          tableCell("客户端路由，懒加载页面组件", 3300),
        ]}),
        new TableRow({ children: [
          tableCell("CSS 变量系统", 2800), tableCell("—", 3260),
          tableCell("暖灰色调 + Fraunces/DM Sans 字体", 3300),
        ]}),
      ],
    }),
    spacer(),
    h2("3.2 后端技术"),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2800, 3260, 3300],
      rows: [
        new TableRow({ children: [
          tableHeaderCell("技术", 2800), tableHeaderCell("版本", 3260), tableHeaderCell("用途", 3300),
        ]}),
        new TableRow({ children: [
          tableCell("Python", 2800), tableCell("3.12 (Vercel 运行时)", 3260),
          tableCell("后端开发语言", 3300),
        ]}),
        new TableRow({ children: [
          tableCell("FastAPI", 2800), tableCell("0.115", 3260),
          tableCell("异步 Web 框架，自动 OpenAPI 文档", 3300),
        ]}),
        new TableRow({ children: [
          tableCell("OpenAI SDK", 2800), tableCell("1.68", 3260),
          tableCell("兼容 DeepSeek API 调用（OpenAI 协议）", 3300),
        ]}),
        new TableRow({ children: [
          tableCell("Uvicorn", 2800), tableCell("0.34", 3260),
          tableCell("本地开发 ASGI 服务器", 3300),
        ]}),
        new TableRow({ children: [
          tableCell("Python-dotenv", 2800), tableCell("1.0", 3260),
          tableCell("本地环境变量管理", 3300),
        ]}),
      ],
    }),
    spacer(),
    h2("3.3 部署平台"),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2800, 3260, 3300],
      rows: [
        new TableRow({ children: [
          tableHeaderCell("平台", 2800), tableHeaderCell("托管内容", 3260), tableHeaderCell("说明", 3300),
        ]}),
        new TableRow({ children: [
          tableCell("Vercel", 2800), tableCell("前端 + 后端", 3260),
          tableCell("Serverless 部署，全球 CDN，自动构建", 3300),
        ]}),
        new TableRow({ children: [
          tableCell("GitHub", 2800), tableCell("代码仓库", 3260),
          tableCell("版本管理，备份与协作", 3300),
        ]}),
        new TableRow({ children: [
          tableCell("腾讯云", 2800), tableCell("DNS 域名解析", 3260),
          tableCell("haoriver.site 域名注册与解析", 3300),
        ]}),
        new TableRow({ children: [
          tableCell("DeepSeek", 2800), tableCell("AI 模型 API", 3260),
          tableCell("提供对话推理能力（OpenAI 兼容协议）", 3300),
        ]}),
      ],
    }),
    spacer(),
  ];
}

function section4Frontend() {
  return [
    h1("四、前端设计"),
    h2("4.1 组件与页面结构"),
    p("前端采用单页应用（SPA）架构，所有页面通过 Vue Router 客户端路由切换，无需整页刷新。"),
    emptyLine(),
    boldP("路由表："),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [1600, 2200, 2400, 3160],
      rows: [
        new TableRow({ children: [
          tableHeaderCell("路径", 1600), tableHeaderCell("页面名称", 2200),
          tableHeaderCell("组件文件", 2400), tableHeaderCell("功能描述", 3160),
        ]}),
        new TableRow({ children: [
          tableCell("/", 1600), tableCell("首页 (Home)", 2200),
          tableCell("views/Home.vue", 2400),
          tableCell("个人问候、目录式导航、动态列表", 3160),
        ]}),
        new TableRow({ children: [
          tableCell("/chat", 1600), tableCell("AI 聊天 (Chat)", 2200),
          tableCell("views/Chat.vue", 2400),
          tableCell("DeepSeek SSE 流式对话，健康检查", 3160),
        ]}),
        new TableRow({ children: [
          tableCell("/tools", 1600), tableCell("备考资料 (Tools)", 2200),
          tableCell("views/Tools.vue", 2400),
          tableCell("21 份 Word 文档按学科分类展示与下载", 3160),
        ]}),
        new TableRow({ children: [
          tableCell("/blog", 1600), tableCell("成长记录 (Blog)", 2200),
          tableCell("views/Blog.vue", 2400),
          tableCell("学习笔记与思考文章", 3160),
        ]}),
        new TableRow({ children: [
          tableCell("/projects", 1600), tableCell("项目展示 (Projects)", 2200),
          tableCell("views/Projects.vue", 2400),
          tableCell("课余项目与实验成果", 3160),
        ]}),
      ],
    }),
    spacer(),
    h2("4.2 样式系统"),
    p("采用 CSS 变量驱动的设计令牌（Design Token）体系，集中定义色板、字体、间距、圆角等视觉属性，确保全站视觉一致性。"),
    bullet("主字体：Fraunces（标题 / 展示）、DM Sans（正文）"),
    bullet("配色方案：暖灰色底 (#F1EEEA) + 白色卡片 + 橙棕点缀 (#D45D3A)"),
    bullet("响应式断点：600px 以下自动切换移动端布局"),
    bullet("动画系统：CSS @keyframes 交错淡入，延迟基于 CSS 变量 --i 递增"),
    spacer(),
    h2("4.3 环境变量管理"),
    p("前端通过 Vite 环境变量机制管理不同环境的 API 地址："),
    bullet("开发环境 (.env.development)：VITE_API_URL=http://localhost:8000"),
    bullet("生产环境 (.env.production)：VITE_API_URL=https://api.haoriver.site"),
    bullet("运行时通过 import.meta.env.VITE_API_URL 动态获取，无需硬编码"),
    spacer(),
  ];
}

function section5Backend() {
  return [
    h1("五、后端设计"),
    h2("5.1 API 接口规范"),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [1300, 1100, 2400, 4560],
      rows: [
        new TableRow({ children: [
          tableHeaderCell("方法", 1300), tableHeaderCell("路径", 1100),
          tableHeaderCell("Content-Type", 2400), tableHeaderCell("说明", 4560),
        ]}),
        new TableRow({ children: [
          tableCell("GET", 1300), tableCell("/api/health", 1100),
          tableCell("application/json", 2400),
          tableCell("健康检查接口，返回 {\"status\": \"ok\"}，用于前端连接状态检测", 4560),
        ]}),
        new TableRow({ children: [
          tableCell("POST", 1300), tableCell("/api/chat", 1100),
          tableCell("text/event-stream (SSE)", 2400),
          tableCell("AI 对话接口。接收消息数组，返回 SSE 流式文本。每条数据格式：data: {text}\\n\\n，结束标记：data: [DONE]\\n\\n", 4560),
        ]}),
      ],
    }),
    spacer(),
    h2("5.2 SSE 流式传输设计"),
    p("聊天接口采用 Server-Sent Events (SSE) 协议实现逐字流式输出，而非传统请求-响应模式。"),
    p("核心流程："),
    numItem("前端通过 fetch + ReadableStream 发起 POST 请求", "numbers1"),
    numItem("后端收到请求后，调用 DeepSeek API（stream=True）", "numbers1"),
    numItem("DeepSeek 逐 token 返回数据块", "numbers1"),
    numItem("后端微服务将每个 chunk 包装为 SSE 格式（data: {text}\\n\\n）并 yield 输出", "numbers1"),
    numItem("前端 reader.read() 循环消费数据流，实时更新界面文本", "numbers1"),
    numItem("流结束后发送 data: [DONE]\\n\\n 标记，前端将完整回复存入消息列表", "numbers1"),
    spacer(),
    h2("5.3 CORS 跨域策略"),
    p("由于前端 (haoriver.site) 与后端 (api.haoriver.site) 使用不同子域名，浏览器同源策略会拦截跨域请求。后端通过 FastAPI CORSMiddleware 中间件声明允许的前端来源："),
    bullet("http://localhost:5173 — 本地开发环境"),
    bullet("https://haoriver.site — 生产前端主域名"),
    bullet("https://www.haoriver.site — www 子域名"),
    bullet("https://frontend-nu-three-68.vercel.app — Vercel 默认域名"),
    p("同时支持通过环境变量 CORS_ORIGINS 动态扩展允许列表，无需修改代码。"),
    spacer(),
    h2("5.4 错误处理"),
    p("后端利用 FastAPI 内置的异常处理机制和 Pydantic 数据验证，自动处理以下场景："),
    bullet("请求体 JSON 格式错误 → 返回 422 Unprocessable Entity 及详细错误定位"),
    bullet("DeepSeek API 调用失败 → 流中断，前端捕获异常并显示友好错误提示"),
    bullet("网络超时 → FastAPI 自动终止连接，避免资源泄漏"),
    spacer(),
  ];
}

function section6Deployment() {
  return [
    h1("六、部署架构"),
    h2("6.1 部署拓扑"),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2000, 2000, 2600, 2760],
      rows: [
        new TableRow({ children: [
          tableHeaderCell("组件", 2000), tableHeaderCell("平台", 2000),
          tableHeaderCell("域名", 2600), tableHeaderCell("部署方式", 2760),
        ]}),
        new TableRow({ children: [
          tableCell("前端", 2000), tableCell("Vercel (frontend)", 2000),
          tableCell("haoriver.site", 2600),
          tableCell("Vercel CLI deploy --prod", 2760),
        ]}),
        new TableRow({ children: [
          tableCell("后端", 2000), tableCell("Vercel (backend)", 2000),
          tableCell("api.haoriver.site", 2600),
          tableCell("Vercel CLI deploy --prod", 2760),
        ]}),
        new TableRow({ children: [
          tableCell("DNS", 2000), tableCell("腾讯云 DNSPod", 2000),
          tableCell("—", 2600),
          tableCell("A 记录 → 76.76.21.21 (Vercel)", 2760),
        ]}),
      ],
    }),
    spacer(),
    h2("6.2 构建与发布流程"),
    p("当前采用手动部署模式（CLI），未来可切换为 Git 驱动的自动部署（CI/CD）："),
    numItem("本地开发 → 代码提交到 GitHub", "numbers2"),
    numItem("终端执行 vercel deploy --prod 部署到 Vercel 生产环境", "numbers2"),
    numItem("Vercel 自动检测项目类型（前端 Vite / 后端 Python FastAPI）并执行构建", "numbers2"),
    numItem("构建产物通过 Vercel 全球 CDN 分发", "numbers2"),
    numItem("域名自动绑定（Alias）到 haoriver.site 和 api.haoriver.site", "numbers2"),
    spacer(),
    h2("6.3 DNS 配置"),
    p("域名 haoriver.site 注册于腾讯云，通过 DNSPod 管理解析记录。Vercel 要求两条 A 记录将域名指向其边缘网络："),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2000, 2000, 2000, 3360],
      rows: [
        new TableRow({ children: [
          tableHeaderCell("主机记录", 2000), tableHeaderCell("记录类型", 2000),
          tableHeaderCell("记录值", 2000), tableHeaderCell("说明", 3360),
        ]}),
        new TableRow({ children: [
          tableCell("@", 2000), tableCell("A", 2000),
          tableCell("76.76.21.21", 2000), tableCell("根域名，指向 Vercel 前端", 3360),
        ]}),
        new TableRow({ children: [
          tableCell("www", 2000), tableCell("CNAME", 2000),
          tableCell("cname.vercel-dns.com", 2000), tableCell("www 子域名", 3360),
        ]}),
        new TableRow({ children: [
          tableCell("api", 2000), tableCell("A", 2000),
          tableCell("76.76.21.21", 2000), tableCell("API 子域名，指向 Vercel 后端", 3360),
        ]}),
      ],
    }),
    spacer(),
  ];
}

function section7Features() {
  return [
    h1("七、功能模块详述"),
    h2("7.1 首页 (Home)"),
    bullet("个性化问候语，展示站长身份"),
    bullet("目录式导航：4 个入口（AI 聊天、备考资料、成长记录、项目展示），每个带编号和描述"),
    bullet("交错淡入动画：基于 CSS 自定义变量 --i 的延迟级联效果"),
    bullet("「最近在做」动态列表，呈现当前学习与工作重点"),
    spacer(),
    h2("7.2 AI 聊天 (Chat)"),
    bullet("提供文本框输入，回车或点击发送触发对话"),
    bullet("每次对话自动附带系统提示词（System Prompt）：要求 AI 以友好中文回复"),
    bullet("前端维护完整消息历史，每次请求附带全量上下文"),
    bullet("流式输出：AI 回复逐字显示，而非等待完整响应"),
    bullet("页面挂载时自动检测后端连接状态（GET /api/health）"),
    bullet("连接失败时显示明确的错误提示，不会误导用户"),
    spacer(),
    h2("7.3 备考资料库 (Tools)"),
    bullet("按学科分组展示 21 份 Word (.docx) 文档"),
    bullet("三个分区：高考历史（7 份）、高考政治（8 份）、高考西藏文综训练卷（6 份）"),
    bullet("文件名为完整中文标题，如「2026年西藏高考历史押题训练卷（一）」"),
    bullet("点击即下载，无需登录或额外操作"),
    bullet("文件通过 Vite public/ 目录托管，部署时随前端一同上传至 Vercel CDN"),
    spacer(),
    h2("7.4 成长记录 (Blog)"),
    bullet("预留页面，用于发布学习笔记、技术文章和项目日志"),
    bullet("支持后续扩展为 Markdown 驱动的静态博客系统"),
    spacer(),
    h2("7.5 项目展示 (Projects)"),
    bullet("预留页面，用于展示课余动手项目和技术实验"),
    bullet("支持后续扩展为卡片式项目集展示"),
    spacer(),
  ];
}

function section8Security() {
  return [
    h1("八、安全设计"),
    h2("8.1 API 密钥管理"),
    bullet("DeepSeek API 密钥仅存储于 Vercel 环境变量中，不写入代码仓库"),
    bullet(".env 文件已列入 .gitignore，确保密钥不被提交至 GitHub"),
    bullet("本地开发通过 python-dotenv 从 .env 文件加载，生产环境从 Vercel 注入"),
    spacer(),
    h2("8.2 CORS 防护"),
    bullet("后端仅允许白名单内的域名发起跨域请求，拒绝未授权来源"),
    bullet("不允许通配符 * 作为允许来源，明确列出每个合法域名"),
    spacer(),
    h2("8.3 输入验证"),
    bullet("后端使用 Pydantic BaseModel 对请求体进行严格类型校验"),
    bullet("messages 字段限定为 list[dict] 结构，拒绝非法数据格式"),
    spacer(),
    h2("8.4 部署安全"),
    bullet("Vercel 部署保护 (Deployment Protection) 默认开启，预览链接需认证"),
    bullet("生产环境域名绑定后自动启用 HTTPS（TLS 1.3）"),
    spacer(),
  ];
}

function section9Future() {
  return [
    h1("九、未来规划"),
    h2("9.1 短期（1-2 周）"),
    bullet("成长记录 (Blog) 页面填充实际内容"),
    bullet("项目展示页面上线具体项目详情"),
    bullet("接入 Vercel Analytics 进行访问统计"),
    spacer(),
    h2("9.2 中期（1-3 个月）"),
    bullet("将部署流程从手动 CLI 升级为 Git push 自动部署 (CI/CD)"),
    bullet("备考资料支持在线预览（.docx → HTML 渲染），减少下载依赖"),
    bullet("AI 聊天支持对话历史保存与多轮会话管理"),
    bullet("引入 Markdown 渲染，实现富文本博客发布"),
    spacer(),
    h2("9.3 长期（3-6 个月）"),
    bullet("基于 DeepSeek API 构建西藏高考智能问答系统 (RAG)"),
    bullet("用户系统：登录认证与个性化收藏"),
    bullet("后台管理面板：资料上传、内容编辑的 Web 界面"),
    bullet("性能优化：前端 ISR 预渲染、后端缓存层"),
    spacer(),
  ];
}

function section10Appendix() {
  return [
    h1("十、附录"),
    h2("10.1 项目仓库"),
    bullet("GitHub：https://github.com/weiwenhao-0316/personal-site"),
    bullet("前端生产地址：https://haoriver.site"),
    bullet("后端接口地址：https://api.haoriver.site"),
    spacer(),
    h2("10.2 关键环境变量"),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2800, 3600, 2960],
      rows: [
        new TableRow({ children: [
          tableHeaderCell("变量名", 2800), tableHeaderCell("说明", 3600), tableHeaderCell("作用域", 2960),
        ]}),
        new TableRow({ children: [
          tableCell("DEEPSEEK_API_KEY", 2800), tableCell("DeepSeek API 密钥", 3600), tableCell("后端环境变量", 2960),
        ]}),
        new TableRow({ children: [
          tableCell("DEEPSEEK_BASE_URL", 2800), tableCell("DeepSeek API 地址", 3600), tableCell("后端环境变量", 2960),
        ]}),
        new TableRow({ children: [
          tableCell("DEEPSEEK_MODEL", 2800), tableCell("使用的模型名称 (deepseek-chat)", 3600), tableCell("后端环境变量", 2960),
        ]}),
        new TableRow({ children: [
          tableCell("VITE_API_URL", 2800), tableCell("前端调用的后端 API 地址", 3600), tableCell("前端构建时", 2960),
        ]}),
        new TableRow({ children: [
          tableCell("CORS_ORIGINS", 2800), tableCell("额外允许的跨域来源（逗号分隔）", 3600), tableCell("后端环境变量", 2960),
        ]}),
        new TableRow({ children: [
          tableCell("PORT", 2800), tableCell("服务监听端口（本地默认 8000）", 3600), tableCell("后端环境变量", 2960),
        ]}),
      ],
    }),
    spacer(),
    h2("10.3 项目文件结构"),
    new Paragraph({
      spacing: { after: 60, line: 300 },
      children: [new TextRun({
        text: [
          "personal-site/",
          "├── frontend/                  # Vue 3 前端",
          "│   ├── src/",
          "│   │   ├── views/            # 5 个页面组件",
          "│   │   │   ├── Home.vue      # 首页",
          "│   │   │   ├── Chat.vue      # AI 聊天（SSE 流式）",
          "│   │   │   ├── Tools.vue     # 备考资料下载",
          "│   │   │   ├── Blog.vue      # 成长记录",
          "│   │   │   └── Projects.vue  # 项目展示",
          "│   │   ├── components/       # 公共组件（NavBar）",
          "│   │   ├── router/           # 路由配置",
          "│   │   ├── App.vue           # 根组件",
          "│   │   ├── main.js           # 入口文件",
          "│   │   └── style.css         # 全局样式",
          "│   ├── public/exam/          # 备考资料静态文件",
          "│   │   ├── 高考历史/         # 7 份 .docx",
          "│   │   ├── 高考政治/         # 8 份 .docx",
          "│   │   └── 高考西藏文综4pro生成训练卷/  # 6 份 .docx",
          "│   ├── .env.development      # 开发环境变量",
          "│   └── .env.production       # 生产环境变量",
          "│",
          "└── backend/                   # FastAPI 后端",
          "    ├── api/index.py          # Vercel 入口点",
          "    ├── main.py               # FastAPI 应用（/api/health + /api/chat）",
          "    ├── requirements.txt      # Python 依赖声明",
          "    ├── vercel.json           # Vercel 路由配置",
          "    └── .env                  # 本地密钥（不提交 Git）",
        ].join("\n"),
        font: "Courier New",
        size: 17,
        color: C.text,
      })],
    }),
    spacer(),
  ];
}

// ===== Build Document =====
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 21 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: C.primary },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: C.accent },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: C.primary },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "numbers1",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "numbers2",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [
    // Section 0: Cover
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
          new TextRun({ text: "haoriver.site 技术设计文档", font: "Arial", size: 16, color: C.muted }),
        ]})] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: "— Page ", font: "Arial", size: 16, color: C.muted }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: C.muted }),
          new TextRun({ text: " —", font: "Arial", size: 16, color: C.muted }),
        ]})] }),
      },
      children: [
        ...coverPage(),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // Section 1: TOC
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
          new TextRun({ text: "haoriver.site 技术设计文档", font: "Arial", size: 16, color: C.muted }),
        ]})] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: "— Page ", font: "Arial", size: 16, color: C.muted }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: C.muted }),
          new TextRun({ text: " —", font: "Arial", size: 16, color: C.muted }),
        ]})] }),
      },
      children: [
        ...tocPage(),
      ],
    },
    // Section 2: All content
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
          new TextRun({ text: "haoriver.site 技术设计文档", font: "Arial", size: 16, color: C.muted }),
        ]})] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: "— Page ", font: "Arial", size: 16, color: C.muted }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: C.muted }),
          new TextRun({ text: " —", font: "Arial", size: 16, color: C.muted }),
        ]})] }),
      },
      children: [
        ...section1Overview(),
        ...section2Architecture(),
        ...section3TechStack(),
        ...section4Frontend(),
        ...section5Backend(),
        ...section6Deployment(),
        ...section7Features(),
        ...section8Security(),
        ...section9Future(),
        ...section10Appendix(),
      ],
    },
  ],
});

// ===== Generate =====
const outputPath = "D:/claude test/personal-site/haoriver-site-设计文档.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log("✅ 文档生成完成：" + outputPath);
  console.log("   文件大小：" + (buffer.length / 1024).toFixed(1) + " KB");
}).catch(err => {
  console.error("❌ 生成失败：", err.message);
  process.exit(1);
});
