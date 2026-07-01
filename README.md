# Claude Tools

Sammlung kleiner Browser-Apps, die direkt die Anthropic-API ansprechen.
Läuft als statische Seite ohne Build-Schritt — TSX wird im Browser per
Babel-Standalone kompiliert.

Live unter: <https://git-z0man.github.io/claude/>

## Apps

| Pfad | Was sie tut |
|------|-------------|
| `/` (`index.html`) | Landing Page mit Links zu beiden Apps |
| `/bsig.html` | **BSIG 2025 Scope Checker** — prüft, ob ein deutsches Maschinen-/Elektronik-Unternehmen unter das BSIG 2025 (NIS-2-Umsetzung) fällt. WZ-Klassifikation, MSP-Hinweise, Erheblichkeitsschwelle. |
| `/suno.html` | **SUNO Song Creator** — generiert optimierte Songprompts für SUNO v5.5. |

Beide Apps teilen sich den API-Key (gleicher `localStorage`-Schlüssel
`anthropicApiKey`).

## Live ausführen

1. **GitHub Pages aktivieren** (Einmal-Setup)
   `Settings` → `Pages` → unter *Source* `Deploy from a branch` →
   Branch `claude/tsx-artifact-improvements-nsesW`, Folder `/ (root)` → `Save`.
   Nach 1–2 Minuten ist die Seite unter
   `https://git-z0man.github.io/claude/` erreichbar.
2. **Anthropic-API-Key holen**
   - Account anlegen / einloggen: <https://console.anthropic.com/>
   - **Wichtig zuerst: Spend Limit setzen** (empfohlen: 5 €/Monat) unter
     <https://console.anthropic.com/settings/limits>. Das ist die harte
     Obergrenze; mehr kann der Account in dem Monat nicht verbrauchen.
   - Key erstellen unter <https://console.anthropic.com/settings/keys>.
     Beginnt mit `sk-ant-…`.
3. **Seite öffnen**, beim ersten Aufruf den Key in die Maske eintragen → fertig.
   Der Key liegt nur im `localStorage` deines Browsers.

## Sicherheit

- Der API-Key wird ausschließlich in `localStorage` deines Browsers
  gespeichert und nur direkt an `api.anthropic.com` geschickt.
- **Niemals den Key in den Quellcode oder ins Repo committen.**
- Wechsel den Key per `⚙` rechts oben in jeder App. Bei Verdacht auf
  Kompromittierung: in der Anthropic Console deaktivieren und einen neuen
  generieren.
- Anthropic erzwingt das Spend Limit serverseitig — selbst bei
  Key-Diebstahl kann die Rechnung den eingestellten Cap nicht überschreiten.

## Architektur

- `bsig.tsx` / `suno.tsx` — die kanonischen Komponenten, jeweils 1:1 als
  Claude.ai-Artifact lauffähig (`export default function App`).
- `bsig.html` / `suno.html` — identisches Bootstrap-Pattern: laden
  React + Tailwind + Babel-Standalone via CDN, fetchen die `.tsx`-Datei,
  passen drei Stellen per Regex an
  (Import / Default-Export / `x-api-key`-Header), kompilieren TSX im Browser
  und mounten die App. Beide stellen einen Settings-Dialog für den API-Key.
- `index.html` — kleine statische Landing mit Links zu beiden Apps.
- `.nojekyll` — verhindert, dass GitHub Pages Jekyll-Filter anwendet.

## Eine neue App hinzufügen

1. TSX-Komponente am Repo-Root ablegen (z.B. `foo.tsx`) mit
   `export default function App` und Anthropic-Calls, die den Header
   `"anthropic-dangerous-direct-browser-access":"true"` enthalten (genau in
   dieser Schreibweise — der Regex injiziert dahinter den `x-api-key`).
2. `bsig.html` zu `foo.html` kopieren und nur Titel, Icon und den
   `fetch("./bsig.tsx")`-Pfad anpassen.
3. Link in `index.html` (Landing) ergänzen.

## Updates am Artifact einspielen

Bei Änderungen am Artifact in Claude.ai einfach den neuen Code in die
jeweilige `.tsx`-Datei einfügen, commit & push — Pages deployt automatisch.

## Lokal testen ohne Push

```sh
python3 -m http.server 8000
```

Dann <http://localhost:8000/> öffnen. (`file://` funktioniert nicht, weil
`fetch("./bsig.tsx")` einen HTTP-Origin braucht.)
