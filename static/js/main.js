// 全局变量
let currentTaskId = null;
let statusInterval = null;
let splideInstance = null;

// DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const uploadBar = document.getElementById('uploadBar');
const uploadPercent = document.getElementById('uploadPercent');

const statusSection = document.getElementById('statusSection');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');
const statusMessage = document.getElementById('statusMessage');

const previewSection = document.getElementById('previewSection');
const previewList = document.getElementById('previewList');

const resultSection = document.getElementById('resultSection');
const resultPreview = document.getElementById('resultPreview');
const downloadBtn = document.getElementById('downloadBtn');

const statsSection = document.getElementById('statsSection');
const pageCount = document.getElementById('pageCount');
const charCount = document.getElementById('charCount');

const notification = document.getElementById('notification');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    setupEventListeners();
});

// 初始化动画
function initializeAnimations() {
    // 页面加载动画
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    fadeElements.forEach(el => observer.observe(el));
    
    // 标题动画
    anime({
        targets: '.fade-in.visible',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        delay: anime.stagger(100),
        easing: 'easeOutQuart'
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 文件上传区域点击
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 文件选择
    fileInput.addEventListener('change', handleFileSelect);
    
    // 拖拽上传
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // 下载按钮
    downloadBtn.addEventListener('click', handleDownload);
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        uploadFile(file);
    }
}

// 拖拽处理
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

// 文件上传
async function uploadFile(file) {
    // 验证文件类型
    const allowedTypes = [
        'application/pdf',
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp',
        'application/zip', 'application/x-zip-compressed'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|gif|bmp|zip)$/i)) {
        showNotification('不支持的文件格式', 'error');
        return;
    }
    
    // 验证文件大小 (50MB)
    if (file.size > 50 * 1024 * 1024) {
        showNotification('文件大小不能超过50MB', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    // 显示上传进度
    uploadProgress.classList.remove('hidden');
    
    try {
        const xhr = new XMLHttpRequest();
        
        // 上传进度监听
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                uploadBar.style.width = percent + '%';
                uploadPercent.textContent = percent + '%';
            }
        });
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    currentTaskId = response.task_id;
                    
                    // 开始状态轮询
                    startStatusPolling();
                    
                    // 显示状态区域
                    statusSection.classList.remove('hidden');
                    statusSection.classList.add('visible');
                    
                    showNotification('文件上传成功，开始处理...', 'success');
                } else {
                    const response = JSON.parse(xhr.responseText);
                    showNotification(response.error || '上传失败', 'error');
                }
                
                // 隐藏上传进度
                setTimeout(() => {
                    uploadProgress.classList.add('hidden');
                    uploadBar.style.width = '0%';
                    uploadPercent.textContent = '0%';
                }, 1000);
            }
        };
        
        xhr.open('POST', '/upload');
        xhr.send(formData);
        
    } catch (error) {
        showNotification('上传失败: ' + error.message, 'error');
        uploadProgress.classList.add('hidden');
    }
}

// 开始状态轮询
function startStatusPolling() {
    if (statusInterval) {
        clearInterval(statusInterval);
    }
    
    statusInterval = setInterval(async () => {
        if (!currentTaskId) return;
        
        try {
            const response = await fetch(`/status/${currentTaskId}`);
            const data = await response.json();
            
            updateStatus(data);
            
            // 任务完成或失败时停止轮询
            if (data.status === 'completed' || data.status === 'failed') {
                clearInterval(statusInterval);
                
                if (data.status === 'completed') {
                    loadPreview();
                    loadStats();
                }
            }
        } catch (error) {
            console.error('状态查询失败:', error);
        }
    }, 1000);
}

