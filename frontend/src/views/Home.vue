<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <p class="greeting">你好，我是</p>
      <h1 class="name">suhaohao<span class="dot">。</span></h1>
      <p class="intro">
        一个在学编程的学生，喜欢把学到的东西做成工具。<br />
        这里记录成长、分享好用的东西，还有一个能聊天的 AI。
      </p>
    </section>

    <!-- Quick Links — TOC style -->
    <section class="toc">
      <h2 class="section-label">探索</h2>
      <div class="toc-list">
        <router-link to="/chat" class="toc-item" style="--i: 0">
          <span class="toc-num">01</span>
          <span class="toc-body">
            <span class="toc-title">AI 聊天</span>
            <span class="toc-desc">接入 Claude 的智能对话，知识库 + 工具调用</span>
          </span>
          <span class="toc-arrow" aria-hidden="true">↗</span>
        </router-link>
        <router-link to="/tools" class="toc-item" style="--i: 1">
          <span class="toc-num">02</span>
          <span class="toc-body">
            <span class="toc-title">工具集</span>
            <span class="toc-desc">西藏高考历史、政治、文综备考资料下载</span>
          </span>
          <span class="toc-arrow" aria-hidden="true">↗</span>
        </router-link>
        <router-link to="/blog" class="toc-item" style="--i: 2">
          <span class="toc-num">03</span>
          <span class="toc-body">
            <span class="toc-title">成长记录</span>
            <span class="toc-desc">学习笔记、踩坑记录和偶尔的想法</span>
          </span>
          <span class="toc-arrow" aria-hidden="true">↗</span>
        </router-link>
        <router-link to="/projects" class="toc-item" style="--i: 3">
          <span class="toc-num">04</span>
          <span class="toc-body">
            <span class="toc-title">项目展示</span>
            <span class="toc-desc">课余动手做的小项目和实验</span>
          </span>
          <span class="toc-arrow" aria-hidden="true">↗</span>
        </router-link>
      </div>
    </section>

    <!-- Now -->
    <section class="now">
      <h2 class="section-label">最近在做</h2>
      <ul class="now-list">
        <li>
          <span class="now-marker"></span>
          <span>学习 Vue 3 前端开发，搭建这个个人站点</span>
        </li>
        <li>
          <span class="now-marker"></span>
          <span>系统学习智能体：API → RAG → Tool Use → Memory</span>
        </li>
        <li>
          <span class="now-marker"></span>
          <span>用 Python 写西藏高考备考资料生成工具</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
</script>

<style scoped>
/* ===== Hero ===== */

.hero {
  padding: 24px 0 56px;
}

.greeting {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 20px;
  color: var(--text-tertiary);
  margin-bottom: 4px;
  font-weight: 400;
}

.name {
  font-family: var(--font-display);
  font-size: clamp(48px, 8vw, 72px);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 24px;
}

.name .dot {
  color: var(--accent);
}

.intro {
  font-size: 17px;
  color: var(--text-secondary);
  line-height: 1.8;
  max-width: 440px;
}

/* ===== TOC ===== */

.toc {
  padding: 0 0 56px;
}

.section-label {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
  margin-bottom: 20px;
}

.toc-list {
  display: flex;
  flex-direction: column;
}

.toc-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
  border-top: 1px solid var(--border-light);
  text-decoration: none;
  color: inherit;
  transition: all 0.25s;
  animation: fadeUp 0.5s ease both;
  animation-delay: calc(var(--i, 0) * 0.08s);
}

.toc-item:last-child {
  border-bottom: 1px solid var(--border-light);
}

.toc-item:hover {
  padding-left: 8px;
}

.toc-item:hover .toc-num {
  color: var(--accent);
}

.toc-item:hover .toc-arrow {
  opacity: 1;
  transform: translate(4px, -4px);
}

.toc-num {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 28px;
  color: var(--border);
  min-width: 48px;
  transition: color 0.25s;
  font-weight: 400;
  line-height: 1;
}

.toc-body {
  flex: 1;
  min-width: 0;
}

.toc-title {
  display: block;
  font-size: 17px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.toc-desc {
  display: block;
  font-size: 14px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toc-arrow {
  font-size: 18px;
  color: var(--text-tertiary);
  opacity: 0;
  transition: all 0.25s;
  flex-shrink: 0;
}

/* ===== Now ===== */

.now-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.now-list li {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 16px 0;
  border-top: 1px solid var(--border-light);
  font-size: 15px;
  color: var(--text-secondary);
  animation: fadeUp 0.5s ease both;
  animation-delay: calc(0.4s + var(--i, 0) * 0.08s);
}

.now-list li:first-child { --i: 0; }
.now-list li:nth-child(2) { --i: 1; }
.now-list li:nth-child(3) { --i: 2; }

.now-list li:last-child {
  border-bottom: 1px solid var(--border-light);
}

.now-marker {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
  margin-top: 8px;
}

/* ===== Animations ===== */

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== Responsive ===== */

@media (max-width: 600px) {
  .hero { padding: 48px 0 40px; }
  .intro { font-size: 16px; }

  .toc-item { gap: 14px; padding: 18px 0; }
  .toc-num { font-size: 22px; min-width: 36px; }
  .toc-title { font-size: 16px; }
  .toc-desc {
    white-space: normal;
    font-size: 13px;
  }
  .toc-arrow { display: none; }
}
</style>
