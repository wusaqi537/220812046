import * as THREE from 'three'

export function createOctahedron() {
  // 创建正八面体几何体
  const octahedronGeometry = new THREE.OctahedronGeometry(1, 0)
  
  // 加载地球贴图 - 修复路径
  const textureLoader = new THREE.TextureLoader()
  const earthTexture = textureLoader.load('src/assets/earth_day_4096.jpg')
  
  // 创建使用地球贴图的材质
  const octahedronMaterial = new THREE.MeshStandardMaterial({ 
    map: earthTexture,
    roughness: 0.6,
    metalness: 0.1
  })
  
  const octahedron = new THREE.Mesh(octahedronGeometry, octahedronMaterial)
  octahedron.position.set(-3, 0, 0)
  
  return octahedron
}