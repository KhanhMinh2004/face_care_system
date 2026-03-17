FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libglib2.0-0 libsm6 libxext6 libxrender-dev \
    libgl1 libgomp1 curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .

# Thứ tự cài: numpy → tensorflow → ultralytics → rest
RUN pip install --no-cache-dir numpy==1.26.4
RUN pip install --no-cache-dir tensorflow==2.20.0
RUN pip install --no-cache-dir ultralytics==8.4.19

# Cài phần còn lại, giữ nguyên 3 thư viện trên không bị đè
RUN echo "numpy==1.26.4" > constraints.txt
RUN pip install --no-cache-dir -r requirements.txt -c constraints.txt

COPY backend/ ./backend/
RUN mkdir -p /app/backend/models

EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]