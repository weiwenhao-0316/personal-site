// 笔记数据存储 —— P1 数据上云
// 从浏览器 localStorage 迁移到服务器 MySQL（通过 /api/notes 接口），
// 套路与 useCollectionStore.js 完全一致：接口地址由 .env 的 VITE_API_URL 决定。

const apiUrl = import.meta.env.VITE_API_URL || ''
const BASE = `${apiUrl}/api/notes`

// 统一请求封装：非 200 就抛错（错误信息取后端 detail 字段），与收藏页同一套
async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let detail = `请求失败（${res.status}）`
    try {
      const data = await res.json()
      if (data.detail) detail = data.detail
    } catch { /* 响应不是 JSON 就保留默认文案 */ }
    throw new Error(detail)
  }
  return res.json()
}

// 补全缺字段的笔记为完整形态（默认值与旧版 localStorage 行为一致）
function normalizeNote(note) {
  return {
    id: note.id,
    date: note.date || '',
    mood: note.mood || '记录',
    title: note.title || '未命名笔记',
    excerpt: note.excerpt || '',
    content: note.content || '',
    tags: Array.isArray(note.tags) ? note.tags : [],
  }
}

export function useNotesStore() {
  // 【查】GET /api/notes —— 获取全部笔记
  const list = async () => {
    const rows = await request(BASE)
    return rows.map(normalizeNote)
  }

  // 【增】POST /api/notes —— 新增（id 和日期由后端生成）
  const create = async (payload) => {
    return request(BASE, { method: 'POST', body: JSON.stringify(payload) })
  }

  // 【改】PUT /api/notes/某id —— 更新指定笔记
  const update = async (id, payload) => {
    return request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  }

  // 【删】DELETE /api/notes/某id —— 删除指定笔记
  const remove = async (id) => {
    return request(`${BASE}/${id}`, { method: 'DELETE' })
  }

  return { list, create, update, remove }
}
