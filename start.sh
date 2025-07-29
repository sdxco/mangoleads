#!/bin/bash

echo "🥭 Starting MangoLeads CRM..."
echo "============================="

# Kill any existing processes
echo "Cleaning up existing processes..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found. Make sure you're in the lead-crm directory."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Copying from .env.example..."
    cp .env.example .env
fi

# Run diagnostic
echo "Running diagnostic..."
node diagnostic.js

echo ""
echo "Starting server on port 4000..."
echo "Press Ctrl+C to stop"
echo ""

# Start the server
node server.js
