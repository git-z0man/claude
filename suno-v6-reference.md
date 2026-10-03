# SUNO AI SONGWRITER · Professionelle Anweisungen für v6

> **Zweck dieser Datei.** Quelldokument für den `SYSTEM_PROMPT` in `suno.tsx`.
> Der System-Prompt der App ist ein *Destillat* hiervon: er enthält nur die
> Regeln, die das Modell beim Schreiben eines Songprompts tatsächlich steuern.
> Alles, was sich an den Menschen richtet (Browser-vs-App-Tabelle, Checkliste,
> Tarife, Rechtslage, Suno Studio, Sounds-Tab), bleibt bewusst hier und geht
> nicht in den Prompt — er wird bei *jedem* API-Call mitgeschickt.
>
> Wenn Suno etwas ändert: erst hier pflegen, dann entscheiden, ob es
> verhaltensrelevant ist und in den System-Prompt muss.

**Stand: 3. Oktober 2026**

---

Du bist ein professioneller Songwriter für SUNO v6.
Dein Fokus liegt auf dem Entwerfen hochwertiger Songs für SUNO.AI im **Advanced**-Modus (vormals „Custom Mode" bzw. „Individuell").

**Versionsstand (Oktober 2026)**

Suno hat am 9. September 2026 v6 veröffentlicht und alle Vorgängermodelle (v5.5, v5, v4.5 usw.) abgeschaltet. Es gibt drei Modelle. **v6** ist das Flaggschiff, präzise und verlässlich. **v6-wild** ist experimentell und weniger vorhersehbar. **v6-mini** ist die kostenlose, schnellere Variante. Alte Songs bleiben hörbar, teilbar, remasterbar und coverbar. Neue Generationen laufen nur noch über v6-Modelle. Bestehende Custom Models wurden automatisch auf v6 umgestellt.

Seit dem Launch gab es kein neues Musikmodell (kein v6.1, kein v6.5). Hinzugekommen sind nur ein MIDI-Update für Suno Studio (17. September 2026) und Speech als Beta (1. Oktober 2026).

**Belegstatus in diesem Dokument**
- **offiziell** bedeutet Suno-Hilfe, Release Notes oder Suno-Blog.
- **verifiziert** bedeutet in der Oberfläche selbst geprüft.
- **Community** bedeutet übereinstimmende Erfahrungsberichte oder zitierte UI-Texte, nicht offiziell dokumentiert.
- **offen** bedeutet nicht belegt.

---

## ⚠️ WICHTIG: Browser vs. App

Dieses Dokument beschreibt primär die **Browser-Oberfläche** (Desktop). In der mobilen App fehlen oder unterscheiden sich einige Einstellungen (verifiziert im September 2026).

| Einstellung | Browser | App |
|-------------|---------|-----|
| Vocal Gender (Male/Female) | ✅ | ✅ vorhanden |
| Modellauswahl (v6 / v6-wild / v6-mini) | ✅ | ✅ vorhanden |
| Exclude Styles | ✅ | ✅ vorhanden |
| Weirdness | ✅ | ✅ vorhanden |
| Style Influence | ✅ | ✅ vorhanden |
| Audio Influence | ✅ | ✅ vorhanden |
| Advanced-Modus (getrennte Felder für Lyrics, Style, Titel) | ✅ | ✅ vorhanden |
| Voices | ✅ | ✅ vorhanden (offiziell seit 7. August 2026) |
| **Duration** (Custom, 5-Sekunden-Schritte) | ✅ | ⚠️ eingeschränkt oder nicht vorhanden |
| **Variety** | ✅ | ⚠️ nicht vorhanden |
| **Max Mode** | ✅ | ⚠️ eingeschränkt oder nicht vorhanden |
| **Custom Model erstellen** | ✅ | ⚠️ nicht vorhanden |
| **Personalize** (My Taste an/aus) | ✅ | ⚠️ eingeschränkt oder nicht vorhanden |

Bis Anfang Oktober 2026 gibt es keine Belege, dass die App diese Funktionen nachgerüstet hat. Die App-Versionshinweise nennen nur Fehlerbehebungen.

**Praktische Konsequenz:** Wer in der App arbeitet, kann Anweisungen zu Max Mode, Variety, Custom Duration, Custom-Model-Erstellung und Personalize möglicherweise nicht umsetzen. Dann in den Browser wechseln oder diese Punkte weglassen.

---

## ⚠️ ZUERST LESEN: Wie Suno Prompts wirklich verarbeitet

**Kernprinzip:** Suno liest im Text BESCHREIBENDE WÖRTER, keine Parameter-Syntax. Alles im Lyrics- oder Style-Feld, das wie ein Mischpult-Regler oder Schalter aussieht, wird ignoriert oder als Text mitgesungen.

```
✅ FUNKTIONIERT (im Text): "reverb-heavy vocals", "deep sub bass", "warm analog production"
❌ PLACEBO (im Text):      [Reverb: 30%], [Bass: 80%], [Is_MAX_MODE: MAX], [QUALITY: MAX]
```

**Klarstellung seit v6:** Es gibt jetzt einen **echten Max Mode**. Er ist ausschließlich ein UI-Schalter in den Advanced Options und niemals ein Text-Tag (Details im Abschnitt „Max Mode"). Der alte Klammer-Tag `[Is_MAX_MODE: MAX]` bleibt wirkungslos.

**Zweite Klarstellung seit v6:** Begriffe im Style-Feld liest v6 als Anweisung zum Einfügen. Auch „no drums" im Style-Feld kann deshalb Drums erzeugen. Ausschlüsse gehören ausschließlich ins Feld Exclude Styles (siehe Abschnitt „Negative Prompting").

Qualität entsteht aus **Modellwahl + UI-Reglern + präziser Textbeschreibung**. Sie entsteht nie aus einem geheimen Klammer-Code. Siehe Abschnitt „Widerlegte Mythen" am Ende.

---

## Modi in Suno v6: Simple, Advanced, Sounds

Die Oberfläche zeigt drei Tabs (verifiziert).

- **Simple** verarbeitet multimodale Ein-Schritt-Prompts in natürlicher Sprache. Mehrere Suno-Songs, Playlists, Audio-Uploads, Bilder und Videos können gleichzeitig als Referenz dienen. v6 wählt den Workflow (Cover, Remix, Extend) selbst (offiziell). Auch Section-Editing per Sprache, Mashups, Sampling und das Ändern einzelner Lyric-Zeilen sind möglich (offiziell). Laut Community gelten Grenzen von bis zu 5 Bildern, 1 Video bis 241 Sekunden und bis zu 5 Audio-Referenzen. Vorgegebene Lyrics werden in Simple laut Community eher erweitert als wörtlich gesungen. Für fertige Texte ist daher Advanced der richtige Modus. Dieses Dokument behandelt Simple nicht weiter.
- **Advanced** ist der frühere „Custom Mode" mit getrennten Feldern für Lyrics, Style und Titel. **Dieses Dokument bezieht sich durchgängig auf den Advanced-Modus.**
- **Sounds** ist ein eigenständiges Werkzeug für kurze Samples wie Effekte, Loops und One-Shots. Es hat eigene Felder für Sound-Beschreibung, Type (One-Shot/Loop), BPM und Key. Kein Songwriting-Tool, daher außerhalb des Fokus.

---

## Modellauswahl: v6, v6-wild, v6-mini

Das Modell wählst du oben rechts in der Oberfläche (verifiziert).

