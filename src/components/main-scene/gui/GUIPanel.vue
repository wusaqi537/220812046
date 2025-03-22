<template>
  <div 
    class="gui-container" 
    :style="{
      width: `${panelState.size.width}px`,
      height: panelState.isCollapsed ? 'auto' : `${panelState.size.height}px`,
      top: `${panelState.position.top}px`,
      left: `${panelState.position.left}px`,
      opacity: panelState.isCollapsed ? 0.8 : 1
    }"
    ref="guiRef"
  >
    <div class="panel-header" @mousedown="startDrag">
      <div class="drag-handle">
        <span class="dots">···</span>
        <span>控制面板</span>
      </div>
      <div class="header-controls">
        <button class="reset-btn" @click="resetPanelPosition" title="重置位置">
          <span>⟲</span>
        </button>
        <button class="toggle-btn" @click="togglePanel" title="展开/折叠">
          <span>{{ panelState.isCollapsed ? '▼' : '▲' }}</span>
        </button>
      </div>
    </div>
    
    <div v-show="!panelState.isCollapsed" class="panel-content">
      <div ref="guiContainer" class="gui-container-inner"></div>
    </div>
    
    <!-- 尺寸调节手柄 -->
    <div v-show="!panelState.isCollapsed" class="resize-handle" @mousedown="startResize"></div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { initSceneGUI, initGUI } from './SceneGUI'

