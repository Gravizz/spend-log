#!/data/data/com.termux/files/usr/bin/sh
set -eu
umask 077
app="$HOME/spend-log"
source="$app/source"
service="$PREFIX/var/service/spend-log"
repository="${SPEND_REPOSITORY:-https://github.com/Gravizz/spend-log.git}"
export GIT_TERMINAL_PROMPT=0

exec 9>"$app/deploy.lock"
flock -n 9 || exit 0
test -L "$app/current"
old=$(readlink "$app/current")
switched=false
finish() {
  status=$?
  trap - EXIT
  if [ "$switched" = true ]; then
    ln -sfn "$old" "$app/current.next"
    mv -Tf "$app/current.next" "$app/current"
    sv restart "$service" || true
    echo 'Deployment failed; restored previous release' >&2
  fi
  exit "$status"
}
trap finish EXIT
trap 'exit 1' HUP INT TERM

if [ ! -d "$source/.git" ]; then
  git clone --quiet --depth 1 --branch main --no-checkout "$repository" "$source"
fi
git -C "$source" fetch --quiet --depth 1 origin main
revision=$(git -C "$source" rev-parse FETCH_HEAD)
if [ "$(cat "$app/current/REVISION" 2>/dev/null || true)" = "$revision" ]; then
  exit 0
fi

echo "Building main $revision"
git -C "$source" checkout --quiet --detach "$revision"
cd "$source"
npm ci --include=dev --ignore-scripts --no-audit --no-fund
# Build analysis needs auth config; production credentials stay outside the checkout.
AUTH_USER=build-only AUTH_PASSWORD=build-only SESSION_SECRET=build-only npm run build

release=$(mktemp -d "$app/releases/$revision.XXXXXX")
cp -R build "$release/build"
cp package.json "$release/package.json"
printf '%s\n' "$revision" > "$release/REVISION"
ln -sfn "releases/$(basename "$release")" "$app/current.next"
switched=true
mv -Tf "$app/current.next" "$app/current"
sv restart "$service"
for attempt in 1 2 3 4 5; do
  status=$(curl --silent --max-time 3 --output /dev/null --write-out '%{http_code}' \
    -H 'Host: spend.gravizz.com' -H 'X-Forwarded-Proto: https' \
    http://127.0.0.1:3100/login || true)
  if [ "$status" = 200 ]; then
    switched=false
    echo "Deployed main $revision"
    exit 0
  fi
  sleep 1
done
exit 1
