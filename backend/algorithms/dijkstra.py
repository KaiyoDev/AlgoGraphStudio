"""
Thuật toán Dijkstra - Tìm đường đi ngắn nhất (Shortest Path)
"""

import heapq


def dijkstra_algorithm(graph_data, **kwargs):
    """
    Thuật toán Dijkstra tìm đường đi ngắn nhất từ một đỉnh nguồn đến một đỉnh đích
    (hoặc đến tất cả các đỉnh nếu không chỉ định đích).
    
    kwargs:
        - source: id nút nguồn (bắt buộc, mặc định: nút đầu tiên)
        - target: id nút đích (tùy chọn, nếu không có thì tìm đường đến tất cả)
    """
    
    # ========== BƯỚC 1: Parse dữ liệu đầu vào ==========
    nodes = {str(n["id"]): n for n in graph_data.get("nodes", [])}
    edges = graph_data.get("edges", [])
    is_directed = bool(graph_data.get("isDirected", False))
    
    steps = []
    
    if not nodes:
        steps.append({
            "highlightNodes": {},
            "highlightEdges": {},
            "description": "Đồ thị rỗng. Vui lòng thêm ít nhất một nút.",
        })
        return steps
    
    # ========== BƯỚC 2: Lấy nút nguồn và đích ==========
    # Xử lý nút nguồn
    if "source" in kwargs and kwargs["source"] is not None:
        source = str(kwargs["source"])
    else:
        # Nếu không có source, dùng node đầu tiên
        if not nodes:
            steps.append({
                "highlightNodes": {},
                "highlightEdges": {},
                "description": "Không có nút nào trong đồ thị để làm nguồn.",
            })
            return steps
        source = str(next(iter(nodes.keys())))
    
    # Kiểm tra source có tồn tại
    if source not in nodes:
        available_nodes = ", ".join(list(nodes.keys())[:5])
        if len(nodes) > 5:
            available_nodes += "..."
        steps.append({
            "highlightNodes": {},
            "highlightEdges": {},
            "description": f"Nút nguồn '{source}' không tồn tại trong đồ thị. Các nút có sẵn: {available_nodes}",
        })
        return steps
    
    # Xử lý nút đích (tùy chọn)
    target = kwargs.get("target")
    if target is not None and target != "":
        target = str(target)
        if target not in nodes:
            available_nodes = ", ".join(list(nodes.keys())[:5])
            if len(nodes) > 5:
                available_nodes += "..."
            steps.append({
                "highlightNodes": {source: "#3b82f6"},
                "highlightEdges": {},
                "description": f"Nút đích '{target}' không tồn tại trong đồ thị. Các nút có sẵn: {available_nodes}",
            })
            return steps
    else:
        target = None
    
    # ========== BƯỚC 3: Xây dựng adjacency list ==========
    adj = {u: [] for u in nodes.keys()}
    edge_map = {}  # Map (u, v) -> edge_id để truy vết đường đi
    
    for e in edges:
        u = str(e["source"])
        v = str(e["target"])
        w = float(e.get("weight", 1))
        eid = e["id"]
        
        # Kiểm tra trọng số âm
        if w < 0:
            steps.append({
                "highlightNodes": {},
                "highlightEdges": {eid: "#ef4444"},
                "description": f"Cảnh báo: Cạnh ({u}, {v}) có trọng số âm ({w}). Dijkstra không hỗ trợ trọng số âm!",
            })
            # Vẫn thêm vào, nhưng có thể không cho kết quả chính xác
        
        adj[u].append((w, v, eid))
        edge_map[(u, v)] = eid
        
        # Nếu đồ thị vô hướng, thêm cạnh ngược lại
        if not is_directed:
            adj[v].append((w, u, eid))
            edge_map[(v, u)] = eid
    
    # ========== BƯỚC 4: Khởi tạo Dijkstra ==========
    INF = float('inf')
    distances = {node: INF for node in nodes.keys()}
    distances[source] = 0.0
    previous = {}  # Truy vết đường đi: previous[v] = u nghĩa là đường ngắn nhất đến v đi qua u
    visited = set()
    heap = [(0.0, source)]  # (distance, node)
    
    # Bước khởi tạo
    node_labels = {source: "0"}
    for node in nodes.keys():
        if node != source:
            node_labels[node] = "∞"
    
    steps.append({
        "highlightNodes": {source: "#3b82f6"},
        "highlightEdges": {},
        "nodeLabels": node_labels.copy(),
        "description": f"Khởi tạo Dijkstra từ nút nguồn {source}. Khoảng cách ban đầu: {source} = 0, các nút khác = ∞.",
    })
    
    # ========== BƯỚC 5: Vòng lặp chính Dijkstra ==========
    path_edges = set()  # Các cạnh thuộc đường đi ngắn nhất (để highlight cuối)
    
    while heap:
        dist_u, u = heapq.heappop(heap)
        
        # Bỏ qua nếu đã xử lý với khoảng cách nhỏ hơn
        if u in visited:
            continue
        
        # Đánh dấu đã thăm
        visited.add(u)
        
        # Highlight nút đang xét
        current_labels = {}
        for node in nodes.keys():
            if node == u:
                current_labels[node] = str(distances[u]) if distances[u] != INF else "∞"
            elif node in visited:
                current_labels[node] = str(distances[node]) if distances[node] != INF else "∞"
            elif distances[node] != INF:
                current_labels[node] = str(distances[node]) if distances[node] != INF else "∞"
            else:
                current_labels[node] = "∞"
        
        # Tạo highlightEdges dict
        highlight_edges = {}
        if u in previous:
            prev_edge_id = edge_map.get((previous[u], u))
            if prev_edge_id:
                highlight_edges[prev_edge_id] = "#10b981"
        
        steps.append({
            "highlightNodes": {u: "#10b981"} | {v: "#3b82f6" for v in visited if v != u},
            "highlightEdges": highlight_edges,
            "nodeLabels": current_labels,
            "description": f"Chọn nút {u} với khoảng cách ngắn nhất = {distances[u]}. Đánh dấu đã xử lý.",
        })
        
        # Nếu đã tìm thấy đích, có thể dừng sớm (tùy chọn)
        if target is not None and u == target:
            # Truy vết đường đi
            path = []
            current = target
            while current in previous:
                path.append(current)
                current = previous[current]
            path.append(source)
            path.reverse()
            
            # Lấy các cạnh của đường đi
            path_edges = set()
            for i in range(len(path) - 1):
                edge_id = edge_map.get((path[i], path[i + 1]))
                if edge_id:
                    path_edges.add(edge_id)
            
            steps.append({
                "highlightNodes": {node: "#10b981" for node in path} | {u: "#3b82f6" for u in visited if u not in path},
                "highlightEdges": {eid: "#10b981" for eid in path_edges},
                "nodeLabels": current_labels,
                "description": f"Tìm thấy đường đi ngắn nhất từ {source} đến {target}: {' -> '.join(path)}, tổng độ dài = {distances[target]}.",
            })
            return steps
        
        # Xét các nút kề
        relaxed_edges = []
        for w, v, eid in adj.get(u, []):
            if v in visited:
                continue
            
            new_dist = distances[u] + w
            if new_dist < distances[v]:
                old_dist = distances[v]
                distances[v] = new_dist
                previous[v] = u
                heapq.heappush(heap, (new_dist, v))
                relaxed_edges.append((v, w, eid, old_dist))
        
        # Hiển thị bước relaxation
        if relaxed_edges:
            relaxed_labels = current_labels.copy()
            for v, w, eid, old_dist in relaxed_edges:
                relaxed_labels[v] = str(distances[v])
            
            # Tạo highlightEdges dict
            highlight_edges = {eid: "#f59e0b" for _, _, eid, _ in relaxed_edges}
            if u in previous:
                prev_edge_id = edge_map.get((previous[u], u))
                if prev_edge_id:
                    highlight_edges[prev_edge_id] = "#10b981"
            
            steps.append({
                "highlightNodes": {u: "#10b981"} | {v: "#f59e0b" for v, _, _, _ in relaxed_edges} | {v: "#3b82f6" for v in visited if v != u},
                "highlightEdges": highlight_edges,
                "nodeLabels": relaxed_labels,
                "edgeLabels": {eid: str(w) for _, w, eid, _ in relaxed_edges},
                "description": f"Cập nhật khoảng cách các nút kề của {u}: " + 
                              ", ".join([f"{v}: {old_dist if old_dist != INF else '∞'} → {distances[v]} (qua cạnh {w})" 
                                        for v, w, eid, old_dist in relaxed_edges]),
            })
    
    # ========== BƯỚC 6: Kết quả cuối cùng ==========
    # Nếu có đích nhưng chưa tìm thấy
    if target is not None and target not in visited:
        steps.append({
            "highlightNodes": {n: "#ef4444" for n in nodes.keys() if n not in visited},
            "highlightEdges": {},
            "nodeLabels": {node: str(distances[node]) if distances[node] != INF else "∞" for node in nodes.keys()},
            "description": f"Không tìm thấy đường đi từ {source} đến {target}. Đồ thị có thể không liên thông.",
        })
        return steps
    
    # Truy vết đường đi đến target (nếu có)
    if target is not None and target in visited:
        path = []
        current = target
        while current in previous:
            path.append(current)
            current = previous[current]
        path.append(source)
        path.reverse()
        
        path_edges = set()
        for i in range(len(path) - 1):
            edge_id = edge_map.get((path[i], path[i + 1]))
            if edge_id:
                path_edges.add(edge_id)
    else:
        # Nếu không có target, highlight tất cả các nút đã thăm
        path_edges = set()
        for v, u in previous.items():
            edge_id = edge_map.get((u, v))
            if edge_id:
                path_edges.add(edge_id)
    
    final_labels = {node: str(distances[node]) if distances[node] != INF else "∞" for node in nodes.keys()}
    
    steps.append({
        "highlightNodes": {n: "#10b981" if distances[n] != INF else "#ef4444" for n in nodes.keys()},
        "highlightEdges": {eid: "#10b981" for eid in path_edges},
        "nodeLabels": final_labels,
        "description": f"Hoàn thành Dijkstra từ {source}. " + 
                      (f"Khoảng cách đến {target}: {distances[target]}." if target else 
                       "Đã tìm khoảng cách ngắn nhất đến tất cả các nút."),
    })
    
    return steps

