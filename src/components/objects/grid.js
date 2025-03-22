import * as THREE from 'three'

export function createTextureGrid() {
  // 创建一个大型平面作为网格
  const gridGeometry = new THREE.PlaneGeometry(20, 20, 10, 10)
  
  // 加载纹理
  const textureLoader = new THREE.TextureLoader()
  const gridTexture = textureLoader.load('src/assets/earth_day_4096.jpg')
  
  // 设置纹理重复
  gridTexture.wrapS = THREE.RepeatWrapping
  gridTexture.wrapT = THREE.RepeatWrapping
  gridTexture.repeat.set(5, 2) // 水平方向重复5次，垂直方向重复2次
  
  // 创建材质
  const gridMaterial = new THREE.MeshStandardMaterial({ 
    map: gridTexture,
    roughness: 0.7,
    metalness: 0.1,
    side: THREE.DoubleSide // 双面可见
  })
  
  // 创建网格平面
  const grid = new THREE.Mesh(gridGeometry, gridMaterial)
  
  // 将平面放置在场景底部，并旋转为水平状态
  grid.rotation.x = -Math.PI / 2 // 水平放置
  grid.position.y = -2 // 放在底部
  
  return grid
} 