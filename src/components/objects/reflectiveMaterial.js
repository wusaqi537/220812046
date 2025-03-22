import * as THREE from 'three';

/**
 * 创建一个具有反射特性的材质
 * @param {Object} options - 材质选项
 * @param {number} options.metalness - 金属度 (0-1)
 * @param {number} options.roughness - 粗糙度 (0-1)
 * @param {string} options.color - 材质颜色
 * @param {number} options.envMapIntensity - 环境贴图强度
 * @returns {THREE.MeshStandardMaterial} 返回创建的材质
 */
export function createReflectiveMaterial(options = {}) {
  // 默认选项
  const defaults = {
    metalness: 0.9,
    roughness: 0.1,
    color: '#ffffff',
    envMapIntensity: 1.0
  };
  
  // 合并选项
  const settings = {...defaults, ...options};
  
  // 创建标准材质
  const material = new THREE.MeshStandardMaterial({
    color: settings.color,
    metalness: settings.metalness,
    roughness: settings.roughness,
    envMapIntensity: settings.envMapIntensity
  });
  
  return material;
}

/**
 * 创建具有环境反射效果的物体
 * @param {string} type - 几何体类型 ('sphere', 'cube', 'torus')
 * @param {Object} options - 材质和几何体选项
 * @returns {THREE.Mesh} 返回创建的网格
 */
export function createReflectiveObject(type = 'sphere', options = {}) {
  let geometry;
  
  // 根据类型创建几何体
  switch(type.toLowerCase()) {
    case 'sphere':
      geometry = new THREE.SphereGeometry(options.radius || 1, options.widthSegments || 64, options.heightSegments || 64);
      break;
    case 'cube':
      geometry = new THREE.BoxGeometry(
        options.width || 1, 
        options.height || 1, 
        options.depth || 1
      );
      break;
    case 'torus':
      geometry = new THREE.TorusGeometry(
        options.radius || 1, 
        options.tube || 0.4, 
        options.radialSegments || 32, 
        options.tubularSegments || 64
      );
      break;
    default:
      geometry = new THREE.SphereGeometry(1, 64, 64);
  }
  
  // 创建反射材质
  const material = createReflectiveMaterial(options);
  
  // 创建网格
  const mesh = new THREE.Mesh(geometry, material);
  
  // 设置其他属性
  if (options.position) {
    mesh.position.set(
      options.position.x || 0,
      options.position.y || 0,
      options.position.z || 0
    );
  }
  
  mesh.castShadow = options.castShadow !== undefined ? options.castShadow : true;
  mesh.receiveShadow = options.receiveShadow !== undefined ? options.receiveShadow : true;
  
  return mesh;
} 