"""
bellman_ford.py - Thuật toán tìm đường đi ngắn nhất (Hỗ trợ trọng số âm)
"""

def bellman_ford_algorithm(graph_data, **kwargs):
    """
    Thuật toán Bellman-Ford:
    1. Hỗ trợ cạnh có trọng số ÂM.
    2. Phát hiện Chu trình Âm (Negative Cycle).
    3. Tìm đường đi ngắn nhất từ Source đến Target (hoặc tất cả các đỉnh).
    
    Args:
        graph_data: Dict chứa nodes, edges, isDirected.
        **kwargs: 
            - 'source': ID nút nguồn (Bắt buộc).
            - 'target': ID nút đích (Tùy chọn).
    """
    
    # ========== BƯỚC 1: CHUẨN HÓA DỮ LIỆU ==========
    # Ép kiểu ID về string để tránh lỗi so sánh (frontend gửi string/number lộn xộn)
    nodes = {str(n['id']): n for n in graph_data.get('nodes', [])}
    raw_edges = graph_data.get('edges', [])
    is_directed = graph_data.get('isDirected', False)
    
    steps = []
    
    if not nodes:
        return []

    # Lấy nút nguồn (source)
    source = kwargs.get('source')
    if source is None:
        source = kwargs.get('start_node') # Fallback nếu gọi nhầm tên tham số
    
    # Ép kiểu source về string
    if source is not None:
        source = str(source)

    # Nếu không có source hợp lệ hoặc source không tồn tại -> Lấy node đầu tiên
    if source not in nodes:
        source = list(nodes.keys())[0]

    # Lấy nút đích (target) - tùy chọn
    target = kwargs.get('target')
    if target:
        target = str(target)
        if target not in nodes: 
            target = None # Reset nếu target không tồn tại

    # ========== BƯỚC 2: KHỞI TẠO ==========
    # distances: Lưu khoảng cách ngắn nhất
    distances = {node_id: float('inf') for node_id in nodes}
    distances[source] = 0
    
    # predecessors: Lưu vết để khôi phục đường đi (predecessors[v] = u)
    predecessors = {node_id: None for node_id in nodes}

    # Helper: Format hiển thị nhãn (Ví dụ: "inf" -> "∞", 5.0 -> "5")
    def get_labels():
        labels = {}
        for n, d in distances.items():
            if d == float('inf'):
                labels[n] = "∞"
            else:
                # Format gọn: 5.0 -> "5", 5.5 -> "5.5"
                labels[n] = str(int(d)) if d == int(d) else str(round(d, 2))
        return labels

    # Step khởi tạo visualization
    steps.append({
        'highlightNodes': {source: '#10b981'}, # Source màu xanh lá
        'highlightEdges': {},
        'nodeLabels': get_labels(),
        'description': f'Khởi tạo: Đặt khoảng cách tại {source} = 0, các nút khác = ∞.'
    })

    # ========== BƯỚC 3: XỬ LÝ DANH SÁCH CẠNH ==========
    # Chuyển đổi cạnh vô hướng thành 2 cạnh có hướng
    edges = []
    edge_map = {} # Map (u, v) -> edge_id để highlight đường đi sau này

    for e in raw_edges:
        u = str(e['source'])
        v = str(e['target'])
        w = float(e.get('weight', 1))
        eid = e['id']
        
        if u in nodes and v in nodes:
            edges.append({'u': u, 'v': v, 'w': w, 'id': eid})
            edge_map[(u, v)] = eid
            
            if not is_directed:
                # Đồ thị vô hướng: Thêm chiều ngược lại
                edges.append({'u': v, 'v': u, 'w': w, 'id': eid})
                edge_map[(v, u)] = eid

    # ========== BƯỚC 4: VÒNG LẶP THƯ GIÃN (RELAXATION) ==========
    # Lặp |V| - 1 lần
    num_nodes = len(nodes)
    
    for i in range(num_nodes - 1):
        changed = False # Cờ tối ưu: Nếu vòng này không đổi gì thì dừng sớm
        
        # Step báo hiệu vòng lặp
        steps.append({
            'highlightNodes': {},
            'highlightEdges': {},
            'nodeLabels': get_labels(),
            'description': f'Vòng lặp thứ {i + 1} / {num_nodes - 1}'
        })
        
        for edge in edges:
            u, v, w, eid = edge['u'], edge['v'], edge['w'], edge['id']
            
            # Chỉ xét nếu u đã đến được (distance != inf)
            if distances[u] == float('inf'):
                continue
                
            # Step: Highlight cạnh đang xét (Màu vàng cam)
            # Chỉ highlight visual nếu đây là lần đầu xét hoặc có khả năng cập nhật
            # (Để giảm bớt số lượng step dư thừa, ta gộp logic hiển thị vào lúc cập nhật)
            
            # LOGIC CHÍNH: Kiểm tra đường đi qua u có ngắn hơn không?
            # Bellman-Ford xử lý tốt w < 0 ở đây
            if distances[u] + w < distances[v]:
                old_dist = distances[v]
                new_dist = distances[u] + w
                distances[v] = new_dist
                predecessors[v] = u
                changed = True
                
                # Step: Cập nhật thành công
                steps.append({
                    'highlightNodes': {u: '#3b82f6', v: '#10b981'}, # u: xanh dương (nguồn), v: xanh lá (được update)
                    'highlightEdges': {eid: '#10b981'},
                    'nodeLabels': get_labels(),
                    'description': f'Cập nhật {v}: {old_dist if old_dist != float("inf") else "∞"} → {new_dist} (qua {u}, trọng số {w})'
                })
        
        # Nếu không có gì thay đổi trong cả vòng lặp -> Dừng sớm (đã tối ưu xong)
        if not changed:
            steps.append({
                'highlightNodes': {},
                'highlightEdges': {},
                'nodeLabels': get_labels(),
                'description': 'Không có khoảng cách nào thay đổi. Thuật toán hội tụ sớm.'
            })
            break

    # ========== BƯỚC 5: KIỂM TRA CHU TRÌNH ÂM (QUAN TRỌNG) ==========
    # Chạy thêm 1 vòng nữa. Nếu vẫn còn giảm được -> Có chu trình âm.
    has_negative_cycle = False
    
    for edge in edges:
        u, v, w, eid = edge['u'], edge['v'], edge['w'], edge['id']
        
        if distances[u] != float('inf') and distances[u] + w < distances[v]:
            has_negative_cycle = True
            
            steps.append({
                'highlightNodes': {u: '#ef4444', v: '#ef4444'}, # ĐỎ RỰC báo lỗi
                'highlightEdges': {eid: '#ef4444'},
                'nodeLabels': get_labels(),
                'description': f'LỖI: Phát hiện CHU TRÌNH ÂM tại cạnh ({u} -> {v}). Không thể tìm đường đi ngắn nhất!'
            })
            break # Dừng ngay khi phát hiện

    # ========== BƯỚC 6: KẾT THÚC & KHÔI PHỤC ĐƯỜNG ĐI ==========
    if not has_negative_cycle:
        path_nodes = []
        path_edges = []
        
        # Nếu có target, truy vết đường đi từ Target về Source
        if target and distances[target] != float('inf'):
            curr = target
            while curr is not None:
                path_nodes.append(curr)
                prev = predecessors[curr]
                if prev is not None:
                    # Tìm edge nối giữa prev và curr
                    e_id = edge_map.get((prev, curr))
                    if e_id: path_edges.append(e_id)
                
                if curr == source: 
                    break
                curr = prev
            path_nodes.reverse() # Đảo ngược lại để đúng chiều Source -> Target
            
            steps.append({
                'highlightNodes': {n: '#10b981' for n in path_nodes}, # Tô xanh toàn bộ đường đi
                'highlightEdges': {e: '#10b981' for e in path_edges},
                'nodeLabels': get_labels(),
                'description': f'Hoàn thành! Đường đi ngắn nhất từ {source} đến {target} là {distances[target]}.'
            })
            
        elif target and distances[target] == float('inf'):
             steps.append({
                'highlightNodes': {source: '#10b981', target: '#ef4444'},
                'highlightEdges': {},
                'nodeLabels': get_labels(),
                'description': f'Không có đường đi từ {source} đến {target}.'
            })
            
        else:
            # Nếu không có target, highlight tất cả các nút đã đến được
            reached_nodes = {n: '#10b981' for n, d in distances.items() if d != float('inf')}
            steps.append({
                'highlightNodes': reached_nodes,
                'highlightEdges': {},
                'nodeLabels': get_labels(),
                'description': f'Hoàn thành! Đã tính toán khoảng cách ngắn nhất từ {source} đến mọi đỉnh.'
            })

    return steps