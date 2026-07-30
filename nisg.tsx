import { useState, useMemo, useRef, useEffect } from "react";

function MI({ name, size, color, fill, weight }) {
  return <span className="mi" style={{ fontSize: size || 20, color: color || "inherit", fontVariationSettings: ("'FILL' " + (fill ? 1 : 0) + ", 'wght' " + (weight || 300) + ", 'opsz' 24"), verticalAlign: "middle", display: "inline-block" }}>{name}</span>;
}

const NISG_LAW      = "https://www.ris.bka.gv.at/eli/bgbl/I/2025";
const NIS_MELDE     = "https://www.nis.gv.at";
const NIS_RICHTLINIE= "https://www.nis.gv.at/nis-2-richtlinie.html";
const WKO_NIS       = "https://www.wko.at/it-sicherheit/nis2-uebersicht";
const STATISTIK_AT  = "https://www.statistik.at/en/about-us/surveys/enterprises/oenace";
const FIRMENABC_BASE= "https://www.firmenabc.at";
const VDMA_HILFEN   = "https://www.vdma.eu/de/viewer/-/v2article/render/161561890";
const VDMA_AT_MEMBERSHIP = "https://www.vdma.eu/de/oesterreich";
const VDMA_AT_MEMBERS_URL = "https://www.vdma.eu/de/oesterreich-mitglieder";

// Fast-path allowlist of confirmed VDMA Österreich members (independently
// verified via VDMA Vorstand publications + industry press). Not exhaustive
// — VDMA Österreich has ~130 members and vdma.eu is bot-blocked to our
// build-time fetch, so the runtime web_search hitting vdma.eu remains the
// authority. This set is used only (a) to seed the prompt with strong
// candidates so Claude prefers `true` for them, and (b) as a case-insensitive
// substring fallback in the UI when Claude returns null.
const KNOWN_VDMA_AT_MEMBERS = [
  "ENGEL AUSTRIA",
  "ANDRITZ",
  "PÖTTINGER",
  "KOMPTECH",
  "SIGMATEK",
  "Braun Maschinenfabrik",
  "Buxbaum Automation",
];

// ── NISG 2026 reference data ─────────────────────────────────────────────────
// Sector definitions are activity-based (per Anlagen 1+2), so the ÖNACE codes
// listed under each sector are non-exhaustive hints — Claude uses them as
// anchors but the actual scope decision is by activity, not by pure code range.

const NISG_SECTORS_A1 = [
  { key: "A1.01", name: "Energie",                        hint: "Elektrizität (35.11–14), Fernwärme/-kälte (35.30), Erdöl (06.10, 19.20, 49.50), Erdgas (35.21–23), Wasserstoff (35, 20.11)" },
  { key: "A1.02", name: "Verkehr",                        hint: "Luftverkehr (51.10, 51.21, 52.23), Schienenverkehr (49.10, 49.20, 52.21), Schifffahrt (50.10–50.40), Straßenverkehr-Leitsysteme" },
  { key: "A1.03", name: "Bankwesen",                      hint: "Kreditinstitute (64.19)" },
  { key: "A1.04", name: "Finanzmarktinfrastrukturen",     hint: "Handelsplätze, zentrale Gegenparteien (66.11, 66.12)" },
  { key: "A1.05", name: "Gesundheit",                     hint: "Krankenhäuser (86.10), EU-Referenzlabore, kritische Medizinprodukte (26.60, 32.50), Herstellung von Grundstoffen (21.10, 21.20)" },
  { key: "A1.06", name: "Trinkwasser",                    hint: "Wasserversorgung (36.00)" },
  { key: "A1.07", name: "Abwasser",                       hint: "Abwasserentsorgung (37.00)" },
  { key: "A1.08", name: "Digitale Infrastruktur",         hint: "IXPs, DNS-Anbieter, TLD-Registrare, Cloud-Computing, Rechenzentren (63.11), CDNs, Vertrauensdiensteanbieter, öffentliche elektronische Kommunikationsnetze (61.10, 61.20, 61.30)" },
  { key: "A1.09", name: "Verwaltung von IKT-Diensten (B2B)", hint: "Managed Service Providers, Managed Security Service Providers (62.02, 62.09, 63.11)" },
  { key: "A1.10", name: "Öffentliche Verwaltung",         hint: "Zentrale und regionale Regierungsstellen (84.11–84.13)" },
  { key: "A1.11", name: "Weltraum",                       hint: "Betreiber von Bodeninfrastruktur für weltraumgestützte Dienste (74.90, 30.30)" },
];

const NISG_SECTORS_A2 = [
  { key: "A2.01", name: "Post- und Kurierdienste",        hint: "53.10, 53.20" },
  { key: "A2.02", name: "Abfallbewirtschaftung",          hint: "38.11, 38.12, 38.21, 38.22, 38.31, 38.32, 39.00" },
  { key: "A2.03", name: "Chemikalien",                    hint: "Herstellung, Produktion und Vertrieb (20.xx, 46.75)" },
  { key: "A2.04", name: "Lebensmittel",                   hint: "Herstellung, Verarbeitung, Vertrieb (10.xx, 11.xx, 46.3x)" },
  { key: "A2.05", name: "Verarbeitendes Gewerbe (kritisch)", hint: "Medizinprodukte (26.60, 32.50), Computer/Elektronik/Optik (26), elektrische Ausrüstungen (27), Maschinenbau (28), Kraftfahrzeuge (29), sonstiger Fahrzeugbau (30)" },
  { key: "A2.06", name: "Anbieter digitaler Dienste",     hint: "Online-Marktplätze, Online-Suchmaschinen, Plattformen für soziale Netzwerke (63.12, 63.99)" },
  { key: "A2.07", name: "Forschungseinrichtungen",        hint: "72.11, 72.19" },
];

// Size-cap-rule carve-outs: entities in these categories are in scope
// regardless of the EU 2003/361 size thresholds.
const SIZE_CAP_EXCEPTIONS = [
  "TLD-Namensregister (Anbieter von Top-Level-Domain-Registrierungen)",
  "DNS-Diensteanbieter (mit Ausnahme von Betreibern von Root-Namenservern)",
  "Vertrauensdiensteanbieter (qualifiziert und nicht-qualifiziert)",
  "Anbieter öffentlicher elektronischer Kommunikationsnetze und -dienste",
  "Einrichtungen der öffentlichen Verwaltung des Bundes und der Länder",
  "Alleiniger Anbieter eines für gesellschaftliche/wirtschaftliche Tätigkeiten kritischen Dienstes",
  "Einrichtungen, deren Ausfall erhebliche Auswirkungen auf öffentliche Sicherheit, öffentliche Gesundheit oder systemische Risiken hätte",
  "Vom Bundesministerium namentlich als wesentlich/wichtig eingestufte Einrichtungen",
];

// Division-level ÖNACE 2025 = NACE Rev 2 divisions (same top-level structure).
const VALID_ONACE_DIVISIONS = new Set([
  "01","02","03","05","06","07","08","09",
  "10","11","12","13","14","15","16","17","18","19",
  "20","21","22","23","24","25","26","27","28","29","30","31","32","33",
  "35","36","37","38","39","41","42","43","45","46","47","49",
  "50","51","52","53","55","56","58","59","60","61","62","63",
  "64","65","66","68","69","70","71","72","73","74","75",
  "77","78","79","80","81","82","84","85","86","87","88",
  "90","91","92","93","94","95","96","97","98","99",
]);

function validateOnaceRaw(raw) {
  // ÖNACE codes: NN, NN.NN, NN.NN-NN, or with a leading section letter L/…
  // Accept the common shapes; strip an optional leading letter prefix.
  var trimmed = String(raw || "").trim().replace(/^[A-Za-z]/, "");
  if (!trimmed) return "format";
  var num = parseFloat(trimmed);
  if (isNaN(num) || num < 0) return "format";
  if (!/^\d{2}(\.\d{1,2}(-\d{1,2})?)?$/.test(trimmed)) return "format";
  var topLevel = String(Math.floor(num)).padStart(2, "0");
  if (!VALID_ONACE_DIVISIONS.has(topLevel)) return "notfound";
  return "ok";
}

