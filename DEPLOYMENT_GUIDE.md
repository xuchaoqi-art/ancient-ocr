# 古籍OCR项目部署指南

## 项目概述

本项目是一个基于PaddleOCR的古籍OCR在线工具，能够将古籍竖排文字准确转换为现代横排格式。

## 项目结构

```
.
├── app.py                    # Flask主应用（完整版）
├── app_simple.py             # Flask主应用（简化测试版）
├── requirements.txt          # Python依赖
├── Dockerfile               # Docker配置
├── README.md                # 项目说明
├── render.yaml              # Render部署配置
├── interaction.md           # 交互设计文档
├── design.md               # 设计风格文档
├── outline.md              # 项目大纲
├── DEPLOYMENT_GUIDE.md     # 部署指南（本文件）
├── static/
│   ├── js/
│   │   └── main.js         # 前端JavaScript
│   └── css/                # 样式文件（预留）
└── templates/
    └── index.html          # 主页面模板
```

## 部署选项

### 方案1：Render一键部署（推荐）

#### 步骤：

1. **准备GitHub仓库**
   ```bash
   # 初始化git仓库
   git init
   git add .
   git commit -m "Initial commit"
   
   # 创建GitHub仓库并推送
   git remote add origin https://github.com/yourusername/ancient-ocr.git
   git push -u origin main
   ```

2. **点击Deploy按钮**
   - 点击README中的"Deploy to Render"按钮
   - 连接GitHub账户
   - 选择要部署的仓库

3. **配置部署**
   - 环境：Python 3.11
   - 构建命令：`pip install -r requirements.txt`
   - 启动命令：`gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 300 app:app`
   - 环境变量：PORT（平台自动注入）

4. **等待部署完成**
   - 首次部署需要5-10分钟（下载模型）
   - 后续部署2-3分钟

### 方案2：Docker部署

#### 构建镜像：

```bash
docker build -t ancient-ocr .
```

#### 运行容器：

```bash
docker run -d \
  --name ancient-ocr \
  -p 5000:5000 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/output:/app/output \
  -e PORT=5000 \
  ancient-ocr
```

### 方案3：本地部署

#### 环境准备：

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv poppler-utils

# CentOS/RHEL
sudo yum install -y python3.11 poppler-utils

# macOS
brew install python@3.11 poppler
```

#### 安装依赖：

```bash
# 创建虚拟环境
python3.11 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装Python包
pip install -r requirements.txt
```

#### 运行应用：

```bash
# 开发模式
python app.py

# 生产模式
gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 300 app:app
```

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务端口 | 5000 |
| MAX_WORKERS | gunicorn工作进程数 | 2 |
| TIMEOUT | 请求超时时间 | 300 |

### 文件大小限制

- 最大上传文件：50MB
- 推荐单次处理：20页以内

### 性能优化

1. **模型缓存**
   - PaddleOCR模型首次运行自动下载
   - 后续使用缓存，无需重复下载

2. **内存管理**
   - 使用流式处理大文件
   - 及时清理临时文件

3. **并发处理**
   - 支持2个并发任务
   - 任务队列管理

## 监控和日志

### 健康检查

- 端点：`GET /`
- 状态：200 OK

### 日志查看

```bash
# Docker
docker logs ancient-ocr

# Render
# 在Render控制台查看日志
```

## 故障排除

### 常见问题

1. **模型下载失败**
   ```bash
   # 手动下载模型
   python -c "from paddleocr import PaddleOCR; PaddleOCR(use_angle_cls=True, lang='ch')"
   ```

2. **内存不足**
   - 减少并发工作进程数
   - 增加服务器内存

3. **OCR识别慢**
   - 使用CPU优化模式
   - 降低图片分辨率（保持清晰度）

### 调试模式

```bash
# 启用调试模式
export FLASK_ENV=development
export FLASK_DEBUG=1
python app.py
```

## 备份和恢复

### 数据备份

```bash
# 备份上传文件和结果
tar -czf backup_$(date +%Y%m%d).tar.gz uploads/ output/
```

### 数据恢复

```bash
# 恢复数据
tar -xzf backup_20231201.tar.gz
```

## 安全建议

1. **访问控制**
   - 添加基本认证
   - 限制IP访问

2. **文件安全**
   - 验证文件类型
   - 限制文件大小

3. **网络安全**
   - 使用HTTPS
   - 定期更新依赖

## 扩展功能

### 计划中的功能

- [ ] 批量处理API
- [ ] 用户管理和历史记录
- [ ] 更多输出格式（EPUB、MOBI）
- [ ] 图像预处理功能
- [ ] 多语言支持

### 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。