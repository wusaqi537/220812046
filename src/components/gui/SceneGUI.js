// 使用lil-gui替代dat.gui
import { GUI } from 'lil-gui'
import * as THREE from 'three'

// 全局变量，用于保存引用
let uiState = null;
let renderer_ref = null;
let scene_ref = null;
let camera_ref = null;

// 创建GUI
export function createGUI(options) {
  const {
    uiState,
    getSelectedObject,
    clearScene,
    setDefault,
    startAnimation,
    stopAnimation,
    updateObjectProperties,
    ambientLight,
    directionalLight,
    scene,
    camera, 
    renderer
  } = options

  // 创建单独的GUI实例
  const gui = new GUI({ 
    container: document.body,
    autoPlace: false,
    width: 200,
    title: 'Controls'
  });
  
  // 添加基本控制项
  const basicControls = gui.addFolder('基本控制');
  basicControls.add({ 
    setDefaults: function() {
      if (typeof setDefault === 'function') {
        setDefault()
      }
    }
  }, 'setDefaults').name('重置默认值');
  
  basicControls.add({ 
    clear: function() {
      if (typeof clearScene === 'function') {
        clearScene()
      }
    }
  }, 'clear').name('清除场景');
  
  // 物体控制
  const objectControls = gui.addFolder('物体控制');
  
  // 添加标志防止重复触发
  let isChangingObject = false;
  
  // 递归更新所有控制器的显示
  function updateAllControllers(gui) {
    // 更新当前层级的控制器
    for (const controller of gui.controllers) {
      controller.updateDisplay();
    }
    
    // 递归更新所有子文件夹中的控制器
    for (const folder of gui.folders) {
      updateAllControllers(folder);
    }
  }
  
  // 添加选择物体的控制
  const addObjectSelectionControl = (gui, uiState) => {
    // 存储位置控制器的引用，以便后续更新
    let positionXController, positionYController, positionZController;
    // 存储当前选中的对象类型
    let currentSelectedObject = null;
    // 标记是否正在更新UI，避免循环更新
    let isUpdatingUI = false;

    // 创建对象选择文件夹
    const objectControls = gui.addFolder('对象选择');
    
    // 添加物体选择下拉菜单
    objectControls.add(uiState, 'selectedObject', ['cube', 'sphere', 'octahedron']).name('选择物体').onChange((objectType) => {
      console.log('选择物体变更:', objectType);
      
      // 防止重复处理
      if (currentSelectedObject === objectType) {
        console.log('重复选择相同物体，跳过处理');
        return;
      }
      
      currentSelectedObject = objectType;
      
      // 设置标记，避免位置更新导致物体移动
      isUpdatingUI = true;
      
      try {
        // 获取当前选中物体的位置
        let selectedObject;
        
        // 根据选择类型获取对应的3D对象
        if (objectType === 'cube') {
          selectedObject = window.getCube();
        } else if (objectType === 'sphere') {
          selectedObject = window.getSphere();
        } else if (objectType === 'octahedron') {
          selectedObject = window.getOctahedron();
        }
        
        if (selectedObject) {
          console.log(`获取到${objectType}对象:`, selectedObject);
          
          // 更新UI状态的位置值（不移动物体）
          uiState.position.x = selectedObject.position.x;
          uiState.position.y = selectedObject.position.y;
          uiState.position.z = selectedObject.position.z;
          
          console.log(`更新UI位置为物体当前位置:`, 
            {x: uiState.position.x, y: uiState.position.y, z: uiState.position.z});
          
          // 手动更新位置控制器显示
          if (positionXController) positionXController.updateDisplay();
          if (positionYController) positionYController.updateDisplay();
          if (positionZController) positionZController.updateDisplay();
          
          // 同步材质属性
          if (selectedObject.material) {
            if (selectedObject.material.color) {
              const hexColor = '#' + selectedObject.material.color.getHexString();
              uiState.material.color = hexColor;
            }
            
            uiState.material.transparent = !!selectedObject.material.transparent;
            uiState.material.opacity = selectedObject.material.opacity !== undefined ? selectedObject.material.opacity : 1;
            
            // 为金属材质添加镜面反射特性
            if (selectedObject.material.shininess !== undefined) {
              uiState.material.shininess = selectedObject.material.shininess;
            } else {
              uiState.material.shininess = 30; // 默认值
            }
          }
        } else {
          console.warn(`无法获取${objectType}对象`);
        }
      } catch (error) {
        console.error('选择物体时发生错误:', error);
      } finally {
        // 处理完成，解除标记
        isUpdatingUI = false;
      }
    });
    
    // 打开对象选择文件夹
    objectControls.open();
    
    // 添加位置控制
    const positionFolder = gui.addFolder('位置');
    
    // 保存位置控制器引用
    positionXController = positionFolder.add(uiState.position, 'x', -10, 10).onChange((value) => {
      // 如果正在更新UI，则跳过物体位置更新
      if (isUpdatingUI) return;
      
      updateObjectPosition(uiState);
    });
    
    positionYController = positionFolder.add(uiState.position, 'y', -10, 10).onChange((value) => {
      // 如果正在更新UI，则跳过物体位置更新
      if (isUpdatingUI) return;
      
      updateObjectPosition(uiState);
    });
    
    positionZController = positionFolder.add(uiState.position, 'z', -10, 10).onChange((value) => {
      // 如果正在更新UI，则跳过物体位置更新
      if (isUpdatingUI) return;
      
      updateObjectPosition(uiState);
    });

    // 添加重置位置按钮
    positionFolder.add({ resetPosition: function() {
      // 调用重置函数恢复物体到初始位置
      if (window.resetObjectToInitialPosition && uiState.selectedObject) {
        window.resetObjectToInitialPosition(uiState.selectedObject);
        
        // 更新控制器显示
        positionXController.updateDisplay();
        positionYController.updateDisplay();
        positionZController.updateDisplay();
      }
    }}, 'resetPosition').name('重置位置');
    
    positionFolder.open();
  }

  // 获取控制器的引用便于直接访问
  let positionXController, positionYController, positionZController;
  let materialColorController, materialTransparentController, materialOpacityController, materialShininessController;
  
  // 位置控制
  const positionControls = objectControls.addFolder('位置');
  positionXController = positionControls.add(uiState.position, 'x', -10, 10, 0.1).name('X坐标').onChange((value) => {
    // 直接更新物体位置
    const selectedObj = getSelectedObject();
    if (selectedObj) {
      selectedObj.position.x = value;
      // 渲染场景以显示变化
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
  });
  
  positionYController = positionControls.add(uiState.position, 'y', -10, 10, 0.1).name('Y坐标').onChange((value) => {
    // 直接更新物体位置
    const selectedObj = getSelectedObject();
    if (selectedObj) {
      selectedObj.position.y = value;
      // 渲染场景以显示变化
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
  });
  
  positionZController = positionControls.add(uiState.position, 'z', -10, 10, 0.1).name('Z坐标').onChange((value) => {
    // 直接更新物体位置
    const selectedObj = getSelectedObject();
    if (selectedObj) {
      selectedObj.position.z = value;
      // 渲染场景以显示变化
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
  });
  
  // 材质控制
  const materialControls = objectControls.addFolder('材质');
  materialColorController = materialControls.addColor(uiState.material, 'color').name('颜色');
  materialTransparentController = materialControls.add(uiState.material, 'transparent').name('是否透明');
  materialOpacityController = materialControls.add(uiState.material, 'opacity', 0, 1, 0.1).name('透明度');
  materialShininessController = materialControls.add(uiState.material, 'shininess', 0, 200, 1).name('高光');
  
  // 光源控制
  const lightControls = gui.addFolder('光源控制');
  
  // 环境光控制
  const ambientLightControls = lightControls.addFolder('环境光');
  ambientLightControls.addColor(uiState.ambientLight, 'color').name('颜色').onChange(() => {
    if (typeof updateObjectProperties === 'function') {
      updateObjectProperties();
    }
  });
  
  ambientLightControls.add(uiState.ambientLight, 'intensity', 0, 3, 0.1).name('强度').onChange(() => {
    if (typeof updateObjectProperties === 'function') {
      updateObjectProperties();
    }
  });
  
  // 点光源控制
  const pointLightControls = lightControls.addFolder('点光源');
  pointLightControls.addColor(uiState.pointLight, 'color').name('颜色').onChange(() => {
    if (typeof updateObjectProperties === 'function') {
      updateObjectProperties();
    }
  });
  
  pointLightControls.add(uiState.pointLight, 'intensity', 0, 3, 0.1).name('强度').onChange(() => {
    if (typeof updateObjectProperties === 'function') {
      updateObjectProperties();
    }
  });
  
  // 点光源位置控制
  const pointLightPositionFolder = pointLightControls.addFolder('位置');
  pointLightPositionFolder.add(uiState.pointLight.position, 'x', -20, 20, 1).name('X坐标').onChange(() => {
    if (typeof updateObjectProperties === 'function') {
      updateObjectProperties();
    }
  });
  
  pointLightPositionFolder.add(uiState.pointLight.position, 'y', -20, 20, 1).name('Y坐标').onChange(() => {
    if (typeof updateObjectProperties === 'function') {
      updateObjectProperties();
    }
  });
  
  pointLightPositionFolder.add(uiState.pointLight.position, 'z', -20, 20, 1).name('Z坐标').onChange(() => {
    if (typeof updateObjectProperties === 'function') {
      updateObjectProperties();
    }
  });
  
  // 新增：环境贴图控制
  const envMapControls = gui.addFolder('环境贴图控制');
  
  // 创建环境贴图强度控制
  if (uiState.environment === undefined) {
    // 如果uiState中没有环境贴图属性，则添加
    uiState.environment = {
      enabled: true,
      intensity: 1.0,
      backgroundEnabled: true
    };
  }
  
  envMapControls.add(uiState.environment, 'enabled').name('启用环境贴图').onChange((value) => {
    const objects = [];
    if (window.getCube) objects.push(window.getCube());
    if (window.getSphere) objects.push(window.getSphere());
    if (window.getOctahedron) objects.push(window.getOctahedron());
    
    objects.forEach(obj => {
      if (obj && obj.material) {
        if (value) {
          // 启用环境贴图
          if (scene_ref && scene_ref.environment) {
            obj.material.envMap = scene_ref.environment;
            obj.material.needsUpdate = true;
          }
        } else {
          // 禁用环境贴图
          obj.material.envMap = null;
          obj.material.needsUpdate = true;
        }
      }
    });
    
    // 刷新渲染
    if (renderer_ref && scene_ref && camera_ref) {
      renderer_ref.render(scene_ref, camera_ref);
    }
  });
  
  // 环境贴图强度调节
  envMapControls.add(uiState.environment, 'intensity', 0, 3, 0.1).name('环境贴图强度').onChange((value) => {
    const objects = [];
    if (window.getCube) objects.push(window.getCube());
    if (window.getSphere) objects.push(window.getSphere());
    if (window.getOctahedron) objects.push(window.getOctahedron());
    
    objects.forEach(obj => {
      if (obj && obj.material) {
        obj.material.envMapIntensity = value;
        obj.material.needsUpdate = true;
      }
    });
    
    // 刷新渲染
    if (renderer_ref && scene_ref && camera_ref) {
      renderer_ref.render(scene_ref, camera_ref);
    }
  });
  
  // 控制是否将环境贴图用作背景
  envMapControls.add(uiState.environment, 'backgroundEnabled').name('作为背景').onChange((value) => {
    if (scene_ref) {
      if (value) {
        // 使用环境贴图作为背景
        scene_ref.background = scene_ref.environment;
      } else {
        // 使用纯色背景
        scene_ref.background = new THREE.Color(0x88CCFF);
      }
      
      // 刷新渲染
      if (renderer_ref && camera_ref) {
        renderer_ref.render(scene_ref, camera_ref);
      }
    }
  });
  
  // 增强材质控制 - 添加高级材质参数
  // 扩展材质控制以包含物理材质参数
  if (uiState.advancedMaterial === undefined) {
    uiState.advancedMaterial = {
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      reflectivity: 0.8,
      roughness: 0.2,
      metalness: 0.6,
      transmission: 0.0
    };
  }
  
  const advancedMaterialControls = materialControls.addFolder('高级材质参数');
  
  // 粗糙度控制
  advancedMaterialControls.add(uiState.advancedMaterial, 'roughness', 0, 1, 0.01).name('粗糙度').onChange((value) => {
    const selectedObj = getSelectedObject();
    if (selectedObj && selectedObj.material) {
      selectedObj.material.roughness = value;
      selectedObj.material.needsUpdate = true;
      
      // 刷新渲染
      if (renderer_ref && scene_ref && camera_ref) {
        renderer_ref.render(scene_ref, camera_ref);
      }
    }
  });
  
  // 金属度控制
  advancedMaterialControls.add(uiState.advancedMaterial, 'metalness', 0, 1, 0.01).name('金属度').onChange((value) => {
    const selectedObj = getSelectedObject();
    if (selectedObj && selectedObj.material) {
      selectedObj.material.metalness = value;
      selectedObj.material.needsUpdate = true;
      
      // 刷新渲染
      if (renderer_ref && scene_ref && camera_ref) {
        renderer_ref.render(scene_ref, camera_ref);
      }
    }
  });
  
  // 清漆层控制 - 仅对MeshPhysicalMaterial有效
  advancedMaterialControls.add(uiState.advancedMaterial, 'clearcoat', 0, 1, 0.01).name('清漆层').onChange((value) => {
    const selectedObj = getSelectedObject();
    if (selectedObj && selectedObj.material && selectedObj.material.isMeshPhysicalMaterial) {
      selectedObj.material.clearcoat = value;
      selectedObj.material.needsUpdate = true;
      
      // 刷新渲染
      if (renderer_ref && scene_ref && camera_ref) {
        renderer_ref.render(scene_ref, camera_ref);
      }
    }
  });
  
  // 清漆层粗糙度控制
  advancedMaterialControls.add(uiState.advancedMaterial, 'clearcoatRoughness', 0, 1, 0.01).name('清漆层粗糙度').onChange((value) => {
    const selectedObj = getSelectedObject();
    if (selectedObj && selectedObj.material && selectedObj.material.isMeshPhysicalMaterial) {
      selectedObj.material.clearcoatRoughness = value;
      selectedObj.material.needsUpdate = true;
      
      // 刷新渲染
      if (renderer_ref && scene_ref && camera_ref) {
        renderer_ref.render(scene_ref, camera_ref);
      }
    }
  });
  
  // 反射率控制 - 对某些材质有效
  advancedMaterialControls.add(uiState.advancedMaterial, 'reflectivity', 0, 1, 0.01).name('反射率').onChange((value) => {
    const selectedObj = getSelectedObject();
    if (selectedObj && selectedObj.material) {
      if ('reflectivity' in selectedObj.material) {
        selectedObj.material.reflectivity = value;
        selectedObj.material.needsUpdate = true;
        
        // 刷新渲染
        if (renderer_ref && scene_ref && camera_ref) {
          renderer_ref.render(scene_ref, camera_ref);
        }
      }
    }
  });
  
  // 透射率控制 - 仅对MeshPhysicalMaterial有效
  advancedMaterialControls.add(uiState.advancedMaterial, 'transmission', 0, 1, 0.01).name('透射率').onChange((value) => {
    const selectedObj = getSelectedObject();
    if (selectedObj && selectedObj.material && selectedObj.material.isMeshPhysicalMaterial) {
      selectedObj.material.transmission = value;
      selectedObj.material.needsUpdate = true;
      
      // 刷新渲染
      if (renderer_ref && scene_ref && camera_ref) {
        renderer_ref.render(scene_ref, camera_ref);
      }
    }
  });
  
  // 更新处理器
  gui.onChange(() => {
    if (typeof updateObjectProperties === 'function') {
      updateObjectProperties();
    }
  });
  
  // 设置GUI位置和样式
  gui.domElement.style.position = 'absolute';
  gui.domElement.style.top = '10px';
  gui.domElement.style.right = '10px';
  gui.domElement.style.zIndex = '1000';
  gui.domElement.style.pointerEvents = 'auto';
  gui.domElement.style.maxHeight = 'none';
  gui.domElement.style.maxWidth = 'none';
  gui.domElement.style.overflow = 'visible';
  
  // 添加拖动功能
  const cleanupDrag = makeDraggable(gui.domElement);
  
  // 添加可拉伸调整大小功能
  const cleanupResize = makeResizable(gui.domElement);
  
  // 自定义GUI样式
  customizeGUIStyle(gui);
  
  // 确保所有文件夹都已打开
  try {
    basicControls.open();
    objectControls.open();
    positionControls.open();
    materialControls.open();
    lightControls.open();
    pointLightControls.open();
    pointLightPositionFolder.open();
    envMapControls.open();
    advancedMaterialControls.open();
  } catch (error) { }
  
  // 确保在GUI销毁时清理事件监听器
  const originalDestroy = gui.destroy;
  gui.destroy = function() {
    cleanupDrag();
    cleanupResize();
    originalDestroy.call(this);
  };
  
  return gui;
}

// 自定义样式函数
function customizeGUIStyle(gui) {
  if (!gui) return
  
  // 移除可能存在的旧样式
  const oldStyle = document.getElementById('lil-gui-custom-style')
  if (oldStyle) {
    oldStyle.remove()
  }
  
  const style = document.createElement('style')
  style.id = 'lil-gui-custom-style'
  style.innerHTML = `
    .lil-gui {
      --width: 200px;
      --name-width: 35%;
      --font-size: 8px;
      --input-font-size: 8px;
      --widget-height: 20px;
      --spacing: 1px;
      --background-color: rgba(0, 0, 0, 0.8);
      --widget-color: #1a1a1a;
      --hover-color: #444;
      --focus-color: #2a2a2a;
      --number-color: #4CAF50;
      --title-background-color: #1a1a1a;
      border: 1px solid #444 !important;
      border-radius: 0;
      text-shadow: none;
    }
    
    /* 确保GUI展开/折叠功能正常工作 */
    .lil-gui .title {
      cursor: pointer !important;
    }
    
    /* 确保箭头正确显示 */
    .lil-gui .title > .icon {
      display: inline-block !important;
      width: 1em !important;
      height: 1em !important;
      font-size: 8px !important;
    }
    
    /* 颜色选择器样式调整 */
    .lil-gui .controller.color input {
      width: 70px;
      margin-right: 5px;
      margin-left: 5px;
    }
    
    .lil-gui .controller.color .display {
      margin-right: 0;
      height: 15px;
      border-radius: 0;
    }
    
    .lil-gui .controller.number input {
      height: 15px;
    }
    
    .lil-gui .controller.boolean {
      border-left: none;
    }
    
    .lil-gui .controller.boolean .checkbox {
      margin-right: 5px;
    }
    
    /* 多方向拉伸手柄样式 */
    .resize-handle-n, .resize-handle-s, .resize-handle-e, .resize-handle-w,
    .resize-handle-ne, .resize-handle-nw, .resize-handle-se, .resize-handle-sw {
      background-color: transparent;
      transition: background-color 0.2s;
      z-index: 2000;
    }
    
    /* 悬停效果 */
    .resize-handle-n:hover, .resize-handle-s:hover, .resize-handle-e:hover, .resize-handle-w:hover,
    .resize-handle-ne:hover, .resize-handle-nw:hover, .resize-handle-se:hover, .resize-handle-sw:hover,
    .resize-handle-n.resizing, .resize-handle-s.resizing, .resize-handle-e.resizing, .resize-handle-w.resizing,
    .resize-handle-ne.resizing, .resize-handle-nw.resizing, .resize-handle-se.resizing, .resize-handle-sw.resizing {
      background-color: rgba(100, 100, 255, 0.5);
    }
    
    /* 边缘手柄特殊样式 */
    .resize-handle-n, .resize-handle-s {
      height: 5px;
    }
    
    .resize-handle-e, .resize-handle-w {
      width: 5px;
    }
    
    /* 角落手柄特殊样式 */
    .resize-handle-ne, .resize-handle-nw, .resize-handle-se, .resize-handle-sw {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    /* 确保鼠标手势区域足够大，便于拖动 */
    .resize-handle-n { top: -4px; }
    .resize-handle-s { bottom: -4px; }
    .resize-handle-e { right: -4px; }
    .resize-handle-w { left: -4px; }
    .resize-handle-ne { top: -4px; right: -4px; }
    .resize-handle-nw { top: -4px; left: -4px; }
    .resize-handle-se { bottom: -4px; right: -4px; }
    .resize-handle-sw { bottom: -4px; left: -4px; }
    
    /* 拖动时的高亮样式 */
    .lil-gui .title.dragging {
      background-color: #444 !important;
    }
  `
  document.head.appendChild(style)
  
  // 手动确保所有文件夹都处于打开状态
  setTimeout(() => {
    const allFolders = document.querySelectorAll('.lil-gui > .children > .folder')
    console.log('找到文件夹元素:', allFolders.length)
    
    allFolders.forEach(folder => {
      // 找到文件夹的标题元素并触发点击以展开
      const title = folder.querySelector('.title')
      if (title) {
        console.log('手动展开文件夹:', title.textContent)
        if (folder.classList.contains('closed')) {
          title.click()
        }
      }
    })
  }, 100)
}

// 添加拖拽功能
function makeDraggable(element) {
  let isDragging = false;
  let initialX, initialY;
  let offsetX, offsetY;

  // 处理鼠标按下事件
  const handleMouseDown = (e) => {
    // 仅在标题栏上拖动
    if (e.target.classList.contains('title')) {
      isDragging = true;
      initialX = e.clientX;
      initialY = e.clientY;
      
      const rect = element.getBoundingClientRect();
      offsetX = initialX - rect.left;
      offsetY = initialY - rect.top;
      
      e.target.classList.add('dragging');
      
      e.preventDefault();
    }
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e) => {
    if (isDragging) {
      const newLeft = e.clientX - offsetX;
      const newTop = e.clientY - offsetY;
      
      element.style.left = `${newLeft}px`;
      element.style.top = `${newTop}px`;
    }
  };

  // 处理鼠标释放事件
  const handleMouseUp = (e) => {
    if (isDragging) {
      isDragging = false;
      
      // 移除dragging类
      const titles = element.querySelectorAll('.title');
      titles.forEach(title => title.classList.remove('dragging'));
      
      e.preventDefault();
    }
  };

  // 绑定事件
  element.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);

  // 返回清理函数
  return () => {
    element.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
}

// 添加可拉伸调整大小功能
function makeResizable(element) {
  // 创建多个拉伸手柄
  const handles = {
    n: createHandle('resize-handle-n', 'ns-resize'),
    e: createHandle('resize-handle-e', 'ew-resize'),
    s: createHandle('resize-handle-s', 'ns-resize'),
    w: createHandle('resize-handle-w', 'ew-resize'),
    ne: createHandle('resize-handle-ne', 'nesw-resize'),
    nw: createHandle('resize-handle-nw', 'nwse-resize'),
    se: createHandle('resize-handle-se', 'nwse-resize'),
    sw: createHandle('resize-handle-sw', 'nesw-resize')
  };
  
  // 添加所有手柄到面板
  Object.values(handles).forEach(handle => {
    element.appendChild(handle);
  });
  
  let isResizing = false;
  let currentHandle = null;
  let initialRect = {};
  let initialPos = {};
  
  // 创建拉伸手柄
  function createHandle(className, cursor) {
    const handle = document.createElement('div');
    handle.className = className;
    handle.style.position = 'absolute';
    handle.style.cursor = cursor;
    return handle;
  }
  
  // 定位所有手柄
  function positionHandles() {
    // 顶部手柄
    handles.n.style.top = '-3px';
    handles.n.style.left = '25%';
    handles.n.style.width = '50%';
    handles.n.style.height = '6px';
    
    // 右侧手柄
    handles.e.style.top = '25%';
    handles.e.style.right = '-3px';
    handles.e.style.width = '6px';
    handles.e.style.height = '50%';
    
    // 底部手柄
    handles.s.style.bottom = '-3px';
    handles.s.style.left = '25%';
    handles.s.style.width = '50%';
    handles.s.style.height = '6px';
    
    // 左侧手柄
    handles.w.style.top = '25%';
    handles.w.style.left = '-3px';
    handles.w.style.width = '6px';
    handles.w.style.height = '50%';
    
    // 右上角手柄
    handles.ne.style.top = '-3px';
    handles.ne.style.right = '-3px';
    handles.ne.style.width = '10px';
    handles.ne.style.height = '10px';
    
    // 左上角手柄
    handles.nw.style.top = '-3px';
    handles.nw.style.left = '-3px';
    handles.nw.style.width = '10px';
    handles.nw.style.height = '10px';
    
    // 右下角手柄
    handles.se.style.bottom = '-3px';
    handles.se.style.right = '-3px';
    handles.se.style.width = '10px';
    handles.se.style.height = '10px';
    
    // 左下角手柄
    handles.sw.style.bottom = '-3px';
    handles.sw.style.left = '-3px';
    handles.sw.style.width = '10px';
    handles.sw.style.height = '10px';
  }
  
  // 初始化手柄位置
  positionHandles();
  
  // 绑定鼠标按下事件
  Object.entries(handles).forEach(([direction, handle]) => {
    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      currentHandle = direction;
      initialRect = element.getBoundingClientRect();
      initialPos = { x: e.clientX, y: e.clientY };
      
      // 添加调整中的样式
      handle.classList.add('resizing');
      
      // 阻止冒泡和默认行为
      e.stopPropagation();
      e.preventDefault();
    });
  });
  
  // 处理鼠标移动事件
  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    e.preventDefault();
    
    // 计算鼠标移动距离
    const dx = e.clientX - initialPos.x;
    const dy = e.clientY - initialPos.y;
    
    // 根据当前拖动的手柄调整大小
    const newRect = { ...initialRect };
    
    // 水平调整
    if (currentHandle.includes('e')) {
      // 向右拖动调整宽度
      newRect.width = Math.max(200, initialRect.width + dx);
    } else if (currentHandle.includes('w')) {
      // 向左拖动调整宽度并移动左侧
      const newWidth = Math.max(200, initialRect.width - dx);
      newRect.left = initialRect.right - newWidth;
      newRect.width = newWidth;
    }
    
    // 垂直调整
    if (currentHandle.includes('s')) {
      // 向下拖动调整高度
      newRect.height = Math.max(200, initialRect.height + dy);
    } else if (currentHandle.includes('n')) {
      // 向上拖动调整高度并移动顶部
      const newHeight = Math.max(200, initialRect.height - dy);
      newRect.top = initialRect.bottom - newHeight;
      newRect.height = newHeight;
    }
    
    // 应用新尺寸
    if (currentHandle.includes('w') || currentHandle.includes('e')) {
      element.style.width = `${newRect.width}px`;
      
      // 更新所有GUI元素的宽度
      const guiElements = element.querySelectorAll('.lil-gui');
      guiElements.forEach(gui => {
        // 设置根级GUI的宽度
        gui.style.setProperty('--width', `${newRect.width - 10}px`);
      });
    }
    
    if (currentHandle.includes('n') || currentHandle.includes('s')) {
      element.style.height = `${newRect.height}px`;
      
      // 高度调整时确保所有文件夹内容可见
      const folders = element.querySelectorAll('.lil-gui .folder');
      folders.forEach(folder => {
        if (folder.classList.contains('closed')) {
          // 确保折叠的文件夹保持折叠状态
        } else {
          // 确保展开的文件夹正确显示
          const children = folder.querySelector('.children');
          if (children) {
            children.style.height = 'auto';
          }
        }
      });
    }
    
    // 处理左侧和顶部调整的位置变化
    if (currentHandle.includes('w')) {
      element.style.left = `${newRect.left}px`;
    }
    
    if (currentHandle.includes('n')) {
      element.style.top = `${newRect.top}px`;
    }
  };
  
  // 处理鼠标释放事件
  const handleMouseUp = () => {
    if (isResizing) {
      isResizing = false;
      
      // 移除调整中的样式
      if (currentHandle) {
        handles[currentHandle].classList.remove('resizing');
        currentHandle = null;
      }
      
      // 重新定位手柄
      positionHandles();
    }
  };
  
  // 全局事件绑定
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  // 返回清理函数
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // 移除所有手柄
    Object.values(handles).forEach(handle => {
      if (element.contains(handle)) {
        element.removeChild(handle);
      }
    });
  };
}

