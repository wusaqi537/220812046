import * as THREE from 'three'

export function createFloor() {
  // 创建一个组来包含地板和其边缘
  const floorGroup = new THREE.Group();
  
  // 创建一个平面几何体作为地板
  const floorGeometry = new THREE.PlaneGeometry(20, 20, 10, 10)
  
  // 加载纹理
  const textureLoader = new THREE.TextureLoader()
  const floorTexture = textureLoader.load('src/assets/image.png')
  
  // 设置纹理重复
  floorTexture.wrapS = THREE.RepeatWrapping
  floorTexture.wrapT = THREE.RepeatWrapping
  floorTexture.repeat.set(10, 10) // 水平和垂直方向上都重复10次
  
  // 创建材质
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    map: floorTexture,
    side: THREE.DoubleSide,
    roughness: 0.8,
    metalness: 0.2
  })
  
  // 创建地板网格
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  
  // 旋转地板使其水平放置
  floor.rotation.x = -Math.PI / 2
  
  // 将地板放置在场景底部
  floor.position.y = -2
  
  // 添加地板到组
  floorGroup.add(floor);
  
  // 创建地板边缘（反射玻璃效果）
  const borderWidth = 0.5; // 边框宽度
  const borderHeight = 0.5; // 边框高度
  const floorSize = 20; // 地板尺寸
  
  // 创建边缘的反射材质
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.0,
    transmission: 0.9, // 透明度
    transparent: true,
    reflectivity: 1.0,
    envMapIntensity: 1.5, // 增强环境贴图效果
    clearcoat: 1.0, // 添加清漆层增强反射
    clearcoatRoughness: 0.1
  });
  
  // 创建四个边缘
  // 前边缘
  const frontBorder = createBorder(floorSize, borderWidth, borderHeight, glassMaterial);
  frontBorder.position.set(0, -2 + borderHeight/2, floorSize/2);
  floorGroup.add(frontBorder);
  
  // 后边缘
  const backBorder = createBorder(floorSize, borderWidth, borderHeight, glassMaterial);
  backBorder.position.set(0, -2 + borderHeight/2, -floorSize/2);
  floorGroup.add(backBorder);
  
  // 左边缘
  const leftBorder = createBorder(borderWidth, borderHeight, floorSize, glassMaterial);
  leftBorder.position.set(-floorSize/2, -2 + borderHeight/2, 0);
  floorGroup.add(leftBorder);
  
  // 右边缘
  const rightBorder = createBorder(borderWidth, borderHeight, floorSize, glassMaterial);
  rightBorder.position.set(floorSize/2, -2 + borderHeight/2, 0);
  floorGroup.add(rightBorder);
  
  return floorGroup;
}

// 创建边框函数
function createBorder(width, height, depth, material) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const border = new THREE.Mesh(geometry, material);
  border.castShadow = true;
  border.receiveShadow = true;
  return border;
} 