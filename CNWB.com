#!/bin/sh
# Open WhatsApp Web when a graphical browser is available.
URL="https://web.whatsapp.com"

if command -v xdg-open >/dev/null 2>&1 && { [ -n "${DISPLAY:-}" ] || [ -n "${WAYLAND_DISPLAY:-}" ]; }; then
  xdg-open "$URL" >/dev/null 2>&1 &
  echo "[CNWB] WhatsApp Web solicitado ao navegador."
else
  echo "[CNWB] Este servidor não possui sessão gráfica."
  echo "[CNWB] Abra este endereço no navegador do seu celular:"
  printf '%s\n' "$URL"
fi
