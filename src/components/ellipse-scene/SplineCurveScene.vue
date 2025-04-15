<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import splineCurve from './objects/splineCurve.js'

// Three.js 变量
let scene, camera, renderer, controls
let animationId = null

// 初始化场景
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x111111)

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(0, 0, 200)
  camera.lookAt(0, 0, 0)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  document.getElementById('spline-curve-container').appendChild(renderer.domElement)

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(50, 50, 50)
  scene.add(directionalLight)

  // 添加坐标轴辅助
  const axesHelper = new THREE.AxesHelper(100)
  scene.add(axesHelper)

  // 添加网格地面
  const gridHelper = new THREE.GridHelper(200, 20)
  scene.add(gridHelper)

  // 添加样条曲线
  scene.add(splineCurve)

  // 开始动画循环
  animate()

  // 添加窗口大小调整监听器
  window.addEventListener('resize', onWindowResize)
}

// 窗口大小调整处理函数
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 更新控制器
  controls.update()

  // 渲染场景
  renderer.render(scene, camera)
}

// 生命周期钩子
onMounted(() => {
  initScene()
})

onBeforeUnmount(() => {
  // 清理资源
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }

  if (renderer) {
    renderer.dispose()
  }

  // 移除事件监听器
  window.removeEventListener('resize', onWindowResize)

  // 清除DOM
  const container = document.getElementById('spline-curve-container')
  if (container && container.firstChild) {
    container.removeChild(container.firstChild)
  }
})
</script>

<template>
  <div id="spline-curve-container" class="scene-container">
    <!-- Three.js 渲染器将在这里添加 canvas -->
  </div>
</template>

<style scoped>
.scene-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
