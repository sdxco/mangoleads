#!/bin/bash

# Quick Start Script for MangoLeads CRM
echo "🚀 Starting MangoLeads CRM Server..."
echo "=================================="

# Check if we're in the right directory
if [ ! -d "lead-crm" ]; then
    echo "❌ Error: lead-crm directory not found!"
    echo "Please run this script from the MangoLeads root directory"
    exit 1
fi

# Navigate to CRM directory
cd lead-crm

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🔄 Starting CRM server..."
echo "Server will be available at: http://localhost:4000"
echo "Dashboard will be available at: http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
