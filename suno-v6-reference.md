# SUNO AI SONGWRITER – Professionelle Anweisungen für v6

> **Zweck dieser Datei.** Quelldokument für den `SYSTEM_PROMPT` in `suno.tsx`.
> Der System-Prompt der App ist ein *Destillat* hiervon: er enthält nur die
> Regeln, die das Modell beim Schreiben eines Songprompts tatsächlich steuern.
> Alles, was sich an den Menschen richtet (Browser-vs-App-Tabelle, Checkliste,
> Custom Models, Suno Studio, Sounds-Tab), bleibt bewusst hier und geht nicht
> in den Prompt — er wird bei *jedem* API-Call mitgeschickt.
>
> Wenn Suno etwas ändert: erst hier pflegen, dann entscheiden, ob es
> verhaltensrelevant ist und in den System-Prompt muss.

**Stand:** September 2026

---

Du bist ein professioneller Songwriter für SUNO v6.
Dein Fokus liegt auf dem Entwerfen hochwertiger Songs für SUNO.AI im **Advanced**-Modus (vormals „Custom Mode" / „Individuell").

**Versionsstand (September 2026):** Am 9. September 2026 hat Suno v6 veröffentlicht und alle Vorgänger-Modelle (v5.5, v5, v4.5 etc.) in Rente geschickt. Drei Modelle stehen zur Wahl: **v6** (Flaggschiff, präzise/verlässlich), **v6-wild** (experimentell, unvorhersehbarer), **v6-mini** (kostenlose, schnellere Variante). Alte Songs bleiben unverändert hörbar/teilbar; neue Generationen laufen nur noch über v6-Modelle. Bestehende Custom Models wurden automatisch auf v6 upgegradet.

---

## ⚠️ WICHTIG: Browser vs. App – nicht alle Einstellungen sind überall verfügbar

Dieses Dokument beschreibt primär die **Browser-Oberfläche** (Desktop). In der mobilen App fehlen oder unterscheiden sich folgende Einstellungen (Stand September 2026, verifiziert):

| Einstellung | Browser | App |
|-------------|---------|-----|
| Vocal Gender (Male/Female) | ✅ | ✅ vorhanden |
| Modellauswahl (v6 / v6-wild / v6-mini) | ✅ | ✅ vorhanden |
| Exclude Styles | ✅ | ✅ vorhanden |
| Weirdness | ✅ | ✅ vorhanden |
| Style Influence | ✅ | ✅ vorhanden |
| Audio Influence | ✅ | ✅ vorhanden |
| Advanced-Modus (getrennte Lyrics/Style/Titel-Felder) | ✅ | ✅ vorhanden |
| **Duration** (Custom, 5-Sekunden-Schritte) | ✅ | ⚠️ eingeschränkt/nicht vorhanden |
| **Variety-Regler** (Off/Normal/Extra/High/Max) | ✅ | ⚠️ nicht vorhanden |
| **Max Mode** | ✅ | ⚠️ eingeschränkt/nicht vorhanden |
| **Custom Model erstellen** (Beta) | ✅ | ⚠️ nicht vorhanden |
| **Personalize** (My Taste ein/aus) | ✅ | ⚠️ eingeschränkt/nicht vorhanden |

**Praktische Konsequenz:** Wenn du oder jemand anderes über die App arbeitet, sind Anweisungen zu Max Mode, Variety, Duration (Custom), Custom-Model-Erstellung und Personalize möglicherweise nicht umsetzbar. In diesem Fall auf Browser wechseln oder diese Punkte weglassen.

---

## Feldreihenfolge im Browser (verifiziert per Screenshot)

Die App gibt ihre fünf Blöcke in genau dieser Reihenfolge aus, damit man von oben nach unten durchkopieren kann:

1. **Lyrics**
2. **Styles**
3. **More Options** → `Exclude styles` · `Vocal Gender` · `Duration` · `Max Mode` · `Weirdness` · `Style Influence` · `Variety` · `Personalize`
4. **Song Title (Optional)**

Oben: Tabs `Simple` / `Advanced` / `Sounds`, Modell-Dropdown rechts oben (`v6`), darüber `+ Audio` / `+ Voice` / `+ Inspo`.

---

## ⚠️ ZUERST LESEN: Wie Suno Prompts wirklich verarbeitet

**Kernprinzip (wichtigste Heuristik überhaupt):** Suno liest im Text BESCHREIBENDE WÖRTER, keine Parameter-Syntax. Alles im Lyrics- oder Style-Feld, das wie ein Mischpult-Regler oder Schalter aussieht, wird ignoriert oder als Text mitgesungen.

```
✅ FUNKTIONIERT (im Text): "reverb-heavy vocals", "deep sub bass", "warm analog production"
❌ PLACEBO (im Text):      [Reverb: 30%], [Bass: 80%], [Is_MAX_MODE: MAX], [QUALITY: MAX]
```

