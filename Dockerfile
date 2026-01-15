FROM nginx:alpine

# Install tools yang diperlukan
RUN apk add --no-cache git openssl curl bash

# Create directory structure
RUN mkdir -p /usr/share/nginx/html && \
    mkdir -p /usr/share/nginx/html/src/img

# Copy fixed source files (without git clone from your repo)
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf

# Copy logo files directly
COPY src/img/1-logo-dark.png /usr/share/nginx/html/src/img/
COPY src/img/2-logo-light.png /usr/share/nginx/html/src/img/

# Create fallback logo (optional)
RUN echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#2c2c2c"/><text x="50" y="60" font-size="40" text-anchor="middle" fill="white">A</text></svg>' > /usr/share/nginx/html/src/img/fallback-logo.svg

# Generate SSL certificate for localhost
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Aano/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:aanoo.xyz"

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod 644 /etc/nginx/ssl/*

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Expose ports (HTTP for Cloudflare, HTTPS for direct)
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]