#!/data/data/com.termux/files/usr/bin/sh
set -eu
umask 077
mkdir -p "$PREFIX/var/service/spend-log/log" "$PREFIX/var/service/spend-tunnel/log" "$HOME/spend-log/logs/app" "$HOME/spend-log/logs/tunnel"
cat > "$PREFIX/var/service/spend-log/run" <<'APP'
#!/data/data/com.termux/files/usr/bin/sh
cd "$HOME/spend-log"
export NODE_ENV=production TZ=Asia/Bangkok HOST=127.0.0.1 PORT=3100 REQUIRE_HTTPS=true
export DATABASE_PATH="$HOME/spend-log/data/spend.db"
export ADDRESS_HEADER=cf-connecting-ip PROTOCOL_HEADER=x-forwarded-proto
exec node --env-file=.env current/build/index.js 2>&1
APP
cat > "$PREFIX/var/service/spend-tunnel/run" <<'TUNNEL'
#!/data/data/com.termux/files/usr/bin/sh
exec cloudflared tunnel --no-autoupdate run --token-file "$HOME/.config/spend-log/tunnel-token" 2>&1
TUNNEL
for service in spend-log spend-tunnel; do
  case "$service" in spend-log) log=app ;; *) log=tunnel ;; esac
  printf '#!/data/data/com.termux/files/usr/bin/sh\nexec svlogd -tt "$HOME/spend-log/logs/%s"\n' "$log" > "$PREFIX/var/service/$service/log/run"
  printf 's1000000\nn3\n' > "$HOME/spend-log/logs/$log/config"
  chmod 700 "$PREFIX/var/service/$service/run" "$PREFIX/var/service/$service/log/run"
done
termux-wake-lock
export SVDIR="$PREFIX/var/service" LOGDIR="$PREFIX/var/log"
if ! kill -0 "$(cat "$PREFIX/var/run/service-daemon.pid" 2>/dev/null)" 2>/dev/null; then
  service-daemon start
fi
for n in 1 2 3 4 5; do
  test -p "$SVDIR/spend-log/supervise/ok" && break
  sleep 1
done
sv up "$PREFIX/var/service/spend-log"
sv up "$PREFIX/var/service/spend-tunnel"
sv status "$PREFIX/var/service/spend-log" "$PREFIX/var/service/spend-tunnel"