#!/bin/sh
set -eu

BASE_DIR="${TOGI_LOCAL_AI_DIR:-$HOME/Togi-Bot/local-ai}"
LLAMA_DIR="$BASE_DIR/llama.cpp"
MODEL_DIR="$BASE_DIR/models"
MODEL_FILE="$MODEL_DIR/qwen2.5-1.5b-instruct-q4_k_m.gguf"
MODEL_URL="https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf?download=true"
BOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
ENV_FILE="$BOT_DIR/.env"

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

# Configura o .env sem tocar nas chaves do Gemini que o usuário já possa ter.
touch "$ENV_FILE"
set_env() {
  key="$1"
  value="$2"
  tmp="$ENV_FILE.tmp"
  grep -v "^${key}=" "$ENV_FILE" > "$tmp" 2>/dev/null || true
  printf '%s=%s\n' "$key" "$value" >> "$tmp"
  mv "$tmp" "$ENV_FILE"
}

set_env TOGI_AI_PROVIDER local
set_env TOGI_LOCAL_AI_URL http://127.0.0.1:8080
set_env TOGI_LOCAL_AI_MODEL qwen2.5-1.5b-instruct-q4_k_m.gguf
set_env TOGI_LOCAL_AI_COMMAND 'sh ./scripts/start-local-ai.sh'
set_env TOGI_LOCAL_AI_TIMEOUT_MS 120000
set_env TOGI_LOCAL_MAX_TOKENS 350
set_env TOGI_AI_COOLDOWN_MS 3000
set_env TOGI_AI_HISTORY_MESSAGES 10

echo ''
echo '✅ IA local instalada e .env configurado!'
echo "📦 Modelo: $MODEL_FILE"
echo '🤖 O comando .Togi agora usará a IA local por padrão.'
echo ''
echo 'Depois, inicie o bot normalmente com:'
echo 'cd ~/Togi-Bot'
echo 'npm start'
