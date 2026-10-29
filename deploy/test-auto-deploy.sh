#!/bin/sh
set -eu
script=$(cd "$(dirname "$0")" && pwd)/redmagic-auto-deploy.sh
fixture=$(mktemp -d)
export HOME="$fixture/home" PREFIX="$fixture/prefix"
export SPEND_REPOSITORY="$fixture/repository"
mkdir -p "$HOME/spend-log/releases/original/build" "$PREFIX/var/service/spend-log" "$fixture/bin"
export PATH="$fixture/bin:$PATH"
printf 'existing data' > "$HOME/spend-log/data-proof"
printf 'private credentials' > "$HOME/spend-log/.env"
printf 'original' > "$HOME/spend-log/releases/original/build/index.js"
ln -s releases/original "$HOME/spend-log/current"
git init -q -b main "$SPEND_REPOSITORY"
git -C "$SPEND_REPOSITORY" config user.name 'Deployment test'
git -C "$SPEND_REPOSITORY" config user.email 'test@example.invalid'
printf '{"type":"module"}' > "$SPEND_REPOSITORY/package.json"
printf '{}' > "$SPEND_REPOSITORY/package-lock.json"
printf 'first' > "$SPEND_REPOSITORY/version"
git -C "$SPEND_REPOSITORY" add .
git -C "$SPEND_REPOSITORY" commit -qm first

cat > "$fixture/bin/npm" <<'NPM'
#!/bin/sh
set -eu
test ! -e "$HOME/build-fails"
if [ "$1" = run ]; then
  mkdir -p build
  cp version build/index.js
fi
NPM
cat > "$fixture/bin/sv" <<'SV'
#!/bin/sh
printf 'restart\n' >> "$HOME/restarts"
SV
cat > "$fixture/bin/curl" <<'CURL'
#!/bin/sh
if [ -e "$HOME/health-fails" ]; then printf '500'; else printf '200'; fi
CURL
chmod +x "$fixture/bin/"*

sh "$script"
test "$(cat "$HOME/spend-log/current/build/index.js")" = first
test "$(cat "$HOME/spend-log/current/REVISION")" = "$(git -C "$SPEND_REPOSITORY" rev-parse HEAD)"
sh "$script"
test "$(wc -l < "$HOME/restarts")" -eq 1

printf 'second' > "$SPEND_REPOSITORY/version"
git -C "$SPEND_REPOSITORY" commit -qam second
touch "$HOME/build-fails"
if sh "$script"; then echo 'Expected build failure'; exit 1; fi
test "$(cat "$HOME/spend-log/current/build/index.js")" = first
rm "$HOME/build-fails"

touch "$HOME/health-fails"
if sh "$script"; then echo 'Expected health-check failure'; exit 1; fi
test "$(cat "$HOME/spend-log/current/build/index.js")" = first
test "$(wc -l < "$HOME/restarts")" -eq 3
rm "$HOME/health-fails"
sh "$script"
test "$(cat "$HOME/spend-log/current/build/index.js")" = second
test "$(cat "$HOME/spend-log/data-proof")" = 'existing data'
test "$(cat "$HOME/spend-log/.env")" = 'private credentials'
echo 'PASS: new main, unchanged main, failed build, health rollback, retry, persistent files'