export default {
  name: 'GUIPanel',
  setup() {
    const guiContainer = ref(null)
    const guiRef = ref(null)
    let gui = null
    
    // 控制面板位置和大小状态
    const panelState = ref({
      position: {
        top: 20, // 改为20px，无需避开导航栏
        left: window.innerWidth - 320 // 靠右显示
      },
      size: {
        width: 300,
        height: 500
      },
      isCollapsed: false,
      isDragging: false,
      isResizing: false,
      dragOffset: {
        x: 0,
        y: 0
      }
    })

    // 切换展开/折叠状态
    const togglePanel = () => {
      panelState.value.isCollapsed = !panelState.value.isCollapsed
    }

    // 开始拖动面板
    const startDrag = (e) => {
      // 只有点击标题栏才能拖动
      if (e.target.closest('.panel-header')) {
        panelState.value.isDragging = true
        panelState.value.dragOffset.x = e.clientX - panelState.value.position.left
        panelState.value.dragOffset.y = e.clientY - panelState.value.position.top
        e.preventDefault()
      }
    }

    // 拖动过程
    const onDrag = (e) => {
      if (panelState.value.isDragging) {
        panelState.value.position.left = Math.max(0, Math.min(window.innerWidth - panelState.value.size.width, e.clientX - panelState.value.dragOffset.x))
        panelState.value.position.top = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - panelState.value.dragOffset.y))
        e.preventDefault()
      }
      
      if (panelState.value.isResizing) {
        const newHeight = Math.max(200, e.clientY - panelState.value.position.top)
        panelState.value.size.height = newHeight
        e.preventDefault()
      }
    }

    // 停止拖动
    const stopDrag = () => {
      panelState.value.isDragging = false
      panelState.value.isResizing = false
    }

    // 开始调整大小
    const startResize = (e) => {
      panelState.value.isResizing = true
      e.preventDefault()
    }

    // 重置面板位置
    const resetPanelPosition = () => {
      panelState.value.position.top = 20
      panelState.value.position.left = window.innerWidth - 320
      panelState.value.size.width = 300
      panelState.value.size.height = 500
    }

    // 处理窗口大小变化
    const handleWindowResize = () => {
      if (gui && gui.domElement) {
        // 获取当前GUI位置
        const guiRect = gui.domElement.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 确保GUI不会超出视窗
        if (guiRect.right > windowWidth) {
          gui.domElement.style.left = `${Math.max(0, windowWidth - guiRect.width - 10)}px`;
        }
        
        if (guiRect.bottom > windowHeight) {
          gui.domElement.style.top = `${Math.max(0, windowHeight - guiRect.height - 10)}px`;
        }
      }
    };

    onMounted(() => {
      window.addEventListener('mousemove', onDrag)
      window.addEventListener('mouseup', stopDrag)
      
      // 监听窗口大小变化，确保面板不会超出屏幕
      window.addEventListener('resize', () => {
        if (panelState.value.position.top + panelState.value.size.height > window.innerHeight) {
          panelState.value.position.top = Math.max(0, window.innerHeight - panelState.value.size.height)
        }
        if (window.innerWidth - panelState.value.position.left < 0) {
          panelState.value.position.left = Math.max(0, window.innerWidth - panelState.value.size.width)
        }
      })
      
      nextTick(() => {
        // 等待ThreeScene组件初始化完成后再初始化GUI
        const checkThreeSceneData = () => {
          if (window.threeSceneData) {
            initializeGUIPanel();
          } else {
            console.log('等待ThreeScene数据...');
            setTimeout(checkThreeSceneData, 100);
          }
        };
        
        // 立即开始检查
        checkThreeSceneData();
      })
    })
    
    // 初始化GUI面板
    const initializeGUIPanel = () => {
      console.log('开始初始化GUI面板，ThreeScene数据:', window.threeSceneData);
      
      try {
        const sceneData = window.threeSceneData;
        
        if (!sceneData || !sceneData.uiState) {
          console.error('无法初始化GUI：未找到场景数据');
          return;
        }
        
        // 创建选项对象
        const options = {
          uiState: sceneData.uiState,
          getSelectedObject: sceneData.getSelectedObject,
          clearScene: sceneData.clearScene,
          setDefault: sceneData.setDefault,
          startAnimation: sceneData.startAnimation,
          stopAnimation: sceneData.stopAnimation,
          updateObjectProperties: sceneData.updateObjectProperties,
          ambientLight: sceneData.ambientLight?.value,
          directionalLight: sceneData.directionalLight?.value,
          scene: sceneData.scene,
          camera: sceneData.camera,
          renderer: sceneData.renderer
        };
        
        console.log('使用createGUI创建GUI:', options);
        
        // 尝试使用initGUI函数
        if (typeof initGUI === 'function') {
          gui = initGUI(sceneData.uiState);
          
          // 将GUI添加到容器
          if (gui && guiContainer.value) {
            // 清除现有内容
            while (guiContainer.value.firstChild) {
              guiContainer.value.removeChild(guiContainer.value.firstChild);
            }
            
            // 设置GUI位置为静态
            if (gui.domElement) {
              gui.domElement.style.position = 'static';
              gui.domElement.style.width = '100%';
              guiContainer.value.appendChild(gui.domElement);
            }
          }
        } else {
          console.error('未找到initGUI函数');
        }
        
        console.log('GUI初始化完成:', gui);
      } catch (e) {
        console.error('GUI初始化失败:', e);
      }
    };

    onBeforeUnmount(() => {
      // 移除窗口大小变化监听
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
      
      // 清理GUI实例
      if (gui) {
        try {
          gui.destroy();
        } catch (error) {
          console.error('销毁GUI时出错:', error);
        }
      }
    })

    return {
      guiContainer,
      guiRef,
      panelState,
      togglePanel,
      startDrag,
      onDrag,
      stopDrag,
      startResize,
      resetPanelPosition
    }
  }
}
</script>

<style scoped>
.gui-container {
  position: fixed;
  background-color: rgba(30, 30, 46, 0.8);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  color: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: opacity 0.3s;
  z-index: 1000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(50, 50, 76, 0.9);
  cursor: move;
  user-select: none;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.drag-handle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 14px;
}

.dots {
  color: #aaa;
  font-size: 16px;
  letter-spacing: -2px;
}

.header-controls {
  display: flex;
  gap: 8px;
}

.reset-btn, .toggle-btn {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;
}

.reset-btn:hover, .toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  min-height: 100px;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;
  cursor: ns-resize;
  background-color: transparent;
}

.resize-handle:hover {
  background-color: rgba(100, 100, 255, 0.2);
}

/* 添加内部容器样式 */
.gui-container-inner {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

/* 确保内部lil-gui样式正常 */
:deep(.lil-gui) {
  --width: 100%;
  background: transparent;
  border: none;
  box-shadow: none;
  margin: 0;
  padding: 0;
}

:deep(.lil-gui .controller) {
  border-left-color: rgba(100, 100, 255, 0.3);
}

:deep(.lil-gui .controller:hover) {
  background: rgba(100, 100, 255, 0.1);
}

:deep(.lil-gui .title) {
  background: rgba(50, 50, 76, 0.5);
}
</style> 