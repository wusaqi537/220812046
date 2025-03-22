import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export function loadEnvironmentMap(scene, renderer) {
  return new Promise((resolve, reject) => {
    // 创建RGBE加载器
    const rgbeLoader = new RGBELoader();
    rgbeLoader.setDataType(THREE.HalfFloatType);
    
    // 加载HDR环境贴图
    rgbeLoader.load('src/assets/env/environment.hdr', (texture) => {
      // 创建环境贴图
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = envMap;
      
      // 设置场景背景（可选）
      // scene.background = envMap;
      
      texture.dispose();
      pmremGenerator.dispose();
      
      console.log('环境贴图加载完成');
      resolve(envMap);
    }, undefined, (error) => {
      console.error('环境贴图加载失败:', error);
      reject(error);
    });
  });
}

// 创建一个环境反射球，用于展示环境贴图效果
export function createEnvReflectiveSphere() {
  // 创建一个高光泽度的金属球体
  const geometry = new THREE.SphereGeometry(1.5, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    metalness: 1.0,     // 完全金属性
    roughness: 0.0,     // 无粗糙度，完全光滑
    envMapIntensity: 1.0, // 环境贴图强度
  });
  
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(0, 2, 0); // 放在地板上方
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  
  return sphere;
} 