export const quickLinks = [
  {
    path: '/collection',
    eyebrow: 'Capture',
    title: '收藏',
    desc: '把 B 站、抖音、文章和灵感先收进来，再慢慢整理成自己的知识。',
    accent: '#78a6a3',
  },
  {
    path: '/notes',
    eyebrow: 'Journal',
    title: '笔记',
    desc: '学习记录、经验复盘、日记和阶段性总结，按时间沉淀。',
    accent: '#c58f72',
  },
  {
    path: '/library',
    eyebrow: 'Library',
    title: '资料库',
    desc: '备考资料、模板、文档和可下载资源，未来接入完整增删改查。',
    accent: '#9b9c7a',
  },
  {
    path: '/projects',
    eyebrow: 'Build',
    title: '项目',
    desc: '把做过的工具、实验和个人网站本身做成可讲述的案例。',
    accent: '#7d94bd',
  },
]

export const recentUpdates = [
  {
    type: '收藏',
    title: '把喜欢的视频做成自己的灵感库',
    date: '2026-07-27',
    desc: '第一阶段先存链接、封面、标签和个人批注，后续再接 AI 摘要。',
  },
  {
    type: '项目',
    title: '个人数字空间重构',
    date: '2026-07-27',
    desc: '从静态个人页升级成收藏、笔记、资料、项目统一管理的个人系统。',
  },
  {
    type: '笔记',
    title: '为什么仓库应该是中转站',
    date: '2026-07-26',
    desc: '先收纳，再分类，最后沉淀到页面，避免一开始就把结构做死。',
  },
]

export const collectionItems = [
  {
    id: 'bili-ai-agent',
    platform: 'Bilibili',
    title: 'Agent 学习路线：从 API 到工具调用',
    url: 'https://www.bilibili.com',
    cover: 'linear-gradient(135deg, #9cc9c4 0%, #e7d9c9 55%, #f7f2e9 100%)',
    category: 'AI 学习',
    tags: ['Agent', 'API', '路线'],
    note: '适合整理成一篇学习路线笔记，重点关注 API、RAG、Tool Use、Memory 的顺序。',
    createdAt: '2026-07-27',
    status: '稍后整理',
  },
  {
    id: 'douyin-content',
    platform: 'Douyin',
    title: '自媒体选题拆解：一个视频为什么能爆',
    url: 'https://www.douyin.com',
    cover: 'linear-gradient(135deg, #e2a98a 0%, #f2dcc6 48%, #edf4ef 100%)',
    category: '自媒体',
    tags: ['选题', '脚本', '复盘'],
    note: '后续可以加字段：开头 3 秒、标题、转折点、评论区反馈。',
    createdAt: '2026-07-24',
    status: '已看',
  },
  {
    id: 'study-method',
    platform: 'Web',
    title: '高效学习方法：错题、复盘和间隔重复',
    url: '#',
    cover: 'linear-gradient(135deg, #b8bf96 0%, #f0e6c8 52%, #ffffff 100%)',
    category: '学习方法',
    tags: ['复盘', '考试', '长期主义'],
    note: '可以和资料库联动，把资料、题目、复盘放到同一个主题下。',
    createdAt: '2026-07-21',
    status: '待批注',
  },
]

export const notes = [
  {
    id: 'site-rebuild',
    date: '2026-07-27',
    mood: '重构',
    title: '把个人网站从展示页改成个人系统',
    excerpt: '先让网站能承载自己的内容流，再逐步接入数据库、AI 摘要和自动分类。',
    tags: ['个人网站', 'Vue', '产品设计'],
  },
  {
    id: 'learning-loop',
    date: '2026-07-20',
    mood: '学习',
    title: '输入、整理、输出是一个闭环',
    excerpt: '收藏不是终点，真正有价值的是把外部内容变成自己的笔记、项目和判断。',
    tags: ['学习方法', '复盘'],
  },
]

export const libraryGroups = [
  {
    name: '高考历史',
    desc: '历史押题卷、速查手册和论述题专项。',
    files: [
      '2026 西藏高考历史押题训练卷（一）.docx',
      '2026 西藏高考历史押题训练卷（二）.docx',
      '2026 西藏高考历史论述题应试专项.docx',
      '2026 西藏高考历史选择题专项训练卷.docx',
      '2026 西藏高考历史速查手册.docx',
    ],
  },
  {
    name: '高考政治',
    desc: '政治训练卷、选择题专项和时政热点。',
    files: [
      '2026 西藏高考政治押题训练卷（一）.docx',
      '2026 西藏高考政治押题训练卷（二）.docx',
      '2026 高考政治时政热点深度解读.docx',
      '高中政治完全手册.docx',
    ],
  },
  {
    name: '文综训练',
    desc: '文综均衡型押题、答题术语和综合训练。',
    files: [
      '2026 西藏高考政治大题术语总结与答题技巧.docx',
      '2026 西藏高考文综均衡型押题训练卷（一）.docx',
      '2026 西藏高考文综均衡型押题训练卷（二）.docx',
    ],
  },
]

export const projects = [
  {
    name: '个人数字空间',
    desc: 'Vue 3 + FastAPI 构建的个人网站，从展示页升级为收藏、笔记、资料库和项目系统。',
    tags: ['Vue 3', 'FastAPI', 'Vercel'],
    status: '进行中',
    link: '#',
  },
  {
    name: '视频收藏与批注系统',
    desc: '收集 B 站、抖音和网页视频，记录封面、链接、标签、日期和个人批注，后续接入 AI 摘要。',
    tags: ['产品设计', '数据模型', 'AI 摘要'],
    status: '规划中',
    link: '#',
  },
  {
    name: '备考资料生成工具',
    desc: '把复习资料、押题卷和速查手册整理成可下载资源，后续改造成可管理的资料库。',
    tags: ['Python', '文档生成', '学习工具'],
    status: '可优化',
    link: '#',
  },
]

