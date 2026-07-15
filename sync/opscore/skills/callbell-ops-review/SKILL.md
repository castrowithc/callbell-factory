---
name: callbell-ops-review
description: >
  Review of a filing, structure, or docs change, strictly for over-structuring and redundancy. Finds what
  can go: duplicate docs, dead folders, needless depth, text that only repeats a rule or the framework. One
  line per finding: place, what can go, what replaces it. Use on "review this filing", "is this
  over-structured", "what can we merge", or /callbell-ops-review.
type: skill
edit: locked
---

# Callbell Ops Review

Check a change to structure, filing, or docs for needless complexity. One line per finding: place, what
can go, what replaces it. The best outcome of the change is that it gets leaner. Over-structuring and
redundancy only, not content correctness (that is a normal review).

## Format

`<path>: <tag> <what>. <replacement>.`

Tags:

- `delete:` a dead folder, an empty area, a duplicated or orphaned file. Replacement: nothing.
- `merge:` two files or areas say the same thing → merge them. Name the target.
- `flatten:` needless depth (a folder tree for a few files) → flat with a prefix.
- `backbone:` text repeats what a rule or `framework.md` already governs → cut it, point to the backbone
  instead of duplicating.
- `shrink:` same statement, less text. Show the shorter form.

## The hunt

Folders with one file, areas with no content, a `framework.md` with no real delta from the backbone, two
notes on the same topic, docs that retell a rule, deep `area/topic/subtopic` trees where a flat level is
enough.

## Output

One line per finding, ranked (biggest cut first). Close with `net: -<N> files/folders possible.`
Nothing to cut: `Already lean. Fine.`

## Examples

❌ "This folder structure feels maybe a little deep, have you considered whether all the levels are
needed?"

✅ `business-finance/2024/invoices/: flatten: folder tree for 3 files. Flat with a fact prefix.`

✅ `personal-gaming/ + personal-games/: merge: two areas on the same topic. Merge into personal-gaming/.`

✅ `business-finance/framework.md: backbone: repeats the frontmatter rule. Cut it, the rule applies anyway.`

✅ `business-customers/customer-x/note.md (status: draft, 6 months): delete: never activated, no longer relevant. Nothing replaces it.`

## Boundaries

Scope: over-structuring and redundancy only. Content errors, data protection, and missing guardrails are
explicitly out of scope → a normal review. Lists findings, changes nothing. One-shot.
"stop callbell-ops-review" or "normal mode": revert to the detailed review style.
