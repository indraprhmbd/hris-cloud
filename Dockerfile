FROM python:3.9

WORKDIR /app

# Copy requirements dari folder backend dan install
COPY ./backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# Copy semua isi folder backend ke direktori kerja /app
COPY ./backend /app

# Tambahkan environment variable agar python tidak membuat file .pyc
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Jalankan uvicorn (main:app merujuk pada file main.py di dalam folder backend)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
