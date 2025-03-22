<script setup>
import ThreeScene from '../components/main-scene/ThreeScene.vue'
import GUIPanel from '../components/main-scene/gui/GUIPanel.vue'
// GUIPanel会通过全局对象获取ThreeScene数据，因此不需要传递props
</script>

<template>
  <div class="main-scene-container">
    <ThreeScene />
    <!-- GUIPanel组件会自动获取ThreeScene的数据 -->
    <GUIPanel />
  </div>
</template>

<style scoped>
.main-scene-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style> 