"""
TEMPLATE - Khuôn mẫu để tạo thuật toán mới
Sao chép file này và đổi tên thành tên thuật toán của bạn (ví dụ: dijkstra.py)

Hướng dẫn:
1. Đổi tên file từ _template.py thành <ten_thuat_toan>.py
2. Đổi tên function từ template_algorithm thành <ten_thuat_toan>_algorithm
3. Implement logic thuật toán của bạn
4. Thêm vào backend/algorithms/__init__.py
5. Thêm vào backend/app.py
"""


def template_algorithm(graph_data, **kwargs):
    """
    Mô tả thuật toán của bạn
    
    Args:
        graph_data: Dict chứa:
            - nodes: List các dict với keys: id, x, y, label (optional)
            - edges: List các dict với keys: id, source, target, weight, isDirected
            - isDirected: Boolean - đồ thị có hướng hay không
        **kwargs: Các tham số tùy chọn khác (ví dụ: start_node, end_node, etc.)
        
    Returns:
        List các StepState dict để visualization. Mỗi step có format:
        {
            'highlightNodes': {node_id: color_hex},      # Ví dụ: {"1": "#10b981"}
            'highlightEdges': {edge_id: color_hex},     # Ví dụ: {"e1-2": "#f59e0b"}
            'nodeLabels': {node_id: label},             # Tùy chọn: {"1": "5"}
            'edgeLabels': {edge_id: label},             # Tùy chọn: {"e1-2": "3/5"}
            'description': 'Mô tả bước này bằng tiếng Việt'
        }
    
    Màu sắc gợi ý:
        - '#10b981' - Xanh lá (đã xử lý/thành công)
        - '#3b82f6' - Xanh dương (đang xử lý)
        - '#f59e0b' - Vàng cam (đang xét)
        - '#ef4444' - Đỏ (lỗi/bỏ qua)
    """
    
    # ========== BƯỚC 1: Parse dữ liệu đầu vào ==========
    nodes = {n['id']: n for n in graph_data['nodes']}
    edges = graph_data['edges']
    is_directed = graph_data.get('isDirected', False)
    
    # Khởi tạo list các steps để trả về
    steps = []
    
    # Kiểm tra dữ liệu hợp lệ
    if not nodes:
        steps.append({
            'highlightNodes': {},
            'highlightEdges': {},
            'description': 'Đồ thị rỗng. Vui lòng thêm ít nhất một nút.'
        })
        return steps
    
    # ========== BƯỚC 2: Khởi tạo các biến cần thiết ==========
    # Ví dụ:
    # visited = set()
    # result = []
    # queue = []
    # distances = {}
    
    # ========== BƯỚC 3: Xây dựng cấu trúc dữ liệu đồ thị (nếu cần) ==========
    # Ví dụ: Chuyển đổi edges thành adjacency list
    # graph = {}
    # for edge in edges:
    #     source = edge['source']
    #     target = edge['target']
    #     weight = edge.get('weight', 1)
    #     
    #     if source not in graph:
    #         graph[source] = []
    #     graph[source].append((target, weight))
    #     
    #     # Nếu đồ thị vô hướng, thêm cạnh ngược lại
    #     if not is_directed:
    #         if target not in graph:
    #             graph[target] = []
    #         graph[target].append((source, weight))
    
    # ========== BƯỚC 4: Step khởi đầu ==========
    start_node = list(nodes.keys())[0]  # Hoặc chọn theo logic của bạn
    
    steps.append({
        'highlightNodes': {start_node: '#10b981'},
        'highlightEdges': {},
        'description': f'Bắt đầu thuật toán. Chọn nút {start_node} làm điểm xuất phát.'
    })
    
    # ========== BƯỚC 5: Vòng lặp chính của thuật toán ==========
    # while condition:
    #     # Logic của thuật toán
    #     
    #     # Thêm step để hiển thị trạng thái hiện tại
    #     steps.append({
    #         'highlightNodes': {node_id: color for node_id in current_nodes},
    #         'highlightEdges': {edge_id: color for edge_id in current_edges},
    #         'description': 'Mô tả bước hiện tại'
    #     })
    
    # Ví dụ vòng lặp:
    # for i, edge in enumerate(edges):
    #     source = edge['source']
    #     target = edge['target']
    #     
    #     # Step: Highlight cạnh đang xét
    #     steps.append({
    #         'highlightNodes': {},
    #         'highlightEdges': {edge['id']: '#f59e0b'},
    #         'description': f'Xét cạnh ({source}, {target}) với trọng số {edge.get("weight", 1)}'
    #     })
    #     
    #     # Logic xử lý...
    #     # if condition:
    #     #     # Thêm vào kết quả
    #     #     steps.append({
    #     #         'highlightNodes': {source: '#10b981', target: '#10b981'},
    #     #         'highlightEdges': {edge['id']: '#10b981'},
    #     #         'description': f'Thêm cạnh ({source}, {target}) vào kết quả'
    #     #     })
    
    # ========== BƯỚC 6: Step kết thúc ==========
    steps.append({
        'highlightNodes': {n: '#10b981' for n in nodes.keys()},
        'highlightEdges': {},
        'description': 'Hoàn thành thuật toán!'
    })
    
    return steps


# ========== VÍ DỤ THUẬT TOÁN ĐƠN GIẢN ==========
def example_simple_algorithm(graph_data):
    """
    Ví dụ thuật toán đơn giản: Duyệt tất cả các cạnh và highlight chúng
    """
    nodes = {n['id']: n for n in graph_data['nodes']}
    edges = graph_data['edges']
    
    steps = []
    
    if not nodes:
        return steps
    
    steps.append({
        'highlightNodes': {},
        'highlightEdges': {},
        'description': 'Bắt đầu duyệt tất cả các cạnh'
    })
    
    # Duyệt từng cạnh
    for i, edge in enumerate(edges):
        source = edge['source']
        target = edge['target']
        weight = edge.get('weight', 1)
        
        steps.append({
            'highlightNodes': {source: '#3b82f6', target: '#3b82f6'},
            'highlightEdges': {edge['id']: '#f59e0b'},
            'description': f'Cạnh {i+1}/{len(edges)}: ({source}, {target}) với trọng số {weight}'
        })
    
    # Highlight tất cả
    steps.append({
        'highlightNodes': {n: '#10b981' for n in nodes.keys()},
        'highlightEdges': {e['id']: '#10b981' for e in edges},
        'description': f'Đã duyệt xong {len(edges)} cạnh'
    })
    
    return steps

