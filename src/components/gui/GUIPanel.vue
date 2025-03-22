<template>
  <div class="gui-container" ref="guiContainer"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { initGUI } from './SceneGUI'

export default {
  name: 'GUIPanel',
  props: {
    scene: Object,
    camera: Object,
    renderer: Object,
    ambientLight: Object,
    directionalLight: Object,
    uiState: Object,
    getSelectedObject: Function,
    clearScene: Function,
    setDefault: Function,
    startAnimation: Function,
    stopAnimation: Function,
    updateObjectProperties: Function
  },
  setup(props) {
    const guiContainer = ref(null)
    let gui = null
    
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
      // 使用nextTick确保DOM已经更新
      nextTick(() => {
        try {
          console.log("开始初始化GUI面板");
          
          // 使用initGUI替代createGUI
          gui = initGUI(
            props.uiState, 
            props.renderer, 
            props.scene, 
            props.camera
          );
          
          console.log("GUI初始化完成:", !!gui);
          
          // 不需要额外操作，initGUI会处理GUI的添加和样式设置
          
          // 触发一次渲染以确保内容可见
          if (props.renderer && props.scene && props.camera) {
            props.renderer.render(props.scene, props.camera);
          }
        } catch (error) {
          console.error('创建GUI时出错:', error);
        }
      });
    })

    onBeforeUnmount(() => {
      // 移除窗口大小变化监听
      window.removeEventListener('resize', handleWindowResize);
      
      // 清理GUI实例
      if (gui) {
        try {
          gui.destroy();
        } catch (error) {
          console.error('销毁GUI时出错:', error)
        }
      }
    })

    return {
      guiContainer
    }
  }
}
</script>

<style scoped>
.gui-container {
  position: static;
  width: 100%;
  height: 100%;
}
</style> 