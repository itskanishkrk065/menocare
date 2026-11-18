#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "==> 1. Upgrading pip and installing backend Python requirements..."
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "==> 2. Installing Node dependencies and building React frontend..."
cd frontend
npm install
npm run build
cd ..

echo "==> Render Build successfully completed!"
