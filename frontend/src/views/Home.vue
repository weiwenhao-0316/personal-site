<template>
  <section class="home page-shell">
    <section class="hero-card">
      <div class="hero-bg" :style="wallpaperStyle"></div>

      <div class="hero-content">
        <p class="eyebrow">Personal Digital Garden</p>
        <h1>把学习、收藏、项目和日常，整理成自己的空间。</h1>
        <p class="intro">
          这里不是普通个人主页，而是一个持续生长的数字花园：收视频、写笔记、放资料、展示项目，
          再慢慢接入 AI 摘要和自动整理。
        </p>
        <div class="hero-actions">
          <router-link to="/collection">开始收藏</router-link>
          <router-link to="/projects" class="ghost">查看项目</router-link>
          <router-link to="/chat" class="ghost">AI 助手</router-link>
        </div>
      </div>

      <label class="wallpaper-control glass-panel">
        <span>{{ wallpaperStatus }}</span>
        <input type="file" accept="image/*" hidden @change="changeBackground" />
      </label>
    </section>

    <section class="quick-grid">
      <router-link
        v-for="item in quickLinks"
        :key="item.path"
        class="quick-card glass-panel"
        :to="item.path"
        :style="{ '--card-accent': item.accent }"
      >
        <span>{{ item.eyebrow }}</span>
        <h2>{{ item.title }}</h2>
        <p>{{ item.desc }}</p>
      </router-link>
    </section>

    <section>
      <div class="section-title">
        <h2>最近在整理</h2>
        <p>把外部输入变成自己的记录，每一次收藏、笔记和项目都留下时间线。</p>
      </div>
      <div class="updates">
        <article v-for="item in recentUpdates" :key="item.title" class="update-card">
          <div class="meta-row">
            <span>{{ item.type }}</span>
            <time>{{ item.date }}</time>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <section class="now-panel glass-panel">
      <div>
        <p class="eyebrow">Now</p>
        <h2>当前建设路线</h2>
      </div>
      <ul>
        <li>先把视觉、导航和页面结构重构成长期可维护的个人系统。</li>
        <li>再把收藏、资料库、仓库、笔记接入真正的数据增删改查。</li>
        <li>最后加入 AI 摘要、自动分类和内容批注，让网站成为个人工作台。</li>
      </ul>
    </section>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { quickLinks, recentUpdates } from '../data/siteContent.js'
import { useWallpaperStore } from '../composables/useWallpaperStore.js'

const DEFAULT_BG = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=80'
const { loadHomeWallpaper, saveHomeWallpaper } = useWallpaperStore()

const backgroundUrl = ref(DEFAULT_BG)
const wallpaperStatus = ref('更换首页壁纸')
let temporaryObjectUrl = ''

const wallpaperStyle = computed(() => ({
  backgroundImage: `url("${backgroundUrl.value}")`,
}))

onMounted(async () => {
  try {
    const saved = await loadHomeWallpaper()
    if (saved) {
      setTemporaryWallpaper(saved)
      wallpaperStatus.value = '更换首页壁纸'
    }
  } catch {
    wallpaperStatus.value = '壁纸读取失败'
  }
})

onBeforeUnmount(() => {
  if (temporaryObjectUrl) URL.revokeObjectURL(temporaryObjectUrl)
})

function setTemporaryWallpaper(blob) {
  if (temporaryObjectUrl) URL.revokeObjectURL(temporaryObjectUrl)
  temporaryObjectUrl = URL.createObjectURL(blob)
  backgroundUrl.value = temporaryObjectUrl
}

async function changeBackground(event) {
  const [file] = event.target.files
  event.target.value = ''
  if (!file || !file.type.startsWith('image/')) return

  setTemporaryWallpaper(file)
  wallpaperStatus.value = '保存中...'

  try {
    await saveHomeWallpaper(file)
    wallpaperStatus.value = '壁纸已保存'
  } catch {
    wallpaperStatus.value = '已应用，本机存储空间不足'
  }
}
</script>

<style scoped>
.home {
  position: relative;
  min-height: calc(100vh - 112px);
  padding-bottom: 34px;
}

.hero-card {
  min-height: clamp(560px, 66vh, 720px);
  border-radius: 34px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  padding: clamp(34px, 5.5vw, 78px);
  box-shadow: 0 24px 76px rgba(45, 58, 49, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.56);
  background: rgba(255, 255, 255, 0.2);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1.025);
  filter: saturate(0.96) contrast(0.96);
  animation: hero-breathe 18s ease-in-out infinite alternate;
}

