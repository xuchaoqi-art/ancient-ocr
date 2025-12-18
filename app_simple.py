# 简化版本的应用，用于测试
import os
import uuid
import json
from datetime import datetime
from flask import Flask, request, jsonify, render_template, send_file
from werkzeug.utils import secure_filename

app = Flask(__name__)

# 配置
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['OUTPUT_FOLDER'] = 'output'

# 创建目录
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

# 存储任务状态
tasks = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': '未找到文件'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '未选择文件'}), 400
    
    # 生成任务ID
    task_id = str(uuid.uuid4())
    
    # 保存文件
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{task_id}_{filename}")
    file.save(file_path)
    
    # 模拟处理
    tasks[task_id] = {
        'status': 'processing',
        'progress': 0,
        'message': '开始处理...',
        'filename': filename
    }
    
    # 异步模拟处理完成
    import threading
    def simulate_processing():
        import time
        for i in range(10):
            time.sleep(0.5)
            tasks[task_id]['progress'] = (i + 1) * 10
            tasks[task_id]['message'] = f'处理中... {tasks[task_id]["progress"]}%'
        
        # 创建模拟结果
        output_dir = os.path.join(app.config['OUTPUT_FOLDER'], task_id)
        os.makedirs(output_dir, exist_ok=True)
        
        # 创建模拟文本文件
        with open(os.path.join(output_dir, 'full_book.txt'), 'w', encoding='utf-8') as f:
            f.write('这是模拟的OCR识别结果。\n\n')
            f.write('第一页内容：\n')
            f.write('天地玄黄，宇宙洪荒。日月盈昃，辰宿列张。\n')
            f.write('寒来暑往，秋收冬藏。闰余成岁，律吕调阳。\n\n')
            f.write('第二页内容：\n')
            f.write('云腾致雨，露结为霜。金生丽水，玉出昆冈。\n')
            f.write('剑号巨阙，珠称夜光。果珍李柰，菜重芥姜。\n')
        
        # 创建zip文件
        import zipfile
        zip_path = os.path.join(app.config['OUTPUT_FOLDER'], f'{task_id}.zip')
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            zipf.write(os.path.join(output_dir, 'full_book.txt'), 'full_book.txt')
        
        tasks[task_id]['status'] = 'completed'
        tasks[task_id]['progress'] = 100
        tasks[task_id]['message'] = '处理完成'
    
    threading.Thread(target=simulate_processing).start()
    
    return jsonify({
        'task_id': task_id,
        'status_url': f'/status/{task_id}'
    })

@app.route('/status/<task_id>')
def status(task_id):
    if task_id not in tasks:
        return jsonify({'error': '任务不存在'}), 404
    
    return jsonify(tasks[task_id])

@app.route('/download/<task_id>')
def download(task_id):
    zip_path = os.path.join(app.config['OUTPUT_FOLDER'], f'{task_id}.zip')
    if not os.path.exists(zip_path):
        return jsonify({'error': '文件不存在'}), 404
    
    return send_file(zip_path, as_attachment=True, download_name='ocr_result.zip')

@app.route('/preview/<task_id>')
def preview(task_id):
    output_dir = os.path.join(app.config['OUTPUT_FOLDER'], task_id)
    txt_path = os.path.join(output_dir, 'full_book.txt')
    
    if not os.path.exists(txt_path):
        return jsonify({'error': '结果不存在'}), 404
    
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    preview_text = content[:500] + '...' if len(content) > 500 else content
    
    return jsonify({
        'preview': preview_text,
        'total_length': len(content)
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)