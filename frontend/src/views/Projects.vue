<template>
  <div class="projects">
    <h1 class="page-title">项目展示</h1>
    <p class="page-desc">课余动手做的小项目，边学边练。</p>

    <div class="project-list">
      <a
        v-for="p in projects"
        :key="p.name"
        :href="p.link"
        target="_blank"
        class="proj-card"
      >
        <h3>{{ p.name }}</h3>
        <p>{{ p.desc }}</p>
        <div class="tags">
          <span class="tag" v-for="t in p.tags" :key="t">{{ t }}</span>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
const projects = [
  {
    name: '西藏高考政治押题卷',
    desc: '基于近5年真题和时政热点自动生成模拟卷，包含选择题训练和大题专项。',
    tags: ['Python', '备考工具'],
    link: '#',
  },
  {
    name: '六级备考完全手册',
    desc: '词汇 + 真题专题总结 + 作文模板，一站式备考。',
    tags: ['Python', '文档生成'],
    link: '#',
  },
  {
    name: '个人站点搭建',
    desc: '就是这个网站，Vue 3 + FastAPI，记录成长经历和工具集。',
    tags: ['Vue 3', 'FastAPI', '全栈'],
    link: '#',
  },
  {
    name: '智能体学习项目',
    desc: '从 API 调用到 RAG、Tool Use、记忆系统的完整学习路线。',
    tags: ['Agent', 'RAG', '学习中'],
    link: '#',
  },
]
</script>

<style scoped>
.projects {}

.page-title {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}
.page-desc { color: var(--text-secondary); margin-bottom: 40px; font-size: 16px; }

.project-list { display: flex; flex-direction: column; }
.proj-card {
  display: block;
  padding: 24px 0;
  border-top: 1px solid var(--border-light);
  text-decoration: none;
  color: inherit;
  transition: padding 0.2s;
}
.proj-card:last-child { border-bottom: 1px solid var(--border-light); }
.proj-card:hover { padding-left: 8px; }
.proj-card h3 { font-size: 17px; color: var(--text-primary); margin-bottom: 6px; font-weight: 500; }
.proj-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 10px; }

.tags { display: flex; gap: 8px; flex-wrap: wrap; }
.tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 20px;
  background: #f5f0ec;
  color: var(--text-tertiary);
}
</style>
