---
description: >
  Sync mechanics of the factory in human-readable form. An equal-rank two-format truth with callbell.map.json (machine-readable): a change on one side is always pulled through to the other.
type: meta
edit: locked
---

# Sync Mechanics
**Only the user may change this. Hints from the agent are welcome when changes are needed.**

The `sync` folder holds everything that is meant to be distributed into the project templates (via `scripts/callbell-sync.js`).

`callbell.map.json` and this document are **both truth, the same mechanics in two formats**: the `.json` is machine-readable (the sync script reads it), this `.md` is human-readable and states the goal (the agent checks its work against it). Neither side is subordinate to the other; every change to one requires reconciling the other, otherwise they drift apart.

Folders missing in the target are created. `mirror` (default) = overwrite, `seed` = create only when the target is missing (protects user content). No prune.

The template outputs (`callbell-devcore/`, `callbell-opscore/`) are **pristine templates**, not live projects: empty scaffolds, generated entirely from `sync/`. That is why **everything** runs on `mirror`, so that scaffold improvements (context, memory, framework, docs) also land reliably in the output. Protecting filled user content happens at the end user, in their copied repo (via git), not in this sync, which runs only in the factory. `seed` stays available as a mode in case a target file should ever be left untouched on purpose.

## Two axes: template scope × harness
The factory distributes across **N templates × M harnesses**. The two axes are separate:

- **The folder under `sync/` sets the template scope.** `sync/all/` = both templates. `sync/devcore/` = only `callbell-devcore`, `sync/opscore/` = only `callbell-opscore` (additionally filtered via the `templates` field on the source entry). `sync/harness/` = the only harness-specific level (adapter files). `sync/devcore/` is created only once the first devcore-specific file exists (no empty folders).
- **The harness targets sit once in the `kinds` table**, not repeated per entry. A `skills` source lands automatically in `.claude/skills/` (Claude) **and** `.agents/skills/` (Codex); a `hooks` source in `.claude/hooks/` **and** `.codex/hooks/`. When a harness is added, only the `kinds` row is extended, not every source.

## Map schema v2
A source entry declares **`from` + (`kind` | `to`) + optional `templates`**. `mode` is optional (default `mirror`). The resolution `source → target paths` lives in `scripts/map-resolve.js` and is shared by sync **and** verify (one truth, no drift).

- **`kind`** → content artifact. The target folders (and thus the harness fan-outs) sit in `kinds[<kind>]`.
- **`to`** → singleton with a direct target path (roots adapter, `framework.md`, the `harness/` files).
- **Rule:** content → `kind`; harness-specific singletons + roots → direct `to`.

### Kinds
| kind | Target(s) in the template | Harness |
|---|---|---|
| `roots` | Template root directly (`spread: "root"`) | both (native file) |
| `rules` | `.claude/rules/` | Claude natively; Codex via hook (`--rules`) from the same source |
| `context` | `__callbell__/context/` | both (injected via hook) |
| `memory` | `__callbell__/memory/` | both (index injected via hook) |
| `templates` | `__callbell__/templates/` | both (on demand) |
| `skills` | `.claude/skills/` **and** `.agents/skills/` | Claude **and** Codex |
| `hooks` | `.claude/hooks/` **and** `.codex/hooks/` | Claude **and** Codex |

### Sources
Shared (`sync/all/`, both templates):
- `sync/all/roots/` — `AGENTS.md`, `CLAUDE.md`, `LICENSE` → template root (kind `roots`)
- `sync/all/rules/` — the shared rules → `.claude/rules/` (kind `rules`)
- `sync/all/context/` → `__callbell__/context/` (kind `context`)
- `sync/all/memory/` → `__callbell__/memory/` (kind `memory`)
- `sync/all/templates/` — shared scaffolds (epic/story/task) → `__callbell__/templates/` (kind `templates`)
- `sync/all/skills/` — the domain-adaptive skill family (`callbell`, `callbell-review`, `callbell-audit`, `callbell-debt`, `callbell-help`, `callbell-onboarding`) plus `callbell-import` and `callbell-worktree` → `.claude/skills/` + `.agents/skills/` (kind `skills`)
- `sync/all/hooks/` — `callbell-context.js` → `.claude/hooks/` + `.codex/hooks/` (kind `hooks`)
- `sync/all/zones/_backlog/BACKLOG.md` → `__callbell__/_backlog/BACKLOG.md` (direct `to`, backlog index; loaded via hook)
- `sync/all/zones/_import/.gitkeep` → `__callbell__/_import/.gitkeep` (direct `to`, keeps the volatile raw zone ready)
- `sync/all/gitignore` → `.gitignore` (direct `to`, ignores `__callbell__/_import/` content, keeps the folder)

