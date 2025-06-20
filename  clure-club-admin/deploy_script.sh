#!/bin/bash

echo "开始部署雷霆路亚管理系统..."

# 1. 安装依赖
echo "安装依赖..."
npm install

# 2. 构建项目
echo "构建生产版本..."
npm run build

# 3. 创建部署包
echo "创建部署包..."
tar -czf lure-club-admin.tar.gz dist/

echo "部署包已创建: lure-club-admin.tar.gz"
echo "请将此文件上传到服务器并解压到网站目录"

# 可选：如果配置了服务器信息，可以自动上传
# echo "上传到服务器..."
# scp lure-club-admin.tar.gz user@your-server:/path/to/web/
# ssh user@your-server "cd /path/to/web && tar -xzf lure-club-admin.tar.gz"

echo "部署完成！"