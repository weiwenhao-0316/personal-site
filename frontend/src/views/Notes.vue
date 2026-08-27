<template>
  <section class="page-shell">
    <header class="page-hero compact">
      <p class="eyebrow">Notes</p>
      <h1>笔记</h1>
      <p>这里放成长记录、学习总结、日记和经验复盘。它不是作文栏，而是把输入变成输出的地方。</p>
    </header>

    <div class="notes-toolbar glass-panel">
      <div>
        <strong>{{ notes.length }}</strong>
        <span>条记录</span>
      </div>
      <button class="add-note" @click="openCreate">写一条新记录</button>
    </div>

    <div class="note-grid">
      <article v-for="note in notes" :key="note.id" class="note-card">
        <div class="meta-row">
          <span>{{ note.mood }}</span>
          <time>{{ note.date }}</time>
        </div>
        <h2>{{ note.title }}</h2>
        <p>{{ note.excerpt }}</p>
        <div class="tags" v-if="note.tags.length">
          <span v-for="tag in note.tags" :key="tag">{{ tag }}</span>
        </div>
        <div class="note-actions">
          <button @click="openDetail(note)">查看</button>
          <button @click="openEdit(note)">编辑</button>
          <button class="danger" @click="removeNote(note)">删除</button>
        </div>
      </article>

      <article class="note-card draft-card" @click="openCreate">
        <span class="draft-plus">+</span>
        <h2>写一条新记录</h2>
        <p>记录学习、复盘、日记、阶段总结。现在先存在本机浏览器，后续统一接数据库。</p>
      </article>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="formOpen" class="modal-overlay" @click.self="closeForm">
          <form class="modal-card note-form" @submit.prevent="saveNote">
            <div class="form-head">
              <div>
                <p class="eyebrow">{{ editingId ? 'Edit' : 'Create' }}</p>
                <h2>{{ editingId ? '编辑笔记' : '新增笔记' }}</h2>
              </div>
              <button type="button" class="close-btn" @click="closeForm">&times;</button>
            </div>

            <label>
              <span>标题</span>
              <input v-model="form.title" required placeholder="例如：今天学到的一个重要经验" />
            </label>

            <div class="form-grid">
              <label>
                <span>类型</span>
                <input v-model="form.mood" placeholder="学习 / 复盘 / 日记 / 项目" />
              </label>
              <label>
                <span>标签，用逗号分隔</span>
                <input v-model="form.tagsText" placeholder="Vue, 面试, 复盘" />
              </label>
            </div>

            <label>
              <span>摘要</span>
              <input v-model="form.excerpt" placeholder="一句话概括这条笔记" />
            </label>

            <label>
              <span>正文</span>
              <textarea v-model="form.content" rows="8" placeholder="写下你的记录、思考或复盘。"></textarea>
            </label>

            <div class="form-actions">
              <button type="button" class="ghost-btn" @click="closeForm">取消</button>
              <button type="submit" class="save-btn">{{ editingId ? '保存修改' : '保存笔记' }}</button>
            </div>
          </form>
        </div>
      </Transition>

      <Transition name="fade">
        <div v-if="activeNote" class="modal-overlay" @click.self="activeNote = null">
          <article class="modal-card note-detail">
            <button type="button" class="close-btn detail-close" @click="activeNote = null">&times;</button>
            <p class="eyebrow">{{ activeNote.mood }} · {{ activeNote.date }}</p>
            <h2>{{ activeNote.title }}</h2>
            <p class="detail-excerpt">{{ activeNote.excerpt }}</p>
            <div class="tags" v-if="activeNote.tags.length">
              <span v-for="tag in activeNote.tags" :key="tag">{{ tag }}</span>
            </div>
            <div class="detail-content">{{ activeNote.content }}</div>
          </article>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useNotesStore } from '../composables/useNotesStore.js'

const store = useNotesStore()
// 数据现在来自服务器 MySQL，初始为空，页面挂载后异步拉取
const notes = ref([])
const formOpen = ref(false)
const editingId = ref('')
const activeNote = ref(null)

