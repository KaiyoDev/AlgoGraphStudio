"""
bfs.py - Thuật toán Tìm kiếm theo chiều rộng (Breadth-First Search)
"""

def bfs_algorithm(graph_data, **kwargs):
    # ========== BƯỚC 1: Parse dữ liệu ==========
    # FIX: Ép kiểu ID về string để tránh lỗi so sánh int vs string
    nodes = {str(n['id']): n for n in graph_data.get('nodes', [])}
    raw_edges = graph_data.get('edges', [])
    is_directed = graph_data.get('isDirected', False)
    
    steps = []
    
    if not nodes:
        return []

    # Xử lý start_node
    start_node = kwargs.get('start_node')
    if start_node is not None:
        start_node = str(start_node) # Ép kiểu về string
    
    if start_node not in nodes:
        start_node = list(nodes.keys())[0]

    # ========== BƯỚC 2: Xây dựng Adjacency List ==========
    adj = {node_id: [] for node_id in nodes}
    for edge in raw_edges:
        src = str(edge['source']) # FIX: Ép kiểu
        tgt = str(edge['target']) # FIX: Ép kiểu
        edge_id = edge['id']
        
        # Chỉ thêm vào nếu node tồn tại trong danh sách nodes
        if src in adj:
            adj[src].append({'neighbor': tgt, 'id': edge_id})
        
        if not is_directed:
            if tgt in adj:
                adj[tgt].append({'neighbor': src, 'id': edge_id})
    
    # Sắp xếp neighbors
    for u in adj:
        adj[u].sort(key=lambda x: x['neighbor'])

    # ========== BƯỚC 3: Khởi tạo BFS ==========
    queue = [start_node]
    visited = {start_node}
    processed = set()
    
    steps.append({
        'highlightNodes': {start_node: '#f59e0b'},
        'highlightEdges': {},
        'description': f'Bắt đầu BFS từ nút {start_node}.'
    })

    # ========== BƯỚC 4: Vòng lặp chính ==========
    while queue:
        u = queue.pop(0)
        
        steps.append({
            'highlightNodes': {
                **{n: '#10b981' for n in processed},
                **{n: '#f59e0b' for n in queue},
                u: '#3b82f6'
            },
            'highlightEdges': {},
            'description': f'Duyệt nút {u}.'
        })
        
        for item in adj[u]:
            v = item['neighbor']
            edge_id = item['id']
            
            # Chỉ xét v nếu v thực sự tồn tại trong nodes (đề phòng edge rác)
            if v not in nodes: 
                continue

            steps.append({
                'highlightNodes': {
                    **{n: '#10b981' for n in processed},
                    **{n: '#f59e0b' for n in queue},
                    u: '#3b82f6',
                    v: '#f59e0b' if v in visited else '#ef4444'
                },
                'highlightEdges': {edge_id: '#f59e0b'},
                'description': f'Kiểm tra hàng xóm {v}.'
            })
            
            if v not in visited:
                visited.add(v)
                queue.append(v)
                
                steps.append({
                    'highlightNodes': {
                        **{n: '#10b981' for n in processed},
                        **{n: '#f59e0b' for n in queue},
                        u: '#3b82f6'
                    },
                    'highlightEdges': {edge_id: '#10b981'},
                    'description': f'Thêm {v} vào hàng đợi.'
                })
        
        processed.add(u)
        steps.append({
            'highlightNodes': {
                **{n: '#10b981' for n in processed},
                **{n: '#f59e0b' for n in queue}
            },
            'highlightEdges': {},
            'description': f'Hoàn tất {u}.'
        })

    # ========== BƯỚC 5: Kết thúc ==========
    steps.append({
        'highlightNodes': {n: '#10b981' for n in processed},
        'highlightEdges': {},
        'description': 'Hoàn thành BFS.'
    })
    
    return steps