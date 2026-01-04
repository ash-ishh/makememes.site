#!/bin/bash
# Start Backend Server with uv

cd "$(dirname "$0")"
export PYTHONPATH=.
uv run python -m uvicorn backend.app:app --reload --port 8000
