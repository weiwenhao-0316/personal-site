<template>
  <div class="vault">
    <header class="page-header">
      <h1>仓库</h1>
      <p>收藏喜欢的文件、图片、资料</p>
    </header>

    <div
      class="grid"
      @dragenter.prevent="dragCount++"
      @dragleave.prevent="dragCount--"
      @dragover.prevent
      @drop.prevent="onDrop"
      :class="{ dragging: dragCount > 0 }"
    >
      <label class="card add-card">
        <span class="plus">+</span>
        <span class="hint">添加文件</span>
        <input type="file" multiple hidden @change="onAdd" />
      </label>

      <article v-for="f in files" :key="f.id" class="card file-card">
        <button class="del-btn" @click="remove(f.id)" title="删除">&times;</button>
        <div class="thumb" @click="active = f">
          <img v-if="isImage(f)" :src="blobUrl(f)" :alt="f.name" loading="lazy" />
          <span v-else class="ext-tag" :style="extStyle(f.name)">{{ ext(f.name) }}</span>
        </div>
        <div class="info">
          <p class="name" :title="f.name">{{ f.name }}</p>
          <p class="meta">{{ sizeStr(f.size) }} &middot; {{ dateStr(f.addedAt) }}</p>
        </div>
      </article>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="active" class="modal-overlay" @click.self="active = null">
          <div class="modal-card">
            <button class="modal-close" @click="active = null">&times;</button>
            <img
              v-if="isImage(active)"
              :src="blobUrl(active)"
              :alt="active.name"
              class="modal-img"
            />
            <template v-else>
              <span class="ext-tag large" :style="extStyle(active.name)">{{ ext(active.name) }}</span>
              <p class="modal-name">{{ active.name }}</p>
              <p class="modal-meta">{{ sizeStr(active.size) }}</p>
            </template>
            <a class="dl-link" :href="blobUrl(active)" :download="active.name">下载文件</a>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useVault } from '../composables/useVault.js'

const { add, list, remove: removeFromDB } = useVault()

const files = ref([])
const active = ref(null)
const dragCount = ref(0)
const error = ref('')

const urlCache = new Map()

function blobUrl(f) {
  if (!urlCache.has(f.id)) {
    const blob = new Blob([f.data], { type: f.type })
    urlCache.set(f.id, URL.createObjectURL(blob))
  }
  return urlCache.get(f.id)
}

function revoke(f) {
  if (urlCache.has(f.id)) {
    URL.revokeObjectURL(urlCache.get(f.id))
    urlCache.delete(f.id)
  }
}

async function load() {
  try {
    error.value = ''
    files.value = await list()
  } catch (e) {
    error.value = '加载失败: ' + e.message
  }
}

async function onAdd(e) {
  const selected = e.target.files
  if (!selected.length) return
  try {
    error.value = ''
    for (const f of selected) {
      await add(f)
    }
    await load()
  } catch (e) {
    error.value = '添加失败: ' + e.message
  }
  e.target.value = ''
}

async function onDrop(e) {
  dragCount.value = 0
  const dropped = e.dataTransfer.files
  if (!dropped.length) return
  try {
    error.value = ''
    for (const f of dropped) {
      await add(f)
    }
    await load()
  } catch (e) {
    error.value = '添加失败: ' + e.message
  }
}

async function remove(f) {
  revoke(f)
  try {
    error.value = ''
    await removeFromDB(f.id)
    if (active.value?.id === f.id) active.value = null
    await load()
  } catch (e) {
    error.value = '删除失败: ' + e.message
  }
}

const IMG = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'image/avif'])
const EXT_COLORS = {
  pdf: '#e03e3e', doc: '#2563eb', docx: '#2563eb', xls: '#16a34a', xlsx: '#16a34a',
  csv: '#16a34a', ppt: '#ea580c', pptx: '#ea580c', zip: '#6b7280', rar: '#6b7280',
  '7z': '#6b7280', mp4: '#7c3aed', mp3: '#7c3aed'
}

function isImage(f) { return IMG.has(f.type) }
function ext(name) { const i = name.lastIndexOf('.'); return i >= 0 ? name.slice(i + 1).toUpperCase().slice(0, 4) : '?' }
function extStyle(name) { const e = name.slice(name.lastIndexOf('.') + 1).toLowerCase(); const c = EXT_COLORS[e] || '#4a4440'; return { background: c } }
function sizeStr(b) { return b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / (1024 * 1024)).toFixed(1) + ' MB' }
function dateStr(d) { return new Date(d).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) }

onMounted(load)
onUnmounted(() => { for (const f of files.value) revoke(f) })
</script>

<style scoped>
.page-header { text-align: center; padding: 32px 0 24px; }
.page-header h1 { font-family: var(--font-display); font-size: 28px; color: var(--text-primary); }
.page-header p { color: var(--text-tertiary); font-size: 14px; margin-top: 6px; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 0 0 40px;
  transition: opacity 0.2s;
}
.grid.dragging { opacity: 0.7; }

.card {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  position: relative;
  transition: box-shadow 0.2s, transform 0.2s;
}
.file-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }

.add-card {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-style: dashed;
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all 0.2s;
}
.add-card:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
.plus { font-size: 36px; font-weight: 300; line-height: 1; }
.hint { font-size: 13px; }

.file-card { display: flex; flex-direction: column; }

.thumb {
  height: 140px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius) var(--radius) 0 0;
  overflow: hidden;
  cursor: pointer;
}
.thumb img { width: 100%; height: 100%; object-fit: cover; }

.ext-tag {
  padding: 6px 14px;
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.ext-tag.large { padding: 12px 28px; font-size: 24px; border-radius: 10px; }

.info { padding: 10px 12px 12px; }
.name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meta { font-size: 11px; color: var(--text-tertiary); margin-top: 4px; }

.del-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(0,0,0,0.45);
  color: #fff;
  border-radius: 50%;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;
}
.file-card:hover .del-btn { opacity: 1; }

.error { text-align: center; color: var(--accent); font-size: 14px; margin-top: 8px; }

/* modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(28,25,22,0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
}
.modal-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 32px;
  max-width: 720px;
  width: 100%;
  max-height: 85vh;
  overflow: auto;
  position: relative;
  text-align: center;
}
.modal-img { max-width: 100%; max-height: 65vh; border-radius: var(--radius); }
.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  border: none;
  background: none;
  font-size: 28px;
  color: var(--text-tertiary);
  cursor: pointer;
}
.modal-name { font-size: 16px; font-weight: 600; margin-top: 16px; color: var(--text-primary); }
.modal-meta { font-size: 13px; color: var(--text-tertiary); margin-top: 4px; }
.dl-link {
  display: inline-block;
  margin-top: 20px;
  padding: 8px 24px;
  background: var(--accent);
  color: #fff;
  border-radius: var(--radius);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}
.dl-link:hover { background: var(--accent-hover); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
