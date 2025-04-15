<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as THREE from 'three'
import { createSphere } from './objects/sphere'
import { createCube } from './objects/cube'
import { createLights } from './lights/lights'
import { createOctahedron } from './objects/octahedron'  // 导入正八面体
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { createFloor } from './objects/floor'
import { loadEnvironmentMap } from './environment/envMap'
import { createCubemapEnvironment } from './environment/CubemapEnvironment'
// 导入GUI组件
import GUIPanel from './gui/GUIPanel.vue'

// 恢复必要的变量声明
const container = ref(null)
let scene, camera, renderer
let cubes = []
let sphere, octahedron
// 使用ref包装光源引用，以便在组件间传递
const ambientLight = ref(null)
const directionalLight = ref(null)
let gui

// 添加面板折叠状态
const isPanelCollapsed = ref(false)

// 添加相机控制变量
const cameraHorizontalAngle = ref(45)
const cameraVerticalAngle = ref(30)
const cameraDistance = ref(14)

// 在 panelState 中添加相机控制的状态
const panelState = reactive({
  camera: true,
  objects: true,
  position: true,
  material: true,
  lights: true,
  ambientLight: true,
  pointLight: true
})

// 切换主面板折叠状态
const toggleMainPanel = () => {
  isPanelCollapsed.value = !isPanelCollapsed.value
}

// 恢复 uiState 定义
const uiState = reactive({
  // 物体控制
  selectedObject: 'cube',
  // 位置控制
  position: {
    x: 0,
    y: 0,
    z: 0
  },
  // 材质控制
  material: {
    color: '#00ff00',
    transparent: false,
    opacity: 1.0,
    shininess: 30
  },
  // 光源控制
  ambientLight: {
    color: '#ffffff',
    intensity: 0.5
  },
  pointLight: {
    color: '#ffffff',
    intensity: 1.0,
    position: {
      x: 10,
      y: 10,
      z: 10
    }
  },
  // 相机控制
  camera: {
    horizontalAngle: 45,
    verticalAngle: 30,
    distance: 14
  },
  // 动画控制
  animation: {
    enabled: true,
    speed: 1
  }
})

// 更新相机位置的函数
const updateCameraPosition = () => {
  if (!camera) return

  const horizontalRad = (uiState.camera.horizontalAngle * Math.PI) / 180
  const verticalRad = (uiState.camera.verticalAngle * Math.PI) / 180

  const distance = uiState.camera.distance

  const x = distance * Math.sin(horizontalRad) * Math.cos(verticalRad)
  const y = distance * Math.sin(verticalRad)
  const z = distance * Math.cos(horizontalRad) * Math.cos(verticalRad)

  camera.position.set(x, y, z)
  camera.lookAt(0, 0, 0)
}

// 专门用于渲染场景的函数
const renderScene = () => {
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
};

// 动画循环
const animate = () => {
  // 始终请求下一帧以保持渲染循环
  requestAnimationFrame(animate);

  // 只有在场景、相机和渲染器都就绪时才继续
  if (!scene || !camera || !renderer) {
    return;
  }

  // 处理动画逻辑
  if (uiState.animation.enabled) {
    const selectedObj = getSelectedObject();
    if (selectedObj) {
      // 旋转对象
      selectedObj.rotation.y += 0.01 * uiState.animation.speed;
    }

    // 地球自转 - 无论是否被选中，地球都继续自转
    if (sphere) {
      sphere.rotation.y += sphere.userData.rotationSpeed * uiState.animation.speed;
    }
  }

  // 渲染场景
  renderScene();
}

// 获取当前选中的对象
const getSelectedObject = () => {
  let selectedObj = null;

  switch(uiState.selectedObject) {
    case 'cube':
      if (cubes && cubes.length > 0) {
        selectedObj = cubes[0];
      }
      break;
    case 'sphere':
      if (sphere) {
        selectedObj = sphere;
      }
      break;
    case 'octahedron':
      if (octahedron) {
        selectedObj = octahedron;
      }
      break;
    default:
      console.log("未知对象类型:", uiState.selectedObject);
  }

  return selectedObj;
}

