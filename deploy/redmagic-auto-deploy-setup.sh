#!/data/data/com.termux/files/usr/bin/sh
set -eu
umask 077
service="$PREFIX/var/service/spend-auto-deploy"
mkdir -p "$service/log" "$HOME/spend-log/logs/deploy"
cp "$(dirname "$0")/redmagic-auto-deploy.sh" "$HOME/spend-log/auto-deploy.sh"
chmod 700 "$HOME/spend-log/auto-deploy.sh"
cat > "$service/run" <<'RUN'
#!/data/data/com.termux/files/usr/bin/sh
child=''
trap 'if [ -n "$child" ]; then kill "$child" 2>/dev/null || true; wait "$child" || true; fi; exit 0' TERM INT
while :; do
  timeout 600 sh "$HOME/spend-log/auto-deploy.sh" &
  child=$!
  wait "$child" || echo 'Auto-deploy failed; will retry in 60 seconds' >&2
  sleep 60 &
  child=$!
  wait "$child" || true
done
RUN
cat > "$service/log/run" <<'LOG'
#!/data/data/com.termux/files/usr/bin/sh
exec svlogd -tt "$HOME/spend-log/logs/deploy"
LOG
printf 's1000000\nn3\n' > "$HOME/spend-log/logs/deploy/config"
chmod 700 "$service/run" "$service/log/run"
for attempt in 1 2 3 4 5 6; do
  test -p "$service/supervise/ok" && break
  sleep 1
done
sv -w 10 up "$service"
