import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/main-scene'
  },
  {
    path: '/main-scene',
    name: 'MainScene',
    component: () => import('../views/MainSceneView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 