// 同步选中物体的位置到UI状态
const syncObjectPosition = () => {
  const selectedObj = getSelectedObject();
  if (!selectedObj) return;

  console.log("同步物体位置到UI:", {
    x: selectedObj.position.x,
    y: selectedObj.position.y,
    z: selectedObj.position.z
  });

  // 更新UI状态
  uiState.position.x = selectedObj.position.x;
  uiState.position.y = selectedObj.position.y;
  uiState.position.z = selectedObj.position.z;

  return selectedObj;
}

// 更新对象属性
const updateObjectProperties = () => {
  const selectedObj = getSelectedObject()
  if (!selectedObj) return;

  // 检查是否属于更新中，避免循环
  if (updateObjectProperties.isUpdating) {
    return;
  }

  try {
    updateObjectProperties.isUpdating = true;

    // 更新位置 - 直接同步，确保物体位置始终与UI一致
    selectedObj.position.set(
      uiState.position.x,
      uiState.position.y,
      uiState.position.z
    );

    // 更新材质 - 直接同步
    selectedObj.material.color.set(uiState.material.color)
    selectedObj.material.transparent = uiState.material.transparent
    selectedObj.material.opacity = uiState.material.opacity
    selectedObj.material.shininess = uiState.material.shininess
    selectedObj.material.needsUpdate = true

    // 更新光源
    if (ambientLight.value) {
      ambientLight.value.color.set(uiState.ambientLight.color)
      ambientLight.value.intensity = uiState.ambientLight.intensity
    }

    if (directionalLight.value) {
      directionalLight.value.color.set(uiState.pointLight.color)
      directionalLight.value.intensity = uiState.pointLight.intensity
      directionalLight.value.position.set(
        uiState.pointLight.position.x,
        uiState.pointLight.position.y,
        uiState.pointLight.position.z
      )
    }

    // 更新相机
    updateCameraPosition()

    // 渲染场景显示变化
    renderScene();
  } finally {
    updateObjectProperties.isUpdating = false;
  }
}

// 初始化场景
const initScene = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000) // 设置场景背景为纯黑色

  const axesHelper = new THREE.AxesHelper(10)
  scene.add(axesHelper)

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )

  // 设置相机初始位置
  camera.position.set(5, 3, 10)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  // 启用阴影
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  // 确保container存在后添加renderer
  if (container.value) {
    // 检查是否已经添加过
    if (container.value.firstChild) {
      container.value.replaceChild(renderer.domElement, container.value.firstChild)
    } else {
      container.value.appendChild(renderer.domElement)
    }
    console.log("渲染器已添加到DOM")
  } else {
    console.error("找不到容器元素，无法添加渲染器")
  }

  // 创建光源并直接保存引用
  const lights = createLights()
  // 保存引用到reactive refs
  ambientLight.value = lights.find(light => light instanceof THREE.AmbientLight)
  directionalLight.value = lights.find(light => light instanceof THREE.DirectionalLight)
  // 添加光源到场景
  lights.forEach(light => scene.add(light))

  // 初始化光源状态
  if (ambientLight.value) {
    ambientLight.value.color.set(uiState.ambientLight.color)
    ambientLight.value.intensity = uiState.ambientLight.intensity
  }

  if (directionalLight.value) {
    directionalLight.value.color.set(uiState.pointLight.color)
    directionalLight.value.intensity = uiState.pointLight.intensity
    directionalLight.value.position.set(
      uiState.pointLight.position.x,
      uiState.pointLight.position.y,
      uiState.pointLight.position.z
    )

    // 启用平行光源的阴影
    directionalLight.value.castShadow = true
    directionalLight.value.shadow.mapSize.width = 1024
    directionalLight.value.shadow.mapSize.height = 1024
  }
}

