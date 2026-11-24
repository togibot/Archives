#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ Python 3 não foi encontrado. Instale Python 3.10 ou superior."
  exit 1
fi

python3 - <<'PY'
import sys
if sys.version_info < (3, 10):
    raise SystemExit("❌ O Only Reverb precisa de Python 3.10 ou superior.")
print("✅ Python", sys.version.split()[0])
PY

if [ ! -x ".venv-audio/bin/python" ]; then
  python3 -m venv .venv-audio
fi

.venv-audio/bin/python -m pip install --upgrade pip
.venv-audio/bin/python -m pip install --no-cache-dir "demucs-onnx>=0.3.4,<0.4"

.venv-audio/bin/python - <<'PY'
import demucs_onnx
print("✅ Motor Only Reverb instalado — demucs-onnx", demucs_onnx.__version__)
PY

echo ""
echo "✅ Instalação concluída."
echo "Os modelos ONNX serão baixados automaticamente no primeiro uso de cada modo."
