# Callbell

*[English](README.md) · [Deutsch](README.de.md)*

**One expert, surrounded by experts.** You are the expert; the agents and subagents are experts who work
for you. And the communication between them is **lazy**: the leanest solution that actually holds, not
effort on spec. The name is the metaphor, a **call bell** (the service bell on a counter): you ring, the
experts come. That is why everything the template ships carries the `callbell` prefix.

Callbell is **not** limited to coding. It is a frame for agentic solo work, in two flavors.

## The two templates

| Template | For whom | For what |
|---|---|---|
| **callbell-devcore** | Solo devs | Pure code projects. Copy the folder and get going. |
| **callbell-opscore** | Solo entrepreneurs, non-devs | Operational, Markdown-heavy work: Personal OS, Business OS, Wiki & Docs. |

Both share a common backbone (conventions, frontmatter, zones, backlog, memory, data protection, Git) and
differ in what their domain needs: dev gets the lazy code family, opscore gets the lazy ops family plus the
filing system.

## Usage

1. **Copy** the right template (`callbell-devcore/` or `callbell-opscore/`) to its destination.
2. Optionally `git init`.
3. Run `/callbell-onboarding`: the agent walks you through the setup, fills the context, and explains how
   the two of you work together. After that the repo is ready to work.

A template is only a **starting point**. You extend it: your own skills, rules, and structure, and you can
carry skills from one project to another.

## The `callbell` namespace

`callbell-*` is **reserved** for the skills and rules the template ships. Domain tools carry a segment:
`callbell-code-*` (code) and `callbell-ops-*` (ops). The lazy flagship mode is simply called `callbell` and
is flavored per template.

Put your **own** skills **outside** this prefix (your own name or your own prefix). That way template and
user skills stay distinguishable at all times, even when you mix them across projects.

## Factory mechanics (this repo)

`callbell-factory` is the **factory** that produces both templates. The single source of truth is the
`sync/` folder plus `callbell.map.json` (machine readable) and `callbell.map.md` (human readable); both are
equal in standing and are always maintained together.

- `node scripts/callbell-sync.js` distributes `sync/` into the templates according to the map (`mirror` =
  overwrite, `seed` = create only when missing, no prune).
- `node scripts/callbell-verify.js` checks each template against the map (`FEHLT`/`STALE`), with the exit
  code as a guard.

Changes to synchronized content are made **only** in `sync/`, never directly in a template folder (those
get overwritten on sync).

## License

MIT, see [LICENSE](LICENSE).
