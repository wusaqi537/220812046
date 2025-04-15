<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import terrainMesh, { updateTerrainGeometry, toggleTerrainMaterial } from '../../components/objects/terrain.js';

// 创建引用以获取DOM元素
const container = ref(null);

// 存储Three.js对象
let scene, camera, renderer, controls;
let animationId = null;
let clock = null;

// 初始化Three.js场景
function initScene() {
  // 创建时钟对象用于跟踪时间
  clock = new THREE.Clock();
  
  // 创建场景
  scene = new THREE.Scene();

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(100, 100, 100);
  camera.lookAt(0, 0, 0);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  
  // 添加渲染器到DOM
  container.value.appendChild(renderer.domElement);

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  
  // 设置场景背景为黑色
  scene.background = new THREE.Color('#000000');
  
  // 创建光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(50, 100, 50);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  
  // 添加地形网格到场景
  scene.add(terrainMesh);
  
  // 添加坐标轴辅助器
  const axesHelper = new THREE.AxesHelper(20);
  scene.add(axesHelper);
  
  // 添加双击事件监听器切换地形材质
  window.addEventListener('dblclick', toggleTerrainMaterial);
  
  // 开始动画循环
  animate();
}

// 动画循环
function animate() {
  animationId = requestAnimationFrame(animate);
  
  // 获取自初始化以来经过的时间
  const elapsedTime = clock.getElapsedTime() * 1000;
  
  // 更新地形几何体
  updateTerrainGeometry(elapsedTime);
  
  // 更新控制器
  controls.update();
  
  // 渲染场景
  renderer.render(scene, camera);
}

// 窗口大小变化时调整渲染器和相机
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// 组件挂载时初始化场景
onMounted(() => {
  initScene();
  window.addEventListener('resize', onWindowResize);
});

// 组件卸载前清理资源
onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('dblclick', toggleTerrainMaterial);
  
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
  
  // 清理Three.js资源
  scene.remove(terrainMesh);
  terrainMesh.geometry.dispose();
  terrainMesh.material.dispose();
  
  renderer.dispose();
  
  if (container.value && renderer.domElement) {
    container.value.removeChild(renderer.domElement);
  }
});
</script>

<template>
  <div ref="container" class="terrain-container">
    <div class="info-panel">
      <h3>随机山脉地形</h3>
      <p>使用simplex-noise生成连续随机地形</p>
      <p>双击切换线框/实体显示模式</p>
    </div>
  </div>
</template>

<style scoped>
.terrain-container {
  width: 100%;
  height: 100%;
}

.info-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-family: Arial, sans-serif;
  max-width: 200px;
  z-index: 100;
}

.info-panel h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.info-panel p {
  margin: 5px 0;
  font-size: 14px;
}
</style> 