// ── JSON helper (balanced-brace extractor, from bsig.tsx PR #12) ─────────────
function parseJson(txt) {
  var clean = txt.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); } catch(_) {}
  var blocks = [], depth = 0, start = -1, inStr = false, esc = false;
  for (var i = 0; i < clean.length; i++) {
    var c = clean[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === "\"") inStr = false;
      continue;
    }
    if (c === "\"") { inStr = true; continue; }
    if (c === "{") { if (depth === 0) start = i; depth++; }
    else if (c === "}") { depth--; if (depth === 0 && start !== -1) { blocks.push(clean.slice(start, i + 1)); start = -1; } }
  }
  for (var j = blocks.length - 1; j >= 0; j--) {
    try { return JSON.parse(blocks[j]); } catch(_) {}
  }
  throw new Error("No JSON in response");
}

// ── Anthropic client (same shape as bsig.tsx) ────────────────────────────────
async function callClaude(messages, useWebSearch, maxTokens, signal, timeoutMs) {
  var body = { model: "claude-haiku-4-5", max_tokens: maxTokens || 800, messages };
  if (useWebSearch) body.tools = [{ type: "web_search_20250305", name: "web_search" }];

  var localCtrl = new AbortController();
  var timer = null;
  if (timeoutMs) {
    timer = setTimeout(function() { localCtrl.abort(); }, timeoutMs);
  }
  if (signal) {
    signal.addEventListener("abort", function() { localCtrl.abort(); });
  }

  try {
    var opts = {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        "anthropic-version":"2023-06-01",
        "anthropic-dangerous-direct-browser-access":"true"
      },
      body: JSON.stringify(body),
      signal: localCtrl.signal,
    };
    var res = await fetch("https://api.anthropic.com/v1/messages", opts);
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 401) throw new Error("AUTH_ERROR");
    if (!res.ok) throw new Error("HTTP_" + res.status);
    var d = await res.json();
    if (d.error) throw new Error(d.error.message || "API error");
    return (d.content || []).map(function(b) { return b.type === "text" ? b.text : ""; }).join("").trim();
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Case-insensitive substring match against the vendored VDMA AT allowlist.
// Used both to seed the phase-1 prompt with a strong hint and as a fallback
// when Claude returns null for vdma_at_member.
function knownVdmaAtMember(name) {
  if (!name) return false;
  var n = String(name).toLowerCase();
  for (var i = 0; i < KNOWN_VDMA_AT_MEMBERS.length; i++) {
    if (n.indexOf(KNOWN_VDMA_AT_MEMBERS[i].toLowerCase()) !== -1) return true;
  }
  return false;
}

// ── Phase 1: company data from firmenabc.at / Northdata AT / Firmenbuch ──────
async function fetchCompanyData(companyName, loc, lang, signal) {
  var query   = loc ? companyName + ", " + loc : companyName;
  var faUrl   = FIRMENABC_BASE + "/" + encodeURIComponent((companyName || "").toLowerCase().replace(/\s+/g, "-"));
  var knownHint = knownVdmaAtMember(companyName);
  var exJson  = '{"gegenstand":"...","onace_code":"28.99","onace_label":"Herst. sonstiger Spezialmaschinen","onace_found":true,"rechtsform":"GmbH","ort":"Wien","firmenabc_url":"https://www.firmenabc.at/...","firmenbuch_nummer":"FN 12345 a","firmenbuch_gericht":"Handelsgericht Wien","mitarbeiter_geschaetzt":null,"umsatz_geschaetzt":null,"products":"Spezialmaschinen für die Glasindustrie","vdma_at_member":true,"vdma_at_member_reason":"auf vdma.eu/de/oesterreich-mitglieder aufgeführt"}';
  var de = lang === "de";
  var vdmaHint = knownHint
    ? (de ? " (Firma ist wahrscheinlich VDMA Österreich-Mitglied — bitte auf vdma.eu bestätigen.)" : " (Company is likely a VDMA Österreich member — please confirm on vdma.eu.)")
    : "";
  var prompt = de
    ? ('Suche auf firmenabc.at nach "' + query + '" (URL-Muster: ' + faUrl + '). Wenn kein ÖNACE-Code auffindbar ist, ergänzend auf northdata.de bzw. northdata.at, JustizOnline-Firmenbuch und der offiziellen Unternehmenswebsite suchen. Firmenabc.at zeigt den ÖNACE-Branchencode explizit an.\nZUSÄTZLICH: Prüfe auf ' + VDMA_AT_MEMBERS_URL + ', ob "' + (companyName || "") + '" als VDMA Österreich-Mitglied gelistet ist.' + vdmaHint + '\nExtrahiere: gegenstand, onace_code (im Format NN.NN oder NN.NN-NN — ohne Sektionsbuchstabe), onace_label, onace_found, rechtsform, ort, firmenabc_url, firmenbuch_nummer (Format „FN 12345 a"), firmenbuch_gericht (z.B. „Handelsgericht Wien"), mitarbeiter_geschaetzt (Zahl oder null), umsatz_geschaetzt (Jahresumsatz in Mio. Euro oder null), products (max. 12 Produkte/Tätigkeiten), vdma_at_member (true/false/null wenn unklar), vdma_at_member_reason (kurzer Beleg oder null).\nAntworte NUR als JSON: ' + exJson)
    : ('Search firmenabc.at for "' + query + '" (URL pattern: ' + faUrl + '). If no ÖNACE code is found, additionally search northdata.de/northdata.at, the JustizOnline Firmenbuch and the official company website. firmenabc.at explicitly displays the ÖNACE Branchencode.\nADDITIONALLY: Check ' + VDMA_AT_MEMBERS_URL + ' to see if "' + (companyName || "") + '" is listed as a VDMA Österreich member.' + vdmaHint + '\nExtract: gegenstand, onace_code (format NN.NN or NN.NN-NN — without section letter), onace_label, onace_found, rechtsform, ort, firmenabc_url, firmenbuch_nummer (format "FN 12345 a"), firmenbuch_gericht (e.g. "Handelsgericht Wien"), mitarbeiter_geschaetzt (number or null), umsatz_geschaetzt (annual turnover in € million or null), products (max. 12), vdma_at_member (true/false/null if unclear), vdma_at_member_reason (short evidence or null).\nReply ONLY as JSON: ' + exJson);
  var txt = await callClaude([{ role: "user", content: prompt }], true, 1000, signal, 40000);
  var parsed = parseJson(txt);
  if (!parsed.gegenstand && !parsed.products) throw new Error("No usable data returned");
  // Fallback: if Claude returned null/undefined for vdma_at_member but the
  // company name substring-matches our vendored list, treat as member.
  if (parsed.vdma_at_member == null && knownHint) {
    parsed.vdma_at_member = true;
    parsed.vdma_at_member_reason = lang === "de"
      ? "in der lokalen Liste bekannter VDMA Österreich-Mitglieder gefunden"
      : "matched local known-members list";
  }
  return parsed;
}