// 更新状态显示
function updateStatus(data) {
    // 更新状态指示器
    statusIndicator.className = 'w-3 h-3 rounded-full status-indicator';
    
    switch (data.status) {
        case 'pending':
            statusIndicator.classList.add('bg-yellow-400');
            statusText.textContent = '等待处理';
            break;
        case 'processing':
            statusIndicator.classList.add('bg-blue-400');
            statusText.textContent = '处理中';
            break;
        case 'completed':
            statusIndicator.classList.remove('status-indicator');
            statusIndicator.classList.add('bg-green-400');
            statusText.textContent = '处理完成';
            break;
        case 'failed':
            statusIndicator.classList.remove('status-indicator');
            statusIndicator.classList.add('bg-red-400');
            statusText.textContent = '处理失败';
            break;
    }
    
    // 更新进度条
    progressBar.style.width = data.progress + '%';
    progressPercent.textContent = data.progress + '%';
    
    // 更新状态消息
    statusMessage.textContent = data.message || '';
    
    // 动画效果
    if (data.progress > 0) {
        anime({
            targets: progressBar,
            width: data.progress + '%',
            duration: 500,
            easing: 'easeOutQuart'
        });
    }
}

// 加载结果预览
async function loadPreview() {
    if (!currentTaskId) return;
    
    try {
        const response = await fetch(`/preview/${currentTaskId}`);
        const data = await response.json();
        
        resultPreview.textContent = data.preview;
        resultSection.classList.remove('hidden');
        resultSection.classList.add('visible');
        
        // 动画效果
        anime({
            targets: resultSection,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
            easing: 'easeOutQuart'
        });
        
    } catch (error) {
        console.error('加载预览失败:', error);
    }
}

// 加载统计信息
function loadStats() {
    if (!currentTaskId) return;
    
    // 这里可以根据实际情况计算统计信息
    // 暂时使用模拟数据
    setTimeout(() => {
        statsSection.classList.remove('hidden');
        statsSection.classList.add('visible');
        
        // 数字动画
        anime({
            targets: pageCount,
            innerHTML: [0, 12],
            duration: 1000,
            round: 1,
            easing: 'easeOutQuart'
        });
        
        anime({
            targets: charCount,
            innerHTML: [0, 2847],
            duration: 1500,
            round: 1,
            easing: 'easeOutQuart'
        });
        
    }, 500);
}

// 处理下载
function handleDownload() {
    if (!currentTaskId) return;
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = `/download/${currentTaskId}`;
    link.download = `ocr_result_${currentTaskId}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('开始下载结果文件', 'success');
}

// 显示通知
function showNotification(message, type = 'info') {
    const notificationText = document.getElementById('notificationText');
    const notificationIcon = document.getElementById('notificationIcon');
    
    notificationText.textContent = message;
    
    // 设置图标和颜色
    let iconSvg = '';
    let bgColor = '';
    
    switch (type) {
        case 'success':
            iconSvg = `
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            `;
            bgColor = 'border-green-200 bg-green-50';
            break;
        case 'error':
            iconSvg = `
                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            `;
            bgColor = 'border-red-200 bg-red-50';
            break;
        default:
            iconSvg = `
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            `;
            bgColor = 'border-blue-200 bg-blue-50';
    }
    
    notificationIcon.innerHTML = iconSvg;
    notification.querySelector('.notification').className = `notification bg-white rounded-lg shadow-lg p-4 max-w-sm ${bgColor}`;
    
    // 显示通知
    notification.classList.remove('hidden');
    
    // 自动隐藏
    setTimeout(() => {
        hideNotification();
    }, 3000);
}

// 隐藏通知
function hideNotification() {
    notification.classList.add('hidden');
}

// 清理资源
window.addEventListener('beforeunload', () => {
    if (statusInterval) {
        clearInterval(statusInterval);
    }
});

// 错误处理
window.addEventListener('error', (event) => {
    console.error('页面错误:', event.error);
});

// 网络错误处理
window.addEventListener('online', () => {
    showNotification('网络连接已恢复', 'success');
});

window.addEventListener('offline', () => {
    showNotification('网络连接已断开', 'error');
});

// 键盘快捷键
document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + U 触发上传
    if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
        event.preventDefault();
        fileInput.click();
    }
    
    // Escape 隐藏通知
    if (event.key === 'Escape') {
        hideNotification();
    }
});

// 工具函数：格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 导出函数供其他脚本使用
window.OCRApp = {
    uploadFile,
    showNotification,
    hideNotification
};