const form = reactive({
  title: '',
  mood: '',
  tagsText: '',
  excerpt: '',
  content: '',
})

function resetForm() {
  Object.assign(form, {
    title: '',
    mood: '记录',
    tagsText: '',
    excerpt: '',
    content: '',
  })
}

function openCreate() {
  editingId.value = ''
  resetForm()
  formOpen.value = true
}

function openEdit(note) {
  editingId.value = note.id
  Object.assign(form, {
    title: note.title,
    mood: note.mood,
    tagsText: note.tags.join(', '),
    excerpt: note.excerpt,
    content: note.content,
  })
  formOpen.value = true
}

function openDetail(note) {
  activeNote.value = note
}

function closeForm() {
  formOpen.value = false
}

function normalizePayload() {
  return {
    title: form.title,
    mood: form.mood,
    excerpt: form.excerpt || form.content.slice(0, 80),
    content: form.content,
    tags: form.tagsText
      .split(/[,，]/)
      .map(tag => tag.trim())
      .filter(Boolean),
  }
}

async function loadNotes() {
  try {
    notes.value = await store.list()
  } catch (err) {
    window.alert(`笔记数据获取失败：${err.message}`)
  }
}
loadNotes()

function saveNote() {
  const payload = normalizePayload()
  const task = editingId.value
    ? store.update(editingId.value, payload)
    : store.create(payload)
  task.then(async () => {
    await loadNotes()
    closeForm()
  }).catch(err => {
    window.alert(`保存失败：${err.message}`)
  })
}

function removeNote(note) {
  const confirmed = window.confirm(`确定删除「${note.title}」吗？`)
  if (!confirmed) return

  store.remove(note.id)
    .then(loadNotes)
    .catch(err => {
      window.alert(`删除失败：${err.message}`)
    })
}
</script>

<style scoped>
.notes-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border-radius: 999px;
  padding: 12px 14px 12px 20px;
  margin-bottom: 22px;
}

.notes-toolbar strong {
  font-size: 22px;
  margin-right: 6px;
}

.notes-toolbar span {
  color: var(--text-tertiary);
}

.add-note,
.note-actions button,
.ghost-btn,
.save-btn {
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 800;
}

.add-note,
.save-btn {
  color: #fff;
  background: var(--accent-deep);
}

.add-note {
  padding: 11px 17px;
}

.note-card {
  min-height: 260px;
}

.note-card .tags {
  margin-top: 20px;
}

.note-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 22px;
}

.note-actions button {
  color: var(--accent-deep);
  background: rgba(111, 157, 152, 0.12);
  padding: 7px 11px;
  font-size: 12px;
}

.note-actions .danger {
  color: #9b4d42;
  background: rgba(201, 143, 112, 0.16);
}

.draft-card {
  border-style: dashed;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
}

.draft-plus {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(111, 157, 152, 0.14);
  color: var(--accent-deep);
  font-size: 26px;
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
.note-detail h2 {
  font-size: 32px;
  line-height: 1.15;
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

.note-form label {
  display: grid;
  gap: 8px;
  margin-bottom: 15px;
}

.note-form label span {
  color: var(--text-tertiary);
  font-size: 13px;
  font-weight: 800;
}

.note-form input,
.note-form textarea {
  width: 100%;
  border: 1px solid var(--border-light);
  border-radius: 15px;
  padding: 12px 14px;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.72);
  outline: none;
}

.note-form input:focus,
.note-form textarea:focus {
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

.note-detail {
  position: relative;
}

.detail-close {
  position: absolute;
  top: 18px;
  right: 18px;
}

.detail-excerpt {
  color: var(--text-secondary);
  margin: 14px 0 18px;
}

.detail-content {
  color: var(--text-primary);
  white-space: pre-wrap;
  line-height: 1.9;
  margin-top: 22px;
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
  .notes-toolbar,
  .form-actions {
    align-items: stretch;
    flex-direction: column;
    border-radius: 22px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

