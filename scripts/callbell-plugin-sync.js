#!/usr/bin/env node
'use strict';

// Plugin-Channel-Sync: baut das callbell-Plugin nach callbell-plugin/ aus derselben sync/-Wahrheit
// wie die Vorlagen, gemaess callbell-plugin.map.json. Sammelt die vereinheitlichten Skills ueber alle
// Template-Scopes in ein flaches skills/, buendelt Hook, Regeln und Ruleset, legt die Host-Manifeste
// und Marketplace-Kataloge ab und stempelt die Version in beide Manifeste.
//   mirror only, kein Prune (wie callbell-sync.js).
//
// Aufruf: node scripts/callbell-plugin-sync.js [version]
//   version: optional semver; sonst die VERSION-Datei; sonst bleibt der Manifest-Wert.

const fs = require('fs');
const path = require('path');
const { resolveOps } = require('./map-resolve');

const ROOT = path.resolve(__dirname, '..');
const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'callbell-plugin.map.json'), 'utf8'));
const outRoot = path.join(ROOT, map.output);

let hadError = false;
const stats = { copied: 0 };

function copyRecursive(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    for (const name of fs.readdirSync(src)) copyRecursive(path.join(src, name), path.join(dest, name));
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    stats.copied++;
  }
}

for (const source of map.sources) {
  // resolveOps echot eine `to`-Source unveraendert (im Plugin-Kanal kein kind/Template).
  const ops = resolveOps(source, map.output, {});
  const src = path.join(ROOT, source.from);
  if (!fs.existsSync(src)) {
    console.error(`  ✗ FEHLER: Quelle fehlt: ${source.from} — Map und sync/ sind nicht synchron.`);
    hadError = true;
    continue;
  }
  for (const op of ops) copyRecursive(src, path.join(outRoot, op.to));
}

// Version stempeln (formatschonend: nur den Wert ersetzen, nicht das JSON umformatieren).
function resolveVersion() {
  const arg = process.argv[2];
  if (arg) return arg.trim();
  const vf = path.join(ROOT, 'VERSION');
  if (fs.existsSync(vf)) return fs.readFileSync(vf, 'utf8').trim();
  return null;
}
const version = resolveVersion();
if (version) {
  for (const rel of (map.version_stamp || [])) {
    const file = path.join(outRoot, rel);
    const text = fs.readFileSync(file, 'utf8').replace(/("version":\s*")[^"]*(")/, `$1${version}$2`);
    fs.writeFileSync(file, text);
  }
}

const mark = hadError ? '✗' : '✓';
console.log(`${mark} ${map.output}: ${stats.copied} kopiert${version ? `, version ${version}` : ''}`);
if (hadError) { console.error('\nPlugin-Sync mit FEHLERN beendet.'); process.exit(1); }
console.log('\nFertig.');
