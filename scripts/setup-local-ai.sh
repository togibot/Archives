#!/bin/sh
set -eu

BASE_DIR="${TOGI_LOCAL_AI_DIR:-$HOME/Togi-Bot/local-ai}"
LLAMA_DIR="$BASE_DIR/llama.cpp"
MODEL_DIR="$BASE_DIR/models"
MODEL_FILE="$MODEL_DIR/qwen2.5-1.5b-instruct-q4_k_m.gguf"
MODEL_URL="https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf?download=true"

printf '%s\n' '🧠 Togi Local AI — configuração'
printf '%s\n' "📁 Diretório: $BASE_DIR"

if command -v apk >/dev/null 2>&1; then
  echo '📦 Instalando ferramentas necessárias...'
  apk add --no-cache git cmake make g++ curl
fi

mkdir -p "$MODEL_DIR"

if [ ! -d "$LLAMA_DIR/.git" ]; then
  echo '⬇️ Baixando llama.cpp...'
  git clone --depth 1 https://github.com/ggml-org/llama.cpp.git "$LLAMA_DIR"
else
  echo '🔄 Atualizando llama.cpp...'
  git -C "$LLAMA_DIR" pull --ff-only
fi

echo '🔨 Compilando llama-server...'
cd "$LLAMA_DIR"
cmake -B build -DGGML_NATIVE=ON
cmake --build build -j2 --target llama-server

if [ ! -f "$MODEL_FILE" ]; then
  echo '⬇️ Baixando modelo Qwen2.5 1.5B Q4_K_M (~1 GB)...'
  curl -L --fail --progress-bar "$MODEL_URL" -o "$MODEL_FILE"
else
  echo '✅ Modelo já existe.'
fi

echo ''
echo '✅ IA local instalada!'
echo "📦 Modelo: $MODEL_FILE"
echo "🚀 Servidor: $LLAMA_DIR/build/bin/llama-server"
echo ''
echo 'Agora configure o .env:'
echo 'TOGI_AI_PROVIDER=local'
echo 'TOGI_LOCAL_AI_URL=http://127.0.0.1:8080'
echo 'TOGI_LOCAL_AI_MODEL=qwen2.5-1.5b-instruct-q4_k_m.gguf'
echo 'TOGI_LOCAL_AI_COMMAND=sh ./scripts/start-local-ai.sh'