// 创建3D对象
const createObjects = () => {
  const gridHelper = new THREE.GridHelper(100, 100, 0x00ffff, 0x004444)
  gridHelper.material.opacity = 0.25
  gridHelper.material.transparent = true
  scene.add(gridHelper)

  // 创建立方体
  const cube = createCube()
  cube.position.set(0, 0, 0) // 显式设置立方体位置为原点
  scene.add(cube)
  cubes = [cube]
  console.log("立方体创建完成，位置:", cube.position)

  // 创建球体
  sphere = createSphere()
  // 设置球体的初始位置
  sphere.position.set(3, 0, 0)
  scene.add(sphere)
  console.log("球体创建完成，位置:", sphere.position)

  // 创建八面体
  octahedron = createOctahedron()
  // 设置八面体的初始位置
  octahedron.position.set(-3, 0, 0)
  scene.add(octahedron)
  console.log("八面体创建完成，位置:", octahedron.position)

  // 创建地板
  const floor = createFloor()
  scene.add(floor)
  console.log("地板创建完成，位置:", floor.position)

  // 更新相机位置
  updateCameraPosition()

  // 记录所有对象初始位置，方便重置和选择
  const initialPositions = {
    cube: { x: 0, y: 0, z: 0 },
    sphere: { x: 3, y: 0, z: 0 },
    octahedron: { x: -3, y: 0, z: 0 }
  }

  // 保存初始位置到window对象以便全局访问
  window.initialObjectPositions = initialPositions
  console.log("所有对象的初始位置已记录:", initialPositions)

  // 创建辅助函数，用于恢复物体初始位置
  window.resetObjectToInitialPosition = (objectType) => {
    if (!initialPositions[objectType]) return;

    const pos = initialPositions[objectType];
    let obj = null;

    switch(objectType) {
      case 'cube':
        obj = cubes[0];
        break;
      case 'sphere':
        obj = sphere;
        break;
      case 'octahedron':
        obj = octahedron;
        break;
    }

    if (obj) {
      obj.position.set(pos.x, pos.y, pos.z);
      console.log(`重置${objectType}到初始位置:`, pos);

      // 如果这是当前选中的对象，也更新UI状态
      if (uiState.selectedObject === objectType) {
        uiState.position.x = pos.x;
        uiState.position.y = pos.y;
        uiState.position.z = pos.z;
      }
    }
  };
}

