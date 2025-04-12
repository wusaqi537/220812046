// 使用lil-gui替代dat.gui
import { GUI } from 'lil-gui'
import * as THREE from 'three'

// 全局变量，用于保存引用
let uiState = null;
let renderer_ref = null;
let scene_ref = null;
let camera_ref = null;

// 全局变量，用于保存光源引用
let ambientLight_ref = null;
let directionalLight_ref = null;

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

  // 保存光源引用到全局变量
  ambientLight_ref = ambientLight;
  directionalLight_ref = directionalLight;

  // 保存场景和渲染器引用
  scene_ref = scene;
  camera_ref = camera;
  renderer_ref = renderer;

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

  // 打开基本控制文件夹
  basicControls.open();

  // 物体选择控制
  const objectSelectionFolder = gui.addFolder('物体选择');
  objectSelectionFolder.add(uiState, 'selectedObject', {
    '立方体': 'cube',
    '球体': 'sphere',
    '八面体': 'octahedron'
  }).name('选择物体').onChange((value) => {
    console.log('选择物体变更为:', value);
    // 使用全局函数更新物体属性
    if (window.updateObjectProperties) {
      window.updateObjectProperties();
    }
  });

  // 打开物体选择文件夹
  objectSelectionFolder.open();

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

  // 添加重置位置按钮
  positionControls.add({ resetPosition: function() {
    // 调用重置函数恢复物体到初始位置
    if (window.resetObjectToInitialPosition && uiState.selectedObject) {
      window.resetObjectToInitialPosition(uiState.selectedObject);

      // 更新控制器显示
      positionXController.updateDisplay();
      positionYController.updateDisplay();
      positionZController.updateDisplay();
    }
  }}, 'resetPosition').name('重置位置');

  // 打开位置控制文件夹
  positionControls.open();

  // 材质控制
  const materialControls = objectControls.addFolder('材质');
  materialColorController = materialControls.addColor(uiState.material, 'color').name('颜色').onChange((value) => {
    // 直接更新物体材质颜色
    const selectedObj = getSelectedObject();
    if (selectedObj && selectedObj.material) {
      selectedObj.material.color.set(value);
      selectedObj.material.needsUpdate = true;
      // 渲染场景以显示变化
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
  });

  materialTransparentController = materialControls.add(uiState.material, 'transparent').name('是否透明').onChange((value) => {
    // 直接更新物体材质透明属性
    const selectedObj = getSelectedObject();
    if (selectedObj && selectedObj.material) {
      selectedObj.material.transparent = value;
      selectedObj.material.needsUpdate = true;
      // 渲染场景以显示变化
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
  });

  materialOpacityController = materialControls.add(uiState.material, 'opacity', 0, 1, 0.1).name('透明度').onChange((value) => {
    // 直接更新物体材质透明度
    const selectedObj = getSelectedObject();
    if (selectedObj && selectedObj.material) {
      selectedObj.material.opacity = value;
      selectedObj.material.needsUpdate = true;
      // 渲染场景以显示变化
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
  });

  materialShininessController = materialControls.add(uiState.material, 'shininess', 0, 200, 1).name('高光').onChange((value) => {
    // 直接更新物体材质高光属性
    const selectedObj = getSelectedObject();
    if (selectedObj && selectedObj.material && selectedObj.material.shininess !== undefined) {
      selectedObj.material.shininess = value;
      selectedObj.material.needsUpdate = true;
      // 渲染场景以显示变化
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
  });

  // 打开材质控制文件夹
  materialControls.open();

  // 光源控制
  const lightControls = gui.addFolder('光源控制');

  // 环境光控制
  const ambientLightFolder = lightControls.addFolder('环境光');
  ambientLightFolder.addColor(uiState.ambientLight, 'color').name('颜色').onChange((value) => {
    if (ambientLight_ref) {
      ambientLight_ref.color.set(value);
      console.log('更新环境光颜色为:', value);
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    } else {
      console.warn('环境光引用不存在，无法更新颜色');
    }
  });

  ambientLightFolder.add(uiState.ambientLight, 'intensity', 0, 2, 0.1).name('强度').onChange((value) => {
    if (ambientLight_ref) {
      ambientLight_ref.intensity = value;
      console.log('更新环境光强度为:', value);
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    } else {
      console.warn('环境光引用不存在，无法更新强度');
    }
  });

  // 方向光控制
  const directionalLightFolder = lightControls.addFolder('方向光');
  directionalLightFolder.addColor(uiState.pointLight, 'color').name('颜色').onChange((value) => {
    if (directionalLight_ref) {
      directionalLight_ref.color.set(value);
      console.log('更新方向光颜色为:', value);
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    } else {
      console.warn('方向光引用不存在，无法更新颜色');
    }
  });

  directionalLightFolder.add(uiState.pointLight, 'intensity', 0, 2, 0.1).name('强度').onChange((value) => {
    if (directionalLight_ref) {
      directionalLight_ref.intensity = value;
      console.log('更新方向光强度为:', value);
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    } else {
      console.warn('方向光引用不存在，无法更新强度');
    }
  });

  // 方向光位置控制
  const directionalLightPosition = directionalLightFolder.addFolder('位置');
  directionalLightPosition.add(uiState.pointLight.position, 'x', -20, 20, 1).name('X').onChange((value) => {
    if (directionalLight_ref) {
      directionalLight_ref.position.x = value;
      console.log('更新方向光X位置为:', value);
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    } else {
      console.warn('方向光引用不存在，无法更新X位置');
    }
  });

  directionalLightPosition.add(uiState.pointLight.position, 'y', -20, 20, 1).name('Y').onChange((value) => {
    if (directionalLight_ref) {
      directionalLight_ref.position.y = value;
      console.log('更新方向光Y位置为:', value);
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    } else {
      console.warn('方向光引用不存在，无法更新Y位置');
    }
  });

  directionalLightPosition.add(uiState.pointLight.position, 'z', -20, 20, 1).name('Z').onChange((value) => {
    if (directionalLight_ref) {
      directionalLight_ref.position.z = value;
      console.log('更新方向光Z位置为:', value);
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    } else {
      console.warn('方向光引用不存在，无法更新Z位置');
    }
  });

  // 动画控制
  const animationFolder = gui.addFolder('动画控制');
  animationFolder.add(uiState.animation, 'enabled').name('启用动画').onChange((value) => {
    if (value) {
      if (typeof startAnimation === 'function') {
        startAnimation();
      }
    } else {
      if (typeof stopAnimation === 'function') {
        stopAnimation();
      }
    }
  });

  animationFolder.add(uiState.animation, 'speed', 0.1, 5, 0.1).name('动画速度');

  // 打开动画控制文件夹
  animationFolder.open();

  // 提供更新GUI显示的全局函数
  window.updateGUIDisplay = () => {
    console.log('正在更新GUI控制器显示');

    updateAllControllers(gui);

    console.log('GUI控制器显示已更新');
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

// 创建一个初始化GUI的函数，供Vue组件调用
export function initGUI(uiState) {
  if (!uiState) {
    console.error('初始化GUI失败: 未提供uiState');
    return null;
  }

  // 创建选项对象
  const options = {
    uiState: uiState,
    getSelectedObject: window.getSelectedObject || (() => null),
    clearScene: window.clearScene || (() => {}),
    setDefault: window.setDefault || (() => {}),
    startAnimation: window.startAnimation || (() => {}),
    stopAnimation: window.stopAnimation || (() => {}),
    updateObjectProperties: window.updateObjectProperties || (() => {}),
    ambientLight: window.threeSceneData?.ambientLight?.value,
    directionalLight: window.threeSceneData?.directionalLight?.value,
    scene: window.threeSceneData?.scene,
    camera: window.threeSceneData?.camera,
    renderer: window.threeSceneData?.renderer
  };

  // 创建GUI实例
  try {
    console.log('调用createGUI创建界面...', options);
    const gui = createGUI(options);
    console.log('GUI创建成功');
    return gui;
  } catch (error) {
    console.error('创建GUI时出错:', error);
    return null;
  }
}

// 添加新的初始化函数，供Vue组件调用
export function initSceneGUI(container, uiState, callbacks) {
  // 检查参数
  if (!container || !uiState) {
    console.error('初始化GUI失败: 缺少必要参数');
    return null;
  }

  // 确保回调函数存在
  const {
    getSelectedObject = () => null,
    updateObjectProperties = () => {},
    clearScene = () => {},
    setDefault = () => {},
    startAnimation = () => {},
    stopAnimation = () => {}
  } = callbacks || {};

  // 将这些函数暴露到全局，以便SceneGUI能够调用
  window.getSelectedObject = getSelectedObject;
  window.updateObjectProperties = updateObjectProperties;
  window.updateGUIDisplay = () => {
    // 这个函数会在以后实现，用于手动更新GUI显示
  };

  try {
    console.log('创建GUI实例...');
    const gui = initGUI(uiState);

    // 清理容器中的旧内容
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // 修改dat.GUI的样式以匹配新的面板设计
    const datGuiElement = document.querySelector('.dg.main');
    if (datGuiElement) {
      // 移除原有样式
      datGuiElement.style.position = 'static';
      datGuiElement.style.top = 'auto';
      datGuiElement.style.right = 'auto';
      datGuiElement.style.zIndex = 'auto';

      // 设置为适应容器的样式
      datGuiElement.style.width = '100%';
      datGuiElement.style.maxWidth = 'none';
      datGuiElement.style.maxHeight = '100%';
      datGuiElement.style.background = 'transparent';

      // 将GUI添加到容器
      container.appendChild(datGuiElement);

      // 调整dat.GUI内部样式
      const closeButton = datGuiElement.querySelector('.close-button');
      if (closeButton) {
        closeButton.style.display = 'none'; // 隐藏默认的关闭按钮
      }

      const controllers = datGuiElement.querySelectorAll('.controller');
      controllers.forEach(controller => {
        controller.style.background = 'rgba(30, 30, 46, 0.4)';
        controller.style.borderRadius = '4px';
        controller.style.margin = '4px 0';
      });

      // 美化文件夹外观
      const folders = datGuiElement.querySelectorAll('.folder');
      folders.forEach(folder => {
        const title = folder.querySelector('.title');
        if (title) {
          title.style.background = 'rgba(60, 60, 90, 0.6)';
          title.style.borderRadius = '4px';
        }
      });
    }

    console.log('GUI初始化完成并添加到容器');
    return gui;
  } catch (error) {
    console.error('创建GUI时发生错误:', error);
    return null;
  }
}