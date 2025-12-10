# Quick Start - Backend Mẫu

Hướng dẫn nhanh để bắt đầu với backend mẫu.

## ⚡ Khởi Động Nhanh

### 1. Cài Đặt

```bash
pip install -r requirements.txt
```

### 2. Chạy Server

```bash
python backend/app.py
```

Server sẽ chạy tại: `http://localhost:5000`

### 3. Test API

```bash
# Kiểm tra health
curl http://localhost:5000/api/health

# Xem danh sách thuật toán
curl http://localhost:5000/api/algorithms
```

## 📝 Tạo Thuật Toán Mới (3 Bước)

### Bước 1: Tạo File

```bash
cp backend/algorithms/_template.py backend/algorithms/dijkstra.py
```

### Bước 2: Code Logic

Mở `dijkstra.py` và implement:

```python
def dijkstra_algorithm(graph_data):
    nodes = {n['id']: n for n in graph_data['nodes']}
    edges = graph_data['edges']
    steps = []
    
    # Logic của bạn ở đây
    steps.append({
        'highlightNodes': {},
        'highlightEdges': {},
        'description': 'Bắt đầu thuật toán...'
    })
    
    return steps
```

### Bước 3: Đăng Ký

**Trong `algorithms/__init__.py`:**
```python
from .dijkstra import dijkstra_algorithm
```

**Trong `app.py`:**
```python
from algorithms import dijkstra_algorithm

# Trong endpoint /api/run:
elif algorithm == 'dijkstra':
    steps = dijkstra_algorithm(graph_data)
```

## 🎯 Ví Dụ Request

```bash
curl -X POST http://localhost:5000/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "algorithm": "prim",
    "graph": {
      "nodes": [
        {"id": "1", "x": 100, "y": 100},
        {"id": "2", "x": 200, "y": 100}
      ],
      "edges": [
        {"id": "e1-2", "source": "1", "target": "2", "weight": 5, "isDirected": false}
      ],
      "isDirected": false
    }
  }'
```

## 📋 Cấu Trúc File

```
backend/
├── app.py              # ← Bắt đầu từ đây
├── algorithms/
│   ├── _template.py   # ← Template mẫu
│   └── prim.py        # ← Ví dụ thuật toán
└── README.md          # ← Đọc thêm
```

## 🔗 Liên Kết

- [Cấu trúc chi tiết](BACKEND_STRUCTURE.md)
- [Hướng dẫn thêm thuật toán](HOW_TO_ADD_ALGORITHM.md)
- [README tổng quan](README.md)

