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

  // 创建使用地球贴图的材质 - 增强金属度和反射效果
  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    map: earthTexture,
    roughness: 0.2,          // 降低粗糙度增强反射
    metalness: 0.8,          // 增加金属度以增强反射
    envMapIntensity: 2.0,    // 增强环境贴图强度
    clearcoat: 0.8,          // 增强清漆层
    clearcoatRoughness: 0.1, // 清漆层较为光滑
    reflectivity: 1.0,       // 最大反射率
    emissive: new THREE.Color(0x222222), // 保留微弱的自发光
    emissiveIntensity: 0.1   // 降低自发光强度
  })

  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.set(3, 0, 0)

  // 添加自转动画参数
  sphere.userData.rotationSpeed = 0.002

  return sphere
}