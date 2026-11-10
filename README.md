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
| `npm run build` | Đóng gói trang tra cứu thành 1 file `dist/index.html` |
| `npm run build:admin` | Đóng gói trang quản trị thành 1 file `dist-admin/admin.html` |
| `npm run preview` | Chạy thử bản đã đóng gói |

## Cấu trúc

```
index.html        # bố cục trang
src/main.js       # tìm kiếm, lọc theo cơ quan, phân trang
src/rows.js       # danh mục thủ tục gốc (tên, lĩnh vực, mã TTHC, link, nhóm, cơ quan)
src/data.js       # nạp rows.js (hoặc bản chỉnh sửa từ trang quản trị)
admin.html        # trang quản trị (src/admin.js, src/admin.css)
src/style.css     # giao diện
public/           # ảnh dùng chung (logo, hình toà nhà)
```

## Trang quản trị

Trang quản trị đang để trống (bản cũ lưu ở `backup/admin-v1/`). Mở `http://localhost:5173/admin.html` khi chạy `npm run dev`.
Thêm / sửa / xóa thủ tục, nhập từ Excel, xuất Excel. Dữ liệu lưu trong trình duyệt;
để đăng chính thức: tải `rows.js`, chép đè vào `src/rows.js`, chạy `npm run build`.
