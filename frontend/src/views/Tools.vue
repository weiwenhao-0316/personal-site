<template>
  <div class="tools">
    <h1 class="page-title">工具集</h1>
    <p class="page-desc">把重复的事自动化，省下时间去做更有意思的事。</p>

    <div class="tool-list">
      <div class="tool-card" v-for="tool in tools" :key="tool.name">
        <span class="tool-icon">{{ tool.icon }}</span>
        <div class="tool-info">
          <h3>{{ tool.name }}</h3>
          <p>{{ tool.desc }}</p>
        </div>
        <span class="badge" :class="{ done: tool.status === '已上线' }">{{ tool.status }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const tools = [
  { icon: '📄', name: '政治押题卷生成', desc: '基于时政热点自动生成西藏高考政治模拟题', status: '已上线' },
  { icon: '📐', name: '数学保底手册', desc: '输入弱项章节，生成针对性保分练习', status: '已上线' },
  { icon: '📝', name: '文综速成工具', desc: '文科综合知识点速查与答题模板', status: '已上线' },
  { icon: '💬', name: 'AI 聊天', desc: '接入 Claude，可配知识库的智能对话', status: '开发中' },
]
</script>

<style scoped>
.tools {}

.page-title {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}
.page-desc { color: var(--text-secondary); margin-bottom: 40px; font-size: 16px; }

.tool-list { display: flex; flex-direction: column; }
.tool-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  border-top: 1px solid var(--border-light);
}
.tool-card:last-child { border-bottom: 1px solid var(--border-light); }
.tool-icon { font-size: 28px; flex-shrink: 0; }
.tool-info { flex: 1; min-width: 0; }
.tool-info h3 { font-size: 16px; color: var(--text-primary); margin-bottom: 4px; font-weight: 500; }
.tool-info p { font-size: 13px; color: var(--text-tertiary); }

.badge {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  background: #f5f0ec;
  color: var(--text-tertiary);
  flex-shrink: 0;
}
.badge.done { background: #edf2ec; color: #6b8b63; }
</style>
