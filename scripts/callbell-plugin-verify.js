#!/usr/bin/env node
'use strict';

// Plugin-Verify: prueft das assemblierte callbell-plugin/ auf Vollstaendigkeit vor dem Publish.
// Reiner Report; Exit-Code 1 bei Fehlend. Gegenstueck zu callbell-verify.js fuer den Plugin-Kanal.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'callbell-plugin.map.json'), 'utf8'));
const out = path.join(ROOT, map.output);

const must = [
  '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json',
  '.codex-plugin/plugin.json', '.agents/plugins/marketplace.json',
  'hooks/callbell-hooks.json', 'hooks/callbell-context.js', 'AGENTS.md',
];
const missing = must.filter(p => !fs.existsSync(path.join(out, p)));

// rules/ braucht Inhalt, und die Kern- plus domain-unique Skills muessen vorhanden sein.
function hasMd(dir) { try { return fs.readdirSync(dir).some(n => n.endsWith('.md')); } catch { return false; } }
if (!hasMd(path.join(out, 'rules'))) missing.push('rules/*.md');
for (const s of ['callbell', 'callbell-gain', 'callbell-filing']) {
  if (!fs.existsSync(path.join(out, 'skills', s, 'SKILL.md'))) missing.push(`skills/${s}/SKILL.md`);
}

if (missing.length) {
  console.error('✗ Plugin-Verify: fehlend:\n  ' + missing.join('\n  '));
  process.exit(1);
}
console.log('✓ Plugin-Verify: callbell-plugin/ vollstaendig.');
