<template>
  <div class="app">
    <NavBar />
    <main class="main-content">
      <div class="content-card">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
</script>

<style scoped>
.content-card {
  max-width: 760px;
  margin: 0 auto;
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 48px 56px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

@media (max-width: 800px) {
  .content-card {
    padding: 32px 28px;
    border-radius: var(--radius);
  }
}

@media (max-width: 500px) {
  .content-card {
    padding: 28px 20px;
    border-radius: 0;
    border-left: none;
    border-right: none;
    box-shadow: none;
  }
  .main-content {
    padding: 0;
  }
}
</style>
