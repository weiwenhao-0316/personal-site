<template>
  <nav class="navbar">
    <div class="nav-inner">
      <router-link to="/" class="logo">W</router-link>
      <div class="nav-links">
        <router-link to="/blog">成长记录</router-link>
        <router-link to="/tools">备考资料</router-link>
        <router-link to="/chat">AI 聊天</router-link>
        <router-link to="/projects">项目</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(241, 238, 234, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-light);
}

.nav-inner {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
}
.logo:hover {
  background: var(--accent-hover);
  transform: scale(1.05);
}

.nav-links { display: flex; gap: 4px; }

.nav-links a {
  padding: 7px 16px;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}
.nav-links a:hover {
  color: var(--text-primary);
  background: rgba(212, 93, 58, 0.06);
}
.nav-links a.router-link-active {
  color: var(--accent);
  background: var(--accent-soft);
}

@media (max-width: 600px) {
  .nav-links a { padding: 6px 10px; font-size: 13px; }
}
</style>
