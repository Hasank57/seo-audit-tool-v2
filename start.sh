#!/bin/bash

# SEO Audit Tool - Startup Script
# This script starts both the backend and frontend servers

echo "=================================="
echo "SEO Audit Tool - Starting Servers"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# Install backend dependencies if needed
if [ ! -d "backend/venv" ]; then
    echo -e "${BLUE}Setting up Python virtual environment...${NC}"
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
else
    source backend/venv/bin/activate
fi

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install
fi

echo ""
echo -e "${GREEN}Starting Backend Server (FastAPI)...${NC}"
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}Backend server started on http://localhost:8000${NC}"
echo ""

# Wait for backend to start
sleep 3

echo -e "${GREEN}Starting Frontend Server (Vite)...${NC}"
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}Frontend server started on http://localhost:3000${NC}"
echo ""

echo "=================================="
echo -e "${GREEN}Both servers are running!${NC}"
echo "=================================="
echo ""
echo -e "Backend API: ${BLUE}http://localhost:8000${NC}"
echo -e "Frontend App: ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "API Documentation: ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait
