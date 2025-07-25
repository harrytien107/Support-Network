# Vite React TypeScript Starter

Dự án này là một ứng dụng web được xây dựng với React, TypeScript, Vite và Tailwind CSS, có tích hợp các công cụ xử lý mạng/IP.

## 🚀 Công nghệ sử dụng

- **React** - Thư viện UI
- **TypeScript** - Ngôn ngữ lập trình
- **Vite** - Build tool và dev server
- **Tailwind CSS** - CSS framework
- **Lucide React** - Icon library
- **ESLint** - Linting tool

## 📋 Yêu cầu hệ thống

- Node.js (phiên bản 16 trở lên)
- npm hoặc yarn
- Git

## 🛠️ Cài đặt và chạy dự án

### 1. Clone dự án (nếu cần)

```bash
git clone <repository-url>
cd project
```

### 2. Cài đặt dependencies

```bash
npm install
```

hoặc nếu bạn sử dụng yarn:

```bash
yarn install
```

### 3. Chạy dự án ở môi trường development

```bash
npm run dev
```

hoặc:

```bash
yarn dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

### 4. Build dự án cho production

```bash
npm run build
```

### 5. Preview bản build production

```bash
npm run preview
```

### 6. Chạy linting

```bash
npm run lint
```

## 📁 Cấu trúc dự án

```
├── js/                   # Các module JavaScript utilities
│   ├── binaryMap.js      # Xử lý binary mapping
│   ├── ipAggregator.js   # Tổng hợp IP
│   ├── ipChecker.js      # Kiểm tra IP
│   ├── uiHandler.js      # Xử lý UI
│   └── vlsmLogic.js      # Logic VLSM
├── src/                  # Source code React
│   ├── App.tsx           # Component chính
│   ├── main.tsx          # Entry point
│   ├── index.css         # Global styles
│   └── vite-env.d.ts     # TypeScript declarations
├── index.html            # HTML template
├── package.json          # Dependencies và scripts
├── vite.config.ts        # Cấu hình Vite
├── tailwind.config.js    # Cấu hình Tailwind CSS
├── postcss.config.js     # Cấu hình PostCSS
├── eslint.config.js      # Cấu hình ESLint
└── tsconfig.json         # Cấu hình TypeScript
```

## 🔧 Scripts có sẵn

- `npm run dev` - Chạy development server
- `npm run build` - Build dự án cho production
- `npm run preview` - Preview bản build production
- `npm run lint` - Chạy ESLint để kiểm tra code

## 🎯 Tính năng

Dự án này bao gồm:

- ⚛️ React 18 với TypeScript
- 🎨 Tailwind CSS cho styling
- 🔧 Vite cho build tool nhanh
- 📦 Lucide React icons
- 🌐 Các utilities xử lý IP và mạng
- 🔍 ESLint cho code quality

## 🔍 Troubleshooting

### Lỗi phổ biến:

1. **Port đã được sử dụng**: Nếu port 5173 đã được sử dụng, Vite sẽ tự động chọn port khác
2. **Module not found**: Chạy `npm install` để cài đặt lại dependencies
3. **TypeScript errors**: Kiểm tra file `tsconfig.json` và đảm bảo tất cả types đã được cài đặt

### Reset dự án:

```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install

# Hoặc trên Windows
rmdir /s node_modules
del package-lock.json
npm install
```

## 📝 Development

Để bắt đầu development:

1. Mở terminal trong thư mục dự án
2. Chạy `npm run dev`
3. Mở trình duyệt tại `http://localhost:5173`
4. Bắt đầu chỉnh sửa file trong thư mục `src/`
5. Thay đổi sẽ được hot-reload tự động

## 🤝 Contributing

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

_Được tạo với ❤️ sử dụng Vite + React + TypeScript_