// ── Phase 2: NISG sector + size classification ───────────────────────────────
async function analyzeSector(company, products, compData, lang, signal) {
  var de = lang === "de";
  var contextParts = [];
  if (compData) {
    var onaceNote = compData.onace_found
      ? (de ? "ÖNACE laut Register/firmenabc.at: " : "ÖNACE per register/firmenabc.at: ") + compData.onace_code + (compData.onace_label ? " (" + compData.onace_label + ")" : "")
      : (de ? "Kein ÖNACE-Code gefunden" : "No ÖNACE code found");
    contextParts.push("\nRegister/firmenabc.at:\n- Gegenstand: " + (compData.gegenstand || "-") + "\n- " + onaceNote + "\n- " + [compData.rechtsform, compData.ort].filter(Boolean).join(" - "));
    if (compData.firmenbuch_nummer) contextParts.push("\n- Firmenbuch: " + compData.firmenbuch_nummer + (compData.firmenbuch_gericht ? " " + compData.firmenbuch_gericht : ""));
    if (compData.mitarbeiter_geschaetzt != null) contextParts.push("\n- Mitarbeiter (geschätzt): " + compData.mitarbeiter_geschaetzt);
    if (compData.umsatz_geschaetzt != null) contextParts.push("\n- Jahresumsatz (geschätzt, Mio. €): " + compData.umsatz_geschaetzt);
  }

  var sectorList = NISG_SECTORS_A1.map(function(s) { return s.key + " " + s.name + " — " + s.hint; }).join("\n")
    + "\n\nAnlage 2 (wichtige Einrichtungen):\n"
    + NISG_SECTORS_A2.map(function(s) { return s.key + " " + s.name + " — " + s.hint; }).join("\n");

  var sizeRule = de
    ? "\nSIZE-CAP-RULE (EU-Empfehlung 2003/361):\n- klein: <50 Mitarbeiter UND (Umsatz ≤10 Mio. € ODER Bilanz ≤10 Mio. €) → typischerweise KEINE (außer size-cap-Ausnahme).\n- mittel: ≥50 Mitarbeiter ODER Umsatz >10 Mio. € ODER Bilanz >10 Mio. €, aber <250 & Umsatz ≤50 Mio. € & Bilanz ≤43 Mio. € → WICHTIG (Anlage 2, wenn Sektor passt).\n- groß: ≥250 Mitarbeiter ODER Umsatz >50 Mio. € ODER Bilanz >43 Mio. € → WESENTLICH (Anlage 1, wenn Sektor passt).\n- unbekannt: wenn keine ausreichenden Größenangaben verfügbar sind.\n"
    : "\nSIZE-CAP RULE (EU Recommendation 2003/361):\n- small: <50 employees AND (turnover ≤€10M OR balance ≤€10M) → typically NONE (unless size-cap exception applies).\n- medium: ≥50 employees OR turnover >€10M OR balance >€10M, but <250 & turnover ≤€50M & balance ≤€43M → IMPORTANT (Annex 2 if sector matches).\n- large: ≥250 employees OR turnover >€50M OR balance >€43M → ESSENTIAL (Annex 1 if sector matches).\n- unknown: if no sufficient size data available.\n";

  var exceptionsRule = de
    ? "\nSIZE-CAP-AUSNAHMEN (unabhängig von Größe im Anwendungsbereich):\n- " + SIZE_CAP_EXCEPTIONS.join("\n- ") + "\n"
    : "\nSIZE-CAP EXCEPTIONS (in scope regardless of size):\n- " + SIZE_CAP_EXCEPTIONS.join("\n- ") + "\n";

  var confRule = de
    ? "\nKONFIDENZ: confidence muss genau einer dieser Werte sein: \"hoch\", \"mittel\", \"niedrig\". Keine anderen Werte, keine Unterstriche.\n"
    : "\nCONFIDENCE: confidence must be exactly one of: \"high\", \"medium\", \"low\". No other values, no underscores.\n";

  var unclassRule = de
    ? "\nNICHT-KLASSIFIZIERBAR: Wenn Angaben zu Tätigkeit/Sektor fehlen oder zu unspezifisch sind, setze unclassifiable=true, primary_sector=null, primary_onace=null, entity_type=\"keine\", confidence=\"niedrig\" und erlaeutere in reasoning kurz, welche Angaben fehlen.\n"
    : "\nUNCLASSIFIABLE: If activity/sector information is missing or too unspecific, set unclassifiable=true, primary_sector=null, primary_onace=null, entity_type=\"none\", confidence=\"low\" and briefly explain in reasoning which information is missing.\n";

  var exJson = de
    ? '{"primary_sector":"A2.05 Verarbeitendes Gewerbe (kritisch)","sector_annex":"2","primary_onace":"28.99","primary_onace_label":"Herst. sonstiger Spezialmaschinen","matched_sectors":[],"size_class":"gross","size_reason":"~700 Mitarbeiter, Umsatz >100 Mio. €","entity_type":"wichtig","confidence":"hoch","reasoning":"Max 2 Saetze.","sources_used":["firmenabc.at","products"],"unclassifiable":false,"exception_applies":false,"exception_reason":null}'
    : '{"primary_sector":"A2.05 Manufacturing (critical)","sector_annex":"2","primary_onace":"28.99","primary_onace_label":"Manufacture of other special-purpose machinery","matched_sectors":[],"size_class":"large","size_reason":"~700 employees, turnover >€100M","entity_type":"important","confidence":"high","reasoning":"Max 2 sentences.","sources_used":["firmenabc.at","products"],"unclassifiable":false,"exception_applies":false,"exception_reason":null}';

  var prodStr = products || (compData && compData.products) || "-";

  // Static prefix: NISG legal framing + sectors + rules — cached across calls
  // in the same language via cache_control: ephemeral.
  var staticPrefix = de
    ? ("Experte NISG 2026 (BGBl 23.12.2025, in Kraft ab 1.10.2026) + EU-Richtlinie 2022/2555 (NIS-2) + EU-Empfehlung 2003/361 + ÖNACE 2025.\n\nAnlage 1 (wesentliche Einrichtungen):\n" + NISG_SECTORS_A1.map(function(s) { return s.key + " " + s.name + " — " + s.hint; }).join("\n") + "\n\nAnlage 2 (wichtige Einrichtungen):\n" + NISG_SECTORS_A2.map(function(s) { return s.key + " " + s.name + " — " + s.hint; }).join("\n") + sizeRule + exceptionsRule + confRule + unclassRule + "\nWICHTIG: reasoning max. 2 Saetze. entity_type: \"wesentlich\" | \"wichtig\" | \"keine\". sector_annex: \"1\" | \"2\" | null. Antworte NUR mit gueltigem JSON ohne Zeilenumbrueche in Strings.\nAntworte NUR als JSON nach diesem Schema: " + exJson)
    : ("Expert NISG 2026 (Austrian NIS-2 transposition; published 23 Dec 2025 in BGBl, in force 1 Oct 2026) + EU Directive 2022/2555 + EU Recommendation 2003/361 + ÖNACE 2025.\n\nAnnex 1 (essential entities):\n" + NISG_SECTORS_A1.map(function(s) { return s.key + " " + s.name + " — " + s.hint; }).join("\n") + "\n\nAnnex 2 (important entities):\n" + NISG_SECTORS_A2.map(function(s) { return s.key + " " + s.name + " — " + s.hint; }).join("\n") + sizeRule + exceptionsRule + confRule + unclassRule + "\nIMPORTANT: reasoning max. 2 sentences. entity_type: \"essential\" | \"important\" | \"none\". sector_annex: \"1\" | \"2\" | null. Reply ONLY with valid JSON, no line breaks in string values.\nReply ONLY as JSON matching this schema: " + exJson);

  var variableSuffix = de
    ? ("Bestimme NISG-Zuordnung fuer: " + company + "\nProdukte/Taetigkeiten: " + prodStr + contextParts.join(""))
    : ("Determine NISG classification for: " + company + "\nProducts/activities: " + prodStr + contextParts.join(""));

  var msgContent = [
    { type: "text", text: staticPrefix, cache_control: { type: "ephemeral" } },
    { type: "text", text: variableSuffix }
  ];
  var txt = await callClaude([{ role: "user", content: msgContent }], false, 2500, signal, 30000);
  var parsed = parseJson(txt);

  // Normalize matched_sectors: may be objects
  if (Array.isArray(parsed.matched_sectors)) {
    parsed.matched_sectors = parsed.matched_sectors.map(function(entry) {
      if (typeof entry === "object" && entry !== null) return entry.name || entry.key || entry.sector || "";
      return String(entry);
    }).filter(Boolean);
  }

  // Normalize entity_type: accept EN/DE
  var etRaw = String(parsed.entity_type || "").toLowerCase();
  var etMap = { wesentlich: "wesentlich", essential: "wesentlich", wichtig: "wichtig", important: "wichtig", keine: "keine", none: "keine", "": "keine" };
  parsed.entity_type = etMap[etRaw] || "keine";

  // Normalize size_class: accept EN/DE
  var scRaw = String(parsed.size_class || "").toLowerCase();
  var scMap = { klein: "klein", small: "klein", mittel: "mittel", medium: "mittel", gross: "gross", "groß": "gross", large: "gross", unbekannt: "unbekannt", unknown: "unbekannt", "": "unbekannt" };
  parsed.size_class = scMap[scRaw] || "unbekannt";

  // Canonicalise unclassifiable — same treatment as bsig.tsx PR #13.
  var sectorStr = parsed.primary_sector == null ? "" : String(parsed.primary_sector).trim();
  if (!sectorStr || parsed.unclassifiable) {
    parsed.unclassifiable = true;
    parsed.primary_sector = null;
    parsed.primary_onace = null;
    parsed.primary_onace_label = null;
    parsed.entity_type = "keine";
    parsed.sector_annex = null;
  }

  return parsed;
}

