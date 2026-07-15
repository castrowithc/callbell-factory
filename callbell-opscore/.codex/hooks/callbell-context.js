#!/usr/bin/env node
'use strict';

// SessionStart hook, compatible with Claude Code AND OpenAI Codex.
// Builds the session context and writes it to stdout; both harnesses inject
// SessionStart stdout as context.
//
//   Claude: registered in .claude/settings.json (WITHOUT --rules).
//           Root via $CLAUDE_PROJECT_DIR. Injects the context from __META__/context/,
//           the memory index __META__/memory/MEMORY.md and the backlog index _backlog/BACKLOG.md.
//           On Claude the rules do NOT come from here, but natively from .claude/rules/
//           (otherwise duplicate context).
//   Codex:  registered in .codex/hooks.json WITH --rules.
//           Root via stdin JSON {cwd}. Codex has no Markdown rules folder, so
//           the norms from .claude/rules/ are injected here as well.
//
// Scope deliberately narrow: only __META__/context/ (onboarding facts, a dynamic complement to
// rules/skills), the memory index, and the backlog index (open work state). The individual
// backlog files, templates, and deeper framework.md stay on demand (cascade), not always on.
//
// YAML frontmatter and pure @-import lines are stripped.

const fs = require('fs');
const path = require('path');

const withRules = process.argv.includes('--rules');

function resolveRoot() {
  if (process.env.CLAUDE_PROJECT_DIR) return process.env.CLAUDE_PROJECT_DIR;
  if (!process.stdin.isTTY) {
    try {
      const raw = fs.readFileSync(0, 'utf8');
      const payload = raw ? JSON.parse(raw) : null;
      if (payload && typeof payload.cwd === 'string' && payload.cwd) return payload.cwd;
    } catch { /* no or invalid JSON on stdin -> fallback */ }
  }
  return process.cwd();
}

const root = resolveRoot();

function collect(dir) {
  let out = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(collect(full));
    else if (e.name.endsWith('.md')) out.push(full);
  }
  return out.sort();
}

function bodyOf(file) {
  let text = fs.readFileSync(file, 'utf8').replace(/^﻿/, ''); // strip BOM
  text = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');       // strip YAML frontmatter
  return text
    .split(/\r?\n/)
    .filter(line => !/^\s*@[\w./-]+\s*$/.test(line))                // strip pure @-import lines
    .join('\n')
    .trim();
}

function section(files) {
  const parts = [];
  for (const f of files) {
    const rel = path.relative(root, f).split(path.sep).join('/');
    const body = bodyOf(f);
    if (body) parts.push(`--- ${rel} ---\n${body}`);
  }
  return parts;
}

const blocks = [];

// Per-user interaction language (root file, gitignored). Read explicitly; it is not in __META__/context.
// It sets how the agent talks to the user (chat + visible reasoning), not the language of repo content.
const langFile = path.join(root, '_user-language.md');
if (fs.existsSync(langFile)) {
  const langBody = bodyOf(langFile);
  if (langBody) blocks.push('Your interaction language (from _user-language.md):\n' + langBody);
} else {
  blocks.push('No _user-language.md set. Before other work, ask the user which language to use for chat replies and for your visible reasoning, then create _user-language.md from _user-language.example.md. Content written into repo files stays project-governed, not set here. A missing _user-language.md usually means the repo was just copied from the template — offer to run /callbell-onboarding for the one-time setup.');
}

const contextFiles = collect(path.join(root, '__META__', 'context'));
const memoryIndex = path.join(root, '__META__', 'memory', 'MEMORY.md');
if (fs.existsSync(memoryIndex)) contextFiles.push(memoryIndex);
const backlogIndex = path.join(root, '_backlog', 'BACKLOG.md');
if (fs.existsSync(backlogIndex)) contextFiles.push(backlogIndex);

const context = section(contextFiles);
if (context.length) {
  blocks.push('Way of working & context (loaded automatically at session start from __META__/context/, the memory index, and the backlog index):');
  blocks.push(context.join('\n\n'));
}

// Codex (--rules): also ship the norms from .claude/rules/, since Codex has no MD rules folder.
if (withRules) {
  const rules = section(collect(path.join(root, '.claude', 'rules')));
  if (rules.length) {
    blocks.push('Project rules (norms, always in force):');
    blocks.push(rules.join('\n\n'));
  }
}

if (blocks.length) process.stdout.write(blocks.join('\n\n') + '\n');
process.exit(0);
