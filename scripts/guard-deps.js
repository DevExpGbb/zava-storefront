#!/usr/bin/env node
/**
 * Preinstall guard — prevents `zava-storefront/` from accidentally pulling in
 * the deliberately-vulnerable packages that live (intentionally) under
 * `zava-storefront/security-fixtures/`.
 *
 * Track 3 trains the auditor Skill against `security-fixtures/`. If a
 * trainee runs the recommended bumps from the wrong cwd, those vulnerable
 * deps could end up in the real app's `package.json`. This script blocks
 * that path explicitly.
 *
 * Banned in `zava-storefront/package.json` (the app):
 *   - lodash           (use lodash-es or scoped utilities)
 *   - axios <  1       (CVE backlog)
 *   - minimist < 1.2.6 (prototype pollution)
 *
 * These are still allowed under `zava-storefront/security-fixtures/` — that's
 * the audit target.
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const pkgPath = join(__dirname, '..', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const banned = [
  { name: 'lodash', reason: 'Use lodash-es or specific utilities. lodash@4.x is the workshop fixture target.' },
  { name: 'axios', semverFloor: 1, reason: 'axios <1 has known CVE backlog (workshop fixture target).' },
  { name: 'minimist', semverFloor: 1, reason: 'minimist <1.2.6 prototype pollution (CVE-2021-44906).' },
];

const violations = [];
for (const dep of banned) {
  for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    const range = pkg[section]?.[dep.name];
    if (!range) continue;
    if (!dep.semverFloor) {
      violations.push(`  • ${section}.${dep.name}@${range} — ${dep.reason}`);
      continue;
    }
    const major = parseInt(String(range).replace(/[^\d.]/g, '').split('.')[0], 10);
    if (Number.isFinite(major) && major < dep.semverFloor) {
      violations.push(`  • ${section}.${dep.name}@${range} — ${dep.reason}`);
    }
  }
}

if (violations.length) {
  console.error('\n✋ zava-storefront preinstall guard tripped:\n');
  console.error(violations.join('\n'));
  console.error('\nIf you meant to install/upgrade in the audit fixture, use:');
  console.error('    npm install --prefix zava-storefront/security-fixtures <pkg>@<version>');
  console.error('Aborting install.\n');
  process.exit(1);
}
