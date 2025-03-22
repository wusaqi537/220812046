import * as THREE from 'three'

export function createGridPlane() {
  // 创建一个平面几何体
  const planeGeometry = new THREE.PlaneGeometry(20, 20)
  
  // 加载纹理
  const textureLoader = new THREE.TextureLoader()
  const texture = textureLoader.load('src/assets/earth_day_4096.jpg')
  
  // 设置纹理重复
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(5, 5) // 水平和垂直方向都重复5次
  
  // 创建材质
  const planeMaterial = new THREE.MeshStandardMaterial({ 
    map: texture,
    side: THREE.DoubleSide, // 使平面的两面都可见
    roughness: 0.5,
    metalness: 0.2
  })
  
  // 创建网格
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  
  // 将平面旋转为水平放置
  plane.rotation.x = -Math.PI / 2
  
  // 将平面放置在场景底部
  plane.position.y = -2
  
  return plane
} 