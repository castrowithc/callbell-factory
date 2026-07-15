---
name: callbell-help
description: >
  Quick-reference card for all callbell modes and skills.
  One-shot display, not a persistent mode. Trigger: /callbell-help,
  "callbell help", "what callbell commands", "how do I use callbell".
type: skill
edit: locked
---

# Callbell Help

Display this reference card when invoked. One-shot, do NOT change mode,
write flag files, or persist anything.

## Levels

| Level | Trigger | What change |
|-------|---------|-------------|
| **Muffin** | `/callbell muffin` | Build what's asked, name the lazier alternative in one line. |
| **Cake** | `/callbell` | The ladder enforced: YAGNI → stdlib → native → one line → minimum. Default. |
| **Buffet** | `/callbell buffet` | YAGNI extremist. Deletion before addition. Challenges requirements before building. |

Level sticks until changed or session end.

## Skills

| Skill | Trigger | What it does |
|-------|---------|--------------|
| **callbell** | `/callbell` | Lazy mode itself. Simplest solution that works. |
| **callbell-code-review** | `/callbell-code-review` | Over-engineering review: `L42: yagni: factory, one product. Inline.` |
| **callbell-code-audit** | `/callbell-code-audit` | Whole-repo over-engineering audit: ranked list of what to cut. |
| **callbell-code-debt** | `/callbell-code-debt` | Harvests every `callbell:` shortcut comment into a debt ledger. |
| **callbell-code-gain** | `/callbell-code-gain` | Measured-impact scoreboard: less code, less cost, more speed. |
| **callbell-import** | "it's in the inbox", `/callbell-import` | Turns raw material dropped in `_import/` into redacted, filed content. |
| **callbell-onboarding** | `/callbell-onboarding` | One-time repo setup: clarifies purpose, fills the context scaffolds, briefs you on how agent and user work together. |
| **callbell-worktree** | `/callbell-worktree` | Sets up a git worktree for parallel work: new branch in its own folder, cleaned up after merge. |
| **callbell-help** | `/callbell-help` | This card. |

Codex uses the `@`-prefix for the same skills (`@callbell`, `@callbell-code-review`,
`@callbell-code-audit`, `@callbell-code-debt`, `@callbell-code-gain`, `@callbell-import`,
`@callbell-onboarding`, `@callbell-worktree`, `@callbell-help`); Claude Code uses the slash-command forms above.

Naming: `callbell-code-*` are the code-domain tools; a user's own skills live
outside the reserved `callbell-` namespace so they stay distinguishable.

## Deactivate

Say "stop callbell" or "normal mode". Resume anytime with `/callbell`.
`/callbell off` also works.
