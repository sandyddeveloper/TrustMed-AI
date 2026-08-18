# ==============================================================================
# Multi-Stage Production Dockerfile for TrustMed-AI Backend
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Builder Stage
# ------------------------------------------------------------------------------
FROM python:3.10-slim AS builder

WORKDIR /build

# Install system compilation dependencies for scientific packages & psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libpq-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip & build tools
RUN pip install --upgrade pip setuptools wheel

# Build wheels for project requirements to speed up final layer caching
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /build/wheels -r requirements.txt


# ------------------------------------------------------------------------------
# 2. Final Runtime Stage
# ------------------------------------------------------------------------------
FROM python:3.10-slim AS runtime

# Set environment flags for performance & Python behavior
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8000 \
    APP_ENV=production

WORKDIR /app

# Install minimal runtime libraries (libpq for postgres, curl for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-privileged user and group for security
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser

# Install pre-built wheels from the builder stage
COPY --from=builder /build/wheels /wheels
COPY --from=builder /build/requirements.txt .
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels

# Copy application source code
COPY . /app/backend

# Set proper ownership for the app directory
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Docker Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Production server entrypoint
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--proxy-headers", "--forwarded-allow-ips", "*"]
