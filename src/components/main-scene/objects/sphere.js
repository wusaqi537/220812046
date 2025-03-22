import * as THREE from 'three'

export function createSphere() {
  const sphereGeometry = new THREE.SphereGeometry(1, 64, 64)
  
  // 加载地球贴图 - 修复路径
  const textureLoader = new THREE.TextureLoader()
  const earthTexture = textureLoader.load('src/assets/earth_day_4096.jpg')
  
  // 设置纹理重复
  earthTexture.wrapS = THREE.RepeatWrapping
  earthTexture.wrapT = THREE.RepeatWrapping
  earthTexture.repeat.set(1, 1) // 不重复，使用完整纹理
  
  // 创建使用地球贴图的材质 - 增强环境反射
  const sphereMaterial = new THREE.MeshPhysicalMaterial({ 
    map: earthTexture,
    roughness: 0.2,          // 降低粗糙度增加反射
    metalness: 0.6,          // 增加金属感以反射环境
    envMapIntensity: 1.5,    // 提高环境贴图强度
    clearcoat: 0.5,          // 添加清漆层增强反射
    clearcoatRoughness: 0.1, // 清漆层较为光滑
    reflectivity: 0.8        // 提高反射率
  })
  
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.set(3, 0, 0)
  
  // 添加自转动画参数
  sphere.userData.rotationSpeed = 0.002
  
  return sphere
}