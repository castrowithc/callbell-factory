#!/usr/bin/env node
'use strict';

// Fabrik-Sync: verteilt zentrale Inhalte aus sync/ in die Projektvorlagen
// gemaess callbell.map.json (die einzige maschinelle Wahrheit).
//   mirror = immer ueberschreiben (Fabrik-kontrolliert)
//   seed   = nur anlegen wenn Ziel fehlt (schuetzt Nutzer-Inhalte)
// Kein Prune: veraltete Dateien im Ziel werden nicht geloescht.
// callbell: wenn stale-Cleanup noetig wird, hier ein Manifest fuehren.

const fs = require('fs');
const path = require('path');
const { resolveOps } = require('./map-resolve');

const ROOT = path.resolve(__dirname, '..');
const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'callbell.map.json'), 'utf8'));

let hadError = false;

function copyRecursive(src, dest, mode, stats) {
  if (fs.statSync(src).isDirectory()) {
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name), mode, stats);
    }
  } else {
    if (mode === 'seed' && fs.existsSync(dest)) { stats.guarded++; return; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    if (mode === 'seed') stats.seeded++; else stats.copied++;
  }
}

for (const template of map.templates) {
  const targetRoot = path.join(ROOT, template);
  const stats = { copied: 0, seeded: 0, guarded: 0 };

  for (const source of map.sources) {
    // resolveOps wendet den Template-Filter an und faechert kind -> Ziel(e) auf.
    const ops = resolveOps(source, template, map.kinds);
    if (!ops.length) continue;
    const src = path.join(ROOT, source.from);
    if (!fs.existsSync(src)) {
      // Bei korrekter Map muss jede Quelle existieren -> lauter Fehler, kein stiller Skip.
      console.error(`  ✗ FEHLER: Quelle fehlt: ${source.from} — Map und sync/ sind nicht synchron.`);
      hadError = true;
      continue;
    }
    const mode = source.mode || 'mirror';
    for (const op of ops) copyRecursive(src, path.join(targetRoot, op.to), mode, stats);
  }

  const total = stats.copied + stats.seeded + stats.guarded;
  const mark = total === 0 ? '✗' : '✓';
  const warn = total === 0 ? '  (nichts synchronisiert!)' : '';
  console.log(`${mark} ${template}: ${stats.copied} kopiert, ${stats.seeded} geseedet, ${stats.guarded} geschuetzt${warn}`);
}

if (hadError) {
  console.error('\nSync mit FEHLERN beendet — siehe oben.');
  process.exit(1);
}
console.log('\nFertig.');