.hero-card::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(100deg, rgba(247, 242, 231, 0.9) 0%, rgba(247, 242, 231, 0.7) 38%, rgba(247, 242, 231, 0.24) 72%, rgba(255, 255, 255, 0.08) 100%),
    radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.72), transparent 30%);
  pointer-events: none;
}

.hero-card::after {
  content: "";
  position: absolute;
  inset: 16px;
  z-index: 1;
  border-radius: 26px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 760px;
}

.hero-content h1 {
  font-family: var(--font-body);
  font-size: clamp(38px, 4.4vw, 74px);
  line-height: 1.14;
  letter-spacing: -0.055em;
  max-width: 820px;
  font-weight: 800;
  text-wrap: balance;
}

.intro {
  color: rgba(45, 54, 47, 0.78);
  font-size: clamp(15px, 1.25vw, 18px);
  max-width: 610px;
  margin-top: 22px;
  line-height: 1.9;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 34px;
}

.hero-actions a {
  border-radius: 999px;
  padding: 12px 19px;
  text-decoration: none;
  color: #fff;
  background: var(--accent-deep);
  box-shadow: 0 12px 24px rgba(65, 111, 107, 0.16);
  font-weight: 700;
  transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
}

.hero-actions a:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(65, 111, 107, 0.18);
}

.hero-actions .ghost {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(14px);
}

.wallpaper-control {
  position: absolute;
  right: 28px;
  bottom: 28px;
  z-index: 3;
  border-radius: 999px;
  padding: 12px 17px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: transform 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.wallpaper-control:hover {
  color: var(--accent-deep);
  background: rgba(255, 255, 255, 0.76);
  transform: translateY(-2px);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-top: 22px;
}

.quick-card {
  min-height: 190px;
  padding: 28px;
  border-radius: 26px;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  transition: transform 0.32s ease, box-shadow 0.32s ease, background 0.32s ease, border-color 0.32s ease;
}

.quick-card::before {
  content: "";
  position: absolute;
  inset: auto 28px 26px auto;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: var(--card-accent);
  opacity: 0.08;
  filter: blur(9px);
  transition: transform 0.45s ease, opacity 0.45s ease;
}

.quick-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.48), rgba(255, 255, 255, 0.12));
  opacity: 0;
  transition: opacity 0.32s ease;
}

.quick-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 50px rgba(50, 61, 48, 0.1);
  background: rgba(255, 255, 255, 0.72);
  border-color: rgba(255, 255, 255, 0.42);
}

.quick-card:hover::before {
  opacity: 0.12;
  transform: scale(1.06) translate(-4px, -3px);
}

.quick-card:hover::after {
  opacity: 1;
}

.quick-card span,
.quick-card h2,
.quick-card p {
  position: relative;
  z-index: 1;
}

.quick-card span {
  color: var(--card-accent);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 11px;
  font-weight: 800;
}

.quick-card h2 {
  font-family: var(--font-body);
  font-size: 30px;
  margin-top: 22px;
  letter-spacing: -0.08em;
  font-weight: 800;
}

.quick-card p {
  color: var(--text-secondary);
  margin-top: 12px;
  font-size: 15px;
  line-height: 1.75;
}

.updates {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.now-panel {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 28px;
  border-radius: var(--radius-xl);
  padding: 34px;
  margin-top: 42px;
}

.now-panel h2 {
  font-family: var(--font-display);
  font-size: 42px;
  letter-spacing: -0.04em;
  line-height: 1;
}

.now-panel ul {
  list-style: none;
  display: grid;
  gap: 14px;
  color: var(--text-secondary);
}

.now-panel li {
  padding-left: 18px;
  position: relative;
}

.now-panel li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.75em;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
}

@keyframes hero-breathe {
  from {
    transform: scale(1.025) translate3d(0, 0, 0);
  }
  to {
    transform: scale(1.07) translate3d(1%, -0.8%, 0);
  }
}

@media (max-width: 1120px) {
  .quick-grid,
  .updates {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .hero-card {
    min-height: 650px;
    border-radius: 26px;
    padding: 30px 24px 92px;
    align-items: flex-start;
  }

  .hero-card::after {
    inset: 10px;
    border-radius: 20px;
  }

  .hero-content h1 {
    letter-spacing: -0.045em;
  }

  .wallpaper-control {
    left: 22px;
    right: auto;
    bottom: 22px;
  }

  .quick-grid,
  .updates,
  .now-panel {
    grid-template-columns: 1fr;
  }
}
</style>
