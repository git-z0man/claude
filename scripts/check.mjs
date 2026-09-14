// Kompiliert jede App genau so, wie ihr Loader es im Browser tut.
//
// Warum es das gibt: die TSX-Dateien werden nicht gebaut, sondern zur Laufzeit
// von Babel-Standalone im Browser kompiliert. Ein Syntaxfehler faellt deshalb
// nicht beim Commit auf, sondern erst beim Laden der Seite, und zwar als weisse
// Seite ohne Hinweis. Dieses Skript zieht denselben Schritt nach vorne.
//
// Der Loader steckt in der jeweiligen HTML-Datei. Die Transforms hier sind eine
// Kopie davon, und Kopien driften. Deshalb prueft das Skript vorher, ob die
// HTML-Datei die erwarteten Stellen ueberhaupt noch enthaelt, und schlaegt
// fehl, wenn nicht. Lieber ein lauter Fehlalarm als eine Pruefung, die etwas
// anderes testet als das, was der Browser ausfuehrt.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import babel from "@babel/standalone";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// name -> die TSX-Datei, die <name>.html zur Laufzeit nachlaedt
const APPS = ["bsig", "nisg", "suno"];

// Muss im Loader der HTML-Datei woertlich vorkommen, sonst ist diese Pruefung
// veraltet. Bewusst die vollstaendigen Ausdruecke samt Satzzeichen, nicht nur
// Stichworte: ein blosses "export default function App" ist auch in
// "export default function AppX" enthalten und wuerde eine Aenderung des
// Loaders durchgehen lassen.
const LOADER_MARKERS = [
  '"var {$1} = React;\\n"',
  '/export default function App/, "function App"',
  '"x-api-key":(localStorage.getItem("anthropicApiKey")||"")',
  "{ isTSX: true, allExtensions: true, onlyRemoveTypeImports: true }",
  'new Function("React", out.code + "\\nreturn App;")',
];

/** Die drei Ersetzungen aus dem Loader, in derselben Reihenfolge. */
function adapt(src) {
  return src
    .replace(/^import \{([^}]+)\} from "react";\s*/m, "var {$1} = React;\n")
    .replace(/export default function App/, "function App")
    .replace(
      /"anthropic-dangerous-direct-browser-access":"true"/g,
      '"anthropic-dangerous-direct-browser-access":"true","x-api-key":(localStorage.getItem("anthropicApiKey")||"")'
    );
}

function checkApp(name) {
  const html = join(root, `${name}.html`);
  const tsx = join(root, `${name}.tsx`);
  if (!existsSync(html) || !existsSync(tsx)) {
    return { name, ok: false, msg: `${name}.html oder ${name}.tsx fehlt` };
  }

  const htmlSrc = readFileSync(html, "utf8");
  const missing = LOADER_MARKERS.filter((m) => !htmlSrc.includes(m));
  if (missing.length) {
    return {
      name,
      ok: false,
      msg:
        `Loader in ${name}.html hat sich geaendert, diese Pruefung ist veraltet.\n` +
        `        Nicht mehr gefunden: ${missing.join(", ")}\n` +
        `        scripts/check.mjs an den neuen Loader anpassen.`,
    };
  }

  try {
    const out = babel.transform(adapt(readFileSync(tsx, "utf8")), {
      presets: [
        ["typescript", { isTSX: true, allExtensions: true, onlyRemoveTypeImports: true }],
        "react",
      ],
      filename: `${name}.tsx`,
    });
    // Der Browser wickelt das Ergebnis in new Function(...). Hier genauso,
    // damit auch Fehler auffallen, die erst dabei auftreten.
    new Function("React", out.code + "\nreturn App;");
    return { name, ok: true, msg: `${out.code.length.toLocaleString("de-DE")} Zeichen` };
  } catch (e) {
    return { name, ok: false, msg: e.message };
  }
}

let failed = 0;
for (const name of APPS) {
  const r = checkApp(name);
  if (!r.ok) failed++;
  console.log(`${r.ok ? "OK  " : "FEHL"}  ${r.name.padEnd(6)} ${r.msg}`);
}

if (failed) {
  console.error(`\n${failed} von ${APPS.length} Apps kompilieren nicht.`);
  process.exit(1);
}
console.log(`\nAlle ${APPS.length} Apps kompilieren.`);
