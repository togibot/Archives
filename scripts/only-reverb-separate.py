#!/usr/bin/env python3
"""Separate only the vocal stem for Togi Only Reverb using Demucs ONNX."""

import os
import sys
from pathlib import Path

# Keep native math libraries from creating extra worker pools on small hosts.
for name in (
    "OMP_NUM_THREADS",
    "OPENBLAS_NUM_THREADS",
    "MKL_NUM_THREADS",
    "NUMEXPR_NUM_THREADS",
):
    os.environ[name] = "1"

from demucs_onnx import separate_stem
import demucs_onnx.inference as demucs_inference
import onnxruntime as ort


def enable_low_memory_runtime() -> None:
    """Use a single sequential CPU worker and avoid large ORT memory pools."""
    def make_session(onnx_path, providers):
        options = ort.SessionOptions()
        options.intra_op_num_threads = 1
        options.inter_op_num_threads = 1
        options.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
        options.enable_cpu_mem_arena = False
        options.enable_mem_pattern = False
        options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_BASIC
        options.add_session_config_entry("session.intra_op.allow_spinning", "0")
        options.add_session_config_entry("session.inter_op.allow_spinning", "0")
        return ort.InferenceSession(
            str(onnx_path),
            sess_options=options,
            providers=list(providers),
        )

    # demucs-onnx creates its sessions through this factory. Replacing it
    # before inference limits thread-related memory overhead on small servers.
    demucs_inference._make_session = make_session


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
        f"Separando somente a voz: modo={mode}, modelo especialista vocal, "
        f"precisão={precision}, CPU=1 thread",
        flush=True,
    )

    enable_low_memory_runtime()
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
