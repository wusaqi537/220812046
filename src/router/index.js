import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/main-scene'
  },
  {
    path: '/main-scene',
    name: 'MainScene',
    component: () => import('../scenes/main-scene/MainScene.vue')
  },
  {
    path: '/spline-curve',
    name: 'SplineCurveScene',
    component: () => import('../scenes/spline-curve/SplineCurveScene.vue')
  },
  {
    path: '/curve-path',
    name: 'CurvePathScene',
    component: () => import('../scenes/curve-path/CurvePathScene.vue')
  },
  {
    path: '/terrain',
    name: 'TerrainScene',
    component: () => import('../scenes/terrain-scene/TerrainScene.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router