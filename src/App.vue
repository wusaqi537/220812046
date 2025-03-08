<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'

const container = ref(null)

onMounted(() => {
  // 创建场景、相机和渲染器
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  
  // 将渲染器的画布添加到 DOM 中
  container.value.appendChild(renderer.domElement)

  // 创建一个立方体
  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  // 设置相机位置
  camera.position.z = 5

  // 定义动画循环
  function animate() {
    requestAnimationFrame(animate)
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
    renderer.render(scene, camera)
  }
  animate()

  // 监听窗口尺寸变化，调整相机和渲染器
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })
})
</script>

<template>
  <!-- 作为 three.js 渲染器的挂载点 -->
  <div ref="container" style="width: 100vw; height: 100vh;"></div>
</template>

<style>
html, body, #app {
  margin: 0;
  height: 100%;
  overflow: hidden;
}
</style>
