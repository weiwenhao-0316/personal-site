<template>
  <section class="page-shell">
    <header class="page-hero compact">
      <p class="eyebrow">AI Assistant</p>
      <h1>AI 助手</h1>
      <p>当前接入后端 `/api/chat`，用于简单对话和后续内容整理实验。未来可以接入收藏页，生成视频摘要和个人批注。</p>
    </header>

    <div class="chat-layout">
      <div class="chat-box glass-panel">
        <div class="messages" ref="msgContainer">
          <div v-for="(msg, i) in messages" :key="i" :class="['msg', msg.role]">
            <span class="role-tag">{{ msg.role === 'user' ? '你' : 'AI' }}</span>
            <p>{{ msg.content }}</p>
          </div>
          <div v-if="loading" class="msg assistant">
            <span class="role-tag">AI</span>
            <p class="typing">{{ streamingText || '思考中...' }}</p>
          </div>
        </div>
        <div class="input-row">
          <input
            v-model="input"
            @keyup.enter="send"
            placeholder="输入消息，按回车发送"
            :disabled="loading"
          />
          <button @click="send" :disabled="loading || !input.trim()">发送</button>
        </div>
      </div>

      <aside class="assistant-note glass-panel">
        <p class="eyebrow">Next</p>
        <h2>后续可升级成内容整理器</h2>
        <ul>
          <li>给收藏的视频生成摘要</li>
          <li>从仓库内容提取标签</li>
          <li>把对话沉淀成笔记</li>
        </ul>
        <div class="status" :class="{ connected: backendOnline }">
          <template v-if="backendChecking">检测后端连接中...</template>
          <template v-else-if="backendOnline">后端已连接</template>
          <template v-else>后端未连接，请确认服务已启动</template>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

const input = ref('')
const loading = ref(false)
const streamingText = ref('')
const backendOnline = ref(false)
const backendChecking = ref(true)
const messages = ref([])
const msgContainer = ref(null)

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

onMounted(async () => {
  try {
    const res = await fetch(`${apiUrl}/api/health`)
    backendOnline.value = res.ok
  } catch {
    backendOnline.value = false
  } finally {
    backendChecking.value = false
  }
})

const scrollToBottom = () => {
  nextTick(() => {
    if (msgContainer.value) {
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight
    }
  })
}

const buildMessages = () => [
  {
    role: 'system',
    content: '你是一个友好的中文 AI 助手，回答简洁、准确，优先帮助用户整理学习、项目和个人网站内容。',
  },
  ...messages.value.map(m => ({ role: m.role, content: m.content })),
]

const send = async () => {
  const text = input.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text })
  input.value = ''
  loading.value = true
  streamingText.value = ''
  scrollToBottom()

  try {
    const res = await fetch(`${apiUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: buildMessages() }),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    backendOnline.value = true
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let fullReply = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          fullReply += data
          streamingText.value = fullReply
          scrollToBottom()
        }
      }
    }

    messages.value.push({ role: 'assistant', content: fullReply })
  } catch (e) {
    backendOnline.value = false
    messages.value.push({
      role: 'assistant',
      content: `连接失败：${e.message}。请确认后端已启动或生产环境 API 地址正确。`,
    })
  } finally {
    loading.value = false
    streamingText.value = ''
    scrollToBottom()
  }
}
</script>

<style scoped>
.chat-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
}

.chat-box,
.assistant-note {
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.messages {
  height: 500px;
  overflow-y: auto;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.msg {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.msg.user {
  flex-direction: row-reverse;
}

.msg p {
  max-width: 72%;
  padding: 12px 16px;
  border-radius: 18px;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--border-light);
  white-space: pre-wrap;
  word-break: break-word;
}

.msg.user p {
  background: rgba(111, 157, 152, 0.16);
  border-color: rgba(111, 157, 152, 0.22);
}

.role-tag {
  color: var(--text-tertiary);
  font-size: 12px;
  padding-top: 8px;
  flex-shrink: 0;
}

.typing {
  color: var(--text-tertiary) !important;
}

.input-row {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid var(--border-light);
}

.input-row input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  padding: 12px 16px;
  outline: none;
  background: rgba(255, 255, 255, 0.58);
  color: var(--text-primary);
}

.input-row input:focus {
  border-color: rgba(111, 157, 152, 0.48);
  box-shadow: 0 0 0 4px rgba(111, 157, 152, 0.12);
}

.input-row button {
  border: none;
  border-radius: 999px;
  padding: 12px 22px;
  color: #fff;
  background: var(--accent-deep);
  cursor: pointer;
  font-weight: 800;
}

.input-row button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.assistant-note {
  padding: 26px;
}

.assistant-note h2 {
  font-family: var(--font-display);
  font-size: 34px;
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.assistant-note ul {
  display: grid;
  gap: 12px;
  list-style: none;
  margin-top: 22px;
  color: var(--text-secondary);
}

.assistant-note li {
  padding-left: 18px;
  position: relative;
}

.assistant-note li::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  position: absolute;
  left: 0;
  top: 0.75em;
}

.status {
  margin-top: 28px;
  padding: 12px 14px;
  border-radius: 16px;
  color: #8a563f;
  background: rgba(201, 143, 112, 0.16);
  font-size: 13px;
}

.status.connected {
  color: var(--accent-deep);
  background: rgba(111, 157, 152, 0.14);
}

@media (max-width: 860px) {
  .chat-layout {
    grid-template-columns: 1fr;
  }

  .msg p {
    max-width: 82%;
  }
}

@media (max-width: 560px) {
  .input-row {
    flex-direction: column;
  }

  .messages {
    height: 430px;
  }
}
</style>

