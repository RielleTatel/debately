#!/usr/bin/env bash
# An isolated local fixture database. Never reads the application's .env files.
set -euo pipefail
task_pg_data="/tmp/debately-performance-pg"
task_pg_log="/tmp/debately-performance-pg.log"
task_db_url="postgresql://$(id -un)@127.0.0.1:55432/debately_performance_test"
for command in initdb pg_ctl createdb psql; do
  command -v "$command" >/dev/null || { echo "Install PostgreSQL and add its bin directory to PATH." >&2; exit 1; }
done
if [[ "${1:-start}" == "stop" ]]; then
  pg_ctl -D "$task_pg_data" stop
  exit
fi
if [[ ! -f "$task_pg_data/PG_VERSION" ]]; then
  initdb -D "$task_pg_data" -A trust --no-locale -E UTF8 >/dev/null
fi
if ! pg_ctl -D "$task_pg_data" status >/dev/null 2>&1; then
  pg_ctl -D "$task_pg_data" -l "$task_pg_log" -o '-h 127.0.0.1 -p 55432' start
fi
if [[ "$(psql -h 127.0.0.1 -p 55432 -d postgres -Atc "SELECT COUNT(*) FROM pg_database WHERE datname = 'debately_performance_test'")" == "0" ]]; then
  createdb -h 127.0.0.1 -p 55432 debately_performance_test
fi
DATABASE_URL="$task_db_url" DIRECT_URL="$task_db_url" node node_modules/prisma/build/index.js db push --skip-generate
echo 'Fixture database ready. Run npm run test:routes or npm run test:integration.'
