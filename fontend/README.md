<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1AnqOp5fQV-A_advur9XJk0TXXA26VYd9

## Run Locally

**Prerequisites:**  
- Node.js
- Python 3.7+ (cho Flask API backend)

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Tạo file `.env` trong thư mục gốc:
   ```env
   VITE_FLASK_API_URL=http://localhost:5000/api
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

### Flask API Setup (Tùy chọn nhưng khuyến nghị)

Để chạy các thuật toán đồ thị, bạn cần Flask API backend:

1. Cài đặt Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Chạy Flask API:
   ```bash
   python backend/app.py
   ```

3. API sẽ chạy tại: `http://localhost:5000`

**Cấu trúc Backend:**
- `backend/app.py` - File chính Flask API
- `backend/algorithms/` - Thư mục chứa các thuật toán:
  - `prim.py` (7.1)
  - `kruskal.py` (7.2)
  - `ford_fulkerson.py` (7.3)
  - `fleury.py` (7.4)
  - `hierholzer.py` (7.5)

**Lưu ý:** Nếu không chạy Flask API, ứng dụng sẽ tự động chuyển sang chế độ mock data.

📖 Xem chi tiết tại [FLASK_INTEGRATION.md](FLASK_INTEGRATION.md)
