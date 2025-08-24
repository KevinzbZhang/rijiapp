#!/bin/bash

# 日迹日记APP部署脚本
set -e

echo "🚀 开始部署日迹日记APP..."

# 检查Node.js版本
NODE_VERSION=$(node -v)
echo "📦 Node.js版本: $NODE_VERSION"

# 安装依赖
echo "📦 安装依赖..."
npm ci --silent

# 运行测试
echo "🧪 运行测试..."
npm run test --if-present

# 构建生产版本
echo "🔨 构建生产版本..."
npm run build

# 检查构建结果
if [ ! -d "dist" ]; then
    echo "❌ 构建失败: dist目录不存在"
    exit 1
fi

echo "✅ 构建成功!"

# 复制环境文件
if [ -f ".env.production" ]; then
    cp .env.production dist/
fi

# 创建部署包
DEPLOY_DIR="deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEPLOY_DIR
cp -r dist/* $DEPLOY_DIR/
cp Dockerfile $DEPLOY_DIR/
cp nginx.conf $DEPLOY_DIR/
cp package*.json $DEPLOY_DIR/

# 压缩部署包
tar -czf $DEPLOY_DIR.tar.gz $DEPLOY_DIR

echo "📦 部署包创建完成: $DEPLOY_DIR.tar.gz"
echo "📊 部署包大小: $(du -h $DEPLOY_DIR.tar.gz | cut -f1)"

# 清理临时文件
rm -rf $DEPLOY_DIR

echo "🎉 部署准备完成!"
echo "📋 下一步操作:"
echo "   1. 上传 $DEPLOY_DIR.tar.gz 到服务器"
echo "   2. 解压: tar -xzf $DEPLOY_DIR.tar.gz"
echo "   3. 进入目录: cd $DEPLOY_DIR"
echo "   4. 构建Docker: docker build -t rijiapp ."
echo "   5. 运行容器: docker run -d -p 3000:80 --name rijiapp-container rijiapp"

# 显示部署信息
echo ""
echo "🔗 访问地址: http://localhost:3000"
echo "📊 健康检查: http://localhost:3000/health"