// ── i18n ─────────────────────────────────────────────────────────────────────
function mk(l) {
  var de = l === "de";
  return {
    title:    de ? "NISG 2026 Scope Checker" : "NISG 2026 Scope Checker",
    subtitle: de ? "Österreich · in Kraft ab 1. Oktober 2026" : "Austria · in force from 1 October 2026",
    forLine:  de ? "Für IT-Sicherheitsverantwortliche österreichischer Unternehmen" : "For IT security officers in Austrian companies",
    modeL:    de ? "Kennen Sie Ihre ÖNACE-Nummer(n)?" : "Do you know your ÖNACE code(s)?",
    modeYes:  de ? "Ja — ÖNACE direkt eingeben" : "Yes — enter ÖNACE code(s) directly",
    modeNo:   de ? "Nein — Firma / Produkte analysieren (KI)" : "No — analyse company / products (AI)",
    compL:    de ? "Firmenname" : "Company name",
    compPh:   de ? "z.B. ENGEL AUSTRIA GmbH" : "e.g. ENGEL AUSTRIA GmbH",
    locL:     de ? "Bundesland / Ort" : "State / City",
    locPh:    de ? "z.B. Schwertberg, Oberösterreich" : "e.g. Schwertberg, Upper Austria",
    prodL:    de ? "Produkte / Tätigkeiten" : "Products / activities",
    prodPh:   de ? "z.B. Kunststoff-Spritzgießmaschinen" : "e.g. plastic injection-moulding machines",
    onaceL:   de ? "ÖNACE-Nummer(n) (ÖNACE 2025)" : "ÖNACE code(s) (ÖNACE 2025)",
    onaceHint:de ? "Format: NN, NN.NN oder NN.NN-NN. Firmen können mehrere Codes haben — alle hinzufügen." : "Format: NN, NN.NN or NN.NN-NN. Companies may have multiple codes — add all of them.",
    addOnace: de ? "+ Weitere ÖNACE-Nummer hinzufügen" : "+ Add another ÖNACE code",
    onacePh:  de ? "z.B. 28.99" : "e.g. 28.99",
    analyze:  de ? "Analyse starten" : "Start analysis",
    analyzing:de ? "Analysiere …" : "Analysing …",
    cancel:   de ? "Abbrechen" : "Cancel",
    checkNow: de ? "Prüfen" : "Check",
    step0:    de ? "Firmensuche" : "Company lookup",
    step1:    de ? "Sektor-Klassifikation" : "Sector classification",
    step2:    de ? "Ergebnis" : "Result",
    quellen:  de ? "Genutzte Quellen" : "Sources used",
    srcFa:    "firmenabc.at",
    srcNd:    "northdata",
    srcFb:    de ? "Firmenbuch" : "Firmenbuch",
    srcProd:  de ? "Produkte" : "Products",
    srcDirect:de ? "Direkte Eingabe" : "Direct entry",
    scopeSector: de ? "Sektor" : "Sector",
    scopeAnnex:  de ? "Anlage" : "Annex",
    scopeOnace:  de ? "ÖNACE" : "ÖNACE",
    scopeEntity: de ? "Einrichtungsart" : "Entity type",
    scopeSize:   de ? "Größenklasse" : "Size class",
    confLabel:   de ? "Konfidenz" : "Confidence",
    reasoning:   de ? "Begründung" : "Reasoning",
    entWes:      de ? "Wesentliche Einrichtung" : "Essential entity",
    entWich:     de ? "Wichtige Einrichtung"    : "Important entity",
    entKeine:    de ? "Nicht erfasst"           : "Not covered",
    sizeKlein:   de ? "klein"      : "small",
    sizeMittel:  de ? "mittel"     : "medium",
    sizeGross:   de ? "groß"       : "large",
    sizeUnbek:   de ? "unbekannt"  : "unknown",
    verdictWesH: de ? "Voraussichtlich WESENTLICHE Einrichtung — NISG 2026 Anlage 1" : "Likely ESSENTIAL entity — NISG 2026 Annex 1",
    verdictWesB: de ? "Ihr Unternehmen fällt voraussichtlich als wesentliche Einrichtung in den Anwendungsbereich des NISG 2026 (Anlage 1)." : "Your company likely falls in scope of NISG 2026 as an essential entity (Annex 1).",
    verdictWicH: de ? "Voraussichtlich WICHTIGE Einrichtung — NISG 2026 Anlage 2" : "Likely IMPORTANT entity — NISG 2026 Annex 2",
    verdictWicB: de ? "Ihr Unternehmen fällt voraussichtlich als wichtige Einrichtung in den Anwendungsbereich des NISG 2026 (Anlage 2)." : "Your company likely falls in scope of NISG 2026 as an important entity (Annex 2).",
    verdictOutH: de ? "Voraussichtlich außerhalb des Anwendungsbereichs" : "Likely outside scope",
    verdictOutB: de ? "Ihr Unternehmen fällt nach den vorliegenden Angaben voraussichtlich nicht unter das NISG 2026 — entweder weil kein einschlägiger Sektor vorliegt oder weil die Size-Cap-Rule greift. Prüfen Sie die Size-Cap-Ausnahmen (z.B. DNS, TLD, öffentliche Verwaltung, alleiniger Anbieter)." : "Based on the available information your company likely does not fall under NISG 2026 — either no relevant sector applies or the size-cap rule excludes you. Check the size-cap exceptions (DNS, TLD, public administration, sole provider, …).",
    unclassH:    de ? "Sektor konnte nicht bestimmt werden" : "Sector could not be determined",
    unclassB:    de ? "Die KI konnte anhand der vorliegenden Angaben keinen NISG-Sektor zuordnen. Bitte konkrete Tätigkeiten oder Produkte im Feld „Produkte / Tätigkeiten“ ergänzen und Analyse erneut starten." : "The AI could not assign a NISG sector based on the available information. Please add concrete activities or products in the \"Products / activities\" field and re-run the analysis.",
    exceptionTitle: de ? "Size-Cap-Ausnahme greift" : "Size-cap exception applies",
    exceptionNote:  de ? "Diese Einrichtung fällt unabhängig von ihrer Größe in den Anwendungsbereich." : "This entity is in scope regardless of size.",
    registerTitle:  de ? "Registrierung bei der NIS-Meldestelle" : "Registration with the NIS reporting body",
    registerBody:   de ? "Betroffene Einrichtungen müssen sich bei der österreichischen NIS-Meldestelle registrieren. Bitte prüfen Sie interne Zuständigkeiten und Fristen — Details unter nis.gv.at." : "Affected entities must register with the Austrian NIS reporting body. Please check internal responsibilities and deadlines — details at nis.gv.at.",
    registerCta:    de ? "Zur NIS-Meldestelle (nis.gv.at)" : "Go to NIS reporting body (nis.gv.at)",
    aiSectorNoteTitle: de ? "KI-generierte NISG-Klassifikation" : "AI-generated NISG classification",
    aiSectorNote:      de ? "Diese Zuordnung wurde durch KI-Analyse ermittelt und sollte intern rechtlich bestätigt werden." : "This classification was determined by AI analysis and should be internally verified from a legal perspective.",
    vdmaMemberBadge:   de ? "VDMA Österreich-Mitglied" : "VDMA Österreich member",
    vdmaExclusiveTitle:de ? "Exklusive VDMA-NIS-2-Hilfen verfügbar" : "Exclusive VDMA NIS-2 guidance available",
    vdmaExclusiveBody: de ? "Als VDMA Österreich-Mitglied haben Sie Zugriff auf Praxisleitfäden, Musterdokumente und Beratung zur NIS-2- / NISG-2026-Umsetzung — überwiegend mitgliederexklusiv." : "As a VDMA Österreich member you have access to practical guides, template documents and consulting on NIS-2 / NISG 2026 implementation — most of it is member-exclusive.",
    vdmaExclusiveCta:  de ? "Zu den VDMA-NIS-2-Hilfen ↗" : "Go to VDMA NIS-2 guidance ↗",
    vdmaNonMemberTitle:de ? "Hinweis: VDMA-Mitgliedschaft" : "Note: VDMA membership",
    vdmaNonMemberNote: de ? "VDMA Österreich-Mitglieder erhalten exklusive NIS-2-Hilfen, Musterdokumente und Beratung. Nicht-Mitglieder können sich unter vdma.eu/de/oesterreich über Mitgliedschaft informieren." : "VDMA Österreich members receive exclusive NIS-2 guidance, templates and consulting. Non-members can learn about membership at vdma.eu/de/oesterreich.",
    vdmaNonMemberCta:  de ? "Zur VDMA Österreich ↗" : "Go to VDMA Österreich ↗",
    ndBadge:  de ? "ÖNACE explizit" : "ÖNACE explicit",
    ndNoNace: de ? "kein ÖNACE-Code" : "no ÖNACE code",
    onaceInvalid: de ? "Bitte gültige ÖNACE-Nummer eingeben (z.B. 28 oder 28.99)." : "Please enter a valid ÖNACE code (e.g. 28 or 28.99).",
    onaceNotFound: de ? "Die ÖNACE-Nummer {c} existiert nicht in ÖNACE 2025 (Division {d} ungültig)." : "ÖNACE code {c} does not exist in ÖNACE 2025 (division {d} invalid).",
    errRateLimit: de ? "API-Limit erreicht. Bitte kurz warten und erneut versuchen." : "API rate limit reached. Please wait a moment and try again.",
    errAuth:      de ? "Authentifizierungsfehler. Bitte Claude-Konto prüfen." : "Authentication error. Please check your Claude account.",
    errPhase1:    de ? "Firmensuche fehlgeschlagen. Bitte Firmennamen prüfen oder nur Tätigkeiten eingeben." : "Company lookup failed. Please check the company name or enter activities only.",
    errPhase2:    de ? "Sektor-Klassifikation fehlgeschlagen. Bitte erneut versuchen." : "Sector classification failed. Please try again.",
    reset:        de ? "Neue Prüfung" : "New check",
    empty:        de ? "Bitte mindestens Firmennamen oder Tätigkeiten angeben." : "Please provide at least a company name or activities.",
    disclaimer:   de ? "Erstorientierung — ersetzt keine Rechts- oder Fachberatung. Rechtsstand: NISG 2026 (BGBl 23. Dezember 2025, in Kraft ab 1. Oktober 2026) · ÖNACE 2025." : "For initial orientation only — does not replace legal or specialist advice. Legal status: NISG 2026 (Federal Law Gazette 23 December 2025, in force from 1 October 2026) · ÖNACE 2025.",
    resources:    de ? "Weiterführende Quellen" : "Further resources",
    resNisMelde:  de ? "NIS-Meldestelle (offizielle Anlaufstelle)"  : "NIS reporting body (official contact point)",
    resNisRl:     de ? "NIS-2-Richtlinie — Überblick"                : "NIS-2 directive — overview",
    resWko:       de ? "WKO — NISG 2026 Überblick"                   : "WKO — NISG 2026 overview",
    resStat:      de ? "Statistik Austria — ÖNACE 2025"              : "Statistics Austria — ÖNACE 2025",
    resFa:        de ? "firmenabc.at — Firmensuche mit ÖNACE"         : "firmenabc.at — company search with ÖNACE",
    resVdmaAt:    de ? "VDMA Österreich (Landesverband)"              : "VDMA Österreich (Austrian branch)",
    resVdmaHilfen:de ? "VDMA — NIS-2 / NISG 2026 Hilfen für Maschinenbauer" : "VDMA — NIS-2 / NISG 2026 guidance for machinery manufacturers",
  };
}

