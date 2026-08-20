<template>
  <section class="page-shell vault-page">
    <header class="page-hero compact">
      <p class="eyebrow">Inbox</p>
      <h1>仓库</h1>
      <p>
        仓库是临时收纳箱。文件、图片、截图和链接先放这里，再转存到收藏、资料库或笔记。
        目前是本机浏览器存储，后续接云数据库和云文件存储后再同步到线上。
      </p>
    </header>

    <div class="vault-actions glass-panel">
      <button @click="linkFormOpen = true">收一个链接</button>
      <span v-if="transferMessage">{{ transferMessage }}</span>
      <span v-else>文件转资料库后，请先保留仓库原文件；它是本地下载来源。</span>
    </div>

    <div
      class="drop-zone glass-panel"
      @dragenter.prevent="dragCount++"
      @dragleave.prevent="dragCount--"
      @dragover.prevent
      @drop.prevent="onDrop"
      :class="{ dragging: dragCount > 0 }"
    >
      <label class="upload-card">
        <span>+</span>
        <strong>添加文件</strong>
        <small>支持拖拽上传，之后可转存到资料库或笔记</small>
        <input type="file" multiple hidden @change="onAdd" />
      </label>

      <article v-for="item in files" :key="item.id" class="stored-card">
        <button class="del-btn" @click="remove(item)" title="删除">&times;</button>

        <div class="thumb" @click="active = item">
          <img v-if="isImage(item)" :src="blobUrl(item)" :alt="item.name" loading="lazy" />
          <span v-else-if="isLink(item)" class="link-mark">LINK</span>
          <span v-else class="ext-tag" :style="extStyle(item.name)">{{ ext(item.name) }}</span>
        </div>

        <div class="info">
          <p class="name" :title="item.title || item.name">{{ item.title || item.name }}</p>
          <p class="meta">
            {{ isLink(item) ? '链接' : sizeStr(item.size) }} · {{ dateStr(item.addedAt) }}
          </p>
          <p v-if="item.note" class="note">{{ item.note }}</p>

          <div class="transfer-actions">
            <button v-if="isLink(item)" @click="transferToCollection(item)">转收藏</button>
            <button @click="transferToLibrary(item)">转资料库</button>
            <button @click="transferToNote(item)">转笔记</button>
          </div>
        </div>
      </article>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="linkFormOpen" class="modal-overlay" @click.self="linkFormOpen = false">
          <form class="modal-card link-form" @submit.prevent="addLinkItem">
            <div class="modal-head">
              <div>
                <p class="eyebrow">Quick Capture</p>
                <h2>收一个链接</h2>
              </div>
              <button type="button" class="modal-close" @click="linkFormOpen = false">&times;</button>
            </div>

            <label>
              <span>标题</span>
              <input v-model="linkForm.title" required placeholder="例如：值得整理的视频/文章" />
            </label>
            <label>
              <span>链接</span>
              <input v-model="linkForm.url" required placeholder="https://..." />
            </label>
            <label>
              <span>备注</span>
              <textarea v-model="linkForm.note" rows="4" placeholder="为什么先收进仓库？后续要整理到哪里？"></textarea>
            </label>

            <div class="form-actions">
              <button type="button" class="ghost-btn" @click="linkFormOpen = false">取消</button>
              <button type="submit" class="save-btn">存入仓库</button>
            </div>
          </form>
        </div>
      </Transition>

      <Transition name="fade">
        <div v-if="active" class="modal-overlay" @click.self="active = null">
          <div class="modal-card preview-card">
            <button class="modal-close" @click="active = null">&times;</button>
            <img
              v-if="isImage(active)"
              :src="blobUrl(active)"
              :alt="active.name"
              class="modal-img"
            />
            <template v-else-if="isLink(active)">
              <span class="link-mark large">LINK</span>
              <p class="modal-name">{{ active.title }}</p>
              <p class="modal-meta">{{ active.url }}</p>
              <a class="dl-link" :href="active.url" target="_blank" rel="noreferrer">打开链接</a>
            </template>
            <template v-else>
              <span class="ext-tag large" :style="extStyle(active.name)">{{ ext(active.name) }}</span>
              <p class="modal-name">{{ active.name }}</p>
              <p class="modal-meta">{{ sizeStr(active.size) }}</p>
              <a class="dl-link" :href="blobUrl(active)" :download="active.name">下载文件</a>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useVault } from '../composables/useVault.js'
import { useLibraryStore } from '../composables/useLibraryStore.js'
import { useNotesStore } from '../composables/useNotesStore.js'
import { useCollectionStore } from '../composables/useCollectionStore.js'

const { add, addLink, list, remove: removeFromDB } = useVault()
const library = useLibraryStore()
const notes = useNotesStore()
const collection = useCollectionStore()

