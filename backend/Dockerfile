FROM python:3.11-slim

WORKDIR /app

# Install uv for faster package management
RUN pip install uv

# Copy requirements first for better caching
# Note: We copy into a 'backend' subdirectory to maintain the package structure
COPY requirements.txt backend/

# Install dependencies using uv
RUN uv pip install --system -r backend/requirements.txt

# Copy the rest of the backend code
COPY . backend/

# Expose the port
EXPOSE 8000

# Set Python path to /app so 'backend' is findable as a package
ENV PYTHONPATH=/app

# Run the application
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
