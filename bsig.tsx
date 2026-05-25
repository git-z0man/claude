import { useState, useCallback, useMemo, useRef, useEffect } from "react";

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
28.30 – Land-/Forstwirtschaftsmaschinen: Traktoren, Pflüge, Eggen, Sämaschinen, Mähdrescher, Erntemaschinen, Rasenmäher, Melkmaschinen, Futtermittelmaschinen
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
  var m = clean.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("No JSON in response");
  try { return JSON.parse(m[0]); }
  catch(e) { throw new Error("Invalid JSON: " + e.message); }
}

async function callClaude(messages, useWebSearch, maxTokens, signal, timeoutMs) {
  var body = { model: "claude-sonnet-4-20250514", max_tokens: maxTokens || 800, messages };
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
    var opts = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: localCtrl.signal };
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
  var exJson = '{"gegenstand":"...","nace_code":"28.93","nace_found":true,"rechtsform":"GmbH","ort":"Muenchen","northdata_url":"https://www.northdata.de/...","hr_nummer":"HRB 12345","amtsgericht":"Muenchen","products":"Werkzeugmaschinen, Linearmotoren"}';
  var de = lang === "de";
  var prompt = de
    ? ('Suche auf northdata.de nach "' + ndQuery + '" (URL-Muster: ' + ndUrl + ') sowie auf handelsregister.de und der offiziellen Unternehmenswebsite.\nExtrahiere: gegenstand, nace_code (oder null), nace_found, rechtsform, ort, northdata_url, hr_nummer, amtsgericht, products (max. 12 Produkte).\nAntworte NUR als JSON: ' + exJson)
    : ('Search northdata.de for "' + ndQuery + '" (URL pattern: ' + ndUrl + ') as well as handelsregister.de and the official company website.\nExtract: gegenstand, nace_code (or null), nace_found, rechtsform, ort, northdata_url, hr_nummer, amtsgericht, products (max. 12).\nReply ONLY as JSON: ' + exJson);
  var txt = await callClaude([{ role: "user", content: prompt }], true, 900, signal, 40000);
  var parsed = parseJson(txt);
  if (!parsed.gegenstand && !parsed.products) throw new Error("No usable data returned");
  return parsed;
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
  if (compData && compData.nace_found && compData.nace_code) {
    var code = compData.nace_code, num = parseFloat(code);
    if (num >= 26 && num < 31) {
      return {
        primary_wz: code, primary_label: WZ_LABELS[code] || WZ_LABELS[String(Math.floor(num))] || "",
        in_scope: true, confidence: lang === "de" ? "hoch" : "high",
        reasoning: lang === "de"
          ? "NACE-Code " + code + " direkt aus Handelsregister (Northdata) — im Anwendungsbereich BSIG 2025 Anlage 2 Nr. 5."
          : "NACE code " + code + " taken directly from commercial register (Northdata) — within scope of BSIG 2025 Annex 2 No. 5.",
        alternative_wz: [], sources_used: ["northdata"], skippedClassification: true,
      };
    }
  }
  var ndOutOfScope = compData && compData.nace_found && compData.nace_code;
  var naceHint = (compData && compData.nace_code && !ndOutOfScope) ? compData.nace_code : null;
  var wzList   = relevantWzLabels(naceHint);
  var de = lang === "de";
  var contextParts = [];
  if (compData) {
    var naceNote = compData.nace_found
      ? (de ? "NACE laut Register (außerhalb BSIG-Bereich): " : "NACE from register (outside BSIG scope): ") + compData.nace_code
      : (de ? "Kein NACE-Code im Register" : "No NACE code in register");
    contextParts.push("\nHandelsregister/Northdata:\n- Gegenstand: " + (compData.gegenstand || "-") + "\n- " + naceNote + "\n- " + [compData.rechtsform, compData.ort].filter(Boolean).join(" - "));
    if (compData.hr_nummer) contextParts.push("\n- HR: " + compData.hr_nummer + (compData.amtsgericht ? " AG " + compData.amtsgericht : ""));
  }
  var scopeRule = de
    ? "\nSCOPE: in_scope=true fuer WZ 26.xx-30.99. Wichtig: Der Handelsregister-NACE kann unvollständig sein. Prüfe die tatsächlichen Produkte sorgfältig.\n"
    : "\nSCOPE: in_scope=true for WZ 26.xx-30.99. Important: The commercial register NACE may be incomplete. Check the actual products carefully.\n";
  var exJson = '{"primary_wz":"28.41","primary_label":"Herst. von Maschinen fuer die Metallbearbeitung","in_scope":true,"confidence":"hoch","reasoning":"Max 2 Saetze.","sources_used":["products"],"alternative_wz":[],"is_msp_hint":false,"msp_hint_reason":null}';
  var mspRule = de
    ? "\nMSP-ERKENNUNG: is_msp_hint=true bei MSP-Merkmalen (IT-Systemhaus, Cloud, Remote-Monitoring, Helpdesk, IT-Outsourcing) mit kurzer msp_hint_reason. Sonst false/null.\nWICHTIG: reasoning max. 2 Saetze. Antworte NUR mit gueltigem JSON ohne Zeilenumbrueche oder Sonderzeichen ausser UTF-8.\n"
    : "\nMSP DETECTION: is_msp_hint=true for MSP indicators (IT systems house, cloud, remote monitoring, helpdesk, IT outsourcing) with short msp_hint_reason. Otherwise false/null.\nIMPORTANT: reasoning max. 2 sentences. Reply ONLY with valid JSON, no line breaks in string values.\n";
  var prodStr = products || (compData && compData.products) || "-";
  var prompt = de
    ? ("Experte BSIG 2025 + DESTATIS WZ 2008 + GP 2019. Bestimme WZ fuer: " + company + "\nProdukte: " + prodStr + contextParts.join("") + scopeRule + mspRule + "\nVerfuegbare WZ (inkl. relevante Abt. 25 zur Abgrenzung):\n" + wzList + "\n\nPRODUKT-REFERENZ GP 2019 – Abteilung 25 (Abgrenzung zu Abt. 28):\n" + GP2019_REF_25 + "\n\nPRODUKT-REFERENZ GP 2019 – Abteilung 28:\n" + GP2019_REF + "\nAntworte NUR als JSON: " + exJson)
    : ("Expert BSIG 2025 + DESTATIS WZ 2008 + GP 2019. Determine WZ for: " + company + "\nProducts: " + prodStr + contextParts.join("") + scopeRule + mspRule + "\nAvailable WZ (incl. relevant Div. 25 for boundary cases):\n" + wzList + "\n\nPRODUCT REFERENCE GP 2019 – Division 25 (boundary to Div. 28):\n" + GP2019_REF_25 + "\n\nPRODUCT REFERENCE GP 2019 – Division 28:\n" + GP2019_REF + "\nReply ONLY as JSON: " + exJson);
  var txt    = await callClaude([{ role: "user", content: prompt }], false, 2500, signal, 30000);
  var parsed = parseJson(txt);
  // Normalize alternative_wz: API may return objects instead of strings
  if (Array.isArray(parsed.alternative_wz)) {
    parsed.alternative_wz = parsed.alternative_wz.map(function(entry) {
      if (typeof entry === "object" && entry !== null) return entry.wz || entry.label || "";
      return String(entry);
    }).filter(Boolean);
  }
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
    modeYes:  de ? "🔢  Ja — WZ-Nummer(n) direkt eingeben" : "🔢  Yes — enter WZ code(s) directly",
    modeNo:   de ? "🔍  Nein — Erweiterte Analyse" : "🔍  No — Extended Analysis",
    modeNoHint: de ? "KI-Analyse · erfordert ein Claude-Konto (Anthropic)" : "AI analysis · requires a Claude account (Anthropic)",
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
    inScopeH:  de ? "Im Anwendungsbereich — BSIG 2025 Anlage 2 Nr. 5" : "Within Scope — BSIG 2025 Annex 2 No. 5",
    inScopeB:  de ? "Mindestens eine der angegebenen WZ-Nummern liegt im Bereich 26–30. Ihr Unternehmen fällt damit grundsätzlich unter Anlage 2 Nr. 5 BSIG 2025." : "At least one of the entered WZ codes falls within range 26–30. Your company is generally covered by Annex 2 No. 5 BSIG 2025.",
    outScopeH: de ? "Voraussichtlich außerhalb des Anwendungsbereichs" : "Likely Outside Scope",
    outScopeB: de ? "Keine der angegebenen WZ-Nummern liegt im Bereich 26–30. Anlage 2 Nr. 5 BSIG 2025 ist voraussichtlich nicht einschlägig." : "None of the entered WZ codes falls within range 26–30. Annex 2 No. 5 BSIG 2025 is likely not applicable.",
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
      { id: 0, icon: "🏭", label: "IT-Dienstleistungen im Konzernverbund", desc: "Wir erbringen IT-Leistungen für andere verbundene Unternehmen im Konzern (z.B. Rechenzentrumsbetrieb, ERP-Betrieb, Netzwerkinfrastruktur, Softwarelizenzen) — unabhängig davon, ob wir selbst IT-Dienste von einer Konzern- oder Muttergesellschaft beziehen." },
      { id: 1, icon: "🔧", label: "IT-gestützte Dienste für Kunden", desc: "Wir bieten Kunden vertraglich IT-gestützte Leistungen an, z.B. Fernwartung mit SLAs, proaktives Monitoring (Condition Monitoring), Vor-Ort-Serviceeinsätze mit IT-Bezug bei Kundenanlagen." },
      { id: 2, icon: "⬆️", label: "Abhängig von Konzern-IT der Mutter", desc: "Eine übergeordnete Mutter-/Konzerngesellschaft erbringt zentrale IT-Dienste für unser Unternehmen. Wichtig: Dies führt meist zur IT-Unselbständigkeit — bitte den nachfolgenden Prüfschritt beachten." },
      { id: 3, icon: "✖️", label: "Keine dieser Konstellationen", desc: "Wir betreiben unsere IT ausschließlich für uns selbst und bieten keine IT-Dienste für Dritte oder verbundene Unternehmen an.", exclusive: true },
    ] : [
      { id: 0, icon: "🏭", label: "IT services within the group", desc: "We provide IT services to other affiliated companies within the group (e.g. data centre operations, ERP, network infrastructure, software licences) — regardless of whether we ourselves receive IT services from a parent or group company." },
      { id: 1, icon: "🔧", label: "IT-based services for customers", desc: "We contractually provide customers with IT-based services, e.g. remote maintenance with SLAs, proactive monitoring (condition monitoring), on-site service with IT relevance at customer sites." },
      { id: 2, icon: "⬆️", label: "Dependent on parent group IT", desc: "A parent or group company centrally provides IT services to our entity. Important: This usually leads to IT non-independence — please refer to the subsequent check step." },
      { id: 3, icon: "✖️", label: "None of the above", desc: "We operate our IT exclusively for ourselves and do not provide IT services to third parties or affiliated companies.", exclusive: true },
    ],
    mspAlerts: de ? [
      { title: "MSP-Einstufungsrisiko: IT-Dienstleistungen im Konzernverbund", col: "#991b1b", bg: "#fef2f2", bdr: "#fca5a5", text: "Ihre Gesellschaft könnte als Managed Service Provider nach Anlage 1 Nr. 6.1.10 BSIG 2025 einzustufen sein — unabhängig davon, ob sie gleichzeitig selbst IT-Dienste von einer übergeordneten Konzerngesellschaft bezieht. Das Gesetz stellt auf die einzelne Rechtspersönlichkeit ab: Erbringt eine Gesellschaft relevante IT-Leistungen für andere verbundene Unternehmen, gelten diese als \"Kunden\". Eine MSP-Einstufung führt bei Überschreitung der Schwellenwerte für mittlere Unternehmen regelmäßig zur Einstufung als besonders wichtige Einrichtung (§ 28 Abs. 1 BSIG 2025).", hint: "Rechtsberatung dringend empfohlen." },
      { title: "MSP-Einstufungsrisiko: IT-gestützte Kundendienste", col: "#991b1b", bg: "#fef2f2", bdr: "#fca5a5", text: "Unternehmen, die Kunden vertraglich IT-gestützte Dienste erbringen, können als Managed Service Provider nach § 2 Nr. 26 BSIG 2025 einzustufen sein. Auch hier führt die MSP-Einstufung bei Überschreitung der mittleren Schwellenwerte zur Einstufung als besonders wichtige Einrichtung.", hint: "Prüfung empfohlen: § 2 Nr. 26 i.V.m. Anlage 1 Nr. 6.1.10 BSIG 2025." },
      { title: "Hinweis: Separate MSP-Prüfung der Konzernmutter erforderlich", col: "#92400e", bg: "#fffbeb", bdr: "#fcd34d", text: "Die IT-Dienste erbringende Konzern- oder Muttergesellschaft sollte separat auf eine MSP-Einstufung nach Anlage 1 Nr. 6.1.10 BSIG 2025 geprüft werden. Für Ihr Unternehmen ist zudem die IT-Selbständigkeit zu prüfen (nachfolgender Prüfschritt).", hint: null },
    ] : [
      { title: "MSP classification risk: Central group IT service provider", col: "#991b1b", bg: "#fef2f2", bdr: "#fca5a5", text: "Your entity may qualify as a Managed Service Provider under Annex 1 No. 6.1.10 BSIG 2025. The law refers to individual legal entities — the other group companies are treated as \"customers\". An MSP classification regularly leads to classification as a particularly important entity if the thresholds for medium-sized enterprises are exceeded (§ 28 Para. 1 BSIG 2025).", hint: "Legal advice strongly recommended." },
      { title: "MSP classification risk: IT-based customer services", col: "#991b1b", bg: "#fef2f2", bdr: "#fca5a5", text: "Companies contractually providing customers with IT-based services may qualify as Managed Service Providers under § 2 No. 26 BSIG 2025. MSP classification leads to classification as a particularly important entity if medium-sized thresholds are exceeded.", hint: "Review recommended: § 2 No. 26 in conjunction with Annex 1 No. 6.1.10 BSIG 2025." },
      { title: "Note: Separate MSP review of parent company required", col: "#92400e", bg: "#fffbeb", bdr: "#fcd34d", text: "The group or parent company providing IT services should separately be assessed for MSP classification under Annex 1 No. 6.1.10 BSIG 2025. For your entity, IT independence should also be assessed (see next check step).", hint: null },
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
        { icon: "⚖️", title: "BSIG 2025 — Verabschiedetes Gesetz", sub: "Volltext auf gesetze-im-internet.de", href: BSIG_BASE },
        { icon: "📋", title: "Erwägungsgründe (reuschlaw)", sub: "bsi-gesetz.de — strukturierte Übersicht", href: REUSCHLAW },
        { icon: "📄", title: "BT-Drucksache 21/1501", sub: "Offizielle Gesetzesbegründung", href: BT_DRSACHE },
        { icon: "📚", title: "Vernachlässigbarkeit — Langversion (beck-online)", sub: "Vollständiges Prüfschema", href: BECK_NEG_URL },
      ]},
      { label: "BSI — Regulierungsbehörde", items: [
        { icon: "🛡️", title: "BSI-Infopakete für regulierte Einrichtungen", sub: "Leitfäden, Checklisten, Formulare", href: BSI_INFOPAKET },
      ]},
      { label: "VDMA — Branchenverband Maschinenbau", items: [
        { icon: "🏭", title: "VDMA-Hilfen für betroffene Maschinenbauer", sub: "Praxisleitfäden, Muster, Ansprechpartner", href: VDMA_HILFEN },
        { icon: "📅", title: "VDMA-Veranstaltungen zu NIS-2", sub: "Seminare, Webinare, Workshops", href: VDMA_EVENTS },
      ]},
      { label: "DESTATIS — WZ-Klassifikation", items: [
        { icon: "📊", title: "WZ 2008 — Vollständige Klassifikation (PDF)", sub: "Amtliche DESTATIS-Ausgabe", href: DESTATIS_PDF },
        { icon: "📑", title: "WZ 2008 — Alphabetisches Stichwortverzeichnis (XLSX)", sub: "Suche nach Produkten / Tätigkeiten", href: DESTATIS_XLSX },
      ]},
    ] : [
      { label: "Law & Explanatory Memorandum", items: [
        { icon: "⚖️", title: "BSIG 2025 — Enacted Law", sub: "Full text at gesetze-im-internet.de", href: BSIG_BASE },
        { icon: "📋", title: "Recitals overview (reuschlaw)", sub: "bsi-gesetz.de — structured overview", href: REUSCHLAW },
        { icon: "📄", title: "BT-Drucksache 21/1501", sub: "Official explanatory memorandum", href: BT_DRSACHE },
        { icon: "📚", title: "Negligibility — Long version (beck-online)", sub: "Full assessment schema", href: BECK_NEG_URL },
      ]},
      { label: "BSI — Regulatory Authority", items: [
        { icon: "🛡️", title: "BSI Information Packages for Regulated Entities", sub: "Guides, checklists, forms", href: BSI_INFOPAKET },
      ]},
      { label: "VDMA — Machinery Industry Association", items: [
        { icon: "🏭", title: "VDMA Guidance for Affected Machinery Manufacturers", sub: "Practical guides, templates, contacts", href: VDMA_HILFEN },
        { icon: "📅", title: "VDMA NIS-2 Events", sub: "Seminars, webinars, workshops", href: VDMA_EVENTS },
      ]},
      { label: "DESTATIS — WZ Classification", items: [
        { icon: "📊", title: "WZ 2008 — Full Classification (PDF)", sub: "Official DESTATIS edition", href: DESTATIS_PDF },
        { icon: "📑", title: "WZ 2008 — Alphabetical Keyword Index (XLSX)", sub: "Search by product / activity", href: DESTATIS_XLSX },
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
    errPhase2:    de ? "WZ-Klassifikation fehlgeschlagen. Bitte erneut versuchen." : "WZ classification failed. Please try again.",
    reset:        de ? "Neue Prüfung" : "New check",
    disclaimer:   de ? "Erstorientierung — ersetzt keine Rechts- oder Fachberatung. Rechtsstand: BSIG 2025 (in Kraft seit 6. Dezember 2025) · DESTATIS WZ 2008." : "For initial orientation only — does not replace legal or specialist advice. Legal status: BSIG 2025 (in force since 6 December 2025) · DESTATIS WZ 2008.",
  };
}

// ── Styles ────────────────────────────────────────────────────────────────────
var S = {
  lbl:  { fontWeight: 700, fontSize: 11.5, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: .6, display: "block" },
  inp:  { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none" },
  pri:  { background: "#1a365d", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8 },
  sec:  { background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontWeight: 700, fontSize: 14 },
  pill: function(bg, col) { return { display: "inline-flex", alignItems: "center", gap: 5, background: bg, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: col }; },
  link: function(col) { return { fontSize: 12.5, color: col || "#1d4ed8", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }; },
  card: function(border, bg) { return { background: bg || "#fff", borderRadius: 10, border: "1.5px solid " + (border || "#e5e7eb"), padding: "14px 16px" }; },
  numInp: { padding: "8px 12px", borderRadius: 7, border: "1.5px solid #e5e7eb", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none", width: "100%", textAlign: "right" },
};

var CONF_COL = { hoch: "#38a169", mittel: "#d69e2e", niedrig: "#e53e3e", high: "#38a169", medium: "#d69e2e", low: "#e53e3e" };
var SRC_META = {
  northdata:            { icon: "🏢", bg: "#dbeafe", col: "#1d4ed8" },
  "handelsregister.ai": { icon: "🏛️", bg: "#ede9fe", col: "#6d28d9" },
  destatis:             { icon: "📊", bg: "#dcfce7", col: "#166534" },
  products:             { icon: "⚙️", bg: "#fef9c3", col: "#854d0e" },
  direct:               { icon: "✏️", bg: "#f3f4f6", col: "#374151" },
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
        var col = done ? "#38a169" : current ? "#1a365d" : "#9ca3af";
        var bg  = done ? "#dcfce7" : current ? "#dbeafe" : "#f3f4f6";
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < labels.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: bg, border: "2px solid " + col, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {done ? <span style={{ fontSize: 13, color: "#166534" }}>✓</span>
                      : current ? <Spin />
                      : <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af" }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: 12, fontWeight: current ? 700 : 400, color: col, whiteSpace: "nowrap" }}>{lbl}</span>
            </div>
            {i < labels.length - 1 && <div style={{ flex: 1, height: 2, background: done ? "#86efac" : "#e5e7eb", margin: "0 8px" }}/>}
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
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8" }}>ℹ️ {t.wzHelp.trigger}</span>
        <span style={{ fontSize: 14, color: "#1d4ed8", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
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
                    <span style={{ fontWeight: 900, fontSize: 14, color: "#1a365d", fontFamily: "monospace" }}>{ex[0]}</span>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{ex[1]}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ background: "#f0fdf4", borderRadius: 7, padding: "10px 13px", marginBottom: 12, borderLeft: "3px solid #4ade80" }}>
            <p style={{ fontSize: 13, color: "#14532d", margin: 0, lineHeight: 1.6 }}>{t.wzHelp.stat}</p>
          </div>
          <div style={{ background: "#fffbeb", borderRadius: 7, padding: "10px 13px", marginBottom: 12, borderLeft: "3px solid #f59e0b" }}>
            <p style={{ fontSize: 13, color: "#78350f", margin: 0, lineHeight: 1.65, fontWeight: 500 }}>💡 {t.wzHelp.tip}</p>
          </div>
          <div style={{ background: "#fff1f2", borderRadius: 7, padding: "10px 13px", marginBottom: 10, borderLeft: "3px solid #f87171" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", margin: "0 0 5px" }}>⚠️ {lang === "de" ? "Achtung: Meldedaten können veraltet sein" : "Caution: Reported data may be outdated"}</p>
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
        <span style={{ fontSize: compact ? 15 : 17 }}>📚</span>
        <span style={{ fontWeight: 800, fontSize: compact ? 13 : 14, color: "#1a365d" }}>{t.resTitle}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 12 : 16 }}>
        {t.resGroups.map(function(grp, gi) {
          return (
            <div key={gi}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 3 }}>{grp.label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: compact ? 4 : 6 }}>
                {grp.items.map(function(item, ii) {
                  return (
                    <a key={ii} href={item.href} target="_blank" rel="noreferrer"
                      style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: compact ? "7px 10px" : "9px 12px", borderRadius: 8, background: "#fff", border: "1px solid #e5e7eb", textDecoration: "none" }}>
                      <span style={{ fontSize: compact ? 15 : 18, flexShrink: 0, lineHeight: 1.3 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: compact ? 12.5 : 13, color: "#1a365d" }}>{item.title}</div>
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
    <div style={{ padding: "20px 24px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 16 }}>🔎</span>
        <span style={{ fontWeight: 800, fontSize: 14, color: "#1a365d" }}>{t.srcCompTitle}</span>
      </div>
      <p style={{ fontSize: 12.5, color: "#6b7280", margin: "0 0 12px", lineHeight: 1.5 }}>{t.srcCompNote}</p>
      {compData.gegenstand && (
        <div style={{ background: "#fff", borderRadius: 9, border: "1.5px solid #e5e7eb", padding: "12px 14px", marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>{t.colGegenstand}</div>
          <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.65, borderLeft: "3px solid #bfdbfe", paddingLeft: 10 }}>{compData.gegenstand}</p>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
        {compData.nace_found && compData.nace_code ? (
          <div style={{ background: wzInScope ? "#ecfdf5" : "#f9fafb", border: "1.5px solid " + (wzInScope ? "#86efac" : "#e5e7eb"), borderRadius: 8, padding: "10px 16px", textAlign: "center", minWidth: 110 }}>
            <div style={{ fontWeight: 900, fontSize: 26, color: wzInScope ? "#166534" : "#1a365d", lineHeight: 1 }}>{compData.nace_code}</div>
            <div style={{ fontSize: 10, background: "#dcfce7", color: "#166534", borderRadius: 4, padding: "2px 6px", fontWeight: 700, marginTop: 5, display: "inline-block" }}>✓ {t.nacePresentBadge}</div>
            {WZ_LABELS[compData.nace_code] && <div style={{ fontSize: 10.5, color: "#374151", marginTop: 5, lineHeight: 1.35 }}>{WZ_LABELS[compData.nace_code]}</div>}
          </div>
        ) : (
          <div style={{ background: "#fffbeb", border: "1.5px solid #fde047", borderRadius: 8, padding: "10px 14px", textAlign: "center", minWidth: 110 }}>
            <div style={{ fontSize: 11, background: "#fef3c7", color: "#92400e", borderRadius: 4, padding: "3px 7px", fontWeight: 700, display: "inline-block", marginBottom: 4 }}>⚠ {t.naceAbsentBadge}</div>
          </div>
        )}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {[compData.rechtsform, compData.ort].filter(Boolean).map(function(m, i) {
              return <span key={i} style={{ fontSize: 10.5, background: "#eff6ff", color: "#1d4ed8", borderRadius: 4, padding: "2px 7px", fontWeight: 600, border: "1px solid #bfdbfe" }}>{m}</span>;
            })}
            {compData.hr_nummer && <span style={{ fontSize: 10.5, background: "#faf5ff", color: "#6d28d9", borderRadius: 4, padding: "2px 7px", fontWeight: 600, border: "1px solid #e9d5ff" }}>{compData.hr_nummer}</span>}
            {compData.amtsgericht && <span style={{ fontSize: 10.5, background: "#faf5ff", color: "#6d28d9", borderRadius: 4, padding: "2px 7px", fontWeight: 600, border: "1px solid #e9d5ff" }}>AG {compData.amtsgericht}</span>}
          </div>
          {compData.products && (
            <div style={{ fontSize: 11.5, color: "#374151", background: "#fef9c3", borderRadius: 6, padding: "5px 9px", border: "1px solid #fde047", lineHeight: 1.5 }}>
              ⚙️ {compData.products}
            </div>
          )}
          <a href={ndUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#1d4ed8", textDecoration: "none", width: "fit-content" }}>
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
    <div style={{ padding: "20px 24px", background: "#fffbeb", borderBottom: "1px solid #fde68a", borderTop: "2px solid #f59e0b" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 18 }}>🏗️</span>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#92400e" }}>{t.mspTitle}</div>
        {mspSels.some(function(s) { return s; }) && (
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700, border: "1px solid #86efac" }}>
            ✓ {lang === "de" ? "Prüfung abgeschlossen" : "Check complete"}
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, color: "#78350f", margin: "0 0 10px", lineHeight: 1.6 }}>{t.mspIntro}</p>
      <div style={{ background: "#fff7ed", borderRadius: 8, padding: "11px 14px", borderLeft: "3px solid #f59e0b", marginBottom: 10 }}>
        <p style={{ fontSize: 13, color: "#78350f", margin: "0 0 8px", lineHeight: 1.65 }}><strong>📖 {t.mspDef}</strong></p>
        <p style={{ fontSize: 13, color: "#78350f", margin: 0, lineHeight: 1.65 }}>{t.mspKonzern}</p>
      </div>
      <a href={BT_DRSACHE} target="_blank" rel="noreferrer" style={Object.assign({}, S.link("#92400e"), { fontSize: 12, marginBottom: 14, display: "inline-flex" })}>⚖️ {t.mspBasis} ↗</a>
      <div style={Object.assign({}, S.lbl, { marginTop: 12 })}>{t.mspQ}</div>
      {t.mspOpts.map(function(opt, i) {
        var sel = mspSels[i], isNone = opt.exclusive;
        return (
          <div key={i} role="checkbox" aria-checked={sel} tabIndex={0}
            onClick={function(e) { handleClick(e, i, opt.exclusive); }}
            onKeyDown={function(e) { if (e.key === " " || e.key === "Enter") handleClick(e, i, opt.exclusive); }}
            style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 14px", borderRadius: 9, border: "1.5px solid " + (sel ? (isNone ? "#d1d5db" : "#f59e0b") : "#e5e7eb"), background: sel ? (isNone ? "#f9fafb" : "#fffbeb") : "#fff", marginBottom: 8, cursor: "pointer", userSelect: "none" }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2, border: "2px solid " + (sel ? (isNone ? "#6b7280" : "#f59e0b") : "#9ca3af"), background: sel ? (isNone ? "#6b7280" : "#f59e0b") : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {sel && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: sel ? 700 : 500, color: "#111827", marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                <span>{opt.icon}</span>{opt.label}
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
              <p style={{ fontSize: 12.5, color: "#9f1239", margin: 0, lineHeight: 1.6, fontWeight: 600 }}>⚡ {t.mspHigherTier}</p>
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
            <a href={BSIG_BASE + "__2.html"} target="_blank" rel="noreferrer" style={Object.assign({}, S.link("#92400e"), { fontSize: 12 })}>⚖️ § 2 Nr. 26 BSIG 2025 ↗</a>
            <a href={BT_DRSACHE} target="_blank" rel="noreferrer" style={Object.assign({}, S.link("#92400e"), { fontSize: 12 })}>📄 BT-Drucksache 21/1501 ↗</a>
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
        <span style={{ fontSize: 18 }}>🚫</span>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#991b1b" }}>{t.negBlockedTitle}</div>
      </div>
      <p style={{ fontSize: 13.5, color: "#991b1b", margin: "0 0 12px", lineHeight: 1.65, fontWeight: 600 }}>{t.negBlockedText}</p>
      <div style={{ background: "#fff", borderRadius: 9, border: "1.5px solid #fca5a5", padding: "13px 15px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", textTransform: "uppercase", letterSpacing: .5, marginBottom: 7 }}>📖 Gesetzesbegründung BSIG 2025</div>
        <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.7, borderLeft: "3px solid #fca5a5", paddingLeft: 11 }}>{t.negBlockedReason}</p>
      </div>
      <div style={{ background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a", padding: "10px 13px", marginBottom: 10 }}>
        <p style={{ fontSize: 12.5, color: "#92400e", margin: 0, lineHeight: 1.6 }}>⚠️ {t.negBlockedNote}</p>
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
    <div style={{ padding: "20px 24px", background: "#f0f4ff", borderBottom: "1px solid #c7d2fe", borderTop: "2px solid #4f46e5" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>🔬</span>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#3730a3" }}>{t.negTitle}</div>
      </div>
      <p style={{ fontSize: 13, color: "#3730a3", margin: "0 0 4px", lineHeight: 1.6 }}>{t.negIntro}</p>
      <p style={{ fontSize: 11, color: "#6366f1", margin: "0 0 16px" }}>
        {t.negSrc} — <a href={BECK_NEG_URL} target="_blank" rel="noreferrer" style={{ color: "#4f46e5", fontWeight: 600 }}>beck-online ↗</a>
      </p>
      {steps.slice(0, visibleCount).map(function(step, i) {
        var borderCol = answers[i] === false ? "#f87171" : answers[i] === true ? "#86efac" : "#c7d2fe";
        return (
          <div key={i} style={{ marginBottom: 12, background: "#fff", borderRadius: 10, border: "1.5px solid " + borderCol, overflow: "hidden" }}>
            <div style={{ background: "#eef2ff", padding: "10px 14px", borderBottom: "1px solid #c7d2fe", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "#4f46e5", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#3730a3" }}>{step.label}</span>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <p style={{ fontSize: 13, color: "#111827", margin: "0 0 6px", lineHeight: 1.6, fontWeight: 500 }}>{step.q}</p>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 10px", lineHeight: 1.5 }}>{step.hint}</p>
              {step.warn && (
                <div style={{ background: "#fefce8", border: "1px solid #fde047", borderRadius: 7, padding: "9px 12px", marginBottom: 10 }}>
                  {step.warn.split("\n").map(function(line, li) {
                    return <p key={li} style={{ fontSize: 12, color: "#78350f", margin: li === 0 ? "0 0 4px" : 0, lineHeight: 1.55 }}>{line}</p>;
                  })}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[true, false].map(function(val, vi) {
                  var sel = answers[i] === val;
                  var col = val ? "#166534" : "#991b1b";
                  var bg  = val ? (sel ? "#dcfce7" : "#f0fdf4") : (sel ? "#fee2e2" : "#fff5f5");
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
      {anyNo && !allYes && <div style={{ padding: "12px 14px", borderRadius: 8, background: "#fee2e2", border: "1.5px solid #fca5a5", marginTop: 4 }}>
        <p style={{ fontSize: 13, color: "#991b1b", margin: 0, lineHeight: 1.6, fontWeight: 600 }}>⚠️ {t.negResultPos}</p>
      </div>}
      {allYes && <div style={{ padding: "12px 14px", borderRadius: 8, background: "#f0fff4", border: "1.5px solid #86efac", marginTop: 4 }}>
        <p style={{ fontSize: 13, color: "#166534", margin: "0 0 8px", lineHeight: 1.6, fontWeight: 600 }}>✅ {t.negResultNeg}</p>
        <a href={BECK_NEG_URL} target="_blank" rel="noreferrer" style={S.link("#166534")}>📚 Langversion Prüfschema (beck-online) ↗</a>
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
          <span style={{ fontSize: 18 }}>🚫</span>
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
  var resCol  = { yes: "#166534", partial: "#92400e", no: "#991b1b" };
  var resBg   = { yes: "#dcfce7", partial: "#fffbeb", no: "#fee2e2" };
  var resBdr  = { yes: "#86efac", partial: "#fcd34d", no: "#fca5a5" };
  var resIcon = { yes: "✅", partial: "⚠️", no: "🚫" };
  var resTxt  = { yes: td.resultIndep, partial: td.resultPartial, no: td.resultNotIndep };
  function setAns(key, val) { setAnswers(function(prev) { var n = Object.assign({}, prev); n[key] = val; return n; }); }
  return (
    <div style={{ padding: "20px 24px", background: "#f0fdfa", borderBottom: "1px solid #99f6e4", borderTop: "2px solid #0d9488" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>🔒</span>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#0f766e" }}>{td.title}</div>
      </div>
      <p style={{ fontSize: 13, color: "#134e4a", margin: "0 0 4px", lineHeight: 1.6 }}>{td.intro}</p>
      <p style={{ fontSize: 11, color: "#0d9488", margin: "0 0 16px" }}>{td.basis}</p>
      {td.sections.map(function(sec) {
        var isRF = sec.isRedFlag;
        return (
          <div key={sec.id} style={{ marginBottom: 12, background: "#fff", borderRadius: 10, border: "1.5px solid " + (isRF ? "#fca5a5" : "#99f6e4"), overflow: "hidden" }}>
            <div style={{ background: isRF ? "#fee2e2" : "#ccfbf1", padding: "9px 14px", borderBottom: "1px solid " + (isRF ? "#fca5a5" : "#99f6e4"), display: "flex", alignItems: "center", gap: 7 }}>
              {isRF && <span style={{ fontSize: 13 }}>🚨</span>}
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
                        var bg  = isGood ? (sel ? "#dcfce7" : "#f0fdf4") : (sel ? "#fee2e2" : "#fff5f5");
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
          <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 4px", color: resCol[resultType] }}>{resIcon[resultType]} {resTxt[resultType]}</p>
          {redFlag && <p style={{ fontSize: 12, color: "#991b1b", margin: 0, lineHeight: 1.5 }}>{td.redFlagNote}</p>}
          {!redFlag && resultType === "no" && anyOverHalf && <p style={{ fontSize: 12, color: "#991b1b", margin: 0, lineHeight: 1.5 }}>{td.reasonOverHalf}</p>}
          {!redFlag && resultType === "no" && !anyOverHalf && allSecsHaveNeg && <p style={{ fontSize: 12, color: "#991b1b", margin: 0, lineHeight: 1.5 }}>{td.reasonAllSecs}</p>}
          {resultType === "partial" && <p style={{ fontSize: 12, color: "#92400e", margin: 0, lineHeight: 1.5 }}>{td.reasonPartial}</p>}
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
  var clsColors = { bwE: { bg: "#eff6ff", bdr: "#3b82f6", col: "#1d4ed8", icon: "🔵" }, wE: { bg: "#f0fdf4", bdr: "#86efac", col: "#166534", icon: "🟢" }, below: { bg: "#f9fafb", bdr: "#e5e7eb", col: "#374151", icon: "⚪" } };
  function addPartner() { setPartners(function(p) { return p.concat([{ emp: "", turn: "", bal: "", pct: "" }]); }); }
  function removePartner(i) { setPartners(function(p) { return p.filter(function(_, j) { return j !== i; }); }); }
  function setPartnerField(i, field, val) { setPartners(function(p) { var n2 = p.slice(); n2[i] = Object.assign({}, n2[i]); n2[i][field] = val; return n2; }); }
  function fmt(v)  { return v > 0 ? v.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—"; }
  function fmtI(v) { return v > 0 ? Math.round(v).toLocaleString("de-DE") : "—"; }
  return (
    <div style={{ padding: "20px 24px", background: "#faf5ff", borderBottom: "1px solid #e9d5ff", borderTop: "2px solid #7c3aed" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>📐</span>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#6d28d9" }}>{td.title}</div>
      </div>
      <p style={{ fontSize: 13, color: "#4c1d95", margin: "0 0 4px", lineHeight: 1.6 }}>{td.intro}</p>
      <p style={{ fontSize: 11, color: "#7c3aed", margin: "0 0 16px" }}>{td.basis}</p>
      {itResult !== null && (
        <div style={{ padding: "8px 12px", borderRadius: 7, marginBottom: 14, background: itIndep && !hasGroupMembership ? "#f0fdf4" : itPartial || (itIndep && hasGroupMembership) ? "#fffbeb" : "#fee2e2", border: "1px solid " + (itIndep && !hasGroupMembership ? "#86efac" : itPartial || (itIndep && hasGroupMembership) ? "#fcd34d" : "#fca5a5"), fontSize: 12.5, color: itIndep && !hasGroupMembership ? "#166534" : itPartial || (itIndep && hasGroupMembership) ? "#92400e" : "#991b1b" }}>
          {itIndep && !hasGroupMembership ? "✅ " + td.itIndepNote : itIndep && hasGroupMembership ? "⚠️ " + (de ? "IT-Selbständigkeit bestätigt, jedoch Konzernzugehörigkeit festgestellt — Daten verbundener Unternehmen werden zur Vollständigkeit empfohlen." : "IT independence confirmed, but group membership identified — affiliated company data is recommended for completeness.") : itPartial ? "⚠️ " + td.itPartialNote : "🚫 " + td.affNote}
        </div>
      )}
      {itResult === null && <div style={{ padding: "8px 12px", borderRadius: 7, marginBottom: 14, background: "#fffbeb", border: "1px solid #fcd34d", fontSize: 12.5, color: "#92400e" }}>⚠️ {td.itUnknownNote}</div>}
      <div style={{ background: "#fff", borderRadius: 10, border: "1.5px solid #e9d5ff", padding: "16px", marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#6d28d9", marginBottom: 4 }}>{td.ownDataTitle}</div>
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
            <div style={{ fontWeight: 700, fontSize: 13, color: "#991b1b", marginBottom: 4 }}>🔗 {td.affTitle}</div>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 12px", lineHeight: 1.5 }}>{td.affNote}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[{ label: td.empLabel, val: affEmp, set: setAffEmp, ph: td.empPh, step: 1 }, { label: td.turnLabel, val: affTurn, set: setAffTurn, ph: td.turnPh }, { label: td.balLabel, val: affBal, set: setAffBal, ph: td.balPh }].map(function(f, i) { return (
                <div key={i}><div style={S.lbl}>{f.label}</div><NumInput value={f.val} onChange={f.set} placeholder={f.ph} step={f.step || "0.1"}/></div>
              ); })}
            </div>
          </div>
          {affEmpty && hasOwnData && (
            <div style={{ padding: "10px 14px", background: "#fff7ed", border: "1.5px solid #fb923c", borderRadius: 8, marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 9 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
              <p style={{ fontSize: 12.5, color: "#92400e", margin: 0, lineHeight: 1.6 }}>{de ? "Konzernzugehörigkeit festgestellt — bitte Daten der verbundenen Unternehmen eintragen." : "Group membership identified — please enter data for affiliated companies."}</p>
            </div>
          )}
          <div style={{ background: "#fff", borderRadius: 10, border: "1.5px solid #fde68a", padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#92400e", marginBottom: 4 }}>🤝 {td.partTitle}</div>
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
            <button onClick={addPartner} style={{ fontSize: 13, fontWeight: 600, color: "#92400e", background: "#fffbeb", border: "1.5px dashed #fcd34d", borderRadius: 7, padding: "7px 14px", cursor: "pointer", width: "100%" }}>{td.addPartner}</button>
          </div>
        </>
      )}
      {hasOwnData && (
        <div style={{ background: "#f5f3ff", borderRadius: 10, border: "1.5px solid #c4b5fd", padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#6d28d9", marginBottom: 10 }}>{td.totalTitle}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[{ label: td.totalEmp, val: fmtI(total.emp), thresh1: "≥ 50", thresh2: "≥ 250", met1: total.emp >= 50, met2: total.emp >= 250 }, { label: td.totalTurn, val: fmt(total.turn), thresh1: "> 10 M€", thresh2: "> 50 M€", met1: total.turn > 10, met2: total.turn > 50 }, { label: td.totalBal, val: fmt(total.bal), thresh1: "> 10 M€", thresh2: "> 43 M€", met1: total.bal > 10, met2: total.bal > 43 }].map(function(item, i) { return (
              <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", border: "1px solid #e9d5ff" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: .4, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontWeight: 900, fontSize: 20, color: "#1a365d", marginBottom: 6 }}>{item.val}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontSize: 11, background: item.met1 ? "#dcfce7" : "#f3f4f6", color: item.met1 ? "#166534" : "#9ca3af", borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>wE {item.thresh1} {item.met1 ? "✓" : "✗"}</span>
                  <span style={{ fontSize: 11, background: item.met2 ? "#dbeafe" : "#f3f4f6", color: item.met2 ? "#1d4ed8" : "#9ca3af", borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>bwE {item.thresh2} {item.met2 ? "✓" : "✗"}</span>
                </div>
              </div>
            ); })}
          </div>
        </div>
      )}
      {classification ? (
        <div>
          <div style={{ background: clsColors[classification].bg, border: "2px solid " + clsColors[classification].bdr, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: clsColors[classification].col, marginBottom: 6 }}>{clsColors[classification].icon} {classification === "bwE" ? td.resultBWE : classification === "wE" ? td.resultWE : td.resultBelow}</div>
            <p style={{ fontSize: 13, color: clsColors[classification].col, margin: 0, lineHeight: 1.65 }}>{classification === "bwE" ? td.resultBWEText : classification === "wE" ? td.resultWEText : td.resultBelowText}</p>
            {classification === "wE" && meetsBWE && !hasMsp && <div style={{ marginTop: 10, padding: "8px 12px", background: "#fff", borderRadius: 7, border: "1px solid #bfdbfe" }}><p style={{ fontSize: 12, color: "#1d4ed8", margin: 0, lineHeight: 1.55 }}>ℹ️ {td.capNote}</p></div>}
          </div>
          <div style={{ padding: "9px 12px", background: "#faf5ff", borderRadius: 7, border: "1px solid #e9d5ff" }}>
            <p style={{ fontSize: 12, color: "#6d28d9", margin: 0, lineHeight: 1.55 }}>⏱️ {td.stabilityNote}</p>
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 10, messages: [{ role: "user", content: "Hi" }] })
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
    checking: { dot: "#f59e0b", bg: "#fffbeb", bdr: "#fde68a", col: "#92400e", label: de ? "Claude wird geprüft …" : "Checking Claude …", pulse: true },
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
          style={{ background: "#fee2e2", border: "1.5px solid #fca5a5", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12, color: "#991b1b", display: "flex", alignItems: "center", gap: 6 }}>
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

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  var [lang, setLang]         = useState("de");
  var [mode, setMode]         = useState(null);
  var [wzInputs, setWzInputs] = useState([""]);   // ← array for multiple WZ
  var [wzHelpOpen, setWzHelpOpen]             = useState(false);
  var [wzHelpResultOpen, setWzHelpResultOpen] = useState(false);
  var [comp, setComp]         = useState("");
  var [loc,  setLoc]          = useState("");
  var [prod, setProd]         = useState("");
  var [compData, setCompData] = useState(null);
  var [result, setResult]     = useState(null);
  var [mspSels, setMspSels]   = useState([false, false, false, false]);
  var [itResult, setItResult] = useState(null);
  var [errors, setErrors]     = useState({ general: "", phase1: "", phase2: "" });
  var [busy, setBusy]         = useState(false);
  var [step, setStep]         = useState(-1);
  var runningRef = useRef(false);
  var abortRef   = useRef(null);

  var t   = useMemo(function() { return mk(lang); }, [lang]);
  var scC = result ? (result.in_scope ? "#38a169" : "#e53e3e") : "#9ca3af";
  var hasMspRisk = mspSels[0] || mspSels[1];

  function clearErrors() { setErrors({ general: "", phase1: "", phase2: "" }); }

  function reset() {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    runningRef.current = false;
    setMode(null); setWzInputs([""]); setComp(""); setLoc(""); setProd("");
    setCompData(null); setResult(null); setMspSels([false, false, false, false]);
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
    setBusy(true); clearErrors(); setResult(null); setCompData(null);
    setMspSels([false, false, false, false]); setItResult(null); setWzHelpResultOpen(false);
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
          var m = SRC_META[k] || { icon: "•", bg: "#f3f4f6", col: "#374151" };
          return <span key={k} style={S.pill(m.bg, m.col)}>{m.icon} {srcMap[k] || k}</span>;
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
        <span style={{ fontSize: 10, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: .4, marginRight: 4, flexShrink: 0 }}>
          {de ? "Prüfreihenfolge:" : "Check order:"}
        </span>
        {steps.map(function(s, i) {
          return (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 11, background: i === 1 ? "#fef3c7" : i === 2 && hasMspRisk ? "#fee2e2" : "#e0e7ff", color: i === 1 ? "#92400e" : i === 2 && hasMspRisk ? "#991b1b" : "#3730a3", borderRadius: 4, padding: "2px 7px", fontWeight: 700 }}>
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
    if (!entries || entries.length <= 1) {
      // Single WZ — classic display
      return (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ background: "#f0f4ff", borderRadius: 10, padding: "14px 20px", minWidth: 150 }}>
            <div style={Object.assign({}, S.lbl, { marginBottom: 4 })}>{t.wzLabelSingle}</div>
            <div style={{ fontWeight: 900, fontSize: 30, color: "#1a365d", lineHeight: 1 }}>{result.primary_wz}</div>
                            <div style={{ fontSize: 12, color: "#374151", marginTop: 5, lineHeight: 1.4 }}>{result.primary_label}</div>
          </div>
          {!result.directMode && compData && (
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", border: "1.5px solid #e5e7eb", flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>
                {lang === "de" ? "Analysiertes Unternehmen" : "Analysed company"}
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#1a365d", marginBottom: 4, lineHeight: 1.3 }}>
                {comp || compData.gegenstand || "—"}
              </div>
              {compData.ort && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                  <span style={{ fontSize: 12 }}>📍</span>
                  <span style={{ fontSize: 13, color: "#374151" }}>{compData.ort}</span>
                </div>
              )}
              {compData.rechtsform && (
                <span style={{ fontSize: 11, background: "#eff6ff", color: "#1d4ed8", borderRadius: 4, padding: "2px 7px", fontWeight: 600, border: "1px solid #bfdbfe", marginRight: 5 }}>{compData.rechtsform}</span>
              )}
              {compData.hr_nummer && (
                <span style={{ fontSize: 11, background: "#faf5ff", color: "#6d28d9", borderRadius: 4, padding: "2px 7px", fontWeight: 600, border: "1px solid #e9d5ff" }}>
                  {compData.hr_nummer}{compData.amtsgericht ? " · AG " + compData.amtsgericht : ""}
                </span>
              )}
              {compData.northdata_url && (
                <div style={{ marginTop: 8 }}>
                  <a href={compData.northdata_url} target="_blank" rel="noreferrer"
                    style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <ExtIcon/> Northdata ↗
                  </a>
                </div>
              )}
            </div>
          )}
          <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 100 }}>
            <div style={Object.assign({}, S.lbl, { marginBottom: 4 })}>{t.confLabel}</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: CONF_COL[result.confidence] || "#374151" }}>
              {result.confidence ? result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1) : ""}
            </div>
          </div>
                        {result.alternative_wz && result.alternative_wz.length > 0 && (
            <div style={{ flex: 1, background: "#f9fafb", borderRadius: 10, padding: "14px 16px", minWidth: 120 }}>
              <div style={Object.assign({}, S.lbl, { marginBottom: 6 })}>{t.altWZ}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {result.alternative_wz.map(function(wz, i) {
                  var label = typeof wz === "object" ? (wz.wz || wz.label || JSON.stringify(wz)) : String(wz);
                  return <span key={i} style={S.pill("#e5e7eb", "#374151")}>{label}</span>;
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
            var bdr = entry.in_scope ? "#86efac" : "#e5e7eb";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: bg, border: "1.5px solid " + bdr, borderRadius: 9, padding: "10px 14px" }}>
                <span style={{ fontWeight: 900, fontSize: 20, color: entry.in_scope ? "#1a365d" : "#9ca3af", fontFamily: "monospace", minWidth: 52 }}>{entry.wz}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.4 }}>{entry.label || "—"}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, background: entry.in_scope ? "#dcfce7" : "#f3f4f6", color: col, borderRadius: 5, padding: "3px 9px", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {entry.in_scope ? "✓ " + t.wzInScope : "✗ " + t.wzOutScope}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", maxWidth: 780, margin: "0 auto", background: "#fff", minHeight: "100vh", boxShadow: "0 0 0 1px #e5e7eb" }}>
      <div style={{ background: "linear-gradient(135deg,#1a365d 0%,#2d4e8a 60%,#1e3a5f 100%)", color: "#fff", padding: "22px 32px 20px" }}>
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

        {!result && (
          <div style={{ marginBottom: 22 }}>
            <div style={S.lbl}>{t.modeL}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              {["known", "analyze"].map(function(m, i) {
                var sel = mode === m;
                return (
                  <div key={m} role="button" tabIndex={0}
                    onClick={function() { setMode(m); setResult(null); clearErrors(); setCompData(null); setStep(-1); setMspSels([false,false,false,false]); setItResult(null); setWzHelpOpen(false); }}
                    onKeyDown={function(e) { if (e.key === "Enter") setMode(m); }}
                    style={{ flex: 1, minWidth: 200, padding: "14px 18px", borderRadius: 10, border: "2px solid " + (sel ? "#1a365d" : "#e5e7eb"), background: sel ? "#eff6ff" : "#fafafa", cursor: "pointer", fontWeight: sel ? 700 : 400, fontSize: 14, color: sel ? "#1a365d" : "#374151", lineHeight: 1.4 }}>
                    {i === 0 ? t.modeYes : t.modeNo}
                    {i === 1 && <div style={{ fontSize: 11, color: "#6d28d9", marginTop: 5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><span>🤖</span>{t.modeNoHint}</div>}
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
              style={{ fontSize: 12.5, fontWeight: 600, color: "#1d4ed8", background: "#eff6ff", border: "1.5px dashed #bfdbfe", borderRadius: 7, padding: "6px 13px", cursor: "pointer", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
              {t.addWz}
            </button>
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{t.wzHint}</p>
          </div>
        )}

        {mode === "analyze" && !result && (
          <div>
            <div style={Object.assign({}, S.card("#e5e7eb", "#f8fafc"), { marginBottom: 14, padding: "20px 22px" })}>
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
                      style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 7px", cursor: "pointer", color: "#9ca3af", display: "inline-flex", alignItems: "center" }}>
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
                <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 9, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <Spin/>
                  <span style={{ fontSize: 13, color: "#78350f", flex: 1, lineHeight: 1.5 }}>{step === 0 ? t.step1Hint : t.step2Hint}</span>
                  <button onClick={cancelAnalysis}
                    style={{ background: "#fee2e2", color: "#991b1b", border: "1.5px solid #fca5a5", borderRadius: 7, padding: "7px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {t.cancelBtn}
                  </button>
                </div>
              </div>
            )}
            {errors.phase1 && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 8, background: "#fee2e2", padding: "8px 12px", borderRadius: 6 }}>⚠️ {errors.phase1}</p>}
            {errors.phase2 && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 8, background: "#fee2e2", padding: "8px 12px", borderRadius: 6 }}>⚠️ {errors.phase2}</p>}
            {!busy && <button onClick={handleAnalyze} style={S.pri}>{t.analyzeBtn}</button>}
          </div>
        )}

        {errors.general && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 8 }}>{errors.general}</p>}

        {/* ── Quellen in der Anfangsübersicht ── */}
        {!result && (
          <div style={{ marginTop: 28, borderRadius: 10, border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ background: "#f0f4ff", padding: "12px 18px", borderBottom: "1px solid #c7d2fe", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15 }}>📚</span>
              <span style={{ fontWeight: 800, fontSize: 13, color: "#1a365d" }}>{t.resTitle}</span>
            </div>
            <div style={{ padding: "16px 18px", background: "#fff" }}>
              <ResourcesSection t={t} compact={true}/>
            </div>
            <div style={{ padding: "10px 18px", background: "#fefce8", borderTop: "1px solid #fde047" }}>
              <p style={{ fontSize: 11.5, color: "#713f12", margin: 0 }}>⚠️ {t.disclaimer}</p>
            </div>
          </div>
        )}

        {result && (
          <>
            {result.skippedClassification && (
              <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 7, padding: "6px 12px", marginBottom: 10, fontSize: 12, fontWeight: 600, color: "#166534", display: "inline-flex", alignItems: "center", gap: 6 }}>
                ⚡ {t.callsSaved}
              </div>
            )}

            <div style={{ borderRadius: 12, border: "2px solid " + scC, overflow: "hidden", marginTop: 4 }}>

              {/* ── WZ Result header ── */}
              <div style={{ background: result.in_scope ? "#f0fff4" : "#fff5f5", padding: "20px 24px", borderBottom: "1px solid " + scC + "25" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{result.in_scope ? "✅" : "⚠️"}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: scC, marginBottom: 5 }}>{result.in_scope ? t.inScopeH : t.outScopeH}</div>
                    <p style={{ fontSize: 13.5, color: "#374151", margin: 0, lineHeight: 1.65 }}>{result.in_scope ? t.inScopeB : t.outScopeB}</p>
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
                  <div style={{ marginTop: 10, padding: "11px 14px", background: "#fffbeb", borderRadius: 8, border: "1.5px solid #f59e0b" }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#92400e", marginBottom: 4 }}>⚡ {lang === "de" ? "Zweistufige Prüfung — KI übersteuert Northdata" : "Two-stage check — AI overrides Northdata"}</div>
                    <p style={{ fontSize: 12.5, color: "#78350f", margin: 0, lineHeight: 1.6 }}>
                      {lang === "de"
                        ? "Northdata/Handelsregister weist WZ " + result.northdataWz + " aus (außerhalb des BSIG-Bereichs). Die KI-Produktanalyse ergibt jedoch eine Klassifikation im Anwendungsbereich — bitte intern verifizieren."
                        : "Northdata/commercial register shows WZ " + result.northdataWz + " (outside BSIG scope). However, the AI product analysis results in an in-scope classification — please verify internally."}
                    </p>
                  </div>
                )}
                {!result.directMode && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ padding: "10px 14px", background: "#fefce8", borderRadius: 8, border: "1px solid #fde047", marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: "#854d0e", marginBottom: 3 }}>⚠️ {t.aiWzNoteTitle}</div>
                      <p style={{ fontSize: 12.5, color: "#78350f", margin: 0, lineHeight: 1.55 }}>{t.aiWzNote}</p>
                    </div>
                    <WzHelpAccordion t={t} lang={lang} open={wzHelpResultOpen} setOpen={setWzHelpResultOpen}/>
                  </div>
                )}
              </div>

              {result.is_msp_hint && (
                <div style={{ padding: "14px 18px", background: "#fff7ed", borderBottom: "2px solid #f97316", display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>🤖</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#c2410c", marginBottom: 5 }}>{t.mspHintTitle}</div>
                    <p style={{ fontSize: 13, color: "#7c2d12", margin: "0 0 8px", lineHeight: 1.65 }}>{t.mspHintText}</p>
                    {result.msp_hint_reason && (
                      <div style={{ background: "#fff", borderRadius: 7, border: "1px solid #fed7aa", padding: "7px 12px", marginBottom: 8, fontSize: 12.5, color: "#9a3412", fontStyle: "italic", lineHeight: 1.5 }}>
                        💬 {result.msp_hint_reason}
                      </div>
                    )}
                    <a href={BT_DRSACHE} target="_blank" rel="noreferrer" style={Object.assign({}, S.link("#c2410c"), { fontSize: 12 })}>⚖️ {t.mspHintBasis} ↗</a>
                  </div>
                </div>
              )}
              {!result.directMode && compData && <SrcSummaryCard t={t} compData={compData} companyName={comp}/>}

              <div style={{ padding: "12px 24px", background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: .4 }}>📊 DESTATIS WZ 2008</span>
                <a href={DESTATIS_PDF}  target="_blank" rel="noreferrer" style={S.link("#166534")}>{t.destPDF} ↗</a>
                <a href={DESTATIS_XLSX} target="_blank" rel="noreferrer" style={S.link("#166534")}>{t.destXLSX} ↗</a>
              </div>

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
                  return (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 9 }}>
                      <span style={{ color: isDone ? "#166534" : "#1a365d", fontWeight: 800, minWidth: 20, fontSize: 13, flexShrink: 0 }}>{isDone ? "" : (i + 1) + "."}</span>
                      <span style={{ fontSize: 13, color: isDone ? "#166534" : "#374151", lineHeight: 1.6 }}>{s}</span>
                    </div>
                  );
                })}
              </div>

              {/* ── Resources ── */}
              <div style={{ padding: "20px 24px", background: "#f8fafc", borderBottom: "1px solid #f0f0f0" }}>
                <ResourcesSection t={t} compact={false}/>
              </div>

              <div style={{ padding: "12px 24px", background: "#fefce8", borderTop: "2px solid #fde047" }}>
                <p style={{ fontSize: 12, color: "#713f12", margin: 0, lineHeight: 1.5 }}>⚠️ {t.disclaimer}</p>
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