// 收藏数据存储 —— 第5关核心文件
// 重大升级：数据来源从"浏览器 localStorage"换成"服务器 MySQL"（通过 /api/collections 接口）
// 从此收藏数据存在服务器上，换浏览器、换手机都能看到同一份数据。

// 接口地址：本地开发时由 .env 的 VITE_API_URL 决定；
// 线上打包后（.env.production）指向自己的域名，前后端同源，不存在跨域问题。
const apiUrl = import.meta.env.VITE_API_URL || ''
const BASE = `${apiUrl}/api/collections`

// 封面渐变预设：数据库里 cover 为空时，按顺序自动分配一个渐变背景（和旧版行为一致）
const coverPresets = [
  'linear-gradient(135deg, #9cc9c4 0%, #e7d9c9 55%, #f7f2e9 100%)',
  'linear-gradient(135deg, #e2a98a 0%, #f2dcc6 48%, #edf4ef 100%)',
  'linear-gradient(135deg, #b8bf96 0%, #f0e6c8 52%, #ffffff 100%)',
  'linear-gradient(135deg, #9aaed1 0%, #dce6ee 48%, #f7f1e7 100%)',
]

// 把后端返回的一条数据"规整"成页面需要的样子（缺字段就补默认值）
function normalizeItem(item, index = 0) {
  return {
    id: item.id,
    platform: item.platform || 'Web',
    title: item.title || '未命名收藏',
    url: item.url || '#',
    cover: item.cover || coverPresets[index % coverPresets.length],
    category: item.category || '未分类',
    tags: Array.isArray(item.tags) ? item.tags : [],
    note: item.note || '',
    createdAt: item.createdAt || '',
    status: item.status || '待整理',
  }
}

// 统一的请求封装：自动带上 JSON 头，非 200 就抛错（错误信息取自后端的 detail 字段）
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
    } catch { /* 响应不是 JSON 就保持默认错误文案 */ }
    throw new Error(detail)
  }
  return res.json()
}

export function useCollectionStore() {
  // 【查】GET /api/collections —— 获取全部收藏
  const list = async () => {
    const rows = await request(BASE)
    return rows.map(normalizeItem)
  }

  // 【增】POST /api/collections —— 新增（id 由后端用 UUID 生成）
  const create = async (payload) => {
    return request(BASE, { method: 'POST', body: JSON.stringify(payload) })
  }

  // 【改】PUT /api/collections/某id —— 更新指定收藏
  const update = async (id, payload) => {
    return request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  }

  // 【删】DELETE /api/collections/某id —— 删除指定收藏
  const remove = async (id) => {
    return request(`${BASE}/${id}`, { method: 'DELETE' })
  }

  return { list, create, update, remove }
}
