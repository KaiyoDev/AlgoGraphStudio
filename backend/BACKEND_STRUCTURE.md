# Cấu Trúc Backend Mẫu - AlgoGraphStudio

Tài liệu này mô tả cấu trúc hoàn chỉnh của backend mẫu.

## 📁 Cấu Trúc Thư Mục

```
backend/
├── __init__.py                    # Package initialization
├── app.py                         # Flask API chính - Entry point
├── README.md                      # Hướng dẫn tổng quan
├── HOW_TO_ADD_ALGORITHM.md       # Hướng dẫn thêm thuật toán mới
├── BACKEND_STRUCTURE.md          # File này - Mô tả cấu trúc
│
└── algorithms/                    # Thư mục chứa các thuật toán
    ├── __init__.py               # Export tất cả thuật toán
    ├── _template.py              # Template mẫu để tạo thuật toán mới
    ├── prim.py                   # 7.1 - Thuật toán Prim
    ├── kruskal.py                # 7.2 - Thuật toán Kruskal
    ├── ford_fulkerson.py         # 7.3 - Thuật toán Ford-Fulkerson
    ├── fleury.py                 # 7.4 - Thuật toán Fleury
    └── hierholzer.py            # 7.5 - Thuật toán Hierholzer
```

## 📄 Mô Tả Các File

### 1. `app.py` - Flask API Chính

**Chức năng:**
- Khởi tạo Flask app
- Cấu hình CORS
- Định nghĩa các API endpoints
- Xử lý request và gọi thuật toán tương ứng

**Endpoints:**
- `POST /api/run` - Chạy thuật toán
- `GET /api/health` - Kiểm tra trạng thái
- `GET /api/algorithms` - Liệt kê thuật toán

**Cách chạy:**
```bash
python backend/app.py
```

### 2. `algorithms/__init__.py` - Module Export

**Chức năng:**
- Import và export tất cả các thuật toán
- Cho phép import dễ dàng: `from algorithms import prim_algorithm`

**Cấu trúc:**
```python
from .prim import prim_algorithm
from .kruskal import kruskal_algorithm
# ... các thuật toán khác

__all__ = [
    'prim_algorithm',
    'kruskal_algorithm',
    # ...
]
```

### 3. `algorithms/_template.py` - Template Mẫu

**Chức năng:**
- Khuôn mẫu để tạo thuật toán mới
- Có ví dụ và comment hướng dẫn chi tiết
- Format chuẩn cho StepState

**Cách sử dụng:**
1. Sao chép: `cp _template.py ten_thuat_toan.py`
2. Đổi tên function
3. Implement logic
4. Đăng ký trong `__init__.py` và `app.py`

### 4. `algorithms/prim.py` - Ví Dụ Thuật Toán

**Cấu trúc chuẩn:**
```python
def prim_algorithm(graph_data):
    """
    Docstring mô tả thuật toán
    """
    # 1. Parse dữ liệu
    nodes = {n['id']: n for n in graph_data['nodes']}
    edges = graph_data['edges']
    
    # 2. Khởi tạo
    steps = []
    # ... biến khác
    
    # 3. Step khởi đầu
    steps.append({...})
    
    # 4. Vòng lặp chính
    while condition:
        steps.append({...})  # Step visualization
    
    # 5. Step kết thúc
    steps.append({...})
    
    return steps
```

## 🔄 Luồng Hoạt Động

```
Frontend Request
    ↓
POST /api/run
    ↓
app.py: run_algorithm()
    ↓
Parse algorithm name
    ↓
Gọi thuật toán tương ứng
    ↓
algorithms/ten_thuat_toan.py
    ↓
Trả về list StepState
    ↓
JSON Response
    ↓
Frontend Visualization
```

## 📊 Format Dữ Liệu

### Request (POST /api/run)

```json
{
  "algorithm": "prim",
  "graph": {
    "nodes": [
      {"id": "1", "x": 100, "y": 100, "label": "1"}
    ],
    "edges": [
      {"id": "e1-2", "source": "1", "target": "2", "weight": 5, "isDirected": false}
    ],
    "isDirected": false
  }
}
```

### Response

```json
{
  "name": "prim",
  "steps": [
    {
      "highlightNodes": {"1": "#10b981"},
      "highlightEdges": {},
      "description": "Bắt đầu thuật toán..."
    }
  ]
}
```

### StepState Format

```python
{
    'highlightNodes': {node_id: color_hex},    # Bắt buộc
    'highlightEdges': {edge_id: color_hex},    # Bắt buộc
    'nodeLabels': {node_id: label},            # Tùy chọn
    'edgeLabels': {edge_id: label},            # Tùy chọn
    'description': 'Mô tả bằng tiếng Việt'    # Bắt buộc
}
```

## 🎨 Màu Sắc Chuẩn

- `#10b981` - Xanh lá: Đã xử lý/thành công
- `#3b82f6` - Xanh dương: Đang xử lý
- `#f59e0b` - Vàng cam: Đang xét
- `#ef4444` - Đỏ: Lỗi/bỏ qua

## ✅ Checklist Tạo Thuật Toán Mới

- [ ] Tạo file mới trong `algorithms/` (dựa trên `_template.py`)
- [ ] Implement function với format đúng
- [ ] Thêm docstring mô tả rõ ràng
- [ ] Thêm vào `algorithms/__init__.py`
- [ ] Thêm vào `app.py` (import và endpoint)
- [ ] Cập nhật `list_algorithms()` endpoint
- [ ] Test với đồ thị mẫu
- [ ] Kiểm tra visualization hiển thị đúng

## 🚀 Khởi Động

```bash
# Cài đặt dependencies
pip install -r requirements.txt

# Chạy server
python backend/app.py

# Server sẽ chạy tại: http://localhost:5000
```

## 📚 Tài Liệu Tham Khảo

- [HOW_TO_ADD_ALGORITHM.md](HOW_TO_ADD_ALGORITHM.md) - Hướng dẫn chi tiết
- [README.md](README.md) - Tổng quan backend
- `algorithms/_template.py` - Template mẫu
- `algorithms/prim.py` - Ví dụ thuật toán đơn giản

## 🔍 Debug

### Kiểm tra import
```python
# Trong Python shell
import sys
sys.path.insert(0, 'backend')
from algorithms import prim_algorithm
```

### Test endpoint
```bash
curl http://localhost:5000/api/health
curl -X POST http://localhost:5000/api/run \
  -H "Content-Type: application/json" \
  -d '{"algorithm": "prim", "graph": {...}}'
```

## 📝 Ghi Chú

- Tất cả thuật toán phải trả về list StepState
- Mỗi step phải có `highlightNodes`, `highlightEdges`, và `description`
- Mô tả nên bằng tiếng Việt để dễ hiểu
- Đảm bảo node_id và edge_id tồn tại trong graph_data

