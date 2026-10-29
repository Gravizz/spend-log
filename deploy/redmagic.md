# redmagic deployment

Public URL: https://spend.gravizz.com

The app runs on Node.js 24+ in Termux. Cloudflare Tunnel `spend-redmagic`
forwards this hostname to `http://127.0.0.1:3100`. The origin binds only to
loopback; it is not exposed on the LAN or Tailscale.

Runtime files on redmagic:

- `~/spend-log/current`: symlink to the active release under `releases/`
- `~/spend-log/.env`: existing login credentials and session secret (mode 600)
- `~/spend-log/data/spend.db`: persistent SQLite database, independent of releases
- `~/.config/spend-log/tunnel-token`: tunnel credential (mode 600)
- `~/spend-log/logs/app/` and `logs/tunnel/`: rotated service logs

The `spend-log` runit service sets `HOST=127.0.0.1`, `PORT=3100`,
`NODE_ENV=production`, `TZ=Asia/Bangkok`, `REQUIRE_HTTPS=true`, an absolute
`DATABASE_PATH`, `ADDRESS_HEADER=cf-connecting-ip`, and
`PROTOCOL_HEADER=x-forwarded-proto`. These headers are trusted because traffic
reaches the loopback origin through Cloudflare Tunnel. Do not expose the app
port directly when using these headers.

Inspect or restart over SSH:

```sh
ssh redmagic
sv status "$PREFIX/var/service/spend-log" "$PREFIX/var/service/spend-tunnel"
sv restart "$PREFIX/var/service/spend-log"
tail -n 30 "$HOME/spend-log/logs/app/current"
```

## Automatic deployment from main

The `spend-auto-deploy` runit service checks the public GitHub repository's
`main` branch every 60 seconds. It runs entirely on redmagic, without GitHub
Actions, a webhook, or a GitHub token. Keep the repository public for this URL.

When the commit changes, it checks out that exact commit in
`~/spend-log/source`, runs `npm ci` using `package-lock.json`, then `npm run build`.
Build analysis uses dummy credentials; production `.env` stays outside the
checkout. Successful builds are copied to a separate release directory, the
`current` symlink is replaced atomically, and only the app service restarts.
A failed build leaves the current release untouched. A failed restart or login
health check restores the previous release. Failed attempts retry after 60
seconds; each attempt has a ten-minute timeout.

The database and credentials stay outside both the build checkout and releases.
Old releases are retained for manual recovery. Automatic deployment performs a
build and runtime health check, not the Bun test suite; run `bun test` and
`bun run check` locally before pushing.

The initial setup uses `deploy/redmagic-auto-deploy-setup.sh` alongside
`deploy/redmagic-auto-deploy.sh`. To update the updater scripts, copy these two
files to the device and rerun setup; app updates happen automatically.

```sh
sv status "$PREFIX/var/service/spend-auto-deploy"
tail -n 30 "$HOME/spend-log/logs/deploy/current"
cat "$HOME/spend-log/current/REVISION"
# Pause automatic deployment:
sv down "$PREFIX/var/service/spend-auto-deploy"
# Resume:
sv up "$PREFIX/var/service/spend-auto-deploy"
```

Manual deployment remains possible: run `bun run build` locally, copy `build/`
and `package.json` to a new release, switch `current`, then restart `spend-log`.
Pause the updater first so it does not replace a manual release on its next check.

The first deployment starts with an empty database; no local financial records
were copied. Use SQLite's backup API for consistent backups while WAL is active;
copying only the main database file while it is open is not sufficient.

Runit restarts crashed services, and a Termux wake lock is enabled. Android can
still stop Termux. After a phone reboot, open Termux to start its service daemon,
then run `termux-wake-lock`. Automatic start before opening Termux has not been
configured or tested. Keep the device online and exempt Termux from battery
optimization if Android stops it.

Login rate limits are held in one app process and reset when it restarts.
