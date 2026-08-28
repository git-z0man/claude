import { useState, useCallback, useMemo, useRef, useEffect } from "react";

function MI({ name, size, color, fill, weight }) {
  return <span className="mi" style={{ fontSize: size || 20, color: color || "inherit", fontVariationSettings: ("'FILL' " + (fill ? 1 : 0) + ", 'wght' " + (weight || 300) + ", 'opsz' 24"), verticalAlign: "middle", display: "inline-block" }}>{name}</span>;
}

const BSIG_BASE     = "https://www.gesetze-im-internet.de/bsig_2025/";
const REUSCHLAW     = "https://bsi-gesetz.de/erwaegungsgruende/";
const BT_DRSACHE    = "https://dserver.bundestag.de/btd/21/015/2101501.pdf";
const VDMA_HILFEN   = "https://www.vdma.eu/de/viewer/-/v2article/render/161561890";
const VDMA_EVENTS   = "https://www.vdma.eu/de/kalender?searchKeyword=NIS2";
const BSI_INFOPAKET = "https://www.bsi.bund.de/DE/Themen/Regulierte-Wirtschaft/NIS-2-regulierte-Unternehmen/NIS-2-Infopakete/infopakete_node.html";
const DESTATIS_PDF  = "https://www.destatis.de/DE/Methoden/Klassifikationen/Gueter-Wirtschaftsklassifikationen/Downloads/klassifikation-wz-2008-3100100089004-aktuell.pdf?__blob=publicationFile&v=2";
const DESTATIS_XLSX = "https://www.destatis.de/DE/Methoden/Klassifikationen/Gueter-Wirtschaftsklassifikationen/Downloads/klassifikation-wz-2008-alpha-stichwortverzeichnis-aktuell.xlsx?__blob=publicationFile&v=2";
const BECK_NEG_URL  = "https://beck-online.beck.de/?sec=ICAgIGJlY2swODE1MDgxNTA4MTUwODE1ijrGubenoHXO%2fPl6Y0Uv7sWT0jVh%2bSSq1HsRwydto1HwSGJkwKY5kt4sWMXwr2Vj%2fkV3AIj06%2fdjjGAmXqJ4WtV52bs95rXYHbaFfoATzgundrVuv%2f0eW3BIM2lFnY7PinBEy2Wz5fdur2XEsjQyDCW%2b3ud9LFfcB8CcDf%2biIHM%3d";
const NORTHDATA_BASE = "https://www.northdata.de";

const WZ_LABELS = {
  "26":      "Herst. von Datenverarbeitungsgeräten, elektronischen u. optischen Erzeugnissen",
  "26.1":    "Herst. von elektronischen Bauelementen und Leiterplatten",
  "26.11":   "Herst. von elektronischen Bauelementen",
  "26.11.0": "Herst. von elektronischen Bauelementen",
  "26.12":   "Herst. von bestückten Leiterplatten",
  "26.12.0": "Herst. von bestückten Leiterplatten",
  "26.2":    "Herst. von Datenverarbeitungsgeräten und peripheren Geräten",
  "26.20":   "Herst. von Datenverarbeitungsgeräten und peripheren Geräten",
  "26.20.0": "Herst. von Datenverarbeitungsgeräten und peripheren Geräten",
  "26.3":    "Herst. von Geräten und Einrichtungen der Telekommunikationstechnik",
  "26.30":   "Herst. von Geräten und Einrichtungen der Telekommunikationstechnik",
  "26.30.0": "Herst. von Geräten und Einrichtungen der Telekommunikationstechnik",
  "26.4":    "Herst. von Geräten der Unterhaltungselektronik",
  "26.40":   "Herst. von Geräten der Unterhaltungselektronik",
  "26.40.0": "Herst. von Geräten der Unterhaltungselektronik",
  "26.5":    "Herst. von Mess-, Kontroll-, Navigations- u.ä. Instrumenten; Herst. von Uhren",
  "26.51":   "Herst. von Mess-, Kontroll-, Navigations- u.ä. Instrumenten und Vorrichtungen",
  "26.51.0": "Herst. von Mess-, Kontroll-, Navigations- u.ä. Instrumenten und Vorrichtungen",
  "26.52":   "Herst. von Uhren",
  "26.52.0": "Herst. von Uhren",
  "26.6":    "Herst. von Bestrahlungs- und Elektrotherapiegeräten und elektromedizinischen Geräten",
  "26.60":   "Herst. von Bestrahlungs- und Elektrotherapiegeräten und elektromedizinischen Geräten",
  "26.60.0": "Herst. von Bestrahlungs- und Elektrotherapiegeräten und elektromedizinischen Geräten",
  "26.7":    "Herst. von optischen und fotografischen Instrumenten und Geräten",
  "26.70":   "Herst. von optischen und fotografischen Instrumenten und Geräten",
  "26.70.0": "Herst. von optischen und fotografischen Instrumenten und Geräten",
  "26.8":    "Herst. von magnetischen und optischen Datenträgern",
  "26.80":   "Herst. von magnetischen und optischen Datenträgern",
  "26.80.0": "Herst. von magnetischen und optischen Datenträgern",
  "27":      "Herst. von elektrischen Ausrüstungen",
  "27.1":    "Herst. von Elektromotoren, Generatoren, Transformatoren sowie Elektrizitätsverteilungs- und -schalteinrichtungen",
  "27.11":   "Herst. von Elektromotoren, Generatoren und Transformatoren",
  "27.11.0": "Herst. von Elektromotoren, Generatoren und Transformatoren",
  "27.12":   "Herst. von Elektrizitätsverteilungs- und -schalteinrichtungen",
  "27.12.0": "Herst. von Elektrizitätsverteilungs- und -schalteinrichtungen",
  "27.2":    "Herst. von Batterien und Akkumulatoren",
  "27.20":   "Herst. von Batterien und Akkumulatoren",
  "27.20.0": "Herst. von Batterien und Akkumulatoren",
  "27.3":    "Herst. von Kabeln und elektrischen Installationseinrichtungen",
  "27.31":   "Herst. von Glasfaserkabeln",
  "27.31.0": "Herst. von Glasfaserkabeln",
  "27.32":   "Herst. von sonstigen elektronischen und elektrischen Drähten und Kabeln",
  "27.32.0": "Herst. von sonstigen elektronischen und elektrischen Drähten und Kabeln",
  "27.33":   "Herst. von elektrischem Installationsmaterial",
  "27.33.0": "Herst. von elektrischem Installationsmaterial",
  "27.4":    "Herst. von elektrischen Lampen und Leuchten",
  "27.40":   "Herst. von elektrischen Lampen und Leuchten",
  "27.40.0": "Herst. von elektrischen Lampen und Leuchten",
  "27.5":    "Herst. von Haushaltsgeräten",
  "27.51":   "Herst. von elektrischen Haushaltsgeräten",
  "27.51.0": "Herst. von elektrischen Haushaltsgeräten",
  "27.52":   "Herst. von nicht elektrischen Haushaltsgeräten",
  "27.52.0": "Herst. von nicht elektrischen Haushaltsgeräten",
  "27.9":    "Herst. von sonstigen elektrischen Ausrüstungen und Geräten a.n.g.",
  "27.90":   "Herst. von sonstigen elektrischen Ausrüstungen und Geräten a.n.g.",
  "27.90.0": "Herst. von sonstigen elektrischen Ausrüstungen und Geräten a.n.g.",
  "28":      "Herst. von Maschinen und Ausrüstungen a.n.g.",
  "28.1":    "Herst. von nicht wirtschaftszweigspezifischen Maschinen",
  "28.11":   "Herst. von Verbrennungsmotoren und Turbinen (ohne Motoren für Luft- und Straßenfahrzeuge)",
  "28.11.0": "Herst. von Verbrennungsmotoren und Turbinen",
  "28.12":   "Herst. von hydraulischen und pneumatischen Komponenten und Systemen",
  "28.12.0": "Herst. von hydraulischen und pneumatischen Komponenten und Systemen",
  "28.13":   "Herst. von sonstigen Pumpen und Kompressoren a.n.g.",
  "28.13.0": "Herst. von sonstigen Pumpen und Kompressoren a.n.g.",
  "28.14":   "Herst. von sonstigen Armaturen a.n.g.",
  "28.14.0": "Herst. von sonstigen Armaturen a.n.g.",
  "28.15":   "Herst. von Lagern, Getrieben, Zahnrädern und Antriebselementen",
  "28.15.0": "Herst. von Lagern, Getrieben, Zahnrädern und Antriebselementen",
  "28.2":    "Herst. von sonstigen nicht wirtschaftszweigspezifischen Maschinen",
  "28.21":   "Herst. von Öfen und Brennern",
  "28.21.0": "Herst. von Öfen und Brennern",
  "28.22":   "Herst. von Hebezeugen und Fördermitteln",
  "28.22.0": "Herst. von Hebezeugen und Fördermitteln",
  "28.23":   "Herst. von Büromaschinen (ohne Herst. von DV-Geräten und peripheren Geräten)",
  "28.23.0": "Herst. von Büromaschinen",
  "28.24":   "Herst. von kraftbetriebenen Handwerkzeugen",
  "28.24.0": "Herst. von kraftbetriebenen Handwerkzeugen",
  "28.25":   "Herst. von Kälte- und Klimaanlagen, nicht für den Haushaltsbereich",
  "28.25.0": "Herst. von Kälte- und Klimaanlagen",
  "28.29":   "Herst. von sonstigen nicht wirtschaftszweigspezifischen Maschinen a.n.g.",
  "28.29.0": "Herst. von sonstigen Maschinen a.n.g.",
  "28.3":    "Herst. von land- und forstwirtschaftlichen Maschinen",
  "28.30":   "Herst. von land- und forstwirtschaftlichen Maschinen",
  "28.30.0": "Herst. von land- und forstwirtschaftlichen Maschinen",
  "28.4":    "Herst. von Maschinen für die Metallerzeugung, von Ziehmaschinen und Werkzeugmaschinen",
  "28.41":   "Herst. von Maschinen für die Metallbearbeitung",
  "28.41.0": "Herst. von Maschinen für die Metallbearbeitung",
  "28.49":   "Herst. von sonstigen Werkzeugmaschinen",
  "28.49.0": "Herst. von sonstigen Werkzeugmaschinen",
  "28.9":    "Herst. von Maschinen für sonstige bestimmte Wirtschaftszweige",
  "28.91":   "Herst. von Maschinen für die Metallerzeugung",
  "28.91.0": "Herst. von Maschinen für die Metallerzeugung",
  "28.92":   "Herst. von Bergwerks-, Bau- und Baustoffmaschinen",
  "28.92.0": "Herst. von Bergwerks-, Bau- und Baustoffmaschinen",
  "28.93":   "Herst. von Maschinen für die Nahrungs- und Genussmittelindustrie und Tabakverarbeitung",
  "28.93.0": "Herst. von Maschinen für die Nahrungs- und Genussmittelindustrie",
  "28.94":   "Herst. von Maschinen für die Textil- und Bekleidungsindustrie und die Lederverarbeitung",
  "28.94.0": "Herst. von Maschinen für die Textil- und Bekleidungsindustrie",
  "28.95":   "Herst. von Maschinen für die Papiererzeugung und -verarbeitung und für die Druckindustrie",
  "28.95.0": "Herst. von Maschinen für die Papier- und Druckindustrie",
  "28.96":   "Herst. von Maschinen für die Verarbeitung von Kunststoffen und Kautschuk",
  "28.96.0": "Herst. von Maschinen für die Kunststoff- und Kautschukverarbeitung",
  "28.99":   "Herst. von Maschinen für sonstige bestimmte Wirtschaftszweige a.n.g.",
  "28.99.0": "Herst. von Maschinen für sonstige bestimmte Wirtschaftszweige a.n.g.",
  "29":      "Herst. von Kraftwagen und Kraftwagenteilen",
  "29.1":    "Herst. von Kraftwagen",
  "29.10":   "Herst. von Kraftwagen",
  "29.10.0": "Herst. von Kraftwagen",
  "29.2":    "Herst. von Karosserien für Kraftfahrzeuge; Herst. von Anhängern und Sattelanhängern",
  "29.20":   "Herst. von Karosserien für Kraftfahrzeuge; Herst. von Anhängern und Sattelanhängern",
  "29.20.0": "Herst. von Karosserien für Kraftfahrzeuge",
  "29.3":    "Herst. von Teilen und Zubehör für Kraftwagen",
  "29.31":   "Herst. von elektrischen und elektronischen Ausrüstungen für Kraftwagen",
  "29.31.0": "Herst. von elektrischen und elektronischen Ausrüstungen für Kraftwagen",
  "29.32":   "Herst. von sonstigen Teilen und sonstigem Zubehör für Kraftwagen",
  "29.32.0": "Herst. von sonstigen Teilen und sonstigem Zubehör für Kraftwagen",
  "30":      "Sonstiger Fahrzeugbau",
  "30.1":    "Schiff- und Bootsbau",
  "30.11":   "Herst. von Wasserfahrzeugen für die Seeschifffahrt und für die Küstenschifffahrt",
  "30.11.0": "Herst. von Wasserfahrzeugen für die Seeschifffahrt",
  "30.12":   "Herst. von Sport- und Freizeitbooten",
  "30.12.0": "Herst. von Sport- und Freizeitbooten",
  "30.2":    "Herst. von Schienenfahrzeugen",
  "30.20":   "Herst. von Schienenfahrzeugen",
  "30.20.0": "Herst. von Schienenfahrzeugen",
  "30.3":    "Luft- und Raumfahrzeugbau",
  "30.30":   "Luft- und Raumfahrzeugbau",
  "30.30.0": "Luft- und Raumfahrzeugbau",
  "30.4":    "Herst. von militärischen Kampffahrzeugen",
  "30.40":   "Herst. von militärischen Kampffahrzeugen",
  "30.40.0": "Herst. von militärischen Kampffahrzeugen",
  "30.9":    "Herst. von Fahrzeugen a.n.g.",
  "30.91":   "Herst. von Krafträdern",
  "30.91.0": "Herst. von Krafträdern",
  "30.92":   "Herst. von Fahrrädern sowie von Behindertenfahrzeugen",
  "30.92.0": "Herst. von Fahrrädern sowie von Behindertenfahrzeugen",
  "30.99":   "Herst. von sonstigen Fahrzeugen a.n.g.",
  "30.99.0": "Herst. von sonstigen Fahrzeugen a.n.g.",
};

// ── GP 2019 Güterverzeichnis (Statistisches Bundesamt) ──────────────────────
// Vendored product index for Abteilungen 25-30, parsed from the official PDFs.
//
//   Abt. 26-30  in scope for BSIG 2025 Anlage 2 Nr. 5 (WZ 26.xx-30.99)
//   Abt. 25     OUT of scope - carried deliberately as a negative signal, so a
//               metalworking product (Behälter, Schmiedeteile, Schlösser,
//               Werkzeuge) resolves to "nicht einschlägig" with a citation
//               instead of being pattern-matched into a 28.xx machine class.
//
// The Meldenummer carries the WZ class in its first four digits
// (2830 86 601 -> WZ 28.30), which makes this a deterministic product->WZ
// lookup: no inference, and every hit can cite its catalogue number.
//
// GP_PATHS: parent headings, interned and referenced by index.
// GP_INDEX: one entry per line, "<9-digit Meldenummer>|<path index>|<label>".
const GP_PATHS = `Vorgefertigte Gebäude aus Eisen, Stahl oder Aluminiu > Vorgefertigte Gebäude aus Eisen oder Stah
Vorgefertigte Gebäude aus Eisen, Stahl oder Aluminiu
Brücken und Brückenelemente, aus Eisen oder Stah

Andere Konstruktionen und Konstruktionsteile, vorgearbeitete Bleche, Stäbe, Profile u.dgl., aus Eisen, Stahl oder Aluminiu > Gerüst-, Schalungs- oder Stützmaterial, aus Eisen oder Stah
Andere Konstruktionen und Konstruktionsteile, vorgearbeitete Bleche, Stäbe, Profile u.dgl., aus Eisen, Stahl oder Aluminiu
Konstruktionen für den Wasserbau u.a. Konstruktionen und zu Konstruktionszwecken vorgearbeitete Stäbe, Profile u.dgl., aus Eisen oder Stah
Andere Konstruktionen und zu Konstruktionszwecken vorgearbeitete Stäbe, Profile u.dgl., aus Eisen oder Stah > Skelettkonstruktionen, Stütz- und Trägerkonstruktionen für den Anlagenbau sowie für andere Zwecke, aus Eisen oder Stah
Andere Konstruktionen und zu Konstruktionszwecken vorgearbeitete Stäbe, Profile u.dgl., aus Eisen oder Stah
Konstruktionen und Konstruktionsteile sowie zu Konstruktionszwecken vorgearbeitete Bleche, Profile u.dgl., aus Aluminium (z.B. vorgefertigte Fassadenelemente; ohne Tore, Türen, Fenster usw.)
aus Eisen oder Stah > Tore, Türen, Fenster, Tor- und Türschwellen, deren Rahmen und Verkleidungen
Tore, Türen, Fenster, deren Rahmen und Verkleidungen, Tor- und Türschwellen, aus Eisen, Stahl oder Aluminiu > aus Eisen oder Stah
Tore, Türen, Fenster, deren Rahmen und Verkleidungen, Tor- und Türschwellen, aus Eisen, Stahl oder Aluminiu > aus Aluminium - - Tore, Türen, Fenster, Tor- und Türschwellen, deren Rahmen und Verkleidungen
Zentralheizungskessel für die Warmwasser- und Niederdruckdampferzeugun
Tanks, Sammelbehälter, Fässer, Bottiche u.ä. Behälter (ohne solche für verdichtete oder verflüssigte Gase), aus Eisen, Stahl oder Aluminium, mit einem Fassungsvermögen von mehr als 300 l (ohne mechanische und wärmetechnische Einrichtungen)
Tanks, Sammelbehälter, Fässer, Bottiche u.ä. Behälter (ohne solche für verdichtete oder verflüssigte Gase), aus Eisen, Stahl oder Aluminium, mit einem Fassungsvermögen von mehr als 300 l (ohne mechanische und wärmetechnische Einrichtungen) > für flüssige Stoffe, mit Innenauskleidung oder Wärmeschutzverkleidung, aus Eisen oder Stah
Tanks, Sammelbehälter, Fässer, Bottiche u.ä. Behälter (ohne solche für verdichtete oder verflüssigte Gase), aus Eisen, Stahl oder Aluminium, mit einem Fassungsvermögen von mehr als 300 l (ohne mechanische und wärmetechnische Einrichtungen) > Andere Behälter für flüssige Stoffe, aus Eisen oder Stahl
Tanks, Sammelbehälter, Fässer, Bottiche u.ä. Behälter (ohne solche für verdichtete oder verflüssigte Gase), aus Eisen, Stahl oder Aluminium, mit einem Fassungsvermögen von mehr als 300 l (ohne mechanische und wärmetechnische Einrichtungen) > Andere Behälter für feste Stoffe, aus Eisen oder Stahl
Dampfkessel (Dampferzeuger) für die Heißwasser- und Niederdruck- dampferzeugung; Kessel zum Erzeugen von überhitztem Wasser
Hilfsapparate für Zentralheizungskessel, Dampfkessel und Kessel zum Erzeugen von überhitztem Wasser; Kondensatoren für Dampfkraftmaschinen
Teile für Dampfkessel, Kessel zum Erzeugen von überhitztem Wasser, Hilfsapparate für Kessel und Kondensatoren für Dampfkraftmaschinen
Revolver, Pistolen, nichtmilitärische Schusswaffen u.ä. Geräte
Revolver, Pistolen, nichtmilitärische Schusswaffen u.ä. Geräte > Jagd- und Sportgewehre (auch Vorderlader)
Säbel, Degen, Bajonette, Lanzen u.a. blanke Waffen, Teile und Scheiden dafür
Freiformschmiedestücke aus Stahl und NE-Metall > Freiformschmiedestücke aus Stahl
Freiformschmiedestücke, Kaltfließpressteile, aus Stahl und NE-Metal > Andere Freiformschmiedestücke aus Stahl
Freiformschmiedestücke, Kaltfließpressteile, aus Stahl und NE-Metal
Kaltfließpressteile aus Stahl und NE-Metall > aus Stahl
Gesenkschmiedeteile, aus Stahl und NE-Metal > aus Stahl
Gesenkschmiedeteile, aus Stahl und NE-Metal
Blechformteile, aus Stahl und NE-Metal > aus Stahl
Blechformteile, aus Stahl und NE-Metal
Pulvermetallurgische Erzeugnisse aus Stahlpulver oder NE-Metallpulver > aus Stahlpulver
Pulvermetallurgische Erzeugnisse aus Stahlpulver oder NE-Metallpulver
Überzüge von Metallen Metallische Überzüge
Beschichtungen, metallische Vakuumplattierungen an Kunststoffteilen und - oberflächen Edelmetallplattierungen, bei denen auf einer Metallunterlage auf einer Seite oder mehreren Seiten Edellmetalle durch Löten, Schweißen, Warmwalzen o.ä.mechanische Verfahren aufgebracht sind Nichtmetallische Überzüge
Andere Veredlung von Metalloberflächen
Drehteile aus Metal > Drehteile aus Metall für Armaturen, sonstige Maschinenbauerzeugnisse, Straßen-, Luft- und Raumfahrzeuge, Satelliten
Drehteile aus Metal > Drehteile aus Metall für elektrotechnische, feinmechanische und optische Erzeugnisse
Drehteile aus Metal
Andere Mechanikleistungen, a.n.g
Messer (ohne solche für Maschinen); Griffe und Klingen für Messer; Scheren und Scherenblätter
Messer (ohne solche für Maschinen); Griffe und Klingen für Messer; Scheren und Scherenblätter > Andere Messer mit feststehender Klinge
Messer (ohne solche für Maschinen); Griffe und Klingen für Messer; Scheren und Scherenblätter > Scheren und Scherenblätter
Rasierapparate, Rasiermesser, Rasierklingen u.a. Teile für Rasierapparate und -messer
Elektrische Rasierapparate, Haarschneide- und Schermaschinen sowie Haarentferner (Epilatoren) Andere Schneidwaren; Instrumente und Zusammenstellungen für die Hand- und Fußpflege
Löffel, Gabeln, Schöpfkellen, Schaumlöffel, Tortenheber, Fischmesser, Buttermesser, Zuckerzangen u.ä. Erzeugnisse
Vorhängeschlösser, Schlösser für Kraftfahrzeuge und Möbel, aus unedlen Metallen
Vorhängeschlösser, Schlösser für Kraftfahrzeuge und Möbel, aus unedlen Metallen > Möbelschlösser
Andere Schlösser und Sicherheitsriegel, aus unedlen Metallen > Zylinderschlösser für Gebäudetüren
Andere Schlösser und Sicherheitsriegel, aus unedlen Metallen
Schließzylinder für Türen - Schlösser für Panzerschränke, andere Schlösser und Sicherheitsriegel
Verschlüsse und Verschlussbügel mit Schloss, aus unedlen Metallen; Schlüssel, gesondert gestellt sowie Teile für Schlösser und Sicherheitsriegel, aus unedlen Metallen
Verschlüsse und Verschlussbügel mit Schloss, aus unedlen Metallen; Schlüssel, gesondert gestellt sowie Teile für Schlösser und Sicherheitsriegel, aus unedlen Metallen > Teile für Schlösser und Sicherheitsriege
Beschläge u.ä. Erzeugnisse für Kraftfahrzeuge, Türen, Fenster, Möbel, Koffer u.a. derartige Waren, aus unedlen Metallen; automatische Türschließer, aus unedlen Metallen > Scharniere
Beschläge u.ä. Erzeugnisse für Kraftfahrzeuge, Türen, Fenster, Möbel, Koffer u.a. derartige Waren, aus unedlen Metallen; automatische Türschließer, aus unedlen Metallen
Baubeschläge > für Fenster und Türen, aus Eisen oder Stahl
Beschläge u.ä. Erzeugnisse für Kraftfahrzeuge, Türen, Fenster, Möbel, Koffer u.a. derartige Waren, aus unedlen Metallen; automatische Türschließer, aus unedlen Metallen > für Fenster und Türen, aus anderen unedlen Metallen
Beschläge u.ä. Erzeugnisse für Kraftfahrzeuge, Türen, Fenster, Möbel, Koffer u.a. derartige Waren, aus unedlen Metallen; automatische Türschließer, aus unedlen Metallen > Beschläge für Möbel aus unedlen Metallen
Beschläge u.ä. Erzeugnisse für Kraftfahrzeuge, Türen, Fenster, Möbel, Koffer u.a. derartige Waren, aus unedlen Metallen; automatische Türschließer, aus unedlen Metallen > Andere Beschläge u.ä. Waren (z.B. für Täschnerwaren, Herde, Öfen, Fahrzeuge, Fenster-, Türvorhänge usw.)
Handwerkzeuge für die Landwirtschaft, den Gartenbau oder die Forstwirtschaf
Handsägen; Sägeblätter aller Art (einschl. Frässägeblätter und nicht gezahnter Sägeblätter)
Handsägen; Sägeblätter aller Art (einschl. Frässägeblätter und nicht gezahnter Sägeblätter) > Kreissägeblätter (einschl. Frässägeblättern) mit arbeitendem Teil aus Stahl
Handsägen; Sägeblätter aller Art (einschl. Frässägeblätter und nicht gezahnter Sägeblätter) > Kreissägeblätter (einschl. Frässägeblättern) mit arbeitendem Teil aus anderen Stoffen, einschl. Teile dafür
Handsägen; Sägeblätter aller Art (einschl. Frässägeblätter und nicht gezahnter Sägeblätter) > Langsägeblätter, andere Sägeblätter
Kreissägeblätter (einschl. Frässägeblättern) mit arbeitendem Teil aus anderen Stoffen, einschl. Teile dafür > Andere Sägeblätter mit arbeitendem Teil aus Stahl, für die Metall- bearbeitung sowie mit arbeitendem Teil aus anderen Stoffen für die Bearbeitung aller Stoffe
Andere Handwerkzeuge > Feilen, Raspeln, Pinzetten, Kneifzangen, andere Zangen u.ä. Handwerkzeuge
Andere Handwerkzeuge
Andere Handwerkzeuge > Scheren zum Schneiden von Metallen u.ä., Rohr-, Bolzenschneider, Locheisen, Lochzangen u.ä. Werkzeuge
Andere Handwerkzeuge > Von Hand zu betätigende Schrauben- und Spannschlüssel, Steckschlüsseleinsätze
Andere Handwerkzeuge > Bohrwerkzeuge, Gewindeschneid- und Gewindebohrwerkzeuge; Hämmer und Fäustel; Hobel, Stechbeitel u.ä. Schneidwerkzeuge, für die Holzbearbeitun
Schraubenzieher, Haushaltswerkzeuge
Werkzeuge für Maurer, Former, Gießer u.ä.; Werkzeuge zum Nieten, Befestigen von Bolzen, Dübeln; Glasschneider, Aufreiber, Nietzieher u.a. Handwerkzeuge, a.n.g
Lötlampen u.dgl.; Schraubstöcke, Schraubzwingen u.dgl.; Ambosse; tragbare Feldschmieden; Schleifapparate zum Hand- oder Fußbetrieb
Werkzeuge zum Herstellen von Innen- und Außengewinden > Werkzeuge zum Herstellen von Innengewinden, für die Metallbearbeitung
Auswechselbare Werkzeuge zur Verwendung in mechanischen oder nicht mechanischen Handwerkzeugen, auch kraft- betrieben, oder in Werkzeugmaschinen > Werkzeuge zum Herstellen von Innen- und Außengewinden
Auswechselbare Werkzeuge zur Verwendung in mechanischen oder nicht mechanischen Handwerkzeugen, auch kraft- betrieben, oder in Werkzeugmaschinen
Werkzeuge zum Herstellen von Innen- und Außengewinden > Werkzeuge zum Herstellen von Außengewinden, für die Metallbearbeitung - - - Gewindewalzwerkzeuge für Außengewinde (z.B. Gewindewalzrollen
Auswechselbare Werkzeuge zur Verwendung in mechanischen oder nicht mechanischen Handwerkzeugen, auch kraft- betrieben, oder in Werkzeugmaschinen > Bohrwerkzeuge mit arbeitendem Teil aus Diamant oder gesinterten Hartmetallen, Mauerbohrer
Auswechselbare Werkzeuge zur Verwendung in mechanischen oder nicht mechanischen Handwerkzeugen, auch kraft- betrieben, oder in Werkzeugmaschinen > Bohrwerkzeuge für die Metallbearbeitung (ohne solche mit arbeitendem Teil aus gesinterten Hartmetallen), andere Bohrwerkzeuge
Auswechselbare Werkzeuge zur Verwendung in mechanischen oder nicht mechanischen Handwerkzeugen, auch kraft- betrieben, oder in Werkzeugmaschinen > Reibahlen und Ausbohrwerkzeuge, für die Metallbearbeitun
Fräswerkzeuge mit arbeitendem Teil aus gesinterten Hartmetallen, für die Metallbearbeitun
Andere Fräswerkzeuge mit arbeitendem Teil aus anderen Stoffen
Andere Fräswerkzeuge mit arbeitendem Teil aus anderen Stoffen > Wälzfräswerkzeuge, für die Metallbearbeitung (z.B. für Verzahnungen sowie andere Fräswerkzeuge) für die Metallbearbeitung
Andere Fräswerkzeuge mit arbeitendem Teil aus anderen Stoffen > für die Bearbeitung anderer Stoffe
Drehwerkzeuge
Drehwerkzeuge > mit arbeitendem Teil aus anderen Stoffen für die Metallbearbeitun
Andere auswechselbare Werkzeuge
Andere auswechselbare Werkzeuge > Andere auswechselbare Werkzeuge mit arbeitendem Teil aus anderen Stoffen (ohne arbeitenden Teil aus Diamant oder agglomerierten Diamant, ohne Cermets)
Formen; Gießerei-Formkästen; Grundplatten für Formen; Gießereimodelle > Formen; Gießerei-Formkästen; Grundplatten für Formen; Gießereimodelle
Formen; Gießerei-Formkästen; Grundplatten für Formen; Gießereimodelle
Formen; Gießerei-Formkästen; Grundplatten für Formen; Gießereimodelle > Formen zum Spritzgießen oder Formpressen für Kautschuk oder Kunststoffe
Andere Werkzeuge > Erd-, Gesteins- oder Tiefbohrwerkzeuge
Andere Werkzeuge > Ziehwerkzeuge und Pressmatrizen zum Ziehen, Strang- oder Fließpressen von Metallen
Ziehwerkzeuge und Pressmatrizen zum Ziehen, Strang- oder Fließpressen von Metallen > mit arbeitendem Teil aus anderen Stoffen
Press-, Präge-, Tiefzieh-, Gesenkschmiede-, Stanz- oder Lochwerkzeuge; Teile dafür > für die Metallbearbeitun
Andere Werkzeuge > Press-, Präge-, Tiefzieh-, Gesenkschmiede-, Stanz- oder Lochwerkzeuge; Teile dafür
Messer und Schneidklingen, für die Metall- und Holzbearbeitun > für die Metallbearbeitung
Andere Werkzeuge > Messer und Schneidklingen, für die Metall- und Holzbearbeitun
Andere Werkzeuge > Messer und Schneidklingen, für Küchen- oder Nahrungsmittel- industriemaschinen
Andere Werkzeuge > Messer und Schneidklingen, für Maschinen für die Landwirtschaft, den Gartenbau, die Forstwirtschaft und für andere Maschinen oder mechanische Geräte; Wendeschneidplatten für Werkzeuge
Messer und Schneidklingen, für Maschinen für die Landwirtschaft, den Gartenbau, die Forstwirtschaft und für andere Maschinen oder mechanische Geräte; Wendeschneidplatten für Werkzeuge > für andere Maschinen oder mechanische Geräte
Andere Werkzeuge
Behälter aus Eisen oder Stahl, mit einem Fassungsvermögen von 50 bis 300 l, für Stoffe aller Art (ohne solche für verdichtete oder verflüssigte Gase), ohne mechanische oder wärmetechnische Einrichtungen
für Nahrungsmittel und Getränke > Konservendosen für Nahrungsmittel
Dosen aus Eisen oder Stahl, die durch Schweißen, Löten oder Falzen verschlossen werden, mit einem Fassungsvermögen von weniger als 50
Dosen aus Eisen oder Stahl, die durch Schweißen, Löten oder Falzen verschlossen werden, mit einem Fassungsvermögen von weniger als 50 > Andere Dosen aus Eisen oder Stahl
Dosen aus Eisen oder Stahl, die durch Schweißen, Löten oder Falzen verschlossen werden, mit einem Fassungsvermögen von weniger als 50 > Andere Dosen (ohne Aerosoldosen)
Sammelbehälter, Fässer, Dosen, Tuben, Verpackungsröhrchen u.a. Behälter, aus Aluminium, mit einem Fassungsvermögen von 300 l oder weniger
Sammelbehälter, Fässer, Dosen, Tuben, Verpackungsröhrchen u.a. Behälter, aus Aluminium, mit einem Fassungsvermögen von 300 l oder weniger > Andere Behälter, aus Aluminium, mit einem Fassungsvermögen von weniger als 300 l (ohne Aerosoldosen aus Aluminium mit einem Fassungsvermögen von 300 l oder weniger)
Stopfen (einschl. Kronenverschlüssen), Verschluss- oder Flaschen- kapseln, anderes Verpackungszubehör, aus unedlen Metallen
Stopfen (einschl. Kronenverschlüssen), Verschluss- oder Flaschen- kapseln, anderes Verpackungszubehör, aus unedlen Metallen > Anderes Verpackungszubehör, aus unedlen Metallen
Litzen, Kabel, Seile, Seilschlingen u.ä. Waren, aus Eisen oder Stahl (ohne isolierte Erzeugnisse für die Elektrotechnik sowie verwundener Zaundraht und Stacheldraht) > Litzen, Kabel und Seile
Litzen, Kabel, Seile, Seilschlingen u.ä. Waren, aus Eisen oder Stahl (ohne isolierte Erzeugnisse für die Elektrotechnik sowie verwundener Zaundraht und Stacheldraht)
Stacheldraht aus Eisen oder Stahl; Litzen, Kabel, Seile u.ä. Waren, aus Kupfer und Aluminium (ohne isolierte Erzeugnisse für die Elektrotechnik)
Gewebe, Gitter, Geflechte, aus Eisen-, Stahl- oder Kupferdraht; Streckbleche und -bänder, aus Eisen, Stahl oder Kupfer > Gewebe aus Eisen- oder Stahldraht
Gewebe, Gitter, Geflechte, aus Eisen-, Stahl- oder Kupferdraht; Streckbleche und -bänder, aus Eisen, Stahl oder Kupfer
Andere Gitter und Geflechte, verschweißt, aus Eisen- oder Stahldraht
Andere Gitter und Geflechte, aus Eisen- oder Stahldraht, nicht verschweißt
Errichtung von Zäunen, Geländern u.ä. Einfassungen aus Draht und für verschiedene Zwecke (z.B. Höfe, Spielplätze, Wohn- und Industriegrundstücke) (43.29.12) Reißnägel, Nägel, Stifte, Krampen, Klammern (ohne Heftklammern, zusammenhängend in Streifen) u.ä. Waren, aus Eisen, Stahl, Kupfer oder Aluminiu
Drähte, Stäbe, Rohre, Platten, Elektroden u.ä. Waren, mit Dekapier- oder Flusssmittel umhüllt oder gefüllt; zum Schweißen oder Löten; Drähte und Stäbe, aus agglomeriertem Pulver von unedlen Metallen, zum Metallisieren im Aufspritzverfahren
Federn und Federblätter, aus Eisen oder Stahl; Federn aus Kupfer und aus Kupferlegierungen > Blattfedern und Federblätter dafür, aus Eisen oder Stahl
Federn und Federblätter, aus Eisen oder Stahl; Federn aus Kupfer und aus Kupferlegierungen
Federn und Federblätter, aus Eisen oder Stahl; Federn aus Kupfer und aus Kupferlegierungen > Schraubenfedern, aus Eisen oder Stahl
Federn und Federblätter, aus Eisen oder Stahl; Federn aus Kupfer und aus Kupferlegierungen > Spiralflachfedern, Tellerfedern, aus Eisen oder Stahl
Federn und Federblätter, aus Eisen oder Stahl; Federn aus Kupfer und aus Kupferlegierungen > Andere Federn aus Eisen oder Stahl
Ketten (ohne Gelenkketten) und Teile dafür, aus Eisen oder Stahl sowie aus Kupfer
Ketten (ohne Gelenkketten) und Teile dafür, aus Eisen oder Stahl sowie aus Kupfer > Andere Ketten, mit geschweißten Gliedern, aus Eisen oder Stah
Schrauben, Gewindebolzen, Muttern, Schwellenschrauben, a.n.g > Schrauben und Bolzen zum Befestigen von Oberbaumaterial von Bahnen sowie solche ohne Kopf
Schrauben, Gewindebolzen, Muttern, Schwellenschrauben, a.n.g > Schrauben und Bolzen, mit Kopf, auch mit Muttern oder Unterlegscheiben, mit Schlitz, Kreuzschlitz oder Innensechskan
Schrauben, Gewindebolzen, Muttern, Schwellenschrauben, a.n.g > Andere Schrauben und Bolzen, mit Kopf, auch mit Muttern oder Unterlegscheiben
Schrauben, Gewindebolzen, Muttern, Schwellenschrauben, a.n.g > Schwellenschrauben, andere Holzschrauben, Schraubhaken, Ring- und Ösenschrauben
Schrauben, Gewindebolzen, Muttern, Schwellenschrauben, a.n.g > Gewindeformende Schrauben
Schrauben, Gewindebolzen, Muttern, Schwellenschrauben, a.n.g > Muttern
Schrauben, Gewindebolzen, Muttern, Schwellenschrauben, a.n.g
Federringe und -scheiben u.a. Sicherungsringe und -scheiben; Niete, Splinte, Keile u.ä. Waren, ohne Gewinde, aus Eisen oder Stah
Unterlegscheiben, Holzschrauben u.a. Waren der Schraubenindustrie, mit und ohne Gewinde, aus Kupfer und aus Kupferlegierungen (ohne Stifte, Nägel u.ä. Waren)
Metallerzeugnisse, für Badezimmer und Küchen Sanitär-, Hygiene- oder Toilettenartikel und Teile dafür aus Eisen, Stahl, Kupfer oder Aluminiu
Metallerzeugnisse, für Badezimmer und Küchen Sanitär-, Hygiene- oder Toilettenartikel und Teile dafür aus Eisen, Stahl, Kupfer oder Aluminiu > Andere Sanitär-, Hygiene- oder Toilettenartikel und deren Teile, aus Eisen oder Stahl (ohne Waschbecken und Badewannen), Kupfer sowie aus Aluminiu
Badewannen, Duschen, Waschbecken, Bidets, Klosettschüsseln, -sitze u.-deckel, Spülkästen u.ä. Waren zu sanitären oder hygienischen Zwecken, aus Kunststoffen Ausgüsse, Wasch-, Klosettbecken, Badewannen u.ä. Installationsgegenstände, aus Keramik, zu sanitären Zwecken Haushalts- oder Hauswirtschaftsartikel und Teile dafür, aus Eisen oder Stahl, Kupfer oder Aluminiu
Badewannen, Duschen, Waschbecken, Bidets, Klosettschüsseln, -sitze u.-deckel, Spülkästen u.ä. Waren zu sanitären oder hygienischen Zwecken, aus Kunststoffen Ausgüsse, Wasch-, Klosettbecken, Badewannen u.ä. Installationsgegenstände, aus Keramik, zu sanitären Zwecken Haushalts- oder Hauswirtschaftsartikel und Teile dafür, aus Eisen oder Stahl, Kupfer oder Aluminiu > Andere Haushalts- und Hauswirtschaftsartikel und Teile dafür, aus Eisen oder Stah
Badewannen, Duschen, Waschbecken, Bidets, Klosettschüsseln, -sitze u.-deckel, Spülkästen u.ä. Waren zu sanitären oder hygienischen Zwecken, aus Kunststoffen Ausgüsse, Wasch-, Klosettbecken, Badewannen u.ä. Installationsgegenstände, aus Keramik, zu sanitären Zwecken Haushalts- oder Hauswirtschaftsartikel und Teile dafür, aus Eisen oder Stahl, Kupfer oder Aluminiu > Haushalts-, Hauswirtschaftsartikel und deren Teile; Schwämme, Putzlappen u.ä. Waren zum Scheuern, Polieren u.dgl.; aus Kupfer und Aluminiu
Panzerschränke, Türen und Fächer für Stahlkammern, Sicherheitskassetten u.ä. Waren, aus unedlen Metallen
Mechaniken für Schnellhefter oder Aktenordner, Heftklammern u.ä. Büromaterial, aus unedlen Metallen
Verschlüsse, Verschlussbügel, Schnallen, Spangen, Klammern, Haken, Ösen u.ä. Waren, aus unedlem Metallen, für Kleidung, Schuhe, Planen, Täschnerwaren oder zum Fertigen oder Ausrüsten anderer Waren; Hohl- und Zweispitzniete, Perlen und zugeschnittene Flitter aus unedlen Metallen
Verschlüsse, Verschlussbügel, Schnallen, Spangen, Klammern, Haken, Ösen u.ä. Waren, aus unedlem Metallen, für Kleidung, Schuhe, Planen, Täschnerwaren oder zum Fertigen oder Ausrüsten anderer Waren; Hohl- und Zweispitzniete, Perlen und zugeschnittene Flitter aus unedlen Metallen > Hohl- oder Zweispitzniete
Verschlüsse, Verschlussbügel, Schnallen, Spangen, Klammern, Haken, Ösen u.ä. Waren, aus unedlem Metallen, für Kleidung, Schuhe, Planen, Täschnerwaren oder zum Fertigen oder Ausrüsten anderer Waren; Hohl- und Zweispitzniete, Perlen und zugeschnittene Flitter aus unedlen Metallen > Schnallen, Verschlüsse und Verschlussbügel u.a. Befestigungsartikel; Perlen und zugeschnittene Flitter
Andere Waren aus unedlen Metallen, a.n.g
Andere Waren aus unedlen Metallen, a.n.g > Waren aus Eisen oder Stahl, geschmiedet, jedoch nicht weiterbearbeitet; Waren aus Eisen- oder Stahldraht; Tabakdosen, Zigarettenetuis u.ä
Andere Waren aus unedlen Metallen, a.n.g > Leitern und Trittschemel; Paletten u.ä. stapelfähige Transportmittel; Rollen und Trommeln; Dachentlüfter, Dachrinnen, Haken u.a. Bauartikel, aus Eisen oder Stah
Leitern und Trittschemel; Paletten u.ä. stapelfähige Transportmittel; Rollen und Trommeln; Dachentlüfter, Dachrinnen, Haken u.a. Bauartikel, aus Eisen oder Stah > Rohrschellen u.a. Rohrbefestigungselemente, aus Stahl; Bedachungsartikel u.a. Bauartikel, aus Stahlblech
Andere Waren aus unedlen Metallen, a.n.g > Andere Waren aus Eisen oder Stahl (ohne gegossene)
Andere Waren aus Eisen oder Stahl (ohne gegossene) > Andere Waren aus Eisen oder Stahl, weder freiform- noch gesenkgeschmiede
Andere Waren aus unedlen Metallen, a.n.g > Andere Waren aus Aluminium und Kupfer, a.n.g
Andere Waren aus Eisen oder Stahl (ohne gegossene) > Andere Waren aus Aluminium, nicht gegossen
Andere Waren aus Nickel, Blei, Zink und Zinn
Prägefolien zum Bedrucken von Bucheinbänden, Hutschweißbändern u.dgl. - - Andere Waren aus Zink, Blei und Nickel, a.n.g
Prägefolien zum Bedrucken von Bucheinbänden, Hutschweißbändern u.dgl. - - Andere Waren aus Zink, Blei und Nickel, a.n.g > Andere Waren aus unedlen Metallen
Prägefolien zum Bedrucken von Bucheinbänden, Hutschweißbändern u.dgl. - - Andere Waren aus Zink, Blei und Nickel, a.n.g > Aushänge-, Hinweis-, Namens- u.ä. Schilder, Zahlen, Buchstaben u.a. Zeichen (ohne beleuchtete Schilder)
Dioden; Transistoren; Thyristoren, Diacs und Triacs
Halbleiterbauelemente; Leuchtdioden; gefasste oder montierte piezoelektrische Kristalle, Teile dafür
Halbleiterbauelemente; Leuchtdioden; gefasste oder montierte piezoelektrische Kristalle, Teile dafür > Andere lichtempfindliche Halbleiterbauelemente (z.B. Solarzellen, Fotodioden, Fototransistoren, Fotothyristoren, Fotokoppler)
Elektronische integrierte Schaltungen > Prozessoren und Steuer- und Kontrollschaltungen, auch in Verbindung mit Speichern, Wandlern, Logikschaltungen, Verstärkern, Uhren und Taktgeberschaltungen o.a. Schaltungen
Elektronische integrierte Schaltungen > Speicher
Speicher > Elektrisch löschbare, programmierbare Lesespeicher, andere Schreib-Lesespeicher, in MOS-Technik
Elektronische integrierte Schaltungen
Andere elektronische integrierte Schaltungen
Andere elektronische integrierte Schaltungen > Andere elektronische integrierte Schaltungen (z.B. Mikrocontroller, einschl. Mikrocomputer; einschl. Sensoren)
Teile für elektronische Bauelemente, a.n.g
Unbestückte Leiterplatten
Unbestückte Leiterplatten > Andere gedruckte Schaltungen, nur mit Leiterbahnen oder Kontakten
Ein- oder Ausgabeeinheiten, auch wenn sie in einem gemeinsamen Gehäuse Speichereinheiten enthalten
Sendegeräte mit eingebautem Empfangsgerä
Andere Fernsprechapparate sowie Geräte für die Übertragung oder den Empfang von Sprache, Bildern o.a. Daten, einschl. Geräte für die Kommunikation in leitungsgebundenen und leitungslosen Netzen (z. B. lokale Netze (LAN) oder Weitbereichsnetz (WAN))
Teile für Geräte der Fernsprech- und Telegrafentechnik
Antennen und Antennenreflektoren aller Arten sowie Teile dafür; Teile für Hör- und Fernsehfunk-Übertragungsgeräte und Fernsehkameras
Antennen und Antennenreflektoren aller Arten sowie Teile dafür; Teile für Hör- und Fernsehfunk-Übertragungsgeräte und Fernsehkameras > Außenantennen für Rundfunk- und Fernsehempfan
Antennen und Antennenreflektoren aller Arten sowie Teile dafür; Teile für Hör- und Fernsehfunk-Übertragungsgeräte und Fernsehkameras > navigations- und -fernsteuerungsgeräte
Einbruchs- oder Diebstahlalarmgeräte, Feuermelder u.ä. Geräte (Hör- und Sichtsignalgeräte)
Rundfunkempfangsgeräte für Kraftfahrzeuge, die nur mit externer Strom- quelle betrieben werden können, auch kombiniert mit Tonaufnahme- oder Tonwiedergabegeräten
Fernsehempfangsgeräte, auch mit eingebautem Hörfunkempfangsgerät oder Tonaufzeichnungsgerät, Bildaufzeichnungsgerät oder Bildwiedergabegerä
Lautsprecher; Hörer, auch mit Mikrofon kombinier > Lautsprecher
Lautsprecher; Hörer, auch mit Mikrofon kombinier
Elektrische Tonfrequenzverstärker; elektrische Tonverstärkereinrichtungen > Elektrische Tonfrequenzverstärker
Elektrische Tonfrequenzverstärker; elektrische Tonverstärkereinrichtungen
Teile für Geräte zur Bild- und Tonaufzeichnung oder -wiedergabe, Mikrofone, Lautsprecher, Hörer, Tonfrequenzverstärker und Tonverstärkereinrichtungen
Kompasse u.a. Navigationsinstrumente, -apparate und -geräte
Theodolite und Tachymeter; Instrumente, Apparate u. Geräte für die Geodäsie, Topografie, Fotogrammetrie, Hydrografie, Ozeanografie, Hydrologie, Meteorologie oder Geophysik (ohne Entfernungsmesser, Nivellierinstrumente und Kompasse)
Theodolite und Tachymeter; Instrumente, Apparate u. Geräte für die Geodäsie, Topografie, Fotogrammetrie, Hydrografie, Ozeanografie, Hydrologie, Meteorologie oder Geophysik (ohne Entfernungsmesser, Nivellierinstrumente und Kompasse) > Andere Theodolite und Tachymeter, Instrumente, Apparate und Geräte für die Geodäsie, Topografie, Fotogrammetrie, Hydrografie, Ozeanografie, Hydrologie, Meteorologie oder Geophysik (ohne Entfernungsmesser, Nivellierinstrumente, Kompasse)
Funkmess- (Radar-), Funknavigations-, Funkfernsteuergeräte und -einrichtungen
Zeichentische und -maschinen, andere Zeichen-, Anreiß- oder Rechen- instrumente und -geräte
Drucker Plotter Längenmessinstrumente für den Handgebrauch (Mikrometer und Schieblehren) a.n.g
Instrumente, Apparate und Geräte zum Messen oder Prüfen von Spannung, Stromstärke, Widerstand oder Leistung (ohne Registriervorrichtung)
Instrumente, Apparate und Geräte zum Messen oder Prüfen von Spannung, Stromstärke, Widerstand oder Leistung (ohne Registriervorrichtung) > Andere Instrumente, Apparate und Geräte zum Messen oder Prüfen von Spannung, Stromstärke, Widerstand oder Leistun
Instrumente, Apparate und Geräte zum Messen oder Prüfen von elektrischen Größen, a.n.g
Instrumente, Apparate und Geräte zum Messen oder Prüfen von elektrischen Größen, a.n.g > Andere Instrumente, Apparate und Geräte zum Messen oder Prüfen von elektrischen Größen und Strahlen, a.n.g
Dichtemesser u.ä. schwimmende Instrumente, Thermometer, Pyrometer, Barometer, Hygrometer und Psychrometer (auch mit Registriervorrichtung, auch kombiniert)
Andere Thermometer und Pyrometer, nicht mit anderen Instrumenten kombinier > Elektronische Thermometer und Pyrometer (einschl. Sensoren)
Dichtemesser u.ä. schwimmende Instrumente, Thermometer, Pyrometer, Barometer, Hygrometer und Psychrometer (auch mit Registriervorrichtung, auch kombiniert) > Andere Thermometer und Pyrometer, nicht mit anderen Instrumenten kombinier
Dichtemesser u.ä. schwimmende Instrumente, Thermometer, Pyrometer, Barometer, Hygrometer und Psychrometer (auch mit Registriervorrichtung, auch kombiniert) > Dichtemesser u.ä. schwimmende Instrumente; kombinierte Thermometer, Pyrometer, Barometer; Hygrometer und Psychrometer (auch mit Registrier- vorrichtung, auch miteinander kombiniert)
Elektronische Instrumente, Apparate und Geräte zum Messen oder Überwachen von Durchfluss oder Füllhöhe von Flüssigkeiten > Elektronische Durchflussmesser (einschl. Sensoren und Messfühler)
Elektronische Instrumente, Apparate und Geräte zum Messen oder Überwachen von Durchfluss oder Füllhöhe von Flüssigkeiten > Andere elektronische Geräte zum Messen oder Überwachen von Durchfluss oder Füllhöhe von Flüssigkeiten (ohne einzelne Durchflussmesser) (einschl. Sensoren und Messfühler)
Instrumente, Apparate und Geräte zum Messen oder Überwachen von Durchfluss, Füllhöhe, Druck o.a. veränderlichen Größen von Flüssigkeiten oder Gasen > Andere Instrumente, Apparate und Geräte zum Messen oder Überwachen von Durchfluss oder Füllhöhe von Flüssigkeiten
Instrumente, Apparate und Geräte zum Messen oder Überwachen des Drucks > Elektronische Druckmess- und Überwachungsinstrumente, -apparate und -geräte (einschl. Sensoren und Messfühler)
Instrumente, Apparate und Geräte zum Messen oder Überwachen von Durchfluss, Füllhöhe, Druck o.a. veränderlichen Größen von Flüssigkeiten oder Gasen > Instrumente, Apparate und Geräte zum Messen oder Überwachen des Drucks
Andere Mess- und Überwachungsinstrumente, -apparate und -geräte für Flüssigkeiten und Gase > Elektronische Instrumente (einschl. Sensoren und Messfühler)
Instrumente, Apparate und Geräte zum Messen oder Überwachen von Durchfluss, Füllhöhe, Druck o.a. veränderlichen Größen von Flüssigkeiten oder Gasen > Andere Mess- und Überwachungsinstrumente, -apparate und -geräte für Flüssigkeiten und Gase
Untersuchungsgeräte für Gase oder Rauch > Elektronische Untersuchungsgeräte (einschl. Sensoren und Messfühler)
Instrumente und Apparate für physikalische oder chemische Untersuchungen, a.n.g > Untersuchungsgeräte für Gase oder Rauch
Instrumente und Apparate für physikalische oder chemische Untersuchungen, a.n.g
Instrumente und Apparate für physikalische oder chemische Untersuchungen, a.n.g > Andere Instrumente und Apparate für physikalische oder chemische Untersuchungen
Andere Instrumente und Apparate für physikalische oder chemische Untersuchungen > Andere elektronische Instrumente, Apparate und Geräte für physikalische oder chemische Untersuchungen (einschl. Sensoren und Messfühler)
Optische Mikroskope Maschinen, Apparate und Geräte zum Prüfen der mechanischen Eigenschaften von Materialien > Elektronische Materialprüfmaschinen, -apparate und -geräte, für Metalle
Optische Mikroskope Maschinen, Apparate und Geräte zum Prüfen der mechanischen Eigenschaften von Materialien
Optische Mikroskope Maschinen, Apparate und Geräte zum Prüfen der mechanischen Eigenschaften von Materialien > Andere Materialprüfmaschinen, -apparate und -geräte (ohne solche für Metalle)
Gas-, Flüssigkeits- und Elektrizitätszähler (einschl. Eichzählern dafür)
Andere Zähler; Tachometer u.a. Geschwindigkeitsmesser > Touren-, Produktionszähler, Taxameter, Kilometerzähler, Schrittzähler u.a. Zähler (einschl. Sensoren und Messfühler)
Andere Zähler; Tachometer u.a. Geschwindigkeitsmesser > Tachometer u.a. Geschwindigkeitsmesser
Instrumente, Apparate, Geräte und Maschinen zum Messen oder Prüfen, a.n.g > Prüfstände
Instrumente, Apparate und Geräte zum Messen oder Prüfen, a.n.g > Elektronische Instrumente, Apparate und Geräte zum Messen oder Prüfen geometrischer Größen (einschl. Sensoren und Messfühler)
Instrumente, Apparate und Geräte zum Messen oder Prüfen, a.n.g > Andere elektronische Instrumente, Apparate und Geräte zum Messen oder Prüfen, a.n.g. (einschl. Sensoren und Messfühler)
Instrumente, Apparate und Geräte zum Messen oder Prüfen, a.n.g > Andere Mess- und Prüfgeräte, a.n.g
Thermostate, Druckregler, u.a. Instrumente, Apparate und Geräte zum Regeln > Thermostate
Thermostate, Druckregler, u.a. Instrumente, Apparate und Geräte zum Regeln
Teile und Zubehör für Mess-, Kontrollinstrumente und Vorrichtungen
Teile und Zubehör für Elektrizitäts-, Gas- und Flüssigkeitszähler, Geschwindigkeitsmesser u.a. Zähler, Stroboskope > für Elektrizitäts-, Gas- und Flüssigkeitszähler
Teile und Zubehör für Elektrizitäts-, Gas- und Flüssigkeitszähler, Geschwindigkeitsmesser u.a. Zähler, Stroboskope
Teile und Zubehör für pneumatische und hydraulische Regler, Instrumente, Apparate und Geräte zum Messen oder Prüfen a.n.g., Instrumente, Apparate und Geräte zum Regeln > für Mess- und Prüfgeräte, -apparate und -geräte, a.n.g
Teile und Zubehör für pneumatische und hydraulische Regler, Instrumente, Apparate und Geräte zum Messen oder Prüfen a.n.g., Instrumente, Apparate und Geräte zum Regeln
Teile und Zubehör für Kompasse u.a. Navigationsinstrumente
Uhren mit Kleinuhr-Werk; Wecker und Wanduhren, andere Uhren und Uhrenanlagen
Zeitkontrollapparate, Zeitmesser, Zeitschalter u.a. Zeitauslöser mit Uhrwerk oder Synchronmotor
Röntgenapparate und -geräte, Apparate und Geräte, die Alpha-, Beta- oder Gammastrahlen verwenden (einschl. Schirmbildfotografie- oder Strahlentherapiegeräten), Teile dafür > Röntgenapparate und -geräte (einschl. Schirmbildfotografie- oder Strahlentherapiegeräten)
Röntgenapparate und -geräte, Apparate und Geräte, die Alpha-, Beta- oder Gammastrahlen verwenden (einschl. Schirmbildfotografie- oder Strahlentherapiegeräten), Teile dafür
Röntgenapparate und -geräte, Apparate und Geräte, die Alpha-, Beta- oder Gammastrahlen verwenden (einschl. Schirmbildfotografie- oder Strahlentherapiegeräten), Teile dafür > geräte u.ä.; Untersuchungs- und Behandlungstische, -sessel u.dgl. dafür
Elektrodiagnoseapparate und -geräte für medizinische Zwecke, Teile und Zubehör > Elektrokardiografen und Zubehör
Elektrodiagnoseapparate und -geräte für medizinische Zwecke, Teile und Zubehör
Schwerhörigengeräte, Herzschrittmacher > Schwerhörigengeräte, Teile und Zubehör für Schwerhörigengeräte
Schwerhörigengeräte, Herzschrittmacher
Polarisierende Stoffe in Form von Folien oder Platten; Prismen, Linsen, Spiegel u.a. optische Elemente (ohne solche aus nicht optisch bearbeitetem Glas), außer für Kameras, Bildwerfer und fotografische Vergrößerungs- oder Verkleinerungsapparate > Optische Elemente aus Stoffen aller Art (z.B. Prismen, Linsen, Spiegel) (ohne gefasste Objektive und Filter)
Gläser für Brillen, jedoch nicht optisch bearbeitet Ferngläser, Fernrohre, optische Teleskope u.a. astronomische Instrumente und Montierungen dafür; optische Mikroskope
Gläser für Brillen, jedoch nicht optisch bearbeitet Ferngläser, Fernrohre, optische Teleskope u.a. astronomische Instrumente und Montierungen dafür; optische Mikroskope > kinematografie oder -projektion)
Flüssigkeitskristallanzeigen; Laser (ohne Laserdioden); andere optische Instrumente, Apparate und Geräte, a.n.g
Optische Mess- und Prüfgeräte sowie Instrumente
Optische Mess- und Prüfgeräte sowie Instrumente > Andere Instrumente, Apparate und Geräte, die optische Strahlen (UV-Strahlen, sichtbares Licht, Infrarotstrahlen) verwenden (einschl. Sensoren und Messfühler)
Optische Mess- und Prüfgeräte sowie Instrumente > Andere optische Instrumente, Apparate und Geräte zum Messen oder Prüfen, a.n.g., für Kraftfahrzeuge; Belichtungsmesser, Stroboskope; optische Instrumente, Apparate und Geräte zum Prüfen von Halbleiterscheiben (Wafers) oder Halbleiterbaulelementen oder zum Prüfen von Fotomasken oder Reticles für die Herstellung von Halbleiterbauelementen; Profilprojektoren u.a. optische Instrumente, Apparate und Geräte zum Messen oder Prüfen
Teile und Zubehör für Ferngläser, Fernrohre, optische Teleskope u.a. astronomische Instrumente und Montierungen dafür; optische Mikroskope
Teile und Zubehör für Flüssigkristallanzeigen, Laser mit Ausnahme von Laserdioden, andere optische Instrumente, Apparate und Geräte a.n.g
Elektromotoren mit einer Leistung von 37,5 W oder weniger; andere Gleichstrommotoren; Gleichstromgeneratoren
Elektromotoren mit einer Leistung von 37,5 W oder weniger; andere Gleichstrommotoren; Gleichstromgeneratoren > Gleichstrommotoren und -generatoren mit einer Leistung von mehr als 750 W bis 75
Einphasen-Wechselstrommotoren > mit einer Leistung von mehr als 37,5 W bis 750 W
Einphasen-Wechselstrommotoren
Mehrphasen-Wechselstrommotoren mit einer Leistung von mehr als 750 W bis 75 > mit einer Leistung von mehr als 750 W bis 7,5
Mehrphasen-Wechselstrommotoren mit einer Leistung von mehr als 750 W bis 75
Mehrphasen-Wechselstrommotoren mit einer Leistung von mehr als 750 W bis 75 > mit einer Leistung von mehr als 37 kW bis 75 kW
Mehrphasen-Wechselstrommotoren mit einer Leistung von mehr als 75
Mehrphasen-Wechselstrommotoren mit einer Leistung von mehr als 75 > Andere Mehrphasen-Wechselstrommotoren mit einer Leistung von mehr als 75 kW bis 375
Andere Mehrphasen-Wechselstrommotoren mit einer Leistung von mehr als 75 kW bis 375 > andere
Mehrphasen-Wechselstrommotoren mit einer Leistung von mehr als 75 > Andere Mehrphasen-Wechselstrommotoren mit einer Leistung von mehr als 375 kW bis 750
Wechselstromgeneratoren
Stromerzeugungsaggregate, angetrieben durch Kolbenverbrennungsmotor mit Selbstzündung (Diesel- oder Halbdieselmotor)
Stromerzeugungsaggregate, angetrieben durch Kolbenverbrennungsmotor mit Fremdzündung; andere Stromerzeugungsaggregate; elektrische rotierende Umformer > Stromerzeugungsaggregate, angetrieben durch Kolbenverbrennungsmotor mit Fremdzündun
Stromerzeugungsaggregate, angetrieben durch Kolbenverbrennungsmotor mit Fremdzündung; andere Stromerzeugungsaggregate; elektrische rotierende Umformer
Transformatoren mit Flüssigkeitsisolation
Andere Transformatoren mit einer Leistung von 16 kVA oder weniger > mit einer Leistung von 1 kVA oder weniger
Andere Transformatoren mit einer Leistung von 16 kVA oder weniger
Andere Transformatoren mit einer Leistung von mehr als 16 kVA (ohne Transformatoren mit Flüssigkeitsisolation) > mit einer Leistung von mehr als 16 kVA bis 500 kVA
Andere Transformatoren mit einer Leistung von mehr als 16 kVA (ohne Transformatoren mit Flüssigkeitsisolation) > mit einer Leistung von mehr als 500 kVA
Vorschaltgeräte für Entladungslampen; Stromrichter; andere Drosselspulen u.a. Selbstinduktionsspulen > Vorschaltgeräte für Entladungslampen
Vorschaltgeräte für Entladungslampen; Stromrichter; andere Drosselspulen u.a. Selbstinduktionsspulen
Teile für Elektromotoren, elektrische Generatoren, Stromerzeugungsaggregate und elektrische rotierende Umformer
Teile für Transformatoren, Drossel- u.a. Selbstinduktionsspulen
Elektrische Geräte zum Schließen, Unterbrechen, Schützen oder Verbinden von elektrischen Stromkreisen, für eine Spannung von mehr als 1000 V
Sicherungen für eine Spannung von 1 000 V oder weniger
Leistungsschalter für eine Spannung von 1 000 V oder weniger > für eine Stromstärke von 63 A oder weniger
Leistungsschalter für eine Spannung von 1 000 V oder weniger
Andere Geräte zum Schützen von elektrischen Stromkreisen für eine Spannung von 1 000 V oder weniger
Relais für eine Spannung von 1 000 V oder weniger > für eine Spannung von 60 V oder weniger
Relais für eine Spannung von 1 000 V oder weniger > für eine Spannung von mehr als 60 V bis 1 000 V
Tafeln, Felder, Konsolen, Pulte, Schränke zum elektrischen Schalten oder Steuern oder für die Stromverteilung, für eine Spannung von 1000 V oder weniger
Tafeln, Felder, Konsolen, Pulte, Schränke zum elektrischen Schalten oder Steuern oder für die Stromverteilung, für eine Spannung von 1000 V oder weniger > Andere Tafeln, Felder, Konsolen u.ä
Instandhaltung und Reparatur von Steuerungssystemen für Zentralheizungen (43.22.12) Tafeln, Felder, Konsolen, Pulte, Schränke zum elektrischen Schalten oder Steuern oder für die Stromverteilung, für eine Spannung von mehr als 1 000 V
Teile für Elektrizitätsverteilungs- oder -schalteinrichtungen
Teile für Elektrizitätsverteilungs- oder -schalteinrichtungen > Zusammengesetzte elektronische Schaltungen (Baugruppen) u.a. Teile für Elektrizitätsverteilungs- oder -schalteinrichtungen
Andere Blei-Akkumulatoren (ohne Starterbatterien)
Kabel aus einzeln umhüllten optischen Fasern für die Informationsübertragun
Isolierte Wickeldrähte
Andere elektrische Leiter, (ohne Kabelsätze für Beförderungsmittel), für eine Spannung von 1 000 V oder weniger
Andere elektrische Leiter, (ohne Kabelsätze für Beförderungsmittel), für eine Spannung von 1 000 V oder weniger > für eine Spannung von mehr als 80 V bis 1 000 V
Zündkabelsätze u.a. Kabelsätze für Beförderungsmittel Elektrisches Installationsmaterial Andere Schalter (Ein-, Aus- oder Umschalter für Gebäudeinstallation), für eine Spannung von 1 000 V oder weniger
Steckvorrichtungen u.a. Geräte zum Schließen, Unterbrechen, Schützen oder Verbinden von elektrischen Stromkreisen, a.n.g., für eine Spannung von 1 000 V oder weniger
Steckvorrichtungen u.a. Geräte zum Schließen, Unterbrechen, Schützen oder Verbinden von elektrischen Stromkreisen, a.n.g., für eine Spannung von 1 000 V oder weniger > Andere Stecker und Steckvorrichtungen
Isolierteile aus Kunststoffen, für elektrische Maschinen, Apparate, Geräte oder Installationen (ohne elektrische Isolatoren)
Wolfram-Halogen-Glühlampen (ohne Ultraviolett- und Infrarotlampen)
Wolfram-Halogen-Glühlampen (ohne Ultraviolett- und Infrarotlampen) > Andere Wolfram-Halogen-Glühlampen (einschl. Wolfram-Halogen- Lichtwurflampen)
Andere Glühlampen
Entladungslampen; Ultraviolett- und Infrarotlampen; Bogenlampen
Elektrische Tisch-, Schreibtisch-, Nachttisch- oder Stehleuchten (ohne Strahler)
Lüster u.a. elektrische Decken- und Wandleuchten > Wohnraum- und Repräsentativleuchten (ohne Strahler)
Lüster u.a. elektrische Decken- und Wandleuchten > Strahler
Lüster u.a. elektrische Decken- und Wandleuchten > Industrieleuchten
Lüster u.a. elektrische Decken- und Wandleuchten > Büroleuchten
Lüster u.a. elektrische Decken- und Wandleuchten > Andere elektrische Decken- und Wandleuchten
Andere elektrische Beleuchtungskörper, a.n.g > Scheinwerfer
Andere elektrische Beleuchtungskörper, a.n.g
Andere elektrische Beleuchtungskörper, a.n.g > Andere Leuchten
Teile für Beleuchtungsgeräte
Teile für Beleuchtungsgeräte > Teile für Leuchten und für andere Beleuchtungsgeräte
Kühl-, Gefrierschränke, Tiefkühltruhen
Kühl-, Gefrierschränke, Tiefkühltruhen > Haushaltskühlschränke
Ventilatoren und Abzugshauben für den Haushal
Staubsauger und elektromechanische Haushaltsgeräte, mit eingebautem Elektromotor
Rasierapparate, nicht elektrisch Elektrische Haar- und Händetrockner; Bügeleisen
Andere Elektrowärmegeräte
Elektrische Warmwasserbereiter und Tauchsieder, auch für gewerbliche Zwecke
Elektrische Geräte zum Raum- oder Bodenheizen oder zu ähnlichen Zwecken, auch für gewerbliche Zwecke
Andere elektrische Öfen, a.n.g.; elektrische Küchenherde, Kochplatten, Grill- und Bratgeräte
Teile für elektrische Haushaltsgeräte
Nicht elektrische Back-, Brat-, Grill-, Kochgeräte und Warmhalteplatten, für den Haushalt, aus Eisen, Stahl oder Kupfer > Back-, Koch- u.ä. Geräte für Feuerung mit gasförmigen Brennstoffen, aus Eisen oder Stah
Nicht elektrische Back-, Brat-, Grill-, Kochgeräte und Warmhalteplatten, für den Haushalt, aus Eisen, Stahl oder Kupfer
Nicht elektrische Raumheizöfen, Küchenherde u.ä. nicht elektrische Haushaltsgeräte, aus Eisen oder Stah
Nicht elektrische Durchlauferhitzer und Heißwasserspeicher (z.B. Gasdurchlauferhitzer, Solarkollektoren u.ä.)
Elektrische Maschinen, Apparate und Geräte mit eigener Funktion
Installation von Blitzableitern (43.2) Akkumulatoren Elektrische Isolatoren; Isolierteile für elektrische Maschinen oder Einrichtungen; Geräte oder Installationen; Isolierrohre
Elektrische Isolatoren aus Glas Elektrische Isolatoren und Isolierteile, aus keramischen Stoffen Waren für elektrotechnische Zwecke, aus Graphit o.a. Kohlenstoff, auch in Verbindung mit Metal
Elektrische Heizwiderstände Elektrische Widerstände (einschl. Rheostaten und Potentiometern) (ohne Heizwiderstände) Anzeigetafeln mit Flüssigkristallanzeige (LCD) oder Leuchtdiodenanzeige (LED); Hör- und Sichtsignalgeräte (ohne solche für Fahrräder, Kraftfahrzeuge und den Verkehr)
Elektrische Löt- und Schweißmaschinen, -apparate und -geräte; elektrische Maschinen, Apparate und Geräte zum Spritzen schmelzflüssiger Metalle oder Cermets
Elektrische Löt- und Schweißmaschinen, -apparate und -geräte; elektrische Maschinen, Apparate und Geräte zum Spritzen schmelzflüssiger Metalle oder Cermets > Andere Geräte zum Lichtbogen- oder Plasmaschweißen
Elektrische Löt- und Schweißmaschinen, -apparate und -geräte; elektrische Maschinen, Apparate und Geräte zum Spritzen schmelzflüssiger Metalle oder Cermets > Andere Maschinen, Apparate und Geräte zum Schweißen von Nichtmetallen
Andere Maschinen, Apparate und Geräte zum Schweißen von Nichtmetallen > Andere Maschinen, Apparate und Geräte zum Schweißen und Behandeln von anderen Materialien
Teile für sonstige elektrische Ausrüstungen; elektrische Teile für Maschinen, Apparate oder Geräte, a.n.g
Wechselrichter, Gleichrichter, Stromrichter
Wechselrichter > mit einer Leistung von 7,5 kVA oder weniger
Wechselrichter > mit einer Leistung von mehr als 7,5 kVA
Wechselrichter, Gleichrichter, Stromrichter > Andere Stromrichter
Gerätekabel, Verlängerungskabel u.a. elektrische Kabelsätze mit isolierten Drähten und Anschlüssen
Gerätekabel, Verlängerungskabel u.a. elektrische Kabelsätze mit isolierten Drähten und Anschlüssen > für eine Spannung von mehr als 80 V bis 1 000 V
Elektromagnete; elektromagnetische Kupplungen und Bremsen; elektromagnetische Hebeköpfe; elektrische Teilchenbeschleuniger; elektrische Signalgeneratoren u.a. elektrische Ausrüstungen und Geräte a.n.g
Andere Festkondensatoren
Elektrische Widerstände (einschl. Rheostaten und Potentiometern) (ohne Heizwiderstände) > Festwiderstände
Elektrische Widerstände (einschl. Rheostaten und Potentiometern) (ohne Heizwiderstände) > Draht-Stellwiderstände (einschl. Rheostaten und Potentiometern)
Elektrische Widerstände (einschl. Rheostaten und Potentiometern) (ohne Heizwiderstände)
Elektrische Verkehrssignal-, Verkehrssicherungs-, Verkehrsüberwachungs- und Verkehrssteuergeräte für Schienenwege o.dgl., Straßen, Binnenwasserstraßen, Parkplätze oder Parkhäuser, Hafenanlagen oder Flughäfen
Dieselmotoren für Acker- und Forstschlepper auf Rädern, Wasserfahrzeuge, Schienenfahrzeuge, Industriedieselmotoren (z.B. ortsfeste Dieselmotoren, Dieselmotoren für den Antrieb von Flurförderfahrzeugen, Mähdreschern, Baggern)
Dieselmotoren für Acker- und Forstschlepper auf Rädern, Wasserfahrzeuge, Schienenfahrzeuge, Industriedieselmotoren (z.B. ortsfeste Dieselmotoren, Dieselmotoren für den Antrieb von Flurförderfahrzeugen, Mähdreschern, Baggern) > Dieselmotoren für Wasserfahrzeuge
Dieselmotoren für Acker- und Forstschlepper auf Rädern, Wasserfahrzeuge, Schienenfahrzeuge, Industriedieselmotoren (z.B. ortsfeste Dieselmotoren, Dieselmotoren für den Antrieb von Flurförderfahrzeugen, Mähdreschern, Baggern) > Industriedieselmotoren mit einer Leistung von 100 kW oder weniger
Dieselmotoren für Acker- und Forstschlepper auf Rädern, Wasserfahrzeuge, Schienenfahrzeuge, Industriedieselmotoren (z.B. ortsfeste Dieselmotoren, Dieselmotoren für den Antrieb von Flurförderfahrzeugen, Mähdreschern, Baggern) > Industriedieselmotoren mit einer Leistung von mehr als 100 kW bis 500
Dieselmotoren für Acker- und Forstschlepper auf Rädern, Wasserfahrzeuge, Schienenfahrzeuge, Industriedieselmotoren (z.B. ortsfeste Dieselmotoren, Dieselmotoren für den Antrieb von Flurförderfahrzeugen, Mähdreschern, Baggern) > Industriedieselmotoren mit einer Leistung von mehr als 500
Teile für Kolbenverbrennungsmotoren mit Fremdzündung Teile für Kolbenverbrennungsmotoren mit Selbstzündung (Dieselmotor) Kolbenverbrennungsmotoren für Kraftwagen Motoren und Triebwerke für Luft- und Raumfahrzeuge Hubkolbenverbrennungsmotoren mit Fremdzündung für Krafträder Turbinen Dampfturbinen
Teile für Motoren und Triebwerke für Luft- und Raumfahrzeuge Turbo- Strahltrieb- und Turbo Propellertriebwerke Teile für Kolbenverbrennungsmotoren Teile für Kolbenverbrennungsmotoren mit Fremdzündung (ohne solche für Motoren für Luftfahrzeuge)
Teile für Turbo- und Strahltriebwerke oder Turbo-Propellertriebwerke Teile für Kolbenverbrennungsmotoren mit Selbstzündung (Diesel- oder Halbdieselmotor)
Linear arbeitende hydraulische und pneumatische Motoren (Arbeitszylinder)
Hydropumpen > Hydrokolbenpumpen
Hydropumpen
Hydraulische und pneumatische Ventile
Hydroaggregate
Hydrosysteme
Teile für Hydromotoren, Druckluftmotoren, Strahltriebwerke, Wasser- und Dampfkraftmaschinen, andere Motoren, a.n.g. (ohne solche für Verbrennungsmotoren)
Flüssigkeitspumpen für bestimmte Verwendungszwecke
Oszillierende Verdrängerpumpen für Flüssigkeiten (ohne Betonpumpen)
Rotierende Verdrängerpumpen für Flüssigkeiten
Rotierende Verdrängerpumpen für Flüssigkeiten > Schraubenspindelpumpen, andere rotierende Verdrängerpumpen
Schraubenspindelpumpen, andere rotierende Verdrängerpumpen > Andere rotierende Verdrängerpumpen
Kreiselpumpen für Flüssigkeiten; andere Flüssigkeitspumpen; Hebewerke für Flüssigkeiten > Tauchmotorpumpen, Umlaufbeschleuniger
Kreiselpumpen für Flüssigkeiten; andere Flüssigkeitspumpen; Hebewerke für Flüssigkeiten
Kreiselpumpen für Flüssigkeiten; andere Flüssigkeitspumpen; Hebewerke für Flüssigkeiten > Radialkreiselpumpen u.a. Kreiselpumpen, einstufig, mit einer Nennweite des Austrittstutzens von mehr als 15 m
Kreiselpumpen für Flüssigkeiten; andere Flüssigkeitspumpen; Hebewerke für Flüssigkeiten > Andere Kreiselpumpen mit einer Nennweite des Austrittstutzens von mehr als 15 m
Vakuumpumpen
Turbokompressoren
Oszillierende Verdrängerkompressoren
Rotierende Verdrängerkompressoren
Rotierende Verdrängerkompressoren > mehrwelli
Teile für Flüssigkeitspumpen und für Hebewerke für Flüssigkeiten
Teile für Luft- oder Vakuumpumpen, Luft- o.a. Gaskompressoren, Ventilatoren usw
Druckminderventile, Rückschlagklappen und -ventile, Überdruck- und Sicherheitsventile > Druckminderventile
Druckminderventile > aus anderen Werkstoffen
Druckminderventile > Rückschlagklappen und -ventile
Druckminderventile > Überdruck- und Sicherheitsventile
Sanitärarmaturen > Mischarmaturen
Sanitärarmaturen > Andere Sanitärarmaturen
Sanitärarmaturen; Armaturen für Heizkörper von Zentralheizungen > Armaturen für Heizkörper von Zentralheizungen
Regelventile, Schieber u.a. Armaturen > Regelventile
Regelventile > Andere Regelventile (Stellgeräte)
Regelventile, Schieber u.a. Armaturen > Schieber
Regelventile, Schieber u.a. Armaturen > Ventile
Kugel-, Kegel- und Zylinderhähne, Klappen, Membranarmaturen > Kugel-, Kegel- und Zylinderhähne
Kugel-, Kegel- und Zylinderhähne, Klappen, Membranarmaturen > Klappen (ohne Rückschlagklappen)
Regelventile, Schieber u.a. Armaturen > Kugel-, Kegel- und Zylinderhähne, Klappen, Membranarmaturen
Regelventile, Schieber u.a. Armaturen > Andere Armaturen
Teile für Armaturen u.ä. Apparate für Rohr- und Schlauch- leitungen, Dampfkessel, Sammelbehälter u. ä. Behälter
Wälzlager (z.B. Kugellager, Rollenlager, Nadellager)
Wälzlager (z.B. Kugellager, Rollenlager, Nadellager) > Kegelrollenlager, Tonnenlager, Zylinderrollenlager
Gelenkketten, aus Eisen oder Stah
Kurbeln und Wellen
Lagergehäuse; Gleitlager und Lagerschalen
Lagergehäuse; Gleitlager und Lagerschalen > Lagergehäuse ohne eingebaute Wälzlager; Gleitlager u. Lagerschalen
Getriebe, auch in Form von Wechsel- oder Schaltgetrieben oder Drehmomentwandlern; Kugel- oder Rollenrollspindeln > Stirnradgetriebe, Kegelrad- und Kegelstirnradgetriebe, Schneckengetriebe (Zahnradgetriebe)
Getriebe, auch in Form von Wechsel- oder Schaltgetrieben oder Drehmomentwandlern; Kugel- oder Rollenrollspindeln > Andere Zahnradgetriebe
Schaltgetriebe
Andere Getriebe
Schaltkupplungen u.a. Wellenkupplungen (einschl. Universalkupplungen)
Kugeln, Rollen, Nadeln u.a. Teile für Wälzlager
Teile für Wellen, Kurbeln, Gleitlager, Lagergehäuse und Lagerschalen, Getriebe, Schwungräder, Riemen- und Seilscheiben, Wellenkupplungen
Teile für Wellen, Kurbeln, Gleitlager, Lagergehäuse und Lagerschalen, Getriebe, Schwungräder, Riemen- und Seilscheiben, Wellenkupplungen > für Wellen, Kurbeln, Gleitlager, Lagerschalen, Getriebe, Schwungräder, Riemen- und Seilscheiben, Wellenkupplungen
Brenner für Feuerungen; automatische Feuerungen (einschl. ihrer mechanischen Beschicker, mechanischen Roste, mechanischen Entascher u.ä. Vorrichtungen)
Brenner für Feuerungen; automatische Feuerungen (einschl. ihrer mechanischen Beschicker, mechanischen Roste, mechanischen Entascher u.ä. Vorrichtungen) > Andere Brenner (einschl. kombinierter Brenner)
Nicht elektrische Industrie- und Laboratoriumsöfen (ohne Backöfen), Verbrennungsöfen
Elektrische Industrie- und Laboratoriumsöfen (einschl. Induktionsöfen und Öfen mit dielektrischer Erwärmung); Industrie- und Laboratoriums- apparate zum Warmbehandeln von Stoffen mittels Induktion oder dielektrischer Erwärmun
Elektrische Industrie- und Laboratoriumsöfen (einschl. Induktionsöfen und Öfen mit dielektrischer Erwärmung); Industrie- und Laboratoriums- apparate zum Warmbehandeln von Stoffen mittels Induktion oder dielektrischer Erwärmun > Andere Widerstandsöfen mit indirekter Beheizung; Öfen und Apparate zum Warmbehandeln von Stoffen mittels Induktion oder dielektrischer, kapazitiver Erwärmung; andere elektrische Industrie- und Laboratoriumsöfen
Teile für Brenner, Industrie- und Laboratoriumsöfen, Verbrennungsöfen, Induktionsöfen u.ä
Flaschenzüge
Andere Zugwinden und Spille
Ortsfeste Hebebühnen für Kraftfahrzeugwerkstätten u.a. Hubwinden
Ortsfeste Hebebühnen für Kraftfahrzeugwerkstätten u.a. Hubwinden > Andere hydraulische Hubwinden (z.B. Hubarbeitsbühnen)
Derrickkrane; Kabelkrane, Laufkrane, Verladebrücken u.a. Krane; fahrbare Hubportale, Portalhubkraftkarren und Krankraftkarren
Derrickkrane; Kabelkrane, Laufkrane, Verladebrücken u.a. Krane; fahrbare Hubportale, Portalhubkraftkarren und Krankraftkarren > Hubportale und Portalhubkraftkarren, andere Laufkrane, Portalkrane (ohne Portaldrehkrane), Verladebrücken
Gabelstapler, Elektrokraftkarren u.a. mit Hebevorrichtung ausgerüstete Karren; Kraftkarren ohne Hebevorrichtung; Zugkraftkarren > Elektrokraftkarren mit Hebevorrichtun
Gabelstapler, Elektrokraftkarren u.a. mit Hebevorrichtung ausgerüstete Karren; Kraftkarren ohne Hebevorrichtung; Zugkraftkarren
Personen- und Lastenaufzüge, Rolltreppen und Rollsteige > Personen- und Lastenaufzüge, elektrisch (z.B. Bauaufzüge, Fördervorrichtungen mit Körben oder Skips)
Personen- und Lastenaufzüge, Rolltreppen und Rollsteige > Andere Personen- und Lastenaufzüge
Personen- und Lastenaufzüge, Rolltreppen und Rollsteige
Stetigförderer (ohne solche für Untertagebergbau) > Pneumatische Stetigförderer
Stetigförderer (ohne solche für Untertagebergbau)
Stetigförderer mit Bändern oder Gurten für Waren > für Schüttgut (ohne solche für den Untertagebergbau) (z.B. Großförderbandanlagen für den Tagebau, Absetzer, Abräum-Förderbrücken)
Stetigförderer (ohne solche für Untertagebergbau) > Stetigförderer mit Bändern oder Gurten für Waren
Stetigförderer (ohne solche für Untertagebergbau) > Scheibenrollenbahnen u.a. Rollenbahnen; andere Stetigförderer
Seilschwebebahnen usw.; andere Maschinen usw. zum Heben, Beladen, Entladen oder Fördern
Seilschwebebahnen usw.; andere Maschinen usw. zum Heben, Beladen, Entladen oder Fördern > Andere Maschinen, Apparate und Geräte zum Heben, Be- und Entladen oder Fördern (einschl. Schmiedemanipulatoren, Beschickungseinrichtungen) (ohne solche für die Landwirtschaft)
Teile für Hebezeuge und Fördermitte > für Fördermaschinen (Untertagebergbau), Stapelkarren, andere Maschinen, Apparate und Geräte zum Heben usw
Teile für Hebezeuge und Fördermitte > für Förderkörbe, Personenaufzüge, Lastenaufzüge oder Rolltreppen
Teile für Hebezeuge und Fördermitte
Handgeführte Elektrowerkzeuge mit eingebautem Elektromotor > Handbohrmaschinen
Handgeführte Elektrowerkzeuge mit eingebautem Elektromotor
Handgeführte Elektrowerkzeuge mit eingebautem Elektromotor > Handsägen
Handgeführte Elektrowerkzeuge mit eingebautem Elektromotor > Handschleif- und Handhobelmaschinen
Handgeführte Elektrowerkzeuge mit eingebautem Elektromotor > Andere elektrische Handwerkzeuge (ohne Akku-Werkzeuge)
Druckluftwerkzeuge > Druckluftwerkzeuge, rotierend (auch schlagend)
Andere tragbare, handgeführte Werkzeuge mit Motorantrieb > Druckluftwerkzeuge
Andere tragbare, handgeführte Werkzeuge mit Motorantrieb > Andere handgeführte, kraftbetriebene Werkzeuge mit Hydraulik oder eingebautem nicht elektrischem Motor a.n.g
Teile für handgeführte Druckluftwerkzeuge
Wärmeaustauscher; Apparate und Vorrichtungen für die Verflüssigung von Luft o.a. Gasen > Wärmeaustauscher
Wärmeaustauscher; Apparate und Vorrichtungen für die Verflüssigung von Luft o.a. Gasen
Klimageräte > Klimageräte als Kompaktgeräte zum Einbau in Wände oder Fenster sowie "Split-Systeme" (Anlagen aus getrennten Einzelelementen)
Klimageräte
Kühl-, Tiefkühl- und Gefriermöbel u.a. Einrichtungen, Maschinen, Apparate und Geräte zur Kälteerzeugung; Wärmepumpen > Schaukühlmöbe
Kühl-, Tiefkühl- und Gefriermöbel u.a. Einrichtungen, Maschinen, Apparate und Geräte zur Kälteerzeugung; Wärmepumpen > Andere Kühlmöbe
Kühl-, Tiefkühl- und Gefriermöbel u.a. Einrichtungen, Maschinen, Apparate und Geräte zur Kälteerzeugung; Wärmepumpen > Wärmepumpen, ausgenommen Klimageräte der 2825 12
Kühl-, Tiefkühl- und Gefriermöbel u.a. Einrichtungen, Maschinen, Apparate und Geräte zur Kälteerzeugung; Wärmepumpen > Andere Einrichtungen, Maschinen, Apparate und Geräte zur Kälteerzeugun
Apparate zum Filtrieren oder Reinigen von Gasen, a.n.g > von Luf
Apparate zum Filtrieren oder Reinigen von Gasen, a.n.g > Apparate zum Filtrieren oder Reinigen von Gasen, a.n.g. (ohne solche, die mit katalytischen Verfahren arbeiten und ohne Isotopentrennern)
Apparate zum Filtrieren oder Reinigen von Gasen, a.n.g
Öl- und Kraftstofffilter für Kolbenverbrennungsmotoren Teile für Apparate zum Filtrieren oder Reinigen von Gasen Ventilatoren (ohne Tisch-, Boden-, Wand-, Decken-, Dach- oder Fensterventilatoren, mit einer Leistung von 125 W oder weniger)
Öl- und Kraftstofffilter für Kolbenverbrennungsmotoren Teile für Apparate zum Filtrieren oder Reinigen von Gasen Ventilatoren (ohne Tisch-, Boden-, Wand-, Decken-, Dach- oder Fensterventilatoren, mit einer Leistung von 125 W oder weniger) > Ventilatoren, a.n.g
Teile für Klimageräte, Kühl- und Gefrierschränke, Wärmepumpen, Wärmeaustauscher u.ä
Teile für Klimageräte, Kühl- und Gefrierschränke, Wärmepumpen, Wärmeaustauscher u.ä > Andere Teile für Kühl- und Gefrierschränke, Wärmepumpen usw
Teile für Klimageräte, Kühl- und Gefrierschränke, Wärmepumpen, Wärmeaustauscher u.ä > Teile für Apparate und Vorrichtungen, auch elektrisch beheizt, zum Behandeln von Stoffen durch auf einer Temperaturänderung beruhende Vorgänge (z.B. Wärmeaustauscher, Trockner) sowie für nicht elektrische Durchlauferhitzer und Heißwasserspeicher, a.n
Generatorgas- und Wassergaserzeuger; Acetylenentwickler u.ä. mit Wasser arbeitende Gaserzeuger; Destillierapparate und Gasreiniger
von Wasser > auf chemischem Wege
von Wasser > auf anderem Wege
Apparate zum Filtrieren oder Reinigen von Flüssigkeiten (ohne Öl- und Kraftstofffilter für Kolbenverbrennungsmotoren)
Apparate zum Filtrieren oder Reinigen von Flüssigkeiten (ohne Öl- und Kraftstofffilter für Kolbenverbrennungsmotoren) > von anderen Flüssigkeiten
Öl-, Kraftstoff- und Luftansaugfilter für Kolbenverbrennungsmotoren
Maschinen und Apparate zum Reinigen, Trocknen, Füllen, Verschließen u.ä. von Flaschen o.ä. Behältnissen > Maschinen zum Reinigen, Trocknen oder Sterilisieren von Packmitteln (z.B. Flaschen, Dosen o.ä. Behältnisse) oder Packstoffen
Maschinen und Apparate zum Füllen, Verschließen, Versiegeln oder Etikettieren formstabiler oder flexibler Packmittel (einschl. Form-, Füll- und Verschließmaschinen); Maschinen zum Versetzen von Getränken mit Kohlensäure
Andere Verpackungsmaschinen (z.B. Einschlag-, Wrap-Around-, Sammelpackmaschinen, Maschinen zum Sichern von Transportverpackungen)
Feuerlöscher, Spritzpistolen, Sandstrahlmaschinen, Wasserstrahlreinigungs- u.ä. Strahlapparate (ohne solche für die Landwirtschaft oder den Gartenbau) > Feuerlöschgeräte und -anlagen (auch mit Füllung)
Feuerlöscher, Spritzpistolen, Sandstrahlmaschinen, Wasserstrahlreinigungs- u.ä. Strahlapparate (ohne solche für die Landwirtschaft oder den Gartenbau) > Spritzpistolen u.ä. Apparate
Feuerlöscher, Spritzpistolen, Sandstrahlmaschinen, Wasserstrahlreinigungs- u.ä. Strahlapparate (ohne solche für die Landwirtschaft oder den Gartenbau) > Wasserstrahlreinigungsapparate, Sandstrahlmaschinen, Dampfstrahlapparate u.ä. Strahlapparate
Feuerlöscher, Spritzpistolen, Sandstrahlmaschinen, Wasserstrahlreinigungs- u.ä. Strahlapparate (ohne solche für die Landwirtschaft oder den Gartenbau) > Sonstige mechanische Apparate zum Verteilen, Verspritzen oder Zerstäuben von Flüssigkeiten oder Pulver (ohne solche für die Landwirtschaft oder den Gartenbau)
Metalloplastische Dichtungen; mechanische Dichtungen
Waagen für Stetigförderer, zum kontinuierlichen Wiegen; Absack-, Abfüll-, Dosier- u.a. Waagen zur Verwiegung konstanter Gewichtsmengen
Andere Waagen und Messmaschinen > Andere Waagen
Andere Waagen und Messmaschinen
Andere Waagen und Messmaschinen > Längenmessinstrumente und -geräte
Zentrifugen (ohne Milchentrahmer und Wäscheschleudern und ohne solche für Laboratorien), a.n.g
Warenverkaufsautomaten (einschl. Geldwechselautomaten)
Maschinen und Apparate für die Behandlung von Stoffen durch Temperaturänderung, a.n.g
Maschinen und Apparate für die Behandlung von Stoffen durch Temperaturänderung, a.n.g > Andere Apparate und Vorrichtungen, auch elektrisch beheizt, für die Behandlung von Stoffen durch Temperaturänderung (ohne Haushaltsapparate)
Andere Apparate und Vorrichtungen, auch elektrisch beheizt, für die Behandlung von Stoffen durch Temperaturänderung (ohne Haushaltsapparate) > für die Nahrungs- und Genussmittelindustrie
Andere Apparate und Vorrichtungen, auch elektrisch beheizt, für die Behandlung von Stoffen durch Temperaturänderung (ohne Haushaltsapparate) > für andere Industrien
Nicht elektrische Maschinen, Apparate und Geräte zum Löten, Schweißen oder Brennschneiden und zum autogenen Oberflächenhärten > Handapparate und -geräte (Brenner)
Nicht elektrische Maschinen, Apparate und Geräte zum Löten, Schweißen oder Brennschneiden und zum autogenen Oberflächenhärten
Teile für Zentrifugen und Apparate zum Filtrieren und Reinigen von Flüssigkeiten oder Gasen
Teile für Zentrifugen und Apparate zum Filtrieren und Reinigen von Flüssigkeiten oder Gasen > Teile für Apparate zum Filtrieren oder Reinigen von Flüssigkeiten oder Gasen
Walzen und Teile für Kalander und Walzwerke > Walzen
Walzen und Teile für Kalander und Walzwerke, Teile für Waagen, mechanische Apparate zum Verteilen von Flüssigkeiten usw., Warenverkaufsautomaten; Gewichte für Waagen > Walzen und Teile für Kalander und Walzwerke
Walzen und Teile für Kalander und Walzwerke, Teile für Waagen, mechanische Apparate zum Verteilen von Flüssigkeiten usw., Warenverkaufsautomaten; Gewichte für Waagen
Walzen und Teile für Kalander und Walzwerke, Teile für Waagen, mechanische Apparate zum Verteilen von Flüssigkeiten usw., Warenverkaufsautomaten; Gewichte für Waagen > Teile für mechanische Apparate zum Verteilen von Flüssigkeiten usw
Teile für Geschirrspülmaschinen und Verpackungsmaschinen
Teile für Geschirrspülmaschinen und Verpackungsmaschinen > Teile für Verpackungsmaschinen
Acker- und Forstschlepper sowie andere Zugmaschinen (ohne Sattel-Straßenzug- und Gleiskettenzugmaschinen), mit einer Motorleistung von mehr als 59 > Acker- und Forstschlepper
Acker- und Forstschlepper sowie andere Zugmaschinen (ohne Sattel-Straßenzug- und Gleiskettenzugmaschinen), mit einer Motorleistung von mehr als 59
Eggen, Grubber (Kultivatoren), Jätmaschinen und Hackmaschinen
Sämaschinen, Pflanz- und Setzmaschinen
Düngerstreuer
Rasenmäher
Mähmaschinen (einschl. Mähbalken für Schlepperanbau) a.n.g
Mähmaschinen (einschl. Mähbalken für Schlepperanbau) a.n.g > Mähmaschinen für Schlepperanbau oder -zu
Sammelpressen, Stroh- und Futterpressen (einschl. Aufnahmepressen)
Maschinen zum Ernten von Wurzeln oder Knollenfrüchten
Andere Erntemaschinen, -apparate und -geräte; Dreschmaschinen und -geräte
Andere Erntemaschinen, -apparate und -geräte; Dreschmaschinen und -geräte > Feldhäcksler, Traubenerntemaschinen
Apparate und Geräte zum Verteilen von Flüssigkeiten oder Pulver, für die Landwirtschaft oder den Gartenbau
Anhänger und Sattelanhänger für landwirtschaftliche Zwecke, auch mit Selbstlade- oder Selbstentladevorrichtungen
Maschinen, Apparate und Geräte für die Futterbereitun
Andere Maschinen, Apparate und Geräte für die Land- und Forstwirtschaft oder den Gartenbau
Andere Maschinen, Apparate und Geräte für die Land- und Forstwirtschaft oder den Gartenbau > Andere Maschinen, Apparate und Geräte für die Land- und Forstwirtschaft oder den Gartenbau
Teile für Ernte- und Dreschmaschinen, a.n.g
Teile für Maschinen, Apparate und Geräte für die Land- und Forstwirtschaft oder den Gartenbau, zum Bearbeiten oder Bestellen des Bodens oder zur Pflege der Pflanzen
Teile für sonstige landwirtschaftliche Maschinen
Teile für sonstige landwirtschaftliche Maschinen > Andere Teile für Maschinen, Apparate und Geräte für die Land- und Forstwirtschaft oder den Gartenbau
Werkzeugmaschinen zum Abtragen von Stoffen aller Art durch Laser-, Licht- o.a. Photonenstrahl, Ultraschall, Wasserstrahl, Elektroerosion, elektrochemische Verfahren oder Elektronen-, Ionen- oder Plasmastrah
Bearbeitungszentren, Mehrwegemaschinen und Transfermaschinen, zum Bearbeiten von Metallen > Horizontale Bearbeitungszentren (einschl. in flexiblen Fertigungssystemen verkettete Bearbeitungszentren)
Bearbeitungszentren, Mehrwegemaschinen und Transfermaschinen, zum Bearbeiten von Metallen > Vertikale u.a. Bearbeitungszentren (einschl. in flexiblen Fertigungssystemen verkettete Bearbeitungszentren)
Bearbeitungszentren, Mehrwegemaschinen und Transfermaschinen, zum Bearbeiten von Metallen
Bearbeitungszentren, Mehrwegemaschinen und Transfermaschinen, zum Bearbeiten von Metallen > Transfermaschinen
Drehmaschinen zur spanabhebenden Metallbearbeitun
Drehmaschinen zur spanabhebenden Metallbearbeitun > Vertikal-Drehmaschinen und -Drehzentren
Ausbohr- und Fräsmaschinen, zur spanabhebenden Metallbearbeitung; Außen- oder Innengewindeschneidmaschinen a.n.g
Ausbohr- und Fräsmaschinen, zur spanabhebenden Metallbearbeitung; Außen- oder Innengewindeschneidmaschinen a.n.g > Universal- u.a. Fräsmaschinen; numerisch gesteuer
Ortsfeste Bohr- und Schlagbohrmaschinen Werkzeugmaschinen zum Entgraten, Schärfen, Schleifen oder zur sonstigen Endbearbeitung von Metal > Schleifmaschinen, numerisch gesteuer
Schleifmaschinen, numerisch gesteuer > Rundschleifmaschinen
Ortsfeste Bohr- und Schlagbohrmaschinen Werkzeugmaschinen zum Entgraten, Schärfen, Schleifen oder zur sonstigen Endbearbeitung von Metal > Schleifmaschinen, nicht numerisch gesteuer
Ortsfeste Bohr- und Schlagbohrmaschinen Werkzeugmaschinen zum Entgraten, Schärfen, Schleifen oder zur sonstigen Endbearbeitung von Metal > Werkzeugmaschinen zum Schärfen, Honen, Läppen, Entgraten, Polieren oder zu anderem Fertigbearbeiten
Werkzeugmaschinen zum Hobeln, Sägen, Trennen oder sonstigen Zerspanen von Metal
Werkzeugmaschinen zum Hobeln, Sägen, Trennen oder sonstigen Zerspanen von Metal > Verzahn-, Zahnfertigbearbeitungsmaschinen
Säge-, Trennmaschinen u.a. spanabhebende Werkzeugmaschinen, a.n.g > Säge- und Trennmaschinen
Biege-, Abkant-, Richtmaschinen zum Bearbeiten von Metallen > Biege-, Abkant- und Richtmaschinen zum Bearbeiten von Flacherzeugnissen (einschl. Pressen), numerisch gesteuer
Biege-, Abkant-, Richtmaschinen zum Bearbeiten von Metallen
Biege-, Abkant-, Richtmaschinen zum Bearbeiten von Metallen > Biege-, Abkant- und Richtmaschinen zum Bearbeiten von Flacherzeugnissen, nicht numerisch gesteuer
Maschinen zum Stanzen und Ausklinken von Metal
Maschinen zum Stanzen und Ausklinken von Metal > Scheren, einschl. Pressen, für die Metallbearbeitung (ohne solche zum Bearbeiten von Flacherzeugnissen aus Metall und mit Lochstanzen kombinierte), nicht numerisch gesteuer
Freiformschmiede- oder Gesenkschmiedemaschinen und -hämmer, hydraulische o.a. Pressen zum Bearbeiten von Metallen, a.n.g., einschließlich Sinterpressen, Schrottpaketierpressen
Hydraulische Pressen für die Metallbearbeitun > Hydraulische Pressen für die Metallbearbeitung, numerisch gesteuer
Freiformschmiede- oder Gesenkschmiedemaschinen und -hämmer, hydraulische o.a. Pressen zum Bearbeiten von Metallen, a.n.g., einschließlich Sinterpressen, Schrottpaketierpressen > Hydraulische Pressen für die Metallbearbeitun
Freiformschmiede- oder Gesenkschmiedemaschinen und -hämmer, hydraulische o.a. Pressen zum Bearbeiten von Metallen, a.n.g., einschließlich Sinterpressen, Schrottpaketierpressen > Nichthydraulische Pressen für die Metallbearbeitun
Nichthydraulische Pressen für die Metallbearbeitun > Nichthydraulische Pressen, nicht numerisch gesteuer
Andere Werkzeugmaschinen zum spanlosen Be- oder Verarbeiten von Metallen oder Cermets
Teile und Zubehör für Maschinen zum Bearbeiten von Metallen (ohne Werkzeughalter und selbstöffnende Gewindeschneid- köpfe, Werkstückhalter, Teilköpfe u.a. Spezialvorrichtungen für Werkzeugmaschinen)
Werkzeugmaschinen zum Bearbeiten von Steinen, keramischen Waren, Beton, Asbestzement o.ä. mineralischen Stoffen oder zum Kaltbearbeiten von Glas
Werkzeugmaschinen zum Bearbeiten von Holz, Kork, Bein, Hart- kautschuk o.ä. harten Stoffen; Maschinen zum Elektroplattieren
Werkzeugmaschinen zum Bearbeiten von Holz, Kork, Bein, Hart- kautschuk o.ä. harten Stoffen; Maschinen zum Elektroplattieren > Pressen zum Herstellen von Span- oder Faserplatten aus Holz usw., andere Maschinen und Apparate zum Behandeln von Holz oder Kork
Werkzeugmaschinen zum Bearbeiten von Holz, Kork, Bein, Hart- kautschuk o.ä. harten Stoffen; Maschinen zum Elektroplattieren > Werkzeugmaschinen zum Bearbeiten von Holz, Kork, Bein, Hartkautschuk o.ä. harten Stoffen, a.n.g
Werkzeugmaschinen zum Bearbeiten von Holz, Kork, Bein, Hartkautschuk o.ä. harten Stoffen, a.n.g > Sägemaschinen
Werkzeugmaschinen zum Bearbeiten von Holz, Kork, Bein, Hartkautschuk o.ä. harten Stoffen, a.n.g > Hobel-, Fräs- und Kehlmaschinen
Werkzeugmaschinen zum Bearbeiten von Holz, Kork, Bein, Hartkautschuk o.ä. harten Stoffen, a.n.g > Schleif- und Poliermaschinen, Biege- und Zusammenfügemaschinen, Bohr- und Stemmmaschinen
Ortsfeste Bohr- und Schlagbohrmaschinen, Feilmaschinen, Nietmaschinen, Blechscheren
Werkzeughalter und selbstöffnende Gewindeschneidköpfe > Dorne, Spannzangen und Hülsen; Werkzeughalter für Drehmaschinen
Werkzeughalter und selbstöffnende Gewindeschneidköpfe > Andere Werkzeughalter
Werkzeughalter und selbstöffnende Gewindeschneidköpfe
Werkstückhalter
Werkstückhalter > Werkstückhalter für Drehmaschinen
Werkstückhalter > Andere Werkstückhalter
Teile und Zubehör für Werkzeugmaschinen zum Bearbeiten von mineralischen Stoffen oder zum Kaltbearbeiten von Glas, zum Bearbeiten von Holz, Kork o.ä. harten Stoffen
Konverter, Gießpfannen, -formen für Ingots, Masseln o.dgl.; Gießmaschinen für Gießereien, Stahlwerke u.a. metallurgische Betriebe, Metallwalzwerke
Konverter, Gießpfannen, -formen für Ingots, Masseln o.dgl.; Gießmaschinen für Gießereien, Stahlwerke u.a. metallurgische Betriebe, Metallwalzwerke > Metallwalzwerke
Teile für Maschinen für die Metallerzeugung, Walzwerkseinrichtungen, Gießmaschinen (einschl. Walzen für Metallwalzwerke) > für Konverter, Gießpfannen, Gießformen, Gießmaschinen für Gießereien, Stahlwerke u.a. metallurgische Betriebe
Teile für Maschinen für die Metallerzeugung, Walzwerkseinrichtungen, Gießmaschinen (einschl. Walzen für Metallwalzwerke)
Abbau-, Tunnelbohr- u.a. Streckenvortriebsmaschinen, Bohrmaschinen und Tiefbohrgeräte > Abbau-, Tunnelbohr- u.a. Streckenvortriebsmaschinen
Abbau-, Tunnelbohr- u.a. Streckenvortriebsmaschinen, Bohrmaschinen und Tiefbohrgeräte > Bohrmaschinen und Tiefbohrgeräte
Planiermaschinen (Bulldozer und Angledozer), selbstfahrend
Frontschaufellader, selbstfahrend
Bagger mit um 360 Grad drehbarem Oberwagen
Andere Bagger, Schürf- u.a. Schaufellader; andere selbstfahrende Maschinen zur Erdbewegung u.ä
Rammen und Pfahlzieher; Schneeräumer; andere nicht selbstfahrende Maschinen, Apparate und Geräte zur Erdbewegung, zum Verdichten, Planieren des Bodens, für den Straßen-, Hoch- oder Tiefbau u.ä
Maschinen zum Sortieren, Sieben, Mischen und zur ähnlichen Bearbeitung von Erden, Steinen, Erzen u.a. mineralischen Stoffen > Maschinen und Apparate zum Sortieren, Sieben, Trennen, Waschen, Zerkleinern, Mahlen, Mischen oder Kneten von mineralischen Stoffen
Maschinen und Apparate zum Sortieren, Sieben, Trennen, Waschen, Zerkleinern, Mahlen, Mischen oder Kneten von mineralischen Stoffen > für bergmännisch gewonnene mineralische Stoffe
Maschinen zum Sortieren, Sieben, Mischen und zur ähnlichen Bearbeitung von Erden, Steinen, Erzen u.a. mineralischen Stoffen
Teile für Bohrmaschinen, Tiefbohrgeräte, Krane, Planier- o.a. Erdbewegungsmaschinen > für Bohrmaschinen und Tiefbohrgeräte
Teile für Bohrmaschinen, Tiefbohrgeräte, Krane, Planier- o.a. Erdbewegungsmaschinen > für Krane, Planier- o.a. Erdbewegungsmaschinen
Teile für Maschinen und Apparate für mineralische Stoffe
Nicht elektrische Industriebacköfen; Dampffiltrier- u.a. Maschinen zum Zubereiten von heißen Getränken oder Speisen; Apparate zum Kochen oder Wärmen von Speisen, ohne solche für den Haushal
Nicht elektrische Industriebacköfen; Dampffiltrier- u.a. Maschinen zum Zubereiten von heißen Getränken oder Speisen; Apparate zum Kochen oder Wärmen von Speisen, ohne solche für den Haushal > Apparate zum Kochen oder Wärmen von Speisen
Maschinen und Apparate zum Herstellen von Nahrungsmitteln oder Getränken, a.n.g.; zum Gewinnen oder Aufbereiten von tierischen oder pflanzlichen Ölen und Fetten > zum Herstellen von Back- oder Teigwaren
Maschinen und Apparate zum Herstellen von Nahrungsmitteln oder Getränken, a.n.g.; zum Gewinnen oder Aufbereiten von tierischen oder pflanzlichen Ölen und Fetten
Maschinen und Apparate zum Herstellen von Nahrungsmitteln oder Getränken, a.n.g.; zum Gewinnen oder Aufbereiten von tierischen oder pflanzlichen Ölen und Fetten > zum Verarbeiten von Fleisch (einschl. Schlachthausanlagen und -einrichtungen)
Maschinen und Apparate zum Herstellen von Nahrungsmitteln oder Getränken, a.n.g.; zum Gewinnen oder Aufbereiten von tierischen oder pflanzlichen Ölen und Fetten > zum industriellen Herstellen, Verarbeiten oder Zubereiten von anderen Nahrungs- und Genussmitteln, Getränken u.ä., a.n.g
Teile für Maschinen u. Apparate für die Nahrungs- und Genussmittelindustrie, a.n.g. (ohne Teile für thermische Verfahrensanlagen, Maschinen zum Bearbeiten von heißen Getränken oder Speisen, Filter oder Zentrifugen)
Wirk-, Strick-, Nähwirk-, Gimpen-, Tüll-, Spitzen-, Stick-, Posamentier-, Flecht-, Netzknüpf- und Tuftingmaschinen
Schaft-, Jacquard-, Kartenschlag-, Kartenkopier-, Kartenbindemaschinen u.a. Hilfsmaschinen und -apparate für Spinnerei-, Weberei-, Wirkerei- und Strickereimaschinen; Stoffdruckmaschinen
Maschinen und Apparate zum Herstellen oder Ausrüsten von Filz- oder Vliesstoffen; Maschinen und Apparate zum Waschen, Bleichen, Färben o.ä. Behandeln von Garnen, Geweben u.a. Spinnstoffwaren
Maschinen und Apparate zum Herstellen oder Ausrüsten von Filz- oder Vliesstoffen; Maschinen und Apparate zum Waschen, Bleichen, Färben o.ä. Behandeln von Garnen, Geweben u.a. Spinnstoffwaren > Maschinen und Apparate zum Waschen, Bleichen oder Färben
Maschinen und Apparate zum Herstellen oder Ausrüsten von Filz- oder Vliesstoffen; Maschinen und Apparate zum Waschen, Bleichen, Färben o.ä. Behandeln von Garnen, Geweben u.a. Spinnstoffwaren > Maschinen und Apparate zum Auf- oder Abwickeln, Falten, Schneiden oder Auszacken von Geweben
Industriell-gewerbliche Waschmaschinen; Maschinen für die chemische Reinigung; Wäschetrockner mit einem Fassungsvermögen an Trocken- wäsche von 10 kg oder mehr
Industriell-gewerbliche Waschmaschinen; Maschinen für die chemische Reinigung; Wäschetrockner mit einem Fassungsvermögen an Trocken- wäsche von 10 kg oder mehr > Trockner für Garne, Gewebe o.a. Spinnstoffwaren mit einem Fassungsvermögen an Trockenwäsche von mehr als 10
Nähautomaten u.a. Nähmaschinen (ohne Haushaltsnähmaschinen)
Nähautomaten u.a. Nähmaschinen (ohne Haushaltsnähmaschinen) > Andere Nähmaschinen
Maschinen und Apparate zum Aufbereiten, Gerben oder Bearbeiten von Häuten, Fellen oder Leder; zum Herstellen oder Instandsetzen von Schuhen oder Lederwaren (ohne Nähmaschinen)
Teile und Zubehör für Spinnerei- und Webereimaschinen > für Spinnereimaschinen oder deren Hilfsmaschinen und -apparate (ohne Spindeln, Spindelflügel, Spinnringe und Ringläufer, Rotorspinnaggregate und Teile dafür)
Teile und Zubehör für Spinnerei- und Webereimaschinen
Teile und Zubehör für Spinnerei- und Webereimaschinen > Teile und Zubehör für Webmaschinen oder deren Hilfsmaschinen oder -apparate
Teile für andere Maschinen für die Textil- und Bekleidungsherstellung sowie für die Lederbearbeitun > für Maschinen zum Waschen von Wäsche, auch mit Trockenvorrichtun
Teile für andere Maschinen für die Textil- und Bekleidungsherstellung sowie für die Lederbearbeitun > Teile und Zubehör für Maschinen und Apparate zum Waschen, Bleichen, Färben, Appretieren, Ausrüsten, Beschichten und Imprägnieren, Trocknen, Reinigen, Bügeln und Pressen
Teile für andere Maschinen für die Textil- und Bekleidungsherstellung sowie für die Lederbearbeitun
Maschinen und Apparate zum Her- oder Fertigstellen, Be- oder Verarbeiten von Halbstoff aus cellulosehaltigen Faserstoffen, Papier und Pappe > Maschinen und Apparate zum Herstellen von Halbstoff aus cellulosehaltigen Faserstoffen, Papier oder Pappe und zum Fertigstellen von Papier oder Pappe
Maschinen und Apparate zum Her- oder Fertigstellen, Be- oder Verarbeiten von Halbstoff aus cellulosehaltigen Faserstoffen, Papier und Pappe > Kombinierte Rollenschneide- und -wickelmaschinen, Längs- und Querschneider, Schnellschneider für Papier oder Pappe
Maschinen und Apparate zum Her- oder Fertigstellen, Be- oder Verarbeiten von Halbstoff aus cellulosehaltigen Faserstoffen, Papier und Pappe
Teile für Maschinen und Apparate für die Papiererzeugung und -verarbeitun
Teile für Maschinen und Apparate für die Papiererzeugung und -verarbeitun > zum Her- oder Fertigstellen von Papier oder Pappe
Teile für Maschinen und Apparate für die Papiererzeugung und -verarbeitun > zum Be- oder Verarbeiten von Papierhalbstoff, Papier oder Pappe
Maschinen und Apparate zum Be- oder Verarbeiten von Kunststoffen und Kautschuk oder zum Herstellen von Waren daraus, a.n.g
Maschinen und Apparate zum Be- oder Verarbeiten von Kunststoffen und Kautschuk oder zum Herstellen von Waren daraus, a.n.g > Andere Maschinen und Apparate zum Herstellen von Formteilen
Maschinen und Apparate zum Be- oder Verarbeiten von Kunststoffen und Kautschuk oder zum Herstellen von Waren daraus, a.n.g > Maschinen zum Herstellen von Zellkunststoff oder Zellkautschuk
Maschinen und Apparate zum Be- oder Verarbeiten von Kunststoffen und Kautschuk oder zum Herstellen von Waren daraus, a.n.g > Andere Maschinen und Apparate zum Be- und Verarbeiten von Kautschuk oder Kunststoffen
Andere Maschinen und Apparate zum Be- und Verarbeiten von Kautschuk oder Kunststoffen > Andere Maschinen und Apparate zum Be- oder Verarbeiten von Kautschuk oder Kunststoffen oder zum Herstellen von Waren aus diesem Material, a.n.g
Teile für Maschinen und Apparate zum Be- oder Verarbeiten von Kunststoffen und Kautschuk oder zum Herstellen von Waren daraus, a.n.g
Buchbindereimaschinen und -apparate (einschl. Fadenheftmaschinen)
Offsetdruckmaschinen und -apparate (ohne Büromaschinen)
Offsetdruckmaschinen und -apparate (ohne Büromaschinen) > Bogenoffsetdruckmaschinen und -apparate
Sonstige Druckmaschinen und -apparate (ohne Büromaschinen)
Maschinen und Apparate von der ausschließlich oder hauptsächlich zur Herstellung von Halbleiterbarren oder -scheiben (Wafers), Halbleiterbauelementen, integrierten elektronischen Schaltungen oder Flachbildschirmen verwendeten Ar
Trockner für Holz, Papierhalbstoff, Papier oder Pappe u.a. Trockner, für gewerbliche Zwecke > Trockner für Holz, Papierhalbstoff, Papier oder Pappe
Trockner für Holz, Papierhalbstoff, Papier oder Pappe u.a. Trockner, für gewerbliche Zwecke > Andere Trockner
Montage und Handhabungstechnik, Maschinen für verschiedene chemische Zwecke, Bodenreinigungsmaschinen u.a. Maschinen, Apparate und Geräte mit eigener Funktion a.n.g > Maschinen zum Behandeln von Metallen (einschl. Spulenwickelmaschinen für elektrotechnische Zwecke), a.n.g
Montage und Handhabungstechnik, Maschinen für verschiedene chemische Zwecke, Bodenreinigungsmaschinen u.a. Maschinen, Apparate und Geräte mit eigener Funktion a.n.g
Montage und Handhabungstechnik, Maschinen für verschiedene chemische Zwecke, Bodenreinigungsmaschinen u.a. Maschinen, Apparate und Geräte mit eigener Funktion a.n.g > Maschinen zum Mischen, Kneten, Mahlen, Zerkleinern, Sieben, Sichten, Homogenisieren, Emulgieren oder Rühren, a.n.g
Montage und Handhabungstechnik, Maschinen für verschiedene chemische Zwecke, Bodenreinigungsmaschinen u.a. Maschinen, Apparate und Geräte mit eigener Funktion a.n.g > Mehrzweck-Industrieroboter, Zentralschmiersysteme
Maschinen und Apparate für mineralische Stoffe, a.n
Maschinen und Apparate für mineralische Stoffe, a.n > Andere Maschinen und Apparate für mineralische Stoffe, a.n.g
Andere Maschinen, Apparate und Geräte mit eigener Funktion (z.B. hydropneumatische Akkumulatoren usw.) (ohne Wasserstrahlschneidmaschinen) > für die automatisierte Montagetechnik
Andere Maschinen, Apparate und Geräte mit eigener Funktion (z.B. hydropneumatische Akkumulatoren usw.) (ohne Wasserstrahlschneidmaschinen) > für die automatisierte Handhabun
Andere Maschinen, Apparate und Geräte mit eigener Funktion (z.B. hydropneumatische Akkumulatoren usw.) (ohne Wasserstrahlschneidmaschinen) > Andere Maschinen, Apparate und Geräte
Teile und Zubehör für Buchbinderei-, Setz- und Druckmaschinen
Teile für Maschinen für sonstige bestimmte Wirtschaftszweige, a.n.g
Teile für Maschinen für sonstige bestimmte Wirtschaftszweige, a.n.g > Teile für andere Maschinen, Apparate und Geräte mit eigener Funktion für sonstige bestimmte Wirtschaftszweige
Hubkolbenverbrennungsmotoren mit Fremdzündung, für Zugmaschinen, Kraftwagen u.a. nicht schienengebundene Landfahrzeuge (ohne Krafträder) mit einem Hubraum von mehr als 1 000 cm³
Personenkraftwagen und Wohnmobile, mit Hubkolbenverbrennungsmotor mit Fremdzündung, mit einem Hubraum von 1 500 cm³ oder weniger
Personenkraftwagen und Wohnmobile, mit Hubkolbenverbrennungsmotor mit Fremdzündung, mit einem Hubraum von mehr als 1 500 cm³ > Personenkraftwagen, mit einem Hubraum von mehr als 1 500 cm³; Wohnmobile mit einem Hubraum von mehr als 3 000 cm³
Personenkraftwagen, mit einem Hubraum von mehr als 1 500 cm³; Wohnmobile mit einem Hubraum von mehr als 3 000 cm³ > andere Personenkraftwagen, mit einem Hubraum von mehr als 1 500 cm³; Wohnmobile mit einem Hubraum von mehr als 3 000 cm³
Personenkraftwagen und Wohnmobile, mit Hubkolbenverbrennungsmotor mit Fremdzündung, mit einem Hubraum von mehr als 1 500 cm³
Personenkraftwagen und Wohnmobile, mit Kolbenverbrennungsmotor mit Selbstzündung (Diesel- oder Halbdieselmotor)
Personenkraftwagen und Wohnmobile, mit Kolbenverbrennungsmotor mit Selbstzündung (Diesel- oder Halbdieselmotor) > Wohnmobile
Lastkraftwagen mit Kolbenverbrennungsmotor, mit Selbstzündung (Diesel- oder Halbdieselmotor)
Lastkraftwagen mit Kolbenverbrennungsmotor, mit Selbstzündung (Diesel- oder Halbdieselmotor) > Lastkraftwagen mit Elektromotor
Andere Kraftfahrzeuge zu besonderen Zwecken (ohne Kranwagen)
Karosserien (einschl. Fahrerhäuser) für Kraftfahrzeuge und Wohnmobile
Karosserien (einschl. Fahrerhäuser) für Kraftfahrzeuge und Wohnmobile > Karosserien oder Aufbauten (einschl. Fahrerhaus), für Einachsschlepper und Lastkraftwagen
Warenbehälter (Container) (einschl. solcher für Flüssigkeiten oder Gase, speziell für eine oder mehrere Beförderungsarten gebaut oder ausgestattet)
Wohnanhänger, zum Wohnen oder Campen
Andere Anhänger und Sattelanhänger zum Befördern von Gütern (z.B. Anhänger mit Tankaufbau, Verkaufsanhänger), a.n.g > Sattelanhänger zur Lastenbeförderun
Andere Anhänger und Sattelanhänger zum Befördern von Gütern (z.B. Anhänger mit Tankaufbau, Verkaufsanhänger), a.n.g
Andere Anhänger und Sattelanhänger zum Befördern von Gütern (z.B. Anhänger mit Tankaufbau, Verkaufsanhänger), a.n.g > Andere Anhänger (einschl. Baustellenwagen als Anhänger)
Teile für Anhänger (einschl. Sattelanhänger)
Umbau-, Zusammenbau-, Karosserie-, Montage- und Ausrüstungsarbeiten an Kraftfahrzeugen, Anhängern und Teilen für Anhänger
Zündkabelsätze u.a. Kabelsätze für Beförderungsmitte
Zündkerzen, Magnetzünder, Lichtmagnetzünder, Schwungmagnetzünder, Zündverteiler, Zündspulen
Anlasser und Licht-Anlasser, andere Lichtmaschinen sowie andere Apparate und Vorrichtungen, für Verbrennungsmotoren
Elektrische Beleuchtungs- und Signalgeräte, Scheibenwischer u.ä., für Kraftfahrzeuge und Fahrräder
Teile für sonstige elektrische Ausrüstungen für Kraftfahrzeuge und Krafträder
Sitze für Kraftfahrzeuge
Sicherheitsgurte, Airbags; andere Karosserieteile u.a. Karosseriezubehör, für Kraftwagen
Andere Teile und Zubehör, a.n.g., für Kraftfahrzeuge
Andere Teile und Zubehör, a.n.g., für Kraftfahrzeuge > Schaltgetriebe; Achsbrücken (Triebachsen) mit Ausgleichsgetriebe, auch mit anderen Kraftübertragungsvorrichtungen; Tragachsen und Teile dafür
Kühler, Auspufftöpfe und -rohre, Schaltkupplungen und Teile dafür, Lenkräder, Lenksäulen und Lenkgetriebe
Andere Teile und Zubehör
Andere Teile und Zubehör > Andere Teile und Zubehör, a.n.g
Fahrgast-, Kreuzfahrt-, Fährschiffe u.ä. Wasserfahrzeuge, hauptsächlich zur Personenbeförderun
Tankschiffe für den Transport von Rohöl, Ölprodukten, Chemikalien und Flüssiggas
Trockengutschiffe
Fischereifahrzeuge; Fabrikschiffe u.a. Schiffe für das Verarbeiten oder Konservieren von Fischereierzeugnissen
Schwimmbagger, Feuerschiffe, Feuerlöschschiffe, Schwimmkrane u.a. Wasserfahrzeuge, bei denen das Fahren von untergeordneter Bedeutung is
Offshore-Wasserfahrzeuge und deren Infrastruktur
Ausrüstungsarbeiten an Schiffen, Bohr- oder Förderplattformen und schwimmenden Vorrichtungen (z.B. Innenausbau, Elektroarbeiten, Schiffsanstreicherei, Klimaanlageneinbau)
Ruderboote, Kanus u.a. Vergnügungs- und Sportboote
Teile für Schienenfahrzeuge; mechanische (auch elektro- mechanische) Signal-, Sicherungs-, Überwachungs- oder Steuergeräte für Schienenwege, Straßen, Parkplätze oder Parkhäuser, Hafenanlagen oder Flughäfen > Teile für Schienenfahrzeuge (z.B. Drehgestelle, Lenkgestelle, Achsen und Räder; Bremsvorrichtungen; Zughaken u.a. Kupplungsvorrichtungen, Puffer, Teile dafür)
Teile für Schienenfahrzeuge; mechanische (auch elektro- mechanische) Signal-, Sicherungs-, Überwachungs- oder Steuergeräte für Schienenwege, Straßen, Parkplätze oder Parkhäuser, Hafenanlagen oder Flughäfen
Umbau, Innenausbau und Ausrüstung (Komplettierung) von Schienenfahrzeugen
Zivile und halböffentliche Starrflügelflugzeuge u.a. Luftfahrzeuge
Teile für Luftfahrzeuge und Raumfahrzeuge für zivile Zwecke
Überholungs- und Umbauarbeiten an Luftfahrzeugen sowie an Motoren und Triebwerken dafür
Rollstühle u.a. Fahrzeuge für Kranke und Körperbehinderte
Teile und Zubehör für Zweiräder u.a. Fahrräder, ohne Motor, sowie für Rollstühle u.a. Fahrzeuge für Behinderte
Teile und Zubehör für Zweiräder u.a. Fahrräder, ohne Motor, sowie für Rollstühle u.a. Fahrzeuge für Behinderte > Andere Teile und Zubehör für Zweiräder u.a. Fahrräder, ohne Motor
Kinderwagen und Teile dafür
Fahrzeuge, a.n.g. (z.B. Schubkarren u.a. Hand- transportfahrzeuge, Gespannfahrzeuge für Tiere)`;

const GP_INDEX = `251110307|0|Stahl-Profilblech-Garagen; Gartenhäuser u.ä. Fertigteilbauten, hauptsächlich aus Stahlblech
251110309|0|Andere Fertigteilbauten und bewohnbare Container
251110500|1|Vorgefertigte Gebäude aus Aluminium
251121003|2|Verkehrsbrücken und Teile dafür
251121005|2|Signal-, Rohr- und Kabelbrücken
251122000|3|Errichtung von Bauwerken wie Brücken, Laufkränen und Freileitungsmasten aus fremdbezogenen Stahlfertigteilen (43.99) Türme und Gittermaste, aus Eisen oder Stahl
251123104|4|Streb- und Streckenausbau (z.B. Grubenstempel, Streckenbögen; ohne schreitenden hydraulischen Grubenausbau) und Zubehör
251123107|4|Anderes Gerüst-, Schalungs- oder Stützmaterial, aus Eisen oder Stahl
251123500|5|Konstruktionen und Konstruktionsteile, ausschließlich oder hauptsächlich aus Stahlblech, z.B. Rollläden
251123551|6|Schützen, Wehre, Schleusentore, ortsfeste Docks, Landebrücken u.a. Konstruktionen für den Wasserbau, aus Eisen oder Stahl
251123554|7|Skelettkonstruktionen für Hallen (z.B. Produktions-, Lager-, Fertigungs-, Freizeithallen)
251123555|7|Skelettkonstruktionen für Büro-, Amts- und Anstaltsgebäude sowie für andere Gebäude (z.B. Bahnhöfe, Flughäfen, Parkhäuser, Wohngebäude)
251123557|7|Stütz- und Trägerkonstruktionen für den Anlagenbau (z.B. für Raffinerien, chemische Industrien, Hütten- und Kraftwerke)
251123558|7|Stütz- und Trägerkonstruktionen für andere Zwecke
251123561|8|Ortsfeste Gerüstkonstruktionen
251123562|8|Glasdachkonstruktionen (z.B. Wintergärten)
251123563|8|Dachstühle und Teile dafür (z.B. Be- und Überdachungen)
251123564|8|Regale (ohne Fachbodenregale und Systemprofile)
251123565|8|Stahlschutzplanken
251123566|8|Abdeckungen (Lichtgitter) und Roste aus gewalzten oder stranggepressten Stahlprofilen (auch aus Rohren)
251123567|8|Scheren- und Rollgitter
251123569|8|Geländer, Treppen, Markisengestelle u.a. Konstruktionen und zu Konstruktionszwecken vorgearbeitete Stäbe, Profile u.dgl., aus Eisen oder Stahl
251123701|9|Skelettkonstruktionen
251123703|9|Bauelemente (ohne Tore, Türen, Fenster)
251123705|9|Rollläden
251123707|9|Scheren- und Rollgitter
251123709|9|Andere Konstruktionen und Konstruktionsteile sowie zu Konstruktions- zwecken vorgearbeitete Bleche, Profile u.dgl., aus Aluminium
251210301|10|Garagentore (Schwing- und Kipptore)
251210302|10|Roll- und Sektionaltore
251210304|10|Schiebe- und Drehflügeltore
251210305|10|Andere Stahltore
251210306|10|Feuerschutztüren
251210307|10|Stahltürzargen
251210309|10|Andere Türen, Tor- und Türschwellen, deren Rahmen und Verkleidungen
251210310|11|Fenster ohne Verglasung, deren Rahmen und Verkleidungen
251210320|11|Fenster mit Verglasung, deren Rahmen und Verkleidungen
251210501|12|Rolltore
251210502|12|Schiebe- und Drehflügeltore
251210503|12|Sektionaltore
251210504|12|Andere Tore
251210505|12|Türen, Tor- und Türschwellen, deren Rahmen und Verkleidungen
251210507|12|Fenster ohne Verglasung, deren Rahmen und Verkleidungen
251210508|12|Fenster mit Verglasung, deren Rahmen und Verkleidungen
252111000|3|Heizkörper für Zentralheizungen, nicht elektrisch beheizt und Teile dafür
252112003|13|mit Gasbeheizung
252112005|13|mit Ölbeheizung
252112007|13|mit anderer Beheizung
252113000|3|Teile für Zentralheizungskessel
252911100|14|für gasförmige Stoffe, aus Eisen oder Stahl (ohne solche für verdichtete oder verflüssigte Gase)
252911203|15|Heizungsboiler
252911207|15|Behälter für chemische Stoffe
252911208|15|Andere Behälter für flüssige Stoffe, mit Innenauskleidung oder Wärmeschutzverkleidung, aus Eisen oder Stahl
252911303|16|Druckwasserkessel
252911309|15|Andere Behälter für flüssige Stoffe
252911503|17|Müllgroßbehälter
252911509|15|Andere Behälter für feste Stoffe
252911700|14|Andere Behälter für Stoffe aller Art, aus Aluminium
252912000|3|Behälter für verdichtete oder verflüssigte Gase, aus Eisen oder Stahl sowie aus Aluminium
253011100|18|Wasserrohrkessel
253011500|18|Flammrohrkessel, Rauchrohrkessel u.a. Dampfkessel (einschl. kombinierter Kessel (Hybridkessel))
253011700|18|Kessel zum Erzeugen von überhitztem Wasser
253012300|19|Hilfsapparate für Zentralheizungskessel, Dampfkessel und Kessel zum Erzeugen von überhitztem Wasser
253012500|19|Kondensatoren für Dampfkraftmaschinen
253013300|20|Teile für Dampfkessel und Kessel zum Erzeugen von überhitztem Wasser
253013500|20|Teile für Hilfsapparate für Kessel und Kondensatoren für Dampfkraft- maschinen
253021000|3|Kernreaktoren, Teile dafür Kernreaktoren, außer Isotopentrennern
253022000|3|Teile für Kernreaktoren, außer Isotopentrennern
254012300|21|Revolver und Pistolen (ohne Schreckschuss-, Leucht-, Starterpistolen und -revolver u.ä. Geräte)
254012503|22|Büchsen
254012505|21|Flinten (einschl. kombinierter Jagdwaffen)
254012508|21|Andere Jagd- und Sportwaffen, z.B. Kleinkaliber
254012700|21|Andere Feuerwaffen (z.B. Schreckschuss- und Reizstoffwaffen, Leucht- und Starterpistolen, Bolzenviehtötungsapparate)
254012900|21|Andere Waffen (z.B. Feder-, Luft- und Gasdruckwaffen, Schlagstöcke usw.; ohne Säbel, Bajonette u.a. blanke Waffen)
254013001|21|Patronen u.a. Munition und Geschosse, Teile dafür, für zivile Zwecke
254014001|23|Teile und Zubehör für Revolver, Pistolen u.a. Waffen für zivile Zwecke
255011341|24|Wellen aus Stahl
255011343|25|Geschmiedete und gewalzte Ringe bis 125 kg Rohgewicht
255011345|26|Andere Freiformschmiedestücke bis 125 kg Rohgewicht
255011347|26|Geschmiedete und gewalzte Ringe über 125 kg Rohgewicht
255011349|26|Andere Freiformschmiedestücke über 125 kg Rohgewicht
255011370|26|Freiformschmiedestücke aus NE-Metall
255011510|27|für Straßenfahrzeuge
255011520|26|Wellen
255011530|26|für Motoren und Antriebselemente
255011540|26|für sonstige Maschinenbauerzeugnisse
255011560|26|für elektrotechnische Erzeugnisse
255011570|26|für sonstige Verwendungszwecke
255011580|26|aus NE-Metall
255012100|28|für Straßenfahrzeuge
255012200|29|Wellen und Teile für Wälzlager
255012300|29|für Motoren und Antriebselemente
255012400|29|für Maschinen, Apparate und Geräte für die Land- und Forstwirtschaft oder den Gartenbau
255012500|29|für Hebezeuge und Fördermittel
255012600|29|für Bau- und Baustoffmaschinen
255012700|29|für sonstige Maschinenbauerzeugnisse
255012800|29|für sonstige Verwendungszwecke
255012900|29|aus NE-Metall
255013100|30|für Straßenfahrzeuge
255013200|31|für Motoren und Antriebselemente
255013300|31|für sonstige Maschinenbauerzeugnisse
255013400|31|für elektrotechnische Erzeugnisse
255013500|31|für sonstige Verwendungszwecke
255013700|31|aus NE-Metall
255020201|32|für Straßenfahrzeuge
255020203|33|für Maschinenbauerzeugnisse
255020205|33|für elektrotechnische Erzeugnisse
255020209|33|für sonstige Verwendungszwecke
255020800|33|aus NE-Metallpulver
256111300|34|durch Aufschmelzen
256111500|34|durch Warmspritzen
256111700|34|Zinküberzug durch Elektrolyse und chemische Verfahren
256111900|34|Andere metallische Überzüge (z.B. Nickel-, Kupfer-, Chromüberzüge, vergolden, versilbern, platinieren) durch Elektrolyse und chemische Verfahren
256112300|35|Kunststoffüberzüge
256112500|35|Andere Überzüge (z.B. wirbelsintern, phosphatieren, gummieren usw.)
256121000|3|Andere Veredlung von Metallen Wärmebehandlung von Metallen (ohne metallische Überzüge) (z.B. härten, vergüten)
256122300|36|Lackierung, Glasur
256122500|36|Anodische Oxidation (Eloxieren)
256122700|36|Hochvakuumverdampfung (CVD/PVD)
256122900|36|Andere Veredlung von Metalloberflächen, a.n.g. (z.B. entgraten, sandstrahlen)
256210010|37|für Armaturen (einschl. Sanitärarmaturen)
256210030|37|für sonstige Maschinenbauerzeugnisse
256210050|37|für Straßenfahrzeuge
256210070|37|für Luft- und Raumfahrzeuge, Satelliten
256210090|38|für elektrotechnische Erzeugnisse
256210110|38|für feinmechanische und optische Erzeugnisse
256210130|39|Drehteile aus Metall für sonstige Erzeugnisse
256220001|40|Schlosser- und Schweißerarbeiten an metallischen Werkstücken
256220003|40|Schleifarbeiten an metallischen Werkstücken
256220008|40|Sonstige Mechanikleistungen, a.n.g
257111200|41|Tischmesser (ohne Fisch- und Buttermesser) mit feststehender Klinge
257111453|42|geschmiedet, aus Edelstahl
257111458|41|Andere Messer
257111600|41|Messer mit nicht feststehender Klinge (einschl. Klappmessern für den Gartenbau)
257111750|41|Klingen und Griffe aus unedlen Metallen für Tischmesser, Taschenmesser, einschl. Gartenmesser (ohne Fisch- und Buttermesser, Messer für Maschinen und mechanische Geräte)
257111903|43|geschmiedet, aus Stahl
257111908|41|Andere Scheren und Scherenblätter
257112300|44|Rasiermesser und Rasierapparate (ohne elektrische), Teile davon (ohne Rasierklingen)
257112800|44|Rasierklingen (einschl. Rasierklingenrohlinge im Band)
257113300|45|Papier-, Radiermesser, Brieföffner, Bleistiftspitzer und Klingen dafür
257113500|45|Instrumente und Zusammenstellungen, für die Hand- oder Fußpflege (einschl. Nagelfeilen)
257113700|45|Andere Schneidwaren (z.B. Haarschneide- und -scherapparate; Spalt-, Hack-, Wiegemesser für Metzger oder Küchengebrauch)
257114300|46|aus nicht rostendem Stahl o.a. unedlen Metall
257114800|46|aus verschiedenen Basismetallen, versilbert, vergoldet oder platiniert
257115000|3|Waren aus Silber Säbel, Degen, Bajonette, Lanzen u.a. blanke Waffen, Teile und Scheiden dafür
257211300|47|Vorhängeschlösser
257211500|47|Schlösser für Kraftfahrzeuge
257211703|48|Zylindermöbelschlösser
257211709|47|Andere Möbelschlösser
257212301|49|mechanisch arbeitend
257212305|49|elektronisch und mechatronisch arbeitend
257212550|50|Andere Schlösser für Gebäudetüren, z.B. Rohrrahmenschlösser
257212703|51|Schlösser für Panzerschränke
257212708|49|Andere Schlösser und Sicherheitsriegel, a.n.g., z.B. Fahrradschlösser, Schlösser für Täschnerwaren
257213300|52|Verschlüsse und Verschlussbügel mit Schloss
257213500|52|Schlüssel, gesondert gestellt (auch Rohlinge)
257213703|53|Mechanische Schließzylinder für Türen
257213706|53|Elektronische und mechatronische Schließzylinder für Türen
257213709|53|Andere Teile für Schlösser und Sicherheitsriegel
257214101|54|Scharniere, Bänder und Fitschen, für Möbel
257214103|55|Scharniere, Bänder, Fitschen und Gehänge, für Bauten
257214105|55|Scharniere für Kraftfahrzeuge
257214109|55|Andere Scharniere
257214200|55|Laufrädchen oder -rollen
257214300|55|Andere Beschläge u.ä. Waren für Kraftfahrzeuge
257214433|56|Fensterbeschläge
257214436|55|Mechanische Türbeschläge
257214437|55|Elektronische und mechatronische Türbeschläge
257214453|57|Fensterbeschläge
257214456|55|Mechanische Türbeschläge
257214457|55|Elektronische und mechatronische Türbeschläge
257214499|55|Andere Baubeschläge
257214503|58|Möbelinnenbeschläge
257214505|55|Möbelaußenbeschläge
257214601|59|für Fenster- und Türvorhänge
257214603|59|für Täschnerwaren
257214609|59|für andere Zwecke
257214700|55|Automatische Türschließer
257214800|55|Kleiderhaken, Huthalter, Konsolen, Stützen u.ä. Waren
257310100|60|Spaten und Schaufeln
257310300|60|Spitzhacken, Hacken aller Art, Rechen und Schaber
257310400|60|Äxte, Beile, Häpen u.ä. Werkzeuge zum Hauen oder Spalten
257310500|60|Garten-, Rosenscheren u.ä. mit einer Hand zu betätigende Scheren (einschl. Geflügelscheren)
257310550|60|Gabeln u.a. Handwerkzeuge (ohne Klappmesser) für Landwirtschaft, Gartenbau oder Forstwirtschaft
257310600|60|Heckenscheren, Baumscheren u.ä. mit zwei Händen zu betätigende Scheren
257320100|61|Handsägen
257320200|61|Bandsägeblätter
257320301|62|für die Metallbearbeitung
257320309|61|für die Bearbeitung anderer Stoffe
257320503|63|Segmentsägeblätter, mit arbeitendem Teil aus gesinterten Hartmetallen oder mit arbeitendem Teil aus Diamant oder agglomerierten Diamanten
257320508|63|Andere Kreissägeblätter, mit arbeitendem Teil aus gesinterten Hartmetallen
257320509|63|Andere Kreissägeblätter, mit arbeitendem Teil aus Diamant oder agglomerierten Diamanten
257320930|64|Langsägeblätter für die Metallbearbeitung
257320973|65|mit arbeitendem Teil aus Stahl und gesinterten Hartmetallen, für die Metallbearbeitung sowie für die Bearbeitung anderer Stoffe
257320977|65|mit arbeitendem Teil aus Diamant oder agglomerierten Diamanten
257320979|65|Andere Sägeblätter mit arbeitendem Teil aus Stahl, für die Bearbeitung anderer Stoffe (z.B. Sägeketten)
257330130|66|Feilen, Raspeln u.ä. Werkzeuge
257330160|67|Kneifzangen u.a. Zangen (auch zum Schneiden), Pinzetten u.ä. Werkzeuge (ohne Lochzangen)
257330230|68|Scheren zum Schneiden von Metallen u.ä. Werkzeuge
257330250|68|Rohr-, Bolzenschneider, Locheisen, Lochzangen u.ä. Werkzeuge
257330330|69|Schrauben- und Spannschlüssel, mit nicht verstellbarer Spannweite
257330350|69|Schrauben- und Spannschlüssel, mit verstellbarer Spannweite
257330370|69|Steckschlüsseleinsätze, auswechselbar (auch mit Halter, Verbindungs- und Antriebsteilen)
257330530|70|Bohrwerkzeuge, Gewindeschneid- und Gewindebohrwerkzeuge
257330550|70|Hämmer und Fäustel
257330570|70|Hobel, Stech-, Hohlbeitel u.ä. Schneidwerkzeuge, für die Holzbearbeitung
257330630|71|Schraubenzieher (Schraubendreher)
257330650|3|Haushaltswerkzeuge (z.B. nicht elektrische Dosenöffner, Schuhanzieher, Entkerner)
257330730|72|Werkzeuge für Maurer, Former und Gießer, Zementarbeiter, Gipser und Maler
257330770|72|Niet-, Bolzenschieß- u.ä. Geräte, Glasschneider, Aufreiber, Nietzieher usw., Heftklammer-, Federdruckgeräte u.a. Handwerkzeuge
257330830|73|Lötlampen u.dgl
257330850|73|Schraubstöcke, Schraubzwingen u.dgl., Feilkloben u.ä. Spannwerkzeuge
257330870|73|Ambosse; tragbare Feldschmieden; Schleifapparate zum Hand- oder Fußbetrieb
257340141|74|Werkzeuge zum Herstellen von Innengewinden, mit arbeitendem Teil aus gesinterten Hartmetallen, für die Metallbearbeitung
257340149|75|Werkzeuge zum Herstellen von Innengewinden, mit arbeitendem Teil aus anderen Stoffen, für die Metallbearbeitung
257340161|76|backen, -walzköpfe), für die Metallbearbeitung
257340169|77|Gewindeschneidwerkzeuge für Außengewinde, für die Metallbearbeitung
257340190|75|Andere Werkzeuge zum Herstellen von Innen- und Außengewinden
257340230|78|Bohrwerkzeuge mit arbeitendem Teil aus Diamant oder agglomeriertem Diamant
257340250|78|Mauerbohrer mit arbeitendem Teil aus anderen Stoffen
257340270|78|Bohrwerkzeuge mit arbeitendem Teil aus gesinterten Hartmetallen, für die Metallbearbeitung
257340310|79|Bohrwerkzeuge für die Metallbearbeitung, mit arbeitendem Teil aus Schnellarbeitsstahl
257340330|79|Bohrwerkzeuge für die Metallbearbeitung, mit arbeitendem Teil aus anderen Stoffen
257340350|79|Andere Bohrwerkzeuge
257340370|76|Reibahlen, Ausbohr- und Räumwerkzeuge mit arbeitendem Teil aus Diamant oder agglomeriertem Diamant
257340441|80|Reibahlen und Ausbohrwerkzeuge mit arbeitendem Teil aus gesinterten Hartmetallen, für die Metallbearbeitung
257340449|80|Reibahlen und Ausbohrwerkzeuge mit arbeitendem Teil aus anderen Stoffen, für die Metallbearbeitung
257340450|76|Reibahlen, Ausbohrwerkzeuge und Räumwerkzeuge (ohne solche für die Metallbearbeitung)
257340480|76|Räumwerkzeuge, für die Metallbearbeitung
257340503|81|Wälzfräswerkzeuge (z.B. für Verzahnungen)
257340505|81|Andere Fräswerkzeuge
257340610|82|Schaftfräser, für die Metallbearbeitung
257340661|83|Wälzfräswerkzeuge, für die Metallbearbeitung (z.B. für Verzahnungen)
257340669|83|Andere Fräswerkzeuge, für die Metallbearbeitung
257340693|84|mit arbeitendem Teil aus gesinterten Hartmetallen
257340699|84|mit arbeitendem Teil aus anderen Stoffen
257340710|85|mit arbeitendem Teil aus Cermets, für die Metallbearbeitung
257340741|86|mit arbeitendem Teil aus Diamant oder agglomeriertem Diamant, für die Metallbearbeitung
257340749|86|mit arbeitendem Teil aus anderen Stoffen, für die Metallbearbeitung
257340790|85|für die Bearbeitung anderer Stoffe
257340810|87|mit arbeitendem Teil aus Diamant oder agglomeriertem Diamant
257340830|87|Schraubendrehereinsätze mit arbeitendem Teil aus anderen Stoffen
257340850|87|Verzahnwerkzeuge (ohne Fräswerkzeuge) mit arbeitendem Teil aus anderen Stoffen
257340870|87|Andere auswechselbare Werkzeuge mit arbeitendem Teil aus gesinterten Hartmetallen
257340891|88|für die Metallbearbeitung
257340899|88|für die Bearbeitung anderer Stoffe
257350130|89|Gießerei-Formkästen; Gießerei-Modelle (ohne solche aus Holz); Grundplatten für Formen
257350150|89|Gießerei-Modelle aus Holz
257350200|90|Formen zum Druckgießen für Metalle oder Hartmetalle (einschl. Spritzgießen)
257350300|90|Andere Formen für Metalle oder Hartmetalle (z.B. Kokillen)
257350500|90|Formen für Glas
257350600|90|Formen für mineralische Stoffe
257350703|91|für Kautschuk
257350705|91|für Kunststoffe
257350800|90|Andere Formen für Kautschuk oder Kunststoffe (ohne Spritzgieß- und Formpresswerkzeuge) (z.B. Vulkanisierungsformen aus Stahl)
257360130|92|mit arbeitendem Teil aus Cermets
257360180|92|mit arbeitendem Teil aus anderen Stoffen (einschl. Teilen)
257360230|93|mit arbeitendem Teil aus Diamant oder agglomeriertem Diamant
257360241|94|mit arbeitendem Teil aus gesinterten Hartmetallen
257360249|94|mit arbeitendem Teil aus anderen Stoffen
257360331|95|für die Blechumformung
257360339|95|für andere Metallbearbeitung
257360390|96|für die Bearbeitung anderer Stoffe
257360433|97|Kreismesser
257360439|98|Andere Messer und Schneidklingen
257360450|98|für die Holzbearbeitung
257360501|99|Kreismesser
257360509|99|Andere Messer und Schneidklingen
257360630|100|für Maschinen für die Landwirtschaft, den Gartenbau oder die Forstwirtschaft
257360653|101|Kreismesser
257360659|101|Andere Messer und Schneidklingen
257360670|100|Wendeschneidplatten für Werkzeuge, nicht gefasst, nach ISO 1832 u.ä. aus Cermets
257360900|102|Andere Plättchen, Stäbchen, Spitzen u.ä. Formstücke für Werkzeuge, nicht gefasst, aus Cermets
259111001|103|Heizungsboiler
259111002|103|Druckwasserkessel
259111003|103|Spundbehälter
259111004|103|Deckelbehälter
259111008|103|Andere Behälter (z.B. Kraftstoffkanister, Heizölkannen)
259112000|3|Behälter aus Eisen oder Stahl (ohne solche, die durch Schweißen, Löten oder Falzen verschlossen werden), mit einem Fassungsvermögen von weniger als 50 l, für Stoffe aller Art (ohne verdichtete oder verflüssigte Gase), ohne mechanische oder wärmetechnische Einrichtungen
259211331|104|für Obst-, Gemüse-, Sauerkonserven, Marmeladen
259211332|105|für Fleisch-, Wurst- und Fischwaren
259211333|105|für Fertiggerichte, Suppen
259211338|105|für sonstige Nahrungsmittel (ohne Getränke) und Tabakwaren (z.B. für Speiseöle)
259211350|105|Getränkedosen
259211501|106|Aerosoldosen
259211504|107|für Industriechemikalien
259211505|105|für Farben, Lacke und verwandte Erzeugnisse
259211506|105|für Klebstoffe und Bindemittel
259211507|105|für kosmetische und pharmazeutische Erzeugnisse
259211509|105|für sonstige Erzeugnisse, a.n.g. (z.B. für Mineralölerzeugnisse)
259212100|108|Tuben
259212401|109|Verpackungsröhrchen
259212405|109|Andere Behälter usw. mit einem Fassungsvermögen von 50 l bis 300 l
259212409|109|Getränkedosen u.a. Behälter usw. mit einem Fassungsvermögen von weniger als 50 l, aus Aluminium (z.B. Konservendosen für Nahrungsmittel)
259212600|108|Aerosoldosen aus Aluminium mit einem Fassungsvermögen von 300 l oder weniger
259213300|110|Kronenverschlüsse
259213500|110|Verschluss- oder Flaschenkapseln, aus Blei; Verschluss- oder Flaschenkapseln, aus Aluminium, mit einem Durchmesser von mehr als 21 mm, z.B. Schraubverschlüsse
259213705|111|Feinstblechverschlüsse aus Stahl für Nahrungsmittel, Getränke und Tabakwaren
259213708|110|Anderes Verpackungszubehör (z.B. Spundbleche, Plomben)
259311301|112|Litzen, Kabel und Seile, mit einer größten Querschnittsabmessung von 3 mm oder weniger
259311303|112|Litzen, mit einer größten Querschnittsabmessung von mehr als 3 mm
259311305|112|Kabel und Seile, mit einer größten Querschnittsabmessung von mehr als 3 mm
259311500|113|Seilschlingen u.ä. Waren
259312300|114|Stacheldraht aus Eisen oder Stahl, für Einzäunungen (auch verwundene Drähte oder Bänder)
259312500|114|Litzen, Kabel, Seile u.ä. Waren, aus Kupfer
259312700|114|Litzen, Kabel, Seile u.ä. Waren, aus Aluminium
259313130|115|Endlose Gewebe für Maschinen, aus nicht rostendem Stahl
259313150|116|Andere Gewebe
259313200|116|Gitter und Geflechte, verschweißt, mit einer Maschengröße von 100 cm² oder mehr, aus Eisen- oder Stahldraht, mit einer größten Querschnittsabmessung von 3 mm oder mehr
259313303|117|Unterstützungskörbe und Deckenträger, geschweißt, für die Betonbewehrung
259313309|3|Andere Gitter und Geflechte, verschweißt
259313430|118|nicht mit Kunststoff überzogen (z.B. verzinkt)
259313450|3|mit Kunststoff überzogen
259313500|3|Streckbleche und -bänder, aus Eisen oder Stahl
259313600|3|Gewebe (einschl. endloser Gewebe), Gitter und Geflechte, aus Kupferdraht; Streckbleche und -bänder, aus Kupfer
259314803|119|Nägel, Krampen, gewellte oder abgeschrägte Klammern u.ä. Waren, aus Eisen- oder Stahl
259314808|119|Andere Nägel, Stifte, Krampen, Klammern (ohne Heftklammern, zusammenhängend in Streifen), u.ä. Waren aus Eisen, Stahl, Kupfer und Aluminium (z.B. Reißnägel, Nägel aus Eisen- oder Stahldraht)
259315100|120|Umhüllte Elektroden aus unedlen Metallen, für das Lichtbogenschweißen
259315300|120|Gefüllte Drähte aus unedlen Metallen, für das Lichtbogenschweißen
259315500|120|Mit Dekapier- oder Flussmitteln umhüllte Stäbe und gefüllte Drähte aus unedlen Metallen, für das Löten oder das Autogenschweißen
259315700|120|Andere Drähte u.ä. Waren (einschl. Teilen)
259316130|121|Parabelfedern und Federblätter dafür, warmgeformt
259316150|122|Andere Blattfedern und Federblätter dafür, warmgeformt
259316170|122|Kaltgeformte Blattfedern und Federblätter dafür
259316310|123|warmgeformt
259316330|122|Schraubendruckfedern, kaltgeformt
259316350|122|Schraubenzugfedern, kaltgeformt
259316370|122|Andere Schraubenfedern, kaltgeformt
259316530|124|Spiralflachfedern
259316550|122|Tellerfedern
259316603|125|Drahtformfedern
259316609|122|Andere Federn
259316800|122|Federn aus Kupfer und aus Kupferlegierungen
259317100|126|Stegketten aus Eisen oder Stahl
259317241|127|mit einer Querschnittsabmessung von 16 mm oder weniger
259317246|127|mit einer Querschnittsabmessung von mehr als 16 mm
259317300|126|Gleitschutzketten aus Eisen oder Stahl
259317500|126|Andere Ketten aus Eisen oder Stahl
259317700|126|Ketten und Teile dafür aus Kupfer
259317800|126|Teile für Ketten aus Eisen oder Stahl
259318000|3|Gelenkketten, aus Eisen oder Stahl Näh-, Strick-, Schnür-, Häkelnadeln, Stichel u.ä. Waren; Sicherheits-, Stecknadeln u.ä. Nadeln, a.n.g., aus Eisen oder Stahl, zum Handgebrauch
259411150|128|Schrauben und Bolzen zum Befestigen von Oberbaumaterial für Bahnen
259411160|128|Schrauben und Bolzen ohne Kopf
259411220|129|mit Schlitz oder Kreuzschlitz, aus nicht rostendem Stahl
259411240|129|mit Schlitz oder Kreuzschlitz, aus Eisen o.a. Stahl
259411260|129|mit Innensechskant, aus nicht rostendem Stahl
259411280|129|mit Innensechskant, aus Eisen o.a. Stahl
259411320|130|mit Außensechskant, aus nicht rostendem Stahl
259411340|130|mit Außensechskant, aus Eisen o.a. Stahl, mit einer Zugfestigkeit von weniger als 800 MPa
259411360|130|mit Außensechskant, aus Eisen o.a. Stahl, mit einer Zugfestigkeit von 800 MPa oder mehr
259411380|130|Andere Schrauben und Bolzen, mit Kopf, aus Eisen oder Stahl
259411530|131|Schwellenschrauben u.a. Holzschrauben
259411570|131|Schraubhaken, Ring- und Ösenschrauben
259411730|132|aus nicht rostendem Stahl
259411750|131|Andere gewindeformende Schrauben
259411840|133|Muttern aus nicht rostendem Stahl
259411860|133|Andere Muttern (ohne solche aus nicht rostendem Stahl)
259411900|134|Andere Waren, aus Eisen oder Stahl, mit Gewinde
259412100|135|Federringe, -scheiben u.a. Sicherungsringe und -scheiben
259412300|135|Andere Unterlegscheiben
259412500|135|Niete
259412700|135|Splinte, Keile u.ä. Waren, ohne Gewinde
259413100|136|Unterlegscheiben (einschl. Federringen und -scheiben) u.a. Waren der Schraubenindustrie, ohne Gewinde (z.B. Niete, Splinte, Keile)
259413400|136|Andere Schrauben; Bolzen und Muttern, mit Gewinde
259413700|136|Andere Waren der Schraubenindustrie, mit Gewinde
259911100|137|Abwasch- und Waschbecken, aus nicht rostendem Stahl
259911270|137|Badewannen aus Eisen oder Stahl
259911310|138|aus Eisen oder Stahl
259911350|138|aus Kupfer
259911370|138|aus Aluminium
259912170|139|Andere Haushalts- und Hauswirtschaftsartikel aus Gusseisen
259912250|139|Andere Haushaltsartikel aus nicht rostendem Stahl (z.B. Koch-, Brat- und Backgeschirre, Schnellkochgeschirre)
259912370|139|Andere Haushalts- und Hauswirtschaftsartikel aus Eisen (ohne Gusseisen) oder Stahl, emailliert
259912453|140|Briefkästen und Kastenanlagen
259912459|140|Koch-, Brat-, Backgeschirr u.a. Haushalts-, Hauswirtschafts- artikel und deren Teile, auch mit Farbe versehen oder lackiert
259912530|141|aus Kupfer und Kupferlegierungen
259912550|141|aus Aluminium und Aluminiumlegierungen, gegossen
259912570|141|Andere Artikel aus Aluminium und Aluminiumlegierungen, a.n.g. (z.B. Koch-, Brat- und Backgeschirre)
259912700|139|Mechanische Handgeräte mit einem Gewicht von 10 kg oder weniger, zum Vorbereiten, Zubereiten oder Anrichten von Speisen oder Getränken
259912800|139|Eisen-, Stahlwolle, Schwämme, Putzlappen, Handschuhe u.ä. Waren, zum Scheuern, Polieren u.dgl., aus Eisen oder Stahl
259921200|142|Panzerschränke, Türen und Fächer für Stahlkammern
259921700|142|Sicherheitskassetten u.ä. Waren
259922000|3|Büromöbel aus Metall Sortier-, Ablege-, Karteikästen, Manuscriptständer, Federschalen, Stempel- halter u.ä. Ausstattungsgegenstände aus unedlen Metallen, für Büros
259923300|143|Mechaniken für Schnellhefter oder Aktenordner
259923500|143|Heftklammern, zusammenhängend in Streifen
259923700|143|Anderes Büromaterial (einschl. Teile)
259924000|3|Statuetten u.a. Ziergegenstände, Rahmen für Fotografien, Bilder u.dgl., Spiegel, aus unedlen Metallen
259925300|144|Klammern, Haken und Ösen für Kleidung, Schuhe, Planen, Täschnerwaren oder zum Fertigen oder Ausrüsten anderer Waren, aus unedlen Metallen
259925503|145|Blindniete
259925509|144|Andere Niete
259925703|146|Verschlüsse (ohne solche für Handtaschen)
259925708|146|Andere Befestigungsartikel (z.B. Schnallen, Schließen); Perlen und zugeschnittene Flitter (z.B. Verschlüsse und Verschlussbügel für Handtaschen)
259926000|3|Schiffsschrauben und Schraubenflügel dafür
259929100|147|Ortsfestes Gleismaterial und Geräte für Schienenwege und Teile dafür (z.B. zusammengesetzte Gleise, Drehscheiben, Prellböcke, Lademaße)
259929110|147|Schiffsanker, Draggen, Teile dafür, aus Eisen oder Stahl
259929130|147|Waren aus nicht verformbaren Gusseisen, a.n.g. (z.B. Kanalguss, Straßenkappen)
259929190|147|Mahlkugeln u.ä. Mahlkörper u.a. Waren aus Eisen oder Stahl, gegossen, a.n.g
259929220|148|Mahlkugeln u.ä. Mahlkörper u.a. Waren, geschmiedet, jedoch nicht weiterbearbeitet
259929250|148|Waren aus Eisen- oder Stahldraht (z.B. Vogelkäfige u.ä. Kleinkäfige, Körbe)
259929280|147|Haarnadeln, Frisiernadeln, Haarklammern, Lockenwickler u.ä. Waren und Teile dafür, aus Metall
259929290|147|Frisierkämme, Einsteckkämme, Haarspangen u.dgl. aus anderem Material als Hartkautschuk oder Kunststoff
259929310|149|Leitern und Trittschemel
259929330|149|Paletten u.ä. stapelfähige Transportmittel
259929350|149|Rollen und Trommeln für Kabel, Schläuche u.dgl
259929373|150|Rohrschellen u.a. Rohrbefestigungselemente, aus Stahl
259929379|150|Bedachungsartikel u.a. Bauartikel, aus Stahlblech (z.B. nicht mechanische Dachentlüfter, Dachrinnen, Haken)
259929451|151|freiformgeschmiedet oder gesenkgeschmiedet
259929453|152|Schlauchbinder-, -verbindungselemente, -schellen und -befestigungselemente
259929454|152|Verkehrsschilder
259929455|152|Schilder aus Stahlblech (ohne Verkehrsschilder)
259929456|152|Kesselböden
259929459|152|Andere Waren aus Eisen oder Stahl, a.n.g. (z.B. Riemen- und Transportverbindungen, Schmutzkörbe u.ä. Abwassersiebe, aus Stahlblech, für Kanalisationsabflüsse, Tabak-, Zigaretten-, Puderdosen, Lippenstifthülsen)
259929551|153|Gewebe, Gitter, Geflechte aus Aluminiumdraht
259929552|151|Andere Waren aus Aluminium, gegossen
259929555|154|Leitern und Trittschemel
259929559|152|Andere Waren aus Aluminium, a.n.g., einschl. Kaltfließpressteile und Platinen für Kraftfahrzeug-Kennzeichen
259929580|151|Waren aus Kupfer, gegossen oder geschmiedet, jedoch nicht weiterbearbeitet (ohne Ketten) u.a. Waren aus Kupfer (z.B. Tabakdosen, Zigarettenetuis, Puderdosen, Steck-, Sicherheitsnadeln usw.; ohne Ketten), a.n.g
259929600|155|Andere Waren aus Zinn, a.n.g. (z.B. Bleche, Bänder, Pulver und Flitter, Rohrform-, Verschluss-und Verbindungsstücke)
259929721|156|Rohre, Rohrform-, Rohrverschluss- und Rohrverbindungsstücke, aus Zink
259929729|156|Andere Waren aus Zink (ohne Stangen, Bleche, Bänder, Rohre, Rohrverbindungsstücke usw.), a.n.g
259929741|156|Stangen (Stäbe), Profile und Draht, aus Blei
259929749|156|Andere Waren aus Blei (ohne Stangen, Profile und Draht (z.B. Rohre, Rohrform-, Rohrverschlussstücke)
259929790|156|Andere Waren aus Nickel, a.n.g
259929820|157|Glocken, Klingeln, Gongs u.ä. Waren
259929830|156|Schläuche aus Eisen oder Stahl, auch mit Verschluss- oder Verbindungsstücken
259929850|156|Schläuche aus anderen unedlen Metallen, auch mit Verschluss- oder Verbindungsstücken
259929871|158|Kraftfahrzeug-Kennzeichen
259929873|158|Typenschilder, Skalen
259929875|158|Frontplatten und Blenden
259929879|158|Andere Schilder, Zahlen, Buchstaben u.a. Zeichen
259929950|156|Dauermagnete aus Metall
259999000|3|Paletten u.a. Transport- und Verpackungsmittel, aus Holz Paletten u.a. Transport- und Verpackungsmittel, aus Kunststoffen Schilder, Verkehrszeichen, Buchstaben u.a., aus Kunststoffen Werbeleuchten, Leuchtschilder, beleuchtete Namensschilder u.dgl. Veredlung von Erzeugnissen dieser Güterabteilung (ohne Schmiede-, Press-, Zieh- und Stanzteile, Ober- flächenveredlung, Wärmebehandlung und Mechanik, a.n.g.)
261111000|3|Kathodenstrahl-Bildröhren; Fernsehkameraröhren; andere Kathodenstrahlröhren
261112000|3|Höchstfrequenzröhren (z.B. Magnetrone, Klystrone, Wanderfeldröhren, Karcinotrone) u.a. Elektronenröhren
261121200|159|Dioden (ohne Foto- und Leuchtdioden) (z.B. Leistungsgleichrichterdioden)
261121500|159|Transistoren, andere Fototransistoren
261121800|159|Thyristoren, Diacs und Triacs (ohne lichtempfindliche Halbleiterbauelemente)
261122200|160|Leuchtdioden, einschl. Laserdioden
261122402|161|Solarzellen (ohne Solarmodule)
261122403|161|Solarmodule
261122407|161|Sensorelemente aus lichtempfindlichen Halbleiterbauelementen
261122408|161|Andere lichtempfindliche Halbleiterbauelemente
261122600|160|Andere Halbleiterbauelemente
261122800|160|Gefasste oder montierte piezoelektrische Kristalle
261130030|162|Integrierte Multichipschaltungen
261130060|162|Andere
261130230|163|Integrierte Multichipschaltungen
261130270|163|Dynamische Schreib-Lesespeicher mit wahlfreiem Zugriff (dynamische RAMs, DRAMs)
261130340|163|Statische Schreib-Lesespeicher (statische RAMs, SRAMs), einschl. Cache-Schreib-Lesespeicher mit wahlfreiem Zugriff (Cache-RAMs)
261130540|163|UV-löschbare, programmierbare Lesespeicher (EPROMs)
261130650|164|Elektrisch löschbare, programmierbare Lesespeicher (E2PROMs; Flash E2PROMs)
261130670|164|Andere Speicher
261130800|165|Verstärker
261130910|166|Integrierte Multichipschaltungen
261130941|167|Sensoren in Form von elektronischen integrierten Schaltungen, a.n.g
261130949|167|Andere elektronische integrierte Schaltungen (z.B. Mikrocontroller, einschl. Mikrocomputer)
261140100|168|Tonabnehmer für Rillentonträger
261140400|168|für Kathodenstrahlröhren u.a. Elektronenröhren
261140700|168|für Halbleiterbauelemente, Leuchtdioden, gefasste oder montierte piezoelektrische Kristalle
261140900|168|für elektronische integrierte Schaltungen und zusammengesetzte Mikroschaltungen (Mikrobausteine)
261150200|169|Gedruckte Mehrlagenschaltungen, nur mit Leiterbahnen oder Kontakten
261150505|170|starr
261150507|170|flexibel
261191000|3|Mit der Herstellung elektronischer integrierter Schaltungen verbundene Dienstleistungen
261210800|3|Gedruckte Schaltungen mit anderen passiven Elementen
261220000|3|Ton-, Video-, Netzwerk- u.ä. Karten für Geräte der automatischen Datenverarbeitung
261230000|3|Intelligente Karten (smart cards)
261291000|3|Kundenkarten, Mitgliedsausweise ohne Speicherchip oder Magnetstreifen Mit der Herstellung und Mikro-Bestückung gedruckter Schaltungen verbundene Dienstleistungen
262011000|3|Mobile Computer mit 10 kg oder weniger Gewicht wie Laptops, Notebooks, Tablets, Personal Digital Assistants (PDA) u.ä. Computer
262012000|3|Zahlungsterminals, Bankautomaten u.ä. Geräte, die an ein Datenver- arbeitungsgerät oder ein Datennetz angeschlossen werden können
262013000|3|Andere digitale automatische Datenverarbeitungsmaschinen, die in einem gemeinsamen Gehäuse mindestens eine Zentraleinheit sowie, auch kombiniert, eine Eingabe- und eine Ausgabeeinheit enthalten (Desk Top PCs)
262014000|3|Andere digitale Datenverarbeitungsmaschinen in Form von Systemen
262015000|3|Andere digitale Verarbeitungseinheiten, auch wenn sie eine oder zwei der folgenden Einheitenarten in einem gemeinsamen Gehäuse umfassen: Speichereinheiten, Eingabeeinheiten, Ausgabeeinheiten
262016400|171|Drucker, Fernkopiergeräte u.a. Maschinen, die an eine ADV-Anlage oder ein Netzwerk angeschlossen werden können, ohne Maschinen zum Drucken mittels Druckformen und Maschinen, die mindestens zwei der Funktionen Drucken, Kopieren oder Übertragen von Fernkopien ausüben
262016500|171|Tastaturen
262016600|171|Andere Ein- oder Ausgabeeinheiten, a.n.g. (z.B. Mäuse, Scanner und Plotter)
262017000|3|Bildschirme und Bildwerfer, hauptsächlich zur Verwendung in einem System der automatischen Datenverarbeitung
262018000|3|Geräte, die wenigstens zwei der folgenden Aufgaben ausführen: Drucken, Abtasten, Kopieren, Fernkopieren und die an eine automatische Datenverarbeitungsmaschine oder ein Netzwerk angeschlossen werden können
262021000|3|Speichereinheiten
262022000|3|Halbleiter-Datenspeichervorrichtungen, nicht flüchtig, ohne Aufzeichnung
262030000|3|Andere Einheiten von automatischen Datenverarbeitungsmaschinen
262040000|3|Teile und Zubehör für automatische Datenverarbeitungsmaschinen
262091000|3|Elektronische integrierte Schaltungen (26 11 30) Installation von Computermodulen
263011001|172|Sende- und Empfangsgeräte nach dem UMTS-Standard (ohne Stationen)
263011009|172|Andere Sendegeräte mit eingebautem Empfangsgerät sowie Stationen für die mobile (nicht leitergebundene) Telekommunikation
263012000|3|Andere Empfangsgeräte für den Funksprech- oder Funktelegrafieverkehr Sendegeräte ohne eingebautes Empfangsgerät
263013000|3|Fernsehkameras
263021000|3|Fernsprechapparate für die drahtgebundene Fernsprechtechnik mit schnurlosem Hörer
263022000|3|Magnetbandgeräte u.a.Tonaufnahmegeräte Funkmessgeräte (Radargeräte) Funknavigationsgeräte Funkfernsteuergeräte Funkfernsprechgeräte für zellulare u.a. drahtlose Mobilfunknetze (Smartphones u.a. Mobiltelefone)
263023100|173|Basisstationen
263023200|173|Geräte zum Empfangen, Konvertieren und Senden oder Regenerieren von Tönen, Bildern o.a. Daten, einschl. Geräte für die Vermittlung (switching) und Wegewahl (routing)
263023300|173|Fernsprechapparate (ausgenommen Fernsprechapparate für die drahtgebundene Fernsprechtechnik mit schnurlosem Hörer sowie Telefone für zellulare Netzwerke oder für andere drahtlose Netzwerke); Videofone
263023400|173|Tragbare Personenruf-, -warn- oder -suchemfpänger
263023700|173|Andere Sende- oder Empfangsgeräte für Töne, Bilder o.a. Daten, einschl. Apparate für die Kommunikation in einem drahtgebundenen oder -losen Netzwerk (wie ein lokales Netzwerk (LAN) oder ein Weitverkehrsnetzwerk (WAN)), (z.B. Gegensprech- und Konferenzanlagen)
263030003|174|für Trägerfrequenzgeräte und Fernsprechtechnik
263030009|174|für Geräte für die Telegrafentechnik
263040100|175|Teleskop- und Stabantennen für Taschen-, Koffer- und Kraftfahrzeugempfangsgeräte
263040350|176|für Empfang über Satellit
263040390|176|Andere Außenantennen
263040400|175|Antennen und Antennenreflektoren für Fernsprecher, Sende- oder Empfangsgeräte
263040500|175|Innenantennen für Rundfunk- und Fernsehempfang (einschl. Geräteeinbauantennen)
263040600|175|Andere Antennen und Teile für Antennen
263040703|177|Baugruppen und Teile für Baugruppen, die aus zwei oder mehr miteinander verbundenen Einzelteilen bestehen
263040705|177|Möbel und Gehäuse, zum Einbau von Rundfunk-, Fernseh- und phonotechnischen Geräten
263050200|178|für Fahrzeuge (ohne für Kraftfahrzeuge)
263050800|178|für Gebäude
263060000|3|Teile für Einbruchs- oder Diebstahlalarmgeräte, Feuermelder u.ä. Geräte
264011000|3|Rundfunkempfangsgeräte (ohne solche für Kraftfahrzeuge), auch kombiniert mit Tonaufnahme- oder Tonwiedergabegeräten oder Uhr
264012700|179|kombiniert mit Tonaufnahme- oder -wiedergabegerät und/oder Navigationsgerät
264012900|179|Andere Rundfunkempfangsgeräte für Kraftfahrzeuge
264020200|180|Videotuner, Satelliten-Receiver
264020400|180|Projektionsfernsehgeräte für mehrfarbiges Bild
264020900|180|Andere Fernsehempfangsgeräte
264031000|3|Plattenspieler, Schallplatten-Musikautomaten, Kassetten-Tonbandabspielgeräte u.a. Tonwiedergabegeräte, ohne eingebaute Tonaufnahmevorrichtung
264032000|3|Magnetbandgeräte u.a. Tonaufnahmegeräte
264033000|3|Videokameraaufnahmegeräte u.a. Videogeräte zur Bild- und Tonaufzeichnung oder -wiedergabe, auch mit eingebautem Videotuner
264034000|3|Bildschirme und Bildwerfer, ohne eingebautes Fernsehfunkempfangsgerät und nicht hauptsächlich zur Verwendung in einem System der automatischen Datenverarbeitung bestimmt
264041000|3|Mikrofone und Haltevorrichtungen dafür
264042350|181|Einzellautsprecher im Gehäuse
264042370|181|Mehrfachlautsprecher in einem gemeinsamen Gehäuse
264042390|181|Andere Lautsprecher
264042700|182|Hörer, auch mit Mikrofon kombiniert
264043550|183|für die Fernsprech- oder Messtechnik
264043590|183|Andere elektrische Tonfrequenzverstärker
264043700|184|Elektrische Tonverstärkereinrichtungen
264044000|3|Empfangsgeräte für den Funksprech- oder Funktelegrafieverkehr, a.n.g
264051500|185|Nadeln; Diamanten, Saphire, andere Edelsteine, Schmucksteine, synthetische oder rekonstituierte Steine
264051700|185|Zusammengesetzte elektronische Schaltungen (Baugruppen) u.a. Teile
264051800|185|Teile für Mikrofone, Lautsprecher, elektrische Tonfrequenzverstärker und Tonverstärkereinrichtungen
264052000|3|Teile für Rundfunkempfänger und -sender
264060500|3|Videospielgeräte (zur Verwendung mit einem Fernsehempfangs- gerät oder mit eigenem Bildschirm) u.a. Geschicklichkeits- oder Glücksspiele mit einer elektronischen Anzeigevorrichtung
265111200|186|Kompasse (einschl. Navigationskompasse)
265111500|186|Navigationsinstrumente, -apparate und -geräte für die Luft- oder Raumfahrt (ohne Kompasse)
265111800|186|Andere Navigationsinstrumente, -apparate und -geräte (ohne Funknavigationsempfangsgeräte)
265111900|186|Funknavigationsempfangsgeräte
265112001|187|Elektronische Instrumente, Apparate und Geräte für die Meteorologie, Hydrologie oder Geophysik
265112002|187|Elektronische Theodolite und Tachymeter, Apparate und Geräte für die Fotogrammetrie, für die Geodäsie, Topografie, Hydrografie, Ozeanografie (ohne Entfernungsmesser, Nivellierinstrumente, Kompasse)
265112005|188|für die Geodäsie, Topografie oder Hydrografie
265112009|188|Andere Theodolite und Tachymeter, Instrumente, Apparate und Geräte für Fotogrammetrie, Ozeanografie, Hydrologie, Meteorologie oder Geophysik
265120200|189|Funkmessgeräte (Radargeräte)
265120500|189|Funknavigationsgeräte (ohne Funknavigationsempfangsgeräte)
265120800|189|Funkfernsteuergeräte
265131000|3|Waagen mit einer Empfindlichkeit von 50 mg oder feiner, auch mit Gewichten, Teile und Zubehör dafür
265132003|190|Reißzeuge
265132009|190|Zeichentische und -maschinen, andere Zeichen-, Anreiß- oder Rechen- instrumente und -geräte
265133001|191|Mikrometer und Schieblehren
265133005|191|Feste Lehren und Eichmaße
265133009|191|Andere Lehren und Eichmaße, a.n.g
265141000|3|Instrumente, Apparate und Geräte zum Messen oder zum Nachweis von ionisierenden Strahlen
265142000|3|Kathodenstrahloszilloskope und Kathodenstrahloszillografen
265143001|192|Multimeter (Vielfachmessgeräte)
265143003|192|Andere elektronische Instrumente, Apparate und Geräte zum Messen oder Prüfen von Spannung, Stromstärke, Widerstand oder Leistung
265143007|193|Voltmeter
265143009|193|Andere Instrumente, Apparate und Geräte
265144000|3|Instrumente, Apparate und Geräte zum Messen oder Prüfen für die Fernmeldetechnik
265145002|194|Instrumente, Apparate und Geräte zum Messen oder Prüfen von Halbleiterscheiben (Wafers) oder Halbleiterbauelementen
265145003|194|Registriervorrichtungen für elektrische Größen
265145005|195|Elektronische Instrumente, Apparate und Geräte
265145009|195|Andere Instrumente, Apparate und Geräte (ohne elektronische Instrumente u.ä.)
265151100|196|Thermometer, flüssigkeitsgefüllt, unmittelbar ablesbar, nicht mit anderen Instrumenten kombiniert (ohne Fieberthermometer)
265151351|197|Temperatursensoren und -messfühler, berührend arbeitend
265151353|197|Temperatursensoren und -messfühler a.n.g., nicht berührend arbeitend, z.B. nicht berührende Sensoren für Pyrometer
265151359|197|Elektronische Thermometer und Pyrometer, a.n.g
265151390|198|Andere Thermometer und optische Pyrometer
265151500|196|Barometer, nicht mit anderen Instrumenten kombiniert
265151750|199|Elektronische Dichtemesser u.ä
265151790|199|Andere Dichtemesser u.ä. schwimmende Instrumente; kombinierte Thermometer, Pyrometer, Barometer; Hygrometer und Psychrometer
265152351|200|Sensoren und Messfühler für elektronische Durchflussmesser
265152359|200|Elektronische Durchflussmesser, a.n.g
265152391|201|Sensoren und Messfühler für elektronische Geräte zum Messen oder Überwachen der Füllhöhe von Flüssigkeiten, a.n.g
265152399|201|Andere elektronische Geräte zum Messen oder Überwachen von Durchfluss oder Füllhöhe von Flüssigkeiten, a.n.g. (ohne einzelne Durchflussmesser)
265152550|202|Durchflussmesser
265152590|202|Andere Geräte zum Messen oder Überwachen von Durchfluss oder Füllhöhe von Flüssigkeiten
265152711|203|Sensoren und Messfühler für die Erfassung von Druck
265152719|203|Elektronische Druckmess- und Überwachungsinstrumente, -apparate und -geräte, a.n.g
265152740|204|Nichtelektronische Manometer mit Metallfedermesswerk
265152790|204|Andere Druckmess- und Überwachungsinstrumente, -apparate und -geräte
265152831|205|Sensoren und Messfühler für die Erfassung von Werten für Mess- und Überwachungsinstrumente, -apparate und -geräte für Flüssigkeiten und Gase, a.n.g
265152839|205|Elektronische Instrumente, a.n.g
265152890|206|Andere Instrumente
265153131|207|Sensoren und Messfühler für elektronische Untersuchungsgeräte für Gase oder Rauch, z.B. für die Untersuchung von Sauerstoff, Kohlenmonoxid, Stickoxid, Alkoholkonzentrat in der Atemluft, Kfz-Abgasen
265153139|207|Elektronische Geräte, a.n.g
265153190|208|Andere Geräte
265153200|209|Chromatographen, Elektrophoresegeräte
265153300|209|Spektrometer, -photometer und -grafen, die optische Strahlen verwenden
265153810|210|Elektronische pH-Messer, rH-Messer u.a. Geräte zum Messen der Leitfähigkeit
265153831|211|Sensoren und Messfühler für andere elektronische Instrumente, Apparate und Geräte für physikalische oder chemische Untersuchungen, a.n.g
265153839|211|Andere elektronische Instrumente, Apparate und Geräte für physikalische oder chemische Untersuchungen, a.n.g
265153950|209|Andere Instrumente, Apparate und Geräte für physikalische oder chemische Untersuchungen, a.n.g., (ohne Belichtungsmesser)
265161000|3|Nichtoptische Mikroskope sowie Diffraktografen
265162001|212|Elektronische Universal- und Zugfestigkeits- und Härteprüfmaschinen für Metalle, -apparate und -geräte
265162003|212|Andere elektronische Materialprüfmaschinen, -apparate und -geräte für Metalle
265162004|213|Andere Materialprüfmaschinen, -apparate und -geräte, für Metalle
265162008|214|Elektronische Materialprüfmaschinen, -apparate und -geräte für Nichtmetalle, z.B. Universal- , Zugfestigkeits-, Härteprüfmaschinen, -apparate und -geräte
265162009|214|Andere Materialprüfmaschinen, -apparate und -geräte für nichtmetallische Stoffe (z.B. Baustoffe, Textilien, Papier, Pappe und Kunststoff)
265163300|215|Gaszähler
265163500|215|Flüssigkeitszähler
265163700|215|Elektrizitätszähler (z.B. Drehstromzähler)
265164301|216|Sensoren und Messfühler für Touren-, Produktionszähler, Taxameter, Kilometerzähler, Schrittzähler u.a. Zähler mit elektrischen Verfahren arbeitend, z.B. Drehzahlsensoren, Aktivitätssensoren
265164304|216|Sensoren für Winkel- und Umdrehungsmessung (Drehgeber bzw. Drehwinkelgeber, Encoder)
265164307|216|Touren-, Produktionszähler, Taxameter, Kilometerzähler, Schrittzähler u.a. Zähler, mit elektrischen Verfahren arbeitend, a.n.g
265164309|216|Andere Touren-, Produktionszähler, Taxameter, Kilometerzähler, Schrittzähler u.a. Zähler
265164530|217|Geschwindigkeitsmesser für Landfahrzeuge
265164550|217|Tachometer u.a. Geschwindigkeitsmesser
265165000|3|Stroboskope Instrumente, Apparate und Geräte zum Regeln, hydraulisch oder pneumatisch
265166203|218|für Kraftfahrzeuge
265166209|218|Andere Prüfstände
265166901|219|Sensoren und Messfühler für die Erfassung von Anwesenheit und Abstand von Objekten
265166902|219|Andere Sensoren und Messfühler zum Messen oder Prüfen geometrischer Größen, z.B. Drehratensensoren, Lenkwinkel- sensoren, Neigungssensoren
265166903|219|Elektronische Instrumente, Apparate und Geräte zum Messen oder Prüfen für 3 D, a.n.g
265166904|219|Andere elektronische Instrumente, Apparate und Geräte zum Messen oder Prüfen geometrischer Größen
265166905|220|Sensoren und Messfühler für andere elektronische Instrumente, apparate und Geräte zum Messen oder Prüfen, z.B. Beschleunigungs- sensoren und -messfühler, Kraftsensoren und -messfühler
265166906|220|Materialprüfmaschinen mittels Ultraschall, Wirbelstrom u.ä
265166907|220|Andere elektronische Instrumente, Apparate und Geräte zum Messen oder Prüfen, a.n.g. (ohne Materialprüfmaschinen)
265166908|221|für geometrische Größen
265166909|221|für andere Größen (z.B. zum Prüfen der Dichtigkeit)
265170150|222|Elektronische Thermostate
265170190|222|Andere Thermostate
265170300|223|Druckregler
265170900|223|Andere Instrumente, Apparate und Geräte zum Regeln
265181000|3|Teile für Radargeräte und -einrichtungen, Funknavigationsgeräte und -einrichtungen
265182001|224|für Instrumente, Apparate und Geräte für die Geodäsie, Topografie, Hydrographie, Ozeanographie u.ä. (ohne Kompasse) sowie Teile und Zubehör für Zeichen-, Anreiß- oder Recheninstrumente und -geräte; für Längenmessinstrumente für den Handgebrauch
265182003|224|für Dichtemesser u.ä. schwimmende Instrumente, Thermometer, Pyrometer, Barometer, Hygrometer und Psychrometer
265182004|224|für Instrumente, Apparate und Geräte zum Messen von Durchfluss, Füllhöhe, Druck o.a. veränderlichen Größen von Flüssigkeiten oder Gasen
265182005|224|Mikrotome und Teile für Instrumente, Apparate und Geräte für physikalische oder chemische Untersuchungen
265182006|224|für Instrumente, Apparate und Geräte zum Messen oder Prüfen elektrischer Größen und zum Messen und Nachweis von ionisierenden Strahlen
265182009|224|für Maschinen, Apparate, Geräte, Instrumente u.a. Waren, a.n.g
265183000|3|Teile für Funkmess-, -navigations- und -fernsteuerungsgeräte Teile und Zubehör für nichtoptische Mikroskope sowie Diffraktografen
265184330|225|für Elektrizitätszähler
265184350|225|für Gas- und Flüssigkeitszähler
265184500|226|für Geschwindigkeitsmesser, andere Zähler und Stroboskope
265185301|227|für Auswuchtmaschinen und Prüfstände
265185303|227|für Materialprüfmaschinen mittels Ultraschall, Wirbelstrom u.ä., a.n.g
265185309|227|für andere Instrumente, Apparate und Geräte zum Messen oder Prüfen, a.n.g
265185500|228|Teile und Zubehör für Instrumente, Apparate und Geräte zum Regeln
265186001|229|für Kompasse u.a. Navigationsinstrumente, -apparate und -geräte
265186002|229|für Maschinen, Apparate und Geräte zum Prüfen von mechanischen Eigenschaften von Stoffen
265211000|3|Armbanduhren, Taschen- u.ä. Uhren, mit Gehäuse aus Edelmetall oder Edelmetallplattierungen, auch mit Stoppeinrichtung
265212000|3|Andere Armbanduhren, Taschen- u.ä. Uhren, auch mit Stoppeinrichtung (ohne Uhren mit Gehäuse aus Edelmetall oder Edelmetallplattierungen)
265213000|3|Armaturenbrett- u.ä. Uhren für Fahrzeuge
265214001|230|Wanduhren (ohne Kuckucksuhren)
265214002|230|Kuckucksuhren (nicht elektrisch betrieben)
265214009|230|Andere Uhren, a.n.g
265221100|3|Uhrwerke
265222100|3|Gehäuse für Uhren u.a. Uhrmacherwaren, Teile dafür
265223100|3|Andere Uhrenteile
265224100|231|Arbeitszeitregistrieruhren; Zeit- und Datumstempeluhren
265224400|231|Andere Zeitkontrollapparate und Zeitmesser (z.B. Parkuhren, Kurzzeitmesser)
265224700|231|Zeitschalter u.a. Zeitauslöser
266011150|232|für medizinische, chirurgische, zahnärztliche oder tierärztliche Zwecke, auch für die Computertomografie
266011190|232|für andere Zwecke
266011300|233|Apparate und Geräte, die Alpha-, Beta- oder Gammastrahlen verwenden (einschl. Schirmbildfotografie- oder Strahlentherapiegeräten)
266011500|233|Röntgenröhren
266011705|234|für Röntgen- u.a. radioaktive Strahlungsapparate und -geräte u.ä
266011709|233|sessel u.dgl. für Röntgenapparate u.ä.)
266012301|235|Elektrokardiografen (Apparate und Geräte)
266012309|235|Zubehör für Elektrokardiografen (z.B. Klebeelektroden)
266012800|236|Andere Elektrodiagnoseapparate und -geräte (z.B. Kernspintomografen, Magnetresonanzgeräte), Teile und Zubehör
266013000|3|Ultraviolett- oder Infrarotbestrahlungsgeräte für medizinische Zwecke, Teile und Zubehör
266014330|237|Schwerhörigengeräte
266014390|237|Teile und Zubehör für Schwerhörigengeräte
266014500|238|Herzschrittmacher (ohne Teile und Zubehör)
267011000|3|Objektive aus Stoffen aller Art für Fotoapparate, Filmkameras, Projektoren oder fotografische und kinematografische Vergrößerungs- oder Verkleinerungsapparate
267012500|3|Fotoapparate zum Herstellen von Klischees und Druckformzylindern, für Unterwasser- oder Luftbildaufnahmen, medizinische Untersuchung innerer Organe oder gerichtsmedizinische oder kriminalistische Laboratorien
267013000|3|Digitalkameras
267014000|3|Sofortbildkameras u.a. Fotoapparate
267015000|3|Filmkameras
267016500|3|Filmvorführapparate
267019100|3|Andere fotografische Geräte; Teile und Zubehör für fotografische Geräte Blitzlichtgeräte, Fotoblitzlampen, Stehbildwerfer, fotografische Vergrößerungs- oder Verkleinerungsapparate, Filmentwicklungsmaschinen und -ausrüstungen für fotografische oder kinematografische Laboratorien, Negativbetrachter, Lichtbildwände
267019900|3|Teile und Zubehör für fotografische Geräte
267021530|239|nicht gefasst
267021550|239|gefasst
267021700|3|Objektive aus Stoffen aller Art, gefasst, für Instrumente, Apparate und Geräte (ohne solche für Foto- und Kinotechnik) (ohne solche aus optisch nicht bearbeitendem Glas)
267021800|3|Polarisierende Stoffe in Form von Folien oder Platten; Filter aus Stoffen aller Art, gefasst (ohne solche aus optisch nicht bearbeitetem Glas)
267022300|240|Ferngläser
267022500|240|Fernrohre, optische Teleskope u.a. astronomische Instrumente und Montierungen dafür
267022703|241|Stereomikroskope
267022709|241|Andere optische Mikroskope; einschl. Mikroskope für Mikrofotografie, -kinematografie und -projektion
267023100|242|Zielfernrohre für Waffen; Periskope; Fernrohre für Maschinen, Apparate, Geräte oder Instrumente
267023300|242|Laser (ohne Laserdioden)
267023900|242|Andere optische Instrumente, Apparate, Geräte (z.B. Lupen, Stereoskope, Flüssigkristallanzeigen)
267024200|243|Entfernungsmesser
267024501|244|Sensoren und Messfühler für Instrumente, Apparate und Geräte, die optische Strahlen (UV-Strahlen, sichtbares Licht, Infrarotstrahlen) verwenden
267024503|244|Andere Instrumente, Apparate und Geräte, die optische Strahlen (UV-Strahlen, sichtbares Licht, Infrarotstrahlen) verwenden, mit elektronischen Bauelementen ausgerüstet, a.n.g
267024509|244|Andere Instrumente, Apparate und Geräte, die optische Strahlen (UV-Strahlen, sichtbares Licht, Infrarotstrahlen) verwenden
267024901|245|Andere optische Instrumente, Apparate und Geräte zum Messen oder Prüfen, a.n.g., für Kraftfahrzeuge
267024909|245|Belichtungsmesser, Stroboskope; optische Instrumente, Apparate und Geräte zum Prüfen von Halbleiterscheiben (Wafers) oder Halbleiterbau- elementen oder zum Prüfen von Fotomasken und Reticles für die Herstellung von Halbleiterbauelementen; Profilprojektoren u.a. optische Instrumente, Apparate und Geräte zum Messen oder Prüfen
267025100|246|für Ferngläser, Fernrohre, optische Teleskope u.a. astronomische Instrumente und Montierungen dafür
267025300|246|für optische Mikroskope
267026100|247|für Flüssigkristallanzeigen, Laser mit Ausnahme von Laserdioden, andere optische Instrumente, Apparate und Geräte a.n.g
267026300|247|für andere Instrumente, Apparate und Geräte zum Messen oder Prüfen von Halbleiterscheiben (Wafers) oder Halbleiterbauelementen oder zum Prüfen von Fotomasken oder Reticles für die Herstellung von Halbleiterbau- elementen sowie für andere optische Instrumente, Apparate und Geräte, a.n.g
268011000|3|Magnetische Datenträger, nicht bespielt, außer Karten mit einem Magnetstreifen
268012000|3|Karten mit einem Magnetstreifen Optische Datenträger, nicht bespielt
268013000|3|Andere Aufzeichnungsträger einschl. Matrizen und Mutterplatten für die Herstellung von Platten
268014000|3|Karten mit einem Magnetstreifen
269999000|3|Veredlung von Erzeugnissen dieser Güterabteilung (ohne Planung und Installation von Dauerbetrieb- Steuerungseinrichtungen)
271110100|248|Elektromotoren mit einer Leistung von 37,5 W oder weniger (einschl. Synchronmotoren mit einer Leistung von 18 W oder weniger, Allstrom-(Universal-)motoren, Wechselstrom- motoren und Gleichstrommotoren)
271110300|248|Gleichstrommotoren und -generatoren mit einer Leistung von mehr als 37,5 W bis 750 W
271110503|249|mit einer Leistung von mehr als 750 W bis 7,5 kW
271110505|249|mit einer Leistung von mehr als 7,5 kW bis 75 kW
271110700|248|Gleichstrommotoren und -generatoren mit einer Leistung von mehr als 75 kW bis 375 kW
271110900|248|Gleichstrommotoren und -generatoren mit einer Leistung von mehr als 375 kW
271121000|3|Allstrom-(Universal)motoren mit einer Leistung von mehr als 37,5 W
271122301|250|mit einer Leistung von mehr als 37,5 W bis 75 W
271122303|250|mit einer Leistung von mehr als 75 W bis 375 W
271122305|250|mit einer Leistung von mehr als 375 W bis 750 W
271122500|251|mit einer Leistung von mehr als 750 W
271123000|3|Mehrphasen-Wechselstrommotoren mit einer Leistung von 750 W oder weniger
271124031|252|Servomotoren
271124039|252|andere, mit einer Leistung von mehr als 750 W bis 7,5 kW
271124050|253|mit einer Leistung von mehr als 7,5 kW bis 37 kW
271124071|254|für den Antrieb von Kraftwagen
271124079|254|andere
271125300|255|Fahrmotoren mit einer Leistung von mehr als 75 kW
271125402|256|für den Antrieb von Kraftwagen
271125405|257|mit einer Spannung von 1 000 V oder weniger
271125406|257|mit einer Spannung von mehr als 1 000 V
271125601|258|mit einer Spannung von 1 000 V oder weniger
271125603|258|mit einer Spannung von mehr als 1 000 V
271125900|255|Andere Mehrphasen-Wechselstrommotoren mit einer Leistung von mehr als 750 kW
271126100|259|mit einer Leistung von 75 kVA oder weniger
271126300|259|mit einer Leistung von mehr als 75 kVA bis 375 kVA
271126500|259|mit einer Leistung von mehr als 375 kVA bis 750 kVA
271126700|259|mit einer Leistung von mehr als 750 kVA
271131100|260|mit einer Leistung von 75 kVA oder weniger
271131300|260|mit einer Leistung von mehr als 75 kVA bis 375 kVA
271131500|260|mit einer Leistung von mehr als 375 kVA bis 750 kVA
271131700|260|mit einer Leistung von mehr als 750 kVA
271132335|261|mit einer Leistung von 7,5 kVA oder weniger
271132355|261|mit einer Leistung von mehr als 7,5 kVA
271132550|262|Andere Stromerzeugungsaggregate, ohne windgetriebene Stromerzeugungsaggregate (z.B. Turbogeneratoren)
271132750|262|Elektrische rotierende Umformer
271141200|263|mit einer Leistung von 650 kVA oder weniger
271141500|263|mit einer Leistung von mehr als 650 kVA bis 10 000 kVA
271141800|263|mit einer Leistung von mehr als 10 000 kVA
271142200|264|Messwandler (z.B. Spannungswandler)
271142400|264|Andere Transformatoren
271142600|265|Andere Transformatoren mit einer Leistung von mehr als 1 kVA bis 16 kVA (z.B. Messwandler, Spannungswandler)
271143303|266|Leistungstransformatoren
271143305|266|Andere Transformatoren
271143803|267|Leistungstransformatoren mit einer Leistung von mehr als 500 kVA bis 1 600 kVA
271143805|267|Leistungstransformatoren mit einer Leistung von mehr als 1 600 kVA
271143807|267|Andere Transformatoren
271150130|268|Vorschaltdrosselspulen (Einfach- und Doppeldrosselspulen), auch mit angeschaltetem Kondensator für Entladungslampen
271150150|268|Andere Vorschaltgeräte für Entladungslampen
271150800|269|Andere Drossel- und Selbstinduktionsspulen
271150900|269|Akkumulatorenladegeräte
271161104|270|für Elektromotoren und elektrische Generatoren
271161106|270|für Stromerzeugungsaggregate und elektrische rotierende Umformer
271162030|271|Ferritkerne für Transformatoren und Selbstinduktionsspulen
271162050|271|Andere Teile für Transformatoren und Selbstinduktionsspulen (ohne Ferritkerne)
271162080|271|Zusammengesetzte elektronische Schaltungen (Baugruppen) für Stromrichter von der mit Telekommunikationsgeräten oder automatischen Datenverarbeitung und ihren Einheiten verwendeten Art
271210100|272|Sicherungen für eine Spannung von mehr als 1 000 V
271210200|272|Leistungsschalter
271210300|272|Trennschalter sowie Ein- und Ausschalter
271210410|272|Blitzschutzvorrichtungen und Spannungsbegrenzer, für eine Spannung von mehr als 1 000 V
271210900|272|Andere Geräte zum Schließen, Unterbrechen, Schützen oder Verbinden von elektrischen Stromkreisen, für eine Spannung von mehr als 1 000 V
271221300|273|für eine Stromstärke von 10 A oder weniger
271221500|273|für eine Stromstärke von mehr als 10 A bis 63 A
271221700|273|für eine Stromstärke von mehr als 63 A
271222303|274|Installationsschutzschalter
271222305|274|Andere Leistungsschalter
271222500|275|Andere Leistungsschalter für eine Stromstärke von mehr als 63 A
271223300|276|für eine Stromstärke von 16 A oder weniger
271223500|276|für eine Stromstärke von mehr als 16 A bis 125 A
271223700|276|für eine Stromstärke von mehr als 125 A
271224330|277|für eine Stromstärke von 2 A oder weniger
271224350|277|für eine Stromstärke von mehr als 2 A (z.B. Fernmelderelais)
271224501|278|für eine Stromstärke von mehr als 2 A bis 16 A (ohne Zeit- und Messrelais)
271224504|278|für eine Stromstärke von mehr als 16 A (ohne Zeit- und Messrelais)
271224507|278|Zeitrelais
271224509|278|Messrelais
271231300|279|Numerische Steuerungen mit zugehörigen Peripheriebaugruppen
271231500|279|Speicherprogrammierbare Steuerungen mit zugehörigen Peripheriebaugruppen
271231703|280|Motorschaltschränke und Energieverteiler
271231705|280|Zählertafeln und Installationsverteiler
271231709|280|Andere Tafeln, Felder, Konsolen u.ä., a.n.g
271232030|281|für eine Spannung von mehr als 1 000 V bis 72,5 kV
271232050|281|für eine Spannung von mehr als 72,5 kV
271240300|282|Tafeln, Felder, Konsolen, Pulte, Schränke u.a. Träger, nicht mit den zugehörigen Geräten ausgerüstet
271240903|283|Zusammengesetzte elektronische Schaltungen (Baugruppen)
271240905|283|Andere Teile für Elektrizitätsverteilungs- oder -schalteinrichtungen
272011000|3|Elektrische Primärelemente und -batterien
272012000|3|Teile für Primärelemente und -batterien
272021000|3|Blei-Akkumulatoren zum Starten von Kolbenverbrennungsmotoren (Starterbatterien)
272022001|284|Antriebsakkumulatoren
272022005|284|Andere Blei-Akkumulatoren
272023000|3|Nickel-Cadmium-; Nickel-Metallhydrid-, Lithium-Ionen-, Lithium- Polymer-, Nickel-Eisen- u.a. elektrische Akkumulatoren
272024000|3|Teile für elektrische Akkumulatoren (einschl. Separatoren)
273111003|285|Fernmeldekabel
273111005|285|Daten- und Steuerkabel
273112000|3|Verlegen von kommunalen Fernsprech- u.a. Fernmeldefreileitungen (42.22) Optische Fasern sowie Bündel und Kabel daraus (ganze Bündel von Lichtleitfasern in einer Umhüllung)
273211003|286|lackiert, emailliert
273211005|286|Andere Wickeldrähte
273212000|3|Koaxialkabel u.a. koaxiale elektrische Leiter, auch mit Anschlussstücken versehen oder dafür vorbereitet, Daten- und Steuerkabel
273213801|287|für die Fernmeldetechnik, für eine Spannung von 80 V oder weniger
273213802|287|für andere Zwecke, für eine Spannung von 80 V oder weniger (z.B. Daten- und Steuerkabel)
273213804|288|für eine Spannung von 1 000 V
273213805|288|für eine Spannung von mehr als 80 V bis unter 1 000 V
273214000|3|Andere elektrische Leiter für eine Spannung von mehr als 1 000 V
273311001|289|Schalter, Trenner für Hauptstromkreise
273311002|289|Schalter für Steuer- und Hilfsstromkreise
273311003|289|Schalter für elektronische Anwendung
273311004|289|Schalter für industrielle Anwendung
273311005|289|Elektromechanische Geräteschalter
273311006|289|Elektronische Geräteschalter
273311007|289|Elektromechanische Installationsschalter
273311008|289|Programmierbare Schalter (z.B. Zeitschalter) sowie elektronische Installationsschalter
273312000|3|Lampenfassungen für eine Spannung von 1 000 V oder weniger
273313100|290|Steckvorrichtungen für Koaxialkabel
273313300|290|Steckvorrichtungen für gedruckte Schaltungen
273313501|291|Stecker und Installationssteckdosen, für industrielle Anwendung
273313502|291|Stecker für häusliche Anwendung
273313503|291|Installationssteckdosen für häusliche Anwendung
273313505|291|Rundsteckverbinder
273313506|291|Rechtecksteckverbinder
273313509|291|Steckverbinder für Lichtwellenleiter u.a. Steckverbinder
273313600|290|Vorgefertigte Schienenverteilungen für elektrische Leitungen
273313700|290|Verbindungs- und Kontaktelemente, für Drähte und Kabel
273313800|290|Andere Geräte zum Schließen, Unterbrechen, Schützen oder Verbinden von elektrischen Stromkreisen, für eine Spannung von 1 000 V oder weniger, a.n.g
273314100|292|Kabelkanäle für elektrische Leitungen, aus Kunststoffen
273314300|292|Isolierteile aus Kunststoffen, für elektrische Maschinen, Apparate, Geräte oder Installationen (ohne elektrische Isolatoren)
274011000|3|Innenverspiegelte Scheinwerferlampen
274012500|293|Wolfram-Halogen-Glühlampen für Krafträder u.a. Kraftfahrzeuge
274012930|294|für eine Spannung von mehr als 100 V
274012950|294|für eine Spannung von 100 V oder weniger
274013000|3|Ultraviolett- und Infrarotlampen Andere Glühlampen mit einer Leistung von 200 W oder weniger und für eine Spannung von mehr als 100 V
274014600|295|Andere Glühlampen für Krafträder u.a. Kraftfahrzeuge
274014900|295|Andere Glühlampen (einschl. Lichtwurflampen)
274015100|296|Glühkathoden-Leuchtstofflampen mit zwei Lampensockeln (ohne Ultraviolettlampen)
274015300|296|Andere Glühkathoden-Leuchtstofflampen (ohne Ultraviolettlampen)
274015500|296|Andere Entladungslampen (ohne Ultraviolettlampen)
274015700|296|Ultraviolett- und Infrarotlampen; Bogenlampen
274021000|3|Tragbare elektrische Leuchten zum Betrieb mit eigener Stromquelle
274022003|297|für Glühlampen
274022005|297|für Entladungslampen
274022009|297|für andere Lampen
274023000|3|Nicht elektrische Beleuchtungskörper
274024000|3|Werbeleuchten, Leuchtschilder, beleuchtete Namensschilder u.dgl
274025301|298|für Glühlampen
274025302|298|für Halogenlampen
274025303|298|für Kompaktleuchtstofflampen
274025304|298|für andere Lampen
274025407|299|Strahler für Glühlampen
274025408|299|Strahler für andere Lampen
274025505|300|Industrieleuchten für höhere Schutzart von mehr als IP 20, für Leuchtstofflampen
274025508|300|Industrieleuchten für höhere Schutzart von mehr als IP 20, für andere Lampen
274025605|301|für Kompaktleuchtstofflampen
274025607|301|für andere Leuchtstofflampen
274025608|301|für andere Lampen
274025701|302|Notbeleuchtungen
274025709|302|Andere elektrische Decken- und Wandleuchten
274030103|303|für Glühlampen
274030109|303|für andere Lampen
274030300|304|Beleuchtungs- und Sichtsignalgeräte für Kraftfahrzeuge (ohne Beleuchtungs- und Sichtsignalgeräte für Fahrräder)
274030901|304|Leuchtdiodenlampen (LED)
274030902|305|Außenleuchten für Haus und Garten, für Glühlampen
274030903|305|Außenleuchten für Haus und Garten, für andere Lampen
274030904|305|Dekorative Straßenleuchten für Fußgängerzonen, für Glühlampen und Leuchtstofflampen
274030905|305|Dekorative Straßenleuchten für Fußgängerzonen, für andere Lampen
274030906|305|Andere Straßenleuchten, für Glühlampen, Leuchtstofflampen und Natriumdampflampen
274030907|305|Andere Straßenleuchten, für andere Lampen
274030908|3|Signal- und Befeuerungsleuchten, für Straßen-, Wasser- und Luftverkehr
274030909|3|Andere elektrische Beleuchtungskörper a.n.g., einschließlich elektrische Beleuchtung von Weihnachtsbäumen, Tunnelbeleuchtung, Bühnen- beleuchtung, Leuchten für Sportplätze, Flutlicht, Bahnhofsleuchten, OP-Leuchten, Montageleuchten in Stabform
274041000|3|Teile für elektrische Glühlampen und Entladungslampen (einschl. innenverspiegelter Scheinwerferlampen und Ultraviolett- und Infrarotlampen; Bogenlampen)
274042300|306|Teile für tragbare elektrische Leuchten zum Betrieb mit eigener Stromquelle (z.B. Primärbatterien, Akkumulatoren oder Dynamos)
274042503|307|Stromschienen für elektrische Leuchten und Teile dafür
274042509|307|Andere Teile für andere Beleuchtungsgeräte
275111100|308|Kombinierte Kühl- und Gefrierschränke mit gesonderten Außentüren
275111330|309|Haushaltskühlschränke (ohne Einbaukühlschränke) (einschl. Absorberkühlschränken)
275111350|309|Einbaukühlschränke
275111500|308|Gefrier- und Tiefkühltruhen mit einem Inhalt von 800 l oder weniger
275111700|308|Gefrier- und Tiefkühlschränke mit einem Inhalt von 900 l oder weniger
275112000|3|Kühl-, Gefrierschränke, Tiefkühltruhen für gewerbliche Zwecke Teile für Kühl-, Gefrierschränke, Tiefkühltruhen für den Haushalt Teile für Kühl-, Gefrierschränke, Tiefkühltruhen für gewerbliche Zwecke Reparatur von elektrischen Kühl- und Gefrierschränken für den Haushalt (95.22.10) Haushaltsgeschirrspülmaschinen
275113000|3|Teile für Geschirrspülmaschinen Maschinen zum Waschen von Wäsche und Wäschetrockner, mit einem Fassungsvermögen an Trockenwäsche von 10 kg oder weniger
275114000|3|Decken aus Gewebe mit elektrischer Heizvorrichtung
275115300|310|Ventilatoren mit eingebautem Elektromotor mit einer Leistung von 125 W oder weniger
275115800|310|Abzugshauben mit einer größten horizontalen Seitenlänge von 120 cm oder weniger
275121230|311|Staubsauger, mit einer Leistung von 1500 W oder weniger und mit einem Fassungsvermögen des Staubbehälters von 20 l oder weniger
275121250|311|Andere Staubsauger
275121700|311|Lebensmittelzerkleinerungs- und -mischgeräte (Küchenmaschinen); Frucht- und Gemüsepressen
275121900|311|Andere elektromechanische Haushaltsgeräte (z.B. Schneidemaschinen), a.n.g
275122000|3|Reparatur von elektrischen Staubsaugern für den Haushalt (95.22.10) Elektrische Rasierapparate, Haarschneide- und Schermaschinen sowie Haarentferner (Epilatoren)
275123100|312|Elektrische Haartrockner
275123300|312|Andere Elektrowärmegeräte zur Haarpflege
275123500|312|Elektrische Händetrockner
275123700|312|Elektrische Bügeleisen
275124100|313|Staubsauger, einschl. Trocken- und Nasssauger (ohne eingebautem Elektromotor)
275124300|313|Kaffee- und Teemaschinen
275124500|313|Brotröster (Toaster)
275124900|313|Andere Elektrowärmegeräte für den Haushalt, a.n.g
275125300|314|Durchlauferhitzer
275125600|314|Andere elektrische Warmwasserbereiter, a.n.g
275126300|315|Elektrische Speicherheizgeräte
275126500|315|Elektrische Radiatoren mit Flüssigkeitsumlauf, Konvektoren, elektrische Heizgeräte mit eingebautem Ventilator
275126900|315|Andere elektrische Heizgeräte
275127000|3|Mikrowellengeräte
275128100|316|Elektrische Vollherde
275128300|316|Elektrische Einzel- oder Mehrfachkochplatten und Kochmulden
275128500|316|Elektrische Grillgeräte und Bratgeräte
275128700|316|Elektrische Einbau-Backöfen
275128900|316|Andere elektrische Öfen
275129000|3|Reparatur von elektrischen Haushaltskochgeräten (95.22.10) Elektrische Heizwiderstände
275130100|317|für Staubsauger
275130300|317|für elektromechanische Haushaltsgeräte
275130500|317|für elektrische Rasierapparate, Haarschneide- und Schermaschinen
275130700|317|für Warmwasserbereiter, Elektrowärmegeräte für den Haushalt und für gewerbliche Zwecke
275211130|318|Gas-Einbauherde und -backöfen
275211150|318|Andere Kochgeräte u.ä. Geräte für Feuerung mit gasförmigen Brennstoffen (oder mit Gas u.a.)
275211900|319|Back-, Koch- u.ä. Geräte für Feuerung mit anderen Brennstoffen, aus Eisen oder Stahl sowie Koch- und Heizgeräte, aus Kupfer
275212340|320|Heizgeräte u.ä. nicht elektrische Haushaltsgeräte für Feuerung mit gasförmigen Brennstoffen oder mit Gas u.a. Brennstoffen
275212500|320|Heizgeräte u.ä. nicht elektrische Haushaltsgeräte für Feuerung mit flüssigen Brennstoffen
275212700|320|Heizgeräte u.ä. nicht elektrische Haushaltsgeräte für Feuerung mit festen Brennstoffen
275213000|3|Nicht elektrische Heißlufterzeuger und -verteiler, mit motorbetriebenem Ventilator oder Gebläse, Teile dafür, aus Eisen oder Stahl, auch für gewerbliche Zwecke
275214005|321|mit Ölbeheizung oder für Feuerung mit festen Brennstoffen
275214007|321|Solarkollektoren
275214008|321|mit sonstiger Beheizung (z.B. mit Gas)
275220000|3|Teile für elektrische Durchlauferhitzer und Heißwasserspeicher Teile für nicht elektrische Durchlauferhitzer und Heißwasserspeicher Teile für Öfen, Kochgeräte, Warmhalteplatten u.ä. nicht elektrische Haushaltsgeräte, aus Eisen oder Stahl
279011506|322|Rotierende elektrische Maschinen (Tachogeneratoren)
279011508|322|Andere elektrische Maschinen, Apparate und Geräte mit eigener Funktion, a.n.g. (z.B. Geräte mit Übersetzungs- oder Wörterbuchfunktion)
279012300|323|Elektrische Isolatoren aus Stoffen aller Art (ohne Glas und Keramik)
279012800|323|Isolierteile (ohne Keramik- und Kunststoffteile) für elektrische Maschinen, Geräte oder Installationen; Isolierrohre und Verbindungsstücke, aus unedlen Metallen, mit Innenisolierung
279013300|324|Elektroden für Öfen
279013500|324|Andere Elektroden (z.B. Elektroden für Elektrolyseanlagen)
279013700|324|Kohlebürsten
279013900|324|Heizwiderstände u.a. Waren für elektrotechnische Zwecke, aus Graphit o.a. Kohlenstoff
279020200|325|Anzeigetafeln mit Flüssigkristallanzeige (LCD)
279020500|325|Anzeigetafeln mit Leuchtdiodenanzeige (LED)
279020800|325|Andere Hör- und Sichtsignalgeräte
279031090|326|Lötkolben und Lötpistolen
279031180|326|Andere elektrische Maschinen, Apparate und Geräte zum Hart- oder Weichlöten
279031450|326|Maschinen, Apparate und Geräte zum Widerstandsschweißen von Metallen
279031540|326|Automaten zum Lichtbogen- oder Plasmaschweißen von Metallen
279031630|326|Andere Maschinen, Apparate und Geräte zum Lichtbogen- oder Plasma- schweißen von Metallen zum manuellen Schweißen, mit umhüllten Elektroden, bestehend aus Schweißköpfen oder Schweißzangen und Transformator, Stromrichter, Generator oder rotierendem Umformer
279031723|327|Schutzgasschweißgeräte für das MIG/MAG-Verfahren
279031729|327|Andere Schutzgasschweißgeräte u.ä. (z.B. nach dem WIG-, UP-RES- Verfahren) zum Lichtbogen- oder Plasmaschweißen
279031810|326|Andere Maschinen, Apparate und Geräte zum Schweißen von Metallen, auch solche zum Spritzen schmelzfähiger Metalle oder Hartmetalle
279031911|328|Maschinen, Apparate und Geräte zum Widerstandsschweißen von Kunststoffen
279031913|329|für Kunststoffe
279031919|329|Andere Maschinen u.ä., auch zum Schneiden verwendbar, elektrisch oder mit Laser, Ultraschall u.ä
279032000|3|Armaturen Acetylenentwickler Teile für elektrische Löt- und Schweißmaschinen, -apparate und -geräte; Teile für elektrische Maschinen, Apparate und Geräte zum Spritzen schmelzflüssiger Metalle oder Cermets
279033300|330|für elektrische Verkehrssignal-, -sicherungs-, -überwachungs- und - steuerungsgeräte für Schienenwege, Straßen, Binnenwasserstraßen, Parkplätze, Hafenanlagen u.ä
279033500|330|für elektrische Hör- und Sichtsignalgeräte (Einbruchs- oder Diebstahlalarmanlagen, Feuermelder u.ä. Geräte; Anzeigetafeln)
279033700|330|für elektrische Maschinen, Apparate und Geräte mit eigener Funktion
279033900|330|Andere elektrische Teile für Maschinen, Apparate oder Geräte, a.n.g
279041300|331|Gleichrichter
279041400|331|Stromversorgungseinheiten für Telekommunikationsgeräte, automatische Datenverarbeitungsmaschinen und ihre Bausteine
279041531|332|für Photovoltaikanlagen
279041539|332|andere
279041551|333|für Photovoltaikanlagen
279041559|333|andere
279041703|334|Netzgeräte, Schaltnetzteile
279041709|334|Andere Stromrichter (z.B. Schweißstromrichter) (ohne Schweißausrüstung)
279041900|331|Teile für Stromrichter (ohne solche für zusammengesetzte elektronische Schaltungen (Baugruppen) für Stromrichter von der mit Telekommunikations- geräten oder automatischen Datenverarbeitungsmaschinen und ihren Einheiten verwendeten Art)
279042000|3|Brennstoffzellen
279043000|3|Überspannungsableiter, für eine Spannung von mehr als 1 000 V
279044001|335|für die Fernmeldetechnik, für eine Spannung von 80 V oder weniger
279044002|335|für andere Zwecke, für eine Spannung von 80 V oder weniger (z.B. Daten- und Steuerkabel)
279044004|336|für eine Spannung von 1 000 V
279044005|336|für eine Spannung von mehr als 80 V bis unter 1 000 V
279045100|337|Teilchenbeschleuniger
279045300|337|Signalgeneratoren
279045500|337|Elektromagnetische Kupplungen und Bremsen
279045600|337|Elektromagnetische Hebeköpfe; andere elektromagnetische Vorrichtungen und Teile dafür
279045700|337|Sonnenbänke, Sonnenhimmel u.ä. Bräunungsgeräte
279051000|3|Festkondensatoren für Ströme mit 50/60 Hz, mit einer Blindleistung von 0,5 kVar oder mehr (Leistungskondensatoren)
279052200|338|Tantalkondensatoren; Aluminium-Elektrolytkondensatoren
279052400|338|Andere Festkondensatoren, a.n.g
279053000|3|Drehkondensatoren u.a. einstellbare Kondensatoren
279060350|339|für eine Leistung von 20 W oder weniger
279060370|339|für eine Leistung von mehr als 20 W
279060550|340|für eine Leistung von 20 W oder weniger
279060570|340|für eine Leistung von mehr als 20 W
279060800|341|Kohlemasse- und Kohleschichtfestwiderstände; andere Stellwiderstände (einschl. Rheostaten und Potentiometern)
279070100|342|Elektrische Verkehrssignal-, -sicherungs-, -überwachungs- und -steuerungsgeräte für Schienenwege u.dgl
279070300|342|Elektrische Verkehrssignal-, -sicherungs-, -überwachungs- und -steuerungsgeräte für Straßen, Binnenwasserstraßen, Parkplätze, Hafenanlagen u.ä
279081000|3|Teile für elektrische Kondensatoren
279082000|3|Teile für elektrische Widerstände, Rheostate und Potentiometer
279999000|3|Veredlung von Erzeugnissen dieser Güterabteilung
281111000|3|Außenbordmotoren mit Fremdzündung, für Wasserfahrzeuge
281112000|3|Andere Antriebsmotoren mit Fremdzündung, für Wasserfahrzeuge u.a. Zwecke (ohne solche für Luft- und Kraftfahrzeuge)
281113100|343|Kolbenverbrennungsmotoren mit Selbstzündung (Diesel- oder Halbdieselmotoren) für Acker- und Forstschlepper auf Rädern
281113110|344|mit einer Leistung von 200 kW oder weniger
281113150|344|mit einer Leistung von mehr als 200 kW bis 1 000 kW
281113190|344|mit einer Leistung von mehr als 1 000 kW
281113200|343|Dieselmotoren für Schienenfahrzeuge
281113310|345|mit einer Leistung von 15 kW oder weniger
281113330|345|mit einer Leistung von mehr als 15 kW bis 30 kW
281113350|345|mit einer Leistung von mehr als 30 kW bis 50 kW
281113370|345|mit einer Leistung von mehr als 50 kW bis 100 kW
281113530|346|mit einer Leistung von mehr als 100 kW bis 200 kW
281113550|346|mit einer Leistung von mehr als 200 kW bis 300 kW
281113570|346|mit einer Leistung von mehr als 300 kW bis 500 kW
281113730|347|mit einer Leistung von mehr als 500 kW bis 1 000 kW
281113750|347|mit einer Leistung von mehr als 1 000 kW
281121603|348|Dampfturbinen (ohne solche für den Antrieb von elektrischen Generatoren)
281121605|348|Wasserdampfturbinen für den Antrieb von elektrischen Generatoren
281122000|3|Wasserturbinen und -räder
281123000|3|Gasturbinen (ohne Turbo-Strahltrieb- und Turbo-Propellertriebwerke)
281124000|3|Windgetriebene Stromerzeugungsaggregate (Windturbinen)
281131000|3|Teile für windgetriebene Stromerzeugungsaggregate (Windturbinen) Teile für Turbinen Teile für Dampfturbinen
281132000|3|Teile und Regler für Wasserturbinen und -räder
281133000|3|Teile für Gasturbinen (ohne solche für Turbo-Strahltrieb- und Turbo-Propellertriebwerke)
281141001|349|Zylinderblöcke, Zylinder, Zylindermäntel, Zylinderköpfe
281141004|349|Stangen, Kolben, Ringe
281141007|349|Vergaser, Einspritzungssysteme
281141009|349|Andere Teile für Motoren für Wasserfahrzeuge, Schienenfahrzeuge, industrielle u.a. Zwecke
281142001|350|Stangen, Kolben, Ringe
281142005|350|Einspritzungssysteme für Kraftfahrzeuge
281142007|350|Andere Einspritzungssysteme
281142008|350|Andere Teile für Motoren für Wasserfahrzeuge, Schienenfahrzeuge, industrielle u.a. Zwecke
281211300|351|Hydrozylinder
281211800|351|Druckluftmotoren (Pneumatikzylinder)
281212000|3|Rotierende hydraulische und pneumatische Motoren, andere Motoren (z.B. Wasser- und Dampfkraftmaschinen), a.n.g
281213203|352|Axialkolbenpumpen
281213208|352|Andere Hydrokolbenpumpen (z.B. Radialkolbenpumpen)
281213500|353|Zahnrad-Hydropumpen
281213800|353|Flügelzellen-Hydropumpen
281214200|354|Druckminderventile, kombiniert mit Filtern oder Ölern (Druckluftwartungseinheiten)
281214500|3|Hydroventile
281214800|3|Pneumatikventile
281215300|355|mit oszillierenden Verdrängerpumpen
281215800|355|mit rotierenden Verdrängerpumpen
281216300|356|mit Hydrozylindern
281216800|356|mit Hydromotoren
281220003|357|für pneumatische Antriebe (Zylinder und Motoren)
281220007|357|für hydraulische Antriebe (Zylinder und Motoren) sowie für Wasser- und Dampfkraftmaschinen, Strahltriebwerke, andere Motoren, a.n.g. (ohne solche für pneumatische und hydraulische Antriebe)
281311050|358|Ausgabepumpen für Kraftstoffe oder Schmiermittel, für Tankstellen und Kraftfahrzeugwerkstätten
281311250|358|Andere Ausgabepumpen mit Flüssigkeitsmesser
281311450|358|Handpumpen (ohne Flüssigkeitsmesser)
281311650|358|Kraftstoff-, Öl- oder Kühlmittelpumpen für Kolbenverbrennungsmotoren
281311850|358|Betonpumpen
281312200|359|Dosierpumpen
281312500|359|Andere Kolbenpumpen
281312800|359|Andere oszillierende Verdrängerpumpen
281313200|360|Andere Zahnradpumpen
281313400|360|Andere Flügelzellenpumpen
281313600|361|Schraubenspindelpumpen
281313803|362|Exzenterschneckenpumpen
281313809|362|Andere rotierende Verdrängerpumpen (ohne Exzenterschneckenpumpen)
281314130|363|Tauchmotorpumpen, einstufig
281314150|363|Tauchmotorpumpen, mehrstufig
281314170|363|Umlaufbeschleuniger für Heizungs- und Heißwasseranlagen (ohne Wellenabdichtung)
281314200|364|Kreiselpumpen mit einer Nennweite des Austrittstutzens von 15 mm oder weniger
281314300|364|Kanalradpumpen und Seitenkanalpumpen
281314510|365|Radialkreiselpumpen, einströmig, in Blockbauweise
281314530|365|Radialkreiselpumpen, einströmig, nicht in Blockbauweise
281314550|365|Radialkreiselpumpen, mehrströmig
281314600|364|Radialkreiselpumpen, mehrstufig
281314710|366|einstufig
281314750|366|mehrstufig
281314800|364|Andere Flüssigkeitspumpen; Hebewerke für Flüssigkeiten
281321700|367|Drehschieber-, Sperrschieber-, Molekular- und Wälzkolbenpumpen, Diffusions-, Kryo- und Adsorptionspumpen
281321900|367|Andere Vakuumpumpen (ohne Drehschieber-, Diffusionspumpen usw.)
281322000|3|Hand- oder fußbetriebene Luftpumpen
281323000|3|Kompressoren für Kältemaschinen
281324000|3|Fahrbare Luftkompressoren
281325300|368|einstufig
281325500|368|mehrstufig
281326300|369|zum Erzeugen eines Überdrucks von 15 bar oder weniger, mit einer Liefermenge je Stunde von 60 m³ oder weniger
281326500|369|zum Erzeugen eines Überdrucks von 15 bar oder weniger, mit einer Liefermenge je Stunde von mehr als 60 m³
281326700|369|zum Erzeugen eines Überdrucks von mehr als 15 bar, mit einer Liefermenge je Stunde von 120 m³ oder weniger
281326900|369|zum Erzeugen eines Überdrucks von mehr als 15 bar, mit einer Liefermenge je Stunde von mehr als 120 m³
281327300|370|einwellig
281327530|371|Schraubenkompressoren
281327550|371|Andere Verdrängerkompressoren
281328000|3|Andere Luft- und Gaskompressoren, a.n.g
281331001|372|für Hydropumpen
281331002|372|für andere rotierende Verdrängerpumpen
281331003|372|für andere oszillierende Verdrängerpumpen
281331005|372|für andere Kreiselpumpen
281331008|372|für andere Flüssigkeitspumpen und für Hebewerke für Flüssigkeiten
281332002|373|für Ventilatoren
281332005|373|für Kältekompressoren
281332009|373|für andere Luft- und Vakuumpumpen, Luft- o.a. Gas-Kompressoren
281411200|374|aus Gusseisen oder Stahl, nicht kombiniert mit Filtern oder Ölern
281411401|375|für die autogene Metallbearbeitung
281411409|375|andere Druckminderventile
281411603|376|aus Eisen oder Stahl
281411609|376|aus anderen Werkstoffen
281411700|374|Ventile für Reifen oder Luftschläuche
281411804|377|aus Eisen oder Stahl
281411808|377|aus anderen Werkstoffen
281412331|378|Einhandmischer
281412333|378|Zweigriffmischer
281412335|378|Thermostatarmaturen für den Sanitärbereich
281412352|379|Elektrisch gesteuerte Selbstschlussarmaturen
281412353|379|Brausen und Zubehör
281412355|379|Eckventile
281412356|379|Spülarmaturen (ohne Spülkästen)
281412357|379|Geräteanschlussventile
281412359|379|Andere Sanitärarmaturen, a.n.g. (z.B. Ab- und Überlaufarmaturen, Stand- und Auslaufventile, mechanische Selbstschlussarmaturen)
281412530|380|Thermostatventile
281412550|380|Andere Armaturen für Heizkörper von Zentralheizungen (ohne Thermostatventile)
281413130|381|Temperaturregelventile
281413151|382|Stellventile
281413152|382|Stellhähne
281413154|382|Stellklappen
281413157|382|Drehkegelventile
281413159|382|Regelventile, a.n.g
281413330|383|aus Gusseisen
281413350|383|aus Stahl
281413370|383|aus anderen Werkstoffen
281413530|384|aus Gusseisen
281413550|384|aus Stahl
281413570|384|aus anderen Werkstoffen
281413733|385|aus Gusseisen
281413735|385|aus Stahl
281413739|385|aus anderen Werkstoffen
281413753|386|aus Gusseisen
281413755|386|aus Stahl
281413759|386|aus anderen Werkstoffen
281413770|387|Membranarmaturen
281413801|388|Andere Sicherheitsarmaturen, a.n.g
281413802|388|Andere Absperrarmaturen (ohne Hähne und Klappen) aus Gusseisen, a.n.g
281413803|388|Andere Absperrarmaturen (ohne Hähne und Klappen) aus Stahl, a.n.g
281413804|388|Andere Absperrarmaturen (ohne Hähne und Klappen) aus anderen Werkstoffen, a.n.g
281413805|388|Überwachungsarmaturen
281413806|388|Ableiter, Abscheider, Be- und Entlüfter
281420001|389|für Hydroventile
281420002|389|für Pneumatikventile
281420009|389|für andere Armaturen u.ä. Apparate für Rohr- und Schlauchleitungen, Dampfkessel, Sammelbehälter usw
281510300|390|Kugellager
281510530|391|Kegelrollenlager (einschl. Zusammenstellungen aus Kegeln und Kegelrollen)
281510550|391|Tonnenlager (Pendelrollenlager)
281510570|391|Zylinderrollenlager
281510700|390|Nadellager
281510900|390|Andere Wälzlager (einschl. kombinierter Wälzlager)
281521300|392|Rollenketten für Fahrräder, Mopeds und Krafträder
281521500|392|Andere Rollenketten
281521700|392|Andere Gelenkketten
281522300|393|Kurbeln und Kurbelwellen
281522500|393|Gelenkwellen
281522700|393|Andere Wellen (ohne Gelenkwellen)
281523300|394|Lagergehäuse mit eingebautem Wälzlager
281523501|395|Lagergehäuse ohne eingebaute Wälzlager
281523505|395|Gleitlager und Lagerschalen
281524320|396|Stirnradgetriebe (Zahnradgetriebe)
281524330|396|Kegelrad- und Kegelstirnradgetriebe (Zahnradgetriebe)
281524340|396|Schneckengetriebe (Zahnradgetriebe)
281524401|397|Planetengetriebe (Zahnradgetriebe)
281524403|397|Andere Zahnradgetriebe für stationäre Zwecke
281524409|397|Zahnradgetriebe für Wasserfahrzeuge
281524504|398|für Landmaschinen u.a. selbstfahrende Maschinen
281524507|398|Stufenlos regelbare Getriebe (hydraulisch, hydrostatisch und mechanisch)
281524730|399|Kugel- oder Rollenrollspindeln
281524750|399|Andere Getriebe (z.B. Reibradgetriebe)
281525000|3|Schwungräder sowie Riemen- und Seilscheiben (einschl. Seilrollenblöcke für Flaschenzüge)
281526001|400|Elastische Kupplungen, drehstarre Kupplungen
281526003|400|Hydraulische Kupplungen
281526005|400|Reibungskupplungen und -bremsen
281526007|400|Freilaufkupplungen (einschl. Rücklaufsperren)
281526009|400|Andere Kupplungen
281531300|401|Kugeln, Rollen und Nadeln
281531500|401|Andere Teile für Wälzlager (z.B. Spann- und Abziehhülsen)
281532000|3|Teile für Gelenkketten, aus Eisen oder Stahl
281539300|402|für Lagergehäuse von Wälzlagern aller Art
281539501|403|Kettenräder
281539502|403|Stirnräder
281539503|403|Kegelräder
281539504|403|Schnecken und Schneckenräder
281539505|403|Andere Zahnräder und Zahnstangen
281539506|403|Teile für Getriebe
281539507|403|Teile für Kupplungen
281539509|403|Andere Teile, a.n.g
282111300|404|Brenner für flüssigen Brennstoff
282111501|405|für gasförmige Stoffe
282111509|405|Andere Brenner (einschl. kombinierter Brenner)
282111700|404|Automatische Feuerungen (einschl. mechanischer Beschicker, Roste, Entascher u.ä. Vorrichtungen)
282112300|406|Industrie- und Laboratoriumsöfen zum Schmelzen, Rösten o.a. Warmbehandeln von Erzen, Schwefelkies oder Metallen
282112700|406|Verbrennungsöfen u.a. nicht elektrische Industrie- und Laboratoriumsöfen
282113300|407|Backöfen (Widerstandsöfen mit indirekter Beheizung) für Brotfabriken, Bäckereien, Konditoreien und Keksfabriken
282113510|408|Widerstandsöfen mit indirekter Beheizung (ohne Backöfen)
282113530|408|Induktionsöfen
282113540|408|Öfen mit dielektrischer, kapazitiver Erwärmung; Apparate zum Warmbehandeln von Stoffen mittels Induktion oder dielektrischer, kapazitiver Erwärmung; andere elektrische Industrie- und Laboratoriumsöfen (z.B. Mikrowellen- und Plasmaöfen, Laseröfen); Infrarotöfen
282114300|409|für Brenner und automatische Feuerungen
282114500|409|für nicht elektrische Industrie- und Laboratoriumsöfen, einschl. Verbrennungsöfen
282114700|409|für elektrische Industrie- und Laboratoriumsöfen und -apparate zum Warmbehandeln von Stoffen, einschl. Induktionsöfen oder Öfen mit dielektrischer Erwärmung
282211300|410|mit Elektromotor
282211700|410|Andere Flaschenzüge
282212001|411|Zugwinden und Spille mit Elektromotor
282212003|411|Zugwinden und Spille mit Kolbenverbrennungsmotor
282212009|411|Andere Zugwinden und Spille
282213300|412|Ortsfeste Hebebühnen für Kraftfahrzeugwerkstätten
282213501|413|Hubarbeitsbühnen
282213509|413|Andere hydraulische Hubwinden
282213700|412|Andere Hubwinden
282214200|414|Konsol- oder Wandlaufkrane
282214330|415|Hubportale und Portalhubkraftkarren, auf luftbereiften Rädern fahrend
282214350|415|Andere Laufkrane, Portalkrane (ohne Portaldrehkrane), Verladebrücken
282214400|414|Turmdrehkrane, Portaldrehkrane
282214500|414|Krankraftkarren u.a. selbstfahrende Maschinen, Apparate und Geräte
282214600|414|Andere Krane, zum Aufbau auf Straßenfahrzeuge
282214700|414|Andere Krane, a.n.g
282215130|416|zum Heben auf eine Höhe von 1 m oder mehr
282215150|416|Andere Elektrokraftkarren
282215300|417|Selbstfahrende Karren mit Hebevorrichtung, nicht elektrisch
282215500|417|Karren mit Hebezeugen oder Fördermitteln (ohne Kraftkarren)
282215700|417|Andere Kraftkarren, ohne Hebevorrichtung
282216301|418|Personenaufzüge mit einer Geschwindigkeit von weniger als 1,6 m/s
282216302|418|Personenaufzüge mit einer Geschwindigkeit von 1,6 m/s oder mehr
282216303|418|Bauaufzüge
282216306|418|Lastenaufzüge mit einer Tragkraft bis 2500 kg
282216309|418|Andere Aufzüge, elektrisch
282216501|419|Hydraulische Personenaufzüge mit einer Tragkraft bis 630 kg
282216502|419|Hydraulische Personenaufzüge mit einer Tragkraft über 630 kg
282216504|419|Hydraulische Lastenaufzüge mit einer Tragkraft bis 2500 kg
282216508|419|Andere Personen- und Lastenaufzüge
282216700|420|Rolltreppen und Rollsteige
282217403|421|für Schüttgut (ohne solche für die Landwirtschaft)
282217409|421|Andere pneumatische Stetigförderer (z.B. Rohrpostanlagen, Stetigförderer für die Landwirtschaft)
282217500|422|Stetigförderer mit Kübeln, für Waren
282217701|423|für den Tagebau
282217705|423|Andere Stetigförderer mit Bändern oder Gurten für Schüttgut
282217708|424|Andere Stetigförderer mit Bändern und Gurten, für Waren
282217930|425|Scheibenrollenbahnen u.a. Rollenbahnen
282217950|425|Andere Stetigförderer für Waren
282218200|426|Seilschwebebahnen, Sessel- und Schlepplifte; Zugmechanismen für Standseilbahnen
282218401|427|Rollgänge für Walzwerke, Kipper, Wender und Manipulatoren für Rohblöcke, Luppen, Stäbe, Platten (ohne Schmiedemanipulatoren, Beschickungseinrichtungen, ohne solche für Krane)
282218402|427|Hubtische, Ladebrücken, Hubladebühnen
282218404|427|Shuttlefahrzeuge für Lager
282218405|427|Regalbediengeräte
282218408|427|Andere Maschinen, Apparate und Geräte zum Heben, Be-, Entladen oder Fördern (einschl. Schmiedemanipulatoren, Beschickungs- einrichtungen, Aufschieber, Vorzieher u.ä. Vorrichtungen zum Bewegen von Schienenfahrzeugen)
282218500|426|Lademaschinen für die Landwirtschaft, a.n.g. (z.B. Schlepperanbaulader)
282219301|428|für Kraftkarren mit Hebevorrichtung
282219305|428|für Stetigförderer
282219308|428|für andere Fördermaschinen für den Untertagebergbau
282219309|428|für andere Maschinen, Apparate und Geräte zum Heben, Fördern usw. (ohne solche für Krane, Aufzüge und Rolltreppen)
282219503|429|für Förderkörbe
282219509|429|für Rolltreppen sowie Personen- und Lastenaufzüge
282219700|430|für Kraftkarren ohne Hebevorrichtung
282220000|3|Eimer, Kübel, Schaufeln, Löffel, Greifer und Zangen für Krane, Bagger usw
282310000|3|Datenverarbeitungsgeräte und periphere Geräte Rechenmaschinen u.ä. Maschinen mit eingebautem Rechenwerk, einschl. Textverarbeitungsmaschinen (z.B. Rechenmaschinen, Abrechnungs-, Frankier-, Fahrkarten- oder Eintrittskartenausgabe- u.ä. Maschinen mit eingebautem Rechenwerk, Scannerkassen)
282321100|3|Büromaschinen (z.B. elektrostatische u.a. Fotokopierapparate, Adressier- und Adressenprägemaschinen, Heftgeräte und -zangen, Locher, Aktenvernichter, Münzsortier-, Münzzähl- oder -einwickelmaschinen, Bogenoffsetmaschinen für 22 x 36 cm oder weniger)
282322100|3|Teile und Zubehör für Büromaschinen (einschl. zusammengesetzter elektronischer Schaltungen (Baugruppen))
282411130|431|ohne externe Energiequelle
282411150|431|elektropneumatisch
282411170|431|Andere elektrische Handbohrmaschinen
282411200|432|Elektrische Handwerkzeuge (ohne externe Energiequelle), a.n.g
282411230|433|Kettensägen
282411250|433|Kreissägen
282411270|433|Andere elektrische Handsägen (z.B. Stichsägen)
282411501|434|Winkelschleifer
282411509|434|Andere elektrische Handschleifmaschinen (z.B. Schwingschleifer, Bandschleifmaschinen) und Handhobelmaschinen
282411800|432|Elektrische Hecken-, Grasscheren und Rasenkantenschneider (ohne Akku-Werkzeuge)
282411853|435|Elektrische Blechscheren, -knabber und -schneider
282411857|435|Oberfräsen
282411859|435|Andere elektrische Handwerkzeuge, a.n.g
282412403|436|für die Metallbearbeitung
282412406|436|für den Bergbau und die Industrie der Steine und Erden (z.B. Abbau-, Spaten- und Aufreißhammer)
282412408|437|Andere handgeführte Druckluftwerkzeuge (z.B. Heft- und Nagelwerkzeuge)
282412600|438|Kettensägen
282412800|438|Andere handgeführte, kraftbetriebene Werkzeuge
282421050|3|Teile für Kettensägen u.a. handgeführte Werkzeuge mit eingebautem Motor (ohne Teile von pneumatischen Werkzeugen)
282422501|439|für die Metallbearbeitung
282422509|439|für andere Zwecke (z.B. für den Bergbau und die Industrie der Steine und Erden, für Heft- und Nagelwerkzeuge)
282511302|440|für lufttechnische Anlagen
282511303|440|für die chemische und verwandte Industrien
282511305|440|für die Nahrungsmittel- und Getränkeindustrie
282511307|440|für andere Industrien
282511500|441|Apparate und Vorrichtungen für die Verflüssigung von Luft o.a. Gasen
282512201|442|Klimageräte als Kompaktgeräte zum Einbau in Wände oder Fenster
282512203|442|Split-Systeme (Anlagen aus getrennten Einzelelementen)
282512400|443|Klimageräte für den Komfort von Personen in Kraftfahrzeugen
282512500|443|Klimageräte, mit Kälteerzeugungsvorrichtung
282512700|443|Andere Klimageräte, ohne Kälteerzeugungsvorrichtung
282513330|444|für tiefgekühlte Waren
282513350|444|Andere Schaukühlmöbel
282513601|445|Gefrier- und Tiefkühlmöbel (ohne Gefrier-, Tiefkühltruhen mit einem Inhalt von 800 l oder weniger und Gefrier- und Tiefkühlschränke mit einem Inhalt von 900 l oder weniger)
282513609|445|Andere Kühlmöbel
282513801|446|bis 15 kW Anschlussleistung
282513809|446|über 15 kW Anschlussleistung
282513903|447|Kompressionskälteerzeugungseinrichtungen, bei denen der Kondensator als Wärmeaustauscher ausgebildet ist
282513909|447|Andere Einrichtungen, Maschinen, Apparate und Geräte zur Kälteerzeugung
282514102|448|Feinstfilterapparate
282514104|448|Andere Apparate zum Filtrieren oder Reinigen von Luft
282514301|449|von anderen Gasen, durch nasses Verfahren
282514302|449|von anderen Gasen, durch elektrostatisches Verfahren
282514305|449|von anderen Gasen, durch thermisches Verfahren
282514309|449|von anderen Gasen, durch andere Verfahren
282514450|450|von anderen Gasen, durch katalytisches Verfahren (z.B. Abgasreinigungssysteme für Straßenfahrzeuge (ohne komplette Auspuffanlagen))
282514500|450|Apparate zum Filtrieren und Reinigen von Gasen, mit Gehäuse aus nicht rostendem Stahl und mit Bohrungen für Eingangs- und Ausgangsleitungen mit Innendurchmessern von nicht mehr als 1,3 cm (ohne Luftansaugfilter für Kolbenverbrennungsmotoren)
282520100|451|Ventilatoren für die Kühlung von Mikroprozessoren, Telekommunikations- geräten, automatischen Datenverarbeitungsmaschinen oder Einheiten automatischer Datenverarbeitungsmaschinen
282520350|452|Axialventilatoren
282520550|452|Zentrifugalventilatoren
282520750|452|Andere Ventilatoren
282530100|453|für Klimageräte
282530300|453|Möbel, zur Aufnahme einer Kälteerzeugungseinrichtung hergerichtet
282530500|453|Verdampfer und Kondensatoren (ohne solche für Haushaltsgeräte)
282530701|454|für Haushaltskühlschränke sowie für kombinierte Kühl- und Gefrierschränke mit gesonderten Außentüren
282530703|454|für andere Kühl-, Tiefkühl- und Gefrierschränke und -truhen
282530708|454|für Wärmepumpen u.a. Einrichtungen, Maschinen, Apparate und Geräte zur Kälteerzeugung
282530802|455|für Wärmeaustauscher für lufttechnische Anlagen und Apparate und Vorrichtungen für die Verflüssigung von Luft o.a. Gasen
282530803|455|für Sterilisierapparate für medizinische oder chirurgische Zwecke oder für Laboratorien
282530805|455|für Apparate und Vorrichtungen für die Nahrungs- und Genuss- mittelindustrie
282530806|455|für Apparate und Vorrichtungen für die chemische und verwandte Industrie
282530807|455|für Trockner
282530808|455|für Destillier- und Rektifizierapparate u.a. Apparate und Vorrichtungen (z.B. für nicht elektrische Durchlauferhitzer und Heißwasserspeicher)
282911003|456|Generatorgas- und Wassergaserzeuger; Acetylenentwickler u.ä. mit Wasser arbeitende Gaserzeuger, auch mit ihren Gasreinigern
282911008|456|Destillier- und Rektifizierapparate
282912302|457|für Trink- und Brauchwasser
282912304|457|für Abwasser
282912307|458|für Trink- und Brauchwasser
282912309|458|für Abwasser
282912500|459|von Getränken (ohne Wasser)
282912703|460|für die chemische Industrie
282912705|460|für andere Industrien
282913300|461|Öl- und Kraftstofffilter
282913500|461|Luftansaugfilter
282921203|462|für die Getränkeindustrie (z.B. Maschinen zum Reinigen von Flaschen oder Kegs)
282921209|462|für andere Packmittel oder Packstoffe (z.B. Waschmaschinen für Vials, Stopfenwaschmaschinen)
282921501|463|Abfüllmaschinen für Getränkepackungen (auch Füll- und Verschließmaschinen)
282921502|463|Andere Maschinen zum Abfüllen flüssiger und pastöser Füllgüter in formstabile Packmittel (auch Füll- und Verschließmaschinen)
282921503|463|Maschinen zum Abfüllen schütt- und rieselfähiger Füllgüter in formstabile Packmittel (auch Füll- und Verschließmaschinen)
282921504|463|Maschinen zum Füllen flexibler Packmittel (z.B. Beutel, Säcke; auch Füll- und Verschließmaschinen)
282921505|463|Verschließmaschinen für formstabile und flexible Packmittel (Einfunktionsmaschinen)
282921506|463|Kalt- oder Warmtiefzieh-Füll- und Verschließmaschinen
282921507|463|Andere Form-, Füll- und Verschließmaschinen (z.B. für Schlauchbeutel- oder Siegelrandbeutelverpackungen)
282921509|463|Etikettier- u.a. Ausstattungsmaschinen, Maschinen und Apparate zum Versetzen von Getränken mit Kohlensäure
282921801|464|Einschlag- und Einwickelmaschinen (nicht für Sammelverpackung oder Palettensicherung)
282921803|464|Kartonierer
282921805|464|Sammelpackmaschinen für Getränkepackungen
282921806|464|Andere Sammelpackmaschinen
282921808|464|Umreifungs- und Umschnürungsmaschinen
282921809|464|Andere Verpackungsmaschinen
282922101|465|mit einem Gewicht von 21 kg oder weniger
282922109|465|Andere Feuerlöscher (auch mit Füllung)
282922203|466|für Lacke, Farben, Leime
282922209|466|Andere Spritzpistolen u.ä. Apparate
282922301|467|Wasserstrahlreinigungsapparate mit eingebautem Motor
282922304|467|Andere Strahlapparate, mit Druckluft betrieben
282922306|467|Andere Strahlapparate, nicht mit Druckluft betrieben
282922403|468|Spritz- und Sprühautomaten und -systeme für Lacke, Farben, Leime
282922405|468|Andere Spritz- und Sprühgeräte für Lacke, Farben, Leime
282922409|468|Spritz- und Sprühgeräte a.n.g
282923001|469|Metalloplastische Dichtungen für Kraftfahrzeuge
282923003|469|Andere metalloplastische Dichtungen
282923005|469|Mechanische Dichtungen (Gleitringdichtungen)
282931300|470|Waagen für Stetigförderer zum kontinuierlichen Wiegen
282931800|470|Absack-, Abfüll-, Dosier- u.a. Waagen zur Verwiegung konstanter Gewichtsmengen
282932000|3|Haushaltswaagen, Personenwaagen (auch Säuglingswaagen)
282939401|471|Sortierwaagen und selbsttätige Kontrollwaagen zum Überprüfen eines vorgegebenen Gewichts, für eine Höchstlast von 5 000 kg oder weniger
282939405|471|Brückenwaagen (Fahrzeugwaagen) für eine Höchstlast von mehr als 5 000 kg
282939409|471|Andere Waagen (einschl. Briefwaagen) (z.B. Plattformwaagen (einschl. Brückenwaagen für eine Höchstlast von 5 000 kg oder weniger), Einzel- und Mehrkomponentenwaagen, Gemengewägeeinrichtungen) sowie Ladenwaagen für eine Höchstlast von 30 kg oder weniger
282939600|472|Nivellierinstrumente
282939750|473|Maßstäbe, Maßbänder, Lineale mit Maßeinteilung
282939790|473|Andere Längenmessinstrumente und -geräte für den Handgebrauch, a.n.g
282941002|474|für die chemische und verwandte Industrie
282941003|474|für die Nahrungs- und Genussmittelindustrie
282941009|474|für andere Industrien
282942000|3|Zentrifugen für Laboratorien Kalander und Walzwerke (ohne Metallwalzwerke und Glaswalzmaschinen)
282943300|475|mit Heiz- oder Kühlvorrichtung
282943500|475|Andere Warenverkaufsautomaten (einschl. Geldwechselautomaten)
282950000|3|Gewerbliche Geschirrspülmaschinen
282960300|476|Wasserrückkühlvorrichtungen und -apparate (Wärmeaustausch nicht über Wandungen)
282960500|476|Apparate und Vorrichtungen zum Aufdampfen von Metall im Vakuum
282960901|477|für die chemische Industrie
282960904|478|für die Süßwaren-Industrie (z.B. Röstanlagen für Kakaobohnen und Nüsse, Temperiermaschinen, Vorlöse- und Zuckeranlagen)
282960905|478|für Schlachthöfe und Fleischereien (z.B. Fleischereikochanlagen, Räucheranlagen)
282960906|478|für andere Zweige der Nahrungs- und Genussmittelindustrie (z.B. Blancheure, Dampfschälmaschinen, Koch- und Dämpfanlagen für die Obst- und Gemüseverarbeitung)
282960908|479|für die Gummi- und Kunststoffindustrie
282960909|479|für andere Industrien (z.B. für die Bau- und Baustoffindustrie)
282970201|480|Handschneidbrenner
282970209|480|Andere Handapparate zum Löten und Schweißen
282970900|481|Andere Autogenmaschinen, -apparate und -geräte zum Löten, Schweißen oder Brennschneiden und zum autogenen Oberflächenhärten u.a. nicht elektrische Löt- und Schweißmaschinen für metallische und nichtmetallische Werkstoffe
282981000|3|Teile für Generatorgas-, Wassergaserzeuger, Acetylenentwickler usw
282982200|482|Teile für Zentrifugen (einschl. Trockenschleudern)
282982503|483|für Gase
282982505|483|für Flüssigkeiten
282983131|484|aus Eisen oder Stahl, gegossen
282983139|484|andere Walzen für Kalander und Walzwerke
282983150|485|Andere Teile für Kalander und Walzwerke
282983200|486|Teile für Waagen (auch Gewichte)
282983401|487|für die Landwirtschaft oder den Gartenbau
282983405|487|Andere Teile für mechanische Apparate zum Verteilen von Flüssigkeiten usw
282983500|486|Teile für Warenverkaufsautomaten
282984000|3|Andere Teile für Maschinen, Apparate und Geräte für unspezifische Verwendung, a.n.g
282985100|488|Teile für Geschirrspülmaschinen
282985207|489|für Verpackungsmaschinen für Getränke
282985208|489|für andere Verpackungsmaschinen
282986000|3|Teile für nicht elektrische Löt- und Schweißmaschinen, -apparate und -geräte, Maschinen und Apparate zum autogenen Oberflächenhärten
283010000|3|Einachsschlepper
283021100|3|Acker- und Forstschlepper sowie andere Zugmaschinen (ohne Sattel-Straßenzug- und Gleiskettenzugmaschinen), mit einer Motorleistung von 37 kW oder weniger
283022100|3|Acker- und Forstschlepper sowie andere Zugmaschinen (ohne Sattel-Straßenzug- und Gleiskettenzugmaschinen), mit einer Motorleistung von mehr als 37 kW bis 59 kW
283023003|490|mit einer Motorleistung von mehr als 59 kW bis 75 kW
283023005|490|mit einer Motorleistung von mehr als 75 kW bis 90 kW
283023007|490|mit einer Motorleistung von mehr als 90 kW
283023009|491|Andere Zugmaschinen (ohne Sattel-Straßenzug- und Gleiskettenzugmaschinen)
283031400|3|Pflüge
283032100|492|Grubber (Kultivatoren, auch Fräsen und Zinkenrotoren)
283032200|492|Scheibeneggen
283032300|492|Andere Eggen (z.B. Zahneggen)
283032500|492|Motorhacken
283032700|492|Bodenbearbeitungsmaschinen für die Land- und Forstwirtschaft, a.n.g
283033001|493|Einzelkorndrillgeräte und -maschinen mit Zentralantrieb
283033005|493|Andere Sämaschinen, Pflanz- und Setzmaschinen (z.B. Kartoffellegemaschinen)
283034300|494|für mineralische und chemische Düngemittel, auch Anhänge-Schleuderdüngestreuer
283034500|494|Andere Düngerstreuer
283039000|3|Andere Maschinen, Apparate und Geräte für die Land- und Forstwirt- schaft oder den Gartenbau, zum Bearbeiten oder Bestellen des Bodens oder zur Pflege der Pflanzen; Walzen für Rasenflächen oder Sportplätze
283040100|495|mit Elektromotor
283040300|495|mit Verbrennungsmotor, mit horizontal rotierendem Schneidwerk, auch selbstfahrend
283040500|495|mit Verbrennungsmotor, mit anderem Schneidwerk
283040700|495|ohne Motor
283051300|496|Motormäher
283051503|497|mit horizontal rotierendem Schneidwerk
283051505|497|mit anderem Schneidwerk (einschl. Mähbalken)
283051700|496|Andere Mähmaschinen, nicht für Schlepperanbau
283052000|3|Heuerntemaschinen, -apparate und -geräte (z.B. Rech- und Zettwender, Kreiselzettwender)
283053403|498|Sammelpressen (z.B. Hochdruck-, Großpacken-, Rundballenpressen)
283053405|498|Stroh- und Futterpressen (ohne Sammelpressen)
283054200|499|Kartoffelerntemaschinen
283054500|499|Rübenköpf- u.a. Rübenerntemaschinen
283054800|499|Andere Maschinen zum Ernten von Wurzel- oder Knollenfrüchten
283059150|500|Mähdrescher
283059300|500|Andere Dreschmaschinen und -geräte
283059450|501|Feldhäcksler für Schlepperanbau
283059600|501|Feldhäcksler, selbstfahrend
283059700|3|Andere Erntemaschinen und -geräte, a.n.g. (z.B. Traubenerntemaschinen; Maispflücker, -entliescher, -rebler)
283060100|502|Apparate zum Besprengen
283060300|502|Tragbare Apparate ohne Motor, zum Verteilen von Flüssigkeiten usw. (ohne Bewässerungseinrichtungen), für die Landwirtschaft oder den Gartenbau
283060500|502|Spritz-, Sprüh- und Stäubegeräte, für Schlepperanbau oder Schlepperzug
283060900|502|Andere Geräte zum Verteilen von Flüssigkeiten oder Pulver
283070403|503|Stalldungstreuer
283070405|503|Andere Anhänger und Sattelanhänger für landwirtschaftliche Zwecke, auch mit Selbstlade- oder Selbstentladevorrichtung
283081000|3|Maschinen zum Reinigen und Sortieren von Eiern, Obst u.a. landwirtschaftlichen Erzeugnissen
283082000|3|Melkmaschinen
283083003|504|Schrot- u.a. Mühlen für Getreide, Hülsenfrüchte u.ä. Erzeugnisse
283083005|504|Andere Maschinen, Apparate und Geräte für die Futterbereitung
283084000|3|Brut- und Aufzuchtapparate für die Geflügelhaltung
283085000|3|Andere Maschinen, Apparate und Geräte für die Geflügelhaltung
283086300|505|Holz-Ernte- und -Bearbeitungsmaschinen (z.B. Skidder, Rückezangen)
283086601|506|Maschinen und Geräte zum Füttern und Tränken
283086602|506|Andere Maschinen, Apparate und Geräte für die Tierhaltung
283086609|506|Andere Maschinen, Apparate und Geräte für die Land- und Forstwirtschaft oder den Gartenbau, a.n.g. (z.B. Silo-Entnahmefräsen, ortsveränderliche Einrichtungen zur Lagerung von landwirtschaftlichen Erzeugnissen, selbsttätige Tränkebecken)
283091001|507|für Mähdrescher und Maiserntemaschinen
283091005|507|für Rasenmäher
283091008|507|für andere Erntemaschinen, -apparate und -geräte
283092001|508|Pflugschare u.a. Teile aus Eisen oder Stahl, gegossen, für Maschinen für die Land- und Forstwirtschaft oder den Gartenbau
283092009|508|Andere Teile für Maschinen für die Bodenbearbeitung und Pflanzenpflege
283093300|509|für Maschinen, Apparate und Geräte für die Geflügelhaltung und -zucht
283093803|510|für Holz-Ernte- und -Bearbeitungsmaschinen
283093805|510|Andere Teile für Maschinen, Apparate und Geräte für die Land- und Forstwirtschaft oder den Gartenbau
283094000|3|Teile für Melk- und Molkereimaschinen, a.n.g
284111101|511|Laserschneidmaschinen
284111103|511|Laserbeschriftungsmaschinen
284111109|511|Sonstige Laser-, Licht- o.a. Photonenstrahlmaschinen
284111300|511|Ultraschallwerkzeugmaschinen (ohne zum Herstellen von Halbleiter- bauelementen oder elektronischen integrierten Schaltungen)
284111500|511|Elektroerosionswerkzeugmaschinen
284111600|511|Wasserstrahlschneidemaschinen
284111700|511|Werkzeugmaschinen zum Abtragen von Stoffen aller Art durch elektrochemische Verfahren oder Elektronen-, Ionen- oder Plasmastrahl
284112202|512|Arbeitsbereich (x,y,z) kleiner als 0,3 m³
284112204|512|Arbeitsbereich (x,y,z) 0,3 bis 1,2 m³
284112206|512|Arbeitsbereich (x,y,z) größer als 1,2 m³
284112402|513|Arbeitsbereich (x,y,z) kleiner als 0,3 m³
284112404|513|Arbeitsbereich (x,y,z) größer oder gleich 0,3 m³
284112500|514|Mehrwegemaschinen
284112701|515|Kreistransfermaschinen (z.B. Schalttisch- und -trommelmaschinen)
284112702|515|Transferlinien
284121230|516|Horizontal-Drehzentren
284121270|516|Horizontale Ein- und Mehrspindeldrehautomaten, numerisch gesteuert
284121290|516|Andere Horizontal-Drehmaschinen, numerisch gesteuert
284121400|516|Horizontale Drehmaschinen, nicht numerisch gesteuert
284121601|517|Einspindlige Vertikaldrehmaschinen und -Drehzentren
284121609|517|Andere Vertikal-Drehmaschinen und -Drehzentren
284122170|518|Konsolfräsmaschinen, numerisch gesteuert
284122230|519|Universalfräsmaschinen
284122250|519|Andere Fräsmaschinen (z.B. Senkrecht-, Rundtisch-, Trommel-, Kopier-, Gravierfräs-, Plan- und Langfräsmaschinen), numerisch gesteuert
284122330|518|Bearbeitungseinheiten auf Schlitten
284122400|518|Ausbohr- und kombinierte Ausbohr- und Fräsmaschinen (ohne Bohrmaschinen), numerisch gesteuert
284122600|518|Ausbohr- und kombinierte Ausbohr- und Fräsmaschinen (ohne Bohrmaschinen), nicht numerisch gesteuert
284122700|518|Konsolfräsmaschinen, nicht numerisch gesteuert u.a. Fräsmaschinen (z.B. Universal-, Kopier- und Gravierfräsmaschinen), nicht numerisch gesteuert
284122800|518|Außen- oder Innengewindeschneidemaschinen (ohne Bohrmaschinen), für die Metallbearbeitung
284123011|520|Flach- oder Planschleifmaschinen
284123022|521|Außen-Rundschleifmaschinen
284123023|521|Innen-Rundschleifmaschinen
284123024|521|Rundschleifmaschinen für Sonderzwecke (z.B. Kurbelwellen-, Walzen-, Gewinde-, Radsatzschleifmaschinen)
284123031|520|Andere Schleifmaschinen, numerisch gesteuert, mit einer Einstellgenauigkeit von mindestens 0,01 mm
284123042|522|Flach- oder Planschleifmaschinen
284123043|522|Rundschleifmaschinen (Außen- und Innenrundschleifmaschinen, Rundschleifmaschinen für Sonderzwecke)
284123049|522|Andere Schleifmaschinen
284123062|523|Werkzeugschleif- und Schärfmaschinen, numerisch gesteuert
284123063|523|Werkzeugschleif- und Schärfmaschinen, nicht numerisch gesteuert
284123064|523|Hon- und Läppmaschinen
284123069|523|Werkzeugmaschinen zum Entgraten, Polieren oder zu anderem Fertigbearbeiten
284124100|524|Räummaschinen
284124301|525|Verzahn-, Zahnfertigbearbeitungsmaschinen für das Fräs- und Wälzstoßverfahren
284124308|525|Schleif-, Läpp-, Polier- und Schabmaschinen für Verzahnungen u.a. Verzahn- u.a. Zahnfertigbearbeitungsmaschinen
284124701|526|Kreissägemaschinen, numerisch gesteuert
284124702|526|Kreissägemaschinen, nicht numerisch gesteuert
284124704|526|Andere Sägemaschinen (z.B. Bandsägemaschinen), numerisch gesteuert
284124705|526|Andere Sägemaschinen (z.B. Bandsägemaschinen), nicht numerisch gesteuert
284124707|526|Trennmaschinen
284124910|524|Andere Werkzeugmaschinen für die spanabhebende Metallbearbeitung, a.n.g.(ohne Feilmaschinen) (z.B. Hobelmaschinen, Stoßmaschinen)
284131201|527|Gesenkbiegemaschinen
284131203|527|Schwenkbiegemaschinen
284131209|527|Andere Biege-, Abkant- und Richtmaschinen zum Bearbeiten von Flacherzeugnissen (einschl. Pressen), numerisch gesteuert
284131400|528|Andere Biege-, Abkant- und Richtmaschinen (z.B. für Rohre, Wellen, Stangen und Profile, Drahtbiegemaschinen), numerisch gesteuert
284131603|529|zum Herstellen von Blechpackmitteln (z.B. Dosen, Tuben) und -packhilfsmitteln (z.B. Deckel, Verschlüsse)
284131609|529|zum Bearbeiten von anderen Flacherzeugnissen
284131800|528|Andere Biege-, Abkant- und Richtmaschinen (z.B. für Rohre, Wellen, Stangen und Profile, Drahtbiegemaschinen), nicht numerisch gesteuert
284132400|530|Lochstanzen und Ausklinkmaschinen, für die Metallbearbeitung (einschl. Pressen; auch mit Lochstanze kombinierte Scheren), numerisch gesteuert
284132612|531|hydraulisch arbeitend
284132619|531|nichthydraulisch arbeitend
284132800|530|Lochstanzen und Ausklinkmaschinen, für die Metallbearbeitung (einschl. Pressen; auch mit Lochstanze kombinierte Scheren), nicht numerisch gesteuert
284133100|532|Freiformschmiede- oder Gesenkschmiedemaschinen (einschl. Pressen) und Schmiedehämmer, numerisch gesteuert
284133200|532|Freiformschmiede- oder Gesenkschmiedemaschinen (einschl. Pressen) und Schmiedehämmer, nicht numerisch gesteuert
284133503|533|Ziehpressen, numerisch gesteuert
284133504|533|Andere hydraulische Pressen, numerisch gesteuert
284133507|534|Hydraulische Pressen, nicht numerisch gesteuert
284133601|535|Nichthydraulische Pressen, numerisch gesteuert
284133605|536|Exzenter- und Kurbelpressen mit einer Presskraft von 1 600 kn oder weniger
284133606|536|Exzenter- und Kurbelpressen mit einer Presskraft von mehr als 1 600 kn
284133607|536|Kniehebel- und Kurbelziehpressen
284133609|536|Andere nichthydraulische Pressen, nicht numerisch gesteuert, z.B. Sinterpressen, Schrottpaketierpressen
284134100|537|Ziehmaschinen für Stangen, Rohre, Profile, Drähte o.dgl
284134300|537|Gewindewalz- oder Gewinderollmaschinen
284134500|537|Maschinen zum Be- oder Verarbeiten von Metalldraht, a.n.g
284134710|537|Andere Werkzeugmaschinen zum spanlosen Be- oder Verarbeiten von Metallen, Hartmetallen oder Cermets, a.n.g. (z.B. Bördel-, Sicken-, Falzmaschinen, Drückmaschinen)
284140300|538|für Maschinen zum Abtragen von Stoffen aller Art durch Laserstrahl, usw. (ohne Ultraschallwerkzeugmaschinen), für Bearbeitungszentren, Mehrwegemaschinen, Transfermaschinen und für Maschinen zur spanabhebenden Bearbeitung von Metallen
284140500|538|für Maschinen zur spanlosen Bearbeitung von Metallen
284911300|539|Sägemaschinen
284911500|539|Schleif- und Poliermaschinen
284911700|539|Andere Werkzeugmaschinen für die Bearbeitung von mineralischen Stoffen oder zum Kaltbearbeiten von Glas
284912200|540|Werkzeugmaschinen für verschiedenartige Bearbeitungsvorgänge ohne Werkzeugwechsel, Werkstückzufuhr bei jedem Bearbeitungsvorgang automatisch, zum Bearbeiten von Holz, Kork, Bein, Hartkautschuk o.ä. harten Stoffen
284912400|540|Maschinenzentren, zum Bearbeiten von Holz, Kork, Bein, Hartkautschuk o.ä. harten Stoffen
284912830|540|Maschinen, Apparate und Geräte, für die Galvanotechnik, Elektrolyse oder Elektrophorese
284912873|541|Pressen zum Herstellen von Span- oder Faserplatten aus Holz o.a. holzartigen Stoffen
284912879|541|Andere Maschinen und Apparate zum Behandeln von Holz oder Kork (z.B. Imprägnier-, Leimauftragmaschinen)
284912911|542|Werkzeugmaschinen, denen das Werkstück bei jedem Bearbeitungs- vorgang von Hand zugeführt wird, zum Bearbeiten von Holz, Kork, Bein, Hartkautschuk o.ä. harten Stoffen
284912923|543|Kreissägemaschinen
284912929|543|Andere Sägemaschinen, z.B. Bandsägemaschinen
284912953|544|Hobelmaschinen
284912958|544|Fräs- und Kehlmaschinen
284912963|545|Schleif- und Poliermaschinen
284912965|545|Biege- und Zusammenfügemaschinen
284912967|545|Bohr- und Stemmmaschinen
284912975|542|Spalt-, Hack- und Schälmaschinen
284912979|542|Dreh- u.a. Werkzeugmaschinen zum Bearbeiten von Holz usw
284913100|546|Bohrmaschinen, zum Bearbeiten von Metall, ortsfest, numerisch gesteuert
284913200|546|Bohrmaschinen, zum Bearbeiten von Metall, ortsfest, nicht numerisch gesteuert
284913300|546|Maschinenfeilen
284913400|546|Scheren (einschl. Pressen), zum Bearbeiten von Metall (ohne mit Lochstanze kombinierte Scheren), numerisch gesteuert
284913500|546|Scheren (einschl. Pressen), (ohne mit Lochstanze kombinierte Scheren), zum Bearbeiten von Flacherzeugnissen aus Metall, nicht numerisch gesteuert
284913600|546|Nietmaschinen
284921100|547|Dorne, Spannzangen und Hülsen
284921300|547|Werkzeughalter für Drehmaschinen
284921503|548|Bohrfutter
284921505|548|Andere Werkzeughalter
284921700|549|Selbstöffnende Gewindeschneidköpfe
284922300|550|Werkstückgebundene Vorrichtungen, Vorrichtungssätze zum Zusammenstellen von werkstückgebundenen Vorrichtungen
284922503|551|Drehfutter und Planscheiben
284922505|551|Andere Werkstückhalter für Drehmaschinen
284922703|552|Maschinenschraubstöcke
284922705|552|Andere Werkstückhalter
284923500|3|Teilköpfe u.a. Spezialvorrichtungen für Werkzeugmaschinen, a.n.g
284924300|553|für Werkzeugmaschinen, zum Bearbeiten von Steinen, keramischen Waren, Beton o.ä. mineralischen Stoffen oder zum Kaltbearbeiten von Glas
284924500|553|für Werkzeugmaschinen, zum Bearbeiten von Holz, Kork, Bein, Hartkautschuk o.ä. harten Stoffen
289111300|554|Konverter, Gießpfannen, -formen für Ingots, Masseln o.dgl.; Gießmaschinen für Gießereien, Stahlwerke u.a. metallurgische Betriebe
289111530|555|Rohrwalzwerke, Warmwalzwerke und kombinierte Warm- und Kaltwalzwerke
289111570|555|Kaltwalzwerke
289112301|556|für Gießereien
289112309|556|für andere metallurgische Betriebe
289112500|557|Walzen für Metallwalzwerke
289112700|557|Andere Teile für Metallwalzwerke
289211000|3|Stetigförderer für Arbeiten unter Tage (Streb- und Streckenfördermittel) (z.B. Förderbänder, Kettenkratzförderer)
289212330|558|Abbaumaschinen sowie Tunnelbohr- und Vortriebsmaschinen, selbstfahrend
289212350|558|Andere Abbau-, Tunnelbohr- und Streckenvortriebsmaschinen (z.B. Schrämmaschinen, Kohlenhobel)
289212530|559|selbstfahrend
289212550|559|nicht selbstfahrend
289221300|560|auf Gleisketten
289221500|560|Andere Planiermaschinen
289222100|3|Erd- oder Straßenhobel (Grader), selbstfahrend; Schürfwagen (Scraper), selbstfahrend
289223100|3|Straßenwalzen u.a. Bodenverdichter, selbstfahrend
289224300|561|Lader für Arbeiten unter Tage
289224500|561|Andere Frontschaufellader
289225001|562|Hydraulische Mini-Bagger mit einem Dienstgewicht von 6 t oder weniger
289225003|562|Hydraulische Raupen-Bagger mit einem Dienstgewicht von mehr als 6 t
289225009|562|Hydraulische Bagger auf Rädern, Seilbagger u.a. Bagger
289226300|563|Andere Bagger, auch Schaufellader, mit nicht um 360 Grad drehbarem Oberwagen
289226500|563|Andere selbstfahrende Maschinen zur Erdbewegung u.ä., a.n.g
289227000|3|Planierschilde für Planiermaschinen (Bulldozer oder Angledozer)
289228100|3|Muldenkipper (Dumper), zur Verwendung außerhalb des Straßennetzes gebaut
289230100|564|Rammen und Pfahlzieher
289230300|564|Schneeräumer
289230500|564|Maschinen, Apparate und Geräte zum Feststampfen oder Verdichten des Bodens (nicht selbstfahrend)
289230700|564|Andere nicht selbstfahrende Maschinen, Apparate und Geräte zur Erdbewegung usw. (z.B. Schälschrapper)
289230900|564|Maschinen, Apparate und mechanische Geräte für den Straßen-, Hoch- oder Tiefbau oder für ähnliche Arbeiten, a.n.g
289240301|565|für Gießereiformsande
289240303|565|für Baustoffe
289240305|566|zum Sortieren, Sieben, Trennen oder Waschen
289240306|566|zum Zerkleinern, Mahlen, Mischen oder Kneten
289240307|565|für andere mineralische Stoffe
289240500|567|Beton- und Mörtelmischmaschinen
289240700|567|Maschinen zum Mischen mineralischer Stoffe mit Bitumen
289250000|3|Gleiskettenzugmaschinen
289261303|568|für Bohrmaschinen
289261305|568|für Tiefbohrgeräte
289261503|569|für Lader
289261505|569|für Spezialbagger für den Tagebau
289261506|569|für Krane (ohne Turmdrehkrane)
289261507|569|für Abbau-, Tunnelbohr- und Vortriebsmaschinen
289261508|569|für Turmdrehkrane und Erdbewegungs- u.ä. Maschinen a.n.g
289262003|570|für Maschinen und Apparate für Gießereiformsande und Gießformen aus Sand
289262009|570|für Maschinen und Apparate für andere mineralische Stoffe
289311000|3|Milchentrahmer
289312000|3|Andere milchwirtschaftliche Maschinen, Apparate und Geräte (ohne Melkmaschinen)
289313000|3|Maschinen für die Müllerei oder zum Behandeln von Getreide oder Hülsenfrüchten (ohne solche zum Reinigen, Sortieren oder Sieben hierfür und ohne Landmaschinen)
289314000|3|Maschinen, Apparate und Geräte zum Bereiten von Wein, Most, Fruchtsäften o.ä. Getränken (z.B. Pressen)
289315300|571|Nicht elektrische Industriebacköfen
289315600|571|Dampffiltrier- u.a. Maschinen zum Zubereiten von Kaffee o.a. heißen Getränken
289315801|572|Großkochanlagen mit Gasbeheizung
289315803|572|Großkochanlagen mit elektrischer Beheizung
289315808|572|Andere Apparate zum Kochen oder Wärmen von Speisen
289316000|3|Trockner für landwirtschaftliche Erzeugnisse
289317130|573|von Backwaren
289317150|573|von Teigwaren
289317200|574|zum Herstellen von Süßwaren, Kakao oder Schokolade
289317300|574|zum Herstellen von Zucker
289317400|574|Brauereimaschinen und -apparate
289317503|575|Maschinen und Apparate zum Verarbeiten von Fleisch
289317509|575|Schlachthausanlagen und -einrichtungen
289317600|574|zum Be- oder Verarbeiten von Früchten oder Gemüsen
289317701|576|für die Tee und Kaffee verarbeitende Industrie
289317703|576|für die Getränkeindustrie (ohne Pressen, Mühlen u.ä. Maschinen oder Apparate)
289317705|576|für Großküchen
289317709|576|Andere Maschinen und Apparate zum industriellen Herstellen, Verarbeiten oder Zubereiten von Nahrungs- und Genussmitteln, Getränken u.ä., a.n.g
289317800|574|zum Gewinnen oder Aufbereiten von tierischen oder pflanzlichen Ölen oder Fetten
289318000|3|Eiersortiermaschinen Maschinen und Apparate zum Aufbereiten oder Verarbeiten von Tabak, a.n.g
289320000|3|Maschinen, Apparate und Geräte zum Reinigen, Sortieren oder Sieben von Körnern oder Hülsenfrüchten
289331000|3|Teile für Maschinen zum Bereiten von Wein, Most, Fruchtsäften u.ä. Getränken
289332001|577|für Bäckereimaschinen (ohne Teile für elektrische Backöfen)
289332003|577|für Süßwarenmaschinen
289332006|577|für Fleischereimaschinen und Schlachthauseinrichtungen
289332007|577|für Brauereimaschinen und sonstige Maschinen zur Getränkeherstellung
289332008|577|für andere Maschinen der Nahrungs- und Genussmittelindustrie (z.B. für die Zuckerherstellungsindustrie)
289333000|3|Teile für Maschinen und Apparate zum Aufbereiten oder Verarbeiten von Tabak, a.n.g
289334000|3|Teile für Maschinen zum Reinigen, Sortieren, Sieben, Mahlen oder zum Behandeln von Körnern oder Hülsenfrüchten, Getreide u.ä
289411000|3|Maschinen zum Düsenspinnen, Verstrecken, Texturieren oder Schneiden von synthetischen oder künstlichen Spinnstoffen; Maschinen zum Vor- oder Aufbereiten von Spinnstoffen
289412000|3|Maschinen zum Spinnen, Dublieren oder Zwirnen, Spulen, Wickeln oder Haspeln von Spinnstoffen sowie Maschinen zum Vorbereiten von Spinnstoffgarnen für die Weberei, Wirkerei und Strickerei
289413000|3|Webmaschinen
289414300|578|Rundwirk- und Rundstrickmaschinen
289414500|578|Flachwirk-, Flachstrick-, Nähwirk- und Flachkettenmaschinen (einschl. Raschelmaschinen)
289414700|578|Gimpen-, Tüll-, Spitzen-, Stick-, Posamentier-, Flecht-, Netzknüpf- und Tuftingmaschinen
289415100|579|Schaft-, Jacquard-, Kartenschlag-, Kartenkopier-, Kartenbindemaschinen u.a. Hilfsmaschinen und -apparate für Spinnerei-, Weberei-, Wirkerei- und Strickereimaschinen
289415300|579|Maschinen zum Bedrucken von Spinnstoffen
289421100|580|Maschinen und Apparate zum Herstellen oder Ausrüsten von Filz oder Vliesstoffen (einschl. Maschinen und Apparate zum Herstellen von Filzhüten; Formen für die Hutmacherei)
289421300|580|Bügelmaschinen, Bügel- und Fixierpressen
289421503|581|zum Waschen oder Bleichen
289421505|581|zum Färben
289421701|582|Maschinen zur Warenschau, zum Falten, zum Aufwickeln und Schneiden für die Textilindustrie
289421707|582|Abwickel-, Lege- und Zuschneidemaschinen für die Bekleidungsindustrie
289421800|580|Maschinen zum Herstellen von Linoleum o.a. Fußbodenbelag durch Be- schichten von Geweben o.a. Unterlagen, zum Appretieren oder Ausrüsten; Maschinen zum Mangeln, Dämpfen, Formen, Entwässern
289422300|583|Maschinen zum Waschen von Wäsche mit einem Fassungsvermögen an Trockenwäsche von mehr als 10 kg
289422500|583|Maschinen für die chemische Reinigung
289422701|584|für die Textilindustrie
289422703|584|für die Wäscherei und chemische Reinigung
289423000|3|Wäscheschleudern
289424300|585|Nähautomaten
289424503|586|Steppstichnähmaschinen
289424505|586|Liniennahtmaschinen (auch Zick-Zack-Nähmaschinen), Oberdecknaht-, Überwendling- und Sicherheitsnähmaschinen
289424508|586|Andere Nähmaschinen und -apparate, a.n.g
289430300|587|zum Aufbereiten, Gerben oder Bearbeiten von Häuten, Fellen oder Leder
289430500|587|zum Herstellen oder Instandsetzen von Schuhen
289430700|587|Andere Maschinen und Apparate zum Herstellen und Instandsetzen von Lederwaren
289440000|3|Haushaltsnähmaschinen
289451103|588|für Maschinen zum Düsenspinnen und Nachbehandeln von cellulosischen und synthetischen Fasern und Filamenten oder deren Hilfsmaschinen und -apparate
289451109|588|für andere Spinnereimaschinen oder deren Hilfsmaschinen oder -apparate
289451300|589|Spindeln, Spindelflügel, Spinnringe und Ringläufer, Rotorspinnaggregate und Teile dafür (auch Auflösewalzen)
289451503|590|Webschützen, Webeblätter, Weblitzen, Webschäfte
289451509|590|Andere Teile und Zubehör für Webmaschinen oder deren Hilfsmaschinen oder -apparate
289451700|589|Teile und Zubehör für Wirk-, Strick-, Nähwirk-, Gimpen-, Tüll-, Spitzen-, Stick-, Posamentier-, Flecht-, Netzwirk- und Tuftingmaschinen oder deren Hilfsmaschinen und -apparate
289452103|591|für Maschinen mit einem Fassungsvermögen an Trockenwäsche von 10 kg oder weniger
289452109|591|für andere Maschinen zum Waschen von Wäsche
289452205|592|für Maschinen und Apparate zum Waschen, Bleichen, Färben, Appretieren, Ausrüsten, Beschichten und zum Auf- und Abwickeln, Falten, Schneiden von Geweben
289452208|592|für andere Maschinen und Apparate (z.B. für Wäschetrockner mit einem Fassungsvermögen an Trockenwäsche von 10 kg oder weniger und für andere Trockner für Garne, Gewebe u.a. Spinnstoffwaren
289452300|593|Nähmaschinennadeln
289452600|593|Andere Nähmaschinenteile (z.B. Möbel, Sockel und Deckel für Nähmaschinen sowie Teile dafür)
289452800|593|Teile für Maschinen und Apparate zum Herstellen und Instandsetzen von Leder, Schuhen und Lederwaren
289511130|594|zum Herstellen von Halbstoff aus cellulosehaltigen Faserstoffen
289511150|594|zum Herstellen von Papier oder Pappe
289511170|594|zum Fertigstellen von Papier oder Pappe
289511330|595|Kombinierte Rollenschneide- und -wickelmaschinen
289511350|595|Längs- und Querschneider
289511370|595|Schnellschneider
289511400|596|Andere Schneidemaschinen für Papier oder Pappe
289511500|596|Maschinen zum Herstellen von Tüten, Beuteln, Säcken oder Briefumschlägen
289511600|596|Maschinen zum Herstellen von Schachteln, Hülsen, Trommeln o.ä., nicht durch Formpressen hergestellten Behältnissen
289511700|596|Maschinen zum Formpressen von Waren aus Papierhalbstoff, Papier oder Pappe
289511900|596|Andere Maschinen und Apparate zum Be- und Verarbeiten von Papierhalbstoff, Papier oder Pappe
289512300|597|zum Herstellen von Halbstoff aus cellulosehaltigen Faserstoffen
289512503|598|zum Herstellen von Papier oder Pappe
289512505|598|zum Fertigstellen von Papier oder Pappe
289512701|599|zum Schneiden
289512709|599|zum anderen Be- oder Verarbeiten von Papierhalbstoff, Papier oder Pappe
289610100|600|Spritzgießmaschinen
289610300|600|Extruder
289610400|600|Blasformmaschinen
289610500|600|Vakuumform- u.a. Warmformmaschinen
289610600|600|Maschinen zum Formen oder Runderneuern von Luftreifen oder zum Formen von Luftschläuchen
289610730|601|Pressen
289610750|601|Andere Maschinen und Apparate zum Herstellen von Formteilen (z.B. Rotations- und Schleudergießmaschinen)
289610820|602|für die Verarbeitung von Reaktionsharzen
289610840|602|Andere Maschinen zum Herstellen von Zellkunststoff oder Zellkautschuk (ohne solche für die Verarbeitung von Reaktionsharzen)
289610910|603|Zerkleinerungsmaschinen
289610930|603|Mischer, Kneter, Rührwerke
289610950|603|Schneid-, Schäl-, Spalt- und Stanzmaschinen
289610971|604|Folgemaschinen und Nachfolgeeinrichtungen für Extruder und Kalander
289610977|604|3D-Drucker für die additive Fertigung von Waren aus Kautschuk oder Kunststoffen
289610979|604|Andere Maschinen und Apparate zum Be- oder Verarbeiten von Kautschuk oder Kunststoffen oder zum Herstellen von Waren aus diesem Material, a.n.g
289620001|605|Schnecken
289620003|605|Zylinder
289620009|605|Andere Teile für Maschinen und Apparate zum Be- oder Verarbeiten von Kautschuk oder Kunststoffen oder zum Herstellen von Waren daraus
289911100|606|Falzmaschinen
289911300|606|Zusammentragmaschinen
289911500|606|Faden-, Draht- und Klammerheftmaschinen
289911700|606|Klebebindemaschinen
289911900|606|Andere Buchbindereimaschinen und -apparate
289912000|3|Setzmaschinen; Maschinen zum Schriftgießen oder zum Zurichten oder Herstellen von Druckformen
289913300|607|Rollenoffsetmaschinen und -apparate
289913901|608|für ein Papierformat von 62 x 87 cm oder weniger
289913903|608|für ein Papierformat von mehr als 62 x 87 cm bis 80 x 110 cm
289913905|608|für ein Papierformat von mehr als 80 x 110 cm
289914100|609|Rollenhochdruckmaschinen und -apparate
289914300|609|Flexodruckmaschinen und -apparate
289914500|609|Tiefdruckmaschinen und -apparate
289914900|609|Andere Druckmaschinen und -apparate (ohne Büromaschinen) (z.B. Tintenstrahldruckmaschinen)
289920200|610|Maschinen, Apparate und Geräte zum Herstellen von Halbleiterbarren (Boules) oder Halbleiterscheiben (Wafers)
289920450|610|Maschinen, Apparate und Geräte zum Herstellen von Halbleiterbauelementen oder elektronischen integrierten Schaltungen
289920600|610|Maschinen, Apparate und Geräte zum Herstellen von Flachbildschirmen
289931303|611|für Holz
289931305|611|für Papierhalbstoff, Papier oder Pappe
289931503|612|für Nahrungs- und Genussmittel
289931505|612|für chemische Erzeugnisse und für Erzeugnisse aus Kunststoff oder Kautschuk
289931507|612|für lackierte Erzeugnisse (ohne elektrisch beheizte Infrarot-Trockenöfen), (z.B. Kammer- und Durchlauföfen)
289931509|612|für andere Erzeugnisse, a.n.g
289932000|3|Karusselle, Luftschaukeln, Schießbuden u.a. Geräte und Ausrüstungen, für das Schaustellergewerbe
289939053|613|zur Oberflächenvorbehandlung
289939055|613|zur Oberflächenbehandlung oder -veredlung
289939059|613|Andere Maschinen zum Behandeln von Metallen (z.B. Spulenwickelmaschinen für elektrotechnische Zwecke)
289939100|614|Maschinen und Apparate für die Isotopentrennung und Teile dafür
289939151|615|für die pharmazeutische Industrie
289939153|615|für die chemische Industrie
289939159|615|für andere Industrien
289939200|614|Maschinen zum Zusammenbauen von mit Glaskolben oder Glasröhren ausgestatteten elektrischen Lampen, Elektronenröhren oder Blitzlampen
289939250|614|Schreitender hydraulischer Grubenausbau
289939300|614|Maschinen zum Herstellen oder Warmbearbeiten von Glas oder Glaswaren
289939350|616|Mehrzweck-Industrieroboter
289939400|616|Zentralschmiersysteme
289939450|614|Maschinen, Apparate und Geräte für die Herstellung oder Reparatur von Masken und Retikeln, Zusammenbauen von Halbleiterbauelementen oder elektronisch integrierten Schaltungen, zum Heben, Fördern, Laden und Entladen von Halbleiterbarren (Boules), Halbleiterscheiben (Wafers) oder Halbleiterbauelementen, elektronischen integrierten Schaltungen und Flachbildschirmen
289939500|614|Maschinen zum Herstellen von Bindfäden, Seilen, Tauen oder Kabeln
289939532|617|3D-Drucker für die additive Fertigung von Waren aus mineralischen Stoffen
289939534|618|zum Herstellen von Gießformen aus Sand (auch Kernherstellungsmaschinen) (ohne 3D Drucker)
289939536|618|für die Baustoffindustrie (ohne 3D Drucker)
289939538|618|für andere mineralische Stoffe (z.B. für bergmännisch gewonnene mineralische Stoffe) (ohne 3D Drucker)
289939552|619|Montagemaschinen (mit manuellen Tätigkeiten im mechanisierten Montageablauf integriert)
289939553|619|Montageautomaten (ohne manuelle Tätigkeiten im Montageablauf)
289939554|619|Montagelinien (verkettete mechanisierte und/oder automatisierte Einzelmontage- bzw. Montageroboterstationen)
289939555|619|Aufbaueinheiten (ständerlose Maschinen, die zur Ergänzung einer vorhandenen oder unter Verwendung eines Trägergestells bzw. einer Basiseinheit für den Grundaufbau von Montageeinrichtungen dienen), Kennzeichnungseinheiten zum Prägen, Signieren usw
289939557|620|Handhabungsgeräte (Bewegungsachsen nicht frei programmierbar) für die automatische Zufuhr und Entnahme von Material, Werkstücken und Werkzeugen
289939558|620|Manipulatoren (manuell gesteuerte Bewegungseinrichtungen, ferngesteuerte Manipulatoren)
289939559|620|Greif- u. Spanneinrichtungen (z.B. Greif- u. Spannwerkzeuge, Werkstückaufnahmen und -träger, Werkzeugaufnahmen und - wechseleinrichtungen für Handhabungsgeräte, Manipulatoren und Industrieroboter)
289939571|621|für die anorganische Chemie
289939573|621|für die organische Chemie
289939575|621|für allgemeine chemische Zwecke
289939576|621|Bodenreinigungsmaschinen für gewerbliche Zwecke
289939577|621|3D-Drucker für die additive Fertigung von Waren aus Metall
289939578|621|Andere Maschinen, Apparate und Geräte für zivile Zwecke
289939651|3|Startvorrichtungen für Luftfahrzeuge; Abbremsvorrichtungen für Schiffsdecks u.ä. Landehilfen für Luftfahrzeuge, für zivile Zwecke; Teile dafür
289939700|3|Auswuchtmaschinen
289940001|622|Hilfsmaschinen und -apparate für Druckmaschinen
289940002|622|Teile und Zubehör für Buchbindereimaschinen und -apparate
289940003|622|Teile und Zubehör für Maschinen zum Setzen, Schriftgießen oder zum Zurichten oder Herstellen von Druckformen sowie für Druck- und Druckhilfsmaschinen und -apparaten
289951000|3|Teile für Maschinen und Apparate von der ausschließlich oder haupt- sächlich zur Herstellung von Halbleiterbarren oder -scheiben (Wafers), Halbleiterbauelementen, integrierten elektronischen Schaltungen oder Flachbildschirmen u.ä. verwendeten Art
289952300|623|Teile für Maschinen zum Zusammenbauen, Herstellen oder Warmbearbeiten von Glas oder Glaswaren
289952801|624|für die Span- oder Faserplattenherstellung und Holz- oder Korkbehandlung
289952803|624|für den Straßen-, Hoch- oder Tiefbau oder für ähnliche Arbeiten, a.n.g
289952805|624|für die chemische Industrie, a.n.g
289952807|624|für die automatisierte Montagetechnik und Handhabung
289952808|624|für Maschinen für die Oberflächenvorbehandlung, -behandlung oder -veredlung von Metallen
289952809|624|für andere Maschinen, a.n.g
289999000|3|Veredlung von Erzeugnissen dieser Güterabteilung
291011000|3|Hubkolbenverbrennungsmotoren mit Fremdzündung, für Zugmaschinen, Kraftwagen, Fahrräder mit Hilfsmotor u.a. nicht schienengebundene Landfahrzeuge (ohne Krafträder) mit einem Hubraum von 1 000 cm³ oder weniger
291012001|625|Rumpf- bzw. halbfertige Motoren
291012005|625|fertige Motoren
291013000|3|Kolbenverbrennungsmotoren mit Selbstzündung (Diesel- oder Halbdiesel- motoren), für Zugmaschinen, Kraftwagen u.a. nicht schienengebundene Landfahrzeuge (ohne solche für Acker- und Forstschlepper auf Rädern)
291021001|626|erdgasbetrieben
291021009|626|andere Personenkraftwagen und Wohnmobile, mit Hubkolbenverbrennungs- motor mit Fremdzündung, mit einem Hubraum von 1 500 cm³ oder weniger
291022303|627|Personenkraftwagen mit einem Hubraum von mehr als 1 500 cm³, erdgasbetrieben
291022306|628|andere Personenkraftwagen mit einem Hubraum von mehr als 1 500 cm³ bis 2 500 cm³
291022307|628|andere Personenkraftwagen mit einem Hubraum von mehr als 2 500 cm³
291022308|628|Wohnmobile mit einem Hubraum von mehr als 3 000 cm³
291022550|629|Wohnmobile mit einem Hubraum von mehr als 1 500 cm³ bis 3 000 cm³
291023150|630|Personenkraftwagen, mit einem Hubraum von 1 500 cm³ oder weniger
291023300|630|Personenkraftwagen, mit einem Hubraum von mehr als 1 500 cm³ bis 2 500 cm³
291023450|630|Personenkraftwagen mit einem Hubraum von mehr als 2 500 cm³
291023535|631|mit einem Hubraum von mehr als 1 500 cm³ bis 2 500 cm³
291023555|631|mit einem Hubraum von mehr als 2 500 cm³
291024100|3|Personenkraftwagen mit Elektro- sowie mit anderem Motor Fahrzeuge mit Hubkolbenverbrennungsmotor mit Fremdzündung oder Kolbenverbrennungsmotor mit Selbstzündung (Diesel- oder Halbdieselmotor) und mit Elektromotor angetrieben, die nicht durch Anstecken an externe elektrische Energiequellen aufgeladen werden
291024300|3|Fahrzeuge mit Hubkolbenverbrennungsmotor mit Fremdzündung oder Kolbenverbrennungsmotor mit Selbstzündung (Diesel- oder Halbdieselmotor) und mit Elektromotor angetrieben, die durch Anstecken an externe elektrische Energiequellen aufgeladen werden
291024500|3|Fahrzeuge, die ausschließlich mit Elektromotor betrieben werden
291024900|3|Fahrzeuge mit anderem Motor
291030000|3|Omnibusse mit Kolbenverbrennungsmotor sowie mit anderem Motor
291041100|632|mit einem zulässigen Gesamtgewicht von 5 t oder weniger
291041300|632|mit einem zulässigen Gesamtgewicht von mehr als 5 t bis 20 t
291041400|632|mit einem zulässigen Gesamtgewicht von mehr als 20 t
291042001|633|mit einem zulässigem Gesamtgewicht von 5 t oder weniger
291042003|633|mit einem zulässigem Gesamtgewicht von mehr als 5 t
291042009|632|Lastkraftwagen mit anderem Motor (inkl. Kolbenverbrennungsmotor mit Fremdzündung)
291043000|3|Sattel-Straßenzugmaschinen (ohne Zugkraftkarren)
291044000|3|Zu den Personenkraftwagen und anderen Fahrzeugen der Position 2910 2 gehören auch Mehrzweckfahrzeuge, die sowohl zur Personen- als auch zur Güterbeförderung bestimmt sind, vom Typ ‚Pick-up’ sowie vom Typ ‚Van’. Fahrgestelle Zu den unter Nummer
291051000|3|Kranwagen (Autokrane)
291052000|3|Schneespezialfahrzeuge (einschl. Motorschlitten); Spezialfahrzeuge zur Personenbeförderung auf Golfplätzen sowie ähnliche Fahrzeuge
291059300|634|Feuerwehrwagen
291059500|634|Betonmischwagen (LKW-Betonmischer)
291059901|634|Andere Kraftfahrzeuge zu besonderen Zwecken (z.B. Kraftfahrzeuge mit Bohrturm zum Tiefbohren, Abschleppwagen, Straßenkehrwagen, Straßensprengwagen, Werkstattwagen, Wagen mit Röntgenanlage, Krankenwagenaufbauten)
292010300|635|Karosserien für Personenkraftwagen und Wohnmobile
292010501|636|für Feuerwehrwagen
292010505|636|für Omnibusse
292010507|636|für Einachsschlepper u.a. Lastkraftwagen (ohne Tankwagenaufbauten)
292010509|636|Tankwagenaufbauten ohne Fahrgestell
292021001|637|Wechselbehälter
292021007|637|Abfallmulden
292021009|637|Andere Container (z.B. Überseecontainer)
292022920|638|Wohnanhänger, faltbar; Wohnanhänger mit einem Gewicht bis 1 600 kg
292022980|638|Wohnanhänger mit einem Gewicht von mehr als 1 600 kg
292023001|639|einachsig
292023002|639|zweiachsig (ohne solche mit Spezialaufbauten)
292023003|639|drei- und mehrachsig (ohne solche mit Spezialaufbauten)
292023004|639|zweiachsig, mit Spezialaufbauten
292023005|639|drei- und mehrachsig, mit Spezialaufbauten
292023006|640|Andere einachsige Anhänger
292023008|641|Andere Anhänger für zivile Zwecke, mit einem zulässigen Gesamtgewicht von 10 t oder weniger
292023009|641|Andere Anhänger für zivile Zwecke, mit einem zulässigen Gesamtgewicht von mehr als 10 t
292030300|642|Fahrgestelle
292030500|642|Karosserien und Aufbauten
292030700|642|Achsen
292030900|642|Andere Teile
292040001|643|an Kraftfahrzeugen (z.B. Lackieren von Kfz-Rohkarosserien, Tuning)
292040008|643|an Anhängern für Kraftfahrzeuge sowie an Teilen für Anhänger
292050000|3|Innenausbau- und Ausrüstungsarbeiten an Wohnanhängern und Wohnmobilen
293110003|644|für Kraftfahrzeuge
293110005|644|für andere Beförderungsmittel
293121300|645|Zündkerzen
293121500|645|Magnetzünder; Lichtmagnetzünder; Schwungmagnetzünder
293121700|645|Zündverteiler; Zündspulen
293122300|646|Anlasser und Licht-Anlasser
293122500|646|Andere Lichtmaschinen
293122700|646|Andere Apparate und Vorrichtungen, für Verbrennungsmotoren
293123100|647|Beleuchtungs- und Sichtsignalgeräte für Fahrräder
293123300|647|Diebstahlalarmanlagen für Kraftfahrzeuge
293123500|647|Hörsignalgeräte für Kraftfahrzeuge oder Fahrräder
293123700|647|Scheibenwischer, Scheibenentfroster und Vorrichtungen gegen das Beschlagen der Fensterscheiben
293130300|648|für elektrische Zündapparate, Zündvorrichtungen und Anlasser, Lichtmaschinen, Lade- oder Rückstromschalter
293130800|648|für elektrische Beleuchtungs- und Signalgeräte, Scheibenwischer, Scheibenentfroster und Vorrichtungen gegen das Beschlagen der Scheiben
293210001|649|Kindersitze
293210005|649|Andere Sitze für Kraftfahrzeuge
293220300|650|Sicherheitsgurte
293220500|650|Airbags, mit System zum Aufblasen, Teile dafür
293220900|650|Andere Karosserieteile u.a. Karosseriezubehör (auch für Fahrerhäuser) (z.B. Anhängerkupplungen, Auspuffblenden u. -kappen, Schmutzfänger, Autodachkoffer, Blenden für Armaturenbretter, Bordsteintaster, Dach- Windabweiser, Heckklappen und -spoiler)
293230100|651|Stoßstangen und Teile dafür
293230200|651|Bremsbeläge, Servobremsen und Teile für Bremsen (ohne nichtmontierte Bremsbeläge und -klötze)
293230330|652|Schaltgetriebe
293230361|652|Achsbrücken (Triebachsen) mit Ausgleichsgetriebe, auch mit anderen Kraftübertragungsvorrichtungen
293230365|652|Tragachsen und Teile dafür
293230400|651|Räder sowie Teile und Zubehör dafür
293230500|651|Aufhängesysteme und Teile davon (einschl. Stoßdämpfer)
293230610|653|Kühler
293230630|653|Auspufftöpfe (Schalldämpfer) und Auspuffrohre
293230650|653|Schaltkupplungen und Teile dafür
293230670|653|Lenkräder, Lenksäulen und Lenkgetriebe
293230902|654|Brennstoffbehälter
293230903|654|Aufhängungen (ohne Stoßdämpfer) ( z.B. Drehstabfedern, Stabilisatoren)
293230906|654|Übertragungsteile (ohne Getriebe, Achsbrücken u.ä.)
293230908|655|Autoheizungen
293230909|655|Andere Teile und Zubehör, a.n.g. (z.B. Torsionsstabfedern, Schaltgetriebeteile, Radzylindergehäuse, Luftfederungssysteme, Doppelbedienungen für Fahrschulen, Drehkränze für Gelenkbusse)
293291000|3|hergestellten, zugekauften oder gestellten Teilen der Positionen 293 ... in Kraftwagen. Diese Produktionsart wird häufig durc h „outsourcing“ organisiert. Die Montage von kompletten Bausätzen zu Kraftwagen ist unter der Nummer
299999000|3|Veredlung von Erzeugnissen dieser Güterabteilung
301121300|656|Kreuzfahrt-, Ausflugsschiffe u.ä. Wasserfahrzeuge zur Personenbeförderung
301121500|656|Fährschiffe jeder Art
301122100|657|Rohöltanker
301122300|657|Ölproduktentanker
301122500|657|Chemikalientanker
301122700|657|Flüssiggastanker
301123000|3|Kühlschiffe (ohne Tankschiffe)
301124100|658|Massengutfrachtschiffe (einschl. kombinierter Massengutfrachter, z.B. Erz-/Ölfrachter)
301124300|658|Stückgutfrachtschiffe
301124500|658|Vollcontainerschiffe
301124700|658|RoRo-Frachtschiffe
301124900|658|Andere Trockengutschiffe
301131300|659|Fischereifahrzeuge
301131500|659|Fabrikschiffe u.a. Schiffe für das Verarbeiten oder Konservieren von Fischereierzeugnissen
301132000|3|Schlepper und Schubschiffe
301133300|660|Schwimmbagger
301133500|660|Andere nicht für Frachtzwecke gebaute Wasserfahrzeuge
301140300|661|Offshore-Wasserfahrzeuge
301140500|661|Offshore-Infrastrukturen (z.B. Bohr- und Förderplattformen)
301150000|3|Andere schwimmende Vorrichtungen (einschl. Flößen, Schwimmtanks, Senkkästen, Festmachetonnen, Anlege- stellen, Bojen und schwimmende Baken)
301191001|3|Um- und Ausbau an Schiffen, Bohr- oder Förderplattformen und schwimmenden Vorrichtungen
301192001|662|Innenausbauarbeiten an Schiffen, anderen Wasserfahrzeugen und schwimmenden Vorrichtungen für zivile Zwecke
301192008|662|Andere Ausrüstungsarbeiten an Schiffen, anderen Wasserfahrzeugen und schwimmenden Vorrichtungen (z.B. Elektroarbeiten, Schiffsanstreicherei, Klimaanlageneinbau) für zivile Zwecke
301211000|3|Segelboote, auch mit Hilfsmotor (außer aufblasbaren Segelbooten), für Sport oder Freizeit
301212000|3|Aufblasbare Boote
301219300|663|Motorboote und Motorjachten, zu Sport- oder Vergnügungszwecken, mit Innenmotor
301219700|663|Ruderboote, Kanus u.a. Vergnügungs- oder Sportboote a.n.g
301291001|3|Umbau- und Ausbauarbeiten an Booten und Yachten
302011000|3|Elektrische Lokomotiven mit Stromspeisung aus dem Stromnetz
302012000|3|Dieselelektrische Lokomotiven
302013000|3|Elektrische Lokomotiven mit Stromspeisung aus Akkumulatoren; andere Lokomotiven, Lokomotivtender
302020000|3|Triebwagen und Schienenbusse (ohne Schienenfahrzeuge zur Gleisunterhaltung u.a. Bahndienstfahrzeuge)
302031000|3|Schienenfahrzeuge zur Gleisunterhaltung u.a. Bahndienstfahrzeuge, auch selbstfahrend (z.B. Gerätewagen u.ä., Messwagen und Draisinen)
302032000|3|Personenwagen ohne Eigenantrieb, Gepäckwagen, Postwagen u.a. schienengebundene Spezialwagen (ohne Schienenfahrzeuge zur Gleisunterhaltung)
302033000|3|Schienengebundene Güterwagen ohne Eigenantrieb
302040301|664|Druckluftbremsvorrichtungen für Schienenfahrzeuge und Teile dafür
302040309|664|Andere Teile für Schienenfahrzeuge (z.B. Drehgestelle, Lenkgestelle, Achsen und Räder; Zughaken u.a. Kupplungsvorrichtungen, Puffer, Sitze)
302040550|665|Mechanische (auch elektromechanische) Signal-, Sicherungs- oder Verkehrskontrollgeräte für Straßen, Binnenwasserstraßen, Parkplätze oder Parkhäuser, Hafenanlagen oder Flughäfen
302040600|665|Mechanische (auch elektromechanische) Signal-, Sicherungs- oder Verkehrskontrollgeräte für Schienenwege; Teile für mechanische (auch elektromechanische) Signal-, Sicherungs- oder Verkehrskontrollgeräte für Schienenwege, Straßen, Binnenwasserstraßen, Parkplätze oder Parkhäuser, Hafenanlagen oder Flughäfen
302091001|666|Umbau von Schienenfahrzeugen
302091005|666|Innenausbau und Ausrüstung (Komplettierung) von Schienenfahrzeugen
303011001|3|Kolbenverbrennungsmotoren mit Fremdzündung für zivile und halböffentliche Luftfahrzeuge
303012001|3|Turbo-Strahltriebwerke, Turbo-Propellertriebwerke für zivile und halböffentliche Luftfahrzeuge
303013001|3|Strahltriebwerke (ohne Turbo-Strahltriebwerke) für zivile und halböffentliche Luftfahrzeuge
303014001|3|Bodengeräte zur zivilen Flugausbildung und Teile dafür
303015000|3|Teile für Kolbenverbrennungsmotoren mit Fremdzündung, für Luftfahrzeuge
303016000|3|Teile für Turbo-Strahltriebwerke oder Turbo-Propellertriebwerke
303020000|3|Segelflugzeuge, Hanggleiter, Ballone, Luftschiffe u.a. nicht für maschinellen Antrieb bestimmte Luftfahrzeuge
303031001|3|Zivile und halböffentliche Hubschrauber
303032001|667|mit einem Leergewicht von 2 000 kg oder weniger
303033001|667|mit einem Leergewicht von mehr als 2 000 kg bis 15 000 kg
303034001|667|mit einem Leergewicht von mehr als 15 000 kg
303040001|3|Raumfahrzeuge (einschl. Satelliten) und Trägerraketen für Raumfahrzeuge, für zivile Zwecke
303050100|668|Sitze für Luftfahrzeuge, Teile dafür
303050300|668|Propeller und Rotoren, Teile dafür
303050500|668|Fahrgestelle und Teile dafür
303050901|668|Andere Teile für Luft- und Raumfahrzeuge
303060300|669|von Luftfahrzeugmotoren und -triebwerken
303060500|669|von Hubschraubern
303060700|669|von Flugzeugen
303099000|3|Veredlung von Luft- und Raumfahrzeugen
309111000|3|Krafträder und Fahrräder mit Hilfsmotor, mit Hubkolbenverbrennungsmotor mit einem Hubraum von 50 cm³ oder weniger
309112000|3|Krafträder mit Hubkolbenverbrennungsmotor mit einem Hubraum von mehr als 50 cm³, auch mit Beiwagen
309113000|3|Fahrräder (Zwei-, Drei- und Vierräder), mit Trethilfe, mit Elektrohilfsmotor; Krafträder mit Elektromotor (z.B. Elektroroller); Beiwagen
309120000|3|Teile und Zubehör für Krafträder und Beiwagen
309131000|3|Hubkolbenverbrennungsmotoren mit Fremdzündung für Krafträder, mit einem Hubraum von 1 000 cm³ oder weniger
309132000|3|Hubkolbenverbrennungsmotoren mit Fremdzündung für Krafträder, mit einem Hubraum von mehr als 1 000 cm³, einschl. Rumpf- bzw. halbfertige Motoren
309210000|3|Zweiräder u.a. Fahrräder (einschl. Lastendreirädern), ohne Motor
309220300|670|ohne Vorrichtung zur mechanischen Fortbewegung
309220900|670|mit Motor o.a. Vorrichtung zur mechanischen Fortbewegung
309230100|671|Rahmen, Gabeln oder auch Vorderradgabeln, für Fahrräder
309230601|672|Teile für Fahrradrahmen und -gabeln; Freilaufzahnkränze; Teile für Bremsen (einschl. Bremsnaben), Fahrradsitze für Kinder, Pedale, Tretlager, Lenker, Gepäckträger, Kettenschaltungen u.a. Fahrradteile
309230609|672|Andere Teile und Zubehör für Zweiräder u.a. Fahrräder, ohne Motor (z.B. Felgen, Speichen, Sättel, Lenker)
309230700|671|Teile und Zubehör für Rollstühle u.a. Fahrzeuge für Kranke und Körperbehinderte
309240300|673|Kinderwagen
309240500|673|Teile für Kinderwagen
309910001|674|Einrädrige Handtransportgeräte (z.B. Schubkarren)
309910003|674|Zweirädrige Handtransportgeräte (z.B. Sack-, Stech- und Fasskarren, Shoppingtrolleys)
309910004|674|Drei- und mehrrädrige Handtransportgeräte bis 1 t Traglast (z.B. Einkaufswagen, Gepäckwagen für Bahnsteige oder Flughäfen, handgeführte Golftrolleys)
309910009|674|Andere Fahrzeuge (z.B. drei- und mehrrädrige Handtransportgeräte über 1 t Traglast, Kutschen, Trichterwagen, Sulkis u.a. Gespannfahrzeuge für Tiere)
309999000|3|Teile für Anhänger (einschl. Sattelanhängern) und Schubkarren sowie Handtransportgeräte Veredlung von Erzeugnissen dieser Güterabteilung, a.n.g`;

var _gpRows = null;
function gpRows() {
  if (_gpRows) return _gpRows;
  var paths = GP_PATHS.split("\n");
  _gpRows = GP_INDEX.split("\n").map(function(line) {
    var p1 = line.indexOf("|"), p2 = line.indexOf("|", p1 + 1);
    var gp = line.slice(0, p1);
    var label = line.slice(p2 + 1);
    var path = paths[+line.slice(p1 + 1, p2)] || "";
    return {
      gp: gp,
      wz: gp.slice(0, 2) + "." + gp.slice(2, 4),
      label: label,
      path: path,
      hay: gpNorm(label + " " + path),
    };
  });
  return _gpRows;
}

// Fold German orthography so "Tränkebecken" and "traenkebecken" agree.
function gpNorm(s) {
  return (s || "").toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

var GP_STOP = { "und": 1, "oder": 1, "fuer": 1, "von": 1, "mit": 1, "aus": 1, "der": 1,
  "die": 1, "das": 1, "den": 1, "dem": 1, "andere": 1, "anderen": 1, "anderer": 1,
  "sonstige": 1, "sonstigen": 1, "auch": 1, "ohne": 1, "einschl": 1, "usw": 1,
  "sowie": 1, "aehnliche": 1, "aehnlichen": 1, "ung": 1, "herstellung": 1,
  "produktion": 1, "fertigung": 1, "gmbh": 1, "kg": 1, "ag": 1, "co": 1 };

// Remove the catalogue's exclusion clauses before indexing. Kept out of the
// displayed label, which must stay verbatim so a citation can be checked.
function gpStripExcl(s) {
  return (s || "").replace(/\((?:\s*(?:ohne|ausgenommen)\b)[^)]*\)/gi, " ");
}

function gpFormatCode(gp) {
  return gp.slice(0, 4) + " " + gp.slice(4, 6) + " " + gp.slice(6);
}

// Inverted index over catalogue words, with document frequencies. Built once,
// lazily. Matching is anchored at word starts rather than done on raw
// substrings: "Tränkebecken" must not be answered with "Getränke", which is
// exactly what a substring match does (traenke ⊂ getraenke).
var GP_MIN_SCORE = 2.5;

var _gpInv = null;
function gpInverted() {
  if (_gpInv) return _gpInv;
  var rows = gpRows();
  var df = {}, post = {};
  for (var r = 0; r < rows.length; r++) {
    var seen = {};
    // "(ohne X)" / "(ausgenommen X)" is an EXCLUSION: the catalogue is saying
    // X belongs somewhere else. Indexing those words inverts their meaning --
    // WZ 28.93 "Andere milchwirtschaftliche Maschinen (ohne Melkmaschinen)"
    // was outranking the real Melkmaschinen at 2830 82 000. Drop them.
    var labelWords = gpNorm(gpStripExcl(rows[r].label)).split(" ");
    var pathWords = gpNorm(gpStripExcl(rows[r].path)).split(" ");
    // A hit in the product label counts for much more than a hit in an
    // ancestor heading. Without this, WZ 25.73 ("Auswechselbare Werkzeuge ...
    // oder in Werkzeugmaschinen") outranks the actual Werkzeugmaschinen in
    // 28.41, because the phrase sits in its heading and repeats over dozens
    // of entries.
    for (var w = 0; w < labelWords.length + pathWords.length; w++) {
      var inLabel = w < labelWords.length;
      var t = inLabel ? labelWords[w] : pathWords[w - labelWords.length];
      if (t.length < 4 || seen[t]) continue;
      seen[t] = 1;
      df[t] = (df[t] || 0) + 1;
      (post[t] || (post[t] = [])).push(inLabel ? r : ~r);   // ~r marks path-only
    }
  }
  _gpInv = { df: df, post: post, n: rows.length, tokens: Object.keys(post) };
  return _gpInv;
}

// Inverse document frequency: "maschinen" appears in hundreds of entries and
// must not outvote a discriminative term like "traenken" or "spritzgiess".
function gpIdf(tok) {
  var inv = gpInverted();
  var d = inv.df[tok] || 1;
  return Math.log(inv.n / d);
}

// Deterministic product -> WZ lookup against the catalogue.
// Returns [{gp, wz, label, path, score}] best first.
function gpSearch(query, limit) {
  var rows = gpRows();
  var out = [];

  // A Meldenummer typed directly resolves exactly, no scoring involved.
  var digits = (query || "").replace(/\D/g, "");
  if (digits.length >= 4) {
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].gp.indexOf(digits) === 0) {
        out.push(Object.assign({}, rows[i], { score: 100 }));
      }
    }
    if (out.length) return out.slice(0, limit || 12);
  }

  var toks = gpNorm(query).split(" ").filter(function(t) {
    return t.length >= 4 && !GP_STOP[t];
  });
  if (!toks.length) return [];

  var inv = gpInverted();
  var acc = {};        // row -> accumulated weight
  var covered = {};    // row -> set of query tokens matched

  for (var q = 0; q < toks.length; q++) {
    var tok = toks[q];
    // A German compound in the query should reach its head noun in the
    // catalogue: "traenkebecken" -> "traenken". Anchor on a shared prefix.
    var stem = tok.slice(0, Math.max(5, Math.ceil(tok.length * 0.7)));
    var matches = {};
    for (var ti = 0; ti < inv.tokens.length; ti++) {
      var cand = inv.tokens[ti], w = 0;
      if (cand === tok) w = 1.0;
      // A German compound carries its head noun at the END: Tür|schlösser,
      // Acker|schlepper, Sanitär|armaturen. That head is the part that decides
      // the class, so a catalogue word ending the query token is the strongest
      // partial signal there is.
      else if (cand.length >= 5 && cand.length >= 0.45 * tok.length &&
               tok.length > cand.length &&
               tok.slice(tok.length - cand.length) === cand) w = 0.85;
      else if (cand.indexOf(stem) === 0) w = 0.75;          // katalog word extends query stem
      // Query extends a catalogue word ("leiterplatten" ⊃ "leiter"). Only
      // accept it when the catalogue word carries most of the query token,
      // or a short generic head swallows every compound built on it.
      else if (tok.indexOf(cand) === 0 && cand.length >= 5 &&
               cand.length >= 0.6 * tok.length) w = 0.7;
      if (w) matches[cand] = Math.max(matches[cand] || 0, w);
    }
    for (var cw in matches) {
      var weight = matches[cw] * gpIdf(cw);
      var plist = inv.post[cw];
      for (var p = 0; p < plist.length; p++) {
        var enc = plist[p];
        var row = enc < 0 ? ~enc : enc;
        var here = enc < 0 ? weight * 0.35 : weight;   // path-only hit counts less
        acc[row] = (acc[row] || 0) + here;
        (covered[row] || (covered[row] = {}))[tok] = 1;
      }
    }
  }

  for (var rid in acc) {
    var nCov = Object.keys(covered[rid]).length;
    var score = acc[rid] * (1 + 0.6 * (nCov - 1));   // reward multi-term hits
    if (nCov === toks.length && toks.length > 1) score *= 1.5;
    out.push(Object.assign({}, rows[rid], { score: score, covered: nCov }));
  }

  out.sort(function(a, b) {
    return b.score - a.score || a.gp.localeCompare(b.gp);
  });

  // Below this the "match" is a stray common word; say nothing rather than
  // point at an unrelated Meldenummer.
  var best = out.length ? out[0].score : 0;
  if (best < GP_MIN_SCORE) return [];
  return out.filter(function(o) { return o.score >= best * 0.25; })
            .slice(0, limit || 12);
}

// Roll matches up to the WZ classes they imply, so the caller can see whether
// the catalogue points into scope (26-30) or out of it (25).
//
// IMPORTANT — read `confidence` before using `wz`:
//
//   "exact"  a Meldenummer was given, or the query IS a catalogue label.
//            Deterministic; safe to assert and to cite on its own.
//   "strong" one clear label hit, well ahead of the runner-up class.
//   "weak"   several classes are plausible.
//
// Measured on a 22-case set drawn from the catalogue: the top class is right
// 55% of the time, but the right class is somewhere in the top 15 hits 91% of
// the time. So this is a good RETRIEVER and a poor CLASSIFIER — outside the
// "exact" tier the hits are evidence to be judged, never a verdict. German
// compounding is why: "Beschläge"/"beschlagen" and "Schlepper" (tractor vs
// tugboat) are not separable lexically.
function gpClassify(query) {
  var hits = gpSearch(query, 25);
  if (!hits.length) return null;
  // Rank a class by its BEST hit, not by the sum of its hits. One exact
  // catalogue match ("Melkmaschinen" = 2830 82 000) is stronger evidence than
  // a dozen loose ones that merely share a common head like "-maschinen";
  // summing lets the crowded class win and moves the answer to the wrong WZ.
  var byWz = {};
  for (var i = 0; i < hits.length; i++) {
    var h = hits[i];
    if (!byWz[h.wz]) byWz[h.wz] = { wz: h.wz, score: 0, hits: [] };
    byWz[h.wz].score = Math.max(byWz[h.wz].score, h.score);
    if (byWz[h.wz].hits.length < 3) byWz[h.wz].hits.push(h);
  }
  var ranked = Object.keys(byWz).map(function(k) { return byWz[k]; })
    .sort(function(a, b) { return b.score - a.score; });
  var top = ranked[0];
  var div = parseInt(top.wz.slice(0, 2), 10);

  var qn = gpNorm(query);
  var byCode = /^\s*\d{4}[\s\d]*$/.test(query || "");
  var exactLabel = hits.some(function(h) { return gpNorm(h.label) === qn; });
  var margin = ranked.length > 1 ? top.score / (ranked[1].score || 1) : Infinity;

  var confidence = (byCode || exactLabel) ? "exact"
                 : (margin >= 1.6 && gpNorm(top.hits[0].label).indexOf(qn.split(" ")[0]) >= 0) ? "strong"
                 : "weak";

  return {
    wz: top.wz,
    confidence: confidence,
    inScope: div >= 26 && div < 31,
    division: div,
    hits: top.hits,
    all: ranked.slice(0, 4),
    top: hits.slice(0, 10),
  };
}


// Render retrieved catalogue entries for the Phase-2 prompt. This goes in the
// DYNAMIC part of the message, never the cached static prefix.
//
// The retriever finds the right WZ class within its top hits ~91% of the time
// but names it as the single best hit only ~59% of the time, so the hits are
// presented as evidence for the model to choose between — with the explicit
// instruction that a chosen entry must be cited by Meldenummer. Only
// confidence "exact" is stated as settled.
function gpEvidenceBlock(query, lang) {
  var res = gpClassify(query);
  if (!res || !res.top || !res.top.length) return "";
  var de = lang === "de";
  var lines = res.top.map(function(h) {
    return "  " + gpFormatCode(h.gp) + "  -> WZ " + h.wz + "  " + h.label +
           (h.path ? "   [" + h.path + "]" : "");
  }).join("\n");

  var head = de
    ? "\nGP 2019 GÜTERVERZEICHNIS — Treffer aus dem amtlichen Katalog (Statistisches Bundesamt, Abt. 25-30):\n"
    : "\nGP 2019 PRODUCT CATALOGUE — hits from the official index (Destatis, div. 25-30):\n";

  var rule = de
    ? "\nSO IST DAMIT UMZUGEHEN:\n" +
      "- Die Meldenummer trägt die WZ-Klasse in den ersten vier Ziffern (2830 86 601 -> WZ 28.30). Das ist verbindlich, nicht die Wortähnlichkeit.\n" +
      "- Wähle den Eintrag, der das tatsächliche Erzeugnis beschreibt, und nenne dessen Meldenummer in reasoning.\n" +
      "- Die Liste ist nach Relevanz sortiert, der erste Treffer ist NICHT automatisch der richtige. Deutsche Komposita führen in die Irre (z.B. „Beschläge\" vs. „beschlagen\", „Schlepper\" = Traktor oder Schleppschiff).\n" +
      "- Treffer in Abteilung 25 (Metallerzeugnisse) liegen AUSSERHALB des Anwendungsbereichs von Anlage 2 Nr. 5 (nur 26.xx-30.99). Passt das Erzeugnis dorthin, ist in_scope=false — mit Meldenummer als Beleg.\n" +
      "- Passt kein Treffer, ignoriere die Liste und klassifiziere anhand der Produkte.\n"
    : "\nHOW TO USE THIS:\n" +
      "- The Meldenummer carries the WZ class in its first four digits (2830 86 601 -> WZ 28.30). That governs, not word similarity.\n" +
      "- Pick the entry describing the actual product and cite its Meldenummer in reasoning.\n" +
      "- The list is ranked by relevance; the first hit is NOT automatically correct. German compounds mislead (e.g. \"Beschläge\" vs \"beschlagen\", \"Schlepper\" = tractor or tugboat).\n" +
      "- Hits in division 25 (fabricated metal products) are OUTSIDE the scope of Annex 2 No. 5 (26.xx-30.99 only). If the product belongs there, in_scope=false — citing the Meldenummer.\n" +
      "- If no hit fits, ignore the list and classify from the products.\n";

  var settled = "";
  if (res.confidence === "exact") {
    settled = de
      ? "\nEINDEUTIG: Die Angabe entspricht wörtlich dem Katalogeintrag " +
        gpFormatCode(res.hits[0].gp) + " -> WZ " + res.wz + ". Verwende diese Klasse, sofern die übrigen Angaben nicht klar dagegen sprechen.\n"
      : "\nUNAMBIGUOUS: The input matches catalogue entry " +
        gpFormatCode(res.hits[0].gp) + " -> WZ " + res.wz + " verbatim. Use that class unless other evidence clearly contradicts it.\n";
  }
  return head + lines + "\n" + rule + settled;
}

// ── GP 2019 Abteilung 25: Produkt→WZ Referenz (relevant für Abgrenzung zu 28.xx) ──
const GP2019_REF_25 = `
DESTATIS GP 2019 – Abteilung 25 Metallerzeugnisse: Produkt-WZ-Zuordnung (BSIG-relevante Abgrenzung)

WICHTIGE ABGRENZUNGSREGEL:
WZ 25.73 (Werkzeuge) vs. WZ 28.41/28.49 (Werkzeugmaschinen):
- WZ 25.73 = Hersteller von WERKZEUGEN (das Werkzeug selbst als Produkt)
- WZ 28.41/28.49 = Hersteller von WERKZEUGMASCHINEN (Maschine, die Werkzeuge einsetzt)
Beispiel Spritzgießen: Hersteller von Spritzgießwerkzeugen/-formen → 25.73; Hersteller von Spritzgießmaschinen → 28.96

25.11 – Metallkonstruktionen: Stahlhallen, Brücken, Türme, Skelettkonstruktionen, Fassadenelemente, Regale, Geländer, Rollläden (Stahl/Alu), Tore/Türen/Fenster aus Stahl/Alu
25.21 – Heizkörper & Zentralheizungskessel: Heizkörper, Gas-/Ölkessel, Zentralheizungskessel
25.29 – Metallbehälter >300l: Tanks, Sammelbehälter, Druckbehälter, Heizungsboiler (groß), Gasflaschen
25.30 – Dampfkessel & Kernreaktoren: Dampferzeuger, Wasserrohrkessel, Rauchrohrkessel, Kondensatoren für Dampfturbinen, Kernreaktoren
25.50 – Schmiede-/Blechformteile: Freiformschmiedestücke, Gesenkschmiedeteile, Kaltfließpressteile, Blechformteile, pulvermetallurgische Erzeugnisse (Zulieferung für Maschinenbau, Fahrzeugbau, Elektrotechnik)
25.61 – Oberflächenveredlung & Wärmebehandlung: Galvanisieren, Verzinken, Eloxieren, Lackieren, Härten/Vergüten, PVD/CVD-Beschichtung, Sandstrahlen
25.62 – Mechanikleistungen: Drehen, Fräsen (als Lohnfertigung), Schlosser-/Schweißarbeiten an fremden Teilen
25.71 – Schneidwaren & Bestecke: Messer (ohne Maschinenmesser), Scheren, Rasierklingen, Besteck
25.72 – Schlösser & Beschläge: Türschlösser, Zylinderschlösser, Scharniere, Baubeschläge, Möbelbeschläge, Türschließer
25.73 – WERKZEUGE (NICHT Werkzeugmaschinen!):
  • Handwerkzeuge: Spaten, Äxte, Sägen, Zangen, Schraubenschlüssel, Hämmer, Schraubenzieher
  • Sägeblätter aller Art (Kreissägeblätter, Bandsägeblätter, inkl. Hartmetall)
  • Auswechselbare Werkzeuge für Maschinen/Handwerkzeuge: Bohrer, Fräser, Gewindeschneider, Drehwerkzeuge, Wendeschneidplatten, Reibahlen, Räumwerkzeuge
  • Formen & Gießereimodelle: Spritzgießwerkzeuge für Kunststoff/Kautschuk, Druckgussformen für Metall, Gießereiformkästen, Kokillen, Formen für Glas/Mineralien
  • Andere Werkzeuge: Ziehwerkzeuge, Stanzwerkzeuge, Tiefziehwerkzeuge, Erd-/Gesteinsbohrwerkzeuge, Maschinenmesser/-klingen
25.91 – Metallbehälter ≤300l: Fässer, Kanister, Behälter aus Stahl ≤300l
25.92 – Verpackungen aus Metall: Dosen, Tuben, Aerosoldosen, Kronenverschlüsse
25.93 – Drahtwaren, Ketten, Federn: Stahlseile, Drahtgitter, Schraubenfedern, Blattfedern, Tellerfedern, Ketten
25.94 – Schrauben & Nieten: Schrauben, Bolzen, Muttern, Unterlegscheiben, Niete
25.99 – Sonstige Metallwaren: Sanitärartikel aus Metall, Haushaltsartikel aus Metall, Panzerschränke, Schilder, Dauermagnete
`;

// ── GP 2019 Abteilung 28: Produkt→WZ Referenz ─────────────────────────────
const GP2019_REF = `
DESTATIS GP 2019 – Abteilung 28 Maschinen: Produkt-WZ-Zuordnung (kompakt)

REGEL: Die GP-Meldenummer trägt die WZ-Klasse in den ersten vier Ziffern.
GP 2830 86 601 → WZ 28.30; GP 2829 21 509 → WZ 28.29. Wenn ein Produkt im
Güterverzeichnis auffindbar ist, ist dessen Meldenummer maßgeblich — nicht
die Ähnlichkeit der Wortbedeutung. Führe die Meldenummer in der Begründung an.

28.11 – Verbrennungsmotoren & Turbinen: Außenbordmotoren, Dieselmotoren (Industrie/Wasser/Schienen), Turbinen (Dampf/Gas/Wasser), Windturbinen, Motorenteile
28.12 – Hydraulik & Pneumatik: Hydrozylinder, Pneumatikzylinder, Hydromotoren, Hydropumpen (Axialkolben, Zahnrad, Flügelzellen), Hydraulikventile, Pneumatikventile, Hydroaggregate, Hydrosysteme, Druckluftmotoren
28.13 – Pumpen & Kompressoren: Flüssigkeitspumpen (Kreiselpumpen, Tauchmotorpumpen, Dosierpumpen, Zahnradpumpen, Schraubenspindelpumpen, Exzenterschneckenpumpen, Betonpumpen), Vakuumpumpen, Luftkompressoren (Schraube, Kolben, Turbo), Kältekompressoren, Ventilatoren >125W
28.14 – Armaturen: Druckminderventile, Rückschlagventile, Sicherheitsventile, Sanitärarmaturen, Thermostatventile, Regelventile, Stellventile, Schieber, Kugelhähne, Absperrarmaturen, Membranarmaturen
28.15 – Lager, Getriebe, Antriebselemente: Kugellager, Rollenlager, Nadellager, Getriebe (Stirnrad, Kegelrad, Schnecken, Planeten), Schaltgetriebe, Gelenkwellen, Kurbelwellen, Lagergehäuse, Gleitlager, Kupplungen (elastisch, hydraulisch, Reibung), Freilaufkupplungen, Zahnräder, Kettenräder, Schwungräder
28.21 – Öfen & Brenner: Ölbrenner, Gasbrenner, Industrieöfen (elektrisch/nicht-elektrisch), Induktionsöfen, Widerstandsöfen, Laboröfen, Verbrennungsöfen
28.22 – Hebezeuge & Fördermittel: Flaschenzüge, Zugwinden, Hebebühnen, Krane (Laufkran, Portalkran, Turmdrehkran, Wandkran), Gabelstapler, Elektrokarren, Aufzüge (Personen/Lasten), Rolltreppen, Stetigförderer (Band, Kette, pneumatisch), Regalbediengeräte, Shuttlefahrzeuge, Seilschwebebahnen, Hubarbeitsbühnen
28.23 – Büromaschinen: Rechenmaschinen, Fotokopierapparate, Adressiermaschinen, Aktenvernichter, Frankiermaschinen
28.24 – Kraftbetriebene Handwerkzeuge: Handbohrmaschinen, Kettensägen, Kreissägen, Winkelschleifer, Stichsägen, Druckluftwerkzeuge, Schlagbohrer, Oberfräsen
28.25 – Kälte-/Klimatechnik: Klimageräte, Wärmetauscher, Wärmepumpen, Kühlmöbel, Tiefkühlgeräte, Kälteanlagen, Apparate zur Gasfiltrierung/-reinigung, Ventilatoren >125W
28.29 – Sonstige allgemeine Maschinen: Gaserzeuger, Destillierapparate, Filteranlagen (Flüssigkeit/Gas), Verpackungsmaschinen (Abfüll-, Etikettier-, Verschließmaschinen), Feuerlöscher, Spritzpistolen, Sandstrahlmaschinen, Waagen, Zentrifugen, Warenverkaufsautomaten, Geschirrspüler (gewerblich), Schweißmaschinen (nicht elektrisch), Wasserstrahlreiniger, Mischmaschinen
28.30 – Land-/Forstwirtschaftsmaschinen (GP 2830): Ackerschlepper, Einachsschlepper (2830 10); Pflüge (2830 31), Grubber/Kultivatoren, Scheiben- und Zahneggen, Motorhacken (2830 32); Sä-, Pflanz- und Kartoffellegemaschinen (2830 33); Düngerstreuer, Schleuderdüngestreuer (2830 34); Rasenmäher (2830 40); Mähmaschinen, Motormäher (2830 51); Rech- und Zettwender (2830 52); Sammel-, Stroh- und Futterpressen, Ballenpressen (2830 53); Kartoffel-, Rüben- und Wurzelfruchterntemaschinen (2830 54); Mähdrescher, Dreschmaschinen, Feldhäcksler, Maispflücker (2830 59); Spritz-, Sprüh- und Stäubegeräte, Apparate zum Besprengen (2830 60); Stalldungstreuer, Ladewagen (2830 70); Maschinen zum Reinigen/Sortieren von Eiern, Obst u.a. landwirtsch. Erzeugnissen (2830 81); Melkmaschinen (2830 82); Maschinen für die Futterbereitung, Schrotmühlen (2830 83); Brut- und Aufzuchtapparate sowie andere Maschinen für die Geflügelhaltung (2830 84, 2830 85); Holz-Ernte- und -Bearbeitungsmaschinen, Skidder, Rückezangen (2830 86 300); MASCHINEN UND GERÄTE ZUM FÜTTERN UND TRÄNKEN (2830 86 601); andere Maschinen und Geräte für die TIERHALTUNG / Stalleinrichtungen (2830 86 602); selbsttätige TRÄNKEBECKEN, Silo-Entnahmefräsen, ortsveränderliche Lagereinrichtungen für landwirtsch. Erzeugnisse (2830 86 609)
   ABGRENZUNG 28.30 vs. 28.29: Tränkebecken, Selbsttränken, Futter- und Tränkeanlagen sowie sonstige Stall- und Tierhaltungstechnik gehören nach GP 2830 86 zu WZ 28.30 — NICHT zu 28.29 („sonstige allgemeine Maschinen"). 28.29 kommt für solche Produkte nur in Betracht, wenn sie im Güterverzeichnis nicht unter 2830 geführt sind.
28.41 – Werkzeugmaschinen Metallbearbeitung: Drehmaschinen (CNC, Drehzentren), Fräsmaschinen, Schleifmaschinen (Flach, Rund), Bearbeitungszentren, Transfermaschinen, Laserschneidmaschinen, Elektroerosion, Wasserstrahlschneiden, Biegemaschinen, Abkantpressen, Gesenkbiegemaschinen, Stanzmaschinen, Schmiedepressen, Hydraulikpressen, Säge-/Trennmaschinen, Verzahnmaschinen, Räummaschinen, Ziehmaschinen
28.49 – Werkzeugmaschinen a.n.g.: Steinbearbeitungsmaschinen, Holzbearbeitungsmaschinen (Kreissäge, Bandsäge, Hobelmaschinen, Fräsmaschinen Holz), Bohrmaschinen stationär, Galvanotechnik, Spanplattenpressen, Werkzeughalter, Spannzangen
28.91 – Metallerzeugungsmaschinen: Konverter, Gießmaschinen, Walzwerke (Warm/Kalt), Stranggussanlagen
28.92 – Bergwerks-/Baumaschinen: Bagger (Hydraulik/Raupen/Rad), Bulldozer, Grader, Lader, Straßenwalzen, Muldenkipper, Tunnelbohrmaschinen, Stetigförderer Untertage, Betonmischer, Siebmaschinen, Gleiskettenzugmaschinen, Rammen, Schneeräumer
28.93 – Nahrungsmittelmaschinen: Milchentrahmer, Mühlenmaschinen, Pressen (Wein/Obst), Backofenmaschinen (industriell), Fleischereimaschinen, Schlachthausanlagen, Brauereianlagen, Trocknungsanlagen (Nahrungs-), Verpackungsmaschinen Getränke
28.94 – Textilmaschinen: Spinnmaschinen, Webmaschinen, Strickmaschinen, Nähmaschinen (industriell), Wäscherei-/Reinigungsmaschinen (gewerblich), Wäschetrockner gewerblich, Lederbearb.maschinen
28.95 – Papiermaschinen: Papierherstellungsmaschinen, Rollenschneider, Schnellschneider, Beutelmaschinen, Schachtelmaschinen
28.96 – Kunststoff-/Gummimaschinen: Spritzgießmaschinen, Extruder, Blasformmaschinen, Vakuumformmaschinen, 3D-Drucker (Kunststoff/Kautschuk), Reifenformmaschinen, Mischer/Kneter für Kunststoff
28.99 – Sonstige Spezialmaschinen: Druckmaschinen (Offset, Flexo, Tiefdruck), Buchbinderei, Halbleitermaschinen, Industrieroboter, Montagemaschinen/-automaten/-linien, Handhabungsgeräte, Trockner (Holz/Papier/Chemie), Maschinen für die chem. Industrie, Auswuchtmaschinen, Maschinen für Glas, 3D-Drucker (Metall/Mineralien)
`;

const VALID_WZ_DIVISIONS = new Set([
  "01","02","03","05","06","07","08","09",
  "10","11","12","13","14","15","16","17","18","19",
  "20","21","22","23","24","25","26","27","28","29","30","31","32","33",
  "35","36","37","38","39","41","42","43","45","46","47","49",
  "50","51","52","53","55","56","58","59","60","61","62","63",
  "64","65","66","68","69","70","71","72","73","74","75",
  "77","78","79","80","81","82","84","85","86","87","88",
  "90","91","92","93","94","95","96","97","98","99",
]);

function validateWzRaw(raw) {
  var num = parseFloat(raw);
  if (!raw || isNaN(num) || num < 0 || !/^\d{2}(\.\d{1,2}(\.\d)?)?$/.test(raw)) return "format";
  var topLevel = String(Math.floor(num)).padStart(2, "0");
  if (!VALID_WZ_DIVISIONS.has(topLevel)) return "notfound";
  var inBsiRange = num >= 26 && num < 31;
  var in25Range  = num >= 25 && num < 26;
  var hasSub = raw.indexOf(".") !== -1;
  if (inBsiRange && hasSub && !WZ_LABELS[raw]) return "notfound";
  if (in25Range  && hasSub && !WZ_LABELS_25[raw] && !WZ_LABELS_25[String(Math.floor(num)) + "." + raw.split(".")[1]]) return "notfound";
  return "ok";
}

function parseJson(txt) {
  var clean = txt.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); } catch(_) {}
  // Extract balanced top-level {...} blocks (string-aware so braces inside
  // JSON strings don't fool the depth counter). Try candidates from last to
  // first — Claude's final answer is usually the last JSON in the reply,
  // even when preceded by search-reasoning prose that contains other braces.
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

async function callClaude(messages, useWebSearch, maxTokens, signal, timeoutMs) {
  var body = { model: "claude-haiku-4-5", max_tokens: maxTokens || 800, messages };
  if (useWebSearch) body.tools = [{ type: "web_search_20250305", name: "web_search" }];

  // Combine user abort signal + optional timeout into one AbortController
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

async function fetchCompanyData(companyName, loc, lang, signal) {
  var ndQuery = loc ? companyName + ", " + loc : companyName;
  var ndUrl   = "https://www.northdata.de/" + encodeURIComponent(loc ? companyName + "," + loc : companyName);
  var exJson = '{"gegenstand":"...","nace_code":"28.93","nace_found":true,"nace_source":"handelsregister","nace_evidence":"WZ 28.93 auf der Registerseite ausgewiesen","rechtsform":"GmbH","ort":"Muenchen","northdata_url":"https://www.northdata.de/...","hr_nummer":"HRB 12345","amtsgericht":"Muenchen","products":"Werkzeugmaschinen, Linearmotoren","candidates":[]}';
  var de = lang === "de";
  // The register-provenance rule. Without it the model infers a plausible
  // code from the Gegenstand text and reports it as if the register had
  // published it — which the UI then cites verbatim as a register fact.
  var naceRule = de
    ? "\nHERKUNFT DES NACE-CODES — WICHTIG: Setze `nace_found` NUR dann auf true, wenn der Code auf einer der Quellseiten TATSÄCHLICH ABGEDRUCKT ist und du ihn wörtlich ablesen kannst. Northdata zeigt in der Regel KEINEN NACE-/WZ-Code an (nur Gegenstand, Registerdaten, Finanzkennzahlen) — erfinde in diesem Fall keinen Code und melde ihn nicht als gefunden.\nWenn du den Code lediglich aus dem Unternehmensgegenstand oder den Produkten ERSCHLIESST, setze `nace_found: false`, `nace_source: \"inferred\"` und trage deinen erschlossenen Code trotzdem in `nace_code` ein (er wird dann als Hinweis, nicht als Registerbeleg verwendet).\n`nace_source`: \"northdata\" | \"handelsregister\" | \"website\" | \"inferred\" | null.\n`nace_evidence`: wörtliches Zitat der Fundstelle (max. 200 Zeichen) oder null, wenn erschlossen.\n"
    : "\nNACE CODE PROVENANCE — IMPORTANT: Set `nace_found` to true ONLY if the code is ACTUALLY PRINTED on one of the source pages and you can read it verbatim. Northdata usually does NOT display a NACE/WZ code (only business purpose, register data, financials) — in that case do not invent one and do not report it as found.\nIf you merely INFER the code from the business purpose or products, set `nace_found: false`, `nace_source: \"inferred\"`, and still put your inferred code in `nace_code` (it will be used as a hint, not as a register citation).\n`nace_source`: \"northdata\" | \"handelsregister\" | \"website\" | \"inferred\" | null.\n`nace_evidence`: verbatim quote of where you read it (max 200 chars) or null if inferred.\n";
  var ambiguityRule = de
    ? "\nEINDEUTIGKEIT: Wenn der eingegebene Firmenname mehrdeutig ist (mehrere deutsche Firmen mit ähnlichem Namen, Abkürzung, Tippfehler) oder du dir bei der eindeutigen Zuordnung nicht sicher bist, gib statt der Einzelfirma nur `candidates: [{name, city, hint}]` mit bis zu 5 möglichen Firmen zurück (name = vollständiger Firmenname wie im Handelsregister, city = Sitzort, hint = kurze Beschreibung z.B. Rechtsform / Branche / HR-Nummer). Setze in diesem Fall die anderen Felder (gegenstand, nace_code, ...) auf null. Beispiel: Eingabe „Bosch“ → candidates:[{name:\"Robert Bosch GmbH\",city:\"Stuttgart\",hint:\"Konzernmutter, Kraftfahrzeugtechnik\"},{name:\"Bosch Rexroth AG\",city:\"Lohr am Main\",hint:\"Antriebs- und Steuerungstechnik\"}].\nWenn die Firma eindeutig identifizierbar ist, `candidates` leer lassen ([]).\n"
    : "\nUNIQUENESS: If the input company name is ambiguous (multiple German companies with similar names, abbreviation, typo) or you're unsure about a unique match, return `candidates: [{name, city, hint}]` with up to 5 possibilities instead of a single company (name = full legal name from Handelsregister, city = registered office, hint = short description e.g. legal form / sector / HR number). In that case set the other fields (gegenstand, nace_code, ...) to null. Example: input \"Bosch\" → candidates:[{name:\"Robert Bosch GmbH\",city:\"Stuttgart\",hint:\"parent, automotive\"},{name:\"Bosch Rexroth AG\",city:\"Lohr am Main\",hint:\"drive and control tech\"}].\nWhen the company is unambiguously identifiable, leave `candidates` empty ([]).\n";
  var prompt = de
    ? ('Suche auf northdata.de nach "' + ndQuery + '" (URL-Muster: ' + ndUrl + ') sowie auf handelsregister.de und der offiziellen Unternehmenswebsite.' + ambiguityRule + naceRule + '\nExtrahiere: gegenstand, nace_code (oder null), nace_found, nace_source, nace_evidence, rechtsform, ort, northdata_url, hr_nummer, amtsgericht, products (max. 12 Produkte), candidates (leer oder Liste bei Mehrdeutigkeit).\nAntworte NUR als JSON: ' + exJson)
    : ('Search northdata.de for "' + ndQuery + '" (URL pattern: ' + ndUrl + ') as well as handelsregister.de and the official company website.' + ambiguityRule + naceRule + '\nExtract: gegenstand, nace_code (or null), nace_found, nace_source, nace_evidence, rechtsform, ort, northdata_url, hr_nummer, amtsgericht, products (max. 12), candidates (empty or list on ambiguity).\nReply ONLY as JSON: ' + exJson);
  var txt = await callClaude([{ role: "user", content: prompt }], true, 1100, signal, 40000);
  var parsed = parseJson(txt);
  // Ambiguous case — Claude returned candidates instead of a unique match.
  // Hand the list to the UI so the user picks; do NOT throw.
  if (Array.isArray(parsed.candidates) && parsed.candidates.length > 0 && !parsed.gegenstand && !parsed.products) {
    return { ambiguous: true, candidates: parsed.candidates };
  }
  if (!parsed.gegenstand && !parsed.products) throw new Error("No usable data returned");
  // Belt and braces: a code the model says it inferred, or one it claims to
  // have "found" without naming a source page, is not a register citation.
  if (parsed.nace_source === "inferred" || !parsed.nace_source) parsed.nace_found = false;
  return parsed;
}

// A NACE code counts as register-sourced only when the model reported both a
// real source page and a verbatim quote from it. Everything else is a hint.
function naceFromRegister(cd) {
  return !!(cd && cd.nace_found && cd.nace_code && cd.nace_evidence &&
            (cd.nace_source === "northdata" || cd.nace_source === "handelsregister"));
}

// Additional WZ labels for 25.xx (relevant for boundary cases)
const WZ_LABELS_25 = {
  "25":    "Herst. von Metallerzeugnissen",
  "25.1":  "Herst. von Stahl- und Leichtmetallbauerzeugnissen",
  "25.11": "Herst. von Metallkonstruktionen",
  "25.12": "Herst. von Türen, Fenstern aus Metall",
  "25.2":  "Herst. von Metallbehältern >300l, Heizkörpern",
  "25.21": "Herst. von Heizkörpern und Zentralheizungskesseln",
  "25.29": "Herst. von sonstigen Metallbehältern >300l",
  "25.30": "Herst. von Dampfkesseln und Kernreaktoren",
  "25.50": "Herst. von Schmiede-, Blechformteilen, Sintererzeugnissen",
  "25.61": "Oberflächenveredlung und Wärmebehandlung von Metallen",
  "25.62": "Mechanikleistungen a.n.g. (Lohnfertigung)",
  "25.71": "Herst. von Schneidwaren und Bestecken",
  "25.72": "Herst. von Schlössern und Beschlägen",
  "25.73": "Herst. von Werkzeugen (Handwerkzeuge, Sägeblätter, auswechselbare Werkzeuge, Formen/Spritzgießwerkzeuge, Stanz-/Tiefziehwerkzeuge)",
  "25.91": "Herst. von Metallbehältern ≤300l",
  "25.92": "Herst. von Verpackungen aus Metall (Dosen, Tuben)",
  "25.93": "Herst. von Drahtwaren, Ketten und Federn",
  "25.94": "Herst. von Schrauben und Nieten",
  "25.99": "Herst. von sonstigen Metallwaren",
};

function relevantWzLabels(hint) {
  var entries28 = Object.entries(WZ_LABELS).filter(function(e) {
    return /^\d{2}\.\d{1,2}$/.test(e[0]);
  });
  var entries25 = Object.entries(WZ_LABELS_25).filter(function(e) {
    return /^\d{2}\.\d{1,2}$/.test(e[0]);
  });
  var all = entries25.concat(entries28);
  if (hint) {
    var div = Math.floor(parseFloat(hint));
    if (div >= 25 && div <= 30) {
      return all
        .filter(function(e) { var d = Math.floor(parseFloat(e[0])); return d >= Math.max(25, div - 1) && d <= div + 1; })
        .map(function(e) { return e[0] + ": " + e[1]; }).join("\n");
    }
  }
  // Without hint: return 25.xx boundary codes + full 26–30
  var bsig28 = entries28.filter(function(e) { var d = Math.floor(parseFloat(e[0])); return d >= 26 && d <= 30; });
  var boundary25 = entries25.filter(function(e) { var d = Math.floor(parseFloat(e[0])); return d === 25; });
  return boundary25.concat(bsig28).map(function(e) { return e[0] + ": " + e[1]; }).join("\n");
}

async function analyzeWZ(company, products, compData, lang, signal) {
  // Skip the product analysis ONLY for a code we can actually attribute to a
  // register page. An inferred code falls through and gets analysed properly.
  if (naceFromRegister(compData)) {
    var code = compData.nace_code, num = parseFloat(code);
    if (num >= 26 && num < 31) {
      var srcName = compData.nace_source === "northdata" ? "Northdata" : "handelsregister.de";
      return {
        primary_wz: code, primary_label: WZ_LABELS[code] || WZ_LABELS[String(Math.floor(num))] || "",
        in_scope: true, confidence: lang === "de" ? "hoch" : "high",
        reasoning: lang === "de"
          ? "NACE-Code " + code + " wörtlich ausgewiesen auf " + srcName + " („" + compData.nace_evidence + "“) — im Anwendungsbereich BSIG 2025 Anlage 2 Nr. 5."
          : "NACE code " + code + " stated verbatim on " + srcName + " (“" + compData.nace_evidence + "”) — within scope of BSIG 2025 Annex 2 No. 5.",
        alternative_wz: [], sources_used: [compData.nace_source], skippedClassification: true,
      };
    }
  }
  var de = lang === "de";
  var contextParts = [];
  if (compData) {
    var naceNote = naceFromRegister(compData)
      ? (de ? "NACE laut Register (außerhalb BSIG-Bereich): " : "NACE from register (outside BSIG scope): ") + compData.nace_code
      : compData.nace_code
        ? (de ? "Kein NACE-Code im Register ausgewiesen. Aus dem Gegenstand erschlossener Hinweis (NICHT als Beleg verwenden, eigenständig prüfen): " : "No NACE code stated in the register. Hint inferred from the business purpose (do NOT treat as evidence, verify independently): ") + compData.nace_code
        : (de ? "Kein NACE-Code im Register" : "No NACE code in register");
    contextParts.push("\nHandelsregister/Northdata:\n- Gegenstand: " + (compData.gegenstand || "-") + "\n- " + naceNote + "\n- " + [compData.rechtsform, compData.ort].filter(Boolean).join(" - "));
    if (compData.hr_nummer) contextParts.push("\n- HR: " + compData.hr_nummer + (compData.amtsgericht ? " AG " + compData.amtsgericht : ""));
  }
  var scopeRule = de
    ? "\nSCOPE: in_scope=true fuer WZ 26.xx-30.99. Wichtig: Der Handelsregister-NACE kann unvollständig sein. Prüfe die tatsächlichen Produkte sorgfältig.\n"
    : "\nSCOPE: in_scope=true for WZ 26.xx-30.99. Important: The commercial register NACE may be incomplete. Check the actual products carefully.\n";
  var exJson = de
    ? '{"primary_wz":"28.41","primary_label":"Herst. von Maschinen fuer die Metallbearbeitung","in_scope":true,"confidence":"hoch","reasoning":"Max 2 Saetze.","sources_used":["products"],"alternative_wz":[],"is_msp_hint":false,"msp_hint_reason":null,"unclassifiable":false}'
    : '{"primary_wz":"28.41","primary_label":"Herst. von Maschinen fuer die Metallbearbeitung","in_scope":true,"confidence":"high","reasoning":"Max 2 sentences.","sources_used":["products"],"alternative_wz":[],"is_msp_hint":false,"msp_hint_reason":null,"unclassifiable":false}';
  var unclassRule = de
    ? "\nNICHT-KLASSIFIZIERBAR: Wenn Produkt-/Taetigkeitsangaben fehlen oder zu unspezifisch sind, setze unclassifiable=true, primary_wz=null, primary_label=null, in_scope=false, confidence=\"niedrig\" und erlaeutere in reasoning kurz, welche Angaben fehlen.\n"
    : "\nUNCLASSIFIABLE: If product/activity data is missing or too unspecific, set unclassifiable=true, primary_wz=null, primary_label=null, in_scope=false, confidence=\"low\" and briefly explain in reasoning which information is missing.\n";
  var confRule = de
    ? "\nKONFIDENZ: confidence muss genau einer dieser Werte sein: \"hoch\", \"mittel\", \"niedrig\". Keine anderen Werte, keine Unterstriche.\n"
    : "\nCONFIDENCE: confidence must be exactly one of: \"high\", \"medium\", \"low\". No other values, no underscores.\n";
  var mspRule = de
    ? "\nMSP-ERKENNUNG: is_msp_hint=true bei MSP-Merkmalen (IT-Systemhaus, Cloud, Remote-Monitoring, Helpdesk, IT-Outsourcing) mit kurzer msp_hint_reason. Sonst false/null.\nWICHTIG: reasoning max. 2 Saetze. Antworte NUR mit gueltigem JSON ohne Zeilenumbrueche oder Sonderzeichen ausser UTF-8.\n"
    : "\nMSP DETECTION: is_msp_hint=true for MSP indicators (IT systems house, cloud, remote monitoring, helpdesk, IT outsourcing) with short msp_hint_reason. Otherwise false/null.\nIMPORTANT: reasoning max. 2 sentences. Reply ONLY with valid JSON, no line breaks in string values.\n";
  var prodStr = products || (compData && compData.products) || "-";
  // Static block — identical across all calls in the same language, so it is
  // marked cache_control: ephemeral. After the first call writes the cache,
  // subsequent calls within 5 min pay only ~10 % of the input cost on this
  // prefix. Uses the full WZ list (relevantWzLabels(null)) so the prefix is
  // stable regardless of the per-call NACE hint.
  var fullWzList = relevantWzLabels(null);
  var staticPrefix = de
    ? ("Experte BSIG 2025 + DESTATIS WZ 2008 + GP 2019." + scopeRule + confRule + unclassRule + mspRule + "\nVerfuegbare WZ (inkl. relevante Abt. 25 zur Abgrenzung):\n" + fullWzList + "\n\nPRODUKT-REFERENZ GP 2019 – Abteilung 25 (Abgrenzung zu Abt. 28):\n" + GP2019_REF_25 + "\n\nPRODUKT-REFERENZ GP 2019 – Abteilung 28:\n" + GP2019_REF + "\n\nAntworte NUR als JSON nach diesem Schema: " + exJson)
    : ("Expert BSIG 2025 + DESTATIS WZ 2008 + GP 2019." + scopeRule + confRule + unclassRule + mspRule + "\nAvailable WZ (incl. relevant Div. 25 for boundary cases):\n" + fullWzList + "\n\nPRODUCT REFERENCE GP 2019 – Division 25 (boundary to Div. 28):\n" + GP2019_REF_25 + "\n\nPRODUCT REFERENCE GP 2019 – Division 28:\n" + GP2019_REF + "\n\nReply ONLY as JSON matching this schema: " + exJson);
  // Retrieve from the vendored Güterverzeichnis using the actual products plus
  // the register's Gegenstand. Appended to the VARIABLE half of the message:
  // the cached static prefix must stay byte-identical across calls.
  var gpQuery = [prodStr, compData && compData.gegenstand].filter(function(x) {
    return x && x !== "-";
  }).join(" ");
  var gpEvidence = gpQuery ? gpEvidenceBlock(gpQuery, lang) : "";

  var variableSuffix = de
    ? ("Bestimme WZ fuer: " + company + "\nProdukte: " + prodStr + contextParts.join("") + gpEvidence)
    : ("Determine WZ for: " + company + "\nProducts: " + prodStr + contextParts.join("") + gpEvidence);
  var msgContent = [
    { type: "text", text: staticPrefix, cache_control: { type: "ephemeral" } },
    { type: "text", text: variableSuffix }
  ];
  var txt    = await callClaude([{ role: "user", content: msgContent }], false, 2500, signal, 30000);
  var parsed = parseJson(txt);
  // Carry the catalogue hits into the result so the UI can show what the
  // classification was checked against, and the user can verify a Meldenummer
  // the way they would in the PDF.
  if (gpQuery) {
    var gpRes = gpClassify(gpQuery);
    if (gpRes) parsed.gp_hits = gpRes.top.slice(0, 6);
  }
  // Normalize alternative_wz: API may return objects instead of strings
  if (Array.isArray(parsed.alternative_wz)) {
    parsed.alternative_wz = parsed.alternative_wz.map(function(entry) {
      if (typeof entry === "object" && entry !== null) return entry.wz || entry.label || "";
      return String(entry);
    }).filter(Boolean);
  }
  // Treat empty/absent primary_wz as unclassifiable — the AI signalled it
  // couldn't determine a code (e.g. no product data). Without this the UI
  // would render an empty WZ tile alongside the definitive "outside scope"
  // verdict, which overclaims what the AI actually decided.
  var wzStr = parsed.primary_wz == null ? "" : String(parsed.primary_wz).trim();
  if (!wzStr || parsed.unclassifiable) {
    parsed.unclassifiable = true;
    parsed.primary_wz = null;
    parsed.primary_label = null;
    parsed.in_scope = false;
  }
  var ndOutOfScope = naceFromRegister(compData);
  if (ndOutOfScope && parsed.in_scope) { parsed.northdataOverride = true; parsed.northdataWz = compData.nace_code; }
  return parsed;
}

// ── i18n ──────────────────────────────────────────────────────────────────────
function mk(l) {
  var de = l === "de";
  return {
    title:    de ? "BSIG 2025 Prüfung für Maschinenbauer" : "BSIG 2025 Check for Machinery Manufacturers",
    subtitle: de ? "Betroffenheitsprüfung — Anwendungsbereich" : "Applicability Assessment — Scope Check",
    forLine:  de ? "Anlage 2 Nr. 5 · Maschinen- und Anlagenbauer" : "Annex 2 No. 5 · Machinery & Plant Manufacturers",
    langBtn:  de ? "EN" : "DE",
    hint:     de ? "Die Anlage 2 Nr. 5 des BSIG 2025 (in Kraft seit 6. Dezember 2025) erfasst Hersteller von Maschinen, elektrischen Ausrüstungen und Fahrzeugen — DESTATIS WZ 2008: 26.xx bis 30.99." : "Annex 2 No. 5 of BSIG 2025 (in force since 6 December 2025) covers manufacturers of machinery, electrical equipment and vehicles — DESTATIS WZ 2008: 26.xx to 30.99.",
    modeL:    de ? "Kennen Sie Ihre WZ-Nummer(n)?" : "Do you know your WZ/NACE code(s)?",
    modeYes:  de ? "Ja — WZ-Nummer(n) direkt eingeben" : "Yes — enter WZ code(s) directly",
    modeNo:   de ? "Nein — Erweiterte Analyse" : "No — Extended Analysis",
    modeNoHint: de ? "KI-Analyse · erfordert ein Claude-Konto (Anthropic)" : "AI analysis · requires a Claude account (Anthropic)",
    modeNoDisabled: de ? "API-Key erforderlich — über ⚙ oben rechts hinzufügen" : "API key required — add via ⚙ top-right",
    noKeyBannerT:   de ? "Nur Direktmodus verfügbar" : "Direct mode only",
    noKeyBannerB:   de ? "Ohne Anthropic API-Key steht die KI-gestützte Firmenanalyse nicht zur Verfügung. Sie können die App vollständig ansehen und den Direktmodus (bekannte WZ-Nummer) nutzen. Für die KI-Analyse: Key über ⚙ oben rechts hinzufügen." : "Without an Anthropic API key the AI-assisted company analysis is not available. You can browse the whole app and use direct mode (known WZ code). To enable AI analysis, add a key via the ⚙ icon top-right.",
    wzL:      de ? "WZ-Nummer(n) (DESTATIS 2008)" : "WZ code(s) (DESTATIS 2008)",
    wzPh:     de ? "z.B. 28.41" : "e.g. 28.41",
    wzHint:   de ? "BSIG-relevanter Bereich: 26.xx–30.99 · Unternehmen können mehrere WZ-Nummern haben — alle hinzufügen." : "BSIG-relevant range: 26.xx–30.99 · Companies may have multiple WZ codes — add all of them.",
    addWz:    de ? "+ Weitere WZ-Nummer hinzufügen" : "+ Add another WZ code",
    removeWz: de ? "Entfernen" : "Remove",
    checkBtn: de ? "Prüfen" : "Check",
    compL:    de ? "Gesellschaft (Einrichtung) mit Rechtsform" : "Company (entity) with legal form",
    compPh:   de ? "z.B. Müller Maschinenbau GmbH & Co. KG" : "e.g. Mueller Maschinenbau GmbH & Co. KG",
    compHint: de ? "Vollständiger Firmenname inkl. Rechtsform." : "Full name incl. legal form — used for commercial register lookup.",
    locL:     de ? "Firmensitz / Ort (optional)" : "Registered office / city (optional)",
    locPh:    de ? "z.B. München" : "e.g. Munich",
    locHint:  de ? "Verbessert die Treffsicherheit bei der Northdata-Suche." : "Improves accuracy of the Northdata lookup.",
    prodL:    de ? "Produkte oder Dienstleistungen (optional)" : "Products or services (optional)",
    prodPh:   de ? "z.B. Werkzeugmaschinen, Linearmotoren ..." : "e.g. machine tools, linear motors ...",
    prodHint: de ? "Wird automatisch ermittelt — oder hier manuell ergänzen." : "Auto-detected from company website — or enter manually here.",
    prodClear:  de ? "Inhalt löschen" : "Clear content",
    analyzeBtn: de ? "Analyse starten" : "Start analysis",
    cancelBtn:  de ? "Abbrechen" : "Cancel",
    step1:      de ? "1/2  Unternehmenssuche (Northdata/Web) …" : "1/2  Company lookup (Northdata/web) …",
    step2:      de ? "2/2  WZ-Klassifikation …" : "2/2  WZ classification …",
    step1Hint:  de ? "Web-Suche läuft, bitte warten (ca. 15–40 s) …" : "Web search running, please wait (~15–40 s) …",
    step2Hint:  de ? "Klassifikation wird berechnet …" : "Calculating classification …",
    destPDF:    de ? "Klassifikation (PDF)" : "Classification (PDF)",
    destXLSX:   de ? "Stichwortverzeichnis (XLSX)" : "Keyword index (XLSX)",
    srcNd: "Northdata", srcHr: "handelsregister.ai", srcDest: "DESTATIS",
    srcProd:   de ? "Produktangaben" : "Products",
    srcDirect: de ? "Direkte Eingabe" : "Direct input",
    srcCompTitle: de ? "Handelsregister-Quellenvergleich" : "Commercial Register Sources",
    srcCompNote:  de ? "Kombinierte Abfrage: Northdata, Handelsregister und Unternehmenswebsite." : "Combined query: Northdata, commercial register and company website.",
    colGegenstand:    de ? "Unternehmensgegenstand" : "Business Purpose",
    nacePresentBadge: de ? "NACE explizit" : "NACE explicit",
    naceAbsentBadge:  de ? "kein NACE-Code" : "no NACE code",
    naceInferredBadge: de ? "KI-erschlossen" : "AI-inferred",
    naceInferredNote:  de ? "Nicht im Register ausgewiesen — aus dem Unternehmensgegenstand abgeleitet." : "Not stated in the register — derived from the business purpose.",
    inScopeH:  de ? "Im Anwendungsbereich — BSIG 2025 Anlage 2 Nr. 5" : "Within Scope — BSIG 2025 Annex 2 No. 5",
    inScopeB:  de ? "Mindestens eine der angegebenen WZ-Nummern liegt im Bereich 26–30. Ihr Unternehmen fällt damit grundsätzlich unter Anlage 2 Nr. 5 BSIG 2025." : "At least one of the entered WZ codes falls within range 26–30. Your company is generally covered by Annex 2 No. 5 BSIG 2025.",
    outScopeH: de ? "Voraussichtlich außerhalb des Anwendungsbereichs" : "Likely Outside Scope",
    outScopeB: de ? "Keine der angegebenen WZ-Nummern liegt im Bereich 26–30. Anlage 2 Nr. 5 BSIG 2025 ist voraussichtlich nicht einschlägig." : "None of the entered WZ codes falls within range 26–30. Annex 2 No. 5 BSIG 2025 is likely not applicable.",
    unclassH:  de ? "WZ konnte nicht bestimmt werden" : "WZ code could not be determined",
    unclassB:  de ? "Die KI konnte anhand der vorliegenden Angaben keine WZ-Nummer zuordnen. Bitte konkrete Produkte oder Tätigkeiten im Feld „Produkte“ ergänzen und Analyse erneut starten." : "The AI could not assign a WZ code based on the available information. Please add concrete products or activities in the \"Products\" field and re-run the analysis.",
    wzLabel:   de ? "WZ-Nummer(n)" : "WZ code(s)",
    wzLabelSingle: de ? "WZ-Nummer" : "WZ code",
    confLabel: de ? "Konfidenz" : "Confidence",
    altWZ:     de ? "Alternative WZ" : "Alternative WZ",
    reasoning: de ? "Begründung" : "Reasoning",
    quellen:   de ? "Genutzte Quellen" : "Sources used",
    allWzTitle: de ? "Eingegebene WZ-Nummern" : "Entered WZ codes",
    wzInScope:  de ? "Im Anwendungsbereich" : "In scope",
    wzOutScope: de ? "Außerhalb" : "Out of scope",
    aiWzNoteTitle: de ? "KI-generierte WZ-Klassifikation" : "AI-generated WZ classification",
    aiWzNote:  de ? "Diese WZ-Nummer wurde durch KI-Analyse ermittelt und sollte intern bestätigt werden." : "This WZ code was determined by AI analysis and should be internally verified.",
    callsSaved: de ? "2 API-Aufrufe gespart (NACE direkt aus Register)" : "2 API calls saved (NACE direct from register)",
    wzHelp: {
      trigger: de ? "Wo finde ich meine WZ-Nummern?" : "Where do I find my WZ codes?",
      legal:   de ? "Gemäß der Gesetzesbegründung zum BSIG 2025 sind die in Anlage 2 genannten NACE-Codes identisch mit den WZ-Nummern der DESTATIS-Klassifikation 2008." : "According to the explanatory memorandum to BSIG 2025, the NACE codes in Annex 2 are identical to the WZ codes of DESTATIS WZ 2008.",
      stat:    de ? "Unternehmen sind verpflichtet, ihre statistischen Wirtschaftsdaten regelmäßig an die Landesstatistikbehörde zu melden. Diese Meldung enthält auch die WZ-Nummern." : "Companies are required to regularly report statistical economic data to the state statistics office, including the WZ codes.",
      tip:     de ? "In der Regel ist die Finanzbuchhaltung zuständig für die Meldung an die Landesstatistikbehörde. Fragen Sie dort nach den WZ-Nummern." : "The finance/accounting department is typically responsible for reporting to the state statistics office. Ask them for the WZ codes.",
      warn:    de ? "Die bei der Landesstatistikbehörde hinterlegten WZ-Nummern sind in der Praxis in ca. 90 % der Fälle ein guter Näherungswert — können aber veraltet oder unzutreffend sein. Dies geschieht insbesondere dann, wenn das Produktportfolio des Unternehmens sich geändert hat oder nicht mehr zutreffende WZ-Nummern gemeldet wurden. Die Statistikbehörden aktualisieren diese Meldedaten nur äußerst selten und ungern. Eine interne Überprüfung anhand der tatsächlichen Produkte und Tätigkeiten ist daher unbedingt empfohlen." : "The WZ codes on file with the state statistics office are a good approximation in around 90% of cases in practice — but may be outdated or incorrect. This occurs in particular when the company's product portfolio has changed or outdated WZ codes were reported. Statistics offices update this data only very rarely and reluctantly. An internal review based on actual products and activities is therefore strongly recommended.",
      src:     de ? "Rechtsgrundlage: Landesstatistikgesetze i.V.m. § 13 BStatG · Gesetzesbegründung BSIG 2025 (BT-Drucksache 21/1501)" : "Legal basis: State statistics acts in conjunction with §13 BStatG · Explanatory memorandum BSIG 2025 (BT-Drucksache 21/1501)",
    },
    mspTitle:  de ? "Prüfschritt: Konzernstruktur & Managed Service Provider (MSP)" : "Check: Group Structure & Managed Service Provider (MSP)",
    mspIntro:  de ? "Maschinenbauer sind häufig Teil von Konzernstrukturen. Hierbei kann eine Betroffenheit im Sektor \"Digitale Infrastruktur\" (Anlage 1) entstehen." : "Machinery manufacturers are often part of corporate groups. This may trigger applicability under the sector \"Digital Infrastructure\" (Annex 1).",
    mspDef:    de ? "Definition: Ein Managed Service Provider (§ 2 Nr. 26 BSIG 2025) ist ein Anbieter von Diensten im Zusammenhang mit Installation, Verwaltung, Betrieb oder Wartung von IT-Produkten, Netzwerken oder Anwendungen." : "Definition: A Managed Service Provider (§ 2 No. 26 BSIG 2025) is a provider of services related to the installation, management, operation or maintenance of IT products, networks or applications.",
    mspKonzern: de ? "Besonderheit im Konzern: Erbringt eine Mutter- oder Tochtergesellschaft zentral IT-Dienste (z.B. SAP-Betrieb, Cloud-Dienste, Netzwerkinfrastruktur) für andere Unternehmen innerhalb desselben Verbundes, gilt sie als MSP. Da das Gesetz auf die einzelne Rechtspersönlichkeit abstellt, werden die anderen Konzerngesellschaften als \"Kunden\" gewertet." : "Group specificity: If a parent or subsidiary centrally provides IT services (e.g. SAP operations, cloud services, network infrastructure) to other companies within the same group, it qualifies as an MSP. Since the law refers to individual legal entities, the other group companies are treated as \"customers\".",
    mspBasis:  de ? "Rechtsgrundlage: § 2 Nr. 26 BSIG 2025 — Anlage 1 Nr. 6.1.10 — BT-Drucksache 21/1501" : "Legal basis: § 2 No. 26 BSIG 2025 — Annex 1 No. 6.1.10 — BT-Drucksache 21/1501",
    mspQ:      de ? "Gilt für Ihr Unternehmen eine oder mehrere der folgenden Konstellationen? (Mehrfachauswahl möglich)" : "Does one or more of the following apply to your company? (Multiple selection possible)",
    mspOpts: de ? [
      { id: 0, icon: "factory", label: "IT-Dienstleistungen im Konzernverbund", desc: "Wir erbringen IT-Leistungen für andere verbundene Unternehmen im Konzern (z.B. Rechenzentrumsbetrieb, ERP-Betrieb, Netzwerkinfrastruktur, Softwarelizenzen) — unabhängig davon, ob wir selbst IT-Dienste von einer Konzern- oder Muttergesellschaft beziehen." },
      { id: 1, icon: "build", label: "IT-gestützte Dienste für Kunden", desc: "Wir bieten Kunden vertraglich IT-gestützte Leistungen an, z.B. Fernwartung mit SLAs, proaktives Monitoring (Condition Monitoring), Vor-Ort-Serviceeinsätze mit IT-Bezug bei Kundenanlagen." },
      { id: 2, icon: "arrow_upward", label: "Abhängig von Konzern-IT der Mutter", desc: "Eine übergeordnete Mutter-/Konzerngesellschaft erbringt zentrale IT-Dienste für unser Unternehmen. Wichtig: Dies führt meist zur IT-Unselbständigkeit — bitte den nachfolgenden Prüfschritt beachten." },
      { id: 3, icon: "close", label: "Keine dieser Konstellationen", desc: "Wir betreiben unsere IT ausschließlich für uns selbst und bieten keine IT-Dienste für Dritte oder verbundene Unternehmen an.", exclusive: true },
    ] : [
      { id: 0, icon: "factory", label: "IT services within the group", desc: "We provide IT services to other affiliated companies within the group (e.g. data centre operations, ERP, network infrastructure, software licences) — regardless of whether we ourselves receive IT services from a parent or group company." },
      { id: 1, icon: "build", label: "IT-based services for customers", desc: "We contractually provide customers with IT-based services, e.g. remote maintenance with SLAs, proactive monitoring (condition monitoring), on-site service with IT relevance at customer sites." },
      { id: 2, icon: "arrow_upward", label: "Dependent on parent group IT", desc: "A parent or group company centrally provides IT services to our entity. Important: This usually leads to IT non-independence — please refer to the subsequent check step." },
      { id: 3, icon: "close", label: "None of the above", desc: "We operate our IT exclusively for ourselves and do not provide IT services to third parties or affiliated companies.", exclusive: true },
    ],
    mspAlerts: de ? [
      { title: "MSP-Einstufungsrisiko: IT-Dienstleistungen im Konzernverbund", col: "#991b1b", bg: "#fef2f2", bdr: "#fca5a5", text: "Ihre Gesellschaft könnte als Managed Service Provider nach Anlage 1 Nr. 6.1.10 BSIG 2025 einzustufen sein — unabhängig davon, ob sie gleichzeitig selbst IT-Dienste von einer übergeordneten Konzerngesellschaft bezieht. Das Gesetz stellt auf die einzelne Rechtspersönlichkeit ab: Erbringt eine Gesellschaft relevante IT-Leistungen für andere verbundene Unternehmen, gelten diese als \"Kunden\". Eine MSP-Einstufung führt bei Überschreitung der Schwellenwerte für mittlere Unternehmen regelmäßig zur Einstufung als besonders wichtige Einrichtung (§ 28 Abs. 1 BSIG 2025).", hint: "Rechtsberatung dringend empfohlen." },
      { title: "MSP-Einstufungsrisiko: IT-gestützte Kundendienste", col: "#991b1b", bg: "#fef2f2", bdr: "#fca5a5", text: "Unternehmen, die Kunden vertraglich IT-gestützte Dienste erbringen, können als Managed Service Provider nach § 2 Nr. 26 BSIG 2025 einzustufen sein. Auch hier führt die MSP-Einstufung bei Überschreitung der mittleren Schwellenwerte zur Einstufung als besonders wichtige Einrichtung.", hint: "Prüfung empfohlen: § 2 Nr. 26 i.V.m. Anlage 1 Nr. 6.1.10 BSIG 2025." },
      { title: "Hinweis: Separate MSP-Prüfung der Konzernmutter erforderlich", col: "#B45309", bg: "#FFF7E6", bdr: "#FBBF24", text: "Die IT-Dienste erbringende Konzern- oder Muttergesellschaft sollte separat auf eine MSP-Einstufung nach Anlage 1 Nr. 6.1.10 BSIG 2025 geprüft werden. Für Ihr Unternehmen ist zudem die IT-Selbständigkeit zu prüfen (nachfolgender Prüfschritt).", hint: null },
    ] : [
      { title: "MSP classification risk: Central group IT service provider", col: "#991b1b", bg: "#fef2f2", bdr: "#fca5a5", text: "Your entity may qualify as a Managed Service Provider under Annex 1 No. 6.1.10 BSIG 2025. The law refers to individual legal entities — the other group companies are treated as \"customers\". An MSP classification regularly leads to classification as a particularly important entity if the thresholds for medium-sized enterprises are exceeded (§ 28 Para. 1 BSIG 2025).", hint: "Legal advice strongly recommended." },
      { title: "MSP classification risk: IT-based customer services", col: "#991b1b", bg: "#fef2f2", bdr: "#fca5a5", text: "Companies contractually providing customers with IT-based services may qualify as Managed Service Providers under § 2 No. 26 BSIG 2025. MSP classification leads to classification as a particularly important entity if medium-sized thresholds are exceeded.", hint: "Review recommended: § 2 No. 26 in conjunction with Annex 1 No. 6.1.10 BSIG 2025." },
      { title: "Note: Separate MSP review of parent company required", col: "#B45309", bg: "#FFF7E6", bdr: "#FBBF24", text: "The group or parent company providing IT services should separately be assessed for MSP classification under Annex 1 No. 6.1.10 BSIG 2025. For your entity, IT independence should also be assessed (see next check step).", hint: null },
    ],
    mspHigherTier: de ? "Wichtig: Eine MSP-Einstufung (Anlage 1 Nr. 6.1.10) hat bei Überschreitung der Schwellenwerte für mittlere Unternehmen regelmäßig eine Höherstufung zur besonders wichtigen Einrichtung zur Folge (§ 28 Abs. 1 Nr. 1 BSIG 2025)." : "Important: An MSP classification (Annex 1 No. 6.1.10) regularly results in classification as a particularly important entity if the thresholds for medium-sized enterprises are exceeded (§ 28 Para. 1 No. 1 BSIG 2025).",
    negBlockedTitle: de ? "Vernachlässigbarkeitsprüfung — nicht anwendbar" : "Negligibility Check — not applicable",
    negBlockedText:  de ? "Da Ihre Einrichtung als MSP-Anbieter im Konzernverbund oder als Anbieter IT-gestützter Kundendienste identifiziert wurde, ist eine Vernachlässigung der Tätigkeit nach § 28 Abs. 3 BSIG 2025 in der Regel ausgeschlossen." : "Since your entity has been identified as an MSP within a group or as a provider of IT-based customer services, the activity generally cannot be considered negligible under § 28 Para. 3 BSIG 2025.",
    negBlockedReason: de ? "Die Gesetzesbegründung stellt ausdrücklich klar, dass auch Unternehmen, die ausschließlich den zentralen IT-Betrieb eines Unternehmensverbundes übernehmen, in der Regel unter den Begriff des MSP fallen. Da IT-Dienste für das Funktionieren der verbundenen Gesellschaften meist von zentraler Bedeutung sind, gilt diese Tätigkeit in der Regel nicht als vernachlässigbar (§ 28 Abs. 3 BSIG 2025) — selbst wenn sie nur eine Nebentätigkeit der Muttergesellschaft darstellt." : "The explanatory memorandum expressly clarifies that companies exclusively taking over central IT operations of a group are generally covered by the MSP definition. Since IT services are usually of central importance for the functioning of affiliated companies, this activity is generally not negligible (§ 28 Para. 3 BSIG 2025) — even if it is only a secondary activity of the parent company.",
    negBlockedSrc:   de ? "Quelle: Gesetzesbegründung BSIG 2025 (BT-Drucksache 21/1501) · § 28 Abs. 3 BSIG 2025" : "Source: Explanatory memorandum BSIG 2025 (BT-Drucksache 21/1501) · § 28 Para. 3 BSIG 2025",
    negBlockedNote:  de ? "MSP-Risiko identifiziert ✓ — Fahren Sie direkt mit der IT-Selbständigkeitsprüfung und der Schwellenwertprüfung fort." : "MSP risk identified ✓ — proceed directly to the IT independence check and threshold assessment.",
    negTitle:  de ? "Prüfschritt: Vernachlässigbarkeit der Tätigkeit" : "Check: Negligibility of Activity",
    negIntro:  de ? "Auch wenn die WZ im Anwendungsbereich liegt, kann eine Einrichtung ausgenommen sein. Alle drei Kriterien müssen kumulativ erfüllt sein." : "Even if the WZ falls within scope, an entity may be exempt if the activity is negligible. All three criteria must be met cumulatively.",
    negSrc:    de ? "Quelle: Prüfschema nach reuschlaw · Langversion: beck-online" : "Source: Assessment schema by reuschlaw · Long version: beck-online",
    negSteps: de ? [
      { label: "Schritt 1 — Nebentätigkeit", q: "Stellt die betreffende Tätigkeit (WZ 26-30) für Ihre Einrichtung lediglich eine Nebentätigkeit dar?", hint: "Eine Nebentätigkeit liegt vor, wenn der Schwerpunkt der Unternehmenstätigkeit eindeutig in einem anderen Bereich liegt.", warn: "Oft keine Nebentätigkeit wenn:\n- Die Tätigkeit im Gesellschaftsvertrag ausdrücklich genannt ist.\n- Die Tätigkeit allein die Schwellenwerte (>= 50 MA oder >= 10 Mio. EUR Umsatz) überschreitet.", yes: "Ja — es ist eine Nebentätigkeit", no: "Nein — es ist eine Kerntätigkeit" },
      { label: "Schritt 2 — Geringfügigkeit", q: "Ist diese Nebentätigkeit geringfügig?", hint: "Geringfügigkeit liegt vor, wenn Umsatz, Mitarbeiterzahl und strategische Bedeutung der Nebentätigkeit deutlich untergeordnet sind.", warn: null, yes: "Ja — die Nebentätigkeit ist geringfügig", no: "Nein — die Nebentätigkeit ist nicht geringfügig" },
      { label: "Schritt 3 — Unverhältnismäßigkeit", q: "Liegen Anhaltspunkte für eine Unverhältnismäßigkeit vor?", hint: "Dies kann z. B. der Fall sein, wenn der Compliance-Aufwand den Nutzen klar übersteigt.", warn: null, yes: "Ja — Unverhältnismäßigkeit ist anzunehmen", no: "Nein — keine Anhaltspunkte" },
    ] : [
      { label: "Step 1 — Secondary Activity", q: "Does the relevant activity (WZ 26-30) constitute only a secondary activity for your entity?", hint: "A secondary activity exists if the primary focus of the company is clearly in a different area.", warn: "Often not a secondary activity if:\n- The activity is expressly mentioned in the articles of association.\n- The activity alone exceeds the thresholds (>= 50 FTE or >= EUR 10m turnover).", yes: "Yes — it is a secondary activity", no: "No — it is a core activity" },
      { label: "Step 2 — Insignificance", q: "Is this secondary activity insignificant?", hint: "Insignificance applies if turnover, headcount and strategic importance are clearly subordinate.", warn: null, yes: "Yes — the secondary activity is insignificant", no: "No — the secondary activity is not insignificant" },
      { label: "Step 3 — Disproportionality", q: "Are there indications that classifying the entity as regulated would be disproportionate?", hint: "This may apply if compliance costs clearly outweigh the regulatory benefit.", warn: null, yes: "Yes — disproportionality is likely", no: "No — no indications of disproportionality" },
    ],
    negResultNeg: de ? "Möglicherweise vernachlässigbar: Alle drei Kriterien sind erfüllt. Eine abschließende rechtliche Bewertung ist zwingend erforderlich." : "Possibly negligible: All three criteria are met. A final legal assessment is mandatory.",
    negResultPos: de ? "Nicht vernachlässigbar: Mindestens ein Kriterium ist nicht erfüllt. Ihre Einrichtung bleibt im Anwendungsbereich des BSIG 2025." : "Not negligible: At least one criterion is not met. Your entity remains within scope of BSIG 2025.",
    itIndepBlockedTitle:  de ? "IT-Selbständigkeit — nicht gegeben" : "IT Independence — not applicable",
    itIndepBlockedText:   de ? "Da Ihre Gesellschaft von der zentralen IT einer Konzern- oder Muttergesellschaft abhängig ist, ist eine IT-Selbständigkeit nach § 28 Abs. 4 BSIG 2025 bereits ausgeschlossen." : "Since your entity depends on central IT services of a group or parent company, IT independence under § 28 Para. 4 BSIG 2025 is already excluded.",
    itIndepBlockedReason: de ? "IT-Selbständigkeit setzt voraus, dass die Einrichtung eigene IT-Systeme betreibt und eigenständig über deren Beschaffung, Betrieb und Sicherheit entscheiden kann. Eine faktische Abhängigkeit von der Konzern-IT schließt dies aus — die Schwellenwertprüfung muss daher konzernweit unter Einbeziehung aller verbundenen Unternehmen erfolgen." : "IT independence requires that the entity operates its own IT systems and can independently decide on their procurement, operation and security. Factual dependency on group IT excludes this — the threshold assessment must therefore be conducted group-wide, including all affiliated companies.",
    itIndepBlockedSrc:    de ? "Rechtsgrundlage: § 28 Abs. 4 BSIG 2025 · Size-Cap-Rule" : "Legal basis: § 28 Para. 4 BSIG 2025 · Size-cap rule",
    itIndep: {
      title:          de ? "Prüfschritt: IT-Selbständigkeit (§ 28 Abs. 4 BSIG 2025)" : "Check: IT Independence (§ 28 Para. 4 BSIG 2025)",
      intro:          de ? "Bestimmen Sie, ob Ihre Einrichtung als IT-selbständig gilt. Das Ergebnis entscheidet, ob bei der Schwellenwertberechnung (Size-Cap-Rule) nur eigene oder auch Daten verbundener Unternehmen herangezogen werden." : "Determine whether your entity qualifies as IT-independent. The result decides whether only your own data or also data from affiliated companies must be used for the size-cap threshold calculation.",
      basis:          de ? "Rechtsgrundlage: § 28 Abs. 4 BSIG 2025 · Schwellenwertberechnung (Size-Cap-Rule)" : "Legal basis: § 28 Para. 4 BSIG 2025 · Size-cap threshold calculation",
      yes: de ? "Ja" : "Yes", no: de ? "Nein" : "No",
      yesRF: de ? "Ja — trifft zu" : "Yes — applies", noRF: de ? "Nein — trifft nicht zu" : "No — does not apply",
      resultIndep:    de ? "IT-selbständig: Das Unternehmen wird als Einzelunternehmen gewertet. Nur eigene Mitarbeiter (VZÄ) und Umsätze zählen für die Schwellenwertberechnung nach § 28 BSIG 2025." : "IT-independent: The entity is assessed as a standalone company. Only its own employees (FTE) and turnover count for the threshold calculation under § 28 BSIG 2025.",
      resultNotIndep: de ? "Nicht IT-selbständig: Die Daten aller verbundenen Unternehmen werden zu 100 % addiert — einschließlich Unternehmen außerhalb der EU. Die Schwellenwertprüfung muss konzernweit erfolgen." : "Not IT-independent: Data from all affiliated companies must be aggregated at 100% — including companies outside the EU. The threshold assessment must be conducted at group level.",
      resultPartial:  de ? "Gemischtes Bild — rechtliche Bewertung erforderlich: Einzelne Kriterien sprechen gegen IT-Selbständigkeit. Eine abschließende Beurteilung durch qualifizierte Rechtsberatung ist zwingend erforderlich." : "Mixed picture — legal assessment required: Some criteria indicate a lack of IT independence. A final assessment by qualified legal advisors is mandatory.",
      redFlagNote:    de ? "Mindestens ein Ausschlusskriterium (Red Flag) ist erfüllt — IT-Selbständigkeit ist ausgeschlossen." : "At least one exclusion criterion (red flag) is met — IT independence is excluded.",
      reasonOverHalf: de ? "Auslöser: In mindestens einem Bereich sind mehr als 50 % der Kriterien negativ — konzernweite Schwellenwertprüfung erforderlich." : "Trigger: More than 50% of criteria in at least one section are negative — group-wide threshold assessment required.",
      reasonAllSecs:  de ? "Auslöser: In jedem der drei Bereiche liegt mindestens ein negatives Kriterium vor — konzernweite Schwellenwertprüfung erforderlich." : "Trigger: Every section contains at least one negative criterion — group-wide threshold assessment required.",
      reasonPartial:  de ? "Mehr als ein negatives Kriterium insgesamt, aber kein einzelner Bereich überschreitet 50 % und nicht alle Bereiche sind betroffen. Abschließende rechtliche Bewertung erforderlich." : "More than one negative criterion in total, but no single section exceeds 50% and not all sections are affected. A final legal assessment is required.",
      sections: de ? [
        { id: "s1", label: "1. Entscheidungsgewalt (Rechtlich / Wirtschaftlich)", questions: [
          { id: "q1", q: "Eigenständige IT-Beschaffung: Kann die Einrichtung autonom über den Erwerb von IT-Systemen und -Komponenten entscheiden?", hint: "Ja = kein konzernweiter Zustimmungsvorbehalt, keine verbindlichen Einkaufsvorgaben der Muttergesellschaft." },
          { id: "q2", q: "Eigener IT-Haushalt: Besteht wirtschaftliche Unabhängigkeit bei der Budgetierung von IT-Investitionen und -Betriebskosten?", hint: "Ja = eigenes genehmigtes IT-Budget; keine vollständige Abhängigkeit von konzernzentraler Budgetzuteilung." },
          { id: "q3", q: "Keine vertragliche Bindung: Bestehen keine Konzernvorgaben oder Beherrschungsverträge, die zur ausschließlichen Nutzung zentraler IT-Dienste zwingen?", hint: "Ja = keine Pflicht zur Nutzung der Konzern-IT; freie Anbieterwahl ist tatsächlich möglich." },
        ]},
        { id: "s2", label: "2. Technische Beschaffenheit (Tatsächlich)", questions: [
          { id: "q4", q: "Systemtrennung: Verfügt die Einrichtung über eigene, getrennte IT-Infrastrukturen (z.B. eigenes Active Directory, eigene ERP-Instanzen, eigene Netzsegmentierung)?", hint: "Ja = keine gemeinsam genutzten zentralen Systeme für Kernanwendungen der Einrichtung." },
          { id: "q5", q: "Eigenständige physische Infrastruktur: Verfügt die Einrichtung über eigenständige physische Ressourcen (Gebäude, Stromversorgung, Rechenzentrum) ohne wesentliche Abhängigkeit von der Muttergesellschaft?", hint: "Ja = keine geteilten kritischen Ressourcen; geteilte Ressourcen sind ein Indiz gegen IT-Selbständigkeit." },
          { id: "q6", q: "Hardware-Hoheit: Befinden sich die physischen oder virtuellen Komponenten unter der ausschließlichen Kontrolle der Einrichtung?", hint: "Ja = eigene physische Infrastruktur oder dedizierte virtuelle Ressourcen; kein Shared Hosting durch die Konzern-IT." },
        ]},
        { id: "s3", label: "3. Betrieb (Operationell)", questions: [
          { id: "q7", q: "Betriebshoheit: Werden Konfiguration, Administration und Wartung der IT-Systeme vollständig unabhängig von der Konzern-IT durchgeführt?", hint: "Ja = eigene IT-Abteilung oder eigenständig beauftragter externer Dienstleister ohne konzernweite Vorgaben." },
          { id: "q8", q: "Kein konzerninterner MSP: Werden keine wesentlichen IT-Dienstleistungen durch ein verbundenes Unternehmen erbracht, das faktisch als Managed Service Provider agiert?", hint: "Hinweis: Gibt die Konzern-IT den Betrieb vollständig vor und hat die Einrichtung keinen bestimmenden Einfluss auf die Sicherheitsprozesse, liegt keine IT-Selbständigkeit vor." },
        ]},
        { id: "s4", label: "4. Ausschlusskriterien (Red Flags)", isRedFlag: true, questions: [
          { id: "q9",  q: "Passiver Konsument: Ist die Einrichtung lediglich passiver Konsument zentraler Gruppendienste ohne jegliche Steuerungsoption?", hint: "Ja = automatisch keine IT-Selbständigkeit." },
          { id: "q10", q: "Faktische Untrennbarkeit: Besteht eine so hohe Kritikalität der zentralen IT-Dienste für den Kernbetrieb, dass eine Trennung faktisch unmöglich wäre?", hint: "Ja = automatisch keine IT-Selbständigkeit." },
        ]},
      ] : [
        { id: "s1", label: "1. Decision-Making Authority (Legal / Economic)", questions: [
          { id: "q1", q: "Independent IT procurement: Can the entity autonomously decide on the acquisition of IT systems and components?", hint: "Yes = no group-level approval requirements or mandatory procurement guidelines from the parent company." },
          { id: "q2", q: "Own IT budget: Does the entity have economic independence in budgeting IT investments and operating costs?", hint: "Yes = own approved IT budget; no full dependency on group-central budget allocation." },
          { id: "q3", q: "No contractual binding: Are there no group directives or domination agreements requiring exclusive use of central IT services?", hint: "Yes = no obligation to use group IT; free choice of providers is practically possible." },
        ]},
        { id: "s2", label: "2. Technical Configuration (Factual)", questions: [
          { id: "q4", q: "System separation: Does the entity have its own, separate IT infrastructure (e.g. own Active Directory, own ERP instances, own network segmentation)?", hint: "Yes = no shared central systems for the entity's core applications." },
          { id: "q5", q: "Independent physical infrastructure: Does the entity have its own physical resources (buildings, power supply, data centre) without significant dependency on the parent company?", hint: "Yes = no shared critical resources; shared resources are an indicator against IT independence." },
          { id: "q6", q: "Hardware control: Are the physical or virtual components under the exclusive control of the entity?", hint: "Yes = own physical infrastructure or dedicated virtual resources; no shared hosting by group IT." },
        ]},
        { id: "s3", label: "3. Operations (Operational)", questions: [
          { id: "q7", q: "Operational autonomy: Are configuration, administration and maintenance of IT systems carried out entirely independently of group IT?", hint: "Yes = own IT department or independently contracted external service provider without group-wide mandates." },
          { id: "q8", q: "No intra-group MSP: Are no significant IT services provided by an affiliated company acting as Managed Service Provider?", hint: "Note: If group IT fully dictates operations and the entity has no determining influence on security processes, IT independence does not exist." },
        ]},
        { id: "s4", label: "4. Exclusion Criteria (Red Flags)", isRedFlag: true, questions: [
          { id: "q9",  q: "Passive consumer: Is the entity merely a passive consumer of central group services without any control option?", hint: "Yes = automatically no IT independence." },
          { id: "q10", q: "Factual inseparability: Is there such a high criticality of central IT services for core operations that separation would be factually impossible?", hint: "Yes = automatically no IT independence." },
        ]},
      ],
    },
    thresh: {
      title:      de ? "Prüfschritt: Schwellenwerte (Size-Cap-Rule)" : "Check: Thresholds (Size-Cap-Rule)",
      intro:      de ? "Stellen Sie auf Basis Ihrer Unternehmensgröße und Konzernstruktur fest, ob Sie als wichtige Einrichtung (wE) oder besonders wichtige Einrichtung (bwE) eingestuft werden. Grundlage ist der letzte genehmigte Jahresabschluss." : "Determine on the basis of your company size and group structure whether you are classified as an important entity (IE) or particularly important entity (PIE). The basis is the last approved annual financial statement.",
      basis:      de ? "Rechtsgrundlage: § 28 Abs. 1–4 BSIG 2025 · EU-Empfehlung 2003/361/EG" : "Legal basis: § 28 Para. 1–4 BSIG 2025 · EU Recommendation 2003/361/EC",
      ownDataTitle:  de ? "Eigene Unternehmensdaten" : "Own company data",
      ownDataNote:   de ? "Berechnung in Jahresarbeitseinheiten (JAE). VZ-Kräfte = 1, TZ-Kräfte anteilig. Auszubildende und Mitarbeiter in Elternzeit zählen nicht mit." : "Calculated in annual work units (AWU). Full-time = 1, part-time proportional. Trainees and employees on parental leave are excluded.",
      empLabel:   de ? "Mitarbeiter (JAE / VZÄ)" : "Employees (AWU / FTE)",
      empPh:      de ? "z.B. 180" : "e.g. 180",
      turnLabel:  de ? "Jahresumsatz (Mio. €, netto)" : "Annual turnover (M€, net)",
      turnPh:     de ? "z.B. 42,5" : "e.g. 42.5",
      balLabel:   de ? "Jahresbilanzsumme (Mio. €)" : "Annual balance sheet total (M€)",
      balPh:      de ? "z.B. 28,0" : "e.g. 28.0",
      affTitle:   de ? "Verbundene Unternehmen (100 % Addierung)" : "Affiliated companies (100% aggregation)",
      affNote:    de ? "Gemäß § 28 Abs. 4 BSIG 2025 und EU-Empfehlung 2003/361/EG sind Daten aller verbundenen Unternehmen (> 50 % Stimmrechte) vollständig hinzuzurechnen — einschließlich Unternehmen außerhalb der EU." : "Pursuant to § 28 Para. 4 BSIG 2025 and EU Recommendation 2003/361/EC, data of all affiliated companies (> 50% voting rights) must be fully aggregated — including companies outside the EU.",
      partTitle:  de ? "Partnerunternehmen (proportionale Addierung)" : "Partner companies (proportional aggregation)",
      partNote:   de ? "Partnerunternehmen (25–50 % Beteiligung) werden proportional zum Beteiligungsanteil hinzugerechnet." : "Partner companies (25–50% stake) are added proportionally to the shareholding.",
      partEmpPh:  de ? "MA" : "FTE", partTurnPh: de ? "Umsatz Mio. €" : "Turnover M€",
      partBalPh:  de ? "Bilanz Mio. €" : "Balance M€", partPctPh: de ? "Anteil %" : "Stake %",
      addPartner: de ? "+ Partnerunternehmen hinzufügen" : "+ Add partner company",
      removePartner: de ? "Entfernen" : "Remove",
      itIndepNote:   de ? "IT-Selbständigkeit bestätigt — nur eigene Daten werden berücksichtigt." : "IT independence confirmed — only own data is used.",
      itPartialNote: de ? "Gemischtes Bild bei IT-Selbständigkeit — zur Sicherheit werden Daten verbundener Unternehmen empfohlen." : "Mixed IT independence picture — including affiliated company data is recommended for safety.",
      itUnknownNote: de ? "IT-Selbständigkeit noch nicht geprüft — es werden nur eigene Daten ausgewiesen. Bitte den vorherigen Prüfschritt abschließen." : "IT independence not yet assessed — showing own data only. Please complete the previous check step.",
      totalTitle: de ? "Berechnete Gesamtwerte" : "Calculated totals",
      totalEmp:   de ? "Gesamt-JAE" : "Total AWU",
      totalTurn:  de ? "Gesamtumsatz (Mio. €)" : "Total turnover (M€)",
      totalBal:   de ? "Gesamtbilanz (Mio. €)" : "Total balance (M€)",
      resultBWE:      de ? "Einstufung: Besonders wichtige Einrichtung (bwE)" : "Classification: Particularly Important Entity (PIE)",
      resultBWEText:  de ? "Ihre Einrichtung erfüllt die Schwellenwerte für eine besonders wichtige Einrichtung nach § 28 Abs. 1 BSIG 2025. Es gelten erhöhte Aufsichts- und Meldepflichten. Registrierungspflicht beim BSI innerhalb von 3 Monaten nach Einstufung." : "Your entity meets the thresholds for a particularly important entity under § 28 Para. 1 BSIG 2025. Enhanced supervision and reporting obligations apply. Registration with BSI within 3 months of classification.",
      resultWE:       de ? "Einstufung: Wichtige Einrichtung (wE)" : "Classification: Important Entity (IE)",
      resultWEText:   de ? "Ihre Einrichtung erfüllt die Schwellenwerte für eine wichtige Einrichtung nach § 28 Abs. 2 BSIG 2025. Registrierungspflicht und Risikomanagementpflichten gelten. Die Aufsicht erfolgt in der Regel anlassbezogen." : "Your entity meets the thresholds for an important entity under § 28 Para. 2 BSIG 2025. Registration and risk management obligations apply. Supervision is generally event-driven.",
      resultBelow:    de ? "Unterhalb der Schwellenwerte — kein regulärer NIS-2-Anwendungsbereich" : "Below thresholds — outside regular NIS-2 scope",
      resultBelowText: de ? "Ihre Einrichtung liegt unterhalb der Schwellenwerte des BSIG 2025, sofern Sie kein KRITIS-Betreiber oder Spezialanbieter sind. Präventive Cybersicherheitsmaßnahmen werden dennoch empfohlen." : "Your entity falls below the BSIG 2025 thresholds, unless you are a KRITIS operator or specialist provider. Preventive cybersecurity measures are nonetheless recommended.",
      capNote:        de ? "Hinweis: Da kein MSP-Risiko identifiziert wurde, ist die Einstufung auf wichtige Einrichtung (wE) begrenzt — auch wenn bwE-Schwellenwerte rechnerisch erreicht werden." : "Note: Since no MSP risk was identified, classification is capped at important entity (IE) — even if PIE thresholds are mathematically reached.",
      stabilityNote:  de ? "Stabilitätsregel (§ 28 Abs. 5 BSIG 2025): Ein Statuswechsel tritt erst ein, wenn die Schwellenwerte in zwei aufeinanderfolgenden Geschäftsjahren über- oder unterschritten werden." : "Stability rule (§ 28 Para. 5 BSIG 2025): A status change only occurs when thresholds are exceeded or fallen below in two consecutive financial years.",
      noDataNote:     de ? "Bitte mindestens die Mitarbeiterzahl oder den Jahresumsatz eingeben, um die Einstufung zu berechnen." : "Please enter at least the employee count or annual turnover to calculate the classification.",
    },
    nextSteps: de ? "Empfohlene nächste Schritte" : "Recommended next steps",
    stepsIn: de ? [
      "✅ MSP-/Konzernstrukturprüfung: Im Tool oben durchgeführt — bei identifiziertem Risiko unverzüglich qualifizierte Rechtsberatung einholen.",
      "✅ Vernachlässigbarkeitsprüfung: Im Tool oben durchgeführt — Ergebnis rechtlich bewerten, schriftlich dokumentieren und im internen Compliance-Verzeichnis ablegen.",
      "✅ IT-Selbständigkeit: Im Tool oben geprüft — Ergebnis rechtlich bewerten und dokumentieren.",
      "✅ Schwellenwertprüfung: Im Tool oben durchgeführt — Ergebnis rechtlich validieren und dokumentieren.",
      "Betroffenheitsprüfung abschließen: Alle Prüfschritte zusammenführen und durch qualifizierte IT-Sicherheits- und Rechtsberatung validieren sowie dokumentieren.",
      "Beim BSI registrieren — spätestens 3 Monate nach Einstufung als wichtige oder besonders wichtige Einrichtung (§ 33 BSIG 2025).",
      "Sicherheitsrahmen auswählen und implementieren: BSI IT-Grundschutz, VdS 10000 / VdS 3473, ISIS12, ISO/IEC 27001 oder IEC 62443 (OT/Produktion).",
      "VDMA kontaktieren: sektorspezifische Auslegungshilfen, Mustervorlagen und NIS-2-Veranstaltungen nutzen.",
    ] : [
      "✅ MSP / group structure check: Completed above — if a risk was identified, seek qualified legal advice without delay.",
      "✅ Negligibility check: Completed above — have the result legally assessed, documented in writing and filed in your internal compliance register.",
      "✅ IT independence: Assessed above — have the result legally evaluated and documented.",
      "✅ Threshold check: Completed above — have the result legally validated and documented.",
      "Complete the applicability assessment: consolidate all checks and have the results validated and documented by qualified IT security and legal advisors.",
      "Register with BSI — within 3 months of classification as an important or particularly important entity (§ 33 BSIG 2025).",
      "Select and implement a security framework: BSI IT-Grundschutz, VdS 10000 / VdS 3473, ISIS12, ISO/IEC 27001 or IEC 62443 (OT/production).",
      "Contact VDMA for sector-specific guidance, template documents and NIS-2 events.",
    ],
    stepsOut: de ? [
      "✅ MSP-/Konzernstrukturprüfung: Im Tool oben durchgeführt — bei identifiziertem Risiko unverzüglich qualifizierte Rechtsberatung einholen.",
      "Anlage 1 und alle weiteren Anlagen des BSIG 2025 auf andere einschlägige Sektoren prüfen — Rechtsberatung empfohlen.",
      "Ergebnis schriftlich dokumentieren und im internen Compliance-Verzeichnis ablegen.",
      "Präventive Cybersicherheitsmaßnahmen implementieren: BSI IT-Grundschutz, VdS 10000 / VdS 3473, ISIS12, ISO/IEC 27001 oder IEC 62443 (OT).",
      "BSI-Infopakete und VDMA-Hilfen als Orientierung für freiwillige Maßnahmen nutzen.",
    ] : [
      "✅ MSP / group structure check: Completed above — if a risk was identified, seek qualified legal advice.",
      "Check Annex 1 and all other annexes of BSIG 2025 for other applicable sectors — legal advice recommended.",
      "Document the result in writing and file it in your internal compliance register.",
      "Implement preventive cybersecurity measures: BSI IT-Grundschutz, VdS 10000 / VdS 3473, ISIS12, ISO/IEC 27001 or IEC 62443 (OT).",
      "Use BSI info packages and VDMA guidance as orientation for voluntary measures.",
    ],
    resTitle:  de ? "Weiterführende Quellen & Hilfen" : "Further Resources & Guidance",
    resGroups: de ? [
      { label: "Gesetz & Begründung", items: [
        { icon: "balance", title: "BSIG 2025 — Verabschiedetes Gesetz", sub: "Volltext auf gesetze-im-internet.de", href: BSIG_BASE },
        { icon: "format_list_bulleted", title: "Erwägungsgründe (reuschlaw)", sub: "bsi-gesetz.de — strukturierte Übersicht", href: REUSCHLAW },
        { icon: "description", title: "BT-Drucksache 21/1501", sub: "Offizielle Gesetzesbegründung", href: BT_DRSACHE },
        { icon: "menu_book", title: "Vernachlässigbarkeit — Langversion (beck-online)", sub: "Vollständiges Prüfschema", href: BECK_NEG_URL },
      ]},
      { label: "BSI — Regulierungsbehörde", items: [
        { icon: "security", title: "BSI-Infopakete für regulierte Einrichtungen", sub: "Leitfäden, Checklisten, Formulare", href: BSI_INFOPAKET },
      ]},
      { label: "VDMA — Branchenverband Maschinenbau", items: [
        { icon: "factory", title: "VDMA-Hilfen für betroffene Maschinenbauer", sub: "Praxisleitfäden, Muster, Ansprechpartner", href: VDMA_HILFEN },
        { icon: "event", title: "VDMA-Veranstaltungen zu NIS-2", sub: "Seminare, Webinare, Workshops", href: VDMA_EVENTS },
      ]},
      { label: "DESTATIS — WZ-Klassifikation", items: [
        { icon: "analytics", title: "WZ 2008 — Vollständige Klassifikation (PDF)", sub: "Amtliche DESTATIS-Ausgabe", href: DESTATIS_PDF },
        { icon: "list_alt", title: "WZ 2008 — Alphabetisches Stichwortverzeichnis (XLSX)", sub: "Suche nach Produkten / Tätigkeiten", href: DESTATIS_XLSX },
      ]},
    ] : [
      { label: "Law & Explanatory Memorandum", items: [
        { icon: "balance", title: "BSIG 2025 — Enacted Law", sub: "Full text at gesetze-im-internet.de", href: BSIG_BASE },
        { icon: "format_list_bulleted", title: "Recitals overview (reuschlaw)", sub: "bsi-gesetz.de — structured overview", href: REUSCHLAW },
        { icon: "description", title: "BT-Drucksache 21/1501", sub: "Official explanatory memorandum", href: BT_DRSACHE },
        { icon: "menu_book", title: "Negligibility — Long version (beck-online)", sub: "Full assessment schema", href: BECK_NEG_URL },
      ]},
      { label: "BSI — Regulatory Authority", items: [
        { icon: "security", title: "BSI Information Packages for Regulated Entities", sub: "Guides, checklists, forms", href: BSI_INFOPAKET },
      ]},
      { label: "VDMA — Machinery Industry Association", items: [
        { icon: "factory", title: "VDMA Guidance for Affected Machinery Manufacturers", sub: "Practical guides, templates, contacts", href: VDMA_HILFEN },
        { icon: "event", title: "VDMA NIS-2 Events", sub: "Seminars, webinars, workshops", href: VDMA_EVENTS },
      ]},
      { label: "DESTATIS — WZ Classification", items: [
        { icon: "analytics", title: "WZ 2008 — Full Classification (PDF)", sub: "Official DESTATIS edition", href: DESTATIS_PDF },
        { icon: "list_alt", title: "WZ 2008 — Alphabetical Keyword Index (XLSX)", sub: "Search by product / activity", href: DESTATIS_XLSX },
      ]},
    ],
    mspHintTitle: de ? "KI-Ersthinweis: Managed Service Provider erkannt" : "AI first hint: Managed Service Provider detected",
    mspHintText:  de ? "Die Produktanalyse deutet darauf hin, dass es sich um einen IT-Dienstleister / MSP handelt. Eine Einstufung unter Anlage 1 Nr. 6.1.10 BSIG 2025 als Managed Service Provider ist sehr wahrscheinlich. Bitte den MSP-Prüfschritt unten sorgfältig durchführen." : "The product analysis indicates that this is an IT service provider / MSP. Classification under Annex 1 No. 6.1.10 BSIG 2025 as a Managed Service Provider is very likely. Please carefully complete the MSP check below.",
    mspHintBasis: de ? "Rechtsgrundlage: § 2 Nr. 26 i.V.m. Anlage 1 Nr. 6.1.10 BSIG 2025" : "Legal basis: § 2 No. 26 in conjunction with Annex 1 No. 6.1.10 BSIG 2025",
    wzInvalid:    de ? "Bitte gültige WZ-Nummer eingeben (z.B. 28 oder 28.41)." : "Please enter a valid WZ code (e.g. 28 or 28.41).",
    wzNotFound:   de ? "Die WZ-Nummer {wz} existiert nicht in der DESTATIS-Klassifikation WZ 2008." : "WZ code {wz} does not exist in the DESTATIS WZ 2008 classification.",
    errRateLimit: de ? "API-Limit erreicht. Bitte kurz warten und erneut versuchen." : "API rate limit reached. Please wait a moment and try again.",
    errAuth:      de ? "Authentifizierungsfehler. Bitte Claude-Konto prüfen." : "Authentication error. Please check your Claude account.",
    errAborted:   de ? "Analyse abgebrochen." : "Analysis cancelled.",
    errPhase1:    de ? "Unternehmenssuche fehlgeschlagen. Bitte Firmennamen prüfen oder nur Produkte eingeben." : "Company lookup failed. Please check the company name or enter products only.",
    gpHitsTitle:  de ? "GP 2019 Güterverzeichnis — geprüfte Katalogeinträge" : "GP 2019 product catalogue — entries checked",
    gpHitsHint:   de ? "Treffer aus dem amtlichen Güterverzeichnis (Statistisches Bundesamt, Abt. 25–30). Die Meldenummer trägt die WZ-Klasse in den ersten vier Ziffern — damit lässt sich die Einstufung direkt im Original-PDF nachschlagen." : "Hits from the official Destatis product index (div. 25–30). The Meldenummer carries the WZ class in its first four digits, so the classification can be checked directly against the original PDF.",
    gpOutOfScope: de ? "außerhalb Anlage 2 Nr. 5" : "outside Annex 2 No. 5",
    candidatesH:  de ? "Mehrere mögliche Firmen gefunden" : "Multiple possible companies found",
    candidatesB:  de ? "Der eingegebene Name konnte nicht eindeutig einem einzelnen deutschen Unternehmen zugeordnet werden. Bitte wählen Sie die gemeinte Firma, um die Analyse mit der korrekten Zuordnung fortzusetzen." : "The name you entered couldn't be unambiguously mapped to a single German company. Please pick the intended one to re-run the analysis with the correct identity.",
    candidatesCancel: de ? "Abbrechen" : "Cancel",
    errPhase2:    de ? "WZ-Klassifikation fehlgeschlagen. Bitte erneut versuchen." : "WZ classification failed. Please try again.",
    reset:        de ? "Neue Prüfung" : "New check",
    disclaimer:   de ? "Erstorientierung — ersetzt keine Rechts- oder Fachberatung. Rechtsstand: BSIG 2025 (in Kraft seit 6. Dezember 2025) · DESTATIS WZ 2008." : "For initial orientation only — does not replace legal or specialist advice. Legal status: BSIG 2025 (in force since 6 December 2025) · DESTATIS WZ 2008.",
  };
}

// ── Styles ────────────────────────────────────────────────────────────────────
var S = {
  lbl:  { fontWeight: 600, fontSize: 11.5, color: "#222F5C", marginBottom: 6, textTransform: "uppercase", letterSpacing: .6, display: "block", fontFamily: "'Jost', 'Poppins', sans-serif" },
  inp:  { width: "100%", padding: "10px 14px", borderRadius: 4, border: "1.5px solid #E3E3E6", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none" },
  pri:  { background: "#222F5C", color: "#fff", border: "none", borderRadius: 4, padding: "10px 24px", cursor: "pointer", fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Jost', 'Poppins', sans-serif" },
  sec:  { background: "#E3E3E6", color: "#222F5C", border: "none", borderRadius: 4, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "'Jost', 'Poppins', sans-serif" },
  pill: function(bg, col) { return { display: "inline-flex", alignItems: "center", gap: 5, background: bg, borderRadius: 3, padding: "3px 10px", fontSize: 12, fontWeight: 600, color: col, fontFamily: "'Jost', 'Poppins', sans-serif" }; },
  link: function(col) { return { fontSize: 12.5, color: col || "#324C9C", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }; },
  card: function(border, bg) { return { background: bg || "#fff", borderRadius: 6, border: "1.5px solid " + (border || "#E3E3E6"), padding: "14px 16px" }; },
  numInp: { padding: "8px 12px", borderRadius: 4, border: "1.5px solid #E3E3E6", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none", width: "100%", textAlign: "right" },
};

var CONF_COL = { hoch: "#38a169", mittel: "#d69e2e", niedrig: "#e53e3e", "sehr niedrig": "#e53e3e", high: "#38a169", medium: "#d69e2e", low: "#e53e3e", "very low": "#e53e3e" };
var SRC_META = {
  northdata:            { icon: "business",        bg: "#dbeafe", col: "#324C9C" },
  "handelsregister.ai": { icon: "account_balance", bg: "#ede9fe", col: "#324C9C" },
  destatis:             { icon: "analytics",       bg: "#ECFDF3", col: "#166534" },
  products:             { icon: "settings",        bg: "#fef9c3", col: "#854d0e" },
  direct:               { icon: "edit",            bg: "#f3f4f6", col: "#374151" },
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

function NumInput({ value, onChange, placeholder, min, step }) {
  return (
    <input type="number" value={value} onChange={function(e) { onChange(e.target.value); }}
      placeholder={placeholder} min={min || 0} step={step || "any"} style={S.numInp}/>
  );
}

function ProgressStepper({ step, labels }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
      {labels.map(function(lbl, i) {
        var done = i < step, current = i === step;
        var col = done ? "#38a169" : current ? "#222F5C" : "#9ca3af";
        var bg  = done ? "#ECFDF3" : current ? "#dbeafe" : "#f3f4f6";
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < labels.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: bg, border: "2px solid " + col, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {done ? <MI name="check" size={14} color="#166534"/>
                      : current ? <Spin />
                      : <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af" }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: 12, fontWeight: current ? 700 : 400, color: col, whiteSpace: "nowrap" }}>{lbl}</span>
            </div>
            {i < labels.length - 1 && <div style={{ flex: 1, height: 2, background: done ? "#86efac" : "#E3E3E6", margin: "0 8px" }}/>}
          </div>
        );
      })}
    </div>
  );
}

function WzHelpAccordion({ t, lang, open, setOpen }) {
  return (
    <div style={{ borderRadius: 8, border: "1px solid #dbeafe", overflow: "hidden" }}>
      <button onClick={function() { setOpen(function(o) { return !o; }); }} aria-expanded={open}
        style={{ width: "100%", background: open ? "#eff6ff" : "#f8fafc", border: "none", padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#324C9C", display: "inline-flex", alignItems: "center", gap: 6 }}><MI name="info" size={16} color="#324C9C"/>{t.wzHelp.trigger}</span>
        <span style={{ fontSize: 14, color: "#324C9C", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
      </button>
      {open && (
        <div style={{ background: "#fff", padding: "14px 16px", borderTop: "1px solid #dbeafe" }}>
          <div style={{ background: "#eff6ff", borderRadius: 7, padding: "10px 13px", marginBottom: 12, borderLeft: "3px solid #3b82f6" }}>
            <p style={{ fontSize: 13, color: "#1e3a5f", margin: "0 0 10px", lineHeight: 1.6 }}>{t.wzHelp.legal}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, flexShrink: 0 }}>{lang === "de" ? "Beispiele:" : "Examples:"}</span>
              {[["28.41", "Werkzeugmaschinen"], ["26.51", "Messtechnik"], ["27.12", "Schaltanlagen"]].map(function(ex) {
                return (
                  <div key={ex[0]} style={{ background: "#fff", border: "1.5px solid #bfdbfe", borderRadius: 7, padding: "4px 10px", display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontWeight: 900, fontSize: 14, color: "#222F5C", fontFamily: "monospace" }}>{ex[0]}</span>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{ex[1]}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ background: "#f0fdf4", borderRadius: 7, padding: "10px 13px", marginBottom: 12, borderLeft: "3px solid #4ade80" }}>
            <p style={{ fontSize: 13, color: "#14532d", margin: 0, lineHeight: 1.6 }}>{t.wzHelp.stat}</p>
          </div>
          <div style={{ background: "#FFF7E6", borderRadius: 7, padding: "10px 13px", marginBottom: 12, borderLeft: "3px solid #f59e0b" }}>
            <p style={{ fontSize: 13, color: "#B45309", margin: 0, lineHeight: 1.65, fontWeight: 500, display: "flex", alignItems: "flex-start", gap: 6 }}><MI name="lightbulb" size={16} color="#F97F08"/><span>{t.wzHelp.tip}</span></p>
          </div>
          <div style={{ background: "#fff1f2", borderRadius: 7, padding: "10px 13px", marginBottom: 10, borderLeft: "3px solid #f87171" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", margin: "0 0 5px", display: "flex", alignItems: "center", gap: 6 }}><MI name="warning" size={14} color="#991b1b"/>{lang === "de" ? "Achtung: Meldedaten können veraltet sein" : "Caution: Reported data may be outdated"}</p>
            <p style={{ fontSize: 12.5, color: "#7f1d1d", margin: 0, lineHeight: 1.65 }}>{t.wzHelp.warn}</p>
          </div>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>{t.wzHelp.src}</p>
        </div>
      )}
    </div>
  );
}

function ResourcesSection({ t, compact }) {
  return (
    <div style={{ padding: compact ? "16px 0 0" : "0", background: "transparent" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: compact ? 10 : 14 }}>
        <MI name="menu_book" size={compact ? 16 : 20} color="#222F5C"/>
        <span style={{ fontWeight: 800, fontSize: compact ? 13 : 14, color: "#222F5C" }}>{t.resTitle}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 12 : 16 }}>
        {t.resGroups.map(function(grp, gi) {
          return (
            <div key={gi}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 6, borderBottom: "1px solid #E3E3E6", paddingBottom: 3 }}>{grp.label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: compact ? 4 : 6 }}>
                {grp.items.map(function(item, ii) {
                  return (
                    <a key={ii} href={item.href} target="_blank" rel="noreferrer"
                      style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: compact ? "7px 10px" : "9px 12px", borderRadius: 8, background: "#fff", border: "1px solid #E3E3E6", textDecoration: "none" }}>
                      <MI name={item.icon} size={compact ? 16 : 20} color="#222F5C"/>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: compact ? 12.5 : 13, color: "#222F5C" }}>{item.title}</div>
                        <div style={{ fontSize: compact ? 11 : 12, color: "#6b7280", marginTop: 1 }}>{item.sub}</div>
                      </div>
                      <span style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af", flexShrink: 0, paddingTop: 2 }}>↗</span>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SrcSummaryCard({ t, compData, companyName }) {
  if (!compData) return null;
  var ndUrl = compData.northdata_url || (companyName ? NORTHDATA_BASE + "/?query=" + encodeURIComponent(companyName) : NORTHDATA_BASE);
  var num = compData.nace_code ? parseFloat(compData.nace_code) : null;
  var wzInScope = num !== null && num >= 26 && num < 31;
  return (
    <div style={{ padding: "20px 24px", background: "#f8fafc", borderBottom: "1px solid #E3E3E6" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <MI name="search" size={18} color="#222F5C"/>
        <span style={{ fontWeight: 800, fontSize: 14, color: "#222F5C" }}>{t.srcCompTitle}</span>
      </div>
      <p style={{ fontSize: 12.5, color: "#6b7280", margin: "0 0 12px", lineHeight: 1.5 }}>{t.srcCompNote}</p>
      {compData.gegenstand && (
        <div style={{ background: "#fff", borderRadius: 9, border: "1.5px solid #E3E3E6", padding: "12px 14px", marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>{t.colGegenstand}</div>
          <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.65, borderLeft: "3px solid #bfdbfe", paddingLeft: 10 }}>{compData.gegenstand}</p>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
        {naceFromRegister(compData) ? (
          <div style={{ background: wzInScope ? "#ecfdf5" : "#f9fafb", border: "1.5px solid " + (wzInScope ? "#86efac" : "#E3E3E6"), borderRadius: 8, padding: "10px 16px", textAlign: "center", minWidth: 110 }}>
            <div style={{ fontWeight: 900, fontSize: 26, color: wzInScope ? "#166534" : "#222F5C", lineHeight: 1 }}>{compData.nace_code}</div>
            <div style={{ fontSize: 10, background: "#ECFDF3", color: "#166534", borderRadius: 4, padding: "2px 6px", fontWeight: 700, marginTop: 5, display: "inline-flex", alignItems: "center", gap: 4 }}><MI name="check" size={12} color="#166534"/>{t.nacePresentBadge}</div>
            {WZ_LABELS[compData.nace_code] && <div style={{ fontSize: 10.5, color: "#374151", marginTop: 5, lineHeight: 1.35 }}>{WZ_LABELS[compData.nace_code]}</div>}
            {compData.nace_evidence && <div style={{ fontSize: 10, color: "#6b7280", marginTop: 5, lineHeight: 1.4, fontStyle: "italic" }}>„{compData.nace_evidence}“</div>}
          </div>
        ) : compData.nace_code ? (
          <div style={{ background: "#FFF7E6", border: "1.5px solid #FBBF24", borderRadius: 8, padding: "10px 16px", textAlign: "center", minWidth: 110 }}>
            <div style={{ fontWeight: 900, fontSize: 26, color: "#B45309", lineHeight: 1 }}>{compData.nace_code}</div>
            <div style={{ fontSize: 10, background: "#FFF7E6", color: "#B45309", borderRadius: 4, padding: "2px 6px", fontWeight: 700, marginTop: 5, display: "inline-flex", alignItems: "center", gap: 4 }}><MI name="smart_toy" size={12} color="#B45309"/>{t.naceInferredBadge}</div>
            {WZ_LABELS[compData.nace_code] && <div style={{ fontSize: 10.5, color: "#374151", marginTop: 5, lineHeight: 1.35 }}>{WZ_LABELS[compData.nace_code]}</div>}
            <div style={{ fontSize: 10, color: "#92400e", marginTop: 5, lineHeight: 1.4 }}>{t.naceInferredNote}</div>
          </div>
        ) : (
          <div style={{ background: "#FFF7E6", border: "1.5px solid #FBBF24", borderRadius: 8, padding: "10px 14px", textAlign: "center", minWidth: 110 }}>
            <div style={{ fontSize: 11, background: "#FFF7E6", color: "#B45309", borderRadius: 4, padding: "3px 7px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 4 }}><MI name="warning" size={13} color="#F97F08"/>{t.naceAbsentBadge}</div>
          </div>
        )}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {[compData.rechtsform, compData.ort].filter(Boolean).map(function(m, i) {
              return <span key={i} style={{ fontSize: 10.5, background: "#eff6ff", color: "#324C9C", borderRadius: 4, padding: "2px 7px", fontWeight: 600, border: "1px solid #bfdbfe" }}>{m}</span>;
            })}
            {compData.hr_nummer && <span style={{ fontSize: 10.5, background: "#faf5ff", color: "#324C9C", borderRadius: 4, padding: "2px 7px", fontWeight: 600, border: "1px solid #e9d5ff" }}>{compData.hr_nummer}</span>}
            {compData.amtsgericht && <span style={{ fontSize: 10.5, background: "#faf5ff", color: "#324C9C", borderRadius: 4, padding: "2px 7px", fontWeight: 600, border: "1px solid #e9d5ff" }}>AG {compData.amtsgericht}</span>}
          </div>
          {compData.products && (
            <div style={{ fontSize: 11.5, color: "#374151", background: "#fef9c3", borderRadius: 4, padding: "5px 9px", border: "1px solid #FBBF24", lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 6 }}>
              <MI name="settings" size={14} color="#B45309"/><span>{compData.products}</span>
            </div>
          )}
          <a href={ndUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#324C9C", textDecoration: "none", width: "fit-content" }}>
            <ExtIcon/> Northdata ↗
          </a>
        </div>
      </div>
    </div>
  );
}

function MspCheck({ t, lang, mspSels, setMspSels }) {
  var hasMspRisk = mspSels[0] || mspSels[1];
  var scrollAnchorRef = useRef(null);
  var scrollOffsetRef = useRef(0);
  useEffect(function() {
    if (scrollAnchorRef.current) {
      var newTop = scrollAnchorRef.current.getBoundingClientRect().top;
      var diff = newTop - scrollOffsetRef.current;
      if (Math.abs(diff) > 1) window.scrollBy({ top: diff, behavior: "instant" });
      scrollAnchorRef.current = null;
    }
  }, [mspSels]);
  function handleClick(e, i, isNone) {
    var el = e.currentTarget;
    scrollAnchorRef.current = el;
    scrollOffsetRef.current = el.getBoundingClientRect().top;
    setMspSels(function(prev) {
      var next = prev.slice();
      if (isNone) { return [false, false, false, !prev[3]]; }
      else { next[i] = !prev[i]; if (next[i]) next[3] = false; return next; }
    });
  }
  return (
    <div style={{ padding: "20px 24px", background: "#FFF7E6", borderBottom: "1px solid #fde68a", borderTop: "2px solid #f59e0b" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <MI name="domain" size={20} color="#222F5C"/>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#B45309" }}>{t.mspTitle}</div>
        {mspSels.some(function(s) { return s; }) && (
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, background: "#ECFDF3", color: "#166534", borderRadius: 4, padding: "3px 10px", fontSize: 12, fontWeight: 700, border: "1px solid #86efac" }}>
            <MI name="check" size={14} color="#166534"/>{lang === "de" ? "Prüfung abgeschlossen" : "Check complete"}
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, color: "#B45309", margin: "0 0 10px", lineHeight: 1.6 }}>{t.mspIntro}</p>
      <div style={{ background: "#fff7ed", borderRadius: 8, padding: "11px 14px", borderLeft: "3px solid #f59e0b", marginBottom: 10 }}>
        <p style={{ fontSize: 13, color: "#B45309", margin: "0 0 8px", lineHeight: 1.65, display: "flex", alignItems: "flex-start", gap: 6 }}><MI name="auto_stories" size={16} color="#B45309"/><strong>{t.mspDef}</strong></p>
        <p style={{ fontSize: 13, color: "#B45309", margin: 0, lineHeight: 1.65 }}>{t.mspKonzern}</p>
      </div>
      <a href={BT_DRSACHE} target="_blank" rel="noreferrer" style={Object.assign({}, S.link("#B45309"), { fontSize: 12, marginBottom: 14, display: "inline-flex", gap: 6 })}><MI name="balance" size={14} color="#B45309"/>{t.mspBasis} ↗</a>
      <div style={Object.assign({}, S.lbl, { marginTop: 12 })}>{t.mspQ}</div>
      {t.mspOpts.map(function(opt, i) {
        var sel = mspSels[i], isNone = opt.exclusive;
        return (
          <div key={i} role="checkbox" aria-checked={sel} tabIndex={0}
            onClick={function(e) { handleClick(e, i, opt.exclusive); }}
            onKeyDown={function(e) { if (e.key === " " || e.key === "Enter") handleClick(e, i, opt.exclusive); }}
            style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 14px", borderRadius: 9, border: "1.5px solid " + (sel ? (isNone ? "#d1d5db" : "#f59e0b") : "#E3E3E6"), background: sel ? (isNone ? "#f9fafb" : "#FFF7E6") : "#fff", marginBottom: 8, cursor: "pointer", userSelect: "none" }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2, border: "2px solid " + (sel ? (isNone ? "#6b7280" : "#f59e0b") : "#9ca3af"), background: sel ? (isNone ? "#6b7280" : "#f59e0b") : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {sel && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: sel ? 700 : 500, color: "#111827", marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                <MI name={opt.icon} size={18} color="#222F5C"/>{opt.label}
              </div>
              <div style={{ fontSize: 12.5, color: "#6b7280", lineHeight: 1.5 }}>{opt.desc}</div>
            </div>
          </div>
        );
      })}
      {[0, 1, 2].some(function(i) { return mspSels[i]; }) && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {hasMspRisk && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fff1f2", border: "1.5px solid #fda4af" }}>
              <p style={{ fontSize: 12.5, color: "#9f1239", margin: 0, lineHeight: 1.6, fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 6 }}><MI name="bolt" size={14} color="#F97F08"/><span>{t.mspHigherTier}</span></p>
            </div>
          )}
          {[0, 1, 2].filter(function(i) { return mspSels[i]; }).map(function(i) {
            var a = t.mspAlerts[i];
            return (
              <div key={i} style={{ padding: "12px 14px", borderRadius: 8, background: a.bg, border: "1.5px solid " + a.bdr }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: a.col, marginBottom: 5 }}>{a.title}</div>
                <p style={{ fontSize: 12.5, color: a.col, margin: 0, lineHeight: 1.6 }}>{a.text}</p>
                {a.hint && <p style={{ fontSize: 12, color: a.col, margin: "7px 0 0", fontWeight: 600 }}>→ {a.hint}</p>}
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href={BSIG_BASE + "__2.html"} target="_blank" rel="noreferrer" style={Object.assign({}, S.link("#B45309"), { fontSize: 12, gap: 4 })}><MI name="balance" size={14} color="#B45309"/>§ 2 Nr. 26 BSIG 2025 ↗</a>
            <a href={BT_DRSACHE} target="_blank" rel="noreferrer" style={Object.assign({}, S.link("#B45309"), { fontSize: 12, gap: 4 })}><MI name="description" size={14} color="#B45309"/>BT-Drucksache 21/1501 ↗</a>
          </div>
        </div>
      )}
    </div>
  );
}

function NegligibilityBlocked({ t }) {
  return (
    <div style={{ padding: "20px 24px", background: "#fef2f2", borderBottom: "1px solid #fca5a5", borderTop: "2px solid #dc2626" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <MI name="block" size={20} color="#991b1b"/>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#991b1b" }}>{t.negBlockedTitle}</div>
      </div>
      <p style={{ fontSize: 13.5, color: "#991b1b", margin: "0 0 12px", lineHeight: 1.65, fontWeight: 600 }}>{t.negBlockedText}</p>
      <div style={{ background: "#fff", borderRadius: 4, border: "1.5px solid #fca5a5", padding: "13px 15px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", textTransform: "uppercase", letterSpacing: .5, marginBottom: 7, display: "flex", alignItems: "center", gap: 6 }}><MI name="auto_stories" size={14} color="#991b1b"/>Gesetzesbegründung BSIG 2025</div>
        <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.7, borderLeft: "3px solid #fca5a5", paddingLeft: 11 }}>{t.negBlockedReason}</p>
      </div>
      <div style={{ background: "#FFF7E6", borderRadius: 4, border: "1px solid #fde68a", padding: "10px 13px", marginBottom: 10 }}>
        <p style={{ fontSize: 12.5, color: "#B45309", margin: 0, lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 6 }}><MI name="warning" size={14} color="#F97F08"/><span>{t.negBlockedNote}</span></p>
      </div>
      <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{t.negBlockedSrc} — <a href={BT_DRSACHE} target="_blank" rel="noreferrer" style={{ color: "#991b1b", fontWeight: 600 }}>BT-Drucksache 21/1501 ↗</a></p>
    </div>
  );
}

function NegligibilityInteractive({ t }) {
  var steps = t.negSteps;
  var [answers, setAnswers] = useState([null, null, null]);
  var visibleCount = answers[0] === true ? (answers[1] === true ? 3 : 2) : 1;
  var allYes = answers[0] === true && answers[1] === true && answers[2] === true;
  var anyNo  = answers.slice(0, visibleCount).some(function(a) { return a === false; });
  var setAnswer = useCallback(function(i, val) {
    setAnswers(function(prev) {
      var next = prev.slice(); next[i] = val;
      if (i < 2) next[i + 1] = null;
      if (i < 1) next[2] = null;
      return next;
    });
  }, []);
  return (
    <div style={{ padding: "20px 24px", background: "#f0f4ff", borderBottom: "1px solid #c7d2fe", borderTop: "2px solid #324C9C" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <MI name="biotech" size={20} color="#222F5C"/>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#222F5C" }}>{t.negTitle}</div>
      </div>
      <p style={{ fontSize: 13, color: "#222F5C", margin: "0 0 4px", lineHeight: 1.6 }}>{t.negIntro}</p>
      <p style={{ fontSize: 11, color: "#6366f1", margin: "0 0 16px" }}>
        {t.negSrc} — <a href={BECK_NEG_URL} target="_blank" rel="noreferrer" style={{ color: "#324C9C", fontWeight: 600 }}>beck-online ↗</a>
      </p>
      {steps.slice(0, visibleCount).map(function(step, i) {
        var borderCol = answers[i] === false ? "#f87171" : answers[i] === true ? "#86efac" : "#c7d2fe";
        return (
          <div key={i} style={{ marginBottom: 12, background: "#fff", borderRadius: 10, border: "1.5px solid " + borderCol, overflow: "hidden" }}>
            <div style={{ background: "#eef2ff", padding: "10px 14px", borderBottom: "1px solid #c7d2fe", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "#324C9C", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#222F5C" }}>{step.label}</span>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <p style={{ fontSize: 13, color: "#111827", margin: "0 0 6px", lineHeight: 1.6, fontWeight: 500 }}>{step.q}</p>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 10px", lineHeight: 1.5 }}>{step.hint}</p>
              {step.warn && (
                <div style={{ background: "#FFF7E6", border: "1px solid #FBBF24", borderRadius: 7, padding: "9px 12px", marginBottom: 10 }}>
                  {step.warn.split("\n").map(function(line, li) {
                    return <p key={li} style={{ fontSize: 12, color: "#B45309", margin: li === 0 ? "0 0 4px" : 0, lineHeight: 1.55 }}>{line}</p>;
                  })}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[true, false].map(function(val, vi) {
                  var sel = answers[i] === val;
                  var col = val ? "#166534" : "#991b1b";
                  var bg  = val ? (sel ? "#ECFDF3" : "#f0fdf4") : (sel ? "#FEF0F0" : "#fff5f5");
                  var bdr = val ? (sel ? "#4ade80" : "#bbf7d0") : (sel ? "#fca5a5" : "#fecaca");
                  return (
                    <button key={vi} onClick={function() { setAnswer(i, val); }} aria-pressed={sel}
                      style={{ flex: 1, minWidth: 140, padding: "9px 12px", borderRadius: 8, border: "1.5px solid " + bdr, background: bg, cursor: "pointer", fontWeight: sel ? 700 : 400, fontSize: 13, color: col, textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, border: "2px solid " + (sel ? col : "#9ca3af"), background: sel ? col : "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        {sel && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "block" }}/>}
                      </span>
                      {vi === 0 ? step.yes : step.no}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      {anyNo && !allYes && <div style={{ padding: "12px 14px", borderRadius: 8, background: "#FEF0F0", border: "1.5px solid #fca5a5", marginTop: 4 }}>
        <p style={{ fontSize: 13, color: "#991b1b", margin: 0, lineHeight: 1.6, fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 6 }}><MI name="warning" size={16} color="#991b1b"/><span>{t.negResultPos}</span></p>
      </div>}
      {allYes && <div style={{ padding: "12px 14px", borderRadius: 8, background: "#f0fff4", border: "1.5px solid #86efac", marginTop: 4 }}>
        <p style={{ fontSize: 13, color: "#166534", margin: "0 0 8px", lineHeight: 1.6, fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 6 }}><MI name="check_circle" size={16} color="#166534"/><span>{t.negResultNeg}</span></p>
        <a href={BECK_NEG_URL} target="_blank" rel="noreferrer" style={Object.assign({}, S.link("#166534"), { gap: 4 })}><MI name="menu_book" size={14} color="#166534"/>Langversion Prüfschema (beck-online) ↗</a>
      </div>}
    </div>
  );
}

function ITIndependenceCheck({ t, mspSels, onResult }) {
  var isBlocked = mspSels && mspSels[2];
  var td = t.itIndep;
  var [answers, setAnswers] = useState({});
  var mainSecs = td.sections.filter(function(s) { return !s.isRedFlag; });
  var rfSecs   = td.sections.filter(function(s) { return s.isRedFlag; });
  var redFlag   = rfSecs.some(function(s) { return s.questions.some(function(q) { return answers[s.id + ":" + q.id] === true; }); });
  var allMainDone = mainSecs.every(function(s) { return s.questions.every(function(q) { return answers[s.id + ":" + q.id] !== undefined; }); });
  var secNegs  = mainSecs.map(function(s) { return s.questions.filter(function(q) { return answers[s.id + ":" + q.id] === false; }).length; });
  var secTotal = mainSecs.map(function(s) { return s.questions.length; });
  var totalNegs      = secNegs.reduce(function(a, b) { return a + b; }, 0);
  var anyOverHalf    = secNegs.some(function(n, i) { return n > secTotal[i] / 2; });
  var allSecsHaveNeg = mainSecs.length > 0 && secNegs.every(function(n) { return n > 0; });
  var resultType;
  if (isBlocked)         { resultType = "no"; }
  else if (redFlag)      { resultType = "no"; }
  else if (!allMainDone) { resultType = null; }
  else if (anyOverHalf || allSecsHaveNeg) { resultType = "no"; }
  else if (totalNegs === 0) { resultType = "yes"; }
  else { resultType = "partial"; }
  useEffect(function() { if (onResult) onResult(resultType); }, [resultType]);
  if (isBlocked) {
    return (
      <div style={{ padding: "20px 24px", background: "#fef2f2", borderBottom: "1px solid #fca5a5", borderTop: "2px solid #dc2626" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <MI name="block" size={20} color="#991b1b"/>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#991b1b" }}>{t.itIndepBlockedTitle}</div>
        </div>
        <p style={{ fontSize: 13.5, color: "#991b1b", margin: "0 0 12px", lineHeight: 1.65, fontWeight: 600 }}>{t.itIndepBlockedText}</p>
        <div style={{ background: "#fff", borderRadius: 9, border: "1.5px solid #fca5a5", padding: "13px 15px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", textTransform: "uppercase", letterSpacing: .5, marginBottom: 7 }}>§ 28 Abs. 4 BSIG 2025</div>
          <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.7, borderLeft: "3px solid #fca5a5", paddingLeft: 11 }}>{t.itIndepBlockedReason}</p>
        </div>
        <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{t.itIndepBlockedSrc}</p>
      </div>
    );
  }
  var resCol  = { yes: "#166534", partial: "#B45309", no: "#991b1b" };
  var resBg   = { yes: "#ECFDF3", partial: "#FFF7E6", no: "#FEF0F0" };
  var resBdr  = { yes: "#86efac", partial: "#FBBF24", no: "#fca5a5" };
  var resIcon = { yes: "check_circle", partial: "warning", no: "block" };
  var resTxt  = { yes: td.resultIndep, partial: td.resultPartial, no: td.resultNotIndep };
  function setAns(key, val) { setAnswers(function(prev) { var n = Object.assign({}, prev); n[key] = val; return n; }); }
  return (
    <div style={{ padding: "20px 24px", background: "#f0fdfa", borderBottom: "1px solid #99f6e4", borderTop: "2px solid #0d9488" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <MI name="lock" size={20} color="#222F5C"/>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#0f766e" }}>{td.title}</div>
      </div>
      <p style={{ fontSize: 13, color: "#134e4a", margin: "0 0 4px", lineHeight: 1.6 }}>{td.intro}</p>
      <p style={{ fontSize: 11, color: "#0d9488", margin: "0 0 16px" }}>{td.basis}</p>
      {td.sections.map(function(sec) {
        var isRF = sec.isRedFlag;
        return (
          <div key={sec.id} style={{ marginBottom: 12, background: "#fff", borderRadius: 10, border: "1.5px solid " + (isRF ? "#fca5a5" : "#99f6e4"), overflow: "hidden" }}>
            <div style={{ background: isRF ? "#FEF0F0" : "#ccfbf1", padding: "9px 14px", borderBottom: "1px solid " + (isRF ? "#fca5a5" : "#99f6e4"), display: "flex", alignItems: "center", gap: 7 }}>
              {isRF && <MI name="priority_high" size={16} color="#991b1b"/>}
              <span style={{ fontWeight: 700, fontSize: 13, color: isRF ? "#991b1b" : "#0f766e" }}>{sec.label}</span>
            </div>
            <div style={{ padding: "12px 14px" }}>
              {sec.questions.map(function(q, qi) {
                var key = sec.id + ":" + q.id, ans = answers[key], last = qi === sec.questions.length - 1;
                return (
                  <div key={q.id} style={{ marginBottom: last ? 0 : 10, paddingBottom: last ? 0 : 10, borderBottom: last ? "none" : "1px solid #f3f4f6" }}>
                    <p style={{ fontSize: 13, color: "#111827", margin: "0 0 3px", fontWeight: 500, lineHeight: 1.55 }}>{q.q}</p>
                    {q.hint && <p style={{ fontSize: 11.5, color: "#6b7280", margin: "0 0 8px", lineHeight: 1.45 }}>{q.hint}</p>}
                    <div style={{ display: "flex", gap: 8 }}>
                      {[true, false].map(function(val) {
                        var sel = ans === val, isGood = isRF ? val === false : val === true;
                        var col = isGood ? "#166534" : "#991b1b";
                        var bg  = isGood ? (sel ? "#ECFDF3" : "#f0fdf4") : (sel ? "#FEF0F0" : "#fff5f5");
                        var bdr = isGood ? (sel ? "#4ade80" : "#bbf7d0") : (sel ? "#fca5a5" : "#fecaca");
                        var lbl = val ? (isRF ? td.yesRF : td.yes) : (isRF ? td.noRF : td.no);
                        return (
                          <button key={String(val)} onClick={function() { setAns(key, val); }}
                            style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1.5px solid " + bdr, background: bg, cursor: "pointer", fontWeight: sel ? 700 : 400, fontSize: 13, color: col, display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ width: 13, height: 13, borderRadius: "50%", flexShrink: 0, border: "2px solid " + (sel ? col : "#9ca3af"), background: sel ? col : "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                              {sel && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "block" }}/>}
                            </span>
                            {lbl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {resultType !== null && (
        <div style={{ padding: "12px 14px", borderRadius: 8, background: resBg[resultType], border: "1.5px solid " + resBdr[resultType], marginTop: 4 }}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 4px", color: resCol[resultType], display: "flex", alignItems: "center", gap: 6 }}><MI name={resIcon[resultType]} size={16} color={resCol[resultType]}/> {resTxt[resultType]}</p>
          {redFlag && <p style={{ fontSize: 12, color: "#991b1b", margin: 0, lineHeight: 1.5 }}>{td.redFlagNote}</p>}
          {!redFlag && resultType === "no" && anyOverHalf && <p style={{ fontSize: 12, color: "#991b1b", margin: 0, lineHeight: 1.5 }}>{td.reasonOverHalf}</p>}
          {!redFlag && resultType === "no" && !anyOverHalf && allSecsHaveNeg && <p style={{ fontSize: 12, color: "#991b1b", margin: 0, lineHeight: 1.5 }}>{td.reasonAllSecs}</p>}
          {resultType === "partial" && <p style={{ fontSize: 12, color: "#B45309", margin: 0, lineHeight: 1.5 }}>{td.reasonPartial}</p>}
        </div>
      )}
    </div>
  );
}

function ThresholdCheck({ t, mspSels, itResult }) {
  var td = t.thresh;
  var hasMsp             = mspSels[0] || mspSels[1];
  var hasGroupMembership = mspSels[0] || mspSels[1] || mspSels[2];
  var itIndep    = itResult === "yes";
  var itPartial  = itResult === "partial";
  var itNotIndep = itResult === "no";
  var includeAffiliated = itNotIndep || itPartial || hasGroupMembership;
  var [ownEmp,  setOwnEmp]  = useState("");
  var [ownTurn, setOwnTurn] = useState("");
  var [ownBal,  setOwnBal]  = useState("");
  var [affEmp,  setAffEmp]  = useState("");
  var [affTurn, setAffTurn] = useState("");
  var [affBal,  setAffBal]  = useState("");
  var [partners, setPartners] = useState([]);
  function n(v) { return parseFloat(String(v || "").replace(",", ".")) || 0; }
  var own  = { emp: n(ownEmp), turn: n(ownTurn), bal: n(ownBal) };
  var aff  = { emp: n(affEmp), turn: n(affTurn), bal: n(affBal) };
  var pSum = { emp: partners.reduce(function(s, p) { return s + n(p.emp) * n(p.pct) / 100; }, 0), turn: partners.reduce(function(s, p) { return s + n(p.turn) * n(p.pct) / 100; }, 0), bal: partners.reduce(function(s, p) { return s + n(p.bal) * n(p.pct) / 100; }, 0) };
  var hasOwnData = own.emp > 0 || own.turn > 0 || own.bal > 0;
  var de = td.basis.startsWith("Rechts");
  var affEmpty = includeAffiliated && aff.emp === 0 && aff.turn === 0 && aff.bal === 0 && pSum.emp === 0 && pSum.turn === 0;
  var total = { emp: own.emp + (includeAffiliated ? aff.emp + pSum.emp : 0), turn: own.turn + (includeAffiliated ? aff.turn + pSum.turn : 0), bal: own.bal + (includeAffiliated ? aff.bal + pSum.bal : 0) };
  var meetsBWE = total.emp >= 250 || (total.turn > 50 && total.bal > 43);
  var meetsWE  = total.emp >= 50  || (total.turn > 10 && total.bal > 10);
  var classification = hasOwnData ? (!meetsWE ? "below" : meetsBWE && hasMsp ? "bwE" : "wE") : null;
  var clsColors = { bwE: { bg: "#eff6ff", bdr: "#3b82f6", col: "#324C9C", icon: "shield" }, wE: { bg: "#f0fdf4", bdr: "#86efac", col: "#166534", icon: "verified" }, below: { bg: "#f9fafb", bdr: "#E3E3E6", col: "#374151", icon: "radio_button_unchecked" } };
  function addPartner() { setPartners(function(p) { return p.concat([{ emp: "", turn: "", bal: "", pct: "" }]); }); }
  function removePartner(i) { setPartners(function(p) { return p.filter(function(_, j) { return j !== i; }); }); }
  function setPartnerField(i, field, val) { setPartners(function(p) { var n2 = p.slice(); n2[i] = Object.assign({}, n2[i]); n2[i][field] = val; return n2; }); }
  function fmt(v)  { return v > 0 ? v.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—"; }
  function fmtI(v) { return v > 0 ? Math.round(v).toLocaleString("de-DE") : "—"; }
  return (
    <div style={{ padding: "20px 24px", background: "#faf5ff", borderBottom: "1px solid #e9d5ff", borderTop: "2px solid #324C9C" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <MI name="square_foot" size={20} color="#324C9C"/>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#324C9C" }}>{td.title}</div>
      </div>
      <p style={{ fontSize: 13, color: "#4c1d95", margin: "0 0 4px", lineHeight: 1.6 }}>{td.intro}</p>
      <p style={{ fontSize: 11, color: "#324C9C", margin: "0 0 16px" }}>{td.basis}</p>
      {itResult !== null && (() => {
        var isOk = itIndep && !hasGroupMembership;
        var isWarn = itPartial || (itIndep && hasGroupMembership);
        var icon = isOk ? "check_circle" : isWarn ? "warning" : "block";
        var col = isOk ? "#166534" : isWarn ? "#B45309" : "#991b1b";
        var msg = isOk ? td.itIndepNote : (itIndep && hasGroupMembership) ? (de ? "IT-Selbständigkeit bestätigt, jedoch Konzernzugehörigkeit festgestellt — Daten verbundener Unternehmen werden zur Vollständigkeit empfohlen." : "IT independence confirmed, but group membership identified — affiliated company data is recommended for completeness.") : itPartial ? td.itPartialNote : td.affNote;
        return (
          <div style={{ padding: "8px 12px", borderRadius: 4, marginBottom: 14, background: isOk ? "#f0fdf4" : isWarn ? "#FFF7E6" : "#FEF0F0", border: "1px solid " + (isOk ? "#86efac" : isWarn ? "#FBBF24" : "#fca5a5"), fontSize: 12.5, color: col, display: "flex", alignItems: "flex-start", gap: 6 }}>
            <MI name={icon} size={16} color={isWarn ? "#F97F08" : col}/><span>{msg}</span>
          </div>
        );
      })()}
      {itResult === null && <div style={{ padding: "8px 12px", borderRadius: 4, marginBottom: 14, background: "#FFF7E6", border: "1px solid #FBBF24", fontSize: 12.5, color: "#B45309", display: "flex", alignItems: "flex-start", gap: 6 }}><MI name="warning" size={16} color="#F97F08"/><span>{td.itUnknownNote}</span></div>}
      <div style={{ background: "#fff", borderRadius: 10, border: "1.5px solid #e9d5ff", padding: "16px", marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#324C9C", marginBottom: 4 }}>{td.ownDataTitle}</div>
        <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 12px", lineHeight: 1.5 }}>{td.ownDataNote}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[{ label: td.empLabel, val: ownEmp, set: setOwnEmp, ph: td.empPh, step: 1 }, { label: td.turnLabel, val: ownTurn, set: setOwnTurn, ph: td.turnPh }, { label: td.balLabel, val: ownBal, set: setOwnBal, ph: td.balPh }].map(function(f, i) { return (
            <div key={i}><div style={S.lbl}>{f.label}</div><NumInput value={f.val} onChange={f.set} placeholder={f.ph} step={f.step || "0.1"}/></div>
          ); })}
        </div>
      </div>
      {includeAffiliated && (
        <>
          <div style={{ background: "#fff", borderRadius: 10, border: "1.5px solid #fca5a5", padding: "16px", marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#991b1b", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><MI name="link" size={16} color="#991b1b"/>{td.affTitle}</div>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 12px", lineHeight: 1.5 }}>{td.affNote}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[{ label: td.empLabel, val: affEmp, set: setAffEmp, ph: td.empPh, step: 1 }, { label: td.turnLabel, val: affTurn, set: setAffTurn, ph: td.turnPh }, { label: td.balLabel, val: affBal, set: setAffBal, ph: td.balPh }].map(function(f, i) { return (
                <div key={i}><div style={S.lbl}>{f.label}</div><NumInput value={f.val} onChange={f.set} placeholder={f.ph} step={f.step || "0.1"}/></div>
              ); })}
            </div>
          </div>
          {affEmpty && hasOwnData && (
            <div style={{ padding: "10px 14px", background: "#fff7ed", border: "1.5px solid #fb923c", borderRadius: 8, marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 9 }}>
              <MI name="warning" size={18} color="#F97F08"/>
              <p style={{ fontSize: 12.5, color: "#B45309", margin: 0, lineHeight: 1.6 }}>{de ? "Konzernzugehörigkeit festgestellt — bitte Daten der verbundenen Unternehmen eintragen." : "Group membership identified — please enter data for affiliated companies."}</p>
            </div>
          )}
          <div style={{ background: "#fff", borderRadius: 10, border: "1.5px solid #fde68a", padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#B45309", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><MI name="handshake" size={16} color="#F97F08"/>{td.partTitle}</div>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 10px", lineHeight: 1.5 }}>{td.partNote}</p>
            {partners.map(function(p, i) { return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px 36px", gap: 8, marginBottom: 8, alignItems: "end" }}>
                {[{ field: "emp", ph: td.partEmpPh, step: 1 }, { field: "turn", ph: td.partTurnPh }, { field: "bal", ph: td.partBalPh }, { field: "pct", ph: td.partPctPh, step: 1 }].map(function(f) {
                  return <NumInput key={f.field} value={p[f.field]} onChange={function(v) { setPartnerField(i, f.field, v); }} placeholder={f.ph} step={f.step || "0.1"}/>;
                })}
                <button onClick={function() { removePartner(i); }} title={td.removePartner}
                  style={{ padding: "8px", borderRadius: 7, border: "1.5px solid #fca5a5", background: "#fff5f5", cursor: "pointer", color: "#991b1b", display: "flex", alignItems: "center", justifyContent: "center", height: 38 }}>
                  <TrashIcon/>
                </button>
              </div>
            ); })}
            <button onClick={addPartner} style={{ fontSize: 13, fontWeight: 600, color: "#B45309", background: "#FFF7E6", border: "1.5px dashed #FBBF24", borderRadius: 7, padding: "7px 14px", cursor: "pointer", width: "100%" }}>{td.addPartner}</button>
          </div>
        </>
      )}
      {hasOwnData && (
        <div style={{ background: "#f5f3ff", borderRadius: 10, border: "1.5px solid #c4b5fd", padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#324C9C", marginBottom: 10 }}>{td.totalTitle}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[{ label: td.totalEmp, val: fmtI(total.emp), thresh1: "≥ 50", thresh2: "≥ 250", met1: total.emp >= 50, met2: total.emp >= 250 }, { label: td.totalTurn, val: fmt(total.turn), thresh1: "> 10 M€", thresh2: "> 50 M€", met1: total.turn > 10, met2: total.turn > 50 }, { label: td.totalBal, val: fmt(total.bal), thresh1: "> 10 M€", thresh2: "> 43 M€", met1: total.bal > 10, met2: total.bal > 43 }].map(function(item, i) { return (
              <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", border: "1px solid #e9d5ff" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#324C9C", textTransform: "uppercase", letterSpacing: .4, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontWeight: 900, fontSize: 20, color: "#222F5C", marginBottom: 6 }}>{item.val}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontSize: 11, background: item.met1 ? "#ECFDF3" : "#f3f4f6", color: item.met1 ? "#166534" : "#9ca3af", borderRadius: 4, padding: "1px 6px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>wE {item.thresh1} <MI name={item.met1 ? "check" : "close"} size={12} color={item.met1 ? "#166534" : "#9ca3af"}/></span>
                  <span style={{ fontSize: 11, background: item.met2 ? "#dbeafe" : "#f3f4f6", color: item.met2 ? "#324C9C" : "#9ca3af", borderRadius: 4, padding: "1px 6px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>bwE {item.thresh2} <MI name={item.met2 ? "check" : "close"} size={12} color={item.met2 ? "#324C9C" : "#9ca3af"}/></span>
                </div>
              </div>
            ); })}
          </div>
        </div>
      )}
      {classification ? (
        <div>
          <div style={{ background: clsColors[classification].bg, border: "2px solid " + clsColors[classification].bdr, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: clsColors[classification].col, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><MI name={clsColors[classification].icon} size={18} color={clsColors[classification].col}/> {classification === "bwE" ? td.resultBWE : classification === "wE" ? td.resultWE : td.resultBelow}</div>
            <p style={{ fontSize: 13, color: clsColors[classification].col, margin: 0, lineHeight: 1.65 }}>{classification === "bwE" ? td.resultBWEText : classification === "wE" ? td.resultWEText : td.resultBelowText}</p>
            {classification === "wE" && meetsBWE && !hasMsp && <div style={{ marginTop: 10, padding: "8px 12px", background: "#fff", borderRadius: 4, border: "1px solid #bfdbfe" }}><p style={{ fontSize: 12, color: "#324C9C", margin: 0, lineHeight: 1.55, display: "flex", alignItems: "flex-start", gap: 6 }}><MI name="info" size={14} color="#324C9C"/><span>{td.capNote}</span></p></div>}
          </div>
          <div style={{ padding: "9px 12px", background: "#faf5ff", borderRadius: 7, border: "1px solid #e9d5ff" }}>
            <p style={{ fontSize: 12, color: "#324C9C", margin: 0, lineHeight: 1.55, display: "flex", alignItems: "flex-start", gap: 6 }}><MI name="schedule" size={14} color="#324C9C"/><span>{td.stabilityNote}</span></p>
          </div>
        </div>
      ) : (!hasOwnData && <div style={{ padding: "10px 14px", background: "#f9fafb", borderRadius: 8, border: "1px dashed #d1d5db" }}><p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>{td.noDataNote}</p></div>)}
    </div>
  );
}

// ── API Status Check ──────────────────────────────────────────────────────────
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
      {status === "error" && (
        <button onClick={onReset}
          style={{ background: "#fff", border: "1.5px solid #fca5a5", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12, color: "#991b1b", display: "flex", alignItems: "center", gap: 6 }}>
          ⟳ {de ? "Neu laden" : "Reload"}
        </button>
      )}
    </div>
  );
}

// One-shot read of the shared "anthropicApiKey" localStorage entry. Set in
// the ⚙ Settings modal (which does location.reload() on save), so we don't
// need to re-check on every render — a component-level snapshot at mount is
// stable. Returns false in artifact-preview contexts where localStorage may
// not exist or the key was never set.
function hasStoredApiKey() {
  try { return !!localStorage.getItem("anthropicApiKey"); } catch(_) { return false; }
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  var [lang, setLang]         = useState("de");
  var [hasApiKey]             = useState(hasStoredApiKey);
  var [mode, setMode]         = useState(null);
  var [wzInputs, setWzInputs] = useState([""]);   // ← array for multiple WZ
  var [wzHelpOpen, setWzHelpOpen]             = useState(false);
  var [wzHelpResultOpen, setWzHelpResultOpen] = useState(false);
  var [comp, setComp]         = useState("");
  var [loc,  setLoc]          = useState("");
  var [prod, setProd]         = useState("");
  var [compData, setCompData] = useState(null);
  var [candidates, setCandidates] = useState(null); // ambiguous-result picker
  var [result, setResult]     = useState(null);
  var [mspSels, setMspSels]   = useState([false, false, false, false]);
  var [itResult, setItResult] = useState(null);
  var [errors, setErrors]     = useState({ general: "", phase1: "", phase2: "" });
  var [busy, setBusy]         = useState(false);
  var [step, setStep]         = useState(-1);
  var runningRef = useRef(false);
  var abortRef   = useRef(null);

  var t   = useMemo(function() { return mk(lang); }, [lang]);
  var scC = result ? (result.unclassifiable ? "#9ca3af" : result.in_scope ? "#38a169" : "#e53e3e") : "#9ca3af";
  var hasMspRisk = mspSels[0] || mspSels[1];

  function clearErrors() { setErrors({ general: "", phase1: "", phase2: "" }); }

  function reset() {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    runningRef.current = false;
    setMode(null); setWzInputs([""]); setComp(""); setLoc(""); setProd("");
    setCompData(null); setCandidates(null); setResult(null); setMspSels([false, false, false, false]);
    setItResult(null); clearErrors(); setBusy(false); setStep(-1);
    setWzHelpOpen(false); setWzHelpResultOpen(false);
  }

  function cancelAnalysis() {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    runningRef.current = false;
    setBusy(false); setStep(-1);
    setErrors({ general: "", phase1: "", phase2: t.errAborted });
  }

  // ── Direct WZ input: support multiple entries ─────────────────────────────
  function handleDirect() {
    var entries = wzInputs.map(function(v) { return v.replace(",", ".").trim(); }).filter(Boolean);
    if (entries.length === 0) {
      setErrors(function(e) { return Object.assign({}, e, { general: t.wzInvalid }); }); return;
    }
    var parsed = [];
    for (var i = 0; i < entries.length; i++) {
      var raw = entries[i];
      var status = validateWzRaw(raw);
      if (status === "format") {
        setErrors(function(e) { return Object.assign({}, e, { general: t.wzInvalid + " (" + raw + ")" }); }); return;
      }
      if (status === "notfound") {
        setErrors(function(e) { return Object.assign({}, e, { general: t.wzNotFound.replace("{wz}", raw) }); }); return;
      }
      var num = parseFloat(raw);
      var inScope = num >= 26 && num < 31;
      var label = WZ_LABELS[raw] || WZ_LABELS[String(Math.floor(num))] || WZ_LABELS_25[raw] || WZ_LABELS_25[String(Math.floor(num))] || "";
      parsed.push({ wz: raw, label: label, in_scope: inScope });
    }
    var anyInScope = parsed.some(function(p) { return p.in_scope; });
    var primary = parsed.find(function(p) { return p.in_scope; }) || parsed[0];
    setResult({
      primary_wz: primary.wz, primary_label: primary.label, in_scope: anyInScope,
      all_entries: parsed,
      confidence: lang === "de" ? "hoch" : "high", reasoning: "",
      alternative_wz: [], sources_used: ["direct"], directMode: true,
    });
    clearErrors();
  }

  function setWzAt(i, val) { setWzInputs(function(prev) { var next = prev.slice(); next[i] = val; return next; }); }
  function addWzInput()    { setWzInputs(function(prev) { return prev.concat([""]); }); }
  function removeWzInput(i){ setWzInputs(function(prev) { return prev.filter(function(_, j) { return j !== i; }); }); }

  async function handleAnalyze() {
    if (runningRef.current) return;
    if (!comp.trim() && !prod.trim()) {
      setErrors(function(e) { return Object.assign({}, e, { general: lang === "de" ? "Bitte mindestens ein Feld ausfüllen." : "Please fill in at least one field." }); });
      return;
    }
    var ctrl = new AbortController();
    abortRef.current = ctrl;
    runningRef.current = true;
    setBusy(true); clearErrors(); setResult(null); setCompData(null); setCandidates(null);
    setMspSels([false, false, false, false]); setItResult(null); setWzHelpResultOpen(false);
    var cd = null;
    setStep(0);
    try {
      cd = await fetchCompanyData(comp, loc, lang, ctrl.signal);
      if (ctrl.signal.aborted) { runningRef.current = false; return; }
      // Ambiguous — Claude returned candidate list instead of unique data.
      // Stop Phase 2 and hand the list to the UI picker.
      if (cd && cd.ambiguous) {
        setCandidates(cd.candidates || []);
        runningRef.current = false; abortRef.current = null; setBusy(false); setStep(-1);
        return;
      }
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
      var res = await analyzeWZ(comp, prod, cd, lang, ctrl.signal);
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

  function SrcBadges({ used }) {
    var srcMap = { northdata: t.srcNd, "handelsregister.ai": t.srcHr, destatis: t.srcDest, products: t.srcProd, direct: t.srcDirect };
    return (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {(used || []).map(function(k) {
          var m = SRC_META[k] || { icon: "circle", bg: "#f3f4f6", col: "#374151" };
          return <span key={k} style={S.pill(m.bg, m.col)}><MI name={m.icon} size={13} color={m.col}/> {srcMap[k] || k}</span>;
        })}
      </div>
    );
  }

  function CheckSequenceBadge() {
    var de = lang === "de";
    var steps = de
      ? ["WZ-Klassifikation", "MSP/Konzernstruktur", "Vernachlässigbarkeit", "IT-Selbständigkeit", "Schwellenwerte"]
      : ["WZ classification", "MSP/Group structure", "Negligibility", "IT independence", "Thresholds"];
    return (
      <div style={{ padding: "10px 24px", background: "#f0f4ff", borderBottom: "1px solid #c7d2fe", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#324C9C", textTransform: "uppercase", letterSpacing: .4, marginRight: 4, flexShrink: 0 }}>
          {de ? "Prüfreihenfolge:" : "Check order:"}
        </span>
        {steps.map(function(s, i) {
          return (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 11, background: i === 1 ? "#FFF7E6" : i === 2 && hasMspRisk ? "#FEF0F0" : "#e0e7ff", color: i === 1 ? "#B45309" : i === 2 && hasMspRisk ? "#991b1b" : "#222F5C", borderRadius: 4, padding: "2px 7px", fontWeight: 700 }}>
                {i + 1}. {s}
              </span>
              {i < steps.length - 1 && <span style={{ fontSize: 10, color: "#9ca3af" }}>→</span>}
            </span>
          );
        })}
      </div>
    );
  }

  // ── WZ result display: single or multiple entries ─────────────────────────
  function WzResultDisplay() {
    var entries = result.all_entries;
    // Unclassifiable: no WZ code was determined — skip the WZ/confidence tiles
    // entirely so the empty tile can't render. The header panel already
    // explains what happened; only the analysed-company card stays relevant.
    if (result.unclassifiable) {
      if (result.directMode || !compData) return null;
      return (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", border: "1.5px solid #E3E3E6", flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>
              {lang === "de" ? "Analysiertes Unternehmen" : "Analysed company"}
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#222F5C", marginBottom: 4, lineHeight: 1.3 }}>
              {comp || compData.gegenstand || "—"}
            </div>
            {compData.ort && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <MI name="location_on" size={14} color="#324C9C"/>
                <span style={{ fontSize: 13, color: "#374151" }}>{compData.ort}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    if (!entries || entries.length <= 1) {
      // Single WZ — classic display
      var confRaw = result.confidence ? String(result.confidence).replace(/_/g, " ") : "";
      var confLower = confRaw.toLowerCase();
      var confDisplay = confRaw ? confRaw.charAt(0).toUpperCase() + confRaw.slice(1) : "";
      return (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ background: "#f0f4ff", borderRadius: 10, padding: "14px 20px", minWidth: 150 }}>
            <div style={Object.assign({}, S.lbl, { marginBottom: 4 })}>{t.wzLabelSingle}</div>
            <div style={{ fontWeight: 900, fontSize: 30, color: "#222F5C", lineHeight: 1 }}>{result.primary_wz}</div>
                            <div style={{ fontSize: 12, color: "#374151", marginTop: 5, lineHeight: 1.4 }}>{result.primary_label}</div>
          </div>
          {!result.directMode && compData && (
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", border: "1.5px solid #E3E3E6", flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>
                {lang === "de" ? "Analysiertes Unternehmen" : "Analysed company"}
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#222F5C", marginBottom: 4, lineHeight: 1.3 }}>
                {comp || compData.gegenstand || "—"}
              </div>
              {compData.ort && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                  <MI name="location_on" size={14} color="#324C9C"/>
                  <span style={{ fontSize: 13, color: "#374151" }}>{compData.ort}</span>
                </div>
              )}
              {compData.rechtsform && (
                <span style={{ fontSize: 11, background: "#eff6ff", color: "#324C9C", borderRadius: 4, padding: "2px 7px", fontWeight: 600, border: "1px solid #bfdbfe", marginRight: 5 }}>{compData.rechtsform}</span>
              )}
              {compData.hr_nummer && (
                <span style={{ fontSize: 11, background: "#faf5ff", color: "#324C9C", borderRadius: 4, padding: "2px 7px", fontWeight: 600, border: "1px solid #e9d5ff" }}>
                  {compData.hr_nummer}{compData.amtsgericht ? " · AG " + compData.amtsgericht : ""}
                </span>
              )}
              {compData.northdata_url && (
                <div style={{ marginTop: 8 }}>
                  <a href={compData.northdata_url} target="_blank" rel="noreferrer"
                    style={{ fontSize: 11, fontWeight: 700, color: "#324C9C", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <ExtIcon/> Northdata ↗
                  </a>
                </div>
              )}
            </div>
          )}
          <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 100 }}>
            <div style={Object.assign({}, S.lbl, { marginBottom: 4 })}>{t.confLabel}</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: CONF_COL[confLower] || "#374151" }}>
              {confDisplay}
            </div>
          </div>
                        {result.alternative_wz && result.alternative_wz.length > 0 && (
            <div style={{ flex: 1, background: "#f9fafb", borderRadius: 10, padding: "14px 16px", minWidth: 120 }}>
              <div style={Object.assign({}, S.lbl, { marginBottom: 6 })}>{t.altWZ}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {result.alternative_wz.map(function(wz, i) {
                  var label = typeof wz === "object" ? (wz.wz || wz.label || JSON.stringify(wz)) : String(wz);
                  return <span key={i} style={S.pill("#E3E3E6", "#374151")}>{label}</span>;
                })}
              </div>
            </div>
          )}
        </div>
      );
    }
    // Multiple WZ entries
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={Object.assign({}, S.lbl, { marginBottom: 8 })}>{t.allWzTitle}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map(function(entry, i) {
            var col = entry.in_scope ? "#166534" : "#6b7280";
            var bg  = entry.in_scope ? "#f0fdf4" : "#f9fafb";
            var bdr = entry.in_scope ? "#86efac" : "#E3E3E6";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: bg, border: "1.5px solid " + bdr, borderRadius: 9, padding: "10px 14px" }}>
                <span style={{ fontWeight: 900, fontSize: 20, color: entry.in_scope ? "#222F5C" : "#9ca3af", fontFamily: "monospace", minWidth: 52 }}>{entry.wz}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.4 }}>{entry.label || "—"}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, background: entry.in_scope ? "#ECFDF3" : "#f3f4f6", color: col, borderRadius: 4, padding: "3px 9px", whiteSpace: "nowrap", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <MI name={entry.in_scope ? "check" : "close"} size={13} color={col}/>{entry.in_scope ? t.wzInScope : t.wzOutScope}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", maxWidth: 780, margin: "0 auto", background: "#fff", minHeight: "100vh", boxShadow: "0 0 0 1px #E3E3E6" }}>
      <div style={{ background: "linear-gradient(135deg,#222F5C 0%,#2d4e8a 60%,#1e3a5f 100%)", color: "#fff", padding: "22px 32px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#93c5fd", textTransform: "uppercase", marginBottom: 3 }}>BSI Compliance Tool</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 3px" }}>{t.title}</h1>
            <div style={{ fontSize: 13, color: "#93c5fd" }}>{t.subtitle}</div>
            <div style={{ fontSize: 12, color: "#bfdbfe", marginTop: 2 }}>{t.forLine}</div>
          </div>
          <button onClick={function() { setLang(function(l) { return l === "de" ? "en" : "de"; }); }}
            style={{ background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
            {t.langBtn}
          </button>
        </div>
      </div>

      <div style={{ padding: "28px 32px" }}>
        <ApiStatusBar lang={lang} onReset={reset}/>
        <p style={{ fontSize: 13.5, color: "#4b5563", marginBottom: 22, lineHeight: 1.6 }}>{t.hint}</p>

        {!result && !hasApiKey && (
          <div style={{ marginBottom: 18, padding: "10px 14px", background: "#FFF7E6", border: "1px solid #fde68a", borderRadius: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#B45309", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <MI name="key_off" size={14} color="#B45309"/>{t.noKeyBannerT}
            </div>
            <p style={{ fontSize: 12.5, color: "#92400e", margin: 0, lineHeight: 1.55 }}>{t.noKeyBannerB}</p>
          </div>
        )}

        {!result && (
          <div style={{ marginBottom: 22 }}>
            <div style={S.lbl}>{t.modeL}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              {["known", "analyze"].map(function(m, i) {
                var sel = mode === m;
                var disabled = (m === "analyze") && !hasApiKey;
                return (
                  <div key={m} role="button" tabIndex={disabled ? -1 : 0}
                    aria-disabled={disabled}
                    onClick={disabled ? undefined : function() { setMode(m); setResult(null); clearErrors(); setCompData(null); setStep(-1); setMspSels([false,false,false,false]); setItResult(null); setWzHelpOpen(false); }}
                    onKeyDown={disabled ? undefined : function(e) { if (e.key === "Enter") setMode(m); }}
                    title={disabled ? t.modeNoDisabled : ""}
                    style={{ flex: 1, minWidth: 200, padding: "14px 18px", borderRadius: 4, border: "2px solid " + (sel ? "#222F5C" : "#E3E3E6"), background: sel ? "#eff6ff" : "#fafafa", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1, fontWeight: sel ? 700 : 400, fontSize: 14, color: sel ? "#222F5C" : "#374151", lineHeight: 1.4, display: "flex", alignItems: "center", gap: 8 }}>
                    <MI name={i === 0 ? "pin" : "search"} size={18} color={sel ? "#222F5C" : "#6b7280"}/>
                    <span>{i === 0 ? t.modeYes : t.modeNo}
                      {i === 1 && !disabled && <div style={{ fontSize: 11, color: "#324C9C", marginTop: 5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><MI name="smart_toy" size={14} color="#324C9C"/>{t.modeNoHint}</div>}
                      {i === 1 && disabled && <div style={{ fontSize: 11, color: "#B45309", marginTop: 5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><MI name="key_off" size={14} color="#B45309"/>{t.modeNoDisabled}</div>}
                    </span>
                  </div>
                );
              })}
            </div>
            <WzHelpAccordion t={t} lang={lang} open={wzHelpOpen} setOpen={setWzHelpOpen}/>
          </div>
        )}

        {mode === "known" && !result && (
          <div style={Object.assign({}, S.card(), { marginBottom: 20, padding: "20px 22px" })}>
            <label style={S.lbl}>{t.wzL}</label>
            {wzInputs.map(function(val, i) {
              return (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <input value={val} onChange={function(e) { setWzAt(i, e.target.value); }} placeholder={t.wzPh}
                    style={Object.assign({}, S.inp, { maxWidth: 180 })}
                    onKeyDown={function(e) { if (e.key === "Enter") handleDirect(); }}/>
                  {wzInputs.length > 1 && (
                    <button onClick={function() { removeWzInput(i); }} title={t.removeWz}
                      style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", borderRadius: 7, padding: "8px 10px", cursor: "pointer", color: "#991b1b", display: "flex", alignItems: "center" }}>
                      <TrashIcon/>
                    </button>
                  )}
                  {i === wzInputs.length - 1 && (
                    <button onClick={handleDirect} style={S.pri}>{t.checkBtn}</button>
                  )}
                </div>
              );
            })}
            <button onClick={addWzInput}
              style={{ fontSize: 12.5, fontWeight: 600, color: "#324C9C", background: "#eff6ff", border: "1.5px dashed #bfdbfe", borderRadius: 7, padding: "6px 13px", cursor: "pointer", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
              {t.addWz}
            </button>
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{t.wzHint}</p>
          </div>
        )}

        {mode === "analyze" && !result && (
          <div>
            <div style={Object.assign({}, S.card("#E3E3E6", "#f8fafc"), { marginBottom: 14, padding: "20px 22px" })}>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="comp-input" style={S.lbl}>{t.compL}</label>
                <input id="comp-input" value={comp} onChange={function(e) { setComp(e.target.value); }} placeholder={t.compPh}
                  style={S.inp} disabled={busy} onKeyDown={function(e) { if (e.key === "Enter" && !busy) handleAnalyze(); }}/>
                <p style={{ fontSize: 12, color: "#6b7280", margin: "5px 0 0" }}>{t.compHint}</p>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="loc-input" style={S.lbl}>{t.locL}</label>
                <input id="loc-input" value={loc} onChange={function(e) { setLoc(e.target.value); }}
                  placeholder={t.locPh} style={S.inp} disabled={busy}/>
                <p style={{ fontSize: 12, color: "#6b7280", margin: "5px 0 0" }}>{t.locHint}</p>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <label htmlFor="prod-input" style={S.lbl}>{t.prodL}</label>
                  {prod.trim() && !busy && (
                    <button onClick={function() { setProd(""); }} title={t.prodClear}
                      style={{ background: "none", border: "1px solid #E3E3E6", borderRadius: 6, padding: "4px 7px", cursor: "pointer", color: "#9ca3af", display: "inline-flex", alignItems: "center" }}>
                      <TrashIcon/>
                    </button>
                  )}
                </div>
                <textarea id="prod-input" value={prod} onChange={function(e) { setProd(e.target.value); }}
                  placeholder={t.prodPh} rows={3} disabled={busy}
                  style={Object.assign({}, S.inp, { resize: "vertical", lineHeight: 1.55 })}/>
                <p style={{ fontSize: 12, color: "#6b7280", margin: "5px 0 0" }}>{t.prodHint}</p>
              </div>
            </div>
            {busy && (
              <div style={{ marginBottom: 14 }}>
                <ProgressStepper step={step} labels={[t.step1, t.step2]}/>
                <div style={{ background: "#FFF7E6", border: "1.5px solid #fde68a", borderRadius: 9, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <Spin/>
                  <span style={{ fontSize: 13, color: "#B45309", flex: 1, lineHeight: 1.5 }}>{step === 0 ? t.step1Hint : t.step2Hint}</span>
                  <button onClick={cancelAnalysis}
                    style={{ background: "#FEF0F0", color: "#991b1b", border: "1.5px solid #fca5a5", borderRadius: 7, padding: "7px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {t.cancelBtn}
                  </button>
                </div>
              </div>
            )}
            {/* Ambiguity picker — Claude returned candidates instead of a
                unique company match. User picks one, we re-run with the
                full name + city as `comp` / `loc` so the AI gets an
                unambiguous query the second time. */}
            {candidates && candidates.length > 0 && !busy && (
              <div style={{ padding: "13px 15px", background: "#FFF7E6", border: "1.5px solid #f59e0b", borderRadius: 8, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#B45309", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <MI name="help_outline" size={16} color="#B45309"/>{t.candidatesH}
                </div>
                <p style={{ fontSize: 12.5, color: "#92400e", margin: "0 0 10px", lineHeight: 1.55 }}>{t.candidatesB}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {candidates.map(function(c, i) {
                    return (
                      <button key={i}
                        onClick={function() {
                          setComp(c.name || "");
                          if (c.city) setLoc(c.city);
                          setCandidates(null);
                          setTimeout(handleAnalyze, 0);
                        }}
                        style={{ textAlign: "left", background: "#fff", border: "1.5px solid #fde68a", borderRadius: 6, padding: "10px 12px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#222F5C" }}>{c.name || "—"}</span>
                        <span style={{ fontSize: 12, color: "#4b5563" }}>
                          {c.city ? c.city : ""}{c.city && c.hint ? " · " : ""}{c.hint ? c.hint : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button onClick={function() { setCandidates(null); }}
                  style={{ marginTop: 10, background: "transparent", color: "#92400e", border: "none", padding: 0, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  ← {t.candidatesCancel}
                </button>
              </div>
            )}
            {errors.phase1 && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 8, background: "#FEF0F0", padding: "8px 12px", borderRadius: 4, display: "flex", alignItems: "flex-start", gap: 6 }}><MI name="warning" size={16} color="#dc2626"/><span>{errors.phase1}</span></p>}
            {errors.phase2 && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 8, background: "#FEF0F0", padding: "8px 12px", borderRadius: 4, display: "flex", alignItems: "flex-start", gap: 6 }}><MI name="warning" size={16} color="#dc2626"/><span>{errors.phase2}</span></p>}
            {!busy && <button onClick={handleAnalyze} style={S.pri}>{t.analyzeBtn}</button>}
          </div>
        )}

        {errors.general && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 8 }}>{errors.general}</p>}

        {/* ── Quellen in der Anfangsübersicht ── */}
        {!result && (
          <div style={{ marginTop: 28, borderRadius: 10, border: "1.5px solid #E3E3E6", overflow: "hidden" }}>
            <div style={{ background: "#f0f4ff", padding: "12px 18px", borderBottom: "1px solid #c7d2fe", display: "flex", alignItems: "center", gap: 8 }}>
              <MI name="menu_book" size={18} color="#222F5C"/>
              <span style={{ fontWeight: 800, fontSize: 13, color: "#222F5C" }}>{t.resTitle}</span>
            </div>
            <div style={{ padding: "16px 18px", background: "#fff" }}>
              <ResourcesSection t={t} compact={true}/>
            </div>
            <div style={{ padding: "10px 18px", background: "#FFF7E6", borderTop: "1px solid #FBBF24" }}>
              <p style={{ fontSize: 11.5, color: "#713f12", margin: 0, display: "flex", alignItems: "flex-start", gap: 6 }}><MI name="warning" size={14} color="#F97F08"/><span>{t.disclaimer}</span></p>
            </div>
          </div>
        )}

        {result && (
          <>
            {result.skippedClassification && (
              <div style={{ background: "#ECFDF3", border: "1px solid #86efac", borderRadius: 4, padding: "6px 12px", marginBottom: 10, fontSize: 12, fontWeight: 600, color: "#166534", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <MI name="bolt" size={14} color="#166534"/>{t.callsSaved}
              </div>
            )}

            <div style={{ borderRadius: 12, border: "2px solid " + scC, overflow: "hidden", marginTop: 4 }}>

              {/* ── WZ Result header ── */}
              <div style={{ background: result.unclassifiable ? "#f9fafb" : result.in_scope ? "#f0fff4" : "#fff5f5", padding: "20px 24px", borderBottom: "1px solid " + scC + "25" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <MI name={result.unclassifiable ? "help" : result.in_scope ? "verified" : "warning"} size={28} color={result.unclassifiable ? "#6b7280" : result.in_scope ? "#166534" : "#F97F08"}/>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: scC, marginBottom: 5 }}>{result.unclassifiable ? t.unclassH : result.in_scope ? t.inScopeH : t.outScopeH}</div>
                    <p style={{ fontSize: 13.5, color: "#374151", margin: 0, lineHeight: 1.65 }}>{result.unclassifiable ? t.unclassB : result.in_scope ? t.inScopeB : t.outScopeB}</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: "20px 24px", background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
                <div style={S.lbl}>{t.quellen}</div>
                <SrcBadges used={result.sources_used}/>
                <WzResultDisplay/>
                {result.reasoning && (
                  <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: "3px solid #93c5fd" }}>
                    <div style={Object.assign({}, S.lbl, { marginBottom: 5 })}>{t.reasoning}</div>
                    <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.65 }}>{result.reasoning}</p>
                  </div>
                )}
                {result.northdataOverride && (
                  <div style={{ marginTop: 10, padding: "11px 14px", background: "#FFF7E6", borderRadius: 8, border: "1.5px solid #f59e0b" }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#B45309", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><MI name="bolt" size={14} color="#F97F08"/>{lang === "de" ? "Zweistufige Prüfung — KI übersteuert Northdata" : "Two-stage check — AI overrides Northdata"}</div>
                    <p style={{ fontSize: 12.5, color: "#B45309", margin: 0, lineHeight: 1.6 }}>
                      {lang === "de"
                        ? "Northdata/Handelsregister weist WZ " + result.northdataWz + " aus (außerhalb des BSIG-Bereichs). Die KI-Produktanalyse ergibt jedoch eine Klassifikation im Anwendungsbereich — bitte intern verifizieren."
                        : "Northdata/commercial register shows WZ " + result.northdataWz + " (outside BSIG scope). However, the AI product analysis results in an in-scope classification — please verify internally."}
                    </p>
                  </div>
                )}
                {!result.directMode && !result.unclassifiable && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ padding: "10px 14px", background: "#FFF7E6", borderRadius: 8, border: "1px solid #FBBF24", marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: "#854d0e", marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}><MI name="warning" size={14} color="#F97F08"/>{t.aiWzNoteTitle}</div>
                      <p style={{ fontSize: 12.5, color: "#B45309", margin: 0, lineHeight: 1.55 }}>{t.aiWzNote}</p>
                    </div>
                    <WzHelpAccordion t={t} lang={lang} open={wzHelpResultOpen} setOpen={setWzHelpResultOpen}/>
                  </div>
                )}
              </div>

              {result.is_msp_hint && (
                <div style={{ padding: "14px 18px", background: "#fff7ed", borderBottom: "2px solid #f97316", display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <MI name="smart_toy" size={24} color="#324C9C"/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#c2410c", marginBottom: 5 }}>{t.mspHintTitle}</div>
                    <p style={{ fontSize: 13, color: "#7c2d12", margin: "0 0 8px", lineHeight: 1.65 }}>{t.mspHintText}</p>
                    {result.msp_hint_reason && (
                      <div style={{ background: "#fff", borderRadius: 4, border: "1px solid #fed7aa", padding: "7px 12px", marginBottom: 8, fontSize: 12.5, color: "#9a3412", fontStyle: "italic", lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 6 }}>
                        <MI name="chat" size={14} color="#c2410c"/><span>{result.msp_hint_reason}</span>
                      </div>
                    )}
                    <a href={BT_DRSACHE} target="_blank" rel="noreferrer" style={Object.assign({}, S.link("#c2410c"), { fontSize: 12, gap: 4 })}><MI name="balance" size={14} color="#c2410c"/>{t.mspHintBasis} ↗</a>
                  </div>
                </div>
              )}
              {!result.directMode && compData && <SrcSummaryCard t={t} compData={compData} companyName={comp}/>}

              <div style={{ padding: "12px 24px", background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: .4, display: "inline-flex", alignItems: "center", gap: 6 }}><MI name="analytics" size={14} color="#166534"/>DESTATIS WZ 2008</span>
                <a href={DESTATIS_PDF}  target="_blank" rel="noreferrer" style={S.link("#166534")}>{t.destPDF} ↗</a>
                <a href={DESTATIS_XLSX} target="_blank" rel="noreferrer" style={S.link("#166534")}>{t.destXLSX} ↗</a>
              </div>

              {/* Catalogue entries the classification was checked against.
                  Every row is a real Meldenummer, so the answer can be
                  verified against the GP 2019 PDF by hand. */}
              {Array.isArray(result.gp_hits) && result.gp_hits.length > 0 && (
                <div style={{ padding: "14px 24px", background: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: .4, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <MI name="menu_book" size={14} color="#374151"/>{t.gpHitsTitle}
                  </div>
                  <p style={{ fontSize: 11.5, color: "#6b7280", margin: "0 0 9px", lineHeight: 1.5 }}>{t.gpHitsHint}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {result.gp_hits.map(function(h, i) {
                      var div = parseInt(h.wz.slice(0, 2), 10);
                      var out = !(div >= 26 && div < 31);
                      return (
                        <div key={i} style={{ display: "flex", gap: 9, alignItems: "baseline", fontSize: 12.5, lineHeight: 1.45 }}>
                          <code style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11.5, color: "#374151", whiteSpace: "nowrap", flexShrink: 0 }}>{gpFormatCode(h.gp)}</code>
                          <span style={{ fontWeight: 700, color: out ? "#B45309" : "#166534", whiteSpace: "nowrap", flexShrink: 0 }}>
                            {h.wz}{out ? " · " + t.gpOutOfScope : ""}
                          </span>
                          <span style={{ color: "#4b5563" }}>{h.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <CheckSequenceBadge/>
              <MspCheck t={t} lang={lang} mspSels={mspSels} setMspSels={setMspSels}/>
              {result.in_scope && (hasMspRisk ? <NegligibilityBlocked key="neg-blocked" t={t}/> : <NegligibilityInteractive key={"neg-interactive-" + lang} t={t}/>)}
              <ITIndependenceCheck key={lang} t={t} mspSels={mspSels} onResult={setItResult}/>
              <ThresholdCheck key={lang + "-thresh"} t={t} mspSels={mspSels} itResult={itResult}/>

              {/* ── Next Steps ── */}
              <div style={{ padding: "20px 24px", background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
                <div style={S.lbl}>{t.nextSteps}</div>
                {(result.in_scope ? t.stepsIn : t.stepsOut).map(function(s, i) {
                  var isDone = s.startsWith("✅");
                  var text = isDone ? s.replace(/^✅\s*/, "") : s;
                  return (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 9, alignItems: "flex-start" }}>
                      <span style={{ color: isDone ? "#166534" : "#222F5C", fontWeight: 800, minWidth: 20, fontSize: 13, flexShrink: 0, display: "inline-flex", justifyContent: "center" }}>
                        {isDone ? <MI name="check_circle" size={16} color="#166534"/> : ((i + 1) + ".")}
                      </span>
                      <span style={{ fontSize: 13, color: isDone ? "#166534" : "#374151", lineHeight: 1.6 }}>{text}</span>
                    </div>
                  );
                })}
              </div>

              {/* ── Resources ── */}
              <div style={{ padding: "20px 24px", background: "#f8fafc", borderBottom: "1px solid #f0f0f0" }}>
                <ResourcesSection t={t} compact={false}/>
              </div>

              <div style={{ padding: "12px 24px", background: "#FFF7E6", borderTop: "2px solid #FBBF24" }}>
                <p style={{ fontSize: 12, color: "#713f12", margin: 0, lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 6 }}><MI name="warning" size={14} color="#F97F08"/><span>{t.disclaimer}</span></p>
              </div>
            </div>
            <div style={{ marginTop: 16 }}><button onClick={reset} style={S.sec}>{t.reset}</button></div>
          </>
        )}
      </div>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}} @keyframes ping{0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(2);opacity:0}}"}</style>
    </div>
  );
}