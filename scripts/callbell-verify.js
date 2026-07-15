#!/usr/bin/env node
'use strict';

// Fabrik-Verify: prueft jede Projektvorlage gegen callbell.map.json.
// Reiner Report — loescht NICHTS (Gegenstueck zu callbell-sync.js, das kein Prune macht).
//
//   FEHLT  = Datei laut Map erwartet, aber in der Vorlage nicht vorhanden.
//   STALE  = Datei in der Vorlage, die keine Map-Quelle erzeugt und ausserhalb der
//            seed-Ziele liegt -> verwaist (Kandidat zum Loeschen).
//   seed+  = Zusatzdatei in einem seed-Ziel (bewusster User-Content) -> nur Info.
//
// Exit-Code 1 bei FEHLT oder STALE (nutzbar als CI-/Pre-Commit-Guard), sonst 0.

const fs = require('fs');
const path = require('path');
const { resolveOps } = require('./map-resolve');

const ROOT = path.resolve(__dirname, '..');
const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'callbell.map.json'), 'utf8'));

// AGENTS.md/CLAUDE.md kommen aus sync/all/roots/ und sind map-verwaltet (kind: roots, spread: root).
const BASE_FILES = new Set();
const SKIP_DIRS = new Set(['.git', 'node_modules']);

// Alle Datei-Relpfade unter dir (posix-normalisiert, relativ zu base).
function walk(dir, base = dir) {
  let out = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    if (e.isDirectory() && SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(full, base));
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

const norm = p => p.replace(/[\\/]+$/, ''); // trailing Slash weg

let failures = 0;

for (const template of map.templates) {
  const tRoot = path.join(ROOT, template);
  const expected = new Set();
  const seedPrefixes = [];
  let mapError = false;

  for (const source of map.sources) {
    // Dieselbe Aufloesung wie im Sync (Template-Filter + kind -> Ziel(e)), damit `expected` deckungsgleich ist.
    const ops = resolveOps(source, template, map.kinds);
    if (!ops.length) continue;
    const fromAbs = path.join(ROOT, source.from);
    if (!fs.existsSync(fromAbs)) {
      console.error(`  ! Map-Quelle fehlt: ${source.from}`);
      mapError = true;
      continue;
    }
    const isDir = fs.statSync(fromAbs).isDirectory();
    for (const op of ops) {
      const toRel = norm(op.to);
      const prefix = toRel ? `${toRel}/` : ''; // spread:"root" -> to '' -> kein fuehrender Slash
      if (isDir) {
        for (const rel of walk(fromAbs)) expected.add(`${prefix}${rel}`);
      } else {
        expected.add(toRel); // Datei-Quelle: `to` ist bereits der volle Zielpfad
      }
      if ((source.mode || 'mirror') === 'seed') seedPrefixes.push(prefix);
    }
  }

  const actual = new Set(walk(tRoot));
  const missing = [...expected].filter(f => !actual.has(f)).sort();
  const stale = [];
  const seedExtra = [];

  for (const rel of [...actual].sort()) {
    if (BASE_FILES.has(rel) || expected.has(rel)) continue;
    if (seedPrefixes.some(p => rel.startsWith(p))) seedExtra.push(rel);
    else stale.push(rel);
  }

  console.log(`\n== ${template} ==`);
  if (!missing.length && !stale.length && !mapError) {
    console.log(`  OK (${expected.size} erwartet, ${seedExtra.length} seed-Zusatz)`);
  }
  missing.forEach(f => console.log(`  FEHLT:  ${f}`));
  stale.forEach(f => console.log(`  STALE:  ${f}`));
  seedExtra.forEach(f => console.log(`  seed+:  ${f}   (User-Content, ignoriert)`));

  if (missing.length || stale.length || mapError) failures++;
}

if (failures) {
  console.error(`\nVerify: ${failures} Vorlage(n) mit Abweichungen — siehe FEHLT/STALE oben.`);
  process.exit(1);
}
console.log('\nVerify: alle Vorlagen konsistent mit callbell.map.json.');