// 更新物体位置
const updateObjectPosition = (uiState) => {
  const selectedObject = uiState.selectedObject;
  let object;
  
  // 获取选中的物体
  if (selectedObject === 'cube') {
    object = window.getCube();
  } else if (selectedObject === 'sphere') {
    object = window.getSphere();
  } else if (selectedObject === 'octahedron') {
    object = window.getOctahedron();
  }
  
  // 更新物体位置
  if (object) {
    object.position.set(
      uiState.position.x,
      uiState.position.y,
      uiState.position.z
    );
  }
};

// 更新物体材质
const updateObjectMaterial = (uiState) => {
  const selectedObject = uiState.selectedObject;
  let object;
  
  // 获取选中的物体
  if (selectedObject === 'cube') {
    object = window.getCube();
  } else if (selectedObject === 'sphere') {
    object = window.getSphere();
  } else if (selectedObject === 'octahedron') {
    object = window.getOctahedron();
  }
  
  // 更新物体材质
  if (object && object.material) {
    // 更新颜色
    if (object.material.color && uiState.material.color) {
      object.material.color.set(uiState.material.color);
    }
    
    // 更新透明度属性
    object.material.transparent = uiState.material.transparent;
    object.material.opacity = uiState.material.opacity;
    
    // 更新镜面反射属性（如果材质支持）
    if (object.material.shininess !== undefined) {
      object.material.shininess = uiState.material.shininess;
    }
  }
};

