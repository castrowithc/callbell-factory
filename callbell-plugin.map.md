---
description: >
  Plugin channel mechanics in human-readable form. The two-format truth twin of callbell-plugin.map.json:
  a change on one side is always pulled through to the other.
type: meta
edit: locked
---

# Plugin Channel Mechanics

`callbell-plugin.map.json` and this document are **both truth, the same mechanics in two formats**. The
`.json` is machine-readable (read by `scripts/callbell-plugin-sync.js`); this `.md` states the goal so the
agent can check its work. Every change to one is reconciled into the other.

The plugin is the factory's **single generated output**, assembled from the `sync/` truth.

## One output, flat gather

`output: callbell-plugin` is the single target. The sources are all direct `from -> to`, resolved by the
shared `scripts/map-resolve.js` (a `to`-source is echoed unchanged), so no kind fan-out applies.

### Skills (flat, across sync scopes)
- `sync/all/skills/` -> `skills/` — the domain-adaptive family plus `callbell-import`, `callbell-worktree`,
  and `callbell-plan`.
- `sync/devcore/skills/callbell-gain/` -> `skills/callbell-gain/` — the code-only skill.
- `sync/opscore/skills/callbell-filing/` -> `skills/callbell-filing/` — the ops-only skill.

All eleven skills land in one flat `skills/`; the lens (`PROJECT TYPE`, emitted by the hook) decides code vs
ops at runtime.

### Always-on payload (for ambient mode)
- `sync/all/hooks/callbell-context.js` -> `hooks/callbell-context.js` — the context and lens hook.
- `sync/plugin/hooks/callbell-hooks.json` -> `hooks/callbell-hooks.json` — the hook map (passes no `--rules`).
- `sync/all/rules/` + `sync/opscore/rules/` -> `rules/` — every norm file, bundled flat. The hook injects
  them from `${CLAUDE_PLUGIN_ROOT}/rules/` when a folder carries none of its own (ambient mode).
- `sync/all/roots/AGENTS.md` -> `AGENTS.md` — the ruleset.

### Host plumbing
- `sync/plugin/claude/plugin.json` -> `.claude-plugin/plugin.json`
- `sync/plugin/claude/marketplace.json` -> `.claude-plugin/marketplace.json`
- `sync/plugin/codex/plugin.json` -> `.codex-plugin/plugin.json`
- `sync/plugin/codex/marketplace.json` -> `.agents/plugins/marketplace.json`

### Onboarding scaffold (project state, for ambient -> project)
The plugin bundles the **project scaffold** inside the onboarding skill, at
`skills/callbell-onboarding/scaffold/`, so `callbell-onboarding` can materialize a real project into a bare
folder (ambient mode) from `${CLAUDE_PLUGIN_ROOT}`. It carries **only project state**, never a second copy
of the rules, skills, hook, or ruleset: those are device-global and the hook injects them (project-local
wins, so nothing double-loads). Each entry is a direct route from the **existing** sync source (single
source, no duplication), gathered under the skill:
- `sync/all/context/` + `sync/all/memory/` + `sync/all/templates/` -> `scaffold/__callbell__/{context,memory,templates}/`.
- `sync/all/zones/backlog/BACKLOG.md` + `sync/all/zones/zone-import/.gitkeep` + `sync/all/zones/zone-export/.gitkeep` -> `scaffold/__callbell__/{backlog,zone-import,zone-export}/`.
- `sync/all/callbell-readme.md` -> `scaffold/__callbell__/README.md` (the layer's structural header, the single source the onboarding deep-dive reads from).
- `sync/all/gitignore` -> `scaffold/gitignore` (no dot in the bundle, so it is inert there; the skill lays
  it down as `.gitignore`).
- Lens extras under `scaffold/_lens/`, placed by the skill per the lens: `sync/opscore/framework.md` and
  `sync/opscore/templates/` -> `_lens/ops/` (ops root `framework.md` + customer scaffolds);
  `sync/devcore/docs/framework.md` -> `_lens/code/docs/` (code docs framework).

## Version stamp

`version_stamp` lists the two manifests. `callbell-plugin-sync.js` stamps their `version` field with the
version from its argument, else the factory `VERSION` file, else it leaves the manifest value untouched (the
value is replaced in place, formatting preserved). `callbell-publish.js` bumps `VERSION` (patch) on every
publish so `/plugin marketplace update` and `codex plugin marketplace upgrade` actually pull the change.

## Lens extras

`_lens/` under the onboarding scaffold carries what differs by lens. The sync folders `devcore/` and
`opscore/` are scope names inside `sync/`, not products: their content reaches the user only through the
scaffold the onboarding skill lays down.

## Not in the plugin as active state

The plugin root carries no live project state: no top-level `__callbell__/`, no zones, no root `framework.md`.
A plugin is device-global, not a project. The one exception is the
**dormant** copy under `skills/callbell-onboarding/scaffold/` (above): it is not read as plugin state, it is
the source `callbell-onboarding` materializes into a folder when a user turns ambient mode into a real
project.

## Publish

`callbell-publish.js` runs the channel end to end: bump `VERSION`, sync, verify (guard), then commit/push
the plugin repo (`callbell-plugin/`, its own remote). Bootstrap-tolerant: no `.git` -> skipped; `.git`
without a remote -> local commit only.
