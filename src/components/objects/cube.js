import * as THREE from 'three'

export function createCube() {
  const cubeGeometry = new THREE.BoxGeometry(2, 2, 2)
  
  // 纹理贴图加载器TextureLoader
  const textureLoader = new THREE.TextureLoader()
  // .load()方法加载图像，返回一个纹理对象
  const earthTexture = textureLoader.load('src/assets/earth_day_4096.jpg')
  // 设置纹理贴图：Texture对象作为材质map属性的属性值
  // 创建使用地球贴图的材质
  const cubeMaterial = new THREE.MeshStandardMaterial({ 
    map: earthTexture,
    roughness: 0.5,
    metalness: 0.2
  })
  
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.position.set(0, 0, 0)
  
  return cube
}