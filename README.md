# Claude Tools

Sammlung kleiner Browser-Apps, die direkt die Anthropic-API ansprechen.
Läuft als statische Seite ohne Build-Schritt — TSX wird im Browser per
Babel-Standalone kompiliert.

Live unter: <https://git-z0man.github.io/claude/>

## Apps

| Pfad | Was sie tut |
|------|-------------|
| `/` (`index.html`) | Landing Page mit Links zu allen Apps |
| `/bsig.html` | **BSIG 2025 Scope Checker** — prüft, ob ein deutsches Maschinen-/Elektronik-Unternehmen unter das BSIG 2025 (NIS-2-Umsetzung DE) fällt. WZ-Klassifikation, MSP-Hinweise, Erheblichkeitsschwelle. |
| `/nisg.html` | **NISG 2026 Scope Checker** — prüft, ob ein österreichisches Unternehmen als wesentliche oder wichtige Einrichtung unter das NISG 2026 (NIS-2-Umsetzung AT, in Kraft ab 1. Oktober 2026) fällt. Sektor-Klassifikation gegen Anlagen 1 + 2, Size-Cap-Rule (EU 2003/361), ÖNACE-Recherche via firmenabc.at. |
| `/suno.html` | **SUNO Song Creator** — generiert optimierte Songprompts für SUNO v6. |

Alle Apps teilen sich den API-Key (gleicher `localStorage`-Schlüssel
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

- `bsig.tsx` / `nisg.tsx` / `suno.tsx` — die kanonischen Komponenten,
  jeweils 1:1 als Claude.ai-Artifact lauffähig (`export default function App`).
- `bsig.html` / `nisg.html` / `suno.html` — identisches Bootstrap-Pattern: laden
  React + Tailwind + Babel-Standalone via CDN, fetchen die `.tsx`-Datei,
  passen drei Stellen per Regex an
  (Import / Default-Export / `x-api-key`-Header), kompilieren TSX im Browser
  und mounten die App. Alle stellen einen Settings-Dialog für den API-Key.
- `index.html` — kleine statische Landing mit Links zu allen Apps.
- `.nojekyll` — verhindert, dass GitHub Pages Jekyll-Filter anwendet.
- `suno-v6-reference.md` — Quelldokument für den `SYSTEM_PROMPT` in `suno.tsx`.
  Der Prompt ist ein Destillat daraus (nur verhaltensrelevante Regeln, weil er
  bei jedem API-Call mitgeht). Bei Suno-Änderungen erst dort pflegen.

## Eine neue App hinzufügen

1. TSX-Komponente am Repo-Root ablegen (z.B. `foo.tsx`) mit
   `export default function App` und Anthropic-Calls, die den Header
   `"anthropic-dangerous-direct-browser-access":"true"` enthalten (genau in
   dieser Schreibweise — der Regex injiziert dahinter den `x-api-key`).
2. `bsig.html` zu `foo.html` kopieren und nur Titel, Icon und den
   `fetch("./bsig.tsx")`-Pfad anpassen.
3. Link in `index.html` (Landing) ergänzen.
4. Namen in `APPS` in `scripts/check.mjs` ergänzen, sonst wird die neue
   App von `npm test` stillschweigend übersprungen.

## Updates am Artifact einspielen

Bei Änderungen am Artifact in Claude.ai einfach den neuen Code in die
jeweilige `.tsx`-Datei einfügen, commit & push — Pages deployt automatisch.

## Lokal testen ohne Push

```sh
python3 -m http.server 8000
```

Dann <http://localhost:8000/> öffnen. (`file://` funktioniert nicht, weil
`fetch("./bsig.tsx")` einen HTTP-Origin braucht.)

Der API-Key liegt in `localStorage` und gilt pro Origin. Auf
`localhost:8000` muss er deshalb einmal neu eingetragen werden, der von
der GitHub-Pages-Seite gilt dort nicht.

## Prüfen vor dem Commit

```sh
npm install   # einmalig, zieht nur @babel/standalone
npm test
```

Die TSX-Dateien werden nicht gebaut, sondern zur Laufzeit im Browser von
Babel-Standalone kompiliert. Ein Syntaxfehler fällt deshalb nicht beim
Commit auf, sondern erst beim Laden der Seite, und zwar als weiße Seite
ohne Fehlermeldung in der Oberfläche. `npm test` zieht diesen Schritt nach
vorne.

| Befehl | Was er tut |
|--------|------------|
| `npm run check` | Kompiliert `bsig`, `nisg` und `suno` genau so, wie ihr Loader es im Browser tut, inklusive der drei Quelltext-Ersetzungen und `new Function`. |
| `npm test` | Erst `check`, dann die Testfälle zur Rechtsträger-Durchsetzung in `bsig.tsx`. |

Die Transforms in `scripts/check.mjs` sind eine Kopie aus den HTML-Dateien,
und Kopien driften. Das Skript prüft deshalb vorher, ob die HTML-Datei die
erwarteten Stellen wörtlich enthält, und schlägt fehl, wenn nicht. Wird ein
Loader geändert, muss `scripts/check.mjs` mitgeändert werden — das Skript
sagt dann, welche Stelle es nicht mehr findet.

`scripts/holding.test.mjs` schneidet den Rechtsträger-Block aus `bsig.tsx`
heraus und führt ihn aus, statt ihn nachzubauen. Wichtiger als der
korrigierte Fall sind dort die Fälle, die **nicht** umgestellt werden
dürfen: eine Gesellschaft mit „Holding" in der Firmierung kann sehr wohl
die produzierende sein, und eine falsche Entwarnung wäre der gefährlichere
Fehler.
