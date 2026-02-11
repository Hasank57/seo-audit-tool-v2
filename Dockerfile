FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ ./backend/
COPY dist/ ./dist/

WORKDIR /app/backend

# Use shell form (not JSON array) to allow $PORT expansion
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
