<script setup>
import TerrainRenderer from './TerrainRenderer.vue'
</script>

<template>
  <div class="terrain-scene-container">
    <TerrainRenderer />
  </div>
</template>

<style scoped>
.terrain-scene-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #000000; /* 黑色背景 */
}
</style> 