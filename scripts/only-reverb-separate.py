#!/usr/bin/env python3
"""Separate only the vocal stem for Togi Only Reverb using Demucs ONNX."""

import os
import sys
from pathlib import Path

os.environ.setdefault("OMP_NUM_THREADS", "2")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")

from demucs_onnx import separate_stem


def main() -> int:
    if len(sys.argv) != 4:
        print("Uso: only-reverb-separate.py <normal|ultra> <entrada> <pasta-saida>", file=sys.stderr)
        return 2

    mode = sys.argv[1].strip().lower()
    source = Path(sys.argv[2])
    output_dir = Path(sys.argv[3])

    if mode not in {"normal", "ultra"}:
        print("Modo inválido. Use normal ou ultra.", file=sys.stderr)
        return 2
    if not source.is_file():
        print("Arquivo de áudio de entrada não encontrado.", file=sys.stderr)
        return 2

    output_dir.mkdir(parents=True, exist_ok=True)
    precision = "fp16weights" if mode == "normal" else "fp32"
    print(
        f"Separando somente a voz: modo={mode}, modelo vocal especializado, precisão={precision}",
        flush=True,
    )

    # separate_stem usa o modelo especialista de voz, evitando carregar o
    # modelo completo de quatro stems quando o Togi só precisa de vocals.wav.
    separate_stem(
        input=source,
        stem="vocals",
        output_dir=output_dir,
        providers="cpu",
        precision=precision,
        verbose=False,
        progress=False,
        output_format="wav",
    )

    vocal_path = output_dir / "vocals.wav"
    if not vocal_path.is_file() or vocal_path.stat().st_size == 0:
        print("O modelo não produziu a faixa vocal esperada.", file=sys.stderr)
        return 1

    print("Faixa vocal isolada com sucesso.", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
