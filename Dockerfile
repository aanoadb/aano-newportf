# Use lightweight Alpine Linux with Nginx
FROM nginx:alpine

# Install SSL tools
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy website files
COPY . .

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create SSL directory and generate self-signed certificate
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/selfsigned.key \
    -out /etc/nginx/ssl/selfsigned.crt \
    -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Portfolio/CN=localhost" 2>/dev/null

# Expose HTTPS port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8081/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]