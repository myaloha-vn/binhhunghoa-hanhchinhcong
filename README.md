# Tra cứu thủ tục hành chính – Trung tâm Hành chính công phường Bình Hưng Hòa

Frontend dùng [Vite](https://vite.dev) (HTML/CSS/JavaScript thuần, không cần backend).

## Chạy dự án

Cần cài sẵn [Node.js](https://nodejs.org) (phiên bản 18 trở lên).

```bash
npm install      # chỉ cần chạy lần đầu
npm run dev      # chạy thử, tự mở trình duyệt tại http://localhost:5173
```

Các lệnh khác:

| Lệnh | Tác dụng |
| --- | --- |
| `npm run dev` / `npm start` | Chạy môi trường phát triển (tự tải lại khi sửa code) |
| `npm run build` | Đóng gói bản chạy thật vào thư mục `dist/` |
| `npm run preview` | Chạy thử bản đã đóng gói |

## Cấu trúc

```
index.html        # bố cục trang
src/main.js       # tìm kiếm, lọc theo cơ quan, phân trang
src/data.js       # danh mục thủ tục (tên, cơ quan, mã TTHC, đường link)
src/style.css     # giao diện
public/           # ảnh dùng chung (logo, hình toà nhà)
```

## Cập nhật danh mục thủ tục

Sửa file `src/data.js`. Mỗi dòng có dạng `[tên thủ tục, cơ quan, mã TTHC, đường link]`.
Danh mục hiện tại theo bản niêm yết TTHC tiếp nhận và trả kết quả không phụ thuộc địa giới hành chính (29-10).
