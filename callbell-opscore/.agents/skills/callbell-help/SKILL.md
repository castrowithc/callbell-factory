---
name: callbell-help
description: >
  Quick reference for this repo: which skills exist and how agent and user
  work together. One-shot display, not a persistent mode. Trigger: /callbell-help,
  "callbell help", "what can callbell do", "how do I work here".
type: skill
edit: locked
---

# Callbell Help

Display this card when invoked. One-shot, no mode, persist nothing.

## Levels (working lazy)

| Level | Trigger | What changes |
|-------|---------|--------------|
| **muffin** | `/callbell muffin` | Build what is asked, name the lazier alternative in one line. |
| **cake** | `/callbell` | The ladder: YAGNI → reuse → flat → one line → minimum. Default. |
| **buffet** | `/callbell buffet` | YAGNI extremist. Deletion before creation, challenge the requirement. |

The level sticks until changed or session end.

## Skills

| Skill | Trigger | What it does |
|-------|---------|--------------|
| **callbell** | `/callbell` | Lazy mode itself: the leanest structure and capture that holds. |
| **callbell-ops-review** | `/callbell-ops-review` | Review of a change for over-structuring and redundancy. |
| **callbell-ops-audit** | `/callbell-ops-audit` | Workspace-wide structure audit: ranked list of what to thin out. |
| **callbell-ops-debt** | `/callbell-ops-debt` | Harvests every `callbell:` marker into a debt ledger. |
| **callbell-ops-filing** | "where does this go", `/callbell-ops-filing` | Decides where a file belongs and how the tree grows. |
| **callbell-import** | "it's in the inbox", `/callbell-import` | Turns raw material in `_import/` into redacted, filed content. |
| **callbell-onboarding** | `/callbell-onboarding` | One-time setup: clarify purpose, fill the context scaffolds, set up areas, explain how you work together. |
| **callbell-worktree** | `/callbell-worktree` | Git worktree for parallel work: new branch in its own folder, cleaned up after the merge. |
| **callbell-help** | `/callbell-help` | This card. |

Codex uses the same set with the `@` prefix (`@callbell`, `@callbell-ops-review`, `@callbell-ops-audit`,
`@callbell-ops-debt`, `@callbell-ops-filing`, `@callbell-import`, `@callbell-onboarding`,
`@callbell-worktree`, `@callbell-help`); Claude uses the `/` forms above.

## How you work together

- **Roles:** You decide and review, the agent executes in a structured and largely autonomous way.
- **Approvals:** New areas, structure or schema changes, and promotion of drafts only after approval;
  routine within the established scope the agent handles itself (see `callbell-governance`).
- **Structure:** flat area folders `<area>-<topic>`; the path says WHERE, the frontmatter says WHAT;
  `status` drives maturity.
- **Zones:** `_import/` (your inputs), `_export/` (requested deliverables), `_backlog/` (work trail).

## Namespace

`callbell-*` is reserved for the skills the template ships. Put your own skills outside this prefix, then
template and user skills stay distinguishable. Deactivate: "stop callbell" or "normal mode".
