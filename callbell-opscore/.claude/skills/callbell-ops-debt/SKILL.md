---
name: callbell-ops-debt
description: >
  Harvests every `callbell:` marker in the workspace into a debt ledger, so the deliberate shortcuts and
  deferrals that callbell leaves behind get tracked instead of rotting into "later means never". Use on
  "callbell debt", "/callbell-ops-debt", "what did callbell defer", "list the shortcuts", "callbell
  ledger". One-shot report, changes nothing.
type: skill
edit: locked
---

# Callbell Ops Debt

Every deliberate callbell shortcut is marked as an HTML comment `<!-- callbell: <limit>, <trigger> -->` in
the file (invisible in the rendered view). This skill harvests them into a ledger, so a deferral does not
quietly become permanent.

## Scan

Grep the workspace for markers, skipping `.git` and build output:

`grep -rnE 'callbell:' . --include='*.md'`  (add more file types as needed)

Every hit is a ledger line. The marker keeps mere mentions of the convention out of the ledger.

## Output

One line per marker, grouped by file:

`<file>:<line>, <what was simplified>. limit: <the stated ceiling>. add: <the trigger>.`

The convention is `callbell: <limit>, <trigger>`, so pull the limit and trigger straight from the marker.
Markers with no trigger get a `no-trigger` tag. They rot silently.

Example:

```
business-finance/index.md:12, customers flat instead of one folder each. limit: only 3 customers. add: from the 6th.
personal-gaming/note.md:4, no framework.md created. limit: one topic. add: no-trigger
2 markers, 1 without a trigger.
```

Close with `<N> markers, <M> without a trigger.` Nothing found: `No callbell debt. Clean ledger.`

## Boundaries

Reads and reports only, changes nothing. To capture it, ask and then write into the ledger (for example
`callbell-debt.md`). One-shot. "stop callbell-ops-debt" or "normal mode": revert.
