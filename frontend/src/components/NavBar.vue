<template>
  <nav class="navbar">
    <router-link to="/" class="brand" aria-label="回到首页">
      <span class="brand-mark">H</span>
      <span class="brand-copy">
        <strong>Hao River</strong>
        <small>Personal Garden</small>
      </span>
    </router-link>

    <div class="nav-links">
      <router-link v-for="item in navItems" :key="item.path" :to="item.path">
        {{ item.label }}
      </router-link>
    </div>
  </nav>
</template>

<script setup>
const navItems = [
  { path: '/', label: '首页' },
  { path: '/collection', label: '收藏' },
  { path: '/notes', label: '笔记' },
  { path: '/projects', label: '项目' },
  { path: '/library', label: '资料库' },
  { path: '/vault', label: '仓库' },
]
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 16px;
  z-index: 100;
  width: min(1480px, calc(100% - 48px));
  height: 68px;
  margin: 16px auto 0;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid rgba(88, 103, 87, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.48);
  box-shadow: 0 12px 42px rgba(50, 61, 48, 0.08);
  backdrop-filter: blur(26px) saturate(1.2);
  -webkit-backdrop-filter: blur(26px) saturate(1.2);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 184px;
  color: inherit;
  text-decoration: none;
}

.brand-mark {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  background:
    radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.45), transparent 28%),
    linear-gradient(135deg, var(--accent-deep), var(--accent-warm));
  box-shadow: 0 12px 30px rgba(65, 111, 107, 0.22);
}

.brand-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-copy strong {
  font-size: 14px;
  letter-spacing: -0.01em;
}

.brand-copy small {
  color: var(--text-tertiary);
  font-size: 11px;
  margin-top: 4px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.nav-links::-webkit-scrollbar {
  display: none;
}

.nav-links a {
  flex: 0 0 auto;
  padding: 10px 15px;
  border-radius: 999px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  transition: color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.nav-links a:hover {
  color: var(--accent-deep);
  background: rgba(111, 157, 152, 0.09);
  transform: translateY(-0.5px);
}

.nav-links a.router-link-active {
  color: #fff;
  background: var(--accent-deep);
  box-shadow: 0 8px 20px rgba(65, 111, 107, 0.16);
}

@media (max-width: 760px) {
  .navbar {
    width: calc(100% - 20px);
    height: auto;
    align-items: flex-start;
    border-radius: 28px;
    flex-direction: column;
  }

  .brand {
    min-width: 0;
  }

  .nav-links {
    width: 100%;
  }
}
</style>
