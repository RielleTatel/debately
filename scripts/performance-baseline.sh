#!/usr/bin/env bash
set -euo pipefail
task_revision="$(git rev-parse "${1:-96bdd7e}^{commit}")"
task_root="$(pwd)"
task_archive="$(mktemp -d "${TMPDIR:-/tmp}/debately-baseline.XXXXXX")"
git archive "$task_revision" | tar -x -C "$task_archive"
ln -s "$task_root/node_modules" "$task_archive/node_modules"
python3 - "$task_root" "$task_archive" <<'PY'
import sys, shutil, re
from pathlib import Path
source, baseline = map(Path, sys.argv[1:])
for part in ['site', 'fixtures']:
    shutil.copytree(source/'test/browser'/part, baseline/'test/browser'/part,
                    ignore=shutil.ignore_patterns('.next', '*.tsbuildinfo'))
for wrapper in (baseline/'test/browser/site/app').rglob('*.tsx'):
    match = re.search(r"from '@/app/([^']+)'", wrapper.read_text())
    if match and not (baseline/'app'/match[1]).with_suffix('.tsx').exists():
        wrapper.unlink()
PY
echo "$task_archive"
