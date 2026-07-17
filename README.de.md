# Callbell

*[English](README.md) · [Deutsch](README.de.md)*

**Ein Experte, umgeben von Experten.** Du bist der Experte; die Agents und Sub-Agents sind Experten, die
für dich arbeiten. Und die Kommunikation dazwischen ist **faul**: die schlankste Lösung, die wirklich
trägt, statt Aufwand auf Vorrat. Der Name ist die Metapher, eine **Call Bell** (Service-Glocke): du
klingelst, die Experten kommen. Deshalb trägt alles, was callbell liefert, das Präfix `callbell`.

Callbell ist **nicht** auf Coding begrenzt. Es ist ein Rahmen für agentische Solo-Arbeit, für Devs und
Non-Devs gleichermaßen.

## Ein Plugin

Callbell ist ein **Plugin**, einmal pro Gerät installiert und in jedem Ordner aktiv. Es trägt die Skills,
die Normen und einen Session-Hook, der den Kontext liefert. Es gibt nichts zu kopieren und nichts zu
wählen.

Das Plugin bedient beide Arten von Arbeit aus einer Installation. Ein Session-Hook löst zur Laufzeit die
**Linse** auf: ob ein Repo primär ausführbarer Code ist oder primär Markdown, das ein Thema steuert. Die
faule Skill-Familie liest diese Linse und passt sich an. Code-Projekte bekommen die Code-Ausprägung,
operative Arbeit (Personal OS, Business OS, Wiki & Docs) die Ops-Ausprägung plus das Ablage-System, und der
Backbone darunter ist geteilt: Konventionen, Frontmatter, Zonen, Backlog, Memory, Datenschutz, Git.

## Nutzung

1. Das Plugin aus dem Marketplace **installieren**.
2. Arbeiten. Die Skills und Normen sind sofort aktiv, in jedem Ordner.
3. Optional `/callbell-onboarding` starten: der Agent führt dich durch das Setup und legt ein dauerhaftes
   Projekt-Scaffold an (Kontext, Memory, Backlog, Zonen). Ein Scaffold anzulegen ist eine bewusste
   Handlung und passiert deshalb nie automatisch.

## Der `callbell`-Namensraum

`callbell-*` ist **reserviert** für die vom Plugin gelieferten Skills und Rules. Domänen-Tools tragen ein
Segment: `callbell-code-*` (Code) und `callbell-ops-*` (Ops). Der faule Flagship-Modus heißt schlicht
`callbell` und flavored sich über die Linse.

Deine **eigenen** Skills legst du **außerhalb** dieses Präfixes an (eigener Name oder eigenes Präfix). So
bleiben Plugin- und User-Skills jederzeit unterscheidbar, auch wenn du sie zwischen Projekten mischst.

## Fabrik-Mechanik (dieses Repo)

`callbell-factory` ist die **Fabrik**, die das Plugin zusammenbaut. Die einzige Wahrheit ist der
`sync/`-Ordner plus `callbell-plugin.map.json` (maschinenlesbar) und `callbell-plugin.map.md`
(menschenlesbar); beide sind gleichwertig und werden immer gemeinsam gepflegt.

- `node scripts/callbell-plugin-sync.js` baut `sync/` gemäß der Map nach `callbell-plugin/`.
- `node scripts/callbell-plugin-verify.js` prüft die Ausgabe gegen die Map, Exit-Code als Guard.

Änderungen an synchronisierten Inhalten entstehen **nur** in `sync/`, nie direkt in `callbell-plugin/`
(das wird beim Sync überschrieben).

## Lizenz

MIT, siehe [LICENSE](LICENSE).
