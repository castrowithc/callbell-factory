# Callbell

*[English](README.md) · [Deutsch](README.de.md)*

**Ein Experte, umgeben von Experten.** Du bist der Experte; die Agents und Sub-Agents sind Experten, die
für dich arbeiten. Und die Kommunikation dazwischen ist **faul**: die schlankste Lösung, die wirklich
trägt, statt Aufwand auf Vorrat. Der Name ist die Metapher, eine **Call Bell** (Service-Glocke): du
klingelst, die Experten kommen. Deshalb trägt alles, was das Template liefert, das Präfix `callbell`.

Callbell ist **nicht** auf Coding begrenzt. Es ist ein Rahmen für agentische Solo-Arbeit, in zwei
Ausprägungen.

## Die zwei Vorlagen

| Vorlage | Für wen | Wofür |
|---|---|---|
| **callbell-devcore** | Solo-Devs | Reine Code-Projekte. Ordner kopieren und loslegen. |
| **callbell-opscore** | Solo-Entrepreneure, Non-Devs | Operative, MD-lastige Arbeit: Personal OS, Business OS, Wiki & Docs. |

Beide teilen einen gemeinsamen Backbone (Konventionen, Frontmatter, Zonen, Backlog, Memory, Datenschutz,
Git) und unterscheiden sich in dem, was ihre Domäne braucht: dev bekommt die faule Code-Familie, opscore
die faule Ops-Familie plus das Ablage-System.

## Nutzung

1. Die passende Vorlage (`callbell-devcore/` oder `callbell-opscore/`) an ihren Zielort **kopieren**.
2. Optional `git init`.
3. `/callbell-onboarding` starten: der Agent führt dich durch das Setup, füllt den Kontext und erklärt,
   wie ihr zusammenarbeitet. Danach ist das Repo arbeitsbereit.

Eine Vorlage ist nur ein **Startstand**. Du erweiterst sie: eigene Skills, Rules und Struktur, und du
kannst Skills zwischen Projekten übertragen.

## Der `callbell`-Namensraum

`callbell-*` ist **reserviert** für die vom Template gelieferten Skills und Rules. Domänen-Tools tragen ein
Segment: `callbell-code-*` (Code) und `callbell-ops-*` (Ops). Der faule Flagship-Modus heißt schlicht
`callbell` und ist pro Vorlage geflavored.

Deine **eigenen** Skills legst du **außerhalb** dieses Präfixes an (eigener Name oder eigenes Präfix). So
bleiben Template- und User-Skills jederzeit unterscheidbar, auch wenn du sie zwischen Projekten mischst.

## Fabrik-Mechanik (dieses Repo)

`callbell-factory` ist die **Fabrik**, die beide Vorlagen erzeugt. Die einzige Wahrheit ist der
`sync/`-Ordner plus `callbell.map.json` (maschinenlesbar) und `callbell.map.md` (menschenlesbar); beide
sind gleichwertig und werden immer gemeinsam gepflegt.

- `node scripts/callbell-sync.js` verteilt `sync/` gemäß der Map in die Vorlagen (`mirror` = überschreiben,
  `seed` = nur anlegen wenn fehlend, kein Prune).
- `node scripts/callbell-verify.js` prüft jede Vorlage gegen die Map (`FEHLT`/`STALE`), Exit-Code als Guard.

Änderungen an synchronisierten Inhalten entstehen **nur** in `sync/`, nie direkt in einem Vorlagen-Ordner
(die werden beim Sync überschrieben).

## Lizenz

MIT, siehe [LICENSE](LICENSE).
