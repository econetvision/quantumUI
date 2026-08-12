#!/bin/bash

# QpiAI Quantum Executor - Startup Script

echo "🔮 Starting QpiAI Quantum Executor..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet

# Check if QpiAI SDK is installed
python -c "import qpiai_quantum; print(f'✅ QpiAI Quantum SDK v{qpiai_quantum.__version__} ready')" 2>/dev/null || \
    echo "⚠️  QpiAI SDK not installed. Running in demo mode."

# Start the server
echo "🚀 Starting server on http://localhost:8080"
echo "📡 API documentation: http://localhost:8080/docs"
echo ""
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
