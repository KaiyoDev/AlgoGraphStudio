# Backend - AlgoGraphStudio

Thư mục chứa Flask API backend cho AlgoGraphStudio.

## 📁 Cấu Trúc

```
backend/
├── app.py                 # File chính Flask API
├── algorithms/            # Thư mục chứa các thuật toán
│   ├── __init__.py
│   ├── prim.py            # 7.1 - Thuật toán Prim
│   ├── kruskal.py         # 7.2 - Thuật toán Kruskal
│   ├── ford_fulkerson.py  # 7.3 - Thuật toán Ford-Fulkerson
│   ├── fleury.py          # 7.4 - Thuật toán Fleury
│   └── hierholzer.py      # 7.5 - Thuật toán Hierholzer
└── __init__.py
```

## 🚀 Cách Chạy

### Từ thư mục gốc:
```bash
python backend/app.py
```

### Từ thư mục backend:
```bash
cd backend
python app.py
```

## 📋 Các Thuật Toán

### 7.1 - Prim (`algorithms/prim.py`)
- Tìm cây khung nhỏ nhất (Minimum Spanning Tree)
- Đồ thị vô hướng hoặc có hướng

### 7.2 - Kruskal (`algorithms/kruskal.py`)
- Tìm cây khung nhỏ nhất (Minimum Spanning Tree)
- Đồ thị vô hướng hoặc có hướng

### 7.3 - Ford-Fulkerson (`algorithms/ford_fulkerson.py`)
- Tìm luồng cực đại trong mạng
- Yêu cầu đồ thị có hướng
- Tự động chọn nút đầu tiên làm source, nút cuối làm sink

### 7.4 - Fleury (`algorithms/fleury.py`)
- Tìm chu trình Euler
- Yêu cầu tất cả nút có bậc chẵn (đồ thị vô hướng)

### 7.5 - Hierholzer (`algorithms/hierholzer.py`)
- Tìm chu trình Euler
- Yêu cầu tất cả nút có bậc chẵn (đồ thị vô hướng)

## 🔧 Thêm Thuật Toán Mới

**Xem hướng dẫn chi tiết:** [HOW_TO_ADD_ALGORITHM.md](HOW_TO_ADD_ALGORITHM.md)

**Template mẫu:** `algorithms/_template.py`

### Các bước nhanh:

1. **Sao chép template:**
   ```bash
   cp algorithms/_template.py algorithms/ten_thuat_toan.py
   ```

2. **Implement logic trong function `ten_thuat_toan_algorithm()`**

3. **Thêm vào `algorithms/__init__.py`**

4. **Thêm vào `app.py` trong endpoint `/api/run`**

Xem chi tiết và ví dụ tại [HOW_TO_ADD_ALGORITHM.md](HOW_TO_ADD_ALGORITHM.md)

## 📡 API Endpoints

- `POST /api/run` - Chạy thuật toán
- `GET /api/health` - Kiểm tra trạng thái
- `GET /api/algorithms` - Liệt kê các thuật toán

Xem chi tiết tại [FLASK_INTEGRATION.md](../FLASK_INTEGRATION.md)

## 📚 Tài Liệu

- **[QUICK_START.md](QUICK_START.md)** - Hướng dẫn khởi động nhanh
- **[BACKEND_STRUCTURE.md](BACKEND_STRUCTURE.md)** - Cấu trúc chi tiết backend mẫu
- **[HOW_TO_ADD_ALGORITHM.md](HOW_TO_ADD_ALGORITHM.md)** - Hướng dẫn thêm thuật toán mới
- **[FLASK_INTEGRATION.md](../FLASK_INTEGRATION.md)** - Tích hợp với frontend