// 加载环境贴图
const initEnvironment = async () => {
  if (!renderer || !scene) {
    console.error("渲染器或场景未初始化，无法加载环境贴图");
    return;
  }

  try {
    console.log("开始加载环境贴图");

    // 尝试直接使用静态环境贴图
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    cubeTextureLoader.setPath('src/assets/env/cubemap/');

    // 首先检查文件是否存在
    const envMap = await new Promise((resolve, reject) => {
      // 设置一个简单的加载包装器
      const image = new Image();
      image.onload = () => {
        // 如果图像加载成功，继续加载立方体贴图
        const envMap = cubeTextureLoader.load([
          'px.jpg', 'nx.jpg',
          'py.jpg', 'ny.jpg',
          'pz.jpg', 'nz.jpg'
        ], () => {
          console.log("立方体环境贴图加载成功");
          resolve(envMap);
        }, undefined, (error) => {
          console.error("立方体环境贴图加载失败:", error);
          reject(error);
        });
      };

      image.onerror = () => {
        // 图像加载失败，使用备选方案
        console.warn("环境贴图文件不存在，使用颜色环境");
        reject(new Error("环境贴图文件不存在"));
      };

      // 尝试加载第一张图像以检查是否存在
      image.src = 'src/assets/env/cubemap/px.jpg';
    }).catch(error => {
      console.warn("无法加载环境贴图，创建默认环境:", error);

      // 创建简单的色彩渐变作为环境
      const colors = [
        new THREE.Color(0x88CCFF), // 上方 - 天蓝色
        new THREE.Color(0xAAAAFF), // 下方 - 淡蓝色
        new THREE.Color(0x000000)  // 地平线 - 黑色
      ];

      // 使用场景背景颜色来模拟简单环境
      scene.background = new THREE.Color(0x88CCFF);

      // 返回空值表示无环境贴图
      return null;
    });

    if (envMap) {
      // 设置场景环境
      scene.environment = envMap;

      // 设置场景背景为环境贴图
      scene.background = envMap;

      console.log("环境贴图设置成功");

      // 更新渲染器设置以增强环境效果
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2; // 提高曝光以增强效果
      renderer.outputEncoding = THREE.sRGBEncoding;

      // 直接更新材质以使用环境贴图
      scene.traverse((object) => {
        if (object.isMesh && object.material) {
          // 检查是否是MeshStandardMaterial或MeshPhysicalMaterial
          if (object.material.isMeshStandardMaterial ||
              object.material.isMeshPhysicalMaterial) {

            // 确保材质能够受到环境贴图影响
            object.material.envMap = envMap;

            // 根据材质类型调整环境贴图强度
            if (object.material.isMeshPhysicalMaterial) {
              // 物理材质（如玻璃边缘）增强环境贴图效果
              object.material.envMapIntensity = 1.5;
            } else {
              // 标准材质（如地球）使用正常强度
              object.material.envMapIntensity = 0.8;
            }

            object.material.needsUpdate = true;
            console.log(`更新物体 "${object.name || '未命名'}" 的材质以使用环境贴图`);
          }
        }
      });

      return envMap;
    }
  } catch (error) {
    console.error("环境贴图加载失败:", error);

    // 仍然返回null以便调用代码可以处理
    return null;
  }
}

