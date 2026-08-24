<template>
  <section class="page-shell collection-page">
    <header class="page-hero compact">
      <p class="eyebrow">Collection</p>
      <h1>收藏</h1>
      <p>
        像 B 站收藏夹一样存视频、文章和网页，但每一条都带着你的标签、时间和批注。
        这一版数据存储在服务器数据库中，换设备也能看到。
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
      <button class="add-button" @click="openCreate">添加收藏</button>
    </div>

    <div class="video-grid" v-if="filteredItems.length">
      <article
        v-for="item in filteredItems"
        :key="item.id"
        class="video-card"
      >
        <a class="cover" :href="item.url" target="_blank" rel="noreferrer" :style="{ background: item.cover }">
          <span class="platform">{{ item.platform }}</span>
          <span class="play">打开</span>
        </a>
        <div class="video-body">
          <div class="meta-row">
            <span>{{ item.category }}</span>
            <time>{{ item.createdAt }}</time>
          </div>
          <h2>{{ item.title }}</h2>
          <p>{{ item.note || '还没有批注。' }}</p>
          <div class="tags" v-if="item.tags.length">
            <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
          </div>
          <div class="card-footer">
            <span class="status">{{ item.status }}</span>
            <div class="card-actions">
              <button @click="openEdit(item)">编辑</button>
              <button class="danger" @click="removeItem(item)">删除</button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div class="empty-state glass-panel" v-else>
      <h2>这个分类还没有内容</h2>
      <p>先添加一个视频、文章或网页链接，后续可以继续接 AI 摘要。</p>
      <button class="add-button" @click="openCreate">添加第一条</button>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="formOpen" class="modal-overlay" @click.self="closeForm">
          <form class="modal-card collection-form" @submit.prevent="saveItem">
            <div class="form-head">
              <div>
                <p class="eyebrow">{{ editingId ? 'Edit' : 'Create' }}</p>
                <h2>{{ editingId ? '编辑收藏' : '添加收藏' }}</h2>
              </div>
              <button type="button" class="close-btn" @click="closeForm">&times;</button>
            </div>

            <label>
              <span>标题</span>
              <input v-model="form.title" required placeholder="例如：一个值得反复看的 Agent 教程" />
            </label>

            <label>
              <span>链接</span>
              <input v-model="form.url" required placeholder="https://..." />
            </label>

            <div class="form-grid">
              <label>
                <span>平台</span>
                <input v-model="form.platform" placeholder="Bilibili / Douyin / Web" />
              </label>
              <label>
                <span>分类</span>
                <input v-model="form.category" placeholder="AI 学习 / 自媒体 / 学习方法" />
              </label>
            </div>

            <div class="form-grid">
              <label>
                <span>状态</span>
                <select v-model="form.status">
                  <option>待整理</option>
                  <option>稍后看</option>
                  <option>已看</option>
                  <option>已批注</option>
                </select>
              </label>
              <label>
                <span>标签，用逗号分隔</span>
                <input v-model="form.tagsText" placeholder="Agent, API, 路线" />
              </label>
            </div>

            <label>
              <span>封面图片地址，可选</span>
              <input v-model="form.cover" placeholder="不填会自动生成渐变封面" />
            </label>

            <label>
              <span>个人批注</span>
              <textarea v-model="form.note" rows="4" placeholder="这个内容对你有什么启发？后续可以怎么整理？"></textarea>
            </label>

            <div class="form-actions">
              <button type="button" class="ghost-btn" @click="closeForm">取消</button>
              <button type="submit" class="save-btn" :disabled="saving">{{ saving ? '保存中...' : (editingId ? '保存修改' : '添加收藏') }}</button>
            </div>
          </form>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useCollectionStore } from '../composables/useCollectionStore.js'

const store = useCollectionStore()
// 【第5关改动】数据不再从 localStorage 同步读取：
// 默认空列表，页面加载后从服务器接口异步获取，并增加"保存中"状态
const items = ref([])
const saving = ref(false)
const activeCategory = ref('全部')
const formOpen = ref(false)
const editingId = ref('')

