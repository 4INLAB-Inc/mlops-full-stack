# Sử dụng image Node.js chính thức từ Docker Hub
FROM node:22-alpine

# Cài đặt supervisor
RUN apk add --no-cache supervisor

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy các file package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt tất cả các dependencies (bao gồm devDependencies)
RUN npm install --production

# Copy tất cả mã nguồn của ứng dụng vào container
COPY . .

# Build ứng dụng Next.js để chuẩn bị cho môi trường production
RUN npm run build

# Mở cổng 3001 (production) và 4000 (server.js)
EXPOSE 3001
EXPOSE 4000

# Copy file cấu hình supervisor vào container
COPY ./supervisord.conf /etc/supervisord.conf

# Chạy supervisor để quản lý các tiến trình
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
