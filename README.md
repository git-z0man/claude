# SUNO Song Creator

Browser-App, die mit Claude (Anthropic API) optimierte Songprompts für
SUNO v5.5 generiert. Läuft als statische Seite ohne Build-Schritt.

## Live ausführen

1. **GitHub Pages aktivieren**
   `Settings` → `Pages` → unter *Source* `Deploy from a branch` →
   Branch `claude/tsx-artifact-improvements-nsesW` (oder `main`, nachdem die
   Änderungen dorthin gemergt sind), Folder `/ (root)` → `Save`.
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
- Wechsel den Key per `⚙` rechts oben in der App. Bei Verdacht auf
  Kompromittierung: in der Anthropic Console deaktivieren und einen neuen
  generieren.
- Anthropic erzwingt das Spend Limit serverseitig — selbst bei
  Key-Diebstahl kann die Rechnung den eingestellten Cap nicht überschreiten.

## Architektur

- `suno.tsx` — kanonische Komponente, läuft 1:1 als Claude.ai-Artifact.
- `index.html` — Bootstrap. Lädt React + Tailwind + Babel-Standalone via CDN,
  fetcht `suno.tsx`, passt drei Stellen per Regex an (Import / Default-Export /
  `x-api-key`-Header), kompiliert TSX im Browser via Babel-Standalone und
  mountet die App. Stellt zusätzlich einen Settings-Dialog für den API-Key.
- `.nojekyll` — verhindert, dass GitHub Pages Jekyll-Filter anwendet.

## Updates am Artifact einspielen

`suno.tsx` ist die Single Source of Truth. Bei Änderungen am Artifact in
Claude.ai einfach neuen Code in `suno.tsx` einfügen, commit & push — Pages
deployt automatisch.

## Lokal testen ohne Push

```sh
python3 -m http.server 8000
```

Dann <http://localhost:8000/> öffnen. (`file://` funktioniert nicht, weil
`fetch("./suno.tsx")` einen HTTP-Origin braucht.)
