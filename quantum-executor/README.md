# QpiAI Quantum Executor Service

A FastAPI-based backend service that executes quantum circuits using the QpiAI Quantum SDK for the QuantumUI LMS platform.

## Overview

This service provides a REST API for executing quantum code submitted from the QuantumUI frontend. It supports:

- QpiAI Quantum SDK circuit execution
- Local quantum simulation (statevector, density matrix)
- Circuit diagram generation
- Measurement result visualization data
- Fallback demo mode when SDK is not installed

## Quick Start

### Option 1: Using the run script

```bash
cd quantum-executor
chmod +x run.sh
./run.sh
```

### Option 2: Manual setup

```bash
cd quantum-executor

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

## API Endpoints

### Health Check
```
GET /health
```
Returns service status and SDK availability.

### Execute Code
```
POST /execute
Content-Type: application/json

{
  "code": "from qpiai_quantum import Circuit...",
  "shots": 1024,
  "backend": "QpiAI-QSV-Local"
}
```

Response:
```json
{
  "success": true,
  "output": "Circuit output...",
  "counts": {"00": 512, "11": 512},
  "circuit_diagram": "q_0: ─[H]─●─...",
  "execution_time_ms": 45.2
}
```

### Get Examples
```
GET /examples
```
Returns a list of example quantum circuits.

## Configuration

The service runs on port 8080 by default. Configure the Next.js app to connect using:

```env
QUANTUM_EXECUTOR_URL=http://localhost:8080
```

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  API Route       │────▶│  Python Executor│
│   (Frontend)    │     │  /api/quantum/*  │     │  (FastAPI)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  QpiAI Quantum  │
                                                 │  SDK            │
                                                 └─────────────────┘
```

## Demo Mode

If the QpiAI Quantum SDK is not installed, the service runs in demo mode with a mock Circuit implementation that simulates basic quantum operations (H, X, Y, Z, CNOT gates).

## Security

The executor includes basic code sanitization to prevent:
- OS/subprocess imports
- File operations
- Dynamic code execution (eval/exec)
- Access to globals/locals

For production use, consider running the executor in a sandboxed Docker container.

## Development

```bash
# Run with auto-reload
uvicorn main:app --reload --port 8080

# Access API docs
open http://localhost:8080/docs
```