const form = reactive({
  title: '',
  url: '',
  platform: '',
  category: '',
  status: '待整理',
  tagsText: '',
  cover: '',
  note: '',
})

const categories = computed(() => {
  const unique = new Set(items.value.map(item => item.category).filter(Boolean))
  return ['全部', ...unique]
})

const filteredItems = computed(() => {
  if (activeCategory.value === '全部') return items.value
  return items.value.filter(item => item.category === activeCategory.value)
})

// 【第5关改动】异步拉取收藏列表（网络请求需要时间，必须 await 等待）
async function loadItems() {
  try {
    items.value = await store.list()
  } catch (err) {
    window.alert(`收藏数据获取失败：${err.message}`)
  }
}
// 页面加载时先拉一次数据
loadItems()

function resetForm() {
  Object.assign(form, {
    title: '',
    url: '',
    platform: '',
    category: '',
    status: '待整理',
    tagsText: '',
    cover: '',
    note: '',
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
    url: item.url,
    platform: item.platform,
    category: item.category,
    status: item.status,
    tagsText: item.tags.join(', '),
    cover: item.cover?.startsWith('linear-gradient') ? '' : item.cover,
    note: item.note,
  })
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
}

function normalizePayload() {
  return {
    title: form.title,
    url: form.url,
    platform: form.platform,
    category: form.category,
    status: form.status,
    cover: form.cover,
    note: form.note,
    tags: form.tagsText
      .split(/[,，]/)
      .map(tag => tag.trim())
      .filter(Boolean),
  }
}

// 【第5关改动】改为异步：等服务器写入完成，再重新拉列表刷新页面
async function saveItem() {
  const payload = normalizePayload()
  saving.value = true
  try {
    if (editingId.value) {
      await store.update(editingId.value, payload)
    } else {
      await store.create(payload)
    }
    await loadItems()
    if (!categories.value.includes(activeCategory.value)) activeCategory.value = '全部'
    closeForm()
  } catch (err) {
    window.alert(`保存失败：${err.message}`)
  } finally {
    saving.value = false
  }
}

// 【第5关改动】删除也改成异步：先在服务器删掉，再刷新列表
async function removeItem(item) {
  const confirmed = window.confirm(`确定删除「${item.title}」吗？`)
  if (!confirmed) return

  try {
    await store.remove(item.id)
    await loadItems()
    if (!categories.value.includes(activeCategory.value)) activeCategory.value = '全部'
  } catch (err) {
    window.alert(`删除失败：${err.message}`)
  }
}
</script>

<style scoped>
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 18px;
}

.card-actions button,
.ghost-btn,
.save-btn {
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 800;
}

.card-actions button {
  color: var(--accent-deep);
  background: rgba(111, 157, 152, 0.12);
  padding: 7px 11px;
  font-size: 12px;
}

.card-actions .danger {
  color: #9b4d42;
  background: rgba(201, 143, 112, 0.16);
}

.empty-state {
  border-radius: var(--radius-xl);
  padding: 52px;
  text-align: center;
}

.empty-state h2 {
  font-size: 28px;
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 20px;
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

.collection-form {
  width: min(720px, 100%);
  max-height: 88vh;
  overflow: auto;
  border-radius: 30px;
  border: 1px solid var(--border-light);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-lg);
  padding: 28px;
}

.form-head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.form-head h2 {
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

.collection-form label {
  display: grid;
  gap: 8px;
  margin-bottom: 15px;
}

.collection-form label span {
  color: var(--text-tertiary);
  font-size: 13px;
  font-weight: 800;
}

.collection-form input,
.collection-form select,
.collection-form textarea {
  width: 100%;
  border: 1px solid var(--border-light);
  border-radius: 15px;
  padding: 12px 14px;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.72);
  outline: none;
}

.collection-form input:focus,
.collection-form select:focus,
.collection-form textarea:focus {
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 620px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .card-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

