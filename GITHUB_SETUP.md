# GitHub仓库设置指南

## 快速创建GitHub仓库

### 步骤1：创建新仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - Repository name: `ancient-ocr`
   - Description: `古籍OCR + 竖排转横排在线工具`
   - Public（公开）
   - 不要勾选 "Add a README"（我们已有）
   - 不要勾选 "Add .gitignore"
   - 不要勾选 "Add a license"

### 步骤2：推送代码

```bash
# 在项目目录中
cd /path/to/your/project

# 初始化git仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: 古籍OCR + 竖排转横排在线工具"

# 添加远程仓库（替换yourusername为你的GitHub用户名）
git remote add origin https://github.com/yourusername/ancient-ocr.git

# 推送到main分支
git push -u origin main
```

### 步骤3：配置Render部署

1. 访问 https://render.com/
2. 注册/登录账户
3. 点击 "New" → "Web Service"
4. 连接GitHub账户
5. 选择 `ancient-ocr` 仓库
6. 配置部署：
   - Name: `ancient-ocr`
   - Environment: `Python`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 300 app:app`
   - Instance Type: `Free`（或Starter）
7. 点击 "Create Web Service"

### 步骤4：更新README中的部署按钮

编辑 `README.md`，替换部署按钮链接：

```markdown
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?url=https://github.com/yourusername/ancient-ocr)
```

将 `yourusername` 替换为你的GitHub用户名。

### 步骤5：首次部署

1. 推送代码到GitHub后，Render会自动开始部署
2. 首次部署需要5-10分钟（下载PaddleOCR模型）
3. 部署完成后，会获得一个 `.onrender.com` 的域名
4. 可以自定义域名（可选）

## 项目文件说明

### 必需文件
确保以下文件已添加到Git仓库：

```
ancient-ocr/
├── app.py
├── requirements.txt
├── Dockerfile
├── README.md
├── render.yaml
├── templates/
│   └── index.html
└── static/
    └── js/
        └── main.js
```

### 可选文件
以下文档文件可以帮助理解项目：

```
├── interaction.md           # 交互设计
├── design.md               # 设计风格
├── outline.md              # 项目大纲
├── DEPLOYMENT_GUIDE.md     # 部署指南
├── PROJECT_SUMMARY.md      # 项目总结
└── GITHUB_SETUP.md         # 本文件
```

## 验证部署

### 1. 访问网站

部署完成后，访问Render提供的URL，应该能看到古籍OCR的主页面。

### 2. 测试功能

上传一个测试文件（PDF或图片），验证：
- 文件上传功能
- 进度条显示
- OCR识别结果
- 下载功能

### 3. 性能测试

使用50页PDF测试，验证：
- 是否能在5分钟内完成处理
- 输出文件是否正确
- 服务器是否稳定

## 自定义配置

### 环境变量

在Render控制台可以设置以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| PORT | 服务端口 | 5000 |
| MAX_WORKERS | 工作进程数 | 2 |
| TIMEOUT | 超时时间 | 300 |

### 自定义域名

1. 在Render控制台添加自定义域名
2. 配置DNS解析
3. 等待SSL证书生成

## 维护和更新

### 更新代码

```bash
# 修改代码后
git add .
git commit -m "Update: 描述修改内容"
git push origin main
```

Render会自动检测代码变更并重新部署。

### 监控状态

- Render控制台提供日志和性能监控
- 可以设置告警通知

## 常见问题

### Q: 部署失败怎么办？
A: 查看Render部署日志，常见问题：
- 依赖安装失败：检查requirements.txt
- 模型下载超时：首次部署需要较长时间
- 内存不足：升级实例类型

### Q: 如何处理大文件？
A: 
- 免费版限制100MB内存
- 建议升级到付费实例
- 或限制上传文件大小

### Q: 如何备份数据？
A:
- 上传文件存储在临时目录
- 建议定期备份到云存储
- 或使用数据库持久化

## 社区和支持

### 添加Issue模板

创建 `.github/ISSUE_TEMPLATE/bug_report.md`：

```markdown
---
name: Bug report
about: 报告问题
title: ''
labels: bug
assignees: ''

---

**描述问题**
清晰描述遇到的问题

**复现步骤**
1. 上传文件
2. 等待处理
3. 观察结果

**期望行为**
描述期望的结果

**截图**
添加截图帮助说明

**环境信息**
- 浏览器：
- 操作系统：
- 文件类型：
```

### 添加Pull Request模板

创建 `.github/pull_request_template.md`：

```markdown
**变更说明**
描述本次变更的内容

**测试情况**
- [ ] 本地测试通过
- [ ] 代码审查完成
- [ ] 文档已更新

**相关Issue**
关联的Issue编号
```

## 推广建议

### 添加标签（Topics）

在GitHub仓库设置中添加以下标签：
- `ocr`
- `chinese`
- `ancient-books`
- `paddleocr`
- `flask`
- `document-processing`

### 添加描述

在仓库设置中添加详细描述：
```
基于PaddleOCR的古籍OCR在线工具，支持PDF、图片等多种格式，自动将竖排文字转换为现代横排格式。
```

### 添加网站URL

如果有自定义域名，添加到仓库的Website字段。

## 许可证

确保LICENSE文件已添加：

```
MIT License

Copyright (c) 2025 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 完成

完成以上步骤后，您的古籍OCR项目就可以在GitHub上公开访问，并且可以通过Render一键部署了！

访问地址：
- GitHub: https://github.com/yourusername/ancient-ocr
- Render: https://ancient-ocr.onrender.com (示例)

祝您的项目成功！🎉