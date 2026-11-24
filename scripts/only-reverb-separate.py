#!/usr/bin/env python3
"""Separate the vocal stem for Togi Only Reverb using HT-Demucs ONNX."""

import os
import sys
from pathlib import Path

os.environ.setdefault("OMP_NUM_THREADS", "2")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")

from demucs_onnx import separate


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
    model = "htdemucs" if mode == "normal" else "htdemucs_ft"
    precision = "fp16weights" if mode == "normal" else "fp32"
    print(f"Separando voz: modo={mode}, modelo={model}, precisão={precision}", flush=True)

    stems = separate(
        input=source,
        output_dir=output_dir,
        model=model,
        stems=["vocals"],
        providers="cpu",
        precision=precision,
        verbose=False,
        progress=False,
        output_format="wav",
    )
    if "vocals" not in stems or not (output_dir / "vocals.wav").is_file():
        print("O modelo não produziu a faixa vocal.", file=sys.stderr)
        return 1

    print("Faixa vocal isolada com sucesso.", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
