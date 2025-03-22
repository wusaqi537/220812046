import * as THREE from 'three';

export function createCubemapEnvironment(scene, renderer) {
  return new Promise((resolve, reject) => {
    try {
      // 创建立方体贴图加载器
      const cubeTextureLoader = new THREE.CubeTextureLoader();
      
      // 设置基础路径
      cubeTextureLoader.setPath('src/assets/env/cubemap/');
      
      // 加载立方体六个面的贴图
      // 顺序：右(+X)、左(-X)、上(+Y)、下(-Y)、前(+Z)、后(-Z)
      const envMap = cubeTextureLoader.load([
        'px.jpg', 'nx.jpg',
        'py.jpg', 'ny.jpg',
        'pz.jpg', 'nz.jpg'
      ], () => {
        console.log('立方体环境贴图加载完成');
        
        // 设置场景的环境贴图
        scene.environment = envMap;
        
        // 可选：将环境贴图设置为背景
        // scene.background = envMap;
        
        resolve(envMap);
      });
    } catch (error) {
      console.error('立方体环境贴图加载失败:', error);
      reject(error);
    }
  });
}

// 更新材质以使用环境贴图
export function updateMaterialsForEnvMap(objects, envMap, intensity = 1.0) {
  objects.forEach(object => {
    if (object.material) {
      // 为材质添加环境贴图
      object.material.envMap = envMap;
      object.material.envMapIntensity = intensity;
      
      // 确保材质更新
      object.material.needsUpdate = true;
    }
  });
  
  console.log('已更新材质以使用环境贴图');
} 