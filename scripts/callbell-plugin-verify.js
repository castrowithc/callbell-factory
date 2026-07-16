#!/usr/bin/env node
'use strict';

// Plugin-Verify: prueft das assemblierte callbell-plugin/ gegen callbell-plugin.map.json.
// Reiner Report — loescht NICHTS (Gegenstueck zu callbell-plugin-sync.js, das kein Prune macht).
//
//   FEHLT  = Datei laut Map erwartet, aber im Plugin nicht vorhanden.
//   STALE  = Datei im Plugin, die keine Map-Quelle erzeugt -> verwaist (Kandidat zum Loeschen).
//            Tritt auf, wenn eine Quelle aus sync/ geloescht wurde: der Sync raeumt nicht auf.
//
// Das Plugin-Repo enthaelt ausschliesslich Sync-Output (keine eigenen Repo-Dateien), darum
// ist jede unerwartete Datei stale. Exit-Code 1 bei FEHLT oder STALE (Guard vor dem Publish).

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'callbell-plugin.map.json'), 'utf8'));
const out = path.join(ROOT, map.output);

const SKIP_DIRS = new Set(['.git', 'node_modules']);
const norm = p => p.replace(/[\\/]+$/, ''); // trailing Slash weg

// Alle Datei-Relpfade unter dir (posix-normalisiert, relativ zu base).
function walk(dir, base = dir) {
  let list = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return list; }
  for (const e of entries) {
    if (e.isDirectory() && SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) list = list.concat(walk(full, base));
    else list.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return list;
}

const expected = new Set();
let mapError = false;

for (const source of map.sources) {
  const fromAbs = path.join(ROOT, source.from);
  if (!fs.existsSync(fromAbs)) {
    console.error(`  ! Map-Quelle fehlt: ${source.from}`);
    mapError = true;
    continue;
  }
  const toRel = norm(source.to);
  if (fs.statSync(fromAbs).isDirectory()) {
    const prefix = toRel ? `${toRel}/` : '';
    for (const rel of walk(fromAbs)) expected.add(`${prefix}${rel}`);
  } else {
    expected.add(toRel); // Datei-Quelle: `to` ist bereits der volle Zielpfad
  }
}

const actual = new Set(walk(out));
const missing = [...expected].filter(f => !actual.has(f)).sort();
const stale = [...actual].filter(f => !expected.has(f)).sort();

// Die Version muss in den gestempelten Manifesten stehen, sonst zieht der Nutzer kein Update.
const version = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
const unstamped = (map.version_stamp || []).filter(rel => {
  try { return JSON.parse(fs.readFileSync(path.join(out, rel), 'utf8')).version !== version; }
  catch { return true; }
});

missing.forEach(f => console.log(`  FEHLT:  ${f}`));
stale.forEach(f => console.log(`  STALE:  ${f}`));
unstamped.forEach(f => console.log(`  VERSION: ${f} != ${version}`));

if (missing.length || stale.length || unstamped.length || mapError) {
  console.error(`\n✗ Plugin-Verify: Abweichungen — siehe oben.`);
  process.exit(1);
}
console.log(`✓ Plugin-Verify: callbell-plugin/ konsistent mit callbell-plugin.map.json (${expected.size} Dateien, v${version}).`);
