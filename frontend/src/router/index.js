import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/blog', name: 'Blog', component: () => import('../views/Blog.vue') },
  { path: '/tools', name: 'Tools', component: () => import('../views/Tools.vue') },
  { path: '/chat', name: 'Chat', component: () => import('../views/Chat.vue') },
  { path: '/projects', name: 'Projects', component: () => import('../views/Projects.vue') },
  { path: '/vault', name: 'Vault', component: () => import('../views/Vault.vue') },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
