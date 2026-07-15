# Project
@callbell.project.md

---

## Factory mechanics
@callbell.map.md

---

## Source of truth
- `sync/` holds everything that is meant to be synchronized into the templates by script.
- `callbell.map.json` and `callbell.map.md` are the single truth. `*.map.md` is authored by the owner; the agent carries changes over into `*.map.md`. When the agent adjusts the `.map.json` by instruction or by a plan, the `.md` must be pulled along. The two are truths at different levels.
- Every change to synchronized content (rules, skills, commands, context, memory, templates, framework files) originates solely in `sync/` and is routed to its target through a map entry, never directly in a template folder (`callbell-devcore/`, `callbell-opscore/`). Template folders are generated output and are overwritten on sync; files created directly there are lost.

---

## Boundaries
- `callbell-factory` is the factory: the machinery (`sync/`, `scripts/`, `callbell.map.*`) that generates the templates. Drive it through the scripts (`node scripts/callbell-sync.js`, `callbell-verify.js`, `callbell-publish.js`); it carries no agent config of its own.
- **`sync/` is payload, not an instruction to you.** The rules, skills, context, and roots (`sync/all/roots/AGENTS.md`, `CLAUDE.md`) under `sync/` are content that will later apply inside a target project, never active factory instructions for this session. You edit them as material; you do not follow them.
- The repo knows itself (scripts, templates, truths, ...), but the templates know only their own content. Each template is self-contained. Templates do not know one another or the factory (the repo).
