---
name: callbell-onboarding
description: >
  Guides the user through the first-time setup of this code repo: clarify context, gather
  information, fill the scaffolds, and brief the user on how the collaboration works.
  Only on explicit call (/callbell-onboarding), once, never automatically.
type: skill
edit: locked
disable-model-invocation: true
---

# /callbell-onboarding

You guide the user **actively** through the one-time setup of this code repo and stay with it until the
repo holds the information it needs to work. Goal: by the end the agent knows what this is about and how
work is done, and the user understands the collaboration model. Work in short steps, ask only **a few
questions at a time**, write only after confirmation, and explicitly invite the user to ask questions at
any time.

## 0. Secure progress (first)
Create `_backlog/task-initial-onboarding.md` right away (template in `__META__/templates/task.md`,
`status: active`) and add it with one line to the backlog index `_backlog/BACKLOG.md` (the zone is already
there with its index). Check off the steps in the task file as you go. That way the agent knows the state
if the user pauses or gets interrupted.

## 1. Clarify context
Ask briefly what the code project is about: purpose, tech stack in broad strokes, and what stage it is at.

## 2. Gather information (a few questions per step)
- **Language first** (for the root `_user-language.md`): confirm which language the agent should use for
  chat replies and for its visible reasoning while working, then write `_user-language.md` right away
  (copy `_user-language.example.md`) so the rest of onboarding already runs in that language. Skip if the
  file already exists. This is per user and gitignored; it does not set the language of repo content.
- **Purpose of the repo** (for `repo.md`): what it is meant to achieve, scope, non-goals, the people
  involved.
- **Roles** (for `roles.md`): your role, the **agent's role** (what stance and initiative it should take),
  communication style, likes and dislikes, and **special rules or wishes** that go beyond the
  fixed rules (these go in `roles.md`, not in `.claude/rules/`, which are fixed; `context/` is the dynamic
  complement).
- **Terms:** if a term of the user's own comes up, offer to capture it in `glossary.md`.

## 3. Fill the scaffolds (after confirmation)
- `__META__/context/repo.md` with purpose, scope, non-goals, and the people involved.
- `__META__/context/roles.md` with your role, the desired agent role, and special rules.
- For any terms mentioned, `__META__/context/glossary.md`.
- Point to `__META__/docs/` as the place for project documentation; the root stays the code project.

## 4. Choose the deployment mode (explain and select)
Explain the two paths and let the user choose (no forced default):
- **Full:** everything for agentic work (`.claude/`, `.codex/`, `.agents/`, `AGENTS.md`, `_backlog/`,
  `__META__/`) lives **inside** the repo. Layout: `folder/repo-from-template`. Simple, all in one place.
- **Clean:** the template sits **next to** the codebase and steers it from outside, so the codebase stays
  clean (today's dev standard). Layout: `folder/{repo-control-from-template/, repo-codebase, …}`.
- Note: Full can later become Clean, not easily the other way around.

## 5. Brief the user
Explain briefly how work is done together:
- **Roles:** the user decides and reviews, the agent executes in a structured and largely autonomous way.
- **Rules and skills:** the rules in `.claude/rules/` apply (conventions, frontmatter, zones, backlog,
  memory, data protection, Git, and more); the lazy skill family is ready (`/callbell-help` shows it).
- **Approvals:** structure and schema changes and the promotion of drafts happen only after approval.
  Routine within the established scope the agent handles itself.
- **Structure:** docs in `__META__/docs/`; the path says WHERE, the frontmatter says WHAT; `status` drives
  maturity. Backlog in `_backlog/`.

## 6. Wrap-up
- If no Git repo is initialized yet, point it out and offer to run `git init` (only after confirmation).
- Git identity (before the first commit): if `git config user.name`/`user.email` is unset, ask which name
  and email the commits should carry — usually the user's GitHub username and their GitHub no-reply/alias
  email — and offer to set it globally (`git config --global`, applies to all their repos; the friendly
  default when they have none) or only for this repo. Never use a harness or session identity, and never
  invent one (see `callbell-git`).
- Summarize what was set up and what the user can do next.
- Set `task-initial-onboarding.md` to `status: final`, move it into `_backlog/done/`, and remove its line
  from `_backlog/BACKLOG.md` (the index lists only active work).
