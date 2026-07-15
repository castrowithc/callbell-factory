'use strict';

// Loest eine Map-Source (from + kind|to + optional templates) fuer ein konkretes
// Template in flache Kopier-Ops { from, to } auf — Pfade relativ zu ROOT (from)
// bzw. zum Template-Root (to). Einzige Wahrheit fuer callbell-sync.js UND
// callbell-verify.js, damit erwartete Ziele nie zwischen beiden driften.
//
// Aufloesung pro Source:
//   - templates-Filter: fehlt er, gilt die Source fuer alle Templates.
//   - `to`           -> genau ein Op (Singleton: Roots-Adapter, framework.md, harness-Dateien).
//   - `kind`         -> Ziele aus kinds[kind]:
//       spread:"root"           -> ein Op ins Template-Root (to: '').
//       targets:{ label: dir }  -> ein Op je Ziel-Ordner (z. B. skills -> .claude/skills/ UND .agents/skills/).

function resolveOps(source, template, kinds) {
  if (source.templates && !source.templates.includes(template)) return [];

  if (source.to) return [{ from: source.from, to: source.to }];

  const kind = kinds[source.kind];
  if (!kind) throw new Error(`Unbekannter kind "${source.kind}" fuer Source ${source.from}`);

  if (kind.spread === 'root') return [{ from: source.from, to: '' }];

  return Object.values(kind.targets).map(dir => ({ from: source.from, to: dir }));
}

module.exports = { resolveOps };
