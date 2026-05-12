<template>
  <div class="chat">
    <h1 class="page-title">AI 聊天</h1>
    <p class="page-desc">基于 DeepSeek API，支持流式对话。</p>

    <div class="chat-box">
      <div class="messages" ref="msgContainer">
        <div v-for="(msg, i) in messages" :key="i" :class="['msg', msg.role]">
          <span class="role-tag">{{ msg.role === 'user' ? '你' : 'AI' }}</span>
          <p>{{ msg.content }}</p>
        </div>
        <div v-if="loading" class="msg ai">
          <span class="role-tag">AI</span>
          <p class="typing">{{ streamingText || '思考中...' }}</p>
        </div>
      </div>
      <div class="input-row">
        <input
          v-model="input"
          @keyup.enter="send"
          placeholder="输入消息，回车发送"
          :disabled="loading"
        />
        <button @click="send" :disabled="loading || !input.trim()">发送</button>
      </div>
    </div>

    <div class="status" :class="{ connected: backendOnline }">
      <template v-if="backendChecking">检测后端连接中...</template>
      <template v-else-if="backendOnline">后端已连接</template>
      <template v-else>后端未连接，请稍后刷新重试</template>
    </div>
  </div>
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

onMounted(async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const res = await fetch(`${apiUrl}/api/health`)
    if (res.ok) {
      backendOnline.value = true
    }
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

const buildMessages = () => {
  return [
    { role: 'system', content: '你是一个友好的 AI 助手，用中文回复。回答简洁、准确。' },
    ...messages.value.map(m => ({ role: m.role, content: m.content })),
  ]
}

const send = async () => {
  const text = input.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text })
  input.value = ''
  loading.value = true
  streamingText.value = ''
  scrollToBottom()

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
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
      content: `连接失败：${e.message}。请确认后端已启动（python main.py）。`,
    })
  } finally {
    loading.value = false
    streamingText.value = ''
    scrollToBottom()
  }
}
</script>

<style scoped>
.chat {}

.page-title {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}
.page-desc { color: var(--text-secondary); margin-bottom: 32px; font-size: 16px; }

.chat-box {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.messages {
  height: 420px;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #faf9f5;
}

.msg { display: flex; gap: 8px; align-items: flex-start; }
.msg.user { flex-direction: row-reverse; }
.msg.user p {
  background: var(--accent-soft);
  border: 1px solid rgba(212, 93, 58, 0.12);
}
.msg.assistant p, .msg.ai p {
  background: var(--surface);
  border: 1px solid var(--border-light);
}
.msg p {
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary);
  max-width: 70%;
  white-space: pre-wrap;
  word-break: break-word;
}
.role-tag { font-size: 11px; color: var(--text-tertiary); padding-top: 2px; flex-shrink: 0; }
.typing { color: var(--text-tertiary) !important; font-style: italic; }

.input-row {
  display: flex;
  padding: 16px;
  gap: 10px;
  border-top: 1px solid var(--border-light);
}
.input-row input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  font-family: var(--font-body);
  transition: border-color 0.2s;
}
.input-row input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(212,93,58,0.08); }
.input-row input::placeholder { color: var(--text-tertiary); }
.input-row button {
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.input-row button:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); }
.input-row button:disabled { opacity: 0.4; cursor: not-allowed; }

.status {
  margin-top: 16px;
  padding: 10px 18px;
  border-radius: var(--radius);
  font-size: 13px;
  color: var(--text-tertiary);
  background: #f5f0ec;
  text-align: center;
}
.status.connected {
  color: #6b8b63;
  background: #edf2ec;
}

@media (max-width: 600px) {
  .msg p { max-width: 85%; }
  .input-row { flex-direction: column; }
}
</style>