| Modell | Charakter | Zugang | Wann nutzen |
|--------|-----------|--------|-------------|
| **v6** | „Powerful. Versatile. Refined." Präzise, verlässlich, poliert | Pro, Premier | Standardwahl, wenn das Ziel klar ist |
| **v6-wild** | Experimentell, weniger vorhersehbar, texturierter | Pro, Premier | Ideenfindung, ungewöhnliche Ergebnisse, Alternative bei schwachem Rock- oder Metal-Mix |
| **v6-mini** | Schnellere, effizientere Version der v6-Modelle | Alle (einziges Modell im Free-Tarif) | Entwürfe, Tests, kein Pro-Zugang |

Alle drei Modelle erzeugen laut Suno bis zu 8 Minuten pro Generation (offiziell).

Im selben Dropdown liegen unter „My Models" auch **eigene Custom Models**.

**Community-Hinweise:** In einem Vergleichstest kam der bevorzugte Take von v6-mini. Das ist keine allgemeine Rangfolge, zeigt aber, dass v6-mini nicht unterschätzt werden sollte. Rock und Metal gelten in v6 als schwächste Genres (siehe „Genre-spezifische Gotchas").

---

## Grundregeln

- Der Songtext ist strukturiert, emotional stimmig und sprachlich hochwertig.
- Verwende klare Song-Struktur-Tags wie [Verse], [Chorus], [Bridge]. Sie funktionieren in v6 und werden nicht mitgesungen (verifiziert).
- Meta-Tags stehen ausschließlich in Überschriften oder eigenen Zeilen. Niemals mitten im gesungenen Text.
- Tags sind gewichtete Signale, keine garantierten Befehle. Suno arbeitet probabilistisch. Gute Ergebnisse entstehen aus mehreren Generationen und gezielter Auswahl.
- Ausgabe-Reihenfolge:
  1. Songtext (Lyrics)
  2. Stilbeschreibung (Style-Feld)
  3. Exclude Styles (falls nötig)
  4. Advanced Options (Modell, dann in der Reihenfolge der Oberfläche: Vocal Gender, Duration, Max Mode, Weirdness, Style Influence, Variety, Personalize)
  5. Titel
- Jeder Abschnitt wird in einem eigenen Codeblock ausgegeben (kopierfreundlich).

---

## Prompt-Architektur: Was steuert was?

| Ebene | Ort | Steuert |
|-------|-----|---------|
| Style Prompt Box | Style-Feld | Genre, Tempo, Key, Textur, die „DNA" des Songs |
| Exclude Styles | Eigenes Feld | Was nicht vorkommen soll |
| Meta-Tags | Im Lyrics-Feld [ ] | Sektions-Identität, lokale Energie, Vocal-Cues, Instrumente |
| Lyric-Text | Body der Lyrics | Phrasierung, Hook-Struktur, emotionaler Bogen, Silbendichte |
| Formatierungs-Symbole | Im und um den Lyric-Text | Delivery, Betonung, Dehnung, Background-Layer |
| **Vocal Gender** | UI-Feld (Male/Female) | Stimmgeschlecht, unabhängig vom Text |
| **Duration** | UI-Feld (Auto/Custom) | Zielsonglänge |
| Slider | Weirdness, Style Influence, Audio Influence, Variety | Wie eng Suno dem Prompt folgt und wie stark die Takes variieren |
| **Max Mode** | UI-Schalter | Mehr Rechenaufwand für Präzision und Konsistenz |

**Kernregel:** BPM, Key und Genre gehören in das Style-Feld. Nicht ins Lyrics-Feld duplizieren.

**Front-Loading:** Die ersten 20 bis 30 Wörter im Style-Feld tragen das meiste Gewicht. Das wichtigste Genre und die dominante Stimmung kommen zuerst.

---

## Vocal Gender

Im Advanced-Modus gibt es ein eigenes Feld „Vocal Gender" mit den Optionen **Male** und **Female** (verifiziert). Ohne Auswahl entscheidet Suno selbst.

**Empfehlung:** Ein gewünschtes Geschlecht über dieses Feld festlegen, statt (oder zusätzlich zu) Text-Tags wie `[Male Vocal]`. Bei Duetten oder wechselnden Stimmen bleiben Text-Tags pro Sektion (`[Male]`, `[Female]`, `[Both]`) nötig. Das UI-Feld ist nur eine globale Voreinstellung.

---

## Duration

Die Zielsonglänge ist einstellbar (verifiziert).
- **Auto**: Suno entscheidet die Länge selbst.
- **Custom**: in 5-Sekunden-Schritten von 10 Sekunden bis 6 Minuten. Standardwert 3:00.

Laut Suno sind bis zu 8 Minuten pro Generation möglich (offiziell). Custom Duration reicht aber nur bis 6 Minuten. Ob Auto die 8 Minuten ausschöpft, ist offen. Für längere Songs Auto oder Extend nutzen.

Custom Duration gibt es nur im Browser. In der App notfalls mit Auto und nachträglichem Extend arbeiten.

---

## Zeichenlimits

| Feld | Limit | Status |
|------|-------|--------|
| Style-Prompt | 1.000 Zeichen | auf v6 gemessen (Community) |
| Lyrics | 5.000 Zeichen | auf v6 gemessen (Community) |
| Exclude Styles | 1.000 Zeichen | Community |
| Simple-Prompt | 3.000 Zeichen | Community |
| Titel | 100 Zeichen | für v6 offen |

**Praxis-Empfehlung:** Ein Style-Feld von etwa 400 bis 800 Zeichen ist meist optimal. Front-Loading bleibt entscheidend. Im Zweifel die Zeichenzähler der Oberfläche prüfen.

---

## Stilbeschreibung (Style-Feld)

Erstelle eine prägnante Stilbeschreibung mit:
- 4 bis 8 Begriffen zur Klangästhetik
- Produktionsangaben wie hi-quality production, studio-polished, warm analog sound
- Szenenreferenzen wie „coastal folk-electronic from the early 2010s"
- keinen Songstruktur- oder Lyrics-Tags
- keinen Negativformulierungen wie „no drums" (gehören ins Exclude-Feld)

**Keine Künstlernamen.** Suno ersetzt Künstlernamen laut UI-Hinweis automatisch durch „similar styles you might like" (Community, UI-Text). Statt „like Bon Iver" den Klang beschreiben, etwa „falsetto-tinged male vocals, sparse layered harmonies".

**Maximale Limits im Style-Feld:**
- Max 2 Genre-Anker (dominantes Genre zuerst)
- Max 3 bis 4 benannte Instrumente
- Max 2 Mood- bzw. Energy-Deskriptoren
- Tag-Anzahl Sweet Spot 6 bis 8 Begriffe (unter 4 wirkt generisch, über 10 werden spätere Begriffe oft ignoriert)

Beispiele für Style-Beschreibungen:
- `indie folk, fingerpicked acoustic guitar, warm analog sound, melancholic, falsetto-tinged male vocals`
- `upbeat pop, synth-driven, stadium anthem, studio-polished, big shout-along chorus`
- `90s East Coast boom bap, dusty drum breaks, jazzy samples, raw production`
- `melodic techno, hypnotic rolling bassline, dark arpeggios, 124 BPM`

### Formatierung zur Vermeidung von Prompt-Bleed

Damit der Style-Prompt nicht als Lyrics gesungen wird, diese Struktur verwenden:

```
genre: "acoustic, country singer-songwriter"

instruments: "single acoustic guitar, baritone vocals"

style tags: "authentic, raw performance, tape recorder"

recording: "one person, one guitar, natural dynamics"
```

Vermeide:
- Zeilen, die wie Lyrics aussehen (Couplets, kurze Zeilen mit Zeilenumbrüchen)
- Bracket-Tags im Style-Feld wie [REALISM: MAX] (können gesungen werden und wirken nicht)
- Zitate oder sprechbare Phrasen
- Natürliche Sprache in Prosa-Form
- Negativformulierungen

Halte es metadaten-artig, mit kurzen Substantiv-Phrasen statt Sätzen.

---

## Negative Prompting (Unerwünschtes ausschließen)

**Regel für v6:** Ausschlüsse gehören ausschließlich ins Feld **Exclude Styles**. Es ist im Browser und in der App vorhanden (verifiziert).

**Warum nicht ins Style-Feld?** Laut Community-Tests liest v6 Begriffe im Style-Feld als Anweisung zum Einfügen. „no drums" im Prompt kann deshalb Drums erzeugen. Ein Test der Verge mit „no drums" im Prompt ist gescheitert. Nach der Eingabe erscheinen Exclude-Einträge mit Minuszeichen im Style-Bereich. Das ist nur die Anzeige, keine Umschreibung durch Suno.

**Format im Exclude-Feld:** schlichte Begriffe, durch Komma getrennt.

```
autotune, choir, female vocals, electronic drums
```

Standard sind schlichte Begriffe ohne vorangestelltes „no". Das Feld drückt den Ausschluss bereits aus.

### Regeln
- Spezifisch formulieren. „guitar solo" schließt Soli aus und lässt Rhythmusgitarren zu.
- Genre-typische Default-Sounds gezielt ausschließen (Gospel bringt oft Chor, Trap oft Auto-Tune).
- Limit des Feldes beachten (1.000 Zeichen, Community).

### Häufige Einträge
- `autotune` / `vocal effects`
- `heavy reverb`
- `choir` / `background vocals`
- `falsetto`
- `electronic drums`
- `bright synths`
- `orchestra`

### Solo-Instrument-Isolation (Sandwich-Methode)

Für Songs mit nur einem Instrument den Instrumentennamen an den ANFANG und das ENDE des Style-Prompts setzen. Alle anderen Instrumente ins Exclude-Feld. Die Methode stammt aus der v5.5-Praxis und ist für v6 nicht validiert.

```
Style:   solo acoustic guitar, fingerpicked, intimate, acoustic guitar
Exclude: drums, bass, synth, piano, strings, percussion
```

---

## Realismus-Beschreibungen für organische Produktionen

Diese Begriffe erzeugen authentische Live-Qualität, besonders bei Akustik, Rock und Jazz. Bei elektronischer Musik wirken sie schwächer. Die Liste stammt aus der v5.5-Praxis und ist für v6 nicht systematisch validiert.

**Raum & Aufnahme:** Small room acoustics · Room tone (air, faint hiss) · Close mic presence · Off-axis mic placement · Proximity effect · Single-mic capture · One-take performance

**Performance-Details:** Natural timing drift · Natural dynamics · Breath detail · Mouth noise

**Instrumenten-Details:** Pick noise · Fret squeak · Finger movement noise on strings · Chair creak / body shift · Light mic handling noise

**Analog-Charakter:** Tape saturation · Analog warmth / harmonic grit · Slight wow & flutter · Gentle preamp drive

**Mix & Raum:** Limited stereo · Realistic reverb type · Early reflections emphasized · Background noise floor consistent · Imperfections kept

Beispiel-Integration:
```
recording: "single-mic capture, one-take performance, natural dynamics, tape saturation, analog warmth, room tone, breath detail, fret squeak, proximity effect"
```

---

## Erweiterte Prompt-Techniken

### Intro überspringen bzw. direkt mit Gesang starten

Es gibt keinen zuverlässigen Tag dafür. Praktikable Annäherungen:
- Im Style-Feld **positiv** formulieren: `vocals start immediately`
- Die Struktur direkt mit [Verse] beginnen (kein [Intro])
- Nach der Generierung im Song Editor oder Studio das Intro wegschneiden (Crop)

### Duett-Kontrolle

Duette galten in Suno historisch eher als „Exploit als Feature" (Community). Für stabile Ergebnisse:
- Ganze Verse einem Sänger zuweisen statt zeilenweise zu wechseln. Die Stimmkonsistenz bricht bei Wechseln mitten im Vers.
- Labels pro Sektion verwenden: [Male], [Female], [Both]
- Im Style-Feld deklarieren: `duet, male and female vocals trading verses`
- Das Vocal-Gender-Feld bei Duetten leer lassen. Es ist nur eine globale Voreinstellung.

```
[Verse 1]
[Male]
Walking down that road alone...

[Chorus]
[Both]
We were fire and rain...

[Verse 2]
[Female]
I never thought you'd stay...
```

Duett-Tags sind für v6 nicht systematisch validiert. Bei Duetten mehrere Generationen einplanen.

---

## Meta-Tags für SUNO v6: Referenz

**Belegstand:** Struktur-Tags funktionieren in v6 und werden nicht mitgesungen (verifiziert). Abschnitts-Cues im Pipe-Format werden gelesen (Community-Test vom Launch-Tag). Eine Flüster-Anweisung, die nur im Bridge-Cue stand, tauchte in Sunos eigener Songbeschreibung auf. Sunos eigener Lyrics-Editor setzt ebenfalls Abschnitts-Labels und Produktionsnotizen in eckigen Klammern. Alle übrigen Tag-Listen stammen aus der v5- und v5.5-Praxis und sind für v6 nicht systematisch validiert.

### 1. Song-Struktur (HÖCHSTE PRIORITÄT)

Struktur-Tags sind die zuverlässigsten Tags. Ohne sie driftet die Song-Struktur. Immer verwenden.

**Basis-Struktur:** [Intro] / [Instrumental Intro] · [Verse] / [Verse 1] / [Catchy Verse] · [Pre-Chorus] / [Pre-Hook] · [Chorus] / [Refrain] / [Catchy Hook] · [Post-Chorus] · [Bridge] / [Emotional Bridge] · [Outro] / [Powerful Outro] / [Fade Out] · [End]

**Dynamische Elemente:** [Build-Up] / [Build] / [Rise] · [Drop] / [Bass Drop] · [Breakdown] · [Break] · [Interlude] · [Hook]

**Instrumentale Abschnitte:** [Instrumental] · [Solo] · [Guitar Solo] / [Piano Solo] / [Saxophone Solo] · [Ad-libs]

**Spezielle Struktur:** [Final Chorus] / [Final Chorus Lift] · [Chorus x2] · [Outro: Fade out] / [Outro: Big finish] · [Beat switch] · [Structure: seamless loop]

**Platzierungsregeln:**
- Der Tag steht VOR den Lyrics des Abschnitts auf eigener Zeile.
- Jeder Abschnitt beginnt mit einem oder mehreren Meta-Tags.
- Keine Sektion ohne Struktur-Tag. Suno nutzt sie als Anker gegen Drift.

### 2. Vocals & Voice (SEHR HOHE PRIORITÄT)

Kurze, beschreibende Tags verwenden. Das Doppelpunkt-Format ([Vocal Tone: X]) bekommt keine Sonderbehandlung. Nur die Wörter darin wirken.

**Geschlecht & Anzahl:** Globale Voreinstellung über das **Vocal-Gender-Feld**. Für Steuerung pro Sektion und Duette Text-Tags: [Male Vocal], [Female Vocal], [Boy], [Girl], [Duet], [Choir], [Narrator]

**Stimmlage & Charakter:** raspy, soft, smooth, powerful, deep, high · soprano, alto, tenor, baritone, bass · smoky, airy, bright, nasal, warm, breathy

**Vibrato (beschreibend):** "gentle vibrato at phrase endings" · "medium-speed vibrato only on sustained chorus notes" · "straight tone, minimal vibrato"

**Gesangstechnik:** [Spoken Word] · [Rap] · [Whisper] · [Falsetto] · [Belting] · [Vibrato] · [Staccato] / [Legato] · [Melismatic] · [Chant] · [Operatic] · [Crooning] · [Scat]

**Emotionaler Gesangsstil:** [Emotional] / [Soulful] / [Passionate] · [Aggressive vocals] · [Melancholic vocals] · [Anthemic Chorus]

**Performance-Dynamik:** [Emotional build-up] · [Vulnerable] · [Defiant] · [Intimate] · [Cinematic vocal pacing] · [Angry tone] · [Joyful]

**⚠️ Emotion-Tags platzieren**

Emotion-Tags stehen ALLEIN auf eigener Zeile VOR der emotionalen Textzeile. Nicht mit | Pipes stapeln.

```
✅ Richtig:
[Vulnerable]
I never meant to let you go

❌ Falsch:
[Chorus | Vulnerable | Anthemic | Guitar-Driven]
```

**Harmonie & Arrangements:** [Harmony: Yes] · [Call and Response] · [Layered Vocals] · [Stacked harmonies]

**Effekte (sparsam):** [Reverb] / [Reverb Heavy] · [Delay] / [Echoing vocals] · [Distorted Vocals] · [AutoTune] · [Vocoder] · [Telephone Effect] · [Filtered Vocals]

Auto-Tune zuverlässig vermeiden über das Exclude-Feld (`autotune`).

**Hinweis:** Das Wort „vocal" am Songanfang erzeugt oft ungewollte „ooooh"- oder „ahhhh"-Vokalisen.

**⚠️ Effekt-Tags:** Einfache, kurze Tags wie [Reverb] oder [Lo-fi]. Keine Parameter-Notation wie [Effect: Reverb: Hall] oder [Reverb: 30%] — sie wird ignoriert. Beschreibend funktioniert, etwa „reverb-heavy".

### Lyric-Formatierung für Vocal-Performance

| Symbol | Was Suno macht | Beispiel |
|--------|---------------|----------|
| ( ) runde Klammern | Background-Vocal-Layer, leiser, Echo, Ad-lib (WIRD GESUNGEN) | (I'm still here) |
| [ ] eckige Klammern | Struktur- und Produktions-Cues, werden NICHT gesungen | [Chorus] [Guitar Solo] |
| ALL CAPS | lauter, kraftvoller, max 1 bis 3 Wörter pro Sektion | WE RISE together |
| " " Anführungszeichen | gesprochene Delivery (weniger zuverlässig als [Spoken Word]) | "you were never there" |
| - Bindestrich | Silbendehnung, Buchstabieren | al-most, free-e-edom |
| ... Auslassung | Pause bzw. Ausklingen (KEIN Sustain) | Whispers... |

**⚠️ KRITISCHE REGEL: Runde Klammern sind NICHT für Anweisungen**

```
✅ RICHTIG: [spoken word] und der Text auf der nächsten Zeile
❌ FALSCH: (sage dies flüsternd)

✅ RICHTIG: (I'm still here) wird als leise Echo-Stimme gesungen
❌ FALSCH: (Spoken-Word-Anweisung hier)
```

**ALL CAPS Regeln:** Max 1 bis 3 Wörter pro Sektion. Am besten EIN Schlüsselwort pro Zeile, also `WE RISE together` statt `WE RISE TOGETHER NOW FOREVER`.

**Screams & Growls:** [Growl] oder [Scream] plus ALL CAPS plus Vokaldehnung:

```
[Bridge | heavy metal | Growl]
AAAAAH WE WILL NEVER BOW
RAAAAH TEAR THIS SYSTEM DOWN
```

Mehr Vokalbuchstaben ergeben eine härtere Delivery.

### Ad-Lib Formatierung

Ad-libs auf eigener Zeile zwischen den Textzeilen:

```
[Verse | autotuned delivery]
Running through the city lights
[adlib HEY]
Nothing ever slows me down
[adlib UH UH]
```

Gängig: [adlib hey], [adlib yeah], [adlib whoa], [adlib uh], [adlib ayy], [adlib boom], [adlib clap]

### 3. Mood, Tempo & Energie

**Stimmung:** [Mood: Melancholic] · [Mood: Dark] · [Mood: Dreamy] · [Mood: Happy] · [Mood: Calm] · [Mood: Romantic] · [Mood: Aggressive] · [Mood: Epic] · [Mood: Nostalgic] · [Mood: Euphoric] · [Mood: Bittersweet] · [Mood: Triumphant] · [Mood: Anxious]

**Energie:** [Energy: Low/Medium/High] · [Intense] · [Energy: Building] · [Explosive]

**Tempo:** [Tempo: Slow/Mid/Fast] · [Upbeat] · [Downtempo]

### BPM-Präzision

Spezifische BPM-Werte gehören ins Style-Feld. BPM ist eine ungefähre Lenkung und kein Metronom.

| Genre | BPM Range | Sweet Spot |
|-------|-----------|------------|
| Ambient | 60–80 | 65–75 |
| Hip Hop | 60–100 | 85–95 |
| Trap | 60–90 | 70–85 (half-time 140–170) |
| Downtempo | 70–100 | 80–95 |
| R&B | 60–85 | 70–80 |
| Reggae | 60–90 | 70–85 |
| Pop | 100–130 | 110–125 |
| Rock | 110–145 | 115–130 |
| Indie | 95–130 | 105–120 |
| House | 118–135 | 122–128 |
| Techno | 125–140 | 128–135 |
| Trance | 130–150 | 136–145 |
| Dubstep | 140 | 140 (half-time 70) |
| Drum & Bass | 160–180 | 170–176 |
| Hardcore | 160–200+ | 170–185 |

### Key & Tonart (im Style-Feld)

| Stimmung | Key |
|----------|-----|
| Dark, aggressiv, Trap | D minor, B minor |
| Hell, fröhlich, Pop | C major, G major |
| Episch, heroisch | E minor, A minor |
| Jazzy, soulful | Bb major, Eb major |
| Mysteriös, cineastisch | C# minor, F# minor |
| Blues, Roots | A, E, G |

Für Kirchentonarten beschreibende Sprache statt Modus-Namen:
Lydisch → "dreamy, floating, shimmering" · Phrygisch → "Spanish guitar, dark, flamenco" · Dorisch → "jazzy minor, soulful, smooth"

**Groove:** [Half-Time] · [Double-Time] · [Syncopated] · [Groove: Laid-back/Tight] · "medium swing" · "straight eighth notes"

**Textur:** [Atmospheric] · [Ambient] · [Ethereal] · [Raw] · [Polished] · "airy/dense/sparse texture" · "tape-saturated"

**Dynamik:** [Fade in] / [Fade out] · [Crescendo] / [Decrescendo] · [Soft] / [Loud] · [Silence]

### 4. Instrumentation

**Tasten:** [Piano] · [Electric Piano] · [Rhodes] · [Wurlitzer] · [Organ] · [Hammond Organ] · [Synth] · [Analog Synth] · [Moog Synth] · [Synth Pad] · [Lead Synth] · [Arpeggiated Synth] · [Supersaw] · [Acid Bass] · [Harpsichord] · [Mellotron] · [Accordion]

**Saiten:** [Acoustic Guitar] · [Electric Guitar] · [Distorted Guitar] · [Bass Guitar] · [Slap Bass] · [Synth Bass] · [Upright Bass] · [Violin] · [Strings] · [String Quartet] · [Cello] · [Harp] · [Ukulele] · [Banjo] · [Mandolin] · [Sitar]

**Drums:** [Drums] · [Acoustic Drums] · [Electronic Drums] · [808s] · [808 sub bass] · [Drum Machine] · [TR-909] · [Breakbeat] · [Blast beats] · [Brush Drums] · [Cinematic Percussion] · [Taiko Drums] · [Congas] · [Tambourine] · [Timpani] · [Handclaps]

**Bläser:** [Saxophone] · [Tenor Sax] · [Trumpet] · [Trombone] · [French Horn] · [Brass Section] · [Brass Stabs] · [Flute] · [Clarinet] · [Harmonica]

**Vintage-Synth-Referenzen:**

Das frühere Muster [Synth: Künstler], etwa [Prophet-5: Vangelis], ist für v6 nicht validiert — Suno ersetzt Künstlernamen. Besser den Synth-Namen mit einer Klangbeschreibung kombinieren, etwa `[Intro | Prophet-5 pads | cinematic]`.

| Synth | Klangcharakter |
|-------|----------------|
| Minimoog | fette, virtuose Leads (Prog, Berlin School) |
| Hammond B3 | treibende Rockorgel |
| Mellotron | geisterhafte Bandstreicher und Flöten |
| Prophet-5 | warme, cineastische Pads |
| CS-80 | expressive, schwebende Brass-Synths |
| ARP Odyssey | kalte, minimalistische Elektronik |
| Jupiter-8 | helle 80er-Pop-Synths |
| DX7 | glasige FM-Klänge, E-Piano, Ambient-Texturen |

**Ungewöhnliche Instrumente:** [Waterphone] · [Glass Harmonica] · [Prepared Piano] · [Theremin] · [Vibraphone] · [Hurdy-Gurdy] · [Koto] · [Didgeridoo] · [Oud] · [Erhu] · [Shamisen] · [Balalaika]

**Sound-Effekte (viele SFX-Tags sind unzuverlässig):** [Rain] · [Thunder] · [Wind] · [Ocean waves] · [Applause] · [Crowd noise] · [Record scratch] · [Silence]

### 5. Genre, Style & Era

**Maximal 1 bis 2 Genres plus 1 Era.**

**Era-Tags:** [Era: 1950s] … [Era: 2020s]

| Era | Typische Elemente |
|-----|-------------|
| 1920s–40s | Big Band, Jazz-Vocals, Swing, Bläser |
| 1950s–60s | Rock'n'Roll, Psychedelic, Surf-Gitarre, Girl Groups |
| 1970s | Disco, Funk-Bass, Moog-Synths, warme Produktion |
| 1980s | Synthwave, Gated Reverb, digitale Synths, große Drums |
| 1990s | Grunge, Trip Hop, Breakbeat, Alternative |
| 2000s | Auto-Tune, Crunk, Emo, Pop-Punk, R&B |
| 2010s–20s | Trap-808s, Future Bass, Hyperpop, Lo-fi, Bedroom Pop |

**Era-Anker verbessern die Genre-Treue deutlich:** "1980s Synthwave" statt "Synthwave", "90s Boom Bap" statt "Hip Hop".

**Era-Blending:** Max 2 Eras. Vier und mehr führen oft zum Kollaps.

**Bewährte Genre-Paare:** Rap + Trap · Lo-fi + Chill · Metal + Rock · Orchestral + Epic · Soul + R&B · Synthwave + Synth · House + Deep · Folk + Acoustic

**Genre-Fusion als Brücke formulieren:** "jazz-influenced hyperpop" statt "jazz, hyperpop".

### 6. Arrangement & Produktion

**Mix (beschreibend):** lo-fi · gritty · clean · raw · lush · sparse · atmospheric · punchy · modern pop polish · wide stereo · tape-saturated · vinyl hiss · studio-polished · warm analog sound

**Audio-Effekte (keine Prozentwerte):** reverb-heavy · slap-back delay · distorted · sidechained

### 7. Sprache & mehrsprachige Produktion

Der wichtigste Schutz vor Anglisierung ist, die Lyrics direkt in der Zielsprache ins Lyrics-Feld zu schreiben. Optional im Style-Feld `singing in German`, für Rap `German rap, rapping in German`.

**Anti-Drift:**
- Mehrdeutigkeiten aus dem Lyric-Sheet entfernen
- Phonetische Schreibweise erzwingen, wenn Suno falsch ausspricht
- Eigennamen und Markenbegriffe in kurze Zeilen und in den Chorus setzen
- **Aussprache VOR der Generierung fixen.** Nach der Audio-Erzeugung ist sie fest.

**Sprachqualität:** In v5.5 galten Englisch, Spanisch, Portugiesisch, Französisch, Japanisch, Koreanisch und Mandarin als am stärksten. Deutsch funktionierte meist gut. **Für v6 offen** — bis Anfang Oktober 2026 gibt es keine v6-spezifischen Tests zur deutschen Aussprache.

### 8. Ending Control

| Typ | Lyrics-Tag | Ergänzung im Style-Feld |
|------|-----------|----------------|
| Classic Fade | `[Outro: Slow Fade, Gradual Volume Decrease]` | "fade out ending" |
| Hard Stop | `[Outro: Sudden Stop, Final Chord Hit]` | "definitive ending, final chord" |
| Echo Decay | `[Outro: Reverb Decay, Echoing Into Distance]` | "reverb tail, atmospheric ending" |
| Live Applause | `[Outro: Final Note, Hold, Crowd Applause]` | "live ending, audience reaction" |
| Peaceful | `[Outro: Gentle Resolution, Peaceful]` | "soft ending, resolving" |
| Dramatic | `[Outro: Epic Final Chord, Sustained]` | "dramatic conclusion, held note" |

---

## Fortgeschrittene Techniken

### Pipe-Stacking

Mehrere Cues mit | in einer Klammer stapeln, wirkt wie ein UND. Abschnitts-Cues in diesem Format werden in v6 gelesen (Community-Test). Stacks KURZ halten — Elemente mit mehr als etwa 3 bis 4 Wörtern werden teils ignoriert oder mitgesungen.

```
[core element | era/genre | tone/mix | quirk detail]
```

Regeln: Mit dem Kern-Element bzw. Section-Label beginnen · 4 bis 6 Modifikatoren maximal · Era-Anker verwenden · Jede Sektion bekommt ihren eigenen Stack

```
[Verse | 60s jangly guitar | clean Fender tone | spring reverb]
[Guitar solo | 80s glam metal lead | heavy distortion | wide stereo]
[Drop | sidechained synth bass | white noise riser | sub drop]
[Chorus | anthemic | stacked harmonies | modern pop polish]
```

**⚠️ Emotion-Tags NICHT in Pipe-Stacks.** Sie stehen allein auf eigener Zeile.

**⚠️ Lange Doppelpunkt-Listen vermeiden.** `[Verse: whispered vocals, acoustic guitar only, intimate, close mic, sparse]` ist riskant. Besser das kurze Pipe-Format.

### Bewusste Kontraste

| Kontrast | Elemente | Emotionales Ergebnis |
|----------|----------|---------------------|
| Soft/Hard | Whispered Vocals + Heavy Guitars | Verletzlichkeit auf Power |
| Organic/Digital | Acoustic Guitar + Glitch Drums | Mensch und Technologie |
| Intimate/Epic | Close Whispers + Stadium Drums | Bekenntnis in großem Rahmen |
| Old/New | Vintage Sound + Modern Production | Zeitloses Gefühl |
| Simple/Complex | Single Instrument + Rich Harmonies | Tiefe aus Einfachheit |

Kontraste müssen **sektional** sein, nicht abstrakt.

### Callback Phrasing (Anti-Drift)

Sunos Aufmerksamkeit kann über einen langen Song abdriften. Gegenmittel: EXAKT dieselben Schlüsselwörter aus der Eröffnung später wiederholen. Die Technik stammt aus der v5.5-Praxis und ist für v6 nicht validiert.

```
Genre: Dark hypnotic melodic trap.
Tempo: ~140 BPM.
Mood: melancholic, obsessive.
```
→ später:
```
[Bridge: strip back to hypnotic, melancholic textures]
```

**Wichtig:** EXAKT dieselben Wörter.

Platzierung: Pre-Chorus (vor dem Energiewechsel) · Bridge (Reset nach Experimenten) · Final Chorus (Rückkehr zur Original-Ästhetik) · Outro (Ending-Stimmung verstärken)

### Call-and-Response

```
[Verse | raspy male vocal]
I've been running from the truth
[instrumental break saxophone]
You know I can't escape
[instrumental break saxophone]
```

### Remix und Cover mit Audio Influence

Der Audio-Influence-Slider steuert, wie viel vom Original erhalten bleibt (Browser und App, verifiziert). Standardwert 25 % (Community). Die Werte stammen aus der v5.5-Praxis.

| Influence | Ergebnis |
|-----------|---------|
| ≤50% | stärkere Transformation, Melodie kann verloren gehen |
| ~55% | Struktur bleibt, Charakter kommt hinzu |
| ≥60% | näher am Original, weniger Transformation |

Im Sample-Mode konkurrieren Style- und Audio-Influence. Beide auf 100 % ergeben Inkohärenz. Sample primär → Audio 60–70 %, Style 30–40 %. Tags primär → umgekehrt.

Für originaltreue Covers empfiehlt Suno zusätzlich Max Mode (offiziell).

**Venue-Presets:**

Stadium: `Live recording, massive stadium, 50,000 people, arena rock sound, crowd energy, echo and space, raw performance, epic atmosphere`

Jazz Club: `Live recording, small jazz club, intimate setting, audience chatter between songs, vintage feel, smoky atmosphere, close mic, room ambience`

Underground: `Live recording, warehouse rave, raw energy, lo-fi recording quality, underground electronic, crowd movement, bass-heavy room sound`

### Erfolgsformel für das Style-Feld

```
GENRE + DOMINANT MOOD + LEAD INSTRUMENT + VOCAL STYLE + ATMOSPHERE + PRODUCTION + BPM + UNIQUE ELEMENT
```

Die Gewichtungen sind eine Faustregel aus Community-Guides, keine gemessenen Werte. Sie zeigen die Reihenfolge der Wichtigkeit.

| Komponente | Gewicht (Faustregel) |
|-----------|--------|
| Dominant Mood | 25% |
| Base Genre | 20% |
| Vocal Style | 20% |
| Lead Instrument | 15% |
| Atmosphere | 10% |
| Production | 5% |
| BPM | 3% |
| Unique Element | 2% |

---

## Best Practices für Tags und Tests

### Prioritäten
HÖCHSTE: Song-Struktur · SEHR HOCH: Vocals, Mood, Energie · MITTEL: Instrumente · NIEDRIG: SFX

### Rule of 5

Pro Klammer maximal 5 Elemente.

```
❌ Falsch (12 Tags):
[Chorus: Epic, Powerful, Dramatic, Intense, Soaring, Emotional, Triumphant, Anthemic, Grand, Explosive, Climactic, Overwhelming]

✅ Richtig (4 Tags):
[Chorus | Anthemic | Guitar-Driven | Explosive]
```

Mit Pipes sind bis zu 6 bis 7 Elemente möglich.

### Weitere Regeln
- **Ein Job pro Tag.** Keine widersprüchlichen Anweisungen in derselben Klammer. Mood und Key müssen zusammenpassen.
- **Style Influence beachten.** Je höher, desto klarer und reduzierter die Lyrics, und desto weniger Meta-Tags.
- **Wiederholungen:** Für gesungene Wiederholungen runde Klammern, etwa (oh yeah).

### Systematisch testen
- **Jede Generation liefert zwei Takes.** Laut Community-Test unterscheiden sich die beiden Takes teils stärker als die Wirkung einer gezielten Prompt-Änderung. **Wer mit nur einem Take testet, misst Zufall.**
- Prompt-Änderungen immer an beiden Takes beurteilen, mit Variety auf Off und möglichst über mehrere Generationen.
- **Eine Variable pro Testlauf ändern.**
- Kurze Test-Generationen zuerst (Duration Custom ab 10 Sekunden), um den Prompt günstig zu prüfen.
- Zu viele Tags plus hohe Weirdness ergeben instabile Ergebnisse.
- Funktionierende Prompts sofort sichern.

### Genre-spezifische Gotchas
- „punk" im Style-Feld erzeugt oft kürzere Songs → „post-hardcore" verwenden.
- „progressive metalcore" triggert Power-Metal-Shredding → präziser formulieren.
- Trap fügt oft automatisch Auto-Tune hinzu → `autotune` ins Exclude-Feld.
- Gospel fügt fast immer Chor hinzu → `choir` ins Exclude-Feld, „uplifting major-key" im Style-Feld gegen Mood-Drift.
- Künstlernamen werden ersetzt → durch Klangbeschreibung ersetzen.
- Suno fügt eigene Dynamik ein → bei Bedarf **positiv** formulieren, etwa „relentless, full intensity throughout".
- **Rock und Metal in v6:** Die Community berichtet von dumpfem Mix, verdeckten Vocals und fehlenden Höhen (Stand September 2026). v6-wild als Alternative testen.
- **Lange Songs:** Einzelberichte sprechen von nachlassender Qualität ab etwa 2:30 im Standardmodus. Für Songs über 2 Minuten empfiehlt Suno Max Mode (offiziell). Ob Max Mode das behebt, ist offen.

---

## Advanced Options: Slider & Max Mode

Alle folgenden Regler sind in v6 im Browser vorhanden (verifiziert).

**Reihenfolge in der Oberfläche (verifiziert):** Vocal Gender, Duration, Max Mode, Weirdness, Style Influence, Variety, Personalize. Das Modell wird separat oben rechts gewählt. In dieser Reihenfolge werden die Advanced Options auch ausgegeben.

**Standardwerte (Community):** Weirdness 50 %, Style Influence 50 %, Audio Influence 25 %. Variety steht bei v6 und v6-mini auf **Normal**, bei v6-wild auf Off.

### Weirdness

Die Oberfläche zeigt nur „Safe ↔ Chaos". Die Prozentwerte sind Arbeitsbereiche aus der v5.5-Praxis und für v6 nicht validiert.

| Ziel | Weirdness |
|------|-----------|
| Covers, Tributes, max. Genre-Treue | 10–25% |
| Kommerzieller Pop | 20–40% |
| Standard, ausgewogen | ~50% |
| Creative Indie | 50–65% |
| Experimental | 65–80% |
| Glitch-Risiko | 80%+ |

### Style Influence
Standardwert 50 %. Niedrig (0–30 %) für lose Interpretation, hoch (70–100 %) für strikte Befolgung der Tags.

### Variety (neu in v6, nur Browser)

Variety ersetzt Weirdness nicht. Laut Suno verändert der Regler die Style-Prompts, um Varianz zu erzeugen. Auf Off behält man die volle Kontrolle über die eigenen Style-Tags (offiziell).

Stufen in der Reihenfolge des Reglers (verifiziert): **Off, Normal, Extra, High, Max**.

Die Community zitiert die UI-Texte „Exact style", „Balanced variety", „Distinct styles", „Bold exploration" und „Unreasonably varied". Für Off, Normal und Max ist die Zuordnung eindeutig. Welche der beiden mittleren Beschreibungen zu Extra und welche zu High gehört, ist offen.

**Empfehlung:** Bei einem ausgearbeiteten Style-Prompt Variety immer auf Off setzen. **Da v6 und v6-mini standardmäßig auf Normal stehen, muss das aktiv umgestellt werden.** Höhere Stufen nur zur Ideensuche.

### Max Mode (neu in v6, echter UI-Schalter)

Ein Schalter, der Suno mehr Rechenaufwand für ein präziseres Ergebnis investieren lässt (offiziell).

**Kosten:** Doppelte Credits pro Song, also **20 statt 10** pro Generation (verifiziert, UI-Hinweis „2x").

**Empfohlen für (offiziell):** Songs länger als 2 Minuten · Covers nah am Original · Stil-Übertragung · konsistente Vocals und konsistenter Stil über den ganzen Track

Für kurze Ideen und Tests reicht der Standardmodus.

**⚠️ Nur über den Schalter.** `[Is_MAX_MODE: MAX]` im Style- oder Lyrics-Feld hat keine Wirkung.

### Empfohlene Kombinationen

| Ziel | Weirdness | Style Influence | Variety | Max Mode |
|------|-----------|----------------|---------|----------|
| Authentische Genre-Rekonstruktion | 20–35% | 80–100% | Off | An bei Songs über 2 Min |
| Balancierte kreative Fusion | 45–55% | 65–85% | Off oder Normal | nach Länge |
| Wild experimentell | 65%+ | 40–60% | Extra oder High | Aus |
| Originaltreuer Cover | niedrig | hoch | Off | An |
| Longform-Song (über 2 Min) | nach Ziel | nach Ziel | Off | An |
| Schneller Entwurf oder Test | nach Ziel | nach Ziel | Off | Aus |

---

## Custom Models

Ein eigenes Modell auf Basis eigener Uploads (offiziell, Hilfeseite vom 9. September 2026).

- Verfügbar für Pro und Premier, bis zu 3 eigene Modelle
- Mindestens 6 Songs; die UI empfiehlt 24 und mehr für beste Ergebnisse (Community, UI-Text)
- Kosten 100 Credits pro Modell (verifiziert)
- Bulk Upload möglich, Training dauert etwa 2 bis 5 Minuten
- Modelle sind privat und nicht teilbar; an allen Uploads müssen die Rechte bestehen
- Erstellung nur im Browser über das Modell-Dropdown, „Create Custom Model (Beta)" (verifiziert)
- Bestehende v5.5-Modelle wurden automatisch auf v6 umgestellt (offiziell). Wie sich die Qualität dadurch verändert, ist offen.

**Praxis:** Stilistisch konsistente Tracks hochladen, keine Genres mischen. Ein Custom Model erfasst Genre-Tendenzen, Arrangement und Produktionsästhetik, merkt sich aber keine konkreten Melodien oder Lyrics.

---

## Personalize (My Taste)

Schalter für An und Aus, nur im Browser (verifiziert). Unter „My Taste" legst du einen persönlichen Geschmack fest, der für alle Generierungen mit aktivem Schalter gilt.

**Empfehlung:** Für gezielte Prompts, die vom eigenen Geschmacksprofil unabhängig sein sollen, Personalize ausschalten — etwa bei Auftragsarbeiten oder bewusst untypischen Genres.

Für Voices, Custom Models und My Taste soll laut Suno ein kompatibles Modell gewählt sein (offiziell, ohne nähere Angabe).

---

## Voices & Personas

**Offizieller Stand:**
- Voices (eigene Stimme aufnehmen bzw. klonen) gibt es seit 26. März 2026, seit 7. August 2026 auch auf iOS und Android. Auf Free-Tarifen testbar.
- Nur ab 18 Jahren und mit regionalen Einschränkungen.
- Die Voices-FAQ (Stand 26. März 2026) verweist noch auf v5.5 als einziges kompatibles Modell. Nach der Abschaltung aller Vormodelle ist sie veraltet.
- Der Voices-Button hat die Personas ersetzt. Style Personas sind im Voices-Menü weiterhin verfügbar.

**Community-Stand:**
- Die UI bietet ein Ein-Klick-„Upgrade Voice to v6" an. Unterschieden werden „Voice (new)" und „Style Voice (legacy)".
- Voices funktionieren nicht bei Instrumentals.
- Einzelberichte nennen Stimmdrift mitten im Song.

**Prompting mit Voice (v5.5-Praxis, für v6 nicht validiert):** Geschlechts-Deskriptoren weglassen, da die Stimme bekannt ist · frei gewordene Zeichen für Produktionsdetails nutzen · Weirdness eher niedrig halten

**Nicht verwenden:** `[Persona: X]` als Lyrics-Tag. Personas sind ein UI-Feature.

> **App-Bezug:** `suno.tsx` hat einen „Voices"-Toggle, der Gender-Deskriptoren aus Style und Lyrics entfernt. Das deckt sich mit der Empfehlung oben.

---

## Suno Studio & Stem-Separation

**Suno Studio (Premier):**
- Studio 2.0 seit 13. August 2026 mit MIDI, Effekten, Wavetable-Synth und Automation (offiziell)
- Update vom 2. September 2026 (Chat-Bar kennt BPM, schnellere Wiedergabe)
- MIDI-Update vom 17. September 2026: genauere MIDI-zu-Audio-Umwandlung, Stems aus MIDI-Clips per Chat-Bar, umbenennbare Clips (offiziell)
- Exporte aus Studio sind für Premier unbegrenzt

**Stem-Separation (offiziell):**

| Methode | Verfügbar | Ergebnis | Credits |
|---------|-----------|----------|---------|
| **Split from Mix** | Pro, Premier | ein Ziel-Stem plus „alles andere" | 10 pro Extraktion, 20 für beide |
| **Auto Split** | Pro, Premier | bis zu 12 Stems | 50 |
| **Advanced Split** | nur Premier | Auswahl aus fast 100 Instrumenten | 10 pro Stem |

Ob Split from Mix auch im Free-Tarif verfügbar ist, ist offen.

---

## Speech (Beta)

Seit 1. Oktober 2026 erzeugt Speech gesprochene Sprache und Hintergrundmusik in einem Take, auf Web und Mobile (offiziell). Läuft über die normalen Credit-Pläne. Kosten pro Generation und unterstützte Sprachen hat Suno nicht veröffentlicht. Akzente und Pausen können abweichen. Kein Songwriting-Werkzeug im engeren Sinn.

---

## Sounds-Tab

Eigenständiges Werkzeug für kurze Samples wie Effekte, Loops und One-Shots. Eigene Felder für Sound-Beschreibung, Type (One-Shot/Loop), BPM und Key (verifiziert). Bei Einführung im Januar 2026 an Pro oder Premier gebunden.

---

## Sonic Presets

Funktionierende Style-Prompts sofort sichern. Ob das frühere „Buch"-Icon neben dem Style-Feld in v6 noch existiert, ist offen. Im Zweifel extern ablegen.

"80s Synthwave":
```
80s Synthwave, nostalgic neon vibes, analog synths, gated reverb drums, retro futuristic, 112 BPM, driving bass, arpeggiated synths, cinematic, nocturnal atmosphere
```

"Dark Berlin Techno":
```
Dark techno, minimal and hypnotic, 130 BPM, driving relentless bass, industrial atmosphere, underground Berlin club, sparse arrangement, menacing groove
```

"Acoustic Coffeehouse":
```
Acoustic indie folk, warm male vocals, fingerpicked guitar, intimate setting, coffee shop vibe, 95 BPM, storytelling, organic and natural, gentle reverb
```

---

## Kosten & Limits (Stand Oktober 2026)

**Credits pro Generation:**
- Eine Generation erzeugt zwei Songs und kostet 10 Credits (offiziell).
- Max Mode kostet das Doppelte (verifiziert).
- Viele Bilder oder Videos im Simple-Prompt kosten mehr; eine Zahl ist nicht veröffentlicht.

**Tarife (Preisseite, geprüft am 19. September 2026, Community):**

| Tarif | Preis | Credits | Modelle |
|-------|-------|---------|---------|
| Free | 0 USD | 50 pro Tag | nur v6-mini, keine kommerzielle Nutzung |
| Pro | 10 USD/Monat (8 bei Jahreszahlung) | 2.500 pro Monat | alle drei |
| Premier | 30 USD/Monat (24 bei Jahreszahlung) | 10.000 pro Monat | alle drei, plus Studio |

**Download-Limits seit 3. September 2026 (offiziell):**
- Free: 7 Trial-Downloads für die gesamte Kontolaufzeit; Konten ab dem 3. September 2026 nur gelegentlich
- Pro: 20 pro Monat
- Premier: 60 pro Monat, Studio-Exporte unbegrenzt

**Präzisierungen (Community):** Ein Song zählt als ein Download, auch mit WAV, MP3 und Stems · erneute Downloads desselben Songs sind kostenlos · die Limits gelten auch für alte Songs · ungenutzte Downloads verfallen.

**Kommerzielle Nutzung (zitierte ToS, Community):** erfordert einen Download in einem bezahlten Tarif · Remixe sind nie kommerziell nutzbar · Wasserzeichen und Fingerprints dürfen nicht entfernt werden.

---

## Rechtlicher Rahmen (Stand Oktober 2026)

- **GEMA gegen Suno:** Das LG München I hat den GEMA-Ansprüchen am 31. Juli 2026 überwiegend stattgegeben (Az. 42 O 763/25). Betroffen sind sechs Werke, darunter „Atemlos durch die Nacht", „Big in Japan" und „Forever Young". Das Urteil ist nicht rechtskräftig; Suno prüft eine Berufung.
- **UMG und Sony:** Neue Klage vor einem US-Bundesgericht vom 18. September 2026, laut Berichten um mindestens 60.202 Aufnahmen.
- **Lizenzpartner von v6:** WMG, BMG und Believe. Suno gibt an, v6 sei auf lizenzierten Inhalten der Partner, auf Interaktionen der Community und auf eigenen Erkenntnissen trainiert.

**Konsequenz für das Prompting:** Keine Texte, Melodien oder markanten Hooks bekannter Werke nachbilden. Keine Künstlernamen verwenden. Eigene Kreationen fließen laut Suno in das Training ein.

---

## ⚠️ Widerlegte Mythen und überholte Praktiken (NICHT verwenden)

| Mythos | Realität |
|--------|----------|
| `[Is_MAX_MODE: MAX]`, `[QUALITY: MAX]`, `[REALISM: MAX]` als Text-Tag | Hoax. Der echte Max Mode ist seit v6 ein UI-Schalter. Der Klammer-Tag bleibt wirkungslos und kann mitgesungen werden. |
| `///*****///` am Lyrics-Anfang | Teil des alten MAX-MODE-Hoax, ohne Wirkung |
| `[Reverb: 30%]`, `[Bass: 80%]`, `[Stereo Width: Wide]` | Prozent- und Parameterwerte werden ignoriert. Beschreibend formulieren. |
| **`no drums` o. ä. im Style-Feld schließt Elemente aus** | **In v6 nicht zuverlässig, laut Community-Tests teils gegenteilig. Exclude Styles nutzen.** |
| Künstlernamen im Style-Feld („like Bon Iver") | Werden laut UI-Hinweis durch ähnliche Stile ersetzt. Klang beschreiben. |
| `[START_ON: "..."]` | Nicht dokumentiert, nicht verifiziert. Intro weglassen oder wegschneiden. |
| `[Textual Particularity]` | Nicht verifiziert. Aussprache über Zielsprache und Phonetik steuern. |
| `[Persona: X]` als Lyrics-Tag | Personas und Voices sind ein UI-Feature, kein Tag. |
| `[Clean Lyrics]` / `[Explicit]` als Filter-Override | Steuert den Inhaltsfilter nicht. |

**Merksatz:** Wenn ein Tag wie ein Mischpult-Regler oder ein Schalter aussieht (`[X: Wert]`, `[X: MAX]`), ist er als TEXT mit hoher Wahrscheinlichkeit ein Placebo. Die echte Entsprechung ist fast immer ein UI-Element.

---

## Ausgabe-Format der App

`suno.tsx` gibt fünf Codeblöcke in der Reihenfolge der Suno-Seite aus:

```
# 1. LYRICS
# 2. STYLE
# 3. EXCLUDE
# 4. ADVANCED OPTIONS      ← UI-Einstellungen, nicht einfügbarer Text
# 5. TITLE
```

Der ADVANCED-OPTIONS-Block spiegelt das „More Options"-Panel von oben nach unten:

```
Vocal Gender: Male
Duration: Auto
Max Mode: Off
Weirdness: 38%
Style Influence: 80%
Variety: Off
Personalize: Off
```

---

## Checkliste vor der Ausgabe

- [ ] Modus **Advanced** gewählt (nicht Simple oder Sounds)
- [ ] Modell bewusst gewählt (v6 Standard, v6-wild bei Rock/Metal testen, v6-mini für Entwürfe)
- [ ] Song-Struktur mit Tags markiert (jede Sektion hat mindestens einen Tag)
- [ ] Vocal-Gender-Feld gesetzt; bei Duetten leer lassen und Text-Tags pro Sektion verwenden
- [ ] Mood und Energie festgelegt
- [ ] BPM als konkreter Wert im Style-Feld
- [ ] Key bzw. Tonart im Style-Feld
- [ ] Max 1 bis 2 Genres und 1 Era
- [ ] Max 3 bis 4 benannte Instrumente, insgesamt 6 bis 8 Begriffe
- [ ] **Keine Künstlernamen**, Klang stattdessen beschreiben
- [ ] Keine Meta-Tags mitten im Text
- [ ] Style-Feld formatiert (genre / instruments / style tags / recording)
- [ ] **Keine Negativformulierungen im Style-Feld.** Ausschlüsse nur im Exclude-Feld, als schlichte Begriffe ohne „no".
- [ ] Keine Parameter- oder MAX-MODE-Text-Tags
- [ ] Advanced Options in der Reihenfolge der Oberfläche ausgegeben
- [ ] Duration bewusst gesetzt (Custom nur im Browser, max. 6 Minuten)
- [ ] Max Mode bewusst gesetzt (an bei Songs über 2 Minuten, kostet doppelt)
- [ ] Weirdness realistisch (für die meisten Songs etwa 35 bis 55 %)
- [ ] **Variety bewusst gesetzt** (Off bei ausgearbeitetem Style-Prompt; Suno startet auf Normal)
- [ ] Personalize bewusst gesetzt (aus bei untypischen Genres oder Auftragsarbeiten)
- [ ] Alle Abschnitte in separaten Codeblöcken
- [ ] Max 5 Elemente pro Klammer, mit Pipes max 6 bis 7
- [ ] Callback-Phrasing bei längeren Songs
- [ ] Ending-Control festgelegt
- [ ] Emotion-Tags auf eigener Zeile (nicht in Pipe-Stacks)
- [ ] Runde Klammern nur für gesungene Background-Vocals
- [ ] ALL CAPS max 1 bis 3 Wörter pro Sektion
- [ ] Bei nicht-englischen Songs Lyrics in der Zielsprache, Aussprache vor der Generierung geprüft
- [ ] Bei App-Nutzung geprüft, ob Duration, Variety, Max Mode, Custom Model und Personalize verfügbar sind
