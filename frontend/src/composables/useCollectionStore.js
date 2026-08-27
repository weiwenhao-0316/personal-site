// 收藏数据存储 —— 第5关核心文件
// 重大升级：数据来源从"浏览器 localStorage"换成"服务器 MySQL"（通过 /api/collections 接口）
// 从此收藏数据存在服务器上，换浏览器、换手机都能看到同一份数据。

// 接口地址：本地开发时由 .env 的 VITE_API_URL 决定；
// 线上打包后（.env.production）指向自己的域名，前后端同源，不存在跨域问题。
const apiUrl = import.meta.env.VITE_API_URL || ''
const BASE = `${apiUrl}/api/collections`

// 兜底渐变预设：数据库里 cover 为空时，按收藏 id 哈希固定分配一条。
// 用 id 而不是列表下标，是因为下标会随增删变化，同一收藏的颜色就会跳来跳去；
// 哈希后颜色与内容绑定，每次刷新都稳定一致。
const coverPresets = [
  'linear-gradient(135deg, #A8C5BF, #6F9D98)',
  'linear-gradient(135deg, #C9D8C0, #8FAF8B)',
  'linear-gradient(135deg, #D9C3B2, #C98F70)',
  'linear-gradient(135deg, #F3D9B8, #D9A05B)',
]

function pickCoverPreset(id) {
  const text = String(id || '')
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  }
  return coverPresets[hash % coverPresets.length]
}

// 把后端返回的一条数据"规整"成页面需要的样子（缺字段就补默认值）
// 封面字段"实质为空"的判断：空串、或本来存的就是渐变兜底值
function isCoverMissing(cover) {
  return !cover || cover.startsWith('linear-gradient')
}

function normalizeItem(item) {
  return {
    id: item.id,
    platform: item.platform || 'Web',
    title: item.title || '未命名收藏',
    url: item.url || '#',
    // 老数据里可能存有 http:// 的封面地址，读取时统一升级成 https://，
    // 避免 HTTPS 页面加载 HTTP 图片被浏览器拦成"裂图"
    cover: isCoverMissing(item.cover)
      ? pickCoverPreset(item.id)
      : item.cover.replace(/^http:\/\//, 'https://'),
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
