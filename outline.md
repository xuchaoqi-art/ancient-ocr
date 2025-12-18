# 古籍OCR + 竖排转横排 项目大纲

## 项目结构

```
/mnt/okcomputer/output/
├── app.py                 # Flask主应用
├── requirements.txt       # Python依赖
├── Dockerfile            # 容器配置
├── README.md             # 项目说明
├── static/               # 静态资源
│   ├── css/
│   │   └── style.css     # 样式文件
│   ├── js/
│   │   └── main.js       # 前端脚本
│   └── images/           # 图片资源
├── templates/
│   └── index.html        # 主页面
├── uploads/              # 上传文件存储
├── output/               # 处理结果存储
└── tmp/                  # 临时文件
```

## 核心功能模块

### 1. 前端界面 (templates/index.html)
- **文件上传区域**：拖拽上传支持
- **进度显示组件**：上传和OCR处理进度
- **图片预览区域**：原图和结果预览
- **结果展示区域**：识别文本显示
- **下载功能**：结果文件下载

### 2. 后端API (app.py)
- **POST /upload**：文件上传处理
- **GET /status/<task_id>**：查询处理进度
- **GET /download/<task_id>**：下载结果文件
- **WebSocket支持**：实时进度推送

### 3. OCR处理模块
- **PDF处理**：pdf2image转换
- **图片预处理**：图像增强和优化
- **PaddleOCR集成**：竖排文字识别
- **竖排转横排**：文字排序和重组算法
- **文档生成**：txt和docx格式输出

### 4. 竖排到横排转换算法
- **文字检测**：获取文字框坐标
- **方向判断**：检测文字排列方向
- **排序算法**：按"右→左，上→下"规则排序
- **段落合并**：智能合并相邻文字块
- **格式输出**：生成横排文本

## 技术栈

### 前端技术
- HTML5 + CSS3 + JavaScript
- Tailwind CSS（通过CDN）
- Anime.js（动画效果）
- ECharts.js（进度可视化）
- Splide.js（图片轮播）

### 后端技术
- Python 3.11
- Flask 2.x
- PaddleOCR（ch_pp_structure_v2模型）
- python-docx（Word文档生成）
- pdf2image（PDF转图片）
- Pillow（图像处理）

### 部署技术
- Docker容器化
- gunicorn（WSGI服务器）
- Render平台部署

## 数据处理流程

1. **文件上传**：接收PDF/图片/ZIP文件
2. **格式转换**：PDF拆分为单页图片
3. **OCR识别**：使用PaddleOCR进行竖排识别
4. **文字排序**：按古籍阅读顺序重新排序
5. **横排转换**：将竖排文字转换为横排段落
6. **文档生成**：输出txt和docx格式
7. **打包下载**：生成zip压缩包

## 性能优化

- **异步处理**：使用后台任务处理OCR
- **进度追踪**：实时更新处理状态
- **缓存机制**：避免重复处理
- **内存管理**：及时清理临时文件
- **错误处理**：完善的异常捕获机制

## 部署方案

- **容器化**：Docker多阶段构建
- **云服务**：Render平台一键部署
- **环境变量**：PORT等配置管理
- **免费配额**：适配500h/月限制