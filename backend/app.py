"""
MẪU Flask API Backend cho AlgoGraphStudio
File mẫu để khởi chạy server Flask và tích hợp các thuật toán.
"""

from flask import Flask, request, jsonify, make_response
import sys
import os

# Bổ sung đường dẫn để import các thuật toán trong thư mục backend/algorithms
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import thuật toán ở đây
from algorithms import prim_algorithm
from algorithms import kruskal_algorithm

app = Flask(__name__)


# ====== CORS đơn giản (không cần flask_cors) ======
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@app.route("/api/run", methods=["OPTIONS"])
@app.route("/api/algorithms", methods=["OPTIONS"])
@app.route("/api/health", methods=["OPTIONS"])
def cors_preflight():
    resp = make_response()
    resp.status_code = 200
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return resp

# Tập hợp thuật toán - Mapping với frontend AlgorithmType
ALGORITHM_FUNCTIONS = {
    "prim": prim_algorithm,
    "kruskal": kruskal_algorithm,
}


ALGORITHM_INFOS = [
    {
        "id": "prim",
        "name": "MST - Prim",
        "description": "Tìm cây khung nhỏ nhất bằng Prim (vô hướng).",
    },
   {
    "id": "kruskal",
    "name": "MST - Kruskal",
    "description": "Tìm cây khung nhỏ nhất bằng Kruskal (vô hướng).",
   }
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
        
        # Lấy các tham số tùy chọn (kwargs) từ request
        kwargs = {}
        if 'start_node' in data:
            kwargs['start_node'] = data['start_node']
        if 'source' in data:
            kwargs['source'] = data['source']
        if 'sink' in data:
            kwargs['sink'] = data['sink']
        if 'max_iter' in data:
            kwargs['max_iter'] = data['max_iter']

        if not graph_data:
            return jsonify({'error': 'Thiếu dữ liệu đồ thị'}), 400

        if algorithm not in ALGORITHM_FUNCTIONS:
            return jsonify({
                'error': f'Thuật toán "{algorithm}" không được hỗ trợ',
                'supported_algorithms': list(ALGORITHM_FUNCTIONS.keys())
            }), 400

        # Gọi thuật toán với graph_data và kwargs
        steps = ALGORITHM_FUNCTIONS[algorithm](graph_data, **kwargs)
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
    app.run(debug=True, port=5000, host='0.0.0.0')
