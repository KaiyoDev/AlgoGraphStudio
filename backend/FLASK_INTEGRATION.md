# Hướng Dẫn Tích Hợp Flask API với AlgoGraphStudio

## 📋 Tổng Quan

AlgoGraphStudio đã được cấu hình sẵn để kết nối với Flask API backend. Tài liệu này hướng dẫn bạn cách thiết lập và chạy Flask API để ứng dụng hoạt động đầy đủ.

## 🚀 Bước 1: Cài Đặt Flask API

### Yêu Cầu
- Python 3.7+
- pip (Python package manager)

### Cài Đặt Dependencies

```bash
# Tạo virtual environment (khuyến nghị)
python -m venv venv

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Cài đặt Flask và Flask-CORS
pip install flask flask-cors
```

## 🔧 Bước 2: Chạy Flask API

1. **Cấu trúc Backend:**
   ```
   backend/
   ├── app.py                 # File chính Flask API
   ├── algorithms/
   │   ├── __init__.py
   │   ├── prim.py            # 7.1 - Thuật toán Prim
   │   ├── kruskal.py         # 7.2 - Thuật toán Kruskal
   │   ├── ford_fulkerson.py  # 7.3 - Thuật toán Ford-Fulkerson
   │   ├── fleury.py          # 7.4 - Thuật toán Fleury
   │   └── hierholzer.py      # 7.5 - Thuật toán Hierholzer
   └── __init__.py
   ```

2. **Chạy server:**
```bash
cd backend
python app.py
```

Hoặc từ thư mục gốc:
```bash
python backend/app.py
```

Server sẽ chạy tại: `http://localhost:5000`

## ⚙️ Bước 3: Cấu Hình Frontend

### Tạo file `.env`

Tạo file `.env` trong thư mục gốc của project (dựa trên `.env.example`):

```env
# Flask API URL
VITE_FLASK_API_URL=http://localhost:5000/api

# Gemini API Key (tùy chọn, cho tính năng AI)
GEMINI_API_KEY=your_key_here
```

### Khởi động lại dev server

Sau khi tạo/ cập nhật file `.env`, khởi động lại Vite dev server:

```bash
npm run dev
```

## 📡 API Endpoints

### POST `/api/run`

Chạy một thuật toán trên đồ thị.

**Request Body:**
```json
{
  "algorithm": "prim",
  "graph": {
    "nodes": [
      {"id": "1", "x": 100, "y": 100, "label": "1"},
      {"id": "2", "x": 200, "y": 100, "label": "2"}
    ],
    "edges": [
      {"id": "e1-2", "source": "1", "target": "2", "weight": 5, "isDirected": false}
    ],
    "isDirected": false
  }
}
```

**Response:**
```json
{
  "name": "prim",
  "steps": [
    {
      "highlightNodes": {"1": "#10b981"},
      "highlightEdges": {},
      "description": "Bắt đầu thuật toán Prim..."
    }
  ]
}
```

### GET `/api/health`

Kiểm tra trạng thái API.

**Response:**
```json
{
  "status": "ok",
  "message": "Flask API đang hoạt động",
  "supported_algorithms": ["prim", "kruskal", "ford_fulkerson", "fleury", "hierholzer"]
}
```

### GET `/api/algorithms`

Liệt kê các thuật toán được hỗ trợ.

**Response:**
```json
{
  "algorithms": [
    {
      "id": "prim",
      "name": "Prim",
      "description": "Tìm cây khung nhỏ nhất (MST)"
    },
    ...
  ]
}
```

## 🎯 Các Thuật Toán Được Hỗ Trợ

- ✅ **7.1 - prim** - Thuật toán Prim (MST) - `backend/algorithms/prim.py`
- ✅ **7.2 - kruskal** - Thuật toán Kruskal (MST) - `backend/algorithms/kruskal.py`
- ✅ **7.3 - ford_fulkerson** - Thuật toán Ford-Fulkerson (Max Flow) - `backend/algorithms/ford_fulkerson.py`
- ✅ **7.4 - fleury** - Thuật toán Fleury (Eulerian Circuit) - `backend/algorithms/fleury.py`
- ✅ **7.5 - hierholzer** - Thuật toán Hierholzer (Eulerian Circuit) - `backend/algorithms/hierholzer.py`

## 🔨 Tùy Chỉnh Flask API

### Thêm Thuật Toán Mới

1. Tạo file mới trong `backend/algorithms/`:
```python
# backend/algorithms/your_algorithm.py
def your_algorithm(graph_data):
    """
    Mô tả thuật toán của bạn
    
    Args:
        graph_data: Dict chứa nodes, edges, isDirected
        
    Returns:
        List các StepState để visualization
    """
    steps = []
    # Logic của bạn ở đây
    return steps
```

2. Thêm vào `backend/algorithms/__init__.py`:
```python
from .your_algorithm import your_algorithm

__all__ = [
    ...
    'your_algorithm'
]
```

3. Import và thêm vào `backend/app.py`:
```python
from algorithms import your_algorithm

# Trong endpoint /api/run:
elif algorithm == 'your_algorithm':
    steps = your_algorithm(graph_data)
```

### Format của StepState

Mỗi step phải có format:
```python
{
    'highlightNodes': {node_id: color_hex},  # Ví dụ: {"1": "#10b981"}
    'highlightEdges': {edge_id: color_hex},  # Ví dụ: {"e1-2": "#f59e0b"}
    'nodeLabels': {node_id: label},          # Tùy chọn: {"1": "5"}
    'edgeLabels': {edge_id: label},          # Tùy chọn: {"e1-2": "3/5"}
    'description': 'Mô tả bước này'
}
```

**Màu sắc gợi ý:**
- `#10b981` - Xanh lá (đã xử lý/thành công)
- `#3b82f6` - Xanh dương (đang xử lý)
- `#f59e0b` - Vàng cam (đang xét)
- `#ef4444` - Đỏ (lỗi/bỏ qua)

## 🐛 Xử Lý Lỗi

### Frontend không kết nối được API

1. **Kiểm tra Flask API đang chạy:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Kiểm tra CORS:**
   - Đảm bảo `flask-cors` đã được cài đặt
   - Đảm bảo `CORS(app)` được gọi trong Flask app

3. **Kiểm tra URL trong `.env`:**
   - URL phải bắt đầu với `VITE_` để Vite expose ra frontend
   - Không có dấu `/` ở cuối URL

4. **Kiểm tra Console:**
   - Mở Developer Tools (F12)
   - Xem tab Console và Network để debug

### API trả về lỗi

- Kiểm tra format của request body
- Kiểm tra logs của Flask server
- Đảm bảo thuật toán được implement đúng

## 📝 Ghi Chú

- Frontend có cơ chế **fallback** tự động: nếu không kết nối được Flask API, sẽ sử dụng mock data
- Timeout mặc định: 5 giây
- Flask API chạy ở chế độ `debug=True` để dễ development

## 🔗 Tài Liệu Tham Khảo

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Flask-CORS Documentation](https://flask-cors.readthedocs.io/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

