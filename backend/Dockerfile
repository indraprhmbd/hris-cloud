FROM python:3.9

# Buat user baru agar aman (Hugging Face menyarankan ini, tapi root juga bisa)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:${PATH}"

WORKDIR /app

# Copy requirements dan install
COPY --chown=user:user ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# Copy semua kode backend
COPY --chown=user:user . /app

# Jalankan FastAPI di port 7860 (Wajib di Hugging Face)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
