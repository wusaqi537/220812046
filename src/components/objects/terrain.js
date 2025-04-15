import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

// 创建噪声函数
const noise2D = createNoise2D();

// 创建平面几何体，设置较高的分段数以获得更平滑的地形
const geometry = new THREE.PlaneGeometry(300, 300, 100, 100);

// 创建材质，使用线框模式以便观察地形结构
const material = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#FFD700'), // 黄色
  wireframe: true,
  side: THREE.DoubleSide,
  metalness: 0.2,
  roughness: 0.8
});

// 创建网格
const terrainMesh = new THREE.Mesh(geometry, material);

// 旋转平面使其水平放置
terrainMesh.rotation.x = -Math.PI / 2;

// 默认位置
terrainMesh.position.set(0, -10, 0);

// 导出网格对象
export default terrainMesh;

// 更新地形顶点位置的函数
export function updateTerrainGeometry(time = 0) {
  const positions = geometry.attributes.position;
  
  // 时间缩放因子
  const timeScale = 0.003; 
  // 波浪传播系数
  const waveSpeed = 0.02;
  
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    
    // 基础地形高度
    const baseHeight = noise2D(x / 150, y / 150) * 30;
    
    // 根据点的位置添加相位差，创造波浪传播效果
    // 使用X坐标作为相位差的一部分，这样波浪会从一侧传播到另一侧
    const phaseShift = x * waveSpeed;
    
    // 单一正弦波动画 - 但每个点基于位置有不同的相位
    const waveEffect = Math.sin(time * timeScale + phaseShift) * 10;
    
    // 设置顶点Z坐标（高度）
    positions.setZ(i, baseHeight + waveEffect);
  }
  
  // 标记几何体需要更新
  positions.needsUpdate = true;
  
  // 更新法线以确保光照效果正确
  geometry.computeVertexNormals();
}

// 创建彩色地形材质的函数
export function createColoredMaterial(wireframe = true) {
  return new THREE.MeshStandardMaterial({
    color: wireframe ? new THREE.Color('#FFD700') : new THREE.Color('#F4C430'), // 黄色/金色
    wireframe: wireframe,
    side: THREE.DoubleSide,
    metalness: 0.2,
    roughness: 0.8
  });
}

// 切换地形材质的函数
export function toggleTerrainMaterial() {
  const isWireframe = terrainMesh.material.wireframe;
  terrainMesh.material = createColoredMaterial(!isWireframe);
} 