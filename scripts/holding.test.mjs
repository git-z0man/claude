// Testet die Rechtstraeger-Durchsetzung aus bsig.tsx.
//
// Hintergrund: Die Kuhn Industrie Holding GmbH wurde zweimal falsch als
// Maschinenbauer eingestuft, weil das Modell die WZ der Tochtergesellschaften
// auf die Mutter uebertragen hat. Die Sektorzuordnung nach Anlage 2 Nr. 5
// knuepft aber an die eigene Taetigkeit des jeweiligen Rechtstraegers an. Eine
// Regel im Prompt hat das nicht verhindert, also prueft der Code den
// Widerspruch. Diese Datei haelt genau das fest.
//
// Der Block wird aus bsig.tsx herausgeschnitten und ausgefuehrt, nicht
// nachgebaut. Ein Nachbau wuerde sich irgendwann vom Original entfernen und
// dann gruen bleiben, waehrend die App falsch liegt.
//
// Wichtiger als der korrigierte Fall sind die Faelle, die NICHT umgestellt
// werden duerfen: eine Gesellschaft mit "Holding" in der Firmierung kann sehr
// wohl die produzierende sein, und eine falsche Entwarnung waere der
// gefaehrlichere Fehler.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "bsig.tsx"), "utf8");

const START = "  // ── Rechtsträger-Durchsetzung";
const END = "  if (gpQuery) {";

const from = src.indexOf(START);
const to = from < 0 ? -1 : src.indexOf(END, from);
if (from < 0 || to < 0) {
  console.error(
    "Der Rechtstraeger-Block wurde in bsig.tsx nicht gefunden.\n" +
      `Gesucht ab "${START.trim()}" bis "${END.trim()}".\n` +
      "Wurde er verschoben oder umbenannt, muss diese Datei angepasst werden."
  );
  process.exit(1);
}
const block = src.slice(from, to);

// Nur was der Block tatsaechlich anfasst.
const WZ_LABELS = { "70.10": "Verwaltung und Führung von Unternehmen und Betrieben" };
const run = (parsed, company, compData) =>
  new Function("parsed", "company", "compData", "de", "WZ_LABELS", block + "\nreturn parsed;")(
    parsed, company, compData, true, WZ_LABELS
  );

const cases = [
  {
    name: "Modell stuft selbst als reine Holding ein, vergibt aber Fertigungs-WZ",
    parsed: { primary_wz: "28.91", primary_label: "Herst. von Maschinen fuer die Metallerzeugung",
              in_scope: true, confidence: "mittel", entity_type: "holding_rein" },
    company: "Kuhn Industrie Holding GmbH",
    compData: { gegenstand: "Erwerb, Halten und Verwalten von Beteiligungen" },
    expect: { wz: "70.10", in_scope: false, override: true, unresolved: false },
  },
  {
    name: "\"Holding\" im Namen, aber operativ: darf NICHT umgestellt werden",
    parsed: { primary_wz: "28.96", in_scope: true, entity_type: "operativ" },
    company: "Wittmann Holding GmbH",
    compData: { gegenstand: "Herstellung von Spritzgiessmaschinen" },
    expect: { wz: "28.96", in_scope: true, override: false, unresolved: false },
  },
  {
    name: "entity_type unklar: markieren, nicht umstellen",
    parsed: { primary_wz: "28.99", in_scope: true, entity_type: "unklar" },
    company: "Muster Industrie Holding GmbH",
    compData: { gegenstand: "Konzernleitung und Beteiligungen" },
    expect: { wz: "28.99", in_scope: true, override: false, unresolved: true },
  },
  {
    name: "Gemischte Holding: markieren, nicht umstellen",
    parsed: { primary_wz: "28.41", in_scope: true, entity_type: "holding_gemischt" },
    company: "Beispiel Holding AG",
    compData: { gegenstand: "Verwaltung von Beteiligungen sowie eigene Fertigung" },
    expect: { wz: "28.41", in_scope: true, override: false, unresolved: true },
  },
  {
    name: "entity_type fehlt ganz, Holding-Merkmale vorhanden: markieren",
    parsed: { primary_wz: "28.30", in_scope: true },
    company: "Irgendwas Beteiligungsgesellschaft mbH",
    compData: { gegenstand: "Halten von Beteiligungen" },
    expect: { wz: "28.30", in_scope: true, override: false, unresolved: true },
  },
  {
    name: "Normaler Hersteller ohne Merkmale: unberuehrt",
    parsed: { primary_wz: "28.30", in_scope: true, entity_type: "operativ" },
    company: "SUEVIA HAIGES GmbH",
    compData: { gegenstand: "Herstellung von Traenkebecken" },
    expect: { wz: "28.30", in_scope: true, override: false, unresolved: false },
  },
  {
    name: "Holding bereits ausserhalb: keine Doppelbehandlung",
    parsed: { primary_wz: "70.10", in_scope: false, entity_type: "holding_rein" },
    company: "Irgendwas Holding GmbH",
    compData: { gegenstand: "Halten von Beteiligungen" },
    expect: { wz: "70.10", in_scope: false, override: false, unresolved: false },
  },
];

let failed = 0;
for (const c of cases) {
  const r = run(structuredClone(c.parsed), c.company, c.compData);
  const got = {
    wz: r.primary_wz,
    in_scope: r.in_scope,
    override: Boolean(r.holding_override),
    unresolved: Boolean(r.holding_unresolved),
  };
  const ok = Object.keys(c.expect).every((k) => got[k] === c.expect[k]);
  if (!ok) failed++;
  console.log(`${ok ? "OK  " : "FEHL"}  ${c.name}`);
  if (ok) {
    console.log(
      `        WZ ${got.wz}${got.in_scope ? ", im Anwendungsbereich" : ", ausserhalb"}` +
        `${got.override ? ", korrigiert" : ""}${got.unresolved ? ", markiert" : ""}`
    );
  } else {
    console.log(`        erwartet ${JSON.stringify(c.expect)}`);
    console.log(`        erhalten ${JSON.stringify(got)}`);
  }
}

if (failed) {
  console.error(`\n${failed} von ${cases.length} Faellen schlagen fehl.`);
  process.exit(1);
}
console.log(`\nAlle ${cases.length} Faelle bestanden.`);