Only `callbell-devcore` (`templates: ["callbell-devcore"]`):
- `sync/devcore/skills/` — `callbell-gain`, the domain-unique code skill (kind `skills`)
- `sync/devcore/docs/` → `__callbell__/docs/` (direct `to`, the template's docs root)

Only `callbell-opscore` (`templates: ["callbell-opscore"]`):
- `sync/opscore/skills/` — `callbell-filing`, the domain-unique ops skill (kind `skills`)
- `sync/opscore/rules/` — `callbell-structure` (kind `rules`)
- `sync/opscore/templates/` — ops scaffolds (customer patterns) → `__callbell__/templates/` (kind `templates`; mixes with the shared scaffolds in the same target)
- `sync/opscore/framework.md` → `__callbell__/framework.md` (direct `to`, the ops root framework/registry)

Harness adapters (`sync/harness/`, across templates, direct `to`):
- `sync/harness/claude/settings.json` → `.claude/settings.json` (Claude)
- `sync/harness/codex/hooks.json` → `.codex/hooks.json` (Codex)

## Key points

`roots`: the template's `AGENTS.md`/`CLAUDE.md` come from `sync/all/roots/` and land via `spread: "root"` directly in the template root (same name, no rebuild). The roots stay deliberately minimal (context comes via the hook).

`context`: within `__callbell__/`, the SessionStart hook injects a deliberately narrow set: `__callbell__/context/`, the memory index `__callbell__/memory/MEMORY.md`, **and** the backlog index `__callbell__/_backlog/BACKLOG.md`, not all of `__callbell__/`. The individual backlog files, templates, and deeper `framework.md` stay on demand (cascade), not always-on context.

`language`: the interaction language (chat + visible reasoning) is set during `/callbell-onboarding` and written into the root `AGENTS.md` (which `CLAUDE.md` imports), so both harnesses load it natively, no hook injection. It is committed with the repo (shared, fitting the solo audience), replacing the former per-user `_user-language.md`, which is gone. The language of **repo content** is a separate axis, the structure language, recorded in `repo.md` and asked during onboarding.

`zones`: `__callbell__/_backlog/` and `__callbell__/_import/` are ready from the start, `__callbell__/_export/` stays on demand.
- `__callbell__/_backlog/` ships with its **index `BACKLOG.md`**: the hook loads it at session start like the memory index, so the open work state is present right away. The **entries** in it (epic/story/task) come into being lazily with their first file; the templates for them live in `__callbell__/templates/`. Operational logic: rule `callbell-backlog`.
- `__callbell__/_import/` is ready as a volatile raw zone (via `.gitkeep`); the template `.gitignore` ignores its content but keeps the folder. So the user can drop raw inputs right away without them being versioned. Consumed originals move into the archive `__callbell__/_import/processed/<yyyy-mm>/` (monthly, also ignored). The ingest flow (recognize, convert, redact, file, archive) is the skill `callbell-import`; redaction is governed by `callbell-data-protection`. Operational logic: rule `callbell-zones`.
- `__callbell__/_export/` stays **unseeded** and comes into being only when the human requests a deliverable (the agent files nothing here on its own). The template `.gitignore` ignores `__callbell__/_export/` like `__callbell__/_import/`: deliverables often carry real, unredacted data that must never be versioned. Operational logic: rule `callbell-zones`.

`rules` live **not** in `__callbell__`, but natively in `.claude/rules/` (source: `sync/all/rules/`, opscore addition `sync/opscore/rules/`):
- **Claude**: reads `.claude/rules/` natively. Claude's `rules/` is path-specific (`paths:` frontmatter); the norm files have `paths: ["**/*"]`, so they apply globally. NOT via the hook (otherwise duplicate context).
- **Codex**: has no Markdown rules folder (`.codex/rules/` is a Starlark *security* mechanism for command execution, not for norms). That is why the Codex hook (`--rules`) additionally injects the norms from `.claude/rules/`.

The hook (`callbell-context.js`) is **harness-compatible** and is registered twice:
- **Claude**: `.claude/settings.json` -> `.claude/hooks/callbell-context.js` (root via `$CLAUDE_PROJECT_DIR`). Injects `__callbell__/context/` + memory index.
- **Codex**: `.codex/hooks.json` -> `.codex/hooks/callbell-context.js --rules` (root via stdin `cwd`). Injects context **and** norms from `.claude/rules/`. Codex loads the project-local `.codex/` layer only when the project is **trusted** (a one-time trust prompt on first open).

Both harnesses inject SessionStart stdout as context; `AGENTS.md` stays minimal (no flat embedding needed).

`skills`: the same SKILL.md format applies to both harnesses, but the storage differs: Claude reads project skills from `.claude/skills/`, **Codex exclusively from `.agents/skills/`** (a `.codex/skills/` does not exist). That is why the kind `skills` fans each source out into both targets. Most skills are **domain-adaptive** and shared in `sync/all/skills/`: they read the `PROJECT TYPE` lens (emitted by the hook) at runtime and adapt to code or ops. Only the **domain-unique** skills stay template-scoped: `callbell-gain` in `sync/devcore/skills/` (devcore only), `callbell-filing` in `sync/opscore/skills/` (opscore only).

`Procedures are skills, not commands`: onboarding (shared, domain-adaptive) and worktree are **pure skills**. A user-invocable skill appears in Claude as `/name` **and** in Codex as `@name`, so the command UX stays intact across harnesses. The templates no longer ship a `.claude/commands/` folder. The onboarding skills carry `disable-model-invocation: true` (one-time setup, never automatic); worktree stays without this flag so the agent may proactively suggest it during parallel work.

`harness/`: the only harness-specific level. `sync/harness/claude/settings.json` (compatible with `.claude`) and `sync/harness/codex/hooks.json` (compatible with `.codex`) are adapter singletons with direct `to`.
