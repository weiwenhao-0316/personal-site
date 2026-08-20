const STORAGE_KEY = 'personal-notes-v1'

const seedNotes = [
  {
    id: 'site-rebuild',
    date: '2026-07-27',
    mood: '重构',
    title: '把个人网站从展示页改成个人系统',
    excerpt: '先让网站能承载自己的内容流，再逐步接入数据库、AI 摘要和自动分类。',
    content: '收藏不是终点。真正有价值的是把外部内容变成自己的笔记、项目和判断。',
    tags: ['个人网站', 'Vue', '产品设计'],
  },
  {
    id: 'learning-loop',
    date: '2026-07-20',
    mood: '学习',
    title: '输入、整理、输出是一个闭环',
    excerpt: '收藏不是终点，真正有价值的是把外部内容变成自己的笔记、项目和判断。',
    content: '先快速收集，再定期整理，最后输出成可以复用的经验。',
    tags: ['学习方法', '复盘'],
  },
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeNote(note) {
  const content = note.content?.trim() || note.excerpt?.trim() || ''
  return {
    id: note.id || crypto.randomUUID(),
    date: note.date || today(),
    mood: note.mood?.trim() || '记录',
    title: note.title?.trim() || '未命名笔记',
    excerpt: note.excerpt?.trim() || content.slice(0, 80),
    content,
    tags: Array.isArray(note.tags) ? note.tags.filter(Boolean) : [],
  }
}

function read() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return seedNotes.map(normalizeNote)

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(normalizeNote) : seedNotes.map(normalizeNote)
  } catch {
    return seedNotes.map(normalizeNote)
  }
}

function write(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export function useNotesStore() {
  const list = () => read()

  const create = (payload) => {
    const note = normalizeNote({ ...payload, id: crypto.randomUUID(), date: today() })
    const next = [note, ...read()]
    write(next)
    return note
  }

  const update = (id, payload) => {
    const next = read().map(note => {
      if (note.id !== id) return note
      return normalizeNote({ ...note, ...payload, id: note.id, date: note.date })
    })
    write(next)
    return next.find(note => note.id === id)
  }

  const remove = (id) => {
    write(read().filter(note => note.id !== id))
  }

  return { list, create, update, remove }
}