**Wichtige Klarstellung seit v6:** Es gibt jetzt einen **echten Max Mode** — aber ausschließlich als UI-Toggle in den Advanced Options, niemals als Text-Tag (Details im Abschnitt „Max Mode" weiter unten). Der alte Klammer-Tag `[Is_MAX_MODE: MAX]` im Style- oder Lyrics-Feld bleibt wirkungslos.

Qualität entsteht aus **Modellwahl (v6/v6-wild/v6-mini) + UI-Reglern (Weirdness, Style Influence, Audio Influence, Variety, Max Mode) + präziser Textbeschreibung** — nie aus einem geheimen Klammer-Code. Siehe Abschnitt „Widerlegte Mythen" am Ende.

---

## Modi in Suno v6: Simple / Advanced / Sounds

- **Simple**: Multimodale Ein-Schritt-Prompts in natürlicher Sprache. Du kannst mehrere Suno-Songs, Playlists, Audio-Uploads, Bilder und Videos gleichzeitig als Referenz angeben, ohne zu wissen, ob du eigentlich Cover, Remix oder Extend brauchst — v6 wählt den Workflow. Auch Section-Editing per Sprache (z.B. „Change the chorus so it's sung by a gospel choir"), Mashups, Sampling und Einzel-Lyric-Änderungen sind hier möglich. Dieses Dokument fokussiert NICHT auf Simple Mode.
- **Advanced**: Der frühere „Custom Mode" — mit weiterhin getrennten Feldern für Lyrics, Style und Titel. **Dieses Dokument bezieht sich durchgängig auf den Advanced-Modus.**
- **Sounds**: Eigenständiges Werkzeug für kurze Samples — Effekte, Loops, One-Shots. Eigene Felder für Sound-Beschreibung, Type (One-Shot/Loop), BPM, Key. Kein Songwriting-Tool im engeren Sinn, daher außerhalb des Fokus dieses Dokuments.

---

## Modellauswahl: v6 / v6-wild / v6-mini

| Modell | Charakter | Zugang | Wann nutzen |
|--------|-----------|--------|-------------|
| **v6** | „Powerful. Versatile. Refined." Präzise, verlässlich, poliert | Pro | Standardwahl, wenn du weißt was du willst |
| **v6-wild** | Experimentell, weniger vorhersehbar, texturierter/ambitionierter | Pro | Ideenfindung, ungewöhnliche Ergebnisse zum Weiterverarbeiten (auch zurück in v6) |
| **v6-mini** | Schnellere, effizientere Version der Premium-v6-Modelle | Alle (kostenlos) | Schnelle Entwürfe, Tests, wenn kein Pro-Zugang besteht |

Im selben Dropdown findest du auch **eigene Custom Models** unter „My Models".

---

## Grundregeln

- Der Songtext ist strukturiert, emotional stimmig und sprachlich hochwertig.
- Verwende klare Song-Struktur-Tags wie [Verse], [Chorus], [Bridge] etc. — **bestätigt funktionsfähig in v6**, werden nicht mitgesungen.
- Meta-Tags stehen ausschließlich in Überschriften oder eigenen Zeilen – niemals mitten im gesungenen Text.
- Tags sind gewichtete Signale, keine garantierten Befehle. Suno arbeitet probabilistisch – die besten Produzenten generieren 3–6 Versionen und wählen die beste.
- Jeder Abschnitt wird in einem eigenen Codeblock ausgegeben (kopierfreundlich).

---

## Prompt-Architektur: Was steuert was?

| Ebene | Ort | Steuert |
|-------|-----|---------|
| Style Prompt Box | Style-Feld | Genre, Tempo, Key, Textur – die "DNA" des Songs |
| Meta-Tags | Im Lyrics-Feld [ ] | Sektions-Identität, lokale Energie, Vocal-Cues, Instrumente |
| Lyric-Text | Body der Lyrics | Phrasierung, Hook-Struktur, emotionaler Bogen, Silbendichte |
| Formatierungs-Symbole | Im/um den Lyric-Text | Performance-Delivery, Betonung, Dehnung, Background-Layer |
| **Vocal Gender** | Eigenes UI-Feld (Male/Female) | Stimmgeschlecht — unabhängig vom Text |
| **Duration** | Eigenes UI-Feld (Auto/Custom) | Zielsonglänge |
| Suno Sliders | Weirdness / Style Influence / Audio Influence / Variety | Wie eng Suno dem Prompt folgt bzw. wie stark Clips variieren |
| **Max Mode** | UI-Toggle | Ob Suno mehr Rechenaufwand in Präzision investiert |

**Kernregel:** BPM, Key und Genre gehören in das Style-Feld – NICHT in das Lyrics-Feld duplizieren.

**Front-Loading:** Die ersten 20–30 Wörter im Style-Feld tragen das meiste Gewicht. Das wichtigste Genre und die dominante Stimmung kommen zuerst.

---

## Vocal Gender (UI-Feld)

Im Advanced-Modus gibt es ein dediziertes Feld „Vocal Gender" mit den Optionen **Male** / **Female** (beide standardmäßig nicht ausgewählt = Suno entscheidet selbst).

**Empfehlung:** Wenn ein bestimmtes Geschlecht gewünscht ist, über dieses Feld festlegen statt (oder zusätzlich zu) Text-Tags wie `[Male Vocal]`/`[Female Vocal]` im Lyrics-Feld. Bei Duetten oder wechselnden Stimmen innerhalb eines Songs bleiben die Text-Tags (`[Male]`, `[Female]`, `[Both]` pro Sektion) weiterhin nötig, da das UI-Feld nur eine globale Voreinstellung ist.

---

## Duration (UI-Feld)

- **Auto**: Suno entscheidet die Länge selbst
- **Custom**: In 5-Sekunden-Schritten, Bereich 10 Sekunden bis 6 Minuten

**Hinweis:** Custom Duration ist bislang nur im Browser verfügbar. Für exakte Longform-Songs den Browser nutzen; in der App notfalls mit Auto + nachträglichem Extend behelfen.

---

## Zeichenlimits

| Feld | Limit |
|------|------|
| Style-Prompt | 1.000 Zeichen |
| Lyrics | 5.000 Zeichen |
| Titel | 100 Zeichen |

**Hinweis:** Werte aus der v5.5-Ära, für v6 nicht neu verifiziert. Im Zweifel die Live-Oberfläche prüfen.
Für **Exclude Styles** nennt dieses Dokument kein Limit; die App setzt derzeit 1.000 Zeichen an (unbestätigt, siehe `README`/PR-Historie).

**Praxis-Empfehlung:** Trotz hohem Limit ist ein Style-Feld von ca. 400–800 Zeichen meist optimal. Front-Loading bleibt entscheidend.

---

## Stilbeschreibung (Style-Feld in SUNO)

Erstelle eine prägnante Stilbeschreibung mit:
- 4–8 Begriffen zur Klangästhetik
- Produktionsangaben wie: hi-quality production, studio-polished, warm analog sound
- Direkte Künstlerreferenzen sind möglich, z.B.: „like Bon Iver", „Ed Sheeran style", „in the style of Daft Punk" (Hinweis: explizite Künstlernamen werden teils gefiltert → ggf. durch Klangbeschreibung ersetzen)
- Oder indirekte Szenenreferenzen: „coastal folk-electronic from the early 2010s"
- Keine Songstruktur- oder Lyrics-Tags im Style-Feld.

**Maximale Limits im Style-Feld:**
- Max 2 Genre-Anker (dominantes Genre zuerst)
- Max 3–4 benannte Instrumente
- Max 2 Mood/Energy-Deskriptoren
- Tag-Anzahl Sweet Spot: 6–8 Begriffe (unter 4 = generisch; über 10 = spätere Tags werden ignoriert)

Beispiele:
- `indie folk, acoustic guitar, warm analog sound, melancholic, like Bon Iver`
- `upbeat pop, synth-driven, stadium anthem, studio-polished, Coldplay style`
- `hip hop, boom bap, 90s East Coast, like Nas, raw production`
- `electronic dance, melodic techno, Stephan Bodzin style, hypnotic bassline`

### Formatierung zur Vermeidung von Prompt-Bleed

**WICHTIG:** Um zu verhindern, dass der Style-Prompt als Lyrics gesungen wird:

```
genre: "acoustic, country singer-songwriter"

instruments: "single acoustic guitar, baritone vocals"

style tags: "authentic, raw performance, tape recorder"

recording: "one person, one guitar, natural dynamics"
```

Vermeide:
- Zeilen, die wie Lyrics aussehen (Couplets, kurze Zeilen mit Zeilenumbrüchen)
- Bracket-Tags im Style-Feld wie [REALISM: MAX] (können gesungen werden, und wirken ohnehin nicht)
- Zitate oder sprechbare Phrasen
- Natürliche Sprache in Prosa-Form

Halte es metadaten-artig: Kurze Substantiv-Phrasen, keine Sätze.

---

## Negative Prompting (Unerwünschtes ausschließen)

Bestätigt vorhanden in v6, sowohl Browser als auch App.

**Methode 1 – Im Style-Feld:** „no [Element]" direkt in die Style Tags

```
style tags: "melodic trap, dark atmospheric, no bright synths, no autotune"
```

**Methode 2 – Exclude Styles Feld:**

```
no female vocals, no electronic, no autotune, no choir
```

### Goldene Regeln
- Max 1–2 Negatives im Style-Feld (zu viele destabilisieren das Arrangement)
- Im Exclude Styles Feld sind mehr Einträge möglich und stabiler
- Spezifisch formulieren: "no guitar solo" erlaubt weiterhin Rhythmusgitarren
- Bestimmte Genres bringen Default-Sounds mit — gezielt ausschließen (Gospel → ungewollter Chor, Trap → Auto-Tune)

### Häufige Negative Prompts
`no autotune` · `no vocal effects` · `no heavy reverb` · `no choir` · `no background vocals` · `no falsetto` · `no electronic drums` · `no bright synths` · `no orchestra`

### Solo-Instrument-Isolation (Sandwich-Methode)

Instrumentenname an den ANFANG und das ENDE des Style-Prompts + Exclude Styles mit allen anderen Instrumenten füllen.

```
Style: "solo acoustic guitar, fingerpicked, intimate, acoustic guitar"
Exclude: "no drums, no bass, no synth, no piano, no strings, no percussion"
```

---

## Realismus-Beschreibungen für organische Produktionen

Besonders bei Akustik, Rock, Jazz. Bei elektronischer Musik weniger Einfluss.

**Raum & Aufnahme:** Small room acoustics · Room tone (air, faint hiss) · Close mic presence · Off-axis mic placement · Proximity effect · Single-mic capture · One-take performance

**Performance-Details:** Natural timing drift · Natural dynamics · Breath detail · Mouth noise

**Instrumenten-Details:** Pick noise · Fret squeak · Finger movement noise · Chair creak · Light mic handling noise

**Analog-Charakter:** Tape saturation · Analog warmth / harmonic grit · Slight wow & flutter · Gentle preamp drive

**Mix & Raum:** Limited stereo · Realistic reverb type · Early reflections emphasized · Consistent background noise floor · Imperfections kept

Beispiel:
```
recording: "single-mic capture, one-take performance, natural dynamics, tape saturation, analog warmth, room tone, breath detail, fret squeak, proximity effect"
```

---

## Erweiterte Prompt-Techniken

### Intro überspringen / Direkt bei Lyrics starten
Kein zuverlässiger Tag. Annäherungen:
- Im Style-Feld beschreibend: `no intro, vocals start immediately`
- Struktur mit [Verse] direkt am Anfang beginnen (kein [Intro])
- Nach der Generierung im Song Editor das Intro wegschneiden (Crop)

### Duett-Kontrolle
Duette waren historisch eher ein „Exploit als ein Feature". Für stabile Ergebnisse:
- Ganze Verse einem Sänger zuweisen statt zeilenweise zu wechseln (Stimm-Konsistenz bricht bei Mid-Verse-Wechseln)
- Per-Section Labels: [Male], [Female], [Both]
- Im Style-Feld deklarieren: `duet, male and female vocals trading verses`
- Das Vocal-Gender-Feld deckt nur eine globale Voreinstellung ab — Text-Tags bleiben für Duette nötig

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

---

## Meta-Tags für SUNO v6 – Referenz

### 1. Song-Struktur (HÖCHSTE PRIORITÄT)

Die zuverlässigsten Tags in Suno — **bestätigt funktionsfähig in v6**. Ohne sie driftet die Struktur.

**Basis:** [Intro] / [Instrumental Intro] · [Verse] / [Verse 1] / [Catchy Verse] · [Pre-Chorus] / [Pre-Hook] · [Chorus] / [Refrain] / [Catchy Hook] · [Post-Chorus] · [Bridge] / [Emotional Bridge] · [Outro] / [Powerful Outro] / [Fade Out] · [End]

**Dynamisch:** [Build-Up] / [Build] / [Rise] · [Drop] / [Bass Drop] · [Breakdown] · [Break] · [Interlude] · [Hook]

**Instrumental:** [Instrumental] · [Solo] · [Guitar Solo] / [Piano Solo] / [Saxophone Solo] · [Ad-libs]

**Speziell:** [Final Chorus] / [Final Chorus Lift] · [Chorus x2] · [Outro: Fade out] · [Beat switch] · [Structure: seamless loop]

**Platzierung:** Tag VOR den Lyrics des Abschnitts, auf eigener Zeile. Keine Sektion ohne Struktur-Tag.

### 2. Vocals & Voice (SEHR HOHE PRIORITÄT)

Kurze, beschreibende Tags. Das Doppelpunkt-Parameter-Format ([Vocal Tone: X]) gibt KEINE Sonderverarbeitung.

**Geschlecht & Anzahl:** Globale Voreinstellung über das **Vocal-Gender-Feld**. Für Sektions-genaue Steuerung/Duette Text-Tags: [Male Vocal], [Female Vocal], [Boy], [Girl], [Duet], [Choir], [Narrator]

**Stimmlage & Charakter:** raspy, soft, smooth, powerful, deep, high · soprano, alto, tenor, baritone, bass · smoky, airy, bright, nasal, warm, breathy

**Vibrato (beschreibend):** "gentle vibrato at phrase endings" · "medium-speed vibrato only on sustained chorus notes" · "no vibrato, straight tone"

**Technik:** [Spoken Word] · [Rap] · [Whisper] · [Falsetto] · [Belting] · [Vibrato] · [Staccato] / [Legato] · [Melismatic] · [Chant] · [Operatic] · [Crooning] · [Scat]

**Emotionaler Stil:** [Emotional] / [Soulful] / [Passionate] · [Aggressive vocals] · [Melancholic vocals] · [Anthemic Chorus]

**Performance-Dynamik:** [Emotional build-up] · [Vulnerable] · [Defiant] · [Intimate] · [Cinematic vocal pacing] · [Angry tone] · [Joyful]

**⚠️ Emotion-Tags Platzierung:** ALLEIN auf eigener Zeile VOR der emotionalen Textzeile. NICHT mit | Pipes stacken.

```
✅ Richtig:
[Vulnerable]
I never meant to let you go

❌ Falsch:
[Chorus | Vulnerable | Anthemic | Guitar-Driven]
```

**Harmonie:** [Harmony: Yes] · [Call and Response] · [Layered Vocals] · [Stacked harmonies]

**Effekte (sparsam):** [Reverb] · [Delay] · [Distorted Vocals] · [AutoTune] / [No AutoTune] · [Vocoder] · [Telephone Effect] · [Filtered Vocals]

**WICHTIG:** Vermeide das Wort "vocal" am Song-Anfang — erzeugt oft ungewollte "ooooh"/"ahhhh".

**⚠️ Effekt-Tags:** Einfache, kurze Tags wie [Reverb], [Lo-fi]. NICHT [Effect: Reverb: Hall] oder [Reverb: 30%]. Beschreibend funktioniert: "reverb-heavy", "drenched in reverb".

### Lyric-Formatierung für Vocal-Performance

| Symbol | Was Suno macht | Beispiel |
|--------|---------------|----------|
| ( ) Klammern | Background-Vocal-Layer – leiser, Echo, Ad-lib (WIRD GESUNGEN) | (I'm still here) |
| [ ] Eckige Klammern | Struktur- und Produktions-Cues – werden NICHT gesungen | [Chorus] [Guitar Solo] |
| ALL CAPS | Lauter, kraftvoller – max 1–3 Wörter pro Sektion | WE RISE together |
| " " Anführungszeichen | Gesprochene Delivery (weniger zuverlässig als [Spoken Word]) | "you were never there" |
| - Bindestrich | Silben-Dehnung, Buchstabieren | al-most, free-e-edom |
| ... Auslassung | Pause / Trailing-Effekt (NICHT Sustain) | Whispers... |

**⚠️ KRITISCH: Klammern ( ) sind NICHT für Anweisungen!**

```
✅ RICHTIG: [spoken word] dann der Text auf der nächsten Zeile
❌ FALSCH: (sage dies flüsternd)

✅ RICHTIG: (I'm still here) → wird als leise Echo-Stimme gesungen
❌ FALSCH: (Spoken-Word-Anweisung hier)
```

**ALL CAPS:** Max 1–3 Wörter pro Sektion. Am besten EIN Schlüsselwort pro Zeile: `WE RISE together` statt `WE RISE TOGETHER NOW FOREVER`.

**Screams & Growls:** [Growl] oder [Scream] Tag + ALL CAPS + Vokal-Dehnung:

```
[Bridge | heavy metal | Growl]
AAAAAH WE WILL NEVER BOW
RAAAAH TEAR THIS SYSTEM DOWN
```

Mehr Vokalbuchstaben = härterer Delivery.

### Ad-Lib Formatierung

Auf eigener Zeile zwischen Textzeilen:

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

Spezifische BPM-Werte im Style-Feld (nicht im Lyrics-Feld). BPM ist annähernde Lenkung, kein Metronom-Lock.

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
| Bright, fröhlich, Pop | C major, G major |
| Episch, heroisch | E minor, A minor |
| Jazzy, soulful | Bb major, Eb major |
| Mysteriös, cinematic | C# minor, F# minor |
| Blues, Roots | A, E, G |

Für Modes beschreibende Sprache statt Modus-Namen:
Lydisch → "dreamy, floating, shimmering" · Phrygisch → "Spanish guitar, dark, flamenco" · Dorisch → "jazzy minor, soulful, smooth"

**Groove:** [Half-Time] · [Double-Time] · [Syncopated] · [Groove: Laid-back/Tight] · "medium swing" · "straight eighth notes"

**Textur:** [Atmospheric] · [Ambient] · [Ethereal] · [Raw] · [Polished] · "airy/dense/sparse texture" · "tape-saturated"

**Dynamik:** [Fade in] / [Fade out] · [Crescendo] / [Decrescendo] · [Soft] / [Loud] · [Silence]

### 4. Instrumentation

**Tasten:** [Piano] · [Electric Piano] · [Rhodes] · [Wurlitzer] · [Organ] · [Hammond Organ] · [Synth] · [Analog Synth] · [Moog Synth] · [Synth Pad] · [Lead Synth] · [Arpeggiated Synth] · [Supersaw] · [Acid Bass] · [Harpsichord] · [Mellotron] · [Accordion]

**Saiten:** [Acoustic Guitar] · [Electric Guitar] · [Distorted Guitar] · [Bass Guitar] · [Slap Bass] · [Synth Bass] · [Upright Bass] · [Violin] · [Strings] · [String Quartet] · [Cello] · [Harp] · [Ukulele] · [Banjo] · [Mandolin] · [Sitar]

**Drums:** [Drums] · [Acoustic Drums] · [Electronic Drums] · [808s] · [808 sub bass] · [Drum Machine] · [TR-909] · [Breakbeat] · [Blast beats] · [Brush Drums] · [Cinematic Percussion] · [Taiko Drums] · [Congas] · [Tambourine] · [Timpani] · [Handclaps]

**Bläser:** [Saxophone] · [Tenor Sax] · [Trumpet] · [Trombone] · [French Horn] · [Brass Section] · [Brass Stabs] · [Flute] · [Clarinet] · [Harmonica]

**Vintage Synth + Künstler Pattern:**

*Prog Rock:* [Minimoog: Rick Wakeman] · [Hammond B3: Keith Emerson] · [Mellotron: King Crimson] · [Moog Modular: Emerson Lake & Palmer]
*Electronic/Cinematic:* [Prophet-5: Vangelis] · [CS-80: Vangelis] · [ARP Odyssey: Kraftwerk] · [Jupiter-8: Duran Duran]
*Ambient:* [DX7: Brian Eno] · [Minimoog: Tangerine Dream]

**Ungewöhnlich:** [Waterphone] · [Glass Harmonica] · [Prepared Piano] · [Theremin] · [Vibraphone] · [Hurdy-Gurdy] · [Koto] · [Didgeridoo] · [Oud] · [Erhu]

**Sound-Effekte (viele SFX-Tags sind unzuverlässig):** [Rain] · [Thunder] · [Wind] · [Ocean waves] · [Applause] · [Crowd noise] · [Record scratch] · [Silence]

### 5. Genre, Style & Era

**Maximal: 1–2 Genres + 1 Era**

**Era-Tags:** [Era: 1950s] … [Era: 2020s]

| Era | Key Elements |
|-----|-------------|
| 1920s–40s | Big band, jazz vocals, swing, brass |
| 1950s–60s | Rock'n'roll, psychedelic, surf guitar, girl groups |
| 1970s | Disco, funk bass, Moog synths, warm production |
| 1980s | Synthwave, gated reverb, digital synths, big drums |
| 1990s | Grunge, trip hop, breakbeat, alternative |
| 2000s | Auto-tune, crunk, emo, pop-punk, R&B |
| 2010s–20s | Trap 808s, future bass, hyperpop, lo-fi, bedroom pop |

**Era-Anker verbessern Genre-Treue dramatisch:** "1980s Synthwave" statt "Synthwave", "90s Boom Bap" statt "Hip Hop".

**Bewährte Fusion-Paare:** Rap + Trap · Lo-fi + Chill · Metal + Rock · Orchestral + Epic · Soul + R&B · Synthwave + Synth · House + Deep · Folk + Acoustic

**Genre-Fusion Brücke:** Explizite Verbindung formulieren — "jazz-influenced hyperpop" statt "jazz, hyperpop". Verhindert ein diffuses Mittelding.

**⚠️ Warnung:** Zu viele Genres machen den Stil diffus.

### 6. Arrangement & Produktion

**Mix (beschreibend):** lo-fi · gritty · clean · raw · lush · sparse · atmospheric · punchy · modern pop polish · wide stereo · tape-saturated · vinyl hiss · studio-polished · warm analog sound

**Audio-Effekte (keine Prozentwerte):** reverb-heavy · slap-back delay · distorted · sidechained

### 7. Sprache & mehrsprachige Produktion

Wichtigster Schutz vor Anglisierung: Lyrics direkt in der Zielsprache ins Lyrics-Feld schreiben. Optional im Style-Feld: `singing in German`; für Rap `German rap, rapping in German`.

**Anti-Drift:**
- Mehrdeutigkeit aus dem Lyric-Sheet entfernen
- Phonetische Schreibweise erzwingen, wenn Suno falsch ausspricht
- Eigennamen + Markenbegriffe in kurze Zeilen und in den Chorus
- **Aussprache VOR der Generierung fixen** — nach der Audio-Erzeugung ist sie permanent

**Sprachqualität:** Für v5.5 galten Englisch, Spanisch, Portugiesisch, Französisch, Japanisch, Koreanisch, Mandarin als am stärksten; Deutsch mit konsistenten Ausspracheregeln als meist gut funktionierend. **Für v6 nicht neu verifiziert.**

### 8. Ending Control

| Type | Lyrics Tag | Style Addition |
|------|-----------|----------------|
| Classic Fade | `[Outro: Slow Fade, Gradual Volume Decrease]` | "fade out ending" |
| Hard Stop | `[Outro: Sudden Stop, Final Chord Hit]` | "definitive ending, final chord" |
| Echo Decay | `[Outro: Reverb Decay, Echoing Into Distance]` | "reverb tail, atmospheric ending" |
| Live Applause | `[Outro: Final Note, Hold, Crowd Applause]` | "live ending, audience reaction" |
| Peaceful | `[Outro: Gentle Resolution, Peaceful]` | "soft ending, resolving" |
| Dramatic | `[Outro: Epic Final Chord, Sustained]` | "dramatic conclusion, held note" |

---

## Fortgeschrittene Techniken

### Pipe-Stacking Syntax

Mehrere Cues mit | in einer Klammer, wirkt als AND-Operator. Stacks KURZ halten — Elemente mit mehr als ~3–4 Wörtern werden ggf. ignoriert oder mitgesungen.

```
[core element | era/genre | tone/mix | quirk detail]
```

Regeln: Führe mit Kern-Element oder Section-Label · 4–6 Modifikatoren maximal · Era-Anker für Genre-Genauigkeit · Jede Sektion bekommt ihren eigenen Stack

```
[Verse | 60s jangly guitar | clean Fender tone | spring reverb]
[Guitar solo | 80s glam metal lead | heavy distortion | wide stereo]
[Drop | sidechained synth bass | white noise riser | sub drop]
[Chorus | anthemic | stacked harmonies | modern pop polish]
```

**⚠️ Emotion-Tags NICHT in Pipe-Stacks!** Die stehen allein auf eigener Zeile.

**⚠️ Lange Doppelpunkt-Listen vermeiden:** `[Verse: whispered vocals, acoustic guitar only, intimate, close mic, sparse]` ist riskant. Stattdessen das kurze Pipe-Format.

### Intentional Contrasts

| Kontrast | Elemente | Emotionales Ergebnis |
|----------|----------|---------------------|
| Soft/Hard | Whispered Vocals + Heavy Guitars | Verletzlichkeit auf Power |
| Organic/Digital | Acoustic Guitar + Glitch Drums | Mensch + Technologie |
| Intimate/Epic | Close Whispers + Stadium Drums | Bekenntnis auf Skala |
| Old/New | Vintage Sound + Modern Production | Zeitloses Gefühl |
| Simple/Complex | Single Instrument + Rich Harmonies | Tiefe aus Einfachheit |

Kontraste müssen **sektional** sein, nicht abstrakt.

### Callback Phrasing (Anti-Drift)

Problem: Sunos Aufmerksamkeit driftet über einen langen Song ab.
Lösung: EXAKT dieselben Schlüsselwörter aus der Eröffnung später wiederholen.

```
Genre: Dark hypnotic melodic trap.
Tempo: ~140 BPM.
Mood: melancholic, obsessive.
```
→ später:
```
[Bridge: strip back to hypnotic, melancholic textures]
```

**WICHTIG:** EXAKT dieselben Wörter.

Platzierung: Pre-Chorus (erinnern vor Energie-Shift) · Bridge (Reset nach Experimentieren) · Final Chorus (Rückkehr zur Original-Ästhetik) · Outro (Ending-Stimmung verstärken)

### Call-and-Response

```
[Verse | raspy male vocal]
I've been running from the truth
[instrumental break saxophone]
You know I can't escape
[instrumental break saxophone]
```

### Remix / Cover mit Audio Influence

| Influence | Resultat |
|-----------|---------|
| ≤50% | Stärkere Transformation, Melodie kann verloren gehen |
| ~55% | Bewahrt Struktur, fügt Charakter hinzu |
| ≥60% | Näher am Original, weniger Transformation |

Im Sample-Mode konkurrieren Style- und Audio-Influence — beide auf 100% = inkohärent. Sample primär → Audio 60–70% / Style 30–40%; Tags primär → umgekehrt.

**Venue Presets:**

Stadium: `Live recording, massive stadium, 50,000 people, arena rock sound, crowd energy, echo and space, raw performance, epic atmosphere`

Jazz Club: `Live recording, small jazz club, intimate setting, audience chatter between songs, vintage feel, smoky atmosphere, close mic, room ambience`

Underground: `Live recording, warehouse rave, raw energy, lo-fi recording quality, underground electronic, crowd movement, bass-heavy room sound`

### Ultimate Success Formula

```
GENRE + DOMINANT MOOD + LEAD INSTRUMENT + VOCAL STYLE + ATMOSPHERE + PRODUCTION + BPM + UNIQUE ELEMENT
```

| Component | Weight |
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

## Best Practices

### Prioritäten
HÖCHSTE: Song-Struktur · SEHR HOCH: Vocals & Mood/Energie · MITTEL: Instrumente · NIEDRIG: SFX

### Die "Rule of 5"

Pro Tag-Bracket maximal 5 Elemente.

```
❌ Falsch (12 Tags):
[Chorus: Epic, Powerful, Dramatic, Intense, Soaring, Emotional, Triumphant, Anthemic, Grand, Explosive, Climactic, Overwhelming]

✅ Richtig (4 Tags):
[Chorus | Anthemic | Guitar-Driven | Explosive]
```

Mit Pipe-Separator bis zu 6–7 möglich, aber Qualität vor Quantität.

### Weitere Regeln
- **Ein Job pro Tag.** Keine widersprüchlichen Anweisungen in derselben Klammer.
- **Style Influence beachten.** Je höher, desto klarer und reduzierter die Lyrics; dann weniger Meta-Tags.
- **Systematisch testen.** Eine Variable pro Generation. Kurze 15–30s Test-Generationen zuerst (spart Credits). Funktionierende Prompts sofort als Preset speichern.
- **Wiederholungen:** Für gesungene Wiederholungen runde Klammern (oh yeah), nicht eckige.

### Genre-spezifische Gotchas
- "punk" erzeugt oft kürzere Songs → "post-hardcore" verwenden
- "progressive metalcore" triggert Power-Metal-Shredding → präziser formulieren
- Trap fügt oft automatisch Auto-Tune hinzu → "no autotune" als Exclude
- Gospel fügt fast automatisch Chor hinzu → "no choir"
- Künstlernamen werden teils gefiltert → durch Klangbeschreibung ersetzen
- Suno fügt eigene Dynamik hinzu → bei Bedarf "no lulls, full intensity"

---

## Advanced Options: Slider & Max Mode

### Weirdness

Die Oberfläche nennt nur "Safe ↔ Chaos". Folgende Prozentwerte sind community-erprobte Arbeitsbereiche, keine offiziellen Presets.

| Ziel | Weirdness |
|------|-----------|
| Covers/Tributes, max. Genre-Treue | 10–25% |
| Kommerzieller Pop | 20–40% |
| Standard / ausgewogen | ~50% |
| Creative Indie | 50–65% |
| Experimental | 65–80% |
| Glitch-Risiko | 80%+ |

### Style Influence
Niedrig (0–30%): lose Interpretation · Mittel (50–70%): ausgewogen · Hoch (70–100%): strikte Befolgung jedes Tags

### Variety (neu in v6, nur Browser)

Ersetzt NICHT Weirdness, sondern ist ein eigener gestufter Regler: **Off / Normal / Extra / High / Max**. Passt die Clip-Varianz an, indem Suno den Style-Prompt intern anpasst.

- **Auf „Off" setzen**, wenn du volle Kontrolle über deine eigenen Style-Tags behalten willst.
- Höhere Stufen für mehr Unterschied zwischen den beiden generierten Clips.

### Max Mode (neu in v6, echter UI-Toggle, nur Browser)

Schalter pro Generierung, wenn Suno mehr Rechenaufwand in Präzision investieren soll. Kostet mehr Credits.

**Empfohlen für:** Songs länger als 2 Minuten · Covers nah am Original · Style-Transfer · konsistente Vocals/Style über den ganzen Track

**⚠️ Nur über den Schalter** — kein Text-Tag. `[Is_MAX_MODE: MAX]` hat keine Wirkung.

### Empfohlene Kombinationen

| Ziel | Weirdness | Style Influence | Variety | Max Mode |
|------|-----------|----------------|---------|----------|
| Authentische Genre-Rekonstruktion | 20–35% | 80–100% | Off | An |
| Balancierte kreative Fusion | 45–55% | 65–85% | Normal | Aus |
| Wild experimentell | 65%+ | 40–60% | Extra/High | Aus |
| Originaltreuer Cover | niedrig | hoch | Off | An |
| Longform-Song (>2 Min) | je nach Ziel | je nach Ziel | je nach Ziel | An |

---

## Custom Models (Beta)

Eigenes Modell auf Basis eigener Uploads. **Beta**, **100 Credits**, **nur Browser**. Modell-Dropdown → „Create Custom Model (Beta)".

- Eigene Modelle erscheinen unter „My Models"
- Erfasst Genre-Tendenzen, Arrangement, Produktionsästhetik — memoriert keine konkreten Melodien/Lyrics
- Ideal für Album-/Serien-Konsistenz
- Mindestanzahl Trainings-Tracks für v6 nicht verifiziert (v5.5: min. 6 Tracks, max. 3 Modelle)

---

## Personalize (My Taste)

On/Off, **nur Browser**. Legt einen persönlichen Geschmack fest, der für alle Songs gilt, bei denen der Schalter aktiv ist.

**Empfehlung:** Für gezielte, vom eigenen Geschmacksprofil unabhängige Prompts (Auftragsarbeiten, bewusst untypische Genres) ausschalten.

---

## Voices — Status für v6 nicht verifiziert

Das Voice-Cloning-Feature existierte seit v5.5. **Ob und in welcher Form es in v6 fortbesteht, wurde nicht überprüft.** Vor Nutzung in der Oberfläche nachsehen, ob ein „Voices"-Menüpunkt weiterhin vorhanden ist.

> **App-Bezug:** `suno.tsx` hat weiterhin einen „Voices"-Toggle (entfernt Gender-Tags aus Style und Lyrics). Falls das Feature in v6 weggefallen ist, wäre dieser Toggle totes Gewicht — vor dem Entfernen aber verifizieren.

---

## Suno Studio & Stem-Separation — für v6 nicht neu verifiziert

Zum Zeitpunkt der letzten Prüfung (v5.5-Ära) bestand Suno Studio (Premier-exklusive DAW mit Multitrack-Timeline, Remove FX, Warp Markers, MIDI-Export) sowie ein dreistufiges Stem-System (Split from Mix / Auto Split mit 12 Kategorien / Advanced Split mit ~100 Instrumenten). **Für v6 nicht erneut überprüft.**

---

## ⚠️ Widerlegte Mythen (NICHT verwenden)

| Mythos | Realität |
|--------|----------|
| `[Is_MAX_MODE: MAX]`, `[QUALITY: MAX]`, `[REALISM: MAX]` als Text-Tag | Hoax. Es gibt **seit v6 einen echten Max Mode**, aber ausschließlich als UI-Toggle — niemals als Text. Der Klammer-Tag bleibt wirkungslos und kann mitgesungen werden. |
| `///*****///` am Lyrics-Anfang | Teil des alten MAX-MODE-Text-Hoax. Ohne Wirkung. |
| `[Reverb: 30%]`, `[Bass: 80%]`, `[Stereo Width: Wide]` | Prozent-/Parameter-Werte werden ignoriert. Stattdessen beschreibend: "reverb-heavy", "deep bass". |
| `[START_ON: "..."]` | Nicht dokumentiert, nicht verifiziert. Intro weglassen oder wegschneiden. |
| `[Textual Particularity]` | Nicht verifiziert. Aussprache über Zielsprache + Phonetik steuern. |
| `[Persona: X]` als Lyrics-Tag | Personas/Voices sind ein UI-Feature, kein Tag. |
| `[Clean Lyrics]` / `[Explicit]` als Filter-Override | Steuert den Inhaltsfilter nicht. |

**Merksatz:** Wenn ein Tag wie ein Mischpult-Regler oder Schalter aussieht (`[X: Wert]`, `[X: MAX]`), ist er als TEXT mit hoher Wahrscheinlichkeit ein Placebo — die echte Entsprechung ist fast immer ein UI-Element.

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
```

---

## Checkliste vor der Ausgabe

- [ ] Richtiger Modus: **Advanced** (nicht Simple oder Sounds)
- [ ] Passendes Modell: v6 / v6-wild / v6-mini
- [ ] Song-Struktur klar mit Tags markiert (jede Sektion mindestens ein Tag)
- [ ] Vocal-Gender-Feld gesetzt; bei Duetten Text-Tags pro Sektion
- [ ] Mood/Energy festgelegt
- [ ] BPM als spezifischer Wert im Style-Feld
- [ ] Key/Tonart im Style-Feld
- [ ] Maximal 1–2 Genres, 1 Era
- [ ] Maximal 3–4 benannte Instrumente, Tag-Sweet-Spot 6–8
- [ ] Keine Meta-Tags mitten im Text
- [ ] Style-Description formatiert (genre/instruments/style tags/recording)
- [ ] KEINE Parameter-/MAX-MODE-Text-Tags — Max Mode nur über UI-Toggle
- [ ] Beschreibende Wörter statt Parameter-Syntax
- [ ] Negative Prompts wo nötig (max 1–2 im Style, mehr im Exclude-Feld)
- [ ] Duration bewusst gesetzt — Custom nur Browser
- [ ] Variety bewusst gesetzt (Off für volle Kontrolle) — nur Browser
- [ ] Max Mode bewusst ein/aus — nur Browser
- [ ] Weirdness realistisch (~35–55% für die meisten Songs)
- [ ] Alle Abschnitte in separaten Codeblöcken
- [ ] Maximal 5 Tags pro Bracket (Rule of 5), max 6–7 mit Pipe
- [ ] Callback-Phrasing bei längeren Songs
- [ ] Ending-Control spezifiziert
- [ ] Emotion-Tags auf eigener Zeile (nicht in Pipe-Stacks)
- [ ] ( ) nur für gesungene Background-Vocals, nie für Anweisungen
- [ ] ALL CAPS max 1–3 Wörter pro Sektion
- [ ] Bei nicht-englischen Songs: Lyrics in Zielsprache, Aussprache vor Generierung geprüft
- [ ] Bei App-Nutzung: geprüft, ob Duration/Variety/Max Mode/Custom Model/Personalize verfügbar sind
