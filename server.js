const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // 忽略浏览器开发者工具的请求
    if (req.url.includes('/.well-known/') || req.url.includes('/favicon.ico')) {
        res.writeHead(404);
        res.end();
        return;
    }

    // 解码 URL，支持中文文件名
    let filePath = '.' + decodeURIComponent(req.url);
    
    if (filePath === './') {
        filePath = './地球仪.html';  // 设置默认页面为地球仪
    }

    // 获取文件扩展名
    const extname = path.extname(filePath);

    // 设置内容类型
    const contentType = {
        '.html': 'text/html; charset=utf-8',  // 添加 UTF-8 编码
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.glb': 'model/gltf-binary',
        '.gltf': 'model/gltf+json'
    }[extname] || 'application/octet-stream';

    // 读取文件
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // 只记录非系统文件的404错误
                if (!filePath.includes('/.well-known/') && !filePath.includes('/favicon.ico')) {
                    console.log('找不到文件:', filePath);
                }
                res.writeHead(404);
                res.end('找不到文件: ' + filePath);
            } else {
                console.log('服务器错误:', error.code);  // 添加调试信息
                res.writeHead(500);
                res.end('服务器错误: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const port = 3000;
server.listen(port, () => {
    console.log('\x1b[32m%s\x1b[0m', `服务器已启动，运行在 http://localhost:${port}`);
    console.log('\x1b[36m%s\x1b[0m', '可访问的页面：');
    console.log('- 地球仪：\x1b[34mhttp://localhost:' + port + '/地球仪.html\x1b[0m');
    console.log('- 房屋场景：\x1b[34mhttp://localhost:' + port + '/盖房子.html\x1b[0m');
    console.log('- 地形场景：\x1b[34mhttp://localhost:' + port + '/随机地形山脉.html\x1b[0m');
    console.log('- 隧道场景：\x1b[34mhttp://localhost:' + port + '/无限隧道.html\x1b[0m');
    console.log('- 粒子效果：\x1b[34mhttp://localhost:' + port + '/粒子效果.html\x1b[0m');
    console.log('- 柱状图：\x1b[34mhttp://localhost:' + port + '/柱状图.html\x1b[0m');
    console.log('\x1b[33m%s\x1b[0m', '提示：请确保所有 HTML 文件都在当前目录下');
}); 