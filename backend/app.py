"""
MẪU Flask API Backend cho AlgoGraphStudio
File mẫu để khởi chạy server Flask và tích hợp các thuật toán.
"""

from flask import Flask, request, jsonify, make_response
import sys
import os

# Bổ sung đường dẫn để import các thuật toán trong thư mục backend/algorithms
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import TẤT CẢ thuật toán từ __init__.py
from algorithms import (
    prim_algorithm,
    kruskal_algorithm,
    dijkstra_algorithm,
    bellman_ford_algorithm,
    bfs_algorithm,
    dfs_algorithm,
)

app = Flask(__name__)

# ====== CORS đơn giản ======
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

# 1. MAPPING: Frontend string -> Backend function
ALGORITHM_FUNCTIONS = {
    "prim": prim_algorithm,
    "kruskal": kruskal_algorithm,
    "dijkstra": dijkstra_algorithm,
    #"ford_fulkerson": ford_fulkerson_algorithm,
    #"fleury": fleury_algorithm,
    #"hierholzer": hierholzer_algorithm,
    "bellman_ford": bellman_ford_algorithm,
    "bfs": bfs_algorithm,
    "dfs": dfs_algorithm,
    #"bfs_coloring": bfs_coloring_algorithm
}

# 2. METADATA: Mô tả cho endpoint /api/algorithms
ALGORITHM_INFOS = [
    {"id": "prim", "name": "MST - Prim", "description": "Tìm cây khung nhỏ nhất (Prim)."},
    {"id": "kruskal", "name": "MST - Kruskal", "description": "Tìm cây khung nhỏ nhất (Kruskal)."},
    {"id": "dijkstra", "name": "Shortest Path - Dijkstra", "description": "Đường đi ngắn nhất (trọng số dương)."},
    {"id": "bellman_ford", "name": "Shortest Path - Bellman-Ford", "description": "Đường đi ngắn nhất (xử lý trọng số âm)."},
    #{"id": "ford_fulkerson", "name": "Max Flow - Ford-Fulkerson", "description": "Luồng cực đại trong mạng."},
    {"id": "bfs", "name": "Traversal - BFS", "description": "Duyệt đồ thị theo chiều rộng."},
    {"id": "dfs", "name": "Traversal - DFS", "description": "Duyệt đồ thị theo chiều sâu."},
    #{"id": "bfs_coloring", "name": "Graph Coloring (BFS)", "description": "Tô màu đồ thị sử dụng BFS."},
    #{"id": "fleury", "name": "Euler Path - Fleury", "description": "Tìm chu trình/đường đi Euler (Fleury)."},
    #{"id": "hierholzer", "name": "Euler Path - Hierholzer", "description": "Tìm chu trình Euler (Hierholzer - hiệu quả hơn)."},
]

@app.route('/api/run', methods=['POST'])
def run_algorithm():
    try:
        data = request.json
        algorithm = data.get('algorithm', '').lower()
        graph_data = data.get('graph', {})
        
        # Lấy các tham số tùy chọn (kwargs)
        kwargs = {}
        for key in ['start_node', 'source', 'target', 'sink', 'max_iter']:
            if key in data and data[key] is not None:
                kwargs[key] = data[key]

        if not graph_data:
            return jsonify({'error': 'Thiếu dữ liệu đồ thị'}), 400

        if algorithm not in ALGORITHM_FUNCTIONS:
            return jsonify({
                'error': f'Thuật toán "{algorithm}" không được hỗ trợ',
                'supported_algorithms': list(ALGORITHM_FUNCTIONS.keys())
            }), 400
        
        # --- VALIDATE RIÊNG CHO TỪNG THUẬT TOÁN ---
        
        # 1. Dijkstra & Bellman-Ford: Cần Source
        if algorithm in ['dijkstra', 'bellman_ford'] and 'source' not in kwargs:
             return jsonify({'error': f'{algorithm} yêu cầu "source" (nút nguồn).'}), 400

        # 2. Ford-Fulkerson: Cần Source & Sink
       # if algorithm == 'ford_fulkerson':
            #if 'source' not in kwargs or 'sink' not in kwargs:
               # return jsonify({'error': 'Ford-Fulkerson yêu cầu cả "source" và "sink".'}), 400

        # 3. BFS, DFS, Prim: Thường cần start_node (nếu không có, backend có thể tự chọn nút đầu tiên, nhưng cảnh báo nếu cần)
        # (Ở đây ta để lỏng, nếu thiếu backend tự xử lý default)
        
        # Gọi thuật toán
        func = ALGORITHM_FUNCTIONS[algorithm]
        steps = func(graph_data, **kwargs)
        
        return jsonify({'name': algorithm, 'steps': steps})

    except Exception as e:
        # Log lỗi ra console server để debug dễ hơn
        print(f"Error running {algorithm}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Flask API Ready'})

@app.route('/api/algorithms', methods=['GET'])
def list_algorithms():
    return jsonify({'algorithms': ALGORITHM_INFOS})

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')