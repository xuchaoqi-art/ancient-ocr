# 多阶段构建，优化镜像大小
FROM python:3.11-slim as builder

# 设置工作目录
WORKDIR /build

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 复制requirements并安装Python依赖
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# 下载PaddleOCR模型
RUN python -c "from paddleocr import PaddleOCR; PaddleOCR(use_angle_cls=True, lang='ch', show_log=False)"

# 最终镜像
FROM python:3.11-slim

# 安装运行时依赖
RUN apt-get update && apt-get install -y \
    # PaddleOCR依赖
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    # pdf2image依赖
    poppler-utils \
    # 其他工具
    curl \
    && rm -rf /var/lib/apt/lists/*

# 创建非root用户
RUN useradd --create-home --shell /bin/bash app

# 设置工作目录
WORKDIR /app

# 复制已安装的Python包
COPY --from=builder /root/.local /home/app/.local

# 复制应用代码
COPY --chown=app:app . /app/

# 创建必要的目录
RUN mkdir -p uploads output tmp static/css static/js templates && \
    chown -R app:app /app

# 切换到非root用户
USER app

# 设置环境变量
ENV PATH=/home/app/.local/bin:$PATH
ENV PYTHONPATH=/home/app/.local/lib/python3.11/site-packages:$PYTHONPATH
ENV PYTHONUNBUFFERED=1

# 暴露端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# 启动应用
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "300", "app:app"]