// 设置默认场景
const setDefaultScene = () => {
  // 获取当前选中的对象
  const selectedObj = getSelectedObject()
  if (selectedObj) {
    // 重置位置
    selectedObj.position.set(0, 0, 0)
    // 重置缩放
    selectedObj.scale.set(1, 1, 1)
    // 重置材质
    selectedObj.material.color.set('#00ff00')
    selectedObj.material.transparent = false
    selectedObj.material.opacity = 1.0
    selectedObj.material.shininess = 30
    selectedObj.material.needsUpdate = true
  }

  // 重置状态
  uiState.position.x = 0
  uiState.position.y = 0
  uiState.position.z = 0

  uiState.material.color = '#00ff00'
  uiState.material.transparent = false
  uiState.material.opacity = 1.0
  uiState.material.shininess = 30

  uiState.ambientLight.color = '#ffffff'
  uiState.ambientLight.intensity = 0.5

  uiState.pointLight.color = '#ffffff'
  uiState.pointLight.intensity = 1.0
  uiState.pointLight.position.x = 10
  uiState.pointLight.position.y = 10
  uiState.pointLight.position.z = 10

  // 重置光源
  if (ambientLight.value) {
    ambientLight.value.color.set('#ffffff')
    ambientLight.value.intensity = 0.5
  }

  if (directionalLight.value) {
    directionalLight.value.color.set('#ffffff')
    directionalLight.value.intensity = 1.0
    directionalLight.value.position.set(10, 10, 10)
  }

  // 更新场景
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// 清除场景
const clearScene = () => {
  // 重置所有对象位置和属性
  cubes[0].position.set(0, 0, 0)
  sphere.position.set(0, 0, 0)
  octahedron.position.set(0, 0, 0)

  // 重置材质
  cubes[0].material.color.set('#ffffff')
  sphere.material.color.set('#ffffff')
  octahedron.material.color.set('#ffffff')

  // 重置光源
  ambientLight.value.intensity = 0.5
  directionalLight.value.intensity = 0.5

  // 更新UI状态
  setDefaultScene()
}

// 启动动画
const startAnimation = () => {
  uiState.animation.enabled = true
  animate()
}

// 停止动画
const stopAnimation = () => {
  uiState.animation.enabled = false
}

// 重置光源
const resetLight = () => {
  uiState.ambientLight.intensity = 0
  uiState.pointLight.intensity = 0
  updateObjectProperties()
}

// 创建全局访问器函数以便GUI能够获取对象
window.getCube = function() {
  return cubes && cubes.length > 0 ? cubes[0] : null;
};

window.getSphere = function() {
  return sphere;
};

window.getOctahedron = function() {
  return octahedron;
};

// 处理窗口大小变化
const handleResize = () => {
  if (camera && renderer) {
    // 更新相机宽高比
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // 更新渲染器大小
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 重新渲染场景
    renderScene();

    console.log("窗口大小已调整，渲染器和相机已更新");
  }
};

// 初始化相机控制器
const initControls = () => {
  if (!camera || !renderer || !renderer.domElement) {
    console.error("无法初始化控制器：相机或渲染器未就绪");
    return null;
  }

  // 创建轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement);

  // 配置控制器
  controls.enableDamping = true; // 启用阻尼效果
  controls.dampingFactor = 0.05; // 阻尼系数
  controls.rotateSpeed = 0.8; // 旋转速度
  controls.zoomSpeed = 1.0; // 缩放速度
  controls.panSpeed = 0.8; // 平移速度
  controls.minDistance = 5; // 最小距离
  controls.maxDistance = 50; // 最大距离
  controls.maxPolarAngle = Math.PI / 1.5; // 限制垂直旋转角度

  // 默认不启用自动旋转
  controls.autoRotate = false;
  controls.autoRotateSpeed = 1.0;

  // 设置初始位置
  camera.position.set(5, 5, 10);
  controls.update();

  console.log("相机控制器初始化完成");

  return controls;
};

// 初始化GUI
const initGUI = () => {
  // 确保uiState已经正确初始化
  console.log('初始化GUI组件，当前uiState:', uiState);

  // 导出必要的方法到window对象，供GUI组件使用
  window.getSelectedObject = getSelectedObject;
  window.updateObjectProperties = updateObjectProperties;
  window.syncObjectPosition = syncObjectPosition;

  // 保存原始的selectedObject值
  const oldSelectedObjectValue = uiState.selectedObject;

  // 创建变量存储selectedObject值
  let selectedObjectValue = oldSelectedObjectValue;

  // 使用Object.defineProperty监听selectedObject属性变更
  Object.defineProperty(uiState, 'selectedObject', {
    get: function() {
      return selectedObjectValue;
    },
    set: function(newValue) {
      const oldValue = selectedObjectValue;

      // 更新存储的值
      selectedObjectValue = newValue;

      // 如果值发生了变化，则同步物体位置
      if (oldValue !== newValue) {
        console.log(`物体选择从 ${oldValue} 变更为 ${newValue}，同步位置`);

        // 确保UI不更新太快导致位置未同步
        setTimeout(() => {
          syncObjectPosition();

          // 通知GUI组件更新位置控制器显示
          if (window.updateGUIDisplay) {
            window.updateGUIDisplay();
          }
        }, 50);
      }
    },
    enumerable: true,
    configurable: true
  });

  // 调试信息
  console.log("对象引用检查:");
  console.log("- cube存在:", !!cubes[0]);
  console.log("- sphere存在:", !!sphere);
  console.log("- octahedron存在:", !!octahedron);

  // 导出对象引用到window，确保GUI组件可以访问
  window.getCube = function() { return cubes[0]; };
  window.getSphere = function() { return sphere; };
  window.getOctahedron = function() { return octahedron; };

  // 初始化GUI组件
  console.log('GUI初始化委托给GUIPanel组件');
  // 确保在这里没有阻止GUI面板的显示
}

// 清理资源
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)

  if (renderer) {
    renderer.dispose()
  }

  if (gui) {
    gui.destroy()
  }

  cubes.forEach(cube => {
    cube.geometry.dispose()
    cube.material.dispose()
  })
})

