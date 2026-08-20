const STORAGE_KEY = 'personal-collection-v1'

const seedItems = [
  {
    id: 'bili-ai-agent',
    platform: 'Bilibili',
    title: 'Agent 学习路线：从 API 到工具调用',
    url: 'https://www.bilibili.com',
    cover: '',
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
    cover: '',
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
    cover: '',
    category: '学习方法',
    tags: ['复盘', '考试', '长期主义'],
    note: '可以和资料库联动，把资料、题目、复盘放到同一个主题下。',
    createdAt: '2026-07-21',
    status: '待批注',
  },
]

const coverPresets = [
  'linear-gradient(135deg, #9cc9c4 0%, #e7d9c9 55%, #f7f2e9 100%)',
  'linear-gradient(135deg, #e2a98a 0%, #f2dcc6 48%, #edf4ef 100%)',
  'linear-gradient(135deg, #b8bf96 0%, #f0e6c8 52%, #ffffff 100%)',
  'linear-gradient(135deg, #9aaed1 0%, #dce6ee 48%, #f7f1e7 100%)',
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeItem(item, index = 0) {
  return {
    id: item.id || crypto.randomUUID(),
    platform: item.platform?.trim() || 'Web',
    title: item.title?.trim() || '未命名收藏',
    url: item.url?.trim() || '#',
    cover: item.cover?.trim() || coverPresets[index % coverPresets.length],
    category: item.category?.trim() || '未分类',
    tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
    note: item.note?.trim() || '',
    createdAt: item.createdAt || today(),
    status: item.status?.trim() || '待整理',
  }
}

function read() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return seedItems.map(normalizeItem)

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(normalizeItem) : seedItems.map(normalizeItem)
  } catch {
    return seedItems.map(normalizeItem)
  }
}

function write(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useCollectionStore() {
  const list = () => read()

  const create = (payload) => {
    const items = read()
    const item = normalizeItem({ ...payload, id: crypto.randomUUID(), createdAt: today() }, items.length)
    const next = [item, ...items]
    write(next)
    return item
  }

  const update = (id, payload) => {
    const items = read()
    const next = items.map((item, index) => {
      if (item.id !== id) return item
      return normalizeItem({ ...item, ...payload, id: item.id, createdAt: item.createdAt }, index)
    })
    write(next)
    return next.find(item => item.id === id)
  }

  const remove = (id) => {
    const next = read().filter(item => item.id !== id)
    write(next)
  }

  return { list, create, update, remove }
}

