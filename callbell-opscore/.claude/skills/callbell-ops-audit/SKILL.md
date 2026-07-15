---
name: callbell-ops-audit
description: >
  Workspace-wide audit for over-structuring. Like callbell-ops-review, but across the whole tree instead
  of one change: a ranked list of what to delete, merge, or flatten. Use on "audit the filing", "what can
  I clean up", "find sprawl", "callbell-ops-audit", or /callbell-ops-audit. One-shot report, changes
  nothing.
type: skill
edit: locked
---

# Callbell Ops Audit

callbell-ops-review, workspace-wide. Scan the whole tree instead of one change. Rank the findings, biggest
cut first.

## Tags

Same as callbell-ops-review:

- `delete:` a dead folder, an empty area, a duplicated or orphaned file. Replacement: nothing.
- `merge:` two files or areas say the same thing → merge them. Name the target.
- `flatten:` needless depth → flat with a prefix.
- `backbone:` a doc repeats a rule or `framework.md` → cut it, point to the backbone.
- `shrink:` same statement, less text.

## The hunt

Areas with no content, folders with one file, a `framework.md` with no delta, duplicate topics across
several areas, docs that retell the norms, deep trees where a flat level is enough, `status: draft` that
never became `active` and nobody needs anymore.

## Output

One line per finding, ranked: `<tag> <what can go>. <replacement>. [path]`.
Close with `net: -<N> files, -<M> folders possible.` Nothing to cut: `Already lean. Fine.`

Example:

```
delete: 3 empty area folders with no content. Nothing. [personal-todo/, business-ideas/, business-old/]
merge:  business-finances/ and business-finance/ are the same. Into business-finance/.
flatten: business-finance/2024/invoices/ (3 files). Flat with a fact prefix.
backbone: personal-gaming/framework.md repeats the structure rule. Cut it.
net: -5 files, -4 folders possible.
```

## Boundaries

Scope: over-structuring and redundancy only. Content errors, data protection, and guardrails are out of
scope → a normal review. Lists findings, changes nothing. One-shot.
"stop callbell-ops-audit" or "normal mode": revert.
