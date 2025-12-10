"""
Thuật toán Prim - Tìm cây khung nhỏ nhất (Minimum Spanning Tree)
"""

import heapq


def prim_algorithm(graph_data, **kwargs):
    """
    Thuật toán Prim tạo cây khung nhỏ nhất bằng cách mở rộng dần từ một nút gốc.

    kwargs:
        - start_node: id nút bắt đầu (mặc định: nút đầu tiên trong danh sách)
    """

    # ========== BƯỚC 1: Parse dữ liệu đầu vào ==========
    nodes = {str(n["id"]): n for n in graph_data.get("nodes", [])}
    edges = graph_data.get("edges", [])
    is_directed = bool(graph_data.get("isDirected", False))

    steps = []

    if not nodes:
        steps.append(
            {
                "highlightNodes": {},
                "highlightEdges": {},
                "description": "Đồ thị rỗng. Vui lòng thêm ít nhất một nút.",
            }
        )
        return steps

    # Prim thường áp dụng cho đồ thị vô hướng; nếu có hướng, thông báo và dừng.
    if is_directed:
        steps.append(
            {
                "highlightNodes": {},
                "highlightEdges": {},
                "description": "Thuật toán Prim yêu cầu đồ thị vô hướng. Vui lòng đặt isDirected = False.",
            }
        )
        return steps

    start_node = str(kwargs.get("start_node", next(iter(nodes.keys()))))
    if start_node not in nodes:
        start_node = next(iter(nodes.keys()))

    # ========== BƯỚC 2: Xây dựng adjacency list ==========
    adj = {u: [] for u in nodes.keys()}
    for e in edges:
        u = str(e["source"])
        v = str(e["target"])
        w = float(e.get("weight", 1))
        eid = e["id"]
        adj[u].append((w, v, eid))
        adj[v].append((w, u, eid))

    # ========== BƯỚC 3: Khởi tạo ==========
    visited = set()
    mst_edges = set()
    total_weight = 0.0
    heap = []

    visited.add(start_node)
    for item in adj[start_node]:
        heapq.heappush(heap, (item[0], start_node, item[1], item[2]))  # (w, u, v, eid)

    steps.append(
        {
            "highlightNodes": {start_node: "#3b82f6"},
            "highlightEdges": {},
            "description": f"Bắt đầu Prim từ nút {start_node}. Đưa các cạnh kề vào hàng đợi ưu tiên.",
        }
    )

    # ========== BƯỚC 4: Vòng lặp chính ==========
    while heap and len(visited) < len(nodes):
        w, u, v, eid = heapq.heappop(heap)

        # Bỏ qua nếu đỉnh đã được chọn
        if v in visited:
            continue

        # Thêm vào MST
        visited.add(v)
        mst_edges.add(eid)
        total_weight += w

        steps.append(
            {
                "highlightNodes": {u: "#10b981", v: "#3b82f6"},
                "highlightEdges": {eid: "#f59e0b"} | {m: "#10b981" for m in mst_edges},
                "edgeLabels": {eid: str(w)},
                "description": f"Chọn cạnh ({u}, {v}) trọng số {w} vào MST. Tổng hiện tại: {total_weight}.",
            }
        )

        # Đẩy các cạnh mới từ v
        for w2, nxt, eid2 in adj.get(v, []):
            if nxt not in visited:
                heapq.heappush(heap, (w2, v, nxt, eid2))

    # Nếu chưa thăm hết đỉnh => đồ thị không liên thông
    if len(visited) < len(nodes):
        steps.append(
            {
                "highlightNodes": {n: "#ef4444" for n in nodes if n not in visited},
                "highlightEdges": {eid: "#10b981" for eid in mst_edges},
                "description": "Đồ thị không liên thông. Không thể tạo MST đầy đủ.",
            }
        )
        return steps

    # ========== BƯỚC 5: Kết thúc ==========
    steps.append(
        {
            "highlightNodes": {n: "#10b981" for n in nodes.keys()},
            "highlightEdges": {eid: "#10b981" for eid in mst_edges},
            "description": f"Hoàn thành Prim. Tổng trọng số cây khung nhỏ nhất: {total_weight}.",
        }
    )

    return steps


