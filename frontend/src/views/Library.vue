<template>
  <section class="page-shell">
    <header class="page-hero compact">
      <p class="eyebrow">Library</p>
      <h1>资料库</h1>
      <p>
        资料可以是文件、网页链接、图片卡片或视频卡片。你可以像 B 站收藏夹一样浏览资料，
        也可以保留传统下载链接形式。
      </p>
    </header>

    <div class="toolbar glass-panel">
      <button
        v-for="category in categories"
        :key="category"
        class="filter"
        :class="{ active: activeCategory === category }"
        @click="activeCategory = category"
      >
        {{ category }}
      </button>
      <button class="add-button" @click="openCreate">添加资料</button>
    </div>

    <div class="library-mode glass-panel">
      <span>展示方式</span>
      <button :class="{ active: viewMode === 'card' }" @click="viewMode = 'card'">卡片</button>
      <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">列表</button>
    </div>

    <div v-if="viewMode === 'card'" class="resource-grid">
      <article v-for="item in filteredItems" :key="item.id" class="resource-card">
        <div class="resource-cover" :style="{ background: item.cover }">
          <span>{{ item.resourceType }}</span>
          <button v-if="canPreviewVideo(item)" @click="previewItem = item">预览</button>
          <button v-else-if="hasVaultFile(item)" @click="downloadVaultFile(item)">下载</button>
          <a v-else :href="item.url" :download="isDownload(item) ? '' : null" target="_blank" rel="noreferrer">
            {{ isDownload(item) ? '下载' : '打开' }}
          </a>
        </div>
        <div class="resource-body">
          <div class="meta-row">
            <span>{{ item.category }}</span>
            <time>{{ item.createdAt }}</time>
          </div>
          <h2>{{ item.title }}</h2>
          <p>{{ item.note || '暂无备注。' }}</p>
          <div class="tags" v-if="item.tags.length">
            <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
          </div>
          <div class="resource-footer">
            <span class="status">{{ item.status }}</span>
            <div class="item-actions">
              <button @click="openEdit(item)">编辑</button>
              <button class="danger" @click="removeItem(item)">删除</button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="resource-list glass-panel">
      <article v-for="item in filteredItems" :key="item.id" class="resource-row">
        <span class="type-pill">{{ item.resourceType }}</span>
        <div>
          <h2>{{ item.title }}</h2>
          <p>{{ item.category }} · {{ item.status }} · {{ item.createdAt }}</p>
        </div>
        <div class="row-actions">
          <button v-if="canPreviewVideo(item)" @click="previewItem = item">预览</button>
          <button v-else-if="hasVaultFile(item)" @click="downloadVaultFile(item)">下载</button>
          <a v-else :href="item.url" :download="isDownload(item) ? '' : null" target="_blank" rel="noreferrer">
            {{ isDownload(item) ? '下载' : '打开' }}
          </a>
          <button @click="openEdit(item)">编辑</button>
          <button class="danger" @click="removeItem(item)">删除</button>
        </div>
      </article>
    </div>

    <div v-if="!filteredItems.length" class="empty-state glass-panel">
      <h2>这个分类还没有资料</h2>
      <p>你可以添加文件下载链接、网页链接、图片卡片或视频卡片。</p>
      <button class="add-button" @click="openCreate">添加资料</button>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="formOpen" class="modal-overlay" @click.self="closeForm">
          <form class="modal-card library-form" @submit.prevent="saveItem">
            <div class="form-head">
              <div>
                <p class="eyebrow">{{ editingId ? 'Edit' : 'Create' }}</p>
                <h2>{{ editingId ? '编辑资料' : '添加资料' }}</h2>
              </div>
              <button type="button" class="close-btn" @click="closeForm">&times;</button>
            </div>

            <label>
              <span>标题</span>
              <input v-model="form.title" required placeholder="资料标题" />
            </label>

            <label>
              <span>链接或文件路径</span>
              <input v-model="form.url" required placeholder="https://... 或 /exam/..." />
            </label>

            <div class="form-grid">
              <label>
                <span>分类</span>
                <input v-model="form.category" placeholder="高考历史 / AI 学习资料 / 面试资料" />
              </label>
              <label>
                <span>状态</span>
                <select v-model="form.status">
                  <option>待整理</option>
                  <option>常用</option>
                  <option>已归档</option>
                  <option>示例</option>
                </select>
              </label>
            </div>

            <div class="form-grid">
              <label>
                <span>资料类型</span>
                <select v-model="form.resourceType">
                  <option>文件</option>
                  <option>链接</option>
                  <option>图片</option>
                  <option>视频</option>
                </select>
              </label>
              <label>
                <span>展示方式</span>
                <select v-model="form.presentation">
                  <option>文件下载</option>
                  <option>普通链接</option>
                  <option>图片卡片</option>
                  <option>视频卡片</option>
                </select>
              </label>
            </div>

            <label>
              <span>封面图片地址，可选</span>
              <input v-model="form.cover" placeholder="不填会自动生成渐变封面" />
            </label>

            <label>
              <span>标签，用逗号分隔</span>
              <input v-model="form.tagsText" placeholder="历史, 押题卷, 视频" />
            </label>

            <label>
              <span>备注</span>
              <textarea v-model="form.note" rows="4" placeholder="这份资料怎么用？适合什么时候看？"></textarea>
            </label>

            <div class="form-actions">
              <button type="button" class="ghost-btn" @click="closeForm">取消</button>
              <button type="submit" class="save-btn">{{ editingId ? '保存修改' : '添加资料' }}</button>
            </div>
          </form>
        </div>
      </Transition>

      <Transition name="fade">
        <div v-if="previewItem" class="modal-overlay" @click.self="previewItem = null">
          <div class="modal-card video-preview">
            <button type="button" class="close-btn detail-close" @click="previewItem = null">&times;</button>
            <p class="eyebrow">Video Preview</p>
            <h2>{{ previewItem.title }}</h2>
            <iframe
              v-if="bilibiliEmbed(previewItem)"
              :src="bilibiliEmbed(previewItem)"
              allowfullscreen
              scrolling="no"
            ></iframe>
            <div v-else class="no-preview">
              <p>这个平台暂不支持站内预览，可以打开原链接查看。</p>
              <a :href="previewItem.url" target="_blank" rel="noreferrer">打开链接</a>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useLibraryStore } from '../composables/useLibraryStore.js'
import { useVault } from '../composables/useVault.js'

const store = useLibraryStore()
const vault = useVault()
const items = ref(store.list())
const activeCategory = ref('全部')
const viewMode = ref('card')
const formOpen = ref(false)
const editingId = ref('')
const previewItem = ref(null)

const form = reactive({
  title: '',
  category: '',
  resourceType: '链接',
  presentation: '资料卡片',
  url: '',
  cover: '',
  tagsText: '',
  note: '',
  status: '待整理',
})

const categories = computed(() => {
  const unique = new Set(items.value.map(item => item.category).filter(Boolean))
  return ['全部', ...unique]
})

const filteredItems = computed(() => {
  if (activeCategory.value === '全部') return items.value
  return items.value.filter(item => item.category === activeCategory.value)
})

function isDownload(item) {
  return item.presentation === '文件下载' || item.resourceType === '文件'
}

function hasVaultFile(item) {
  return Boolean(item.vaultFileId)
}

function canPreviewVideo(item) {
  return !hasVaultFile(item) && (item.presentation === '视频卡片' || item.resourceType === '视频')
}

function bilibiliEmbed(item) {
  const match = item.url.match(/BV[0-9A-Za-z]+/)
  if (!match) return ''
  return `https://player.bilibili.com/player.html?bvid=${match[0]}&page=1&autoplay=0`
}

