"""
Thuật toán Kruskal - Tìm cây khung nhỏ nhất (Minimum Spanning Tree)
"""

class DSU:
    def __init__(self, node_ids):
        # Khởi tạo parent là dictionary map node_id -> node_id
        self.parent = {node_id: node_id for node_id in node_ids}
    
    def find(self, i):
        # Tìm gốc (root) có sử dụng Path Compression
        if self.parent[i] != i:
            self.parent[i] = self.find(self.parent[i])
        return self.parent[i]
    
    def union(self, i, j):
        # Gộp hai tập hợp chứa i và j
        root_i = self.find(i)
        root_j = self.find(j)
        
        if root_i != root_j:
            self.parent[root_i] = root_j
            return True # Gộp thành công
        return False # Đã cùng tập hợp (tạo chu trình)

def kruskal_algorithm(graph_data, **kwargs):
    """
    Thuật toán Kruskal tìm cây khung nhỏ nhất.
    
    Args:
        graph_data: Dict chứa nodes và edges
        
    Returns:
        List các StepState dict để visualization
    """
    
    # ========== BƯỚC 1: Parse dữ liệu đầu vào ==========
    nodes = {n['id']: n for n in graph_data['nodes']}
    edges = graph_data['edges']
    
    steps = []
    
    if not nodes:
        steps.append({
            'highlightNodes': {},
            'highlightEdges': {},
            'description': 'Đồ thị rỗng.'
        })
        return steps
    
    # ========== BƯỚC 2: Khởi tạo DSU và Sắp xếp cạnh ==========
    dsu = DSU(list(nodes.keys()))
    
    # Sắp xếp các cạnh theo trọng số tăng dần
    # Lưu ý: Ép kiểu trọng số về float để so sánh chính xác
    sorted_edges = sorted(edges, key=lambda x: float(x.get('weight', 1)))
    
    mst_edges_ids = set() # Lưu ID các cạnh đã chọn vào MST
    mst_weight = 0
    
    steps.append({
        'highlightNodes': {},
        'highlightEdges': {},
        'description': 'Sắp xếp các cạnh theo trọng số tăng dần.'
    })

    # ========== BƯỚC 3: Vòng lặp chính (Duyệt cạnh) ==========
    for edge in sorted_edges:
        u = edge['source']
        v = edge['target']
        w = float(edge.get('weight', 1))
        edge_id = edge['id']
        
        # Tạo trạng thái các cạnh hiện tại: Cạnh đã chọn (Xanh lá) + Cạnh đang xét (Vàng)
        current_edges_highlight = {eid: '#10b981' for eid in mst_edges_ids}
        current_edges_highlight[edge_id] = '#f59e0b' # Vàng cam: Đang xét
        
        # Step: Đang xét cạnh này
        steps.append({
            'highlightNodes': {u: '#f59e0b', v: '#f59e0b'}, # Highlight 2 đầu mút
            'highlightEdges': current_edges_highlight,
            'description': f'Xét cạnh ({u}, {v}) với trọng số {w}'
        })
        
        # Kiểm tra chu trình bằng DSU
        if dsu.union(u, v):
            # Không tạo chu trình -> Chọn
            mst_edges_ids.add(edge_id)
            mst_weight += w
            
            steps.append({
                'highlightNodes': {u: '#10b981', v: '#10b981'},
                'highlightEdges': {eid: '#10b981' for eid in mst_edges_ids},
                'description': f'CHẤP NHẬN: Cạnh ({u}, {v}) được thêm vào cây khung.'
            })
        else:
            # Tạo chu trình -> Bỏ qua
            rejected_highlight = current_edges_highlight.copy()
            rejected_highlight[edge_id] = '#ef4444' # Đỏ: Bị từ chối
            
            steps.append({
                'highlightNodes': {u: '#ef4444', v: '#ef4444'},
                'highlightEdges': rejected_highlight,
                'description': f'BỎ QUA: Cạnh ({u}, {v}) tạo thành chu trình.'
            })
            
    # ========== BƯỚC 4: Kết thúc ==========
    steps.append({
        'highlightNodes': {n: '#10b981' for n in nodes.keys()},
        'highlightEdges': {eid: '#10b981' for eid in mst_edges_ids},
        'description': f'Hoàn thành! Tổng trọng số cây khung nhỏ nhất: {mst_weight}'
    })
    
    return steps