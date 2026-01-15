FROM nginx:alpine

# 1. Install tools yang dibutuhkan
RUN apk add --no-cache openssl curl ca-certificates

# 2. Create directories & Set permissions awal
RUN mkdir -p /usr/share/nginx/html && \
    mkdir -p /etc/nginx/ssl && \
    mkdir -p /var/cache/nginx && \
    mkdir -p /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /var/run/nginx.pid

# 3. Set working directory
WORKDIR /usr/share/nginx/html

# 4. Copy website files
# Pastikan file-file ini ada di folder host saat build
COPY index.html .
COPY style.css .
COPY script.js .
COPY src/ ./src/

# 5. Generate SSL certificate & Fix Permissions (CRITICAL STEP)
# Kita generate sebagai root, lalu ubah owner ke nginx agar bisa dibaca saat USER nginx aktif
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/selfsigned.key \
    -out /etc/nginx/ssl/selfsigned.crt \
    -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Aano Portfolio/CN=aanoo.xyz" \
    -addext "subjectAltName = DNS:aanoo.xyz, DNS:www.aanoo.xyz, DNS:localhost" && \
    chown -R nginx:nginx /etc/nginx/ssl && \
    chmod 644 /etc/nginx/ssl/selfsigned.crt && \
    chmod 600 /etc/nginx/ssl/selfsigned.key

# 6. Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# 7. Final Ownership Adjustment
# Pastikan semua file web dan config dimiliki user nginx
RUN chown -R nginx:nginx /usr/share/nginx/html /etc/nginx/nginx.conf

# 8. Expose port
EXPOSE 8081

# 9. Health check (Update protocol to HTTPS)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -k -f https://localhost:8081/health || exit 1

# 10. Switch to non-root user
USER nginx

# 11. Start Nginx
CMD ["nginx", "-g", "daemon off;"]