// 初始化GUI
const initGUI = (ui_state, renderer, scene, camera) => {
  console.log('SceneGUI.initGUI被调用，uiState:', ui_state);
  console.log('renderer存在:', !!renderer);
  console.log('scene存在:', !!scene);
  console.log('camera存在:', !!camera);
  
  // 保存引用
  uiState = ui_state;
  renderer_ref = renderer;
  scene_ref = scene;
  camera_ref = camera;
  
  // 创建GUI实例
  const gui = new GUI({
    width: 320,
    title: '场景控制面板'
  });
  
  // 调整GUI样式
  const guiContainer = document.querySelector('.lil-gui.root');
  if (guiContainer) {
    guiContainer.style.position = 'absolute';
    guiContainer.style.top = '10px';
    guiContainer.style.right = '10px';
    guiContainer.style.zIndex = '1000';
    console.log('GUI样式已设置');
  } else {
    console.warn('未找到GUI容器元素');
  }
  
  // 创建对象选择文件夹
  const objectControls = gui.addFolder('对象选择');
  console.log('创建对象选择文件夹');
  
  // 添加物体选择下拉菜单
  objectControls.add(uiState, 'selectedObject', {
    '立方体': 'cube',
    '球体': 'sphere',
    '八面体': 'octahedron'
  }).name('选择物体').onChange((objectType) => {
    console.log('选择物体变更为:', objectType);
  });
  
  // 添加位置控制
  const positionFolder = gui.addFolder('位置');
  
  // 添加位置控制器并保存引用以便更新
  const positionXController = positionFolder.add(uiState.position, 'x', -10, 10, 0.1).name('X坐标').onChange(() => {
    updateObjectPosition(uiState);
  });
  
  const positionYController = positionFolder.add(uiState.position, 'y', -10, 10, 0.1).name('Y坐标').onChange(() => {
    updateObjectPosition(uiState);
  });
  
  const positionZController = positionFolder.add(uiState.position, 'z', -10, 10, 0.1).name('Z坐标').onChange(() => {
    updateObjectPosition(uiState);
  });
  
  // 添加重置位置按钮
  positionFolder.add({ resetPosition: function() {
    // 调用重置函数恢复物体到初始位置
    if (window.resetObjectToInitialPosition && uiState.selectedObject) {
      window.resetObjectToInitialPosition(uiState.selectedObject);
    }
  }}, 'resetPosition').name('重置位置');
  
  // 添加材质控制
  const materialFolder = gui.addFolder('材质');
  
  // 添加材质颜色控制
  materialFolder.addColor(uiState.material, 'color').name('颜色').onChange(() => {
    updateObjectMaterial(uiState);
  });
  
  // 添加透明度控制
  materialFolder.add(uiState.material, 'transparent').name('透明').onChange(() => {
    updateObjectMaterial(uiState);
  });
  
  // 添加不透明度控制
  materialFolder.add(uiState.material, 'opacity', 0, 1, 0.01).name('不透明度').onChange(() => {
    updateObjectMaterial(uiState);
  });
  
  // 添加光泽度控制
  materialFolder.add(uiState.material, 'shininess', 0, 100, 1).name('光泽度').onChange(() => {
    updateObjectMaterial(uiState);
  });
  
  // 添加动画控制
  const animationFolder = gui.addFolder('动画控制');
  
  animationFolder.add(uiState.animation, 'enabled').name('启用动画').onChange(value => {
    console.log('动画状态变更为:', value);
  });
  
  animationFolder.add(uiState.animation, 'speed', 0.1, 5).name('动画速度');
  
  // 打开所有文件夹
  objectControls.open();
  positionFolder.open();
  materialFolder.open();
  animationFolder.open();
  
  console.log('GUI面板创建完成，所有控制项已添加');
  
  // 提供更新GUI显示的全局函数
  window.updateGUIDisplay = () => {
    console.log('正在更新GUI控制器显示');
    
    // 更新所有控制器
    for (let i = 0; i < gui.controllers.length; i++) {
      gui.controllers[i].updateDisplay();
    }
    
    // 更新所有文件夹中的控制器
    for (let i = 0; i < gui.folders.length; i++) {
      const folder = gui.folders[i];
      for (let j = 0; j < folder.controllers.length; j++) {
        folder.controllers[j].updateDisplay();
      }
      
      // 递归更新子文件夹
      for (let k = 0; k < folder.folders.length; k++) {
        const subFolder = folder.folders[k];
        for (let l = 0; l < subFolder.controllers.length; l++) {
          subFolder.controllers[l].updateDisplay();
        }
      }
    }
    
    console.log('GUI控制器显示已更新');
  };
  
  return gui;
};

// 导出GUI初始化函数
export {
  initGUI
}; 