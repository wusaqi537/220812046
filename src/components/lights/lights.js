import * as THREE from 'three'

export function createLights() {
  // 创建环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
  
  // 创建方向光，模拟太阳光照射地球
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
  directionalLight.position.set(5, 5, 5)
  directionalLight.castShadow = true
  
  // 添加半球光，用于增强地球的光照效果
  const hemisphereLight = new THREE.HemisphereLight(
    0xffffff, // 天空色
    0x000000, // 地面色
    0.5 // 光照强度
  )
  
  return [ambientLight, directionalLight, hemisphereLight]
}