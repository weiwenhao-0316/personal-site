const STORAGE_KEY = 'personal-library-v1'

const coverPresets = [
  'linear-gradient(135deg, #9b9c7a 0%, #e7ddc5 52%, #fbf7ee 100%)',
  'linear-gradient(135deg, #78a6a3 0%, #d8ece7 46%, #f6efe3 100%)',
  'linear-gradient(135deg, #c58f72 0%, #f0d8c6 48%, #edf4ef 100%)',
  'linear-gradient(135deg, #7d94bd 0%, #d8e4f1 50%, #f8f1e7 100%)',
]

const seedItems = [
  {
    id: 'history-1',
    title: '2026 年西藏高考历史押题训练卷（一）',
    category: '高考历史',
    resourceType: '文件',
    presentation: '文件下载',
    url: '/exam/高考历史/2026年西藏高考历史押题训练卷（一）.docx',
    cover: '',
    tags: ['历史', '押题卷'],
    note: '默认导入的备考资料，可下载。',
    status: '常用',
    createdAt: '2026-07-27',
  },
  {
    id: 'history-2',
    title: '2026 年西藏高考历史论述题应试专项',
    category: '高考历史',
    resourceType: '文件',
    presentation: '文件下载',
    url: '/exam/高考历史/2026年西藏高考历史论述题应试专项.docx',
    cover: '',
    tags: ['历史', '论述题'],
    note: '论述题专项训练资料。',
    status: '常用',
    createdAt: '2026-07-27',
  },
  {
    id: 'politics-1',
    title: '2026 年高考政治时政热点深度解读',
    category: '高考政治',
    resourceType: '文件',
    presentation: '文件下载',
    url: '/exam/高考政治/2026年高考政治时政热点深度解读.docx',
    cover: '',
    tags: ['政治', '时政'],
    note: '时政热点复习资料。',
    status: '常用',
    createdAt: '2026-07-27',
  },
  {
    id: 'integrated-1',
    title: '2026 年西藏高考文综均衡型押题训练卷（一）',
    category: '文综训练',
    resourceType: '文件',
    presentation: '文件下载',
    url: '/exam/高考西藏文综4pro生成训练卷/2026年西藏高考文综均衡型押题训练卷（一）.docx',
    cover: '',
    tags: ['文综', '训练卷'],
    note: '文综综合训练资料。',
    status: '待整理',
    createdAt: '2026-07-27',
  },
  {
    id: 'demo-video',
    title: '示例：B 站视频资料卡片',
    category: 'AI 学习资料',
    resourceType: '视频',
    presentation: '视频卡片',
    url: 'https://www.bilibili.com/video/BV1xx411c7mD',
    cover: '',
    tags: ['B站', '视频资料'],
    note: '你可以把 B 站、抖音、网页视频像收藏夹一样加入资料库。',
    status: '示例',
    createdAt: '2026-07-27',
  },
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeItem(item, index = 0) {
  return {
    id: item.id || crypto.randomUUID(),
    title: item.title?.trim() || '未命名资料',
    category: item.category?.trim() || '未分类',
    resourceType: item.resourceType?.trim() || '链接',
    presentation: item.presentation?.trim() || '资料卡片',
    url: item.url?.trim() || '#',
    vaultFileId: item.vaultFileId || '',
    fileName: item.fileName || '',
    cover: item.cover?.trim() || coverPresets[index % coverPresets.length],
    tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
    note: item.note?.trim() || '',
    status: item.status?.trim() || '待整理',
    createdAt: item.createdAt || today(),
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

export function useLibraryStore() {
  const list = () => read()

  const create = (payload) => {
    const items = read()
    const item = normalizeItem({ ...payload, id: crypto.randomUUID(), createdAt: today() }, items.length)
    write([item, ...items])
    return item
  }

  const update = (id, payload) => {
    const next = read().map((item, index) => {
      if (item.id !== id) return item
      return normalizeItem({ ...item, ...payload, id: item.id, createdAt: item.createdAt }, index)
    })
    write(next)
    return next.find(item => item.id === id)
  }

  const remove = (id) => {
    write(read().filter(item => item.id !== id))
  }

  return { list, create, update, remove }
}
