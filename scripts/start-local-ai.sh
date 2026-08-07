#!/bin/sh
set -eu

BASE_DIR="${TOGI_LOCAL_AI_DIR:-$HOME/Togi-Bot/local-ai}"
LLAMA_BIN="${TOGI_LLAMA_BIN:-$BASE_DIR/llama.cpp/build/bin/llama-server}"
MODEL_FILE="${TOGI_LOCAL_AI_MODEL_PATH:-$BASE_DIR/models/qwen2.5-1.5b-instruct-q4_k_m.gguf}"
PORT="${TOGI_LOCAL_AI_PORT:-8080}"
CONTEXT="${TOGI_LOCAL_AI_CONTEXT:-4096}"
THREADS="${TOGI_LOCAL_AI_THREADS:-4}"

if [ ! -x "$LLAMA_BIN" ]; then
  echo "❌ llama-server não encontrado: $LLAMA_BIN"
  echo 'Execute primeiro: sh ./scripts/setup-local-ai.sh'
  exit 1
fi

if [ ! -f "$MODEL_FILE" ]; then
  echo "❌ Modelo não encontrado: $MODEL_FILE"
  echo 'Execute primeiro: sh ./scripts/setup-local-ai.sh'
  exit 1
fi

if curl -fsS "http://127.0.0.1:$PORT/health" >/dev/null 2>&1; then
  echo "✅ Togi Local AI já está rodando em http://127.0.0.1:$PORT"
  exit 0
fi

echo "🧠 Iniciando Togi Local AI em http://127.0.0.1:$PORT ..."
exec "$LLAMA_BIN" \
  -m "$MODEL_FILE" \
  --host 127.0.0.1 \
  --port "$PORT" \
  -c "$CONTEXT" \
  -t "$THREADS" \
  -np 1
