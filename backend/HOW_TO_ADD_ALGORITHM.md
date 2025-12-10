# Hướng Dẫn Thêm Thuật Toán Mới

Tài liệu này hướng dẫn bạn cách thêm một thuật toán mới vào AlgoGraphStudio.

## 📋 Các Bước

### Bước 1: Tạo File Thuật Toán

1. Sao chép file template:
   ```bash
   cp backend/algorithms/_template.py backend/algorithms/ten_thuat_toan.py
   ```

2. Đổi tên function trong file mới:
   ```python
   # Đổi từ:
   def template_algorithm(graph_data, **kwargs):
   
   # Thành:
   def ten_thuat_toan_algorithm(graph_data, **kwargs):
   ```

3. Implement logic thuật toán của bạn trong function này.

### Bước 2: Thêm Vào Module

Mở file `backend/algorithms/__init__.py` và thêm:

```python
from .ten_thuat_toan import ten_thuat_toan_algorithm

__all__ = [
    ...
    'ten_thuat_toan_algorithm'
]
```

### Bước 3: Đăng Ký Trong Flask API

Mở file `backend/app.py`:

1. **Import thuật toán:**
   ```python
   from algorithms import (
       ...
       ten_thuat_toan_algorithm
   )
   ```

2. **Thêm vào endpoint `/api/run`:**
   ```python
   elif algorithm == 'ten_thuat_toan':
       steps = ten_thuat_toan_algorithm(graph_data)
   ```

3. **Cập nhật danh sách thuật toán hỗ trợ:**
   - Trong `health_check()`: thêm `'ten_thuat_toan'` vào list
   - Trong `list_algorithms()`: thêm object mô tả thuật toán

### Bước 4: Cập Nhật Frontend (Nếu Cần)

Nếu muốn hiển thị thuật toán mới trong UI:

1. Mở `types.ts` và thêm vào enum `AlgorithmType`:
   ```typescript
   TEN_THUAT_TOAN = 'ten_thuat_toan'
   ```

2. Thuật toán sẽ tự động xuất hiện trong sidebar nếu đã được đăng ký trong backend.

## 📝 Format StepState

Mỗi step phải trả về một dict với format:

```python
{
    'highlightNodes': {node_id: color_hex},      # Bắt buộc
    'highlightEdges': {edge_id: color_hex},     # Bắt buộc
    'nodeLabels': {node_id: label},             # Tùy chọn
    'edgeLabels': {edge_id: label},             # Tùy chọn
    'description': 'Mô tả bằng tiếng Việt'     # Bắt buộc
}
```

### Màu Sắc Gợi Ý

- `#10b981` - Xanh lá: Đã xử lý/thành công
- `#3b82f6` - Xanh dương: Đang xử lý
- `#f59e0b` - Vàng cam: Đang xét
- `#ef4444` - Đỏ: Lỗi/bỏ qua

## 📊 Cấu Trúc Dữ Liệu Đầu Vào

### graph_data

```python
{
    'nodes': [
        {
            'id': '1',           # String - ID duy nhất
            'x': 100,            # Number - Tọa độ X
            'y': 100,            # Number - Tọa độ Y
            'label': '1'         # String (optional) - Nhãn hiển thị
        },
        ...
    ],
    'edges': [
        {
            'id': 'e1-2',        # String - ID duy nhất
            'source': '1',        # String - ID nút nguồn
            'target': '2',        # String - ID nút đích
            'weight': 5,         # Number - Trọng số cạnh
            'isDirected': False   # Boolean - Có hướng hay không
        },
        ...
    ],
    'isDirected': False          # Boolean - Đồ thị có hướng hay không
}
```

## 💡 Ví Dụ

Xem file `backend/algorithms/_template.py` để có ví dụ chi tiết.

Hoặc xem các thuật toán đã implement:
- `prim.py` - Thuật toán Prim (đơn giản, dễ hiểu)
- `kruskal.py` - Thuật toán Kruskal
- `ford_fulkerson.py` - Thuật toán phức tạp hơn với edge labels

## ✅ Checklist

Trước khi commit, đảm bảo:

- [ ] File thuật toán có docstring mô tả rõ ràng
- [ ] Function trả về list các StepState đúng format
- [ ] Đã thêm vào `algorithms/__init__.py`
- [ ] Đã thêm vào `app.py` với tất cả endpoints
- [ ] Đã test với đồ thị mẫu
- [ ] Mô tả các step bằng tiếng Việt rõ ràng

## 🐛 Debug

Nếu gặp lỗi:

1. **Import Error:**
   - Kiểm tra tên file và function name
   - Đảm bảo đã thêm vào `__init__.py`

2. **API không nhận diện thuật toán:**
   - Kiểm tra đã thêm vào `app.py` chưa
   - Kiểm tra tên thuật toán có khớp không (case-insensitive)

3. **Visualization không hiển thị:**
   - Kiểm tra format StepState
   - Kiểm tra node_id và edge_id có tồn tại trong graph_data không
   - Xem console log của Flask để debug

## 📚 Tài Liệu Tham Khảo

- Xem các thuật toán đã implement trong `backend/algorithms/`
- Xem template mẫu: `backend/algorithms/_template.py`
- Xem cấu trúc API: `backend/app.py`

