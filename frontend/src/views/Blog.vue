<template>
  <div class="blog">
    <h1 class="page-title">成长记录</h1>
    <p class="page-desc">学习笔记、思考和踩坑记录。</p>

    <div class="post-list">
      <article class="post-card" v-for="post in posts" :key="post.title">
        <time>{{ post.date }}</time>
        <h3>{{ post.title }}</h3>
        <p>{{ post.excerpt }}</p>
      </article>
    </div>

    <div class="empty" v-if="posts.length === 0">
      <p>还没有文章，开始写第一篇吧。</p>
    </div>
  </div>
</template>

<script setup>
const posts = []
</script>

<style scoped>
.blog {}

.page-title {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}
.page-desc { color: var(--text-secondary); margin-bottom: 40px; font-size: 16px; }

.post-list { display: flex; flex-direction: column; gap: 0; }
.post-card {
  padding: 24px 0;
  border-top: 1px solid var(--border-light);
  transition: padding 0.2s;
}
.post-card:last-child { border-bottom: 1px solid var(--border-light); }
.post-card:hover { padding-left: 8px; }
.post-card time { font-size: 13px; color: var(--text-tertiary); font-family: var(--font-display); font-style: italic; }
.post-card h3 { font-size: 18px; margin: 6px 0; color: var(--text-primary); font-weight: 500; }
.post-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.7; }

.empty { text-align: center; padding: 80px 0; color: var(--text-tertiary); }
</style>
