FROM python:3.11-slim

# Install Node.js (for building Vite/React)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) Install frontend deps + build React
COPY package.json package-lock.json* ./

# خلي npm ثابت وقلل مشاكل CI
RUN npm i -g npm@11.10.1

# لازم devDependencies تنزل عشان vite
ENV NODE_ENV=development

# استخدم ci لو فيه lockfile، وأجبره يثبت dev deps
RUN npm ci --include=dev --legacy-peer-deps --no-audit --no-fund || \
    npm install --legacy-peer-deps --no-audit --no-fund

COPY . .
RUN npx vite build



# 2) Install backend deps
RUN pip install --no-cache-dir -r backend/requirements.txt

# Render provides PORT env var
ENV PORT=10000
EXPOSE 10000

# Start Flask app via Gunicorn
CMD ["sh", "-c", "gunicorn backend.app:app --bind 0.0.0.0:$PORT"]