const files = ref([])
const active = ref(null)
const dragCount = ref(0)
const error = ref('')
const transferMessage = ref('')
const linkFormOpen = ref(false)
const linkForm = reactive({ title: '', url: '', note: '' })

const urlCache = new Map()
const IMG = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'image/avif'])
const VIDEO = new Set(['video/mp4', 'video/webm', 'video/ogg'])
const TEXT_EXT = new Set(['txt', 'md', 'csv', 'json'])
const EXT_COLORS = {
  pdf: '#d05d52', doc: '#5578b8', docx: '#5578b8', xls: '#4f8f69', xlsx: '#4f8f69',
  csv: '#4f8f69', ppt: '#d48352', pptx: '#d48352', zip: '#6f766b', rar: '#6f766b',
  '7z': '#6f766b', mp4: '#6f9d98', mp3: '#6f9d98', md: '#6f9d98', txt: '#6f9d98'
}

function isLink(item) { return item.kind === 'link' }
function isFile(item) { return !isLink(item) }
function isImage(item) { return isFile(item) && IMG.has(item.type) }
function isVideo(item) { return isFile(item) && VIDEO.has(item.type) }
function ext(name = '') { const i = name.lastIndexOf('.'); return i >= 0 ? name.slice(i + 1).toUpperCase().slice(0, 4) : '?' }
function extLower(name = '') { const i = name.lastIndexOf('.'); return i >= 0 ? name.slice(i + 1).toLowerCase() : '' }
function extStyle(name) { const c = EXT_COLORS[extLower(name)] || '#4a5550'; return { background: c } }
function sizeStr(b = 0) { return b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / (1024 * 1024)).toFixed(1) + ' MB' }
function dateStr(d) { return new Date(d).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) }

function blobUrl(item) {
  if (!isFile(item)) return ''
  if (!urlCache.has(item.id)) {
    const blob = new Blob([item.data], { type: item.type })
    urlCache.set(item.id, URL.createObjectURL(blob))
  }
  return urlCache.get(item.id)
}

function revoke(item) {
  if (urlCache.has(item.id)) {
    URL.revokeObjectURL(urlCache.get(item.id))
    urlCache.delete(item.id)
  }
}

async function load() {
  try {
    error.value = ''
    files.value = await list()
  } catch (e) {
    error.value = '加载失败：' + e.message
  }
}

async function addFiles(fileList) {
  if (!fileList.length) return
  try {
    error.value = ''
    for (const file of fileList) {
      await add(file)
    }
    await load()
  } catch (e) {
    error.value = '添加失败：' + e.message
  }
}

async function onAdd(e) {
  await addFiles(e.target.files)
  e.target.value = ''
}

async function onDrop(e) {
  dragCount.value = 0
  await addFiles(e.dataTransfer.files)
}

async function addLinkItem() {
  await addLink(linkForm)
  Object.assign(linkForm, { title: '', url: '', note: '' })
  linkFormOpen.value = false
  await load()
}

async function remove(item) {
  revoke(item)
  try {
    error.value = ''
    await removeFromDB(item.id)
    if (active.value?.id === item.id) active.value = null
    await load()
  } catch (e) {
    error.value = '删除失败：' + e.message
  }
}

function platformFromUrl(url = '') {
  if (url.includes('bilibili.com')) return 'Bilibili'
  if (url.includes('douyin.com')) return 'Douyin'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
  return 'Web'
}

function resourceTypeFor(item) {
  if (isLink(item)) return item.url.includes('video') || item.url.includes('bilibili.com') ? '视频' : '链接'
  if (isImage(item)) return '图片'
  if (isVideo(item)) return '视频'
  return '文件'
}

function presentationFor(item) {
  if (isLink(item)) return resourceTypeFor(item) === '视频' ? '视频卡片' : '普通链接'
  if (isImage(item)) return '图片卡片'
  if (isVideo(item)) return '视频卡片'
  return '文件下载'
}

function mark(message) {
  transferMessage.value = message
  window.setTimeout(() => {
    if (transferMessage.value === message) transferMessage.value = ''
  }, 2600)
}

function transferToLibrary(item) {
  library.create({
    title: item.title || item.name,
    category: '仓库转存',
    resourceType: resourceTypeFor(item),
    presentation: presentationFor(item),
    url: isLink(item) ? item.url : `vault:${item.id}`,
    vaultFileId: isFile(item) ? item.id : '',
    fileName: isFile(item) ? item.name : '',
    note: item.note || `从仓库转存：${item.title || item.name}`,
    status: '待整理',
    tags: ['仓库转存'],
  })
  mark('已转存到资料库')
}

async function transferToNote(item) {
  let content = ''

  if (isLink(item)) {
    content = `${item.note || '从仓库链接转成笔记。'}\n\n链接：${item.url}`
  } else {
    content = `从仓库文件转成笔记。\n\n文件名：${item.name}\n类型：${item.type || '未知'}\n大小：${sizeStr(item.size)}`

    if (item.type?.startsWith('text/') || TEXT_EXT.has(extLower(item.name))) {
      try {
        const text = new TextDecoder('utf-8').decode(item.data)
        content += `\n\n--- 文件内容预览 ---\n${text.slice(0, 4000)}`
      } catch {
        content += '\n\n文本读取失败，可保留文件在仓库中。'
      }
    }
  }

  notes.create({
    title: item.title || item.name,
    mood: '仓库整理',
    excerpt: isLink(item) ? item.url : `从仓库文件 ${item.name} 转成笔记`,
    content,
    tags: ['仓库转存'],
  })
  mark('已转存到笔记')
}

function transferToCollection(item) {
  if (!isLink(item)) return

  collection.create({
    title: item.title,
    url: item.url,
    platform: platformFromUrl(item.url),
    category: '仓库链接',
    status: '待整理',
    note: item.note,
    tags: ['仓库转存'],
  })
  mark('已转存到收藏')
}

onMounted(load)
onUnmounted(() => { for (const item of files.value) revoke(item) })
</script>

<style scoped>
.vault-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-radius: 999px;
  padding: 10px 14px 10px 18px;
  margin-bottom: 18px;
}

.vault-actions button,
.transfer-actions button,
.ghost-btn,
.save-btn {
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 800;
}

.vault-actions button,
.save-btn {
  color: #fff;
  background: var(--accent-deep);
  padding: 10px 15px;
}

.vault-actions span {
  color: var(--text-tertiary);
  font-size: 13px;
}

.drop-zone {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
  border-radius: var(--radius-xl);
  padding: 18px;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.drop-zone.dragging {
  opacity: 0.72;
  transform: scale(0.99);
}

.upload-card,
.stored-card {
  min-height: 250px;
  border-radius: 24px;
  border: 1px solid var(--border-light);
  background: rgba(255, 255, 255, 0.42);
  overflow: hidden;
  position: relative;
}

.upload-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-style: dashed;
  text-align: center;
  padding: 22px;
  color: var(--text-secondary);
}

.upload-card span {
  width: 50px;
  height: 50px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(111, 157, 152, 0.14);
  color: var(--accent-deep);
  font-size: 32px;
}

.upload-card small,
.note {
  color: var(--text-tertiary);
}

.stored-card {
  transition: transform 0.24s ease, box-shadow 0.24s ease;
}

.stored-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.thumb {
  height: 145px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: rgba(111, 157, 152, 0.12);
  cursor: pointer;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ext-tag,
.link-mark {
  padding: 7px 14px;
  border-radius: 10px;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
}

.link-mark {
  background: var(--accent-deep);
}

.ext-tag.large,
.link-mark.large {
  display: inline-block;
  padding: 12px 28px;
  font-size: 24px;
}

.info {
  padding: 12px 14px 14px;
}

.name {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta,
.note {
  font-size: 12px;
  margin-top: 4px;
}

.note {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.transfer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.transfer-actions button,
.ghost-btn {
  color: var(--accent-deep);
  background: rgba(111, 157, 152, 0.12);
  padding: 7px 11px;
  font-size: 12px;
}

.del-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(32, 37, 32, 0.54);
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.stored-card:hover .del-btn {
  opacity: 1;
}

.error {
  color: #9b4d42;
  margin-top: 14px;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(32, 37, 32, 0.52);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 24px;
}

.modal-card {
  max-width: 760px;
  width: 100%;
  max-height: 86vh;
  overflow: auto;
  position: relative;
  border-radius: var(--radius-xl);
  padding: 34px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-lg);
}

.preview-card {
  text-align: center;
}

.modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.modal-head h2 {
  font-size: 30px;
}

.modal-close {
  border: none;
  background: rgba(111, 157, 152, 0.1);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-size: 24px;
  color: var(--text-tertiary);
  cursor: pointer;
}

.link-form label {
  display: grid;
  gap: 8px;
  margin-bottom: 15px;
}

.link-form label span {
  color: var(--text-tertiary);
  font-size: 13px;
  font-weight: 800;
}

.link-form input,
.link-form textarea {
  width: 100%;
  border: 1px solid var(--border-light);
  border-radius: 15px;
  padding: 12px 14px;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.72);
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-img {
  max-width: 100%;
  max-height: 66vh;
  border-radius: var(--radius);
}

.modal-name {
  margin-top: 18px;
  font-weight: 800;
}

.modal-meta {
  color: var(--text-tertiary);
  margin-top: 6px;
  word-break: break-all;
}

.dl-link {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 22px;
  border-radius: 999px;
  color: #fff;
  background: var(--accent-deep);
  text-decoration: none;
  font-weight: 800;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 680px) {
  .vault-actions {
    align-items: stretch;
    border-radius: 22px;
    flex-direction: column;
  }
}
</style>
