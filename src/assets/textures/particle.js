// 生成粒子贴图
// 在实际应用中，你可以直接使用图像文件，这个脚本只是用来动态生成一个简单的粒子贴图
export function generateParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  
  const context = canvas.getContext('2d');
  
  // 创建径向渐变
  const gradient = context.createRadialGradient(
    32, 32, 0,    // 内圆心坐标和半径
    32, 32, 32    // 外圆心坐标和半径
  );
  
  // 设置渐变颜色
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');  // 中心点为纯白色
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)'); // 30%处为半透明白色
  gradient.addColorStop(0.7, 'rgba(200, 200, 255, 0.3)'); // 70%处为接近透明的蓝白色
  gradient.addColorStop(1, 'rgba(100, 100, 200, 0.0)');   // 边缘完全透明
  
  // 填充渐变
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  
  // 返回生成的贴图URL
  return canvas.toDataURL('image/png');
} 