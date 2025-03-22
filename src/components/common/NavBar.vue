<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">3D场景</div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
  background-color: rgba(20, 20, 35, 0.8);
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.navbar-brand {
  font-size: 18px;
  font-weight: bold;
  color: white;
}
</style> 