// 导出必要的变量给GUIPanel使用
const exposedData = {
  uiState,
  getSelectedObject,
  updateObjectProperties,
  clearScene: () => {
    // 实现清除场景的功能
    if (scene) {
      // 保留基本元素
      const basicObjects = [];
      scene.traverse(obj => {
        if (obj instanceof THREE.AxesHelper ||
            obj instanceof THREE.AmbientLight ||
            obj instanceof THREE.DirectionalLight ||
            obj instanceof THREE.GridHelper) {
          basicObjects.push(obj);
        }
      });

      // 清除场景
      while(scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }

      // 添加回基本元素
      basicObjects.forEach(obj => scene.add(obj));

      // 清除引用
      cubes = [];
      sphere = null;
      octahedron = null;

      // 重新渲染
      renderScene();
    }
  },
  setDefault: () => {
    // 实现重置场景的功能
    if (scene) {
      // 重置相机位置
      uiState.camera.horizontalAngle = 45;
      uiState.camera.verticalAngle = 30;
      uiState.camera.distance = 14;
      updateCameraPosition();

      // 重置物体位置
      if (sphere) sphere.position.set(4, 0, 0);
      if (cubes.length > 0) cubes[0].position.set(0, 0, 0);
      if (octahedron) octahedron.position.set(-4, 0, 0);

      // 重置UI状态
      syncObjectPosition();

      // 重新渲染
      renderScene();
    }
  },
  startAnimation: () => {
    uiState.animation.enabled = true;
  },
  stopAnimation: () => {
    uiState.animation.enabled = false;
  },
  scene,
  camera,
  renderer,
  ambientLight,
  directionalLight
};

// 生命周期钩子 - 组件挂载
onMounted(() => {
  console.log("ThreeScene组件挂载");

  // 初始化场景
  initScene();

  // 添加物体
  createObjects();

  // 加载环境贴图
  initEnvironment().then(() => {
    console.log("环境贴图加载和应用完成");
    // 重新渲染以显示环境贴图效果
    renderScene();
  }).catch(error => {
    console.error("环境贴图加载过程中出错:", error);
  });

  // 设置相机控制器
  initControls();

  // 开始动画循环
  animate();

  // 设置窗口大小变化的监听器
  window.addEventListener('resize', handleResize);

  // 选择默认对象
  uiState.selectedObject = 'cube';
  syncObjectPosition();

  // 暴露三维场景相关数据，并导出到全局对象以供GUI访问
  window.threeSceneData = exposedData;
  console.log("三维场景数据已导出:", window.threeSceneData);

  // 暴露各个3D对象的获取函数到全局，供GUI使用
  window.getCube = () => cubes[0] || null;
  window.getSphere = () => sphere || null;
  window.getOctahedron = () => octahedron || null;
  window.getSelectedObject = getSelectedObject;
  window.updateObjectProperties = updateObjectProperties;
  window.clearScene = exposedData.clearScene;
  window.setDefault = exposedData.setDefault;
  window.startAnimation = exposedData.startAnimation;
  window.stopAnimation = exposedData.stopAnimation;

  console.log("ThreeScene组件初始化完成");
});

</script>

<template>
  <div ref="container" class="three-container">
    <GUIPanel
      :scene="scene"
      :camera="camera"
      :renderer="renderer"
      :uiState="uiState"
      :getSelectedObject="getSelectedObject"
      :clearScene="clearScene"
      :setDefault="setDefaultScene"
      :startAnimation="startAnimation"
      :stopAnimation="stopAnimation"
      :updateObjectProperties="updateObjectProperties"
      :ambientLight="ambientLight"
      :directionalLight="directionalLight"
    />
  </div>
</template>

<style scoped>
.three-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #000000;
  /* 添加z-index确保场景在最底层 */
  z-index: 1;
}
</style>