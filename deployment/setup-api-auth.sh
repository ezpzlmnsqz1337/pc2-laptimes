#!/bin/bash
#
# One-time (and rotation) provisioning for PostgREST auth.
#
# Creates the least-privilege PostgREST roles from
# src/assets/db/grant_permissions.sql and the Podman secrets referenced by
# deployment/quadlet/pc2-laptimes-api.container:
#   pg_api_uri     - postgres://laptimes_authenticator:<password>@localhost:5432/pc2-laptimes
#   pg_jwt_secret  - HS256 signing key for the frontend write token
#
# Existing secrets are kept, so re-running the script only re-applies the SQL.
# The script prints a fresh write token for .env.local at the end.
#
# Usage: DESTINATION=hosting@hosting ./deployment/setup-api-auth.sh
#
set -euo pipefail

DESTINATION="${DESTINATION:-hosting@hosting}"
DB_CONTAINER="${DB_CONTAINER:-pc2-laptimes-postgres}"
DB_NAME="${DB_NAME:-pc2-laptimes}"
DB_USER="${DB_USER:-postgres}"
API_ROLE="laptimes_authenticator"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SQL_FILE="$PROJECT_ROOT/src/assets/db/grant_permissions.sql"
MINT_SCRIPT="$PROJECT_ROOT/deployment/mint-token.mjs"

[ -f "$SQL_FILE" ] || { echo "ERROR: missing $SQL_FILE" >&2; exit 1; }

secret_exists () {
  ssh "$DESTINATION" "podman secret inspect '$1' >/dev/null 2>&1"
}

create_secret () {
  printf '%s' "$2" | ssh "$DESTINATION" "podman secret create '$1' -" > /dev/null
  echo "   created Podman secret $1"
}

read_secret () {
  ssh "$DESTINATION" "podman secret inspect --showsecret '$1' --format '{{.SecretData}}'"
}

echo ">> provisioning PostgREST secrets on $DESTINATION"
if secret_exists pg_api_uri; then
  echo "   pg_api_uri already exists - keeping the current API password"
else
  API_PASSWORD="$(openssl rand -hex 24)"
  create_secret pg_api_uri "postgres://$API_ROLE:$API_PASSWORD@localhost:5432/$DB_NAME"
fi

if secret_exists pg_jwt_secret; then
  echo "   pg_jwt_secret already exists - keeping the current signing key"
else
  create_secret pg_jwt_secret "$(openssl rand -hex 32)"
fi

API_URI="$(read_secret pg_api_uri)"
API_PASSWORD="${API_URI#*://$API_ROLE:}"
API_PASSWORD="${API_PASSWORD%%@*}"

echo ">> applying least-privilege roles from src/assets/db/grant_permissions.sql"
ssh "$DESTINATION" "podman exec -i '$DB_CONTAINER' psql -v ON_ERROR_STOP=1 -U '$DB_USER' -d '$DB_NAME'" < "$SQL_FILE"

echo ">> binding $API_ROLE to the password in pg_api_uri"
printf "ALTER ROLE %s PASSWORD '%s';\n" "$API_ROLE" "$API_PASSWORD" \
  | ssh "$DESTINATION" "podman exec -i '$DB_CONTAINER' psql -v ON_ERROR_STOP=1 -U '$DB_USER' -d '$DB_NAME'"

echo ""
echo ">> frontend write token (store in .env.local as VUE_APP_PGRST_JWT):"
read_secret pg_jwt_secret | node "$MINT_SCRIPT"
echo ""
echo ">> done. Run ./deploy.sh so the app bundle contains the token."
