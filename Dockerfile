# 1. Base Image
FROM python:3.10-slim

# 2. Working Directory
WORKDIR /code

# 3. Dependencies
COPY requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# 4. App Code
COPY . /code

# 5. Run Command
# Cloud Run expects the app to listen on the port defined by the PORT environment variable.
# We override the default port to 8080 as per requirements.
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8080"]
