# Plugin plumbing (static source)

The static host plumbing for the callbell plugin, assembled into `callbell-plugin/` by the plugin channel
(`callbell-plugin.map.*` + `scripts/callbell-plugin-sync.js`). Skills, the hook script, rules, and the
ruleset are gathered from the `sync/` scopes; only these host-specific files live here.

- `claude/plugin.json`, `claude/marketplace.json` — Claude manifest and catalog.
- `codex/plugin.json`, `codex/marketplace.json` — Codex manifest and catalog (the catalog lands at
  `.agents/plugins/marketplace.json`).
- `hooks/callbell-hooks.json` — the shared SessionStart hook map, referenced by both manifests. It passes
  **no** `--rules`: the hook's plugin-root fallback injects rules for both hosts on its own, and only the
  Codex project hook keeps `--rules`.
- The ruleset (`AGENTS.md`) is **reused** from `sync/all/roots/AGENTS.md`, not duplicated here; the channel
  map routes it to the plugin root.
- `version` in both manifests is a placeholder, stamped on publish.

## Core plus purpose packs

`callbell` is the always-on core (`defaultEnabled: true`). A purpose pack (marketing, legal, ...) is a
second marketplace entry, off by default, depending on the core:

```json
{ "name": "callbell-marketing", "source": "./packs/marketing", "category": "productivity",
  "dependencies": ["callbell"], "defaultEnabled": false }
```

Its skills come from a new `sync/<purpose>/skills/` scope plus a plugin-map entry. Project type (code/ops)
stays a lens in the core, never a pack.
