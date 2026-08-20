import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/collection', name: 'Collection', component: () => import('../views/Collection.vue') },
  { path: '/notes', name: 'Notes', component: () => import('../views/Notes.vue') },
  { path: '/library', name: 'Library', component: () => import('../views/Library.vue') },
  { path: '/chat', name: 'Chat', component: () => import('../views/Chat.vue') },
  { path: '/projects', name: 'Projects', component: () => import('../views/Projects.vue') },
  { path: '/vault', name: 'Vault', component: () => import('../views/Vault.vue') },
  { path: '/blog', redirect: '/notes' },
  { path: '/tools', redirect: '/library' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})

