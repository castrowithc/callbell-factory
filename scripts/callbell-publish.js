#!/usr/bin/env node
'use strict';

// Fabrik-Publish: regeneriert die Vorlagen und pusht jede in ihr eigenes Distributions-Repo.
// Orchestriert nur — die Bausteine bleiben single-source:
//   1. callbell-sync.js   verteilt sync/ in die Vorlagen-Ordner (mirror/seed, kein Prune)
//   2. callbell-verify.js  Guard: bricht bei FEHLT/STALE ab -> KEIN Push (Exit-Code als Wahrheit)
//   3. je Vorlage: git add/commit/push in deren eigenem Repo (Ordner = nested Git-Repo)
//
// Bootstrap-tolerant (Remote kommt spaeter):
//   kein .git          -> uebersprungen, Hinweis "Bootstrap ausstehend"
//   .git ohne Remote   -> lokal committet, Push uebersprungen
//   .git mit Remote    -> committet + gepusht
// Aufraeumen von STALE laeuft kontrolliert ueber /callbell-template-review (mit Freigabe).

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'callbell.map.json'), 'utf8'));

// Kind-Node-Script mit durchgereichtem stdout/stderr; wirft bei Exit-Code != 0.
function runNode(script) {
  execFileSync(process.execPath, [path.join(ROOT, 'scripts', script)], {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

// git im angegebenen Verzeichnis; trimmt stdout, wirft bei Fehler (ausser wenn allowFail).
function git(cwd, args, allowFail = false) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  } catch (e) {
    if (allowFail) return null;
    throw e;
  }
}

// --- 1. Sync -----------------------------------------------------------------
console.log('== Sync ==');
try {
  runNode('callbell-sync.js');
} catch {
  console.error('\nPublish abgebrochen: Sync ist fehlgeschlagen (siehe oben).');
  process.exit(1);
}

// --- 2. Verify-Guard ---------------------------------------------------------
console.log('\n== Verify (Guard) ==');
try {
  runNode('callbell-verify.js');
} catch {
  console.error('\nPublish abgebrochen: Vorlagen weichen von der Map ab (FEHLT/STALE).');
  console.error('Raeume kontrolliert auf mit  /callbell-template-review  und publishe danach erneut.');
  process.exit(1);
}

// --- 3. Publish je Vorlage ---------------------------------------------------
const factoryHash = git(ROOT, ['rev-parse', '--short', 'HEAD'], true) || 'unknown';
const stamp = new Date().toISOString();
const message = `sync ${factoryHash} ${stamp}`;

console.log('\n== Publish ==');
let pushed = 0, committed = 0, skipped = 0, unchanged = 0;

for (const template of map.templates) {
  const dir = path.join(ROOT, template);

  if (!fs.existsSync(path.join(dir, '.git'))) {
    console.log(`  - ${template}: uebersprungen (kein eigenes Repo — Bootstrap ausstehend: git init + remote)`);
    skipped++;
    continue;
  }

  git(dir, ['add', '-A']);
  const dirty = git(dir, ['status', '--porcelain']);
  const hasRemote = !!git(dir, ['remote'], true);

  if (!dirty) {
    // Nichts Neues aus dem Sync -> kein Leer-Commit. Trotzdem ggf. ausstehende Commits pushen.
    if (hasRemote) {
      git(dir, ['push']);
      console.log(`  ✓ ${template}: nichts zu committen, ausstehende Commits gepusht`);
    } else {
      console.log(`  - ${template}: nichts zu publishen`);
    }
    unchanged++;
    continue;
  }

  git(dir, ['commit', '-m', message]);
  if (hasRemote) {
    git(dir, ['push']);
    console.log(`  ✓ ${template}: committet + gepusht (${message})`);
    pushed++;
  } else {
    console.log(`  ✓ ${template}: lokal committet, Push uebersprungen (kein Remote) (${message})`);
    committed++;
  }
}

console.log(`\nFertig. ${pushed} gepusht, ${committed} lokal committet, ${unchanged} unveraendert, ${skipped} uebersprungen.`);
if (skipped || committed) {
  console.log('Hinweis: fuer noch nicht angebundene Vorlagen Remote setzen (git init/-remote) und erneut publishen.');
}