// ── Styles (adapted from bsig.tsx; Austrian palette: red + black) ────────────
var AT_RED = "#c8102e";
var AT_INK = "#0f172a";

var S = {
  lbl:  { fontWeight: 600, fontSize: 11.5, color: AT_INK, marginBottom: 6, textTransform: "uppercase", letterSpacing: .6, display: "block", fontFamily: "'Jost', 'Poppins', sans-serif" },
  inp:  { width: "100%", padding: "10px 14px", borderRadius: 4, border: "1.5px solid #E3E3E6", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none" },
  pri:  { background: AT_RED, color: "#fff", border: "none", borderRadius: 4, padding: "10px 24px", cursor: "pointer", fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Jost', 'Poppins', sans-serif" },
  sec:  { background: "#E3E3E6", color: AT_INK, border: "none", borderRadius: 4, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "'Jost', 'Poppins', sans-serif" },
  pill: function(bg, col) { return { display: "inline-flex", alignItems: "center", gap: 5, background: bg, borderRadius: 3, padding: "3px 10px", fontSize: 12, fontWeight: 600, color: col, fontFamily: "'Jost', 'Poppins', sans-serif" }; },
  link: function(col) { return { fontSize: 12.5, color: col || AT_RED, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }; },
  card: function(border, bg) { return { background: bg || "#fff", borderRadius: 6, border: "1.5px solid " + (border || "#E3E3E6"), padding: "14px 16px" }; },
};

var CONF_COL = { hoch: "#38a169", mittel: "#d69e2e", niedrig: "#e53e3e", "sehr niedrig": "#e53e3e", high: "#38a169", medium: "#d69e2e", low: "#e53e3e", "very low": "#e53e3e" };
var SRC_META = {
  "firmenabc.at":  { icon: "business",        bg: "#fee2e2", col: "#991b1b" },
  northdata:       { icon: "business",        bg: "#dbeafe", col: "#324C9C" },
  firmenbuch:      { icon: "account_balance", bg: "#ede9fe", col: "#5b21b6" },
  products:        { icon: "settings",        bg: "#fef9c3", col: "#854d0e" },
  direct:          { icon: "edit",            bg: "#f3f4f6", col: "#374151" },
};

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  );
}
function Spin() {
  return <span style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite", flexShrink: 0 }}/>;
}
function ExtIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

// ── API status bar ───────────────────────────────────────────────────────────
async function checkApiStatus() {
  try {
    var res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        "anthropic-version":"2023-06-01",
        "anthropic-dangerous-direct-browser-access":"true"
      },
      body: JSON.stringify({ model: "claude-haiku-4-5", max_tokens: 10, messages: [{ role: "user", content: "Hi" }] })
    });
    return res.status !== 401 && res.status !== 403;
  } catch(e) { return false; }
}

