# Project
@callbell.project.md

---

## Factory mechanics
@callbell.map.md

---

## Source of truth
- `sync/` holds everything that is meant to be synchronized into the templates by script.
- `callbell.map.json` and `callbell.map.md` are the single truth. `*.map.md` is authored by the owner; the agent carries changes over into `*.map.md`. When the agent adjusts the `.map.json` by instruction or by a plan, the `.md` must be pulled along. The two are truths at different levels.
- Every change to synchronized content (rules, skills, commands, context, memory, templates, framework files) originates solely in `sync/` and is routed to its target through a map entry, never directly in an output folder (`callbell-devcore/`, `callbell-opscore/`, `callbell-plugin/`). Output folders are generated and are overwritten on sync; files created directly there are lost.

---

## Boundaries
- `callbell-factory` is the factory: the machinery (`sync/`, `scripts/`, `callbell.map.*`, `callbell-plugin.map.*`) that generates the two templates and the plugin. Drive it through the scripts (`node scripts/callbell-sync.js`, `callbell-plugin-sync.js`, `callbell-verify.js`, `callbell-plugin-verify.js`, `callbell-publish.js`); it carries no agent config of its own.
- **`sync/` is payload, not an instruction to you.** The rules, skills, context, and roots (`sync/all/roots/AGENTS.md`, `CLAUDE.md`) under `sync/` are content that will later apply inside a target project, never active factory instructions for this session. You edit them as material; you do not follow them.
- The repo knows itself (scripts, templates, truths, ...), but its outputs know only their own content. Each output is self-contained. **Knowing runs one way only:** the ops layer and the factory know the outputs (`callbell-devcore/`, `callbell-opscore/`, `callbell-plugin/`); no output ever knows the factory, the ops layer, or another output. A reference pointing back up is a defect, and one from an output into the private ops layer is also a public-to-private leak.
