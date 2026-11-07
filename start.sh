#!/bin/bash
# ------------------------------------------------------------
# Freundeskalender lokal starten
#   ./start.sh          -> startet auf Port 8080
#   ./start.sh 3000     -> startet auf Port 3000
# Beenden mit: ctrl + C
# ------------------------------------------------------------
cd "$(dirname "$0")" || exit 1
PORT="${1:-8080}"
IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')

echo ""
echo "  📅  Freundeskalender läuft:"
echo "      Auf diesem Mac:   http://localhost:$PORT"
[ -n "$IP" ] && echo "      Im gleichen WLAN: http://$IP:$PORT  (nur zum Ansehen, Installieren braucht HTTPS)"
echo ""
echo "  Beenden mit ctrl + C"
echo ""

# Browser nach kurzer Zeit öffnen (macOS)
( sleep 1 && command -v open >/dev/null && open "http://localhost:$PORT" ) &

if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server "$PORT"
elif command -v npx >/dev/null 2>&1; then
  npx --yes http-server -p "$PORT" -c-1
else
  echo "Weder python3 noch Node.js gefunden."
  echo "Installiere eines davon, z. B. mit:  xcode-select --install"
  exit 1
fi
