"""
dfs.py - Thuật toán Tìm kiếm theo chiều sâu (Depth-First Search)
"""

def dfs_algorithm(graph_data, **kwargs):
    """
    Thuật toán DFS duyệt đồ thị theo chiều sâu.
    Sử dụng Ngăn xếp (Stack) để khử đệ quy, giúp visualization dễ hơn.
    
    Args:
        graph_data: Dict chứa nodes, edges, isDirected
        **kwargs: Cần chứa 'start_node'.
        
    Returns:
        List các StepState dict để visualization.
    """
    
    # ========== BƯỚC 1: Parse dữ liệu ==========
    nodes = {n['id']: n for n in graph_data['nodes']}
    raw_edges = graph_data['edges']
    is_directed = graph_data.get('isDirected', False)
    
    steps = []
    
    if not nodes:
        return []

    start_node = kwargs.get('start_node')
    if start_node not in nodes:
        start_node = list(nodes.keys())[0]

    # ========== BƯỚC 2: Xây dựng Adjacency List ==========
    adj = {node_id: [] for node_id in nodes}
    for edge in raw_edges:
        src = edge['source']
        tgt = edge['target']
        edge_id = edge['id']
        adj[src].append({'neighbor': tgt, 'id': edge_id})
        if not is_directed:
            adj[tgt].append({'neighbor': src, 'id': edge_id})
    
    # Sắp xếp ngược để khi push vào Stack và pop ra sẽ theo thứ tự tăng dần (thẩm mỹ)
    for u in adj:
        adj[u].sort(key=lambda x: x['neighbor'], reverse=True)

    # ========== BƯỚC 3: Khởi tạo DFS ==========
    stack = [start_node]
    visited = set() # Set các node đã duyệt (pop ra khỏi stack)
    
    # Lưu vết đường đi để highlight (tuỳ chọn)
    path_edges = set() 

    steps.append({
        'highlightNodes': {start_node: '#f59e0b'}, # Cam: Trong stack
        'highlightEdges': {},
        'description': f'Bắt đầu DFS. Đưa nút {start_node} vào Stack.'
    })

    # ========== BƯỚC 4: Vòng lặp Stack ==========
    while stack:
        # Lấy node từ đỉnh stack nhưng CHƯA pop ngay (để highlight trước)
        u = stack.pop()
        
        if u in visited:
            continue
            
        visited.add(u)
        
        steps.append({
            'highlightNodes': {
                **{n: '#10b981' for n in visited}, # Xanh lá: Đã visit
                u: '#3b82f6'                       # Xanh dương: Đang xét
            },
            'highlightEdges': {e: '#10b981' for e in path_edges},
            'description': f'Pop nút {u} từ Stack và đánh dấu đã thăm.'
        })
        
        # Duyệt các hàng xóm
        neighbors = adj[u]
        for item in neighbors:
            v = item['neighbor']
            edge_id = item['id']
            
            # Nếu đã thăm rồi thì bỏ qua (hoặc highlight nhẹ)
            if v in visited:
                continue
                
            # Highlight cạnh đang xét
            steps.append({
                'highlightNodes': {
                    **{n: '#10b981' for n in visited},
                    u: '#3b82f6',
                    v: '#f59e0b' # Cam: Mục tiêu tiềm năng
                },
                'highlightEdges': {
                    **{e: '#10b981' for e in path_edges},
                    edge_id: '#f59e0b'
                },
                'description': f'Xét hàng xóm {v} của {u}.'
            })
            
            # Push vào stack
            stack.append(v)
            path_edges.add(edge_id) # Lưu cạnh này thuộc đường đi DFS
            
            steps.append({
                'highlightNodes': {
                    **{n: '#10b981' for n in visited},
                    u: '#3b82f6',
                    v: '#f59e0b' # Cam: Đã vào stack
                },
                'highlightEdges': {
                    **{e: '#10b981' for e in path_edges}
                },
                'description': f'Đẩy {v} vào Stack.'
            })

    # ========== BƯỚC 5: Kết thúc ==========
    steps.append({
        'highlightNodes': {n: '#10b981' for n in visited},
        'highlightEdges': {e: '#10b981' for e in path_edges},
        'description': 'Hoàn thành thuật toán DFS.'
    })
    
    return steps