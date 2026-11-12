# Optional owner-controlled translator. This image is NOT part of default Compose.
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 OMP_NUM_THREADS=2
WORKDIR /app
# CPU-only torch avoids pulling a CUDA runtime onto the private home server.
RUN pip install --no-cache-dir torch==2.5.1 --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir "transformers==4.46.3" "sentencepiece==0.2.0" "sacremoses==0.1.1" "huggingface-hub==0.26.2"
COPY translator/service.py ./service.py
RUN useradd --uid 10115 --create-home --shell /usr/sbin/nologin trialum
USER trialum
EXPOSE 5000
CMD ["python", "service.py"]
