#!/usr/bin/env node
'use strict';

// Fabrik-Publish: regeneriert die Vorlagen UND das Plugin und pusht jedes in sein eigenes Repo.
// Orchestriert nur — die Bausteine bleiben single-source:
//   1. callbell-sync.js         verteilt sync/ in die Vorlagen (mirror/seed, kein Prune)
//   2. callbell-plugin-sync.js  baut callbell-plugin/ (Version aus VERSION, hier je Publish gebumpt)
//   3. callbell-verify.js + callbell-plugin-verify.js  Guards: brechen bei Abweichung ab -> KEIN Push
//   4. je Ziel (Vorlagen + Plugin): git add/commit/push in dessen eigenem Repo (Ordner = nested Git-Repo)
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
const pluginMap = JSON.parse(fs.readFileSync(path.join(ROOT, 'callbell-plugin.map.json'), 'utf8'));

// Kind-Node-Script mit durchgereichtem stdout/stderr; wirft bei Exit-Code != 0.
function runNode(script, args = []) {
  execFileSync(process.execPath, [path.join(ROOT, 'scripts', script), ...args], {
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

// Patch-Bump der VERSION-Datei (single source der Plugin-Version). Fehlt sie, starte bei 0.1.0.
function bumpVersion() {
  const vf = path.join(ROOT, 'VERSION');
  const cur = fs.existsSync(vf) ? fs.readFileSync(vf, 'utf8').trim() : '0.1.0';
  const m = cur.match(/^(\d+)\.(\d+)\.(\d+)$/);
  const next = m ? `${m[1]}.${m[2]}.${Number(m[3]) + 1}` : '0.1.0';
  fs.writeFileSync(vf, next + '\n');
  return next;
}

// --- 1. Sync (Vorlagen + Plugin) --------------------------------------------
console.log('== Sync ==');
try {
  runNode('callbell-sync.js');
  const version = bumpVersion();
  runNode('callbell-plugin-sync.js', [version]);
} catch {
  console.error('\nPublish abgebrochen: Sync ist fehlgeschlagen (siehe oben).');
  process.exit(1);
}

// --- 2. Verify-Guards --------------------------------------------------------
console.log('\n== Verify (Guard) ==');
try {
  runNode('callbell-verify.js');
  runNode('callbell-plugin-verify.js');
} catch {
  console.error('\nPublish abgebrochen: Vorlagen oder Plugin weichen von der Map ab (FEHLT/STALE).');
  console.error('Raeume kontrolliert auf mit  /callbell-template-review  und publishe danach erneut.');
  process.exit(1);
}

// --- 3. Publish je Ziel ------------------------------------------------------
const factoryHash = git(ROOT, ['rev-parse', '--short', 'HEAD'], true) || 'unknown';
const stamp = new Date().toISOString();
const message = `sync ${factoryHash} ${stamp}`;

const tally = { pushed: 0, committed: 0, skipped: 0, unchanged: 0 };

// Push, der beim ersten Mal das Upstream setzt (frisches Repo: Remote da, aber main ohne Upstream).
function pushRepo(dir) {
  const hasUpstream = git(dir, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], true);
  if (hasUpstream) {
    git(dir, ['push']);
  } else {
    const branch = git(dir, ['rev-parse', '--abbrev-ref', 'HEAD']);
    git(dir, ['push', '-u', 'origin', branch]);
  }
}

// Ein Ziel-Repo publishen (Vorlage oder Plugin), bootstrap-tolerant.
function publishRepo(label, dir) {
  if (!fs.existsSync(path.join(dir, '.git'))) {
    console.log(`  - ${label}: uebersprungen (kein eigenes Repo — Bootstrap ausstehend: git init + remote)`);
    tally.skipped++;
    return;
  }

  git(dir, ['add', '-A']);
  const dirty = git(dir, ['status', '--porcelain']);
  const hasRemote = !!git(dir, ['remote'], true);

  if (!dirty) {
    // Nichts Neues aus dem Sync -> kein Leer-Commit. Trotzdem ggf. ausstehende Commits pushen.
    if (hasRemote) {
      pushRepo(dir);
      console.log(`  ✓ ${label}: nichts zu committen, ausstehende Commits gepusht`);
    } else {
      console.log(`  - ${label}: nichts zu publishen`);
    }
    tally.unchanged++;
    return;
  }

  git(dir, ['commit', '-m', message]);
  if (hasRemote) {
    pushRepo(dir);
    console.log(`  ✓ ${label}: committet + gepusht (${message})`);
    tally.pushed++;
  } else {
    console.log(`  ✓ ${label}: lokal committet, Push uebersprungen (kein Remote) (${message})`);
    tally.committed++;
  }
}

console.log('\n== Publish ==');
for (const template of map.templates) publishRepo(template, path.join(ROOT, template));
publishRepo(pluginMap.output, path.join(ROOT, pluginMap.output));

console.log(`\nFertig. ${tally.pushed} gepusht, ${tally.committed} lokal committet, ${tally.unchanged} unveraendert, ${tally.skipped} uebersprungen.`);
if (tally.skipped || tally.committed) {
  console.log('Hinweis: fuer noch nicht angebundene Ziele Remote setzen (git init/-remote) und erneut publishen.');
}