function ApiStatusBar({ lang, onReset }) {
  var [status, setStatus] = useState("checking");
  var de = lang === "de";
  function doCheck() {
    setStatus("checking");
    checkApiStatus().then(function(ok) { setStatus(ok ? "ok" : "error"); });
  }
  useEffect(function() { doCheck(); }, []);
  var cfgs = {
    checking: { dot: "#f59e0b", bg: "#FFF7E6", bdr: "#fde68a", col: "#B45309", label: de ? "Claude wird geprüft …" : "Checking Claude …", pulse: true },
    ok:       { dot: "#22c55e", bg: "#f0fdf4", bdr: "#bbf7d0", col: "#166534", label: de ? "Claude verfügbar" : "Claude available", pulse: false },
    error:    { dot: "#ef4444", bg: "#fff1f2", bdr: "#fecdd3", col: "#991b1b", label: de ? "Claude nicht erreichbar" : "Claude unavailable", pulse: false },
  };
  var c = cfgs[status];
  return (
    <div style={{ background: c.bg, border: "1px solid " + c.bdr, borderRadius: 8, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10, flexShrink: 0 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.dot, display: "block", position: "relative", zIndex: 1 }}/>
        {c.pulse && <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: c.dot, opacity: .5, animation: "ping 1.2s ease-in-out infinite" }}/>}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: c.col, flex: 1 }}>{c.label}</span>
      {status === "error" && (
        <button onClick={doCheck}
          style={{ background: "#FEF0F0", border: "1.5px solid #fca5a5", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12, color: "#991b1b", display: "flex", alignItems: "center", gap: 6 }}>
          ↺ {de ? "Erneut prüfen" : "Retry"}
        </button>
      )}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  var [lang, setLang]   = useState("de");
  var [mode, setMode]   = useState("ai");
  var [comp, setComp]   = useState("");
  var [loc, setLoc]     = useState("");
  var [prod, setProd]   = useState("");
  var [onaceInputs, setOnaceInputs] = useState([""]);
  var [busy, setBusy]   = useState(false);
  var [step, setStep]   = useState(-1);
  var [errors, setErrors] = useState({ general: "", phase1: "", phase2: "" });
  var [compData, setCompData] = useState(null);
  var [result, setResult]     = useState(null);
  var runningRef = useRef(false);
  var abortRef   = useRef(null);

  var t = useMemo(function() { return mk(lang); }, [lang]);

  function clearErrors() { setErrors({ general: "", phase1: "", phase2: "" }); }
  function reset() {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    setComp(""); setLoc(""); setProd(""); setOnaceInputs([""]);
    setResult(null); setCompData(null); setStep(-1); setBusy(false);
    runningRef.current = false;
    clearErrors();
  }

  function setOnaceAt(i, v) { setOnaceInputs(function(prev) { var n = prev.slice(); n[i] = v; return n; }); }
  function addOnace()      { setOnaceInputs(function(prev) { return prev.concat([""]); }); }
  function removeOnace(i)  { setOnaceInputs(function(prev) { return prev.filter(function(_, j) { return j !== i; }); }); }

  function handleDirectCheck() {
    clearErrors();
    var entries = onaceInputs.map(function(x) { return String(x || "").trim(); }).filter(Boolean);
    if (!entries.length) {
      setErrors(function(e) { return Object.assign({}, e, { general: t.onaceInvalid }); }); return;
    }
    var parsed = [];
    for (var i = 0; i < entries.length; i++) {
      var raw = entries[i].replace(/^[A-Za-z]/, "");
      var st  = validateOnaceRaw(raw);
      if (st === "format") { setErrors(function(e) { return Object.assign({}, e, { general: t.onaceInvalid + " (" + entries[i] + ")" }); }); return; }
      if (st === "notfound") {
        var num = parseFloat(raw);
        var d = String(Math.floor(num)).padStart(2, "0");
        setErrors(function(e) { return Object.assign({}, e, { general: t.onaceNotFound.replace("{c}", raw).replace("{d}", d) }); });
        return;
      }
      parsed.push({ code: raw });
    }
    // Direct mode: we don't have enough info to classify sector/size → show a
    // hint panel instead of guessing. This mode is a shortcut for users who
    // already know their ÖNACE and want to feed it into the AI phase later.
    // For v1 we simply pre-fill the products field with the codes and let
    // them run the AI flow next. Alternatively, we surface the codes as a
    // "direct" result the AI can be re-run against.
    setResult({
      directMode: true,
      primary_onace: parsed[0].code,
      primary_onace_label: null,
      all_entries: parsed,
      primary_sector: null,
      sector_annex: null,
      entity_type: "keine",
      size_class: "unbekannt",
      confidence: lang === "de" ? "niedrig" : "low",
      reasoning: lang === "de"
        ? "ÖNACE-Codes direkt eingegeben. Für eine vollständige NISG-Zuordnung bitte auch Tätigkeiten/Produkte im KI-Modus prüfen — der ÖNACE allein reicht nicht, da NISG tätigkeitsbezogen abgrenzt."
        : "ÖNACE codes entered directly. For a full NISG classification, also run the AI mode with activities/products — ÖNACE alone is insufficient because NISG delimits by activity, not code range.",
      sources_used: ["direct"],
      unclassifiable: false,
      exception_applies: false,
    });
  }

  async function handleAnalyze() {
    if (runningRef.current) return;
    if (!comp.trim() && !prod.trim()) {
      setErrors(function(e) { return Object.assign({}, e, { general: t.empty }); });
      return;
    }
    var ctrl = new AbortController();
    abortRef.current = ctrl;
    runningRef.current = true;
    setBusy(true); clearErrors(); setResult(null); setCompData(null);
    var cd = null;
    setStep(0);
    try {
      cd = await fetchCompanyData(comp, loc, lang, ctrl.signal);
      if (ctrl.signal.aborted) { runningRef.current = false; return; }
      if (prod.trim()) cd = Object.assign({}, cd, { products: prod.trim() });
      setCompData(cd);
    } catch(e) {
      if (ctrl.signal.aborted || e.name === "AbortError") { runningRef.current = false; return; }
      var msg1 = e.message === "RATE_LIMIT" ? t.errRateLimit : e.message === "AUTH_ERROR" ? t.errAuth : t.errPhase1;
      setErrors(function(ev) { return Object.assign({}, ev, { phase1: msg1 }); });
    }
    if (ctrl.signal.aborted) { runningRef.current = false; return; }
    setStep(1);
    try {
      var res = await analyzeSector(comp, prod, cd, lang, ctrl.signal);
      if (ctrl.signal.aborted) { runningRef.current = false; return; }
      setResult(res); setStep(2);
    } catch(e2) {
      if (ctrl.signal.aborted || e2.name === "AbortError") { runningRef.current = false; return; }
      var msg2 = e2.message === "RATE_LIMIT" ? t.errRateLimit : e2.message === "AUTH_ERROR" ? t.errAuth : t.errPhase2;
      setErrors(function(ev) { return Object.assign({}, ev, { phase2: msg2 }); });
      setStep(-1);
    }
    runningRef.current = false; abortRef.current = null; setBusy(false);
  }

  function cancel() {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    runningRef.current = false; setBusy(false); setStep(-1);
  }

  // ── Result panel colors keyed off entity_type ────────────────────────────
  function verdictColors(r) {
    if (!r) return { bg: "#f9fafb", bdr: "#e5e7eb", col: "#374151", head: "" };
    if (r.unclassifiable) return { bg: "#f9fafb", bdr: "#e5e7eb", col: "#374151", head: t.unclassH };
    if (r.entity_type === "wesentlich") return { bg: "#fef2f2", bdr: "#fca5a5", col: "#991b1b", head: t.verdictWesH };
    if (r.entity_type === "wichtig")    return { bg: "#fff7ed", bdr: "#fdba74", col: "#9a3412", head: t.verdictWicH };
    return { bg: "#f0fdf4", bdr: "#86efac", col: "#166534", head: t.verdictOutH };
  }

  function verdictBody(r) {
    if (!r) return "";
    if (r.unclassifiable) return t.unclassB;
    if (r.entity_type === "wesentlich") return t.verdictWesB;
    if (r.entity_type === "wichtig")    return t.verdictWicB;
    return t.verdictOutB;
  }

  function entityBadge(r) {
    if (!r || r.unclassifiable) return null;
    if (r.entity_type === "wesentlich") return { text: t.entWes, bg: "#fee2e2", col: "#991b1b" };
    if (r.entity_type === "wichtig")    return { text: t.entWich, bg: "#ffedd5", col: "#9a3412" };
    return { text: t.entKeine, bg: "#f3f4f6", col: "#374151" };
  }

  function sizeBadge(sc) {
    var map = { klein: t.sizeKlein, mittel: t.sizeMittel, gross: t.sizeGross, unbekannt: t.sizeUnbek };
    return map[sc] || t.sizeUnbek;
  }

  var v = verdictColors(result);

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", maxWidth: 780, margin: "0 auto", background: "#fff", minHeight: "100vh", boxShadow: "0 0 0 1px #E3E3E6" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg," + AT_RED + " 0%, #7f1d1d 100%)", color: "#fff", padding: "22px 32px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#fecaca", textTransform: "uppercase", marginBottom: 3 }}>NIS-2 · Österreich</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 3px" }}>{t.title}</h1>
            <div style={{ fontSize: 13, color: "#fecaca" }}>{t.subtitle}</div>
            <div style={{ fontSize: 12, color: "#fee2e2", marginTop: 2 }}>{t.forLine}</div>
          </div>
          <button onClick={function() { setLang(function(l) { return l === "de" ? "en" : "de"; }); }}
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 4, padding: "5px 12px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
            {lang === "de" ? "EN" : "DE"}
          </button>
        </div>
      </div>

      <div style={{ padding: "20px 32px 32px" }}>
        <ApiStatusBar lang={lang} onReset={function() { location.reload(); }}/>

        {/* Mode toggle */}
        <div style={{ marginBottom: 18 }}>
          <div style={S.lbl}>{t.modeL}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={function() { setMode("ai"); setResult(null); clearErrors(); }}
              style={Object.assign({}, mode === "ai" ? S.pri : S.sec, { flex: 1, minWidth: 200 })}>
              <MI name="smart_toy" size={16} color={mode === "ai" ? "#fff" : AT_INK}/>{t.modeNo}
            </button>
            <button onClick={function() { setMode("direct"); setResult(null); clearErrors(); }}
              style={Object.assign({}, mode === "direct" ? S.pri : S.sec, { flex: 1, minWidth: 200 })}>
              <MI name="edit" size={16} color={mode === "direct" ? "#fff" : AT_INK}/>{t.modeYes}
            </button>
          </div>
        </div>

        {/* AI mode form */}
        {mode === "ai" && (
          <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label style={S.lbl}>{t.compL}</label>
                <input style={S.inp} placeholder={t.compPh} value={comp} onChange={function(e) { setComp(e.target.value); }}/>
              </div>
              <div>
                <label style={S.lbl}>{t.locL}</label>
                <input style={S.inp} placeholder={t.locPh} value={loc} onChange={function(e) { setLoc(e.target.value); }}/>
              </div>
              <div>
                <label style={S.lbl}>{t.prodL}</label>
                <input style={S.inp} placeholder={t.prodPh} value={prod} onChange={function(e) { setProd(e.target.value); }}/>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {!busy && (
                <button style={S.pri} onClick={handleAnalyze}>
                  <MI name="play_arrow" size={16} color="#fff"/> {t.analyze}
                </button>
              )}
              {busy && (
                <button style={S.pri} onClick={cancel}>
                  <Spin/> {t.analyzing} · {t.cancel}
                </button>
              )}
              {(result || errors.phase1 || errors.phase2) && !busy && (
                <button style={S.sec} onClick={reset}>{t.reset}</button>
              )}
            </div>
            {busy && (
              <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 8 }}>
                <span>{step >= 0 ? "① " + t.step0 : ""}</span>
                <span>{step >= 1 ? "→ ② " + t.step1 : ""}</span>
                <span>{step >= 2 ? "→ ✓" : ""}</span>
              </div>
            )}
          </div>
        )}

        {/* Direct mode form */}
        {mode === "direct" && (
          <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={S.lbl}>{t.onaceL}</label>
              <div style={{ fontSize: 11.5, color: "#6b7280", marginBottom: 8 }}>{t.onaceHint}</div>
              {onaceInputs.map(function(v, i) {
                return (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    <input style={Object.assign({}, S.inp, { flex: 1 })} placeholder={t.onacePh} value={v}
                      onChange={function(e) { setOnaceAt(i, e.target.value); }}/>
                    {onaceInputs.length > 1 && (
                      <button onClick={function() { removeOnace(i); }}
                        style={{ background: "#fff", border: "1.5px solid #E3E3E6", borderRadius: 4, padding: "0 10px", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center" }} aria-label="remove">
                        <TrashIcon/>
                      </button>
                    )}
                  </div>
                );
              })}
              <button onClick={addOnace} style={{ background: "transparent", color: AT_RED, border: "none", padding: 0, fontSize: 12.5, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>{t.addOnace}</button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.pri} onClick={handleDirectCheck}>
                <MI name="fact_check" size={16} color="#fff"/> {t.checkNow}
              </button>
              {result && (
                <button style={S.sec} onClick={reset}>{t.reset}</button>
              )}
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.general && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: 4, padding: "8px 12px", fontSize: 13, marginBottom: 10 }}>
            <MI name="warning" size={14} color="#991b1b"/> {errors.general}
          </div>
        )}
        {errors.phase1 && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 4, padding: "8px 12px", fontSize: 13, marginBottom: 10 }}>
            <MI name="warning" size={14} color="#991b1b"/> {errors.phase1}
          </div>
        )}
        {errors.phase2 && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 4, padding: "8px 12px", fontSize: 13, marginBottom: 10 }}>
            <MI name="warning" size={14} color="#991b1b"/> {errors.phase2}
          </div>
        )}

        {/* Result panel */}
        {result && (
          <div style={{ borderRadius: 12, border: "2px solid " + v.bdr, overflow: "hidden", marginTop: 4 }}>
            {/* Verdict header */}
            <div style={{ background: v.bg, padding: "20px 24px", borderBottom: "1px solid " + v.bdr + "60" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <MI name={result.unclassifiable ? "help" : result.entity_type === "keine" ? "verified" : "warning"} size={28} color={v.col}/>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: v.col, marginBottom: 5 }}>{v.head}</div>
                  <p style={{ fontSize: 13.5, color: "#374151", margin: 0, lineHeight: 1.65 }}>{verdictBody(result)}</p>
                </div>
              </div>
            </div>

            {/* Sources + result body */}
            <div style={{ padding: "20px 24px", background: "#fff" }}>
              <div style={S.lbl}>{t.quellen}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {(result.sources_used || []).map(function(k, i) {
                  var srcMap = { "firmenabc.at": t.srcFa, northdata: t.srcNd, firmenbuch: t.srcFb, products: t.srcProd, direct: t.srcDirect };
                  var m = SRC_META[k] || { icon: "circle", bg: "#f3f4f6", col: "#374151" };
                  return <span key={i} style={S.pill(m.bg, m.col)}><MI name={m.icon} size={13} color={m.col}/> {srcMap[k] || k}</span>;
                })}
              </div>

              {result.unclassifiable ? (
                <div style={{ padding: "14px 16px", background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13.5, color: "#374151" }}>
                  {t.unclassB}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 14 }}>
                  {/* Sector tile */}
                  <div style={{ background: "#f0f4ff", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={Object.assign({}, S.lbl, { marginBottom: 4 })}>{t.scopeSector}</div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: AT_INK, lineHeight: 1.3 }}>{result.primary_sector || "—"}</div>
                    {result.sector_annex && (
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{t.scopeAnnex} {result.sector_annex}</div>
                    )}
                  </div>
                  {/* ÖNACE tile */}
                  <div style={{ background: "#fefce8", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={Object.assign({}, S.lbl, { marginBottom: 4 })}>{t.scopeOnace}</div>
                    <div style={{ fontWeight: 900, fontSize: 22, color: AT_INK, fontFamily: "monospace" }}>{result.primary_onace || "—"}</div>
                    {result.primary_onace_label && (
                      <div style={{ fontSize: 11.5, color: "#374151", marginTop: 4, lineHeight: 1.4 }}>{result.primary_onace_label}</div>
                    )}
                  </div>
                  {/* Entity type tile */}
                  {entityBadge(result) && (
                    <div style={{ background: entityBadge(result).bg, borderRadius: 10, padding: "14px 16px" }}>
                      <div style={Object.assign({}, S.lbl, { marginBottom: 4 })}>{t.scopeEntity}</div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: entityBadge(result).col }}>{entityBadge(result).text}</div>
                    </div>
                  )}
                  {/* Size class tile */}
                  <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={Object.assign({}, S.lbl, { marginBottom: 4 })}>{t.scopeSize}</div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: AT_INK }}>{sizeBadge(result.size_class)}</div>
                    {result.size_reason && (
                      <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 4, lineHeight: 1.4 }}>{result.size_reason}</div>
                    )}
                  </div>
                  {/* Confidence tile */}
                  {result.confidence && (function() {
                    var confRaw = String(result.confidence).replace(/_/g, " ");
                    var confLower = confRaw.toLowerCase();
                    var confDisplay = confRaw ? confRaw.charAt(0).toUpperCase() + confRaw.slice(1) : "";
                    return (
                      <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px" }}>
                        <div style={Object.assign({}, S.lbl, { marginBottom: 4 })}>{t.confLabel}</div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: CONF_COL[confLower] || "#374151" }}>{confDisplay}</div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Reasoning */}
              {result.reasoning && (
                <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: "3px solid " + AT_RED, marginBottom: 12 }}>
                  <div style={Object.assign({}, S.lbl, { marginBottom: 5 })}>{t.reasoning}</div>
                  <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.65 }}>{result.reasoning}</p>
                </div>
              )}

              {/* Size-cap exception callout */}
              {result.exception_applies && (
                <div style={{ padding: "11px 14px", background: "#FFF7E6", border: "1.5px solid #f59e0b", borderRadius: 8, marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#B45309", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <MI name="bolt" size={14} color="#F97F08"/>{t.exceptionTitle}
                  </div>
                  <p style={{ fontSize: 12.5, color: "#B45309", margin: 0, lineHeight: 1.6 }}>
                    {result.exception_reason || t.exceptionNote}
                  </p>
                </div>
              )}

              {/* Registration guidance for in-scope entities */}
              {!result.unclassifiable && (result.entity_type === "wesentlich" || result.entity_type === "wichtig") && (
                <div style={{ padding: "13px 15px", background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 8, marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#991b1b", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <MI name="how_to_reg" size={16} color="#991b1b"/>{t.registerTitle}
                  </div>
                  <p style={{ fontSize: 12.5, color: "#7f1d1d", margin: "0 0 8px", lineHeight: 1.55 }}>{t.registerBody}</p>
                  <a href={NIS_MELDE} target="_blank" rel="noreferrer" style={S.link("#991b1b")}>
                    <ExtIcon/>{t.registerCta}
                  </a>
                </div>
              )}

              {/* VDMA callout — only for in-scope entities. Members get an
                  amber box linking to member-exclusive NIS-2 guidance;
                  non-members / unknown get a soft grey pointer to membership. */}
              {!result.unclassifiable && (result.entity_type === "wesentlich" || result.entity_type === "wichtig") && (function() {
                var isMember = compData && (compData.vdma_at_member === true || (compData.vdma_at_member == null && knownVdmaAtMember(comp || compData.gegenstand)));
                if (isMember) {
                  return (
                    <div style={{ padding: "13px 15px", background: "#FFF7E6", border: "1.5px solid #f59e0b", borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#B45309", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                        <MI name="workspace_premium" size={16} color="#F97F08"/>{t.vdmaExclusiveTitle}
                      </div>
                      <p style={{ fontSize: 12.5, color: "#854d0e", margin: "0 0 8px", lineHeight: 1.55 }}>{t.vdmaExclusiveBody}</p>
                      <a href={VDMA_HILFEN} target="_blank" rel="noreferrer" style={S.link("#B45309")}>
                        <ExtIcon/>{t.vdmaExclusiveCta}
                      </a>
                    </div>
                  );
                }
                return (
                  <div style={{ padding: "12px 14px", background: "#f9fafb", border: "1px dashed #d1d5db", borderRadius: 8, marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#374151", marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                      <MI name="info" size={14} color="#6b7280"/>{t.vdmaNonMemberTitle}
                    </div>
                    <p style={{ fontSize: 12, color: "#4b5563", margin: "0 0 6px", lineHeight: 1.55 }}>{t.vdmaNonMemberNote}</p>
                    <a href={VDMA_AT_MEMBERSHIP} target="_blank" rel="noreferrer" style={S.link("#374151")}>
                      <ExtIcon/>{t.vdmaNonMemberCta}
                    </a>
                  </div>
                );
              })()}

              {/* AI-generated disclaimer (skip in direct mode and when unclassifiable) */}
              {!result.directMode && !result.unclassifiable && (
                <div style={{ padding: "10px 14px", background: "#FFF7E6", borderRadius: 8, border: "1px solid #FBBF24", marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#854d0e", marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                    <MI name="warning" size={14} color="#F97F08"/>{t.aiSectorNoteTitle}
                  </div>
                  <p style={{ fontSize: 12.5, color: "#B45309", margin: 0, lineHeight: 1.55 }}>{t.aiSectorNote}</p>
                </div>
              )}

              {/* Company card */}
              {compData && !result.directMode && (
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", border: "1.5px solid #E3E3E6" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>
                    {lang === "de" ? "Analysiertes Unternehmen" : "Analysed company"}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: AT_INK, marginBottom: 4, lineHeight: 1.3 }}>
                    {comp || compData.gegenstand || "—"}
                  </div>
                  {compData.ort && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                      <MI name="location_on" size={14} color={AT_RED}/>
                      <span style={{ fontSize: 13, color: "#374151" }}>{compData.ort}</span>
                    </div>
                  )}
                  {compData.rechtsform && (
                    <span style={{ fontSize: 11, background: "#fef2f2", color: "#991b1b", borderRadius: 4, padding: "2px 7px", fontWeight: 600, border: "1px solid #fecaca", marginRight: 5 }}>{compData.rechtsform}</span>
                  )}
                  {compData.firmenbuch_nummer && (
                    <span style={{ fontSize: 11, background: "#faf5ff", color: "#5b21b6", borderRadius: 4, padding: "2px 7px", fontWeight: 600, border: "1px solid #e9d5ff", marginRight: 5 }}>
                      {compData.firmenbuch_nummer}{compData.firmenbuch_gericht ? " · " + compData.firmenbuch_gericht : ""}
                    </span>
                  )}
                  {(compData.vdma_at_member === true || (compData.vdma_at_member == null && knownVdmaAtMember(comp || compData.gegenstand))) && (
                    <span title={compData.vdma_at_member_reason || ""} style={{ fontSize: 11, background: "#f0fdf4", color: "#166534", borderRadius: 4, padding: "2px 7px", fontWeight: 600, border: "1px solid #86efac", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <MI name="verified" size={12} color="#166534"/> {t.vdmaMemberBadge}
                    </span>
                  )}
                  {compData.firmenabc_url && (
                    <div style={{ marginTop: 8 }}>
                      <a href={compData.firmenabc_url} target="_blank" rel="noreferrer" style={S.link(AT_RED)}>
                        <ExtIcon/> firmenabc.at ↗
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resources */}
        <div style={{ marginTop: 26, background: "#f9fafb", borderRadius: 8, padding: "16px 20px" }}>
          <div style={Object.assign({}, S.lbl, { marginBottom: 10 })}>{t.resources}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <a href={NIS_MELDE}     target="_blank" rel="noreferrer" style={S.link()}><ExtIcon/>{t.resNisMelde}</a>
            <a href={NIS_RICHTLINIE} target="_blank" rel="noreferrer" style={S.link()}><ExtIcon/>{t.resNisRl}</a>
            <a href={WKO_NIS}       target="_blank" rel="noreferrer" style={S.link()}><ExtIcon/>{t.resWko}</a>
            <a href={STATISTIK_AT}  target="_blank" rel="noreferrer" style={S.link()}><ExtIcon/>{t.resStat}</a>
            <a href={FIRMENABC_BASE} target="_blank" rel="noreferrer" style={S.link()}><ExtIcon/>{t.resFa}</a>
            <a href={VDMA_AT_MEMBERSHIP} target="_blank" rel="noreferrer" style={S.link()}><ExtIcon/>{t.resVdmaAt}</a>
            <a href={VDMA_HILFEN}   target="_blank" rel="noreferrer" style={S.link()}><ExtIcon/>{t.resVdmaHilfen}</a>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: 20, fontSize: 11.5, color: "#6b7280", lineHeight: 1.6, padding: "10px 0", borderTop: "1px solid #e5e7eb" }}>
          {t.disclaimer}
        </div>
      </div>
    </div>
  );
}
