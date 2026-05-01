FROM debian:trixie-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    nginx \
    hugo \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r appuser && useradd -r -g appuser -u 1000 appuser

RUN mkdir -p /home/appuser \
    && mkdir -p /json \
    && mkdir -p /log \
    && mkdir -p /public \
    && mkdir -p /content \
    && mkdir -p /hugo \
    && mkdir -p /scripts \
    && chown -R appuser:appuser \
    /hugo \
    /scripts \
    /content \
    /public \
    /json \
    /log \
    /home/appuser \
    /var/log/nginx \
    /var/lib/nginx \
    /run

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/skeleton.html /public/index.html
COPY nginx/skeleton.html /public/404.html
COPY README.md /content/readme/index.md
COPY scripts /scripts
COPY hugo /hugo

RUN cd /scripts && npm install

RUN chmod 777 /public/index.html \
    && chmod 777 /public/404.html

RUN chown -R appuser:appuser \
    /scripts \
    /json \
    /public \
    /log \
    /hugo \
    /home/appuser \
    /var/log/nginx \
    /var/lib/nginx \
    /run

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -sf http://localhost:80/ > /dev/null || exit 1

USER appuser
ENV HOME=/home/appuser

WORKDIR /scripts

CMD ["node", "entrypoint.mjs"]

LABEL org.opencontainers.image.source=https://github.com/handtrixx/niklas-stephan.de
