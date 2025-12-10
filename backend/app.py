"""
MẪU Flask API Backend cho AlgoGraphStudio
File mẫu để khởi chạy server Flask và tích hợp các thuật toán.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Bổ sung đường dẫn để import các thuật toán trong thư mục backend/algorithms
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import thuật toán ở đây
# Ví dụ: from algorithms import ten_thuat_toan_algorithm
from algorithms import (
    # Thêm các thuật toán của bạn tại đây
    # Ví dụ: ten_thuat_toan_algorithm
)

app = Flask(__name__)
CORS(app)  # Cho phép kết nối từ frontend

# Tập hợp thuật toán - Thêm các thuật toán của bạn vào đây
ALGORITHM_FUNCTIONS = {
    # 'ten_thuat_toan': ten_thuat_toan_algorithm,  # Ví dụ
}

# Thông tin mô tả các thuật toán - Thêm mô tả thuật toán của bạn vào đây
ALGORITHM_INFOS = [
    # {
    #     'id': 'ten_thuat_toan',
    #     'name': 'Tên Thuật Toán',
    #     'description': 'Mô tả thuật toán'
    # },
]


@app.route('/api/run', methods=['POST'])
def run_algorithm():
    """
    Endpoint mẫu để chạy thuật toán.
    Request: { "algorithm": "<tên>", "graph": {...} }
    Response: { "name": "<tên>", "steps": [...] }
    """
    try:
        data = request.json
        algorithm = data.get('algorithm', '').lower()
        graph_data = data.get('graph', {})

        if not graph_data:
            return jsonify({'error': 'Thiếu dữ liệu đồ thị'}), 400

        if algorithm not in ALGORITHM_FUNCTIONS:
            return jsonify({
                'error': f'Thuật toán "{algorithm}" không được hỗ trợ',
                'supported_algorithms': list(ALGORITHM_FUNCTIONS.keys())
            }), 400

        steps = ALGORITHM_FUNCTIONS[algorithm](graph_data)
        return jsonify({'name': algorithm, 'steps': steps})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Kiểm tra trạng thái hoạt động của API"""
    return jsonify({
        'status': 'ok',
        'message': 'Flask API đang hoạt động',
        'supported_algorithms': list(ALGORITHM_FUNCTIONS.keys())
    })


@app.route('/api/algorithms', methods=['GET'])
def list_algorithms():
    """Liệt kê tất cả các thuật toán đang hỗ trợ"""
    return jsonify({
        'algorithms': ALGORITHM_INFOS
    })


if __name__ == '__main__':
    print("🚀 Khởi động Flask API mẫu cho AlgoGraphStudio...")
    print("📡 API mặc định: http://localhost:5000")
    print("🔗 Endpoint: /api/run, /api/algorithms, /api/health")
    print("📋 Thuật toán hỗ trợ:")
    if ALGORITHM_INFOS:
        for i, algo in enumerate(ALGORITHM_INFOS, 1):
            print(f"   {i}. {algo['name']} - {algo['description']}")
    else:
        print("   (Chưa có thuật toán nào. Hãy thêm thuật toán của bạn!)")
    app.run(debug=True, port=5000, host='0.0.0.0')
