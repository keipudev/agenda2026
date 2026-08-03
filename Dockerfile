FROM python:3.11-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/opt/deps -r requirements.txt

FROM python:3.11-slim

WORKDIR /app

RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY --from=builder /opt/deps /opt/deps
COPY . .

RUN chown -R appuser:appuser /app

ENV PATH=/opt/deps/bin:$PATH
ENV PYTHONPATH=/opt/deps/lib/python3.11/site-packages
ENV FLASK_APP=app.py

EXPOSE 5000

USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/')" || exit 1

CMD ["python", "app.py"]

