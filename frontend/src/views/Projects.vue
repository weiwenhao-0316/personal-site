<template>
  <section class="page-shell">
    <header class="page-hero compact">
      <p class="eyebrow">Projects</p>
      <h1>项目</h1>
      <p>项目页不是堆文件，而是把你做过的工具、实验和网站本身整理成能对外讲清楚的案例。</p>
    </header>

    <div class="project-grid">
      <a
        v-for="project in projects"
        :key="project.name"
        class="project-card"
        :href="project.link"
        target="_blank"
        rel="noreferrer"
      >
        <div class="meta-row">
          <span>{{ project.status }}</span>
          <span>Case Study</span>
        </div>
        <h2>{{ project.name }}</h2>
        <p>{{ project.desc }}</p>
        <div class="tags">
          <span v-for="tag in project.tags" :key="tag">{{ tag }}</span>
        </div>
      </a>
    </div>

    <section class="project-guide glass-panel">
      <p class="eyebrow">How to write</p>
      <h2>后续每个项目建议这样补全</h2>
      <div class="guide-grid">
        <span>为什么做</span>
        <span>解决什么问题</span>
        <span>技术栈</span>
        <span>截图或演示</span>
        <span>遇到的坑</span>
        <span>学到了什么</span>
      </div>
    </section>
  </section>
</template>

<script setup>
import { projects } from '../data/siteContent.js'
</script>

<style scoped>
.project-card {
  min-height: 280px;
  color: inherit;
  text-decoration: none;
}

.project-card .tags {
  margin-top: 22px;
}

.project-guide {
  border-radius: var(--radius-xl);
  padding: 34px;
  margin-top: 34px;
}

.project-guide h2 {
  font-family: var(--font-display);
  font-size: clamp(30px, 4vw, 48px);
  letter-spacing: -0.04em;
  line-height: 1.05;
  max-width: 620px;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  margin-top: 26px;
}

.guide-grid span {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.44);
  border: 1px solid var(--border-light);
  padding: 14px;
  color: var(--text-secondary);
  font-size: 13px;
  text-align: center;
}

@media (max-width: 860px) {
  .guide-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .guide-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

