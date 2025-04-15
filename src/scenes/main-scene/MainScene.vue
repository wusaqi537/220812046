<script setup>
import ThreeScene from '../../components/main-scene/ThreeScene.vue'
import GUIPanel from '../../components/main-scene/gui/GUIPanel.vue'
</script>

<template>
  <div class="main-scene-container">
    <ThreeScene />
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