async function downloadVaultFile(item) {
  const record = await vault.get(item.vaultFileId)
  if (!record?.data) return

  const blob = new Blob([record.data], { type: record.type || 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = item.fileName || record.name || item.title
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function resetForm() {
  Object.assign(form, {
    title: '',
    category: '',
    resourceType: '链接',
    presentation: '普通链接',
    url: '',
    cover: '',
    tagsText: '',
    note: '',
    status: '待整理',
  })
}

function openCreate() {
  editingId.value = ''
  resetForm()
  formOpen.value = true
}

function openEdit(item) {
  editingId.value = item.id
  Object.assign(form, {
    title: item.title,
    category: item.category,
    resourceType: item.resourceType,
    presentation: item.presentation,
    url: item.url,
    cover: item.cover?.startsWith('linear-gradient') ? '' : item.cover,
    tagsText: item.tags.join(', '),
    note: item.note,
    status: item.status,
  })
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
}

function normalizePayload() {
  return {
    title: form.title,
    category: form.category,
    resourceType: form.resourceType,
    presentation: form.presentation,
    url: form.url,
    cover: form.cover,
    note: form.note,
    status: form.status,
    tags: form.tagsText
      .split(/[,，]/)
      .map(tag => tag.trim())
      .filter(Boolean),
  }
}

function saveItem() {
  const payload = normalizePayload()
  if (editingId.value) {
    store.update(editingId.value, payload)
  } else {
    store.create(payload)
  }
  items.value = store.list()
  if (!categories.value.includes(activeCategory.value)) activeCategory.value = '全部'
  closeForm()
}

function removeItem(item) {
  const confirmed = window.confirm(`确定删除「${item.title}」吗？`)
  if (!confirmed) return

  store.remove(item.id)
  items.value = store.list()
  if (!categories.value.includes(activeCategory.value)) activeCategory.value = '全部'
}
</script>

<style scoped>
.library-mode {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 8px;
  margin-bottom: 22px;
}

.library-mode span {
  color: var(--text-tertiary);
  font-size: 13px;
  font-weight: 800;
  padding: 0 8px;
}

.library-mode button,
.item-actions button,
.row-actions button,
.row-actions a,
.ghost-btn,
.save-btn {
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 800;
  text-decoration: none;
}

.library-mode button {
  color: var(--text-secondary);
  background: transparent;
  padding: 8px 12px;
}

.library-mode button.active {
  color: #fff;
  background: var(--accent-deep);
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.resource-card,
.resource-list,
.empty-state {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(22px);
  overflow: hidden;
}

.resource-cover {
  min-height: 180px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  position: relative;
  overflow: hidden;
}

.resource-cover::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 74% 28%, rgba(255, 255, 255, 0.5), transparent 28%);
}

.resource-cover span,
.resource-cover button,
.resource-cover a {
  position: relative;
  z-index: 1;
}

.resource-cover span,
.type-pill {
  border-radius: 999px;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.62);
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 800;
}

.resource-cover button,
.resource-cover a {
  border: none;
  border-radius: 999px;
  color: #fff;
  background: rgba(65, 111, 107, 0.9);
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
}

.resource-body {
  padding: 22px;
}

.resource-body h2,
.resource-row h2 {
  font-size: 20px;
  line-height: 1.28;
  margin-bottom: 10px;
}

.resource-body p,
.resource-row p {
  color: var(--text-secondary);
  font-size: 14px;
}

.resource-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.item-actions,
.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.item-actions button,
.row-actions button,
.row-actions a {
  color: var(--accent-deep);
  background: rgba(111, 157, 152, 0.12);
  padding: 7px 11px;
  font-size: 12px;
}

.item-actions .danger,
.row-actions .danger {
  color: #9b4d42;
  background: rgba(201, 143, 112, 0.16);
}

.resource-list {
  display: grid;
}

.resource-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border-light);
}

.resource-row:last-child {
  border-bottom: none;
}

.row-actions {
  margin-top: 0;
}

.empty-state {
  padding: 52px;
  text-align: center;
}

.empty-state h2 {
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 18px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
  background: rgba(32, 37, 32, 0.45);
  backdrop-filter: blur(14px);
}

.modal-card {
  width: min(760px, 100%);
  max-height: 88vh;
  overflow: auto;
  border-radius: 30px;
  border: 1px solid var(--border-light);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--shadow-lg);
  padding: 28px;
}

.form-head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.form-head h2,
.video-preview h2 {
  font-size: 30px;
  line-height: 1.1;
}

.close-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  color: var(--text-tertiary);
  background: rgba(111, 157, 152, 0.1);
  cursor: pointer;
  font-size: 22px;
}

.library-form label {
  display: grid;
  gap: 8px;
  margin-bottom: 15px;
}

.library-form label span {
  color: var(--text-tertiary);
  font-size: 13px;
  font-weight: 800;
}

.library-form input,
.library-form select,
.library-form textarea {
  width: 100%;
  border: 1px solid var(--border-light);
  border-radius: 15px;
  padding: 12px 14px;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.72);
  outline: none;
}

.library-form input:focus,
.library-form select:focus,
.library-form textarea:focus {
  border-color: rgba(111, 157, 152, 0.44);
  box-shadow: 0 0 0 4px rgba(111, 157, 152, 0.12);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.ghost-btn,
.save-btn {
  padding: 12px 18px;
}

.ghost-btn {
  color: var(--text-secondary);
  background: rgba(111, 157, 152, 0.1);
}

.save-btn {
  color: #fff;
  background: var(--accent-deep);
}

.video-preview {
  position: relative;
  width: min(980px, 100%);
}

.detail-close {
  position: absolute;
  top: 18px;
  right: 18px;
}

.video-preview iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: none;
  border-radius: 18px;
  margin-top: 20px;
  background: #111;
}

.no-preview {
  display: grid;
  place-items: center;
  gap: 16px;
  min-height: 240px;
  margin-top: 20px;
  border-radius: 18px;
  background: rgba(111, 157, 152, 0.1);
  color: var(--text-secondary);
}

.no-preview a {
  color: #fff;
  background: var(--accent-deep);
  border-radius: 999px;
  padding: 10px 16px;
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

@media (max-width: 960px) {
  .resource-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .resource-row {
    grid-template-columns: 1fr;
  }

  .row-actions {
    margin-top: 8px;
  }
}

@media (max-width: 620px) {
  .resource-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .resource-footer,
  .form-actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
