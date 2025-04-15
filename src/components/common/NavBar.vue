<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">3D场景</div>
    <div class="navbar-links">
      <router-link to="/main-scene">主场景</router-link>
      <router-link to="/spline-curve">样条曲线</router-link>
      <router-link to="/curve-path">曲线路径</router-link>
    </div>
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
  justify-content: space-between;
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

.navbar-links {
  display: flex;
  gap: 20px;
}

.navbar-links a {
  color: white;
  text-decoration: none;
  font-size: 16px;
  transition: color 0.3s;
}

.navbar-links a:hover {
  color: #42b983;
}

.navbar-links a.router-link-active {
  color: #42b983;
  border-bottom: 2px solid #42b983;
}
</style>