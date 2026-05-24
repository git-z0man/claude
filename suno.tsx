import { useState, useEffect, useMemo, useRef } from "react";

// ── Prompts ───────────────────────────────────────────────────────────────────

var SYSTEM_PROMPT = `You are a professional SUNO v5.5 songwriter. Output exactly 4 code blocks.

CORE RULES:
- Structure tags on own lines only, NEVER inline in lyrics.
- Style field: HARD LIMIT 1000 chars. No artist names. Sonic descriptors only.
- Rule of 5: max 5 elements per tag bracket. With pipe separator: max 6-7.
- RHYME: Every verse/chorus/bridge needs clear AABB or ABAB scheme.
- Non-English: add [Textual Particularity] CRITICAL: Maintain pronunciation.
- CRITICAL: Write ALL lyrics in the Song language specified. Never default to German or any other language.
- BPM and Key go in Style field ONLY.
- Front-load Style field: most important genre and mood in first 20-30 words.

v5.5 PRECISION RULES:
- Use SPECIFIC descriptors. v5.5 responds to nuance. 5-7 specific tags.
- Emotion tags MUST be on their OWN line. NEVER stack in pipes.
- Parentheses ( ) = background vocal layer. NEVER use for instructions.
- Square brackets [ ] = structure/production cues, not sung.
- ALL CAPS: max 1-3 words per section. Never overuse.

INSTRUMENTAL MODE (when requested):
- Style: include no vocals, no singing, no humming, no choir, no voice
- Lyrics: use only [Instrumental] tags, leave text empty

MAX MODE (when enabled):
- Lyrics block FIRST line must be: ///*****///
- Style block LAST line must be: [Is_MAX_MODE: MAX](MAX) [QUALITY: MAX](MAX) [REALISM: MAX](MAX) [REAL_INSTRUMENTS: MAX](MAX)

AUTO VALUES (when input contains "Weirdness: AUTO" or "Style Influence: AUTO"):
- Weirdness: 15-30 Conventional, 30-45 Twist, AVOID 45-55, 58-65 Creative, 65-78 Unusual, 80-95 Experimental.
- Style Influence: 45-60 Vague input, 65-75 Clear, 78-90 Specific.
- Pick based on genres, mood and inputs. Output the chosen integer in # 3. ADVANCED OPTIONS.

STYLE FORMAT:
genre: ...
instruments: ...
style tags: ...
recording: ...
[negative prompts at END if needed]
[MAX MODE line if enabled]

NEGATIVE PROMPTING:
- Place no [element] at the END of style tags (max 1-2 in style field)

ENDING CONTROL:
- Fade: [Outro: Slow Fade, Gradual Volume Decrease] plus fade out ending
- Hard Stop: [Outro: Sudden Stop, Final Chord Hit] plus definitive ending
- Echo: [Outro: Reverb Decay, Echoing Into Distance] plus reverb tail ending

CALLBACK ANTI-DRIFT: Repeat EXACT keywords from Style in Bridge/Final Chorus.

PIPE-STACKING examples:
[Chorus | anthemic | stacked harmonies | modern pop polish]
[Drop | sidechained synth bass | layered riser | sub drop impact]

GLOSSARY: Adagio(66-76) Andante(76-108) Allegro(120-168) Presto(168-200) Rubato
Crescendo Decrescendo Staccato Legato Vibrato Tremolo Syncopation Polyrhythm
Falsetto Belt Melisma Crooning Arpeggio Counterpoint Ostinato Sparse Dense

OUTPUT format with 4 code blocks:
# 1. LYRICS
\`\`\`
[structure + lyrics]
[Outro: ...]
[End]
\`\`\`
# 2. STYLE
\`\`\`
genre: ...
instruments: ...
style tags: ...
recording: ...
\`\`\`
# 3. ADVANCED OPTIONS
\`\`\`
Weirdness: X%
Style Influence: X%
\`\`\`
# 4. TITLE
\`\`\`
Songname
\`\`\``;

var ANALYZE_PROMPT = `Analyze the artist/song. Return ONLY valid JSON, no text, no backticks.
{"artist":"","genres":[],"moods":[],"energy":"Medium","tempoTerm":"","bpmMin":0,"bpmMax":0,"vocalType":"","vocalTone":"","dynamics":[],"key":"","era":"","lyricThemes":[],"lyricContent":"","structure":[],"weirdness":60,"styleInfluence":70,"description":""}
genres:1-3. moods:2-3. energy:Low/Medium/High. tempoTerm:Adagio/Andante/Allegro/Presto/Rubato.
vocalType:Male Vocal/Female Vocal/Duet/Choir/Falsetto/Belt/Melisma/Crooning/Rap.
vocalTone:Raspy/Soft/Powerful/Smooth/Deep/High/Breathy/Melismatic. dynamics:0-2. key:Major/Minor.
era:1950s-2020s. lyricThemes:1-2. structure:array. weirdness:0-100. styleInfluence:40-95. description:1 sentence.`;

var CREATIVE_PROMPT = `You are a creative music director. Return ONLY valid JSON, no text, no backticks.
{"genres":[],"moods":[],"energy":"Medium","tempoTerm":"","bpmMin":0,"bpmMax":0,"vocalType":"","vocalTone":"","dynamics":[],"key":"","era":"","lang":"","lyricThemes":[],"lyricContent":"","structure":[],"artists":[],"weirdness":0,"styleInfluence":0,"description":""}
genres:1-3. moods:2-3. energy:Low/Medium/High. lang: infer from language.
lyricContent:2-3 sentence story. structure:fitting array.
WEIRDNESS: Conventional=15-30, Twist=30-45, AVOID 45-55, Creative=58-65, Unusual=65-78, Experimental=80-95.
STYLE INFLUENCE: Vague=45-60, Clear=65-75, Specific=78-90. description:1 sentence.`;

// ── Data ──────────────────────────────────────────────────────────────────────

var PRESET_ARTISTS = [
  "Billie Eilish","Bruno Mars","Lady Gaga","Taylor Swift","HUNTR/X","RAYE","Teddy Swims",
  "Adele","Rihanna","Maroon 5","Coldplay","Billy Joel","George Michael","Gloria Estefan",
  "Whitney Houston","Randy Crawford","Bobby Womack","Jamiroquai","Nancy Sinatra","Sting",
  "Linkin Park","Eric Clapton","Fleetwood Mac",
  "Glockenbach","Ofenbach","Daft Punk","Kygo","Anyma","Tiesto","Darude","Faithless","Gigi D'Agostino",
  "Moloko","Robyn","Leony",
  "Giorgio Moroder","Kraftwerk","Jean-Michel Jarre","Vangelis","Harold Faltermeyer",
  "The Midnight","Timecop1983","FM-84","Gunship","Kavinsky","Quixotic"
];
var ARTIST_GROUPS = [
  {label:"Pop / Singer-Songwriter", artists:[
    "Billie Eilish","Bruno Mars","Lady Gaga","Taylor Swift",
    "HUNTR/X","RAYE","Teddy Swims","Adele","Rihanna",
    "Maroon 5","Coldplay","Billy Joel","George Michael","Gloria Estefan"
  ]},
  {label:"Soul / R&B / Funk", artists:[
    "Whitney Houston","Randy Crawford","Bobby Womack","Jamiroquai",
    "Nancy Sinatra","Sting"
  ]},
  {label:"Rock / Alternative", artists:[
    "Linkin Park","Eric Clapton","Fleetwood Mac"
  ]},
  {label:"Electronic / Dance", artists:[
    "Glockenbach","Ofenbach","Daft Punk","Kygo",
    "Anyma","Tiesto","Darude","Faithless","Gigi D'Agostino",
    "Moloko","Robyn","Leony"
  ]},
  {label:"80s Synth", artists:[
    "Giorgio Moroder","Kraftwerk","Jean-Michel Jarre","Vangelis","Harold Faltermeyer"
  ]},
  {label:"Retrowave / Synthwave", artists:[
    "The Midnight","Timecop1983","FM-84","Gunship","Kavinsky","Quixotic"
  ]},
];
var GENRE_GROUPS = [
  {label:"Pop / Mainstream", genres:[
    "Pop","Dance Pop","Art Pop","Ballad","Indie Pop"
  ]},
  {label:"Hip Hop / Urban", genres:[
    "Hip Hop","Trap","R&B","Soul","Funk"
  ]},
  {label:"Rock / Alternative", genres:[
    "Rock","Indie Rock","Shoegaze","Alternative","New Wave",
    "Post-Punk","Darkwave","Gothic Rock","Industrial Rock","Cold Wave"
  ]},
  {label:"Electronic / Dance", genres:[
    "Electronic","Experimental Electronic","EDM","House",
    "Deep House","French House","UK House","Tropical House",
    "Nu-Disco","Techno","Drum & Bass","UK Garage","2-Step"
  ]},
  {label:"80s", genres:[
    "Neue Deutsche Welle","Synth-Pop","Electro-Pop","Italo Disco",
    "Euro Disco","Hi-NRG","Power Pop","Glam Rock",
    "Hair Metal","Arena Rock","Soft Rock","Adult Contemporary"
  ]},
  {label:"Synthwave / Retrowave", genres:[
    "Synthwave","Retrowave","Outrun","Darksynth",
    "Cyberpunk","Vaporwave","Nu-Italo"
  ]},
  {label:"Folk / Country", genres:[
    "Folk","Indie Folk","Country","Americana"
  ]},
  {label:"Jazz / Blues / World", genres:[
    "Jazz","Blues","Bossa Nova","Flamenco","Afrobeat","Reggae","Classical"
  ]},
  {label:"Live / Performance", genres:[
    "Live Rock","Live Jazz","Live Blues","Acoustic Live",
    "Singer-Songwriter","Spoken Word","Gospel","Worship",
    "Big Band","Swing","Cabaret","Musical Theatre"
  ]},
  {label:"Chill / Atmospheric", genres:[
    "Ambient","Lo-Fi","Chillout"
  ]},
];
var GENRES = GENRE_GROUPS.flatMap(function(g) { return g.genres; });

var MOODS = [
  "Melancholic","Dark","Mysterious","Dreamy","Happy","Joyful",
  "Calm","Peaceful","Romantic","Aggressive","Epic","Cinematic",
  "Nostalgic","Euphoric","Intense","Haunting"
];
var TEMPO_TERMS = [
  {label:"Adagio", bpmLo:66,  bpmHi:76,  de:"Langsam",        en:"Slow, relaxed"},
  {label:"Andante",bpmLo:76,  bpmHi:108, de:"Mäßig",          en:"Moderate walking pace"},
  {label:"Allegro",bpmLo:120, bpmHi:168, de:"Schnell",        en:"Fast, lively"},
  {label:"Presto", bpmLo:168, bpmHi:200, de:"Sehr schnell",   en:"Very fast"},
  {label:"Rubato", bpmLo:0,   bpmHi:0,   de:"Flexibles Tempo",en:"Flexible tempo"},
];
var VOCAL_TYPES = [
  "Male Vocal","Female Vocal","Duet","Choir","Falsetto","Belt",
  "Melisma","Crooning","A Cappella","Spoken Word","Rap","Whispered","Scat","No Vocals"
];
var VOCAL_TONES = [
  "Raspy","Soft","Powerful","Smooth","Deep","High","Breathy","Melismatic"
];
var DYNAMICS = [
  "Crescendo","Decrescendo","Staccato","Legato","Vibrato","Tremolo",
  "Syncopation","Polyrhythm","Call and Response","Four on the Floor",
  "Half-Time","Double-Time","Shuffle","Triplet Feel","Breakbeat","Laid-back Groove"
];
var PROD_FX = [
  "Reverb","Delay/Echo","Compression","Distortion","Filter","Panning",
  "Sidechain","Sampling","Loop","Layering","Vinyl Crackle","Tape Saturation",
  "Fade In","Fade Out"
];
var ERAS = ["1950s","1960s","1970s","1980s","1990s","2000s","2010s","2020s"];
var LANGUAGES = [
  "English","German","French","Spanish","Italian","Japanese","Portuguese","Korean"
];
var THEMES_EN = [
  "Love","Loss","Anger","Joy","Longing","Hope",
  "Loneliness","Departure","Nostalgia","Freedom","Pain","Euphoria"
];
var THEMES_DE = [
  "Liebe","Verlust","Wut","Freude","Sehnsucht","Hoffnung",
  "Einsamkeit","Aufbruch","Nostalgie","Freiheit","Schmerz","Euphorie"
];
var DEF_STRUCT = [
  "Intro","Verse 1","Pre-Chorus","Chorus","Verse 2",
  "Pre-Chorus","Chorus","Bridge","Final Chorus","Outro"
];
var STRUCT_OPTS = [
  "Intro","Instrumental Intro","Verse 1","Verse 2","Verse 3",
  "Pre-Chorus","Chorus","Post-Chorus","Bridge","Emotional Bridge",
  "Final Chorus","Final Chorus Lift","Guitar Solo","Piano Solo",
  "Breakdown","Build-Up","Interlude","Hook","Refrain","Coda","Outro","Fade Out"
];
var BPM_GUIDE = {
  "Pop":"100-130","Rock":"110-145","Electronic":"118-140",
  "Hip Hop":"60-100","Trap":"60-90","R&B":"60-85","Jazz":"70-140",
  "Ambient":"60-80","Techno":"125-140","House":"118-135",
  "Folk":"80-120","Metal":"120-180","Reggae":"60-90",
  "Drum & Bass":"160-180","Funk":"90-115"
};
var W_ZONES = [
  {min:0,  max:30,  label:"Genre-True",      labelDe:"Genre-Treue",      cls:"bg-blue-500"},
  {min:30, max:45,  label:"Slight Variation", labelDe:"Leichte Variation",cls:"bg-cyan-500"},
  {min:45, max:55,  label:"Generic",          labelDe:"Generisch",        cls:"bg-red-500"},
  {min:55, max:70,  label:"Creative",         labelDe:"Kreativ",          cls:"bg-yellow-500"},
  {min:70, max:90,  label:"Experimental",     labelDe:"Experimentell",    cls:"bg-orange-500"},
  {min:90, max:101, label:"Chaos",            labelDe:"Chaos",            cls:"bg-rose-600"},
];

var BUILTIN_PRESETS = [
  {
    name:"Synthwave Night",
    settings:{
      genres:["Synthwave","Retrowave"],
      moods:["Dreamy","Nostalgic"],
      energy:"Medium", tempoTerm:"Andante", bpmMin:"90", bpmMax:"110",
      vocalTone:"Smooth", lang:"English",
      dynamics:["Legato","Syncopation"],
      prodFx:["Reverb","Delay/Echo","Sidechain"]
    }
  },
  {
    name:"Pop Ballad",
    settings:{
      genres:["Pop","Ballad"],
      moods:["Romantic","Melancholic"],
      energy:"Medium", tempoTerm:"Andante", bpmMin:"70", bpmMax:"90",
      vocalTone:"Powerful", lang:"English",
      dynamics:["Legato","Crescendo","Vibrato"]
    }
  },
  {
    name:"Hip Hop / Trap",
    settings:{
      genres:["Hip Hop","Trap"],
      moods:["Aggressive","Dark"],
      energy:"High", tempoTerm:"Allegro", bpmMin:"75", bpmMax:"90",
      vocalType:"Rap", lang:"English",
      dynamics:["Triplet Feel","Half-Time"],
      prodFx:["Compression","Sidechain"]
    }
  },
  {
    name:"Cinematic",
    settings:{
      genres:["Classical","Ambient"],
      moods:["Epic","Cinematic","Mysterious"],
      energy:"Medium", tempoTerm:"Andante", bpmMin:"60", bpmMax:"100",
      vocalType:"No Vocals", instrumental:true, lang:"English",
      dynamics:["Crescendo","Decrescendo","Legato"]
    }
  },
  {
    name:"Indie Folk",
    settings:{
      genres:["Folk","Indie Folk","Singer-Songwriter"],
      moods:["Calm","Nostalgic","Peaceful"],
      energy:"Low", tempoTerm:"Andante", bpmMin:"80", bpmMax:"100",
      vocalTone:"Soft", lang:"English",
      dynamics:["Legato"], prodFx:["Reverb"]
    }
  },
  {
    name:"Deep House",
    settings:{
      genres:["Deep House","House"],
      moods:["Euphoric","Dreamy"],
      energy:"High", tempoTerm:"Allegro", bpmMin:"120", bpmMax:"128",
      lang:"English",
      dynamics:["Four on the Floor","Syncopation"],
      prodFx:["Sidechain","Reverb","Filter"]
    }
  }
];

var ACCENTS = [
  {label:"London / Cockney",
   value:"London Cockney British English, glottal stops, dropped H"},
  {label:"London / RP",
   value:"Received Pronunciation British English, crisp consonants"},
  {label:"Manchester",
   value:"Manchester Northern English accent, flat vowels"},
  {label:"Scottish",
   value:"Scottish accent, rolled R, distinctive vowels"},
  {label:"Irish",
   value:"Irish accent, soft consonants, melodic intonation"},
  {label:"Australian",
   value:"Australian accent, rising intonation, broad vowels"},
  {label:"New York",
   value:"New York accent, non-rhotic, broad A, NYC cadence"},
  {label:"Southern US",
   value:"Southern US accent, slow drawl, elongated vowels"},
  {label:"African American",
   value:"AAVE cadence, rhythmic delivery, soul and R&B phrasing"},
  {label:"Jamaican",
   value:"Jamaican patois accent, Caribbean rhythm, reggae cadence"},
  {label:"French",
   value:"French accent in English, nasal tones, French phonetics"},
  {label:"German",
   value:"German accent in English, precise consonants, Germanic rhythm"},
];

var DYNAMICS_INFO = {
  "Crescendo":         {en:"Gradually increasing volume",        de:"Steigende Lautstärke"},
  "Decrescendo":       {en:"Gradually decreasing volume",        de:"Sinkende Lautstärke"},
  "Staccato":          {en:"Short detached notes, punchy",       de:"Kurze abgehackte Noten"},
  "Legato":            {en:"Smooth connected notes, flowing",    de:"Fließende verbundene Noten"},
  "Vibrato":           {en:"Oscillating pitch on held notes",    de:"Tonhöhenschwingung"},
  "Tremolo":           {en:"Rapid note repetition, shimmering",  de:"Schnelle Notenwiederholung"},
  "Syncopation":       {en:"Off-beat accents, creates groove",   de:"Off-Beat Betonungen"},
  "Polyrhythm":        {en:"Multiple rhythms simultaneously",    de:"Mehrere Rhythmen gleichzeitig"},
  "Call and Response": {en:"Vocal or instrument Q and A",        de:"Gesangs oder Instrumentendialog"},
  "Four on the Floor": {en:"Kick on every beat, house pulse",    de:"Kick auf jedem Beat"},
  "Half-Time":         {en:"Drums feel twice as slow, heavy",    de:"Schlagzeug wirkt halb so schnell"},
  "Double-Time":       {en:"Drums feel twice as fast, urgent",   de:"Schlagzeug wirkt doppelt so schnell"},
  "Shuffle":           {en:"Swung 8ths, bluesy rolling groove",  de:"Swung Achtelnoten Blues Groove"},
  "Triplet Feel":      {en:"Groups of 3, swinging jazzy feel",   de:"Dreier Unterteilung swingend"},
  "Breakbeat":         {en:"Sampled drum breaks, hip hop",       de:"Gesamplete Drum Breaks"},
  "Laid-back Groove":  {en:"Behind the beat, relaxed soulful",   de:"Hinter dem Beat entspannt"},
};
var PROD_FX_INFO = {
  "Reverb":          {en:"Adds room ambience and space",    de:"Raumklang und Hall"},
  "Delay/Echo":      {en:"Repeating echoes, depth",         de:"Wiederholende Echos"},
  "Compression":     {en:"Controls dynamics, punchy",       de:"Dynamik kontrollieren"},
  "Distortion":      {en:"Grit and harmonic saturation",    de:"Verzerrung und Sättigung"},
  "Filter":          {en:"Cuts or boosts frequencies",      de:"Frequenzen anpassen"},
  "Panning":         {en:"Stereo left right placement",     de:"Stereo Positionierung"},
  "Sidechain":       {en:"Pumping effect, classic house",   de:"Pumping Effekt für House"},
  "Sampling":        {en:"Recorded snippets as elements",   de:"Aufnahmen als Musikelemente"},
  "Loop":            {en:"Repeating section, hypnotic",     de:"Wiederholende Sektion"},
  "Layering":        {en:"Multiple sounds stacked",         de:"Mehrere Klänge übereinander"},
  "Vinyl Crackle":   {en:"Analog noise, vintage lo-fi",     de:"Analoges Rauschen Vintage"},
  "Tape Saturation": {en:"Warm harmonic distortion",        de:"Analoge Wärme & Sättigung"},
  "Fade In":         {en:"Starts silent, grows louder",     de:"Startet leise wird lauter"},
  "Fade Out":        {en:"Gets quieter at the end",         de:"Wird am Ende leiser"},
};

var STORAGE_KEY = "sunoSongCreator_v1";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getWZone(v) {
  return W_ZONES.find(function(z) { return v >= z.min && v < z.max; }) || W_ZONES[5];
}
function getSLabel(v, en) {
  if (v < 55) return en ? "AI Freedom" : "KI-Freiheit";
  if (v < 70) return en ? "Balanced" : "Ausgewogen";
  if (v < 85) return en ? "Style-True" : "Stiltreu";
  return en ? "Very Strict" : "Sehr strikt";
}
function truncateStyle(s) {
  if (!s || s.length <= 1000) return s;
  var cut = s.substring(0, 1000);
  var lastComma = cut.lastIndexOf(",");
  var lastSpace = cut.lastIndexOf(" ");
  var pos = Math.max(lastComma, lastSpace);
  if (pos < 1) pos = 1000;
  return cut.substring(0, pos).trim();
}
function parseOutput(raw) {
  var r = {lyrics:"", style:"", advanced:"", title:""};
  function exB(sec) {
    if (!sec) return "";
    var m = sec.match(/```[\w]*\n?([\s\S]*?)```/);
    return m ? m[1].trim() : "";
  }
  r.lyrics   = exB((raw.match(/# 1\. LYRICS[\s\S]*?(?=# 2\.|$)/i)   || [])[0]);
  r.style    = exB((raw.match(/# 2\. STYLE[\s\S]*?(?=# 3\.|$)/i)    || [])[0]);
  r.advanced = exB((raw.match(/# 3\. ADVANCED[\s\S]*?(?=# 4\.|$)/i) || [])[0]);
  r.title    = exB((raw.match(/# 4\.\s*(?:TITLE|TITEL)\b[\s\S]*?$/i) || [])[0]);
  r.style    = truncateStyle(r.style);
  return r;
}
function storageLoad() {
  try {
    var r = localStorage.getItem(STORAGE_KEY);
    return r ? JSON.parse(r) : null;
  } catch(e) { return null; }
}
function storageSave(obj) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch(e) {}
}

// ── Translations ──────────────────────────────────────────────────────────────

var T = {
  en: {
    appSubtitle:"Powered by Claude - SUNO v5.5 optimized",
    restart:"Restart", restartConfirm:"Reset everything?", yes:"Yes, reset", cancel:"Cancel",
    panelSettings:"Settings", panelResult:"Result",
    searchTitle:"Search & Analyze",
    searchDesc:"Artist or song - all fields filled automatically.",
    searchPlaceholder:"e.g. The Midnight, Daft Punk - Get Lucky...",
    analyzeBtn:"Analyze", analyzing:"Analyzing...",
    analyzedInfo:"Fields filled automatically.", analysisFailed:"Analysis failed",
    creativeTitle:"Creative Prompt",
    creativeDesc:"Describe your song idea freely - Claude sets all parameters.",
    creativePlaceholder:"e.g. A duet about first love, nostalgic 80s pop...",
    creativeBtn:"Let Claude be Creative!", creativeAnalyzing:"Interpreting...",
    creativeInterpretation:"Interpretation",
    creativeApplied:"All matching fields have been filled.",
    artistTitle:"Artist Reference",
    artistDesc:"Select, add or delete artists.",
    artistAdd:"Add new artist...", artistAnalyze:"Claude analyzes: ",
    genreTitle:"Genre", genreAdd:"Add custom genre...",
    genreTypical:"Typical for ", hiddenGenres:" hidden",
    moodTitle:"Mood", energyTempoTitle:"Energy & Tempo",
    tempoGlossary:"Tempo term (SUNO glossary):",
    minBpm:"Min BPM", maxBpm:"Max BPM",
    keyTitle:"Key", dynamicsTitle:"Dynamics & Rhythm",
    vocalsTitle:"Vocals", vocalToneLabel:"Vocal Tone:",
    productionTitle:"Production & Effects", eraLangTitle:"Era & Language",
    eraLabel:"Era", langLabel:"Song Language", modern:"Modern",
    structureTitle:"Song Structure", addSection:"Add",
    lyricThemesTitle:"Lyric Themes",
    lyricContentPlaceholder:"Describe content, story or message freely...",
    ownLyricsTitle:"Own Lyrics (optional)",
    ownLyricsPlaceholder:"Your finished lyrics - Claude will build them in...",
    titleTitle:"Song Title (optional)",
    titleDesc:"Leave empty - Claude generates a title automatically.",
    titlePlaceholder:"Own title or auto-generate...",
    descTitle:"Free Description", descPlaceholder:"More ideas, special requests...",
    advancedTitle:"Advanced Options", excludeLabel:"Exclude Style",
    excludePlaceholder:"e.g. heavy metal, distorted guitar, rap...",
    maxModeLabel:"MAX MODE",
    maxModeDesc:"Maximum quality & realism (best for acoustic/organic)",
    weirdnessLabel:"Weirdness", weirdnessLeft:"Genre-True",
    weirdnessAvoid:"45-55 avoid", weirdnessRight:"Experimental",
    styleInfluenceLabel:"Style Influence",
    styleLeft:"AI Freedom", styleRight:"Very Strict",
    generateBtn:"Generate Song Prompt", generating:"Generating...",
    readyTitle:"Ready to Generate",
    readyDesc:"Search an artist or song, choose settings and click Generate.",
    regenBtn:"Regenerate", optimizeBtn:"Optimize",
    regenBusy:"Generating...", optimizeBusy:"Optimizing...",
    tab1:"1 Lyrics", tab2:"2 Style", tab3:"3 Advanced / Title",
    copyAll:"Copy All", copied:"Copied!", copy:"Copy",
    lyricsTitle:"Lyrics", lyricsSubtitle:"Paste into SUNO Lyrics field",
    styleTitle:"Style", styleSubtitle:"Paste into SUNO Style field",
    advTitle:"Advanced Options", advSubtitle:"Recommended settings for SUNO",
    advWeirdDesc:"Creativity vs. genre accuracy",
    advStyleDesc:"Influence of the Style field",
    titleSectionTitle:"Title", titleSectionSubtitle:"For the SUNO song title",
    tooLong:"Too long - please shorten!", chars:"chars",
    exportImport:"Export / Import Settings",
    autoSaved:"Settings are saved automatically in the browser.",
    exportXml:"Export XML", importXml:"Import XML",
    importOk:"Settings imported!", copyXml:"Copy", openTab:"Open in Tab",
    copyAndSave:"Copy XML - paste into text editor - save as .xml",
    apiOk:"API connected", apiError:"API not reachable",
  },
  de: {
    appSubtitle:"Powered by Claude - SUNO v5.5 optimiert",
    restart:"Neustart", restartConfirm:"Alles zurücksetzen?",
    yes:"Ja, zurücksetzen", cancel:"Abbrechen",
    panelSettings:"Einstellungen", panelResult:"Ergebnis",
    searchTitle:"Suche & Analyse",
    searchDesc:"Künstler oder Songtitel - alle Felder automatisch befüllt.",
    searchPlaceholder:"z.B. The Midnight, Daft Punk - Get Lucky...",
    analyzeBtn:"Analyse", analyzing:"Analyse...",
    analyzedInfo:"Felder wurden automatisch befüllt.",
    analysisFailed:"Analyse fehlgeschlagen",
    creativeTitle:"Kreativer Prompt",
    creativeDesc:"Beschreibe deine Song-Idee frei - Claude setzt alle Parameter.",
    creativePlaceholder:"z.B. Ein Duett über die erste Liebe...",
    creativeBtn:"Claude kreativ werden lassen!", creativeAnalyzing:"Interpretiere...",
    creativeInterpretation:"Interpretation",
    creativeApplied:"Alle passenden Felder wurden befüllt.",
    artistTitle:"Künstler-Referenz",
    artistDesc:"Künstler auswählen, hinzufügen oder löschen.",
    artistAdd:"Neuen Künstler hinzufügen...", artistAnalyze:"Claude analysiert: ",
    genreTitle:"Genre", genreAdd:"Eigenes Genre hinzufügen...",
    genreTypical:"Typisch für ", hiddenGenres:" ausgeblendet",
    moodTitle:"Mood / Stimmung", energyTempoTitle:"Energie & Tempo",
    tempoGlossary:"Tempo-Begriff (SUNO-Glossar):",
    minBpm:"Min BPM", maxBpm:"Max BPM",
    keyTitle:"Tonart", dynamicsTitle:"Dynamik & Rhythmus",
    vocalsTitle:"Vocals", vocalToneLabel:"Vocal Ton:",
    productionTitle:"Produktion & Effekte", eraLangTitle:"Era & Sprache",
    eraLabel:"Era", langLabel:"Lied-Sprache", modern:"Modern",
    structureTitle:"Song-Struktur", addSection:"Add",
    lyricThemesTitle:"Liedtext-Themen",
    lyricContentPlaceholder:"Beschreibe Inhalt, Geschichte oder Botschaft frei...",
    ownLyricsTitle:"Eigene Liedtexte (optional)",
    ownLyricsPlaceholder:"Deine fertigen Lyrics - Claude baut sie in die Struktur ein...",
    titleTitle:"Song-Titel (optional)",
    titleDesc:"Leer lassen - Claude generiert automatisch einen Titel.",
    titlePlaceholder:"Eigenen Titel oder automatisch generieren...",
    descTitle:"Freie Beschreibung", descPlaceholder:"Weitere Ideen, besondere Wünsche...",
    advancedTitle:"Erweiterte Optionen", excludeLabel:"Style ausschließen",
    excludePlaceholder:"z.B. heavy metal, distorted guitar, rap...",
    maxModeLabel:"MAX MODE",
    maxModeDesc:"Maximale Qualität & Realismus (ideal für Akustik/Organisch)",
    weirdnessLabel:"Weirdness", weirdnessLeft:"Genre-Treue",
    weirdnessAvoid:"45-55 meiden", weirdnessRight:"Experimentell",
    styleInfluenceLabel:"Style Influence",
    styleLeft:"KI-Freiheit", styleRight:"Sehr strikt",
    generateBtn:"Song-Prompt generieren", generating:"Generiere...",
    readyTitle:"Bereit zur Generierung",
    readyDesc:"Suche einen Künstler oder Song, wähle Einstellungen und klicke Generieren.",
    regenBtn:"Neu generieren", optimizeBtn:"Optimieren",
    regenBusy:"Generiere...", optimizeBusy:"Optimiere...",
    tab1:"1 Lyrics", tab2:"2 Style", tab3:"3 Erweitert / Titel",
    copyAll:"Alle kopieren", copied:"Kopiert!", copy:"Kopieren",
    lyricsTitle:"Lyrics", lyricsSubtitle:"In das SUNO Lyrics-Feld einfügen",
    styleTitle:"Style", styleSubtitle:"In das SUNO Style-Feld einfügen",
    advTitle:"Erweiterte Optionen", advSubtitle:"Empfohlene Einstellungen für SUNO",
    advWeirdDesc:"Kreativität vs. Genre-Treue",
    advStyleDesc:"Einfluss des Style-Feldes",
    titleSectionTitle:"Titel", titleSectionSubtitle:"Für den SUNO Song-Titel",
    tooLong:"Zu lang - bitte kürzen!", chars:"Zeichen",
    exportImport:"Einstellungen Export / Import",
    autoSaved:"Einstellungen werden automatisch im Browser gespeichert.",
    exportXml:"XML exportieren", importXml:"XML importieren",
    importOk:"Einstellungen importiert!", copyXml:"Kopieren", openTab:"In Tab öffnen",
    copyAndSave:"XML kopieren - in Texteditor einfügen - als .xml speichern",
    apiOk:"API verbunden", apiError:"API nicht erreichbar",
  }
};

// ── Small Components ──────────────────────────────────────────────────────────

function TooltipBtn({label, active, onClick, tooltip, activeClass, inactiveClass}) {
  var [show, setShow] = useState(false);
  var [tipStyle, setTipStyle] = useState({left:"50%", transform:"translateX(-50%)"});
  var btnRef = useRef(null);
  var dismissRef = useRef(null);
  function computeTipPosition() {
    if (!btnRef.current) return {left:"50%", transform:"translateX(-50%)"};
    var rect = btnRef.current.getBoundingClientRect();
    var vw = window.innerWidth;
    var margin = 8;
    var maxTipHalf = Math.min(140, vw / 2 - margin);
    var centerX = rect.left + rect.width / 2;
    if (centerX - maxTipHalf < margin) {
      return {left: (margin - rect.left) + "px"};
    }
    if (centerX + maxTipHalf > vw - margin) {
      return {right: (margin - (vw - rect.right)) + "px", left:"auto"};
    }
    return {left:"50%", transform:"translateX(-50%)"};
  }
  function openTip() {
    setTipStyle(computeTipPosition());
    setShow(true);
    if (dismissRef.current) { clearTimeout(dismissRef.current); dismissRef.current = null; }
  }
  function closeTip() {
    setShow(false);
    if (dismissRef.current) { clearTimeout(dismissRef.current); dismissRef.current = null; }
  }
  function handleClick(e) {
    openTip();
    if (dismissRef.current) clearTimeout(dismissRef.current);
    dismissRef.current = setTimeout(function(){ setShow(false); dismissRef.current = null; }, 2500);
    if (onClick) onClick(e);
  }
  return (
    <div className="relative" onMouseEnter={openTip} onMouseLeave={closeTip}>
      <button ref={btnRef} onClick={handleClick}
        className={"px-2 py-1 rounded text-xs border transition-all "+(active?activeClass:inactiveClass)}>
        {label}
      </button>
      {show && tooltip && (
        <>
          <div className="absolute bottom-full mb-1.5 z-50 pointer-events-none" style={tipStyle}>
            <div className="bg-zinc-800 border border-zinc-600 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 shadow-xl"
              style={{maxWidth:"min(280px, calc(100vw - 16px))", whiteSpace:"normal"}}>
              {tooltip}
            </div>
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-50 pointer-events-none" style={{marginBottom:"0.3rem"}}>
            <div className="w-2 h-2 bg-zinc-800 border-r border-b border-zinc-600 rotate-45"/>
          </div>
        </>
      )}
    </div>
  );
}

function Toggle({value, onToggle, color}) {
  return (
    <button onClick={onToggle}
      className={"w-10 h-5 rounded-full transition-all relative "+(value?color:"bg-zinc-700")}>
      <span className={"absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all "+(value?"left-5":"left-0.5")}/>
    </button>
  );
}

function ClearBtn({onClick}) {
  var [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={function(){setHov(true);}}
      onMouseLeave={function(){setHov(false);}}
      style={{color: hov?"#f87171":"#52525b"}} className="transition-colors p-0.5">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
    </button>
  );
}
function SectionHeader({title, onClear}) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</h2>
      {onClear && <ClearBtn onClick={onClear}/>}
    </div>
  );
}
function Section({id, title, onClear, isOpen, onToggle, hasData, children}) {
  var effectiveOpen = hasData || isOpen;
  var canToggle = !hasData;
  return (
    <div id={id?"sec-"+id:undefined} style={{scrollMarginTop:"54px"}}>
      <div onClick={canToggle?onToggle:undefined}
        className={"flex items-center justify-between -mx-1 px-1 py-1 rounded select-none "+(canToggle?"cursor-pointer hover:bg-zinc-900/40":"cursor-default")}>
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          {hasData
            ? <span className="text-indigo-500 inline-block w-2 text-center" style={{fontSize:"10px"}}>●</span>
            : <span className="text-zinc-600 inline-block w-2 text-center" style={{fontSize:"9px"}}>{isOpen?"▼":"▶"}</span>}
          <span>{title}</span>
        </h2>
        {onClear && (
          <span onClick={function(e){e.stopPropagation();}}>
            <ClearBtn onClick={onClear}/>
          </span>
        )}
      </div>
      {effectiveOpen && <div className="mt-1.5">{children}</div>}
    </div>
  );
}
function CopyBtn({text, label, doneLabel}) {
  var [done, setDone] = useState(false);
  function doCopy() {
    var s = text||"";
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(s).then(function(){
        setDone(true); setTimeout(function(){setDone(false);},2000);
      }).catch(function(){fb(s);});
    } else { fb(s); }
  }
  function fb(s) {
    var ta = document.createElement("textarea");
    ta.value=s; ta.style.cssText="position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;";
    document.body.appendChild(ta); ta.focus(); ta.select(); ta.setSelectionRange(0,s.length);
    try{document.execCommand("copy");setDone(true);setTimeout(function(){setDone(false);},2000);}catch(e){}
    document.body.removeChild(ta);
  }
  return (
    <button onClick={doCopy}
      className={"px-3 py-1 rounded text-xs font-medium transition-all "+(done?"bg-green-600 text-white":"bg-zinc-700 text-zinc-300 hover:bg-zinc-600")}>
      {done?(doneLabel||"Copied!"):(label||"Copy")}
    </button>
  );
}
function ActionBar({onRegen, onOptimize, loadingRegen, loadingOptimize, t}) {
  var busy = loadingRegen||loadingOptimize;
  return (
    <div className="flex gap-2 mb-3">
      <button onClick={onRegen} disabled={busy}
        className={"flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all "+(
          loadingRegen?"bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed":
          busy?"bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed":
          "bg-zinc-800 border-zinc-600 text-zinc-300 hover:border-indigo-500 hover:text-indigo-300")}>
        {loadingRegen?<span className="w-3 h-3 border border-zinc-600 border-t-indigo-400 rounded-full animate-spin"/>:"🔄"}
        {loadingRegen?t.regenBusy:t.regenBtn}
      </button>
      <button onClick={onOptimize} disabled={busy}
        className={"flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all "+(
          loadingOptimize?"bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed":
          busy?"bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed":
          "bg-zinc-800 border-amber-800 text-amber-400 hover:border-amber-500 hover:text-amber-300")}>
        {loadingOptimize?<span className="w-3 h-3 border border-zinc-600 border-t-amber-400 rounded-full animate-spin"/>:"✨"}
        {loadingOptimize?t.optimizeBusy:t.optimizeBtn}
      </button>
    </div>
  );
}
function OutputSection({title, subtitle, icon, content, t}) {
  var [fs, setFs] = useState(13);
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div>
          <p className="text-sm font-semibold text-white">{icon} {title}</p>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2 py-1">
            <button onClick={function(){setFs(function(s){return Math.max(10,s-1);});}}
              className="text-zinc-400 hover:text-white w-5 h-5 flex items-center justify-center font-bold">-</button>
            <span className="text-xs text-zinc-500 w-8 text-center">{fs}px</span>
            <button onClick={function(){setFs(function(s){return Math.min(26,s+1);});}}
              className="text-zinc-400 hover:text-white w-5 h-5 flex items-center justify-center font-bold">+</button>
          </div>
          <CopyBtn text={content} label={t.copy} doneLabel={t.copied}/>
        </div>
      </div>
      <pre className="p-4 text-zinc-200 whitespace-pre-wrap leading-relaxed overflow-x-auto"
        style={{fontFamily:"monospace",fontSize:fs+"px"}}>
        {content||<span className="text-zinc-600 italic">No content generated</span>}
      </pre>
    </div>
  );
}
function AdvancedDisplay({content, t, isEn}) {
  content = content||"";
  var wm = content.match(/Weirdness[:\s]+(\d+)/i);
  var sm = content.match(/Style Influence[:\s]+(\d+)/i);
  var wVal = wm?Number(wm[1]):null;
  var sVal = sm?Number(sm[1]):null;
  var wZone = wVal!==null?getWZone(wVal):null;
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800">
        <p className="text-sm font-semibold text-white">{t.advTitle}</p>
        <p className="text-xs text-zinc-500">{t.advSubtitle}</p>
      </div>
      <div className="p-5 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-white">Weirdness</p>
              <p className="text-xs text-zinc-500">{t.advWeirdDesc}</p>
            </div>
            <div className="flex items-center gap-2">
              {wZone&&<span className={"text-xs px-2 py-0.5 rounded font-medium text-white "+wZone.cls}>{isEn?wZone.label:wZone.labelDe}</span>}
              <span className="text-2xl font-bold text-white">{wVal!==null?wVal+"%":"-"}</span>
            </div>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
            <div className={"h-3 rounded-full "+(wZone?wZone.cls:"bg-zinc-600")} style={{width:(wVal||0)+"%"}}/>
          </div>
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>0 {t.weirdnessLeft}</span>
            <span className="text-red-600">{t.weirdnessAvoid}</span>
            <span>100 {t.weirdnessRight}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-white">Style Influence</p>
              <p className="text-xs text-zinc-500">{t.advStyleDesc}</p>
            </div>
            <div className="flex items-center gap-2">
              {sVal!==null&&<span className="text-xs px-2 py-0.5 rounded font-medium text-white bg-purple-600">{getSLabel(sVal,isEn)}</span>}
              <span className="text-2xl font-bold text-white">{sVal!==null?sVal+"%":"-"}</span>
            </div>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
            <div className="h-3 rounded-full bg-purple-500" style={{width:(sVal||0)+"%"}}/>
          </div>
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>0 {t.styleLeft}</span>
            <span>100 {t.styleRight}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  var [uiLang, setUiLang] = useState(function(){
    return (navigator.language||"en").toLowerCase().startsWith("de")?"de":"en";
  });
  var [theme, setTheme] = useState(function(){
    try { return localStorage.getItem("sunoTheme") || "dark"; } catch(e) { return "dark"; }
  });
  useEffect(function(){
    try { localStorage.setItem("sunoTheme", theme); } catch(e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#09090b" : "#ffffff");
  }, [theme]);
  var DEFAULT_SECTIONS = {
    smartFill:true, presets:true, artists:true, genre:true, mood:true,
    energyTempo:true, vocals:true,
    key:false, dynamics:false, production:false, eraLang:false,
    structure:false, lyrics:false, advanced:false, exportImport:false
  };
  var [openSections, setOpenSections] = useState(function(){
    try {
      var stored = JSON.parse(localStorage.getItem("sunoSections") || "{}");
      return Object.assign({}, DEFAULT_SECTIONS, stored);
    } catch(e) { return Object.assign({}, DEFAULT_SECTIONS); }
  });
  useEffect(function(){
    try { localStorage.setItem("sunoSections", JSON.stringify(openSections)); } catch(e) {}
  }, [openSections]);
  function toggleSec(id) {
    setOpenSections(function(prev){
      var next = Object.assign({}, prev);
      next[id] = !prev[id];
      return next;
    });
  }
  function navigateTo(id) {
    setOpenSections(function(prev){
      var next = Object.assign({}, prev);
      next[id] = true;
      return next;
    });
    setTimeout(function(){
      var el = document.getElementById("sec-"+id);
      if (el) el.scrollIntoView({behavior:"smooth", block:"start"});
    }, 60);
  }
  var [undoAction, setUndoAction] = useState(null);
  var undoTimeoutRef = useRef(null);
  function clearWithUndo(label, snapshotAndClear) {
    var restore = snapshotAndClear();
    setUndoAction({label: label, restore: restore});
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = setTimeout(function(){
      setUndoAction(null);
      undoTimeoutRef.current = null;
    }, 5000);
  }
  function triggerUndo() {
    if (undoAction && undoAction.restore) undoAction.restore();
    setUndoAction(null);
    if (undoTimeoutRef.current) { clearTimeout(undoTimeoutRef.current); undoTimeoutRef.current = null; }
  }
  var isEn = uiLang==="en";
  var t = useMemo(function(){ return T[uiLang]; }, [uiLang]);
  var THEMES = useMemo(function(){ return isEn ? THEMES_EN : THEMES_DE; }, [isEn]);

  var [genres,           setGenres]           = useState([]);
  var [extraGenres,      setExtraGenres]      = useState([]);
  var [hiddenGenres,     setHiddenGenres]     = useState([]);
  var [showHidden,       setShowHidden]       = useState(false);
  var [customGenre,      setCustomGenre]      = useState("");
  var [availArtists,     setAvailArtists]     = useState(PRESET_ARTISTS.slice());
  var [artists,          setArtists]          = useState([]);
  var [customArtist,     setCustomArtist]     = useState("");
  var [moods,            setMoods]            = useState([]);
  var [energy,           setEnergy]           = useState("Medium");
  var [tempoTerm,        setTempoTerm]        = useState("");
  var [bpmMin,           setBpmMin]           = useState("");
  var [bpmMax,           setBpmMax]           = useState("");
  var [vocalType,        setVocalType]        = useState("");
  var [vocalTone,        setVocalTone]        = useState("");
  var [accent,           setAccent]           = useState("");
  var [dynamics,         setDynamics]         = useState([]);
  var [songKey,          setSongKey]          = useState("");
  var [prodFx,           setProdFx]           = useState([]);
  var [era,              setEra]              = useState("");
  var [lang,             setLang]             = useState("English");
  var [structure,        setStructure]        = useState(DEF_STRUCT.slice());
  var [addSec,           setAddSec]           = useState("Verse 1");
  var [lyricThemes,      setLyricThemes]      = useState([]);
  var [lyricContent,     setLyricContent]     = useState("");
  var [ownLyrics,        setOwnLyrics]        = useState("");
  var [description,      setDescription]      = useState("");
  var [titleSugg,        setTitleSugg]        = useState("");
  var [excludeStyle,     setExcludeStyle]     = useState("");
  var [maxMode,          setMaxMode]          = useState(true);
  var [instrumental,     setInstrumental]     = useState(false);
  var [voicesMode,       setVoicesMode]       = useState(false);
  var [weirdness,        setWeirdness]        = useState(62);
  var [styleInf,         setStyleInf]         = useState(70);
  var [autoAdvanced,     setAutoAdvanced]     = useState(true);
  var [searchQ,          setSearchQ]          = useState("");
  var [searching,        setSearching]        = useState(false);
  var [searchInfo,       setSearchInfo]       = useState("");
  var [searchErr,        setSearchErr]        = useState("");
  var [creativeP,        setCreativeP]        = useState("");
  var [creativeAnalyzing,setCreativeAnalyzing]= useState(false);
  var [creativeInfo,     setCreativeInfo]     = useState("");
  var [creativeErr,      setCreativeErr]      = useState("");
  var [smartFillMode,    setSmartFillMode]    = useState("artist");
  var [output,           setOutput]           = useState(null);
  var [history,          setHistory]          = useState(function(){
    try { return JSON.parse(localStorage.getItem("sunoHistory") || "[]"); } catch(e) { return []; }
  });
  useEffect(function(){
    try { localStorage.setItem("sunoHistory", JSON.stringify(history)); } catch(e) {}
  }, [history]);
  useEffect(function(){
    if (!output && history.length > 0) setOutput(history[0].output);
  }, []);
  function pushHistory(out) {
    if (!out || (!out.lyrics && !out.style && !out.title)) return;
    var firstLine = (out.title || "").split("\n")[0].trim().substring(0, 60);
    var entry = { ts: Date.now(), title: firstLine || (isEn?"(untitled)":"(ohne Titel)"), output: out };
    setHistory(function(prev){ return [entry].concat(prev).slice(0, 10); });
  }
  var [presets, setPresets] = useState(function(){
    try { return JSON.parse(localStorage.getItem("sunoPresets") || "[]"); } catch(e) { return []; }
  });
  useEffect(function(){
    try { localStorage.setItem("sunoPresets", JSON.stringify(presets)); } catch(e) {}
  }, [presets]);
  var [newPresetName, setNewPresetName] = useState("");
  function loadPreset(p) {
    var s = p.settings || {};
    if (s.genres) setGenres(s.genres);
    if (s.extraGenres) setExtraGenres(s.extraGenres);
    if (s.moods) setMoods(s.moods);
    if (s.energy) setEnergy(s.energy);
    if (s.tempoTerm !== undefined) setTempoTerm(s.tempoTerm);
    if (s.bpmMin !== undefined) setBpmMin(s.bpmMin);
    if (s.bpmMax !== undefined) setBpmMax(s.bpmMax);
    if (s.vocalType !== undefined) setVocalType(s.vocalType);
    if (s.vocalTone !== undefined) setVocalTone(s.vocalTone);
    if (s.accent !== undefined) setAccent(s.accent);
    if (s.dynamics) setDynamics(s.dynamics);
    if (s.songKey !== undefined) setSongKey(s.songKey);
    if (s.prodFx) setProdFx(s.prodFx);
    if (s.era !== undefined) setEra(s.era);
    if (s.lang) setLang(s.lang);
    if (s.structure) setStructure(s.structure);
    if (s.lyricThemes) setLyricThemes(s.lyricThemes);
    if (s.lyricContent !== undefined) setLyricContent(s.lyricContent);
    if (s.excludeStyle !== undefined) setExcludeStyle(s.excludeStyle);
    if (s.maxMode !== undefined) setMaxMode(s.maxMode);
    if (s.instrumental !== undefined) setInstrumental(s.instrumental);
    if (s.voicesMode !== undefined) setVoicesMode(s.voicesMode);
    if (s.weirdness !== undefined) setWeirdness(s.weirdness);
    if (s.styleInf !== undefined) setStyleInf(s.styleInf);
    if (s.autoAdvanced !== undefined) setAutoAdvanced(s.autoAdvanced);
  }
  function savePreset() {
    var n = newPresetName.trim(); if (!n) return;
    var snap = {
      genres:genres, extraGenres:extraGenres, moods:moods,
      energy:energy, tempoTerm:tempoTerm, bpmMin:bpmMin, bpmMax:bpmMax,
      vocalType:vocalType, vocalTone:vocalTone, accent:accent,
      dynamics:dynamics, songKey:songKey, prodFx:prodFx,
      era:era, lang:lang, structure:structure,
      lyricThemes:lyricThemes, lyricContent:lyricContent,
      excludeStyle:excludeStyle, maxMode:maxMode, instrumental:instrumental,
      voicesMode:voicesMode, weirdness:weirdness, styleInf:styleInf,
      autoAdvanced:autoAdvanced
    };
    setPresets(function(prev){ return prev.concat([{id:Date.now(), name:n, settings:snap}]); });
    setNewPresetName("");
  }
  function deletePreset(id) {
    setPresets(function(prev){ return prev.filter(function(p){ return p.id !== id; }); });
  }
  var [loading,          setLoading]          = useState(false);
  var [loadingLyrics,    setLoadingLyrics]    = useState(false);
  var [loadingStyle,     setLoadingStyle]     = useState(false);
  var [optimizingLyrics, setOptimizingLyrics] = useState(false);
  var [optimizingStyle,  setOptimizingStyle]  = useState(false);
  var [error,            setError]            = useState("");
  var [activeTab,        setActiveTab]        = useState("lyrics");
  var [confirmReset,     setConfirmReset]     = useState(false);
  var [panel,            setPanel]            = useState("settings");
  var [xmlExport,        setXmlExport]        = useState("");
  var [importMsg,        setImportMsg]        = useState("");
  var [initialized,      setInitialized]      = useState(false);
  var [apiStatus,        setApiStatus]        = useState("unknown");

  function checkApi() {
    setApiStatus("unknown");
    fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{
        "content-type":"application/json",
        "anthropic-version":"2023-06-01",
        "anthropic-dangerous-direct-browser-access":"true"
      },
      body:JSON.stringify({
        model:"claude-haiku-4-5",max_tokens:10,
        messages:[{role:"user",content:"hi"}]
      })
    }).then(function(r){
      return r.json().then(function(d){return {ok:r.ok, d:d};});
    }).then(function(res){
      setApiStatus(res.ok && res.d && res.d.content && !res.d.error ? "ok" : "error");
    }).catch(function(){setApiStatus("error");});
  }

  useEffect(function(){checkApi();},[]);

  useEffect(function(){
    var s = storageLoad();
    if (s) {
      if (s.genres&&s.genres.length)      setGenres(s.genres);
      if (s.extraGenres&&s.extraGenres.length) setExtraGenres(s.extraGenres);
      if (s.artists&&s.artists.length)    setArtists(s.artists);
      if (s.availExtra&&s.availExtra.length)
        setAvailArtists(PRESET_ARTISTS.concat(
          s.availExtra.filter(function(a){return !PRESET_ARTISTS.includes(a);})
        ));
      if (s.moods&&s.moods.length)        setMoods(s.moods);
      if (s.energy)                        setEnergy(s.energy);
      if (s.tempoTerm)                     setTempoTerm(s.tempoTerm);
      if (s.bpmMin)                        setBpmMin(s.bpmMin);
      if (s.bpmMax)                        setBpmMax(s.bpmMax);
      if (s.vocalType)                     setVocalType(s.vocalType);
      if (s.vocalTone)                     setVocalTone(s.vocalTone);
      if (s.accent)                        setAccent(s.accent);
      if (s.dynamics&&s.dynamics.length)   setDynamics(s.dynamics);
      if (s.songKey)                       setSongKey(s.songKey);
      if (s.prodFx&&s.prodFx.length)       setProdFx(s.prodFx);
      if (s.era)                           setEra(s.era);
      if (s.lang)                          setLang(s.lang);
      if (s.structure&&s.structure.length) setStructure(s.structure);
      if (s.lyricThemes&&s.lyricThemes.length) setLyricThemes(s.lyricThemes);
      if (s.lyricContent)                  setLyricContent(s.lyricContent);
      if (s.ownLyrics)                     setOwnLyrics(s.ownLyrics);
      if (s.description)                   setDescription(s.description);
      if (s.titleSugg)                     setTitleSugg(s.titleSugg);
      if (s.excludeStyle)                  setExcludeStyle(s.excludeStyle);
      if (s.maxMode!=null)                 setMaxMode(s.maxMode);
      if (s.instrumental!=null)            setInstrumental(s.instrumental);
      if (s.voicesMode!=null)              setVoicesMode(s.voicesMode);
      if (s.weirdness!=null)               setWeirdness(s.weirdness);
      if (s.styleInf!=null)                setStyleInf(s.styleInf);
      if (s.autoAdvanced!=null)            setAutoAdvanced(s.autoAdvanced);
    }
    setInitialized(true);
  },[]);

  useEffect(function(){
    if (!initialized) return;
    var id = setTimeout(function(){
      storageSave({
        genres, extraGenres, artists,
        availExtra: availArtists.filter(function(a){return !PRESET_ARTISTS.includes(a);}),
        moods, energy, tempoTerm, bpmMin, bpmMax,
        vocalType, vocalTone, accent, dynamics, songKey, prodFx,
        era, lang, structure, lyricThemes, lyricContent,
        ownLyrics, description, titleSugg, excludeStyle,
        maxMode, instrumental, voicesMode, weirdness, styleInf, autoAdvanced
      });
    }, 300);
    return function(){ clearTimeout(id); };
  },[initialized,genres,extraGenres,artists,availArtists,moods,energy,tempoTerm,
     bpmMin,bpmMax,vocalType,vocalTone,accent,dynamics,songKey,prodFx,era,lang,
     structure,lyricThemes,lyricContent,ownLyrics,description,titleSugg,
     excludeStyle,maxMode,instrumental,voicesMode,weirdness,styleInf,autoAdvanced]);

  function toggle(arr, set, item) {
    set(arr.includes(item)
      ? arr.filter(function(i){return i!==item;})
      : arr.concat([item]));
  }
  function autoBpm(g) {
    var guide=BPM_GUIDE[g]; if(!guide)return;
    if(bpmMin||bpmMax) return;
    var p=guide.split("-"); setBpmMin(p[0]); setBpmMax(p[1]);
  }
  function addCustomGenre(name) {
    var n=name.trim(); if(!n)return;
    if(!extraGenres.includes(n)&&!GENRES.includes(n))
      setExtraGenres(function(p){return p.concat([n]);});
    if(!genres.includes(n)) setGenres(function(p){return p.concat([n]);});
  }
  function applyTempoTerm(term) {
    setTempoTerm(tempoTerm===term?"":term);
    var f=TEMPO_TERMS.find(function(x){return x.label===term;});
    if(f&&f.bpmLo>0){setBpmMin(String(f.bpmLo));setBpmMax(String(f.bpmHi));}
  }
  function addArtist(name) {
    var n=name.trim(); if(!n)return;
    if(!availArtists.includes(n)) setAvailArtists(function(p){return p.concat([n]);});
    if(!artists.includes(n)) setArtists(function(p){return p.concat([n]);});
  }
  function removeArtist(a) {
    setAvailArtists(function(p){return p.filter(function(x){return x!==a;});});
    setArtists(function(p){return p.filter(function(x){return x!==a;});});
  }
  function hideGenre(g) {
    setHiddenGenres(function(p){return p.includes(g)?p:p.concat([g]);});
    setGenres(function(p){return p.filter(function(x){return x!==g;});});
  }
  function restoreGenre(g) {
    setHiddenGenres(function(p){return p.filter(function(x){return x!==g;});});
  }
  function resetAll() {
    setGenres([]); setExtraGenres([]); setHiddenGenres([]); setShowHidden(false);
    setAvailArtists(PRESET_ARTISTS.slice()); setArtists([]); setCustomArtist("");
    setMoods([]); setEnergy("Medium"); setTempoTerm(""); setBpmMin(""); setBpmMax("");
    setVocalType(""); setVocalTone(""); setAccent(""); setDynamics([]); setSongKey(""); setProdFx([]);
    setEra(""); setLang("English"); setStructure(DEF_STRUCT.slice());
    setLyricThemes([]); setLyricContent(""); setOwnLyrics(""); setDescription("");
    setTitleSugg(""); setExcludeStyle("");
    setMaxMode(true); setInstrumental(false); setVoicesMode(false);
    setWeirdness(62); setStyleInf(70); setAutoAdvanced(true);
    setOutput(history.length>0 ? history[0].output : null);
    setError(""); setSearchQ(""); setSearchInfo("");
    setCreativeP(""); setCreativeInfo(""); setConfirmReset(false);
    storageSave({});
  }

  async function callAPI(sysPr, userMsg) {
    var res = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{
        "content-type":"application/json",
        "anthropic-version":"2023-06-01",
        "anthropic-dangerous-direct-browser-access":"true"
      },
      body:JSON.stringify({
        model:"claude-sonnet-4-5",
        max_tokens:2000,
        system:sysPr,
        messages:[{role:"user",content:userMsg}]
      })
    });
    var raw = await res.text();
    if(!raw||!raw.trim()) throw new Error("Empty response");
    var d; try{d=JSON.parse(raw);}catch(e){throw new Error("Invalid JSON");}
    if(d.error) throw new Error("API: "+d.error.message);
    if(!d.content||!d.content.length) throw new Error("No content");
    return d.content.map(function(b){return b.text||"";}).join("").trim();
  }

  function applyJSON(j) {
    if(j.genres&&j.genres.length){
      var ng=j.genres.filter(function(g){return !GENRES.includes(g);});
      setGenres(j.genres);
      if(ng.length) setExtraGenres(function(p){return Array.from(new Set(p.concat(ng)));});
      if(j.genres[0]&&!j.bpmMin&&!j.bpmMax) autoBpm(j.genres[0]);
    }
    if(j.moods&&j.moods.length)    setMoods(j.moods);
    if(j.energy)                    setEnergy(j.energy);
    if(j.tempoTerm)                 setTempoTerm(j.tempoTerm);
    if(j.bpmMin)                    setBpmMin(String(j.bpmMin));
    if(j.bpmMax)                    setBpmMax(String(j.bpmMax));
    if(j.vocalType)                 setVocalType(j.vocalType);
    if(j.vocalTone)                 setVocalTone(j.vocalTone);
    if(j.dynamics&&j.dynamics.length) setDynamics(j.dynamics);
    if(j.key)                       setSongKey(j.key);
    if(j.era)                       setEra(j.era);
    if(j.lang)                      setLang(j.lang);
    if(j.lyricThemes&&j.lyricThemes.length) setLyricThemes(j.lyricThemes);
    if(j.lyricContent)              setLyricContent(j.lyricContent);
    if(j.structure&&j.structure.length) setStructure(j.structure);
    if(j.artists&&j.artists.length)
      j.artists.forEach(function(a){if(a)addArtist(a.trim());});
    if(j.weirdness!=null)           setWeirdness(j.weirdness);
    if(j.styleInfluence!=null)      setStyleInf(j.styleInfluence);
    if(j.artist&&j.artist.trim())   addArtist(j.artist.trim());
  }
  function parseJSONStr(raw) {
    var cl=raw.replace(/```json/g,"").replace(/```/g,"").trim();
    var s=cl.indexOf("{"), e=cl.lastIndexOf("}");
    if(s===-1||e===-1) throw new Error("No JSON found");
    return JSON.parse(cl.substring(s,e+1));
  }

  async function analyzeSearch() {
    if(!searchQ.trim())return;
    setSearching(true); setSearchInfo(""); setSearchErr("");
    try{
      var txt=await callAPI(ANALYZE_PROMPT,"Analyze: \""+searchQ+"\"");
      var j=parseJSONStr(txt);
      applyJSON(j);
      if(j.description) setSearchInfo(j.description);
    }catch(e){ setSearchErr(e.message||String(e)); }
    finally{ setSearching(false); }
  }
  async function analyzeCreative() {
    if(!creativeP.trim())return;
    setCreativeAnalyzing(true); setCreativeInfo(""); setCreativeErr("");
    try{
      var txt=await callAPI(CREATIVE_PROMPT,"Creative instruction: \""+creativeP+"\"");
      var j=parseJSONStr(txt);
      applyJSON(j);
      if(j.description) setCreativeInfo(j.description);
    }catch(e){ setCreativeErr(e.message||String(e)); }
    finally{ setCreativeAnalyzing(false); }
  }

  function settingsParts() {
    var p=[];
    if(genres.length)
      p.push("Genres: "+genres.join(", "));
    if(artists.length)
      p.push("Artist refs (mood/lyrics only, NOT in Style): "+artists.join(", "));
    if(moods.length)       p.push("Mood: "+moods.join(", "));
    if(energy!=="Medium")  p.push("Energy: "+energy);
    if(tempoTerm)          p.push("Tempo: "+tempoTerm);
    if(bpmMin&&bpmMax)     p.push("BPM: "+bpmMin+"-"+bpmMax);
    else if(bpmMin||bpmMax)p.push("BPM: "+(bpmMin||bpmMax));
    if(songKey)            p.push("Key: "+songKey);
    if(dynamics.length)    p.push("Dynamics: "+dynamics.join(", "));
    if(prodFx.length)      p.push("Production: "+prodFx.join(", "));
    if(vocalType)          p.push("Vocals: "+vocalType);
    if(vocalTone)          p.push("Vocal tone: "+vocalTone);
    if(accent)             p.push("Accent: "+accent+" (maintain consistently throughout)");
    if(era)                p.push("Era: "+era);
    p.push("Song language: "+(lang||"English")+
      " — ALL lyrics MUST be written exclusively in this language. Do NOT use any other language.");
    if(structure.length)   p.push("Structure: "+structure.join(" > "));
    if(lyricThemes.length) p.push("Themes: "+lyricThemes.join(", "));
    if(lyricContent)       p.push("Lyric content: "+lyricContent);
    if(maxMode)            p.push(
      "MAX MODE: ENABLED - first line of Lyrics MUST be ///*****/// " +
      "- LAST line of Style MUST be " +
      "[Is_MAX_MODE: MAX](MAX) [QUALITY: MAX](MAX) [REALISM: MAX](MAX) [REAL_INSTRUMENTS: MAX](MAX)"
    );
    if(instrumental)       p.push(
      "INSTRUMENTAL MODE: No vocals. Style must include no vocals no singing no humming. " +
      "Lyrics: use only [Instrumental] tags."
    );
    if(voicesMode)         p.push(
      "VOICES MODE: Remove ALL gender descriptors from Style AND Lyrics. " +
      "Use freed space for production detail. Keep Weirdness low."
    );
    if(autoAdvanced) {
      p.push("Weirdness: AUTO");
      p.push("Style Influence: AUTO");
    } else {
      p.push("Weirdness: "+weirdness+"%");
      p.push("Style Influence: "+styleInf+"%");
    }
    if(excludeStyle.trim()) p.push("Exclude: "+excludeStyle.trim());
    if(titleSugg.trim())   p.push("Title: "+titleSugg.trim());
    if(ownLyrics)          p.push("Own Lyrics:\n"+ownLyrics);
    if(description)        p.push("Additional: "+description);
    return p;
  }
  async function callSong(extra) {
    return await callAPI(SYSTEM_PROMPT, settingsParts().concat(extra).join("\n"));
  }

  async function generate() {
    setLoading(true); setError(""); setOutput(null);
    try{
      var txt=await callSong([
        "Create a complete optimized SUNO v5.5 song prompt. " +
        "Output exactly in the format with 4 separate code blocks."
      ]);
      var parsed=parseOutput(txt);
      setOutput(parsed); pushHistory(parsed);
      setActiveTab("lyrics"); setPanel("output");
    }catch(e){ setError(e.message||String(e)); }
    finally{ setLoading(false); }
  }
  async function regenLyrics() {
    setLoadingLyrics(true);
    try{
      var txt=await callSong([
        "Generate ONLY # 1. LYRICS and # 4. TITLE. " +
        "Completely new lyrics. Do NOT output sections 2 or 3."
      ]);
      var p=parseOutput(txt);
      setOutput(function(prev){
        return Object.assign({},prev,{
          lyrics:p.lyrics||prev.lyrics,title:p.title||prev.title
        });
      });
    }catch(e){ setError(e.message||String(e)); }
    finally{ setLoadingLyrics(false); }
  }
  async function regenStyle() {
    setLoadingStyle(true);
    try{
      var extra=[
        "Generate ONLY # 2. STYLE and # 3. ADVANCED OPTIONS. " +
        "HARD LIMIT: under 1000 characters. No artist names. Do NOT output sections 1 or 4."
      ];
      if(output&&output.lyrics)
        extra=["Current Lyrics (context):",output.lyrics].concat(extra);
      var txt=await callSong(extra);
      var p=parseOutput(txt);
      setOutput(function(prev){
        return Object.assign({},prev,{
          style:truncateStyle(p.style)||prev.style,
          advanced:p.advanced||prev.advanced
        });
      });
    }catch(e){ setError(e.message||String(e)); }
    finally{ setLoadingStyle(false); }
  }
  async function optimizeLyrics() {
    setOptimizingLyrics(true);
    try{
      var txt=await callSong([
        "Lyrics to optimize:",(output&&output.lyrics)||"",
        "Improve rhyme/flow/structure. Same theme. " +
        "Output ONLY # 1. LYRICS and # 4. TITLE."
      ]);
      var p=parseOutput(txt);
      setOutput(function(prev){
        return Object.assign({},prev,{
          lyrics:p.lyrics||prev.lyrics,title:p.title||prev.title
        });
      });
    }catch(e){ setError(e.message||String(e)); }
    finally{ setOptimizingLyrics(false); }
  }
  async function optimizeStyle() {
    setOptimizingStyle(true);
    try{
      var txt=await callSong([
        "Style to optimize:",(output&&output.style)||"",
        "CRITICAL: under 1000 chars. No artist names. " +
        "Output ONLY # 2. STYLE and # 3. ADVANCED OPTIONS."
      ]);
      var p=parseOutput(txt);
      setOutput(function(prev){
        return Object.assign({},prev,{
          style:truncateStyle(p.style)||prev.style,
          advanced:p.advanced||prev.advanced
        });
      });
    }catch(e){ setError(e.message||String(e)); }
    finally{ setOptimizingStyle(false); }
  }

  function buildXML() {
    function esc(s){
      return String(s)
        .replace(/&/g,"&amp;").replace(/</g,"&lt;")
        .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }
    function arr(a){
      return a.map(function(i){return "<item>"+esc(i)+"</item>";}).join("");
    }
    var x = '<?xml version="1.0" encoding="UTF-8"?>\n';
    x += '<SunoSongSettings version="1.0">\n';
    x += '  <genres>'+arr(genres)+'</genres>\n';
    x += '  <extraGenres>'+arr(extraGenres)+'</extraGenres>\n';
    x += '  <artists>'+arr(artists)+'</artists>\n';
    x += '  <availExtra>'+arr(
      availArtists.filter(function(a){return !PRESET_ARTISTS.includes(a);})
    )+'</availExtra>\n';
    x += '  <moods>'+arr(moods)+'</moods>\n';
    x += '  <energy>'+esc(energy)+'</energy>\n';
    x += '  <tempoTerm>'+esc(tempoTerm)+'</tempoTerm>\n';
    x += '  <bpmMin>'+esc(bpmMin)+'</bpmMin>\n';
    x += '  <bpmMax>'+esc(bpmMax)+'</bpmMax>\n';
    x += '  <vocalType>'+esc(vocalType)+'</vocalType>\n';
    x += '  <vocalTone>'+esc(vocalTone)+'</vocalTone>\n';
    x += '  <accent>'+esc(accent)+'</accent>\n';
    x += '  <dynamics>'+arr(dynamics)+'</dynamics>\n';
    x += '  <songKey>'+esc(songKey)+'</songKey>\n';
    x += '  <prodFx>'+arr(prodFx)+'</prodFx>\n';
    x += '  <era>'+esc(era)+'</era>\n';
    x += '  <lang>'+esc(lang)+'</lang>\n';
    x += '  <structure>'+arr(structure)+'</structure>\n';
    x += '  <lyricThemes>'+arr(lyricThemes)+'</lyricThemes>\n';
    x += '  <lyricContent>'+esc(lyricContent)+'</lyricContent>\n';
    x += '  <ownLyrics>'+esc(ownLyrics)+'</ownLyrics>\n';
    x += '  <description>'+esc(description)+'</description>\n';
    x += '  <titleSugg>'+esc(titleSugg)+'</titleSugg>\n';
    x += '  <excludeStyle>'+esc(excludeStyle)+'</excludeStyle>\n';
    x += '  <maxMode>'+maxMode+'</maxMode>\n';
    x += '  <instrumental>'+instrumental+'</instrumental>\n';
    x += '  <voicesMode>'+voicesMode+'</voicesMode>\n';
    x += '  <weirdness>'+weirdness+'</weirdness>\n';
    x += '  <styleInf>'+styleInf+'</styleInf>\n';
    x += '  <autoAdvanced>'+autoAdvanced+'</autoAdvanced>\n';
    x += '</SunoSongSettings>';
    return x;
  }
  function exportXML() { setXmlExport(buildXML()); }
  function importXML(file) {
    if(!file)return;
    var reader=new FileReader();
    reader.onload=function(e){
      try{
        var doc=new DOMParser().parseFromString(e.target.result,"application/xml");
        function getT(tag){var el=doc.querySelector(tag);return el?el.textContent:"";}
        function getArr(tag){
          return Array.from(doc.querySelectorAll(tag+" > item"))
            .map(function(el){return el.textContent;}).filter(Boolean);
        }
        var g=getArr("genres");       if(g.length)  setGenres(g);
        var eg=getArr("extraGenres"); if(eg.length) setExtraGenres(eg);
        var ar=getArr("artists");     if(ar.length) setArtists(ar);
        var av=getArr("availExtra");
        if(av.length) setAvailArtists(
          PRESET_ARTISTS.concat(av.filter(function(a){return !PRESET_ARTISTS.includes(a);}))
        );
        var mo=getArr("moods");       if(mo.length) setMoods(mo);
        var en=getT("energy");        if(en) setEnergy(en);
        var tt=getT("tempoTerm");     if(tt) setTempoTerm(tt);
        var b1=getT("bpmMin");        if(b1) setBpmMin(b1);
        var b2=getT("bpmMax");        if(b2) setBpmMax(b2);
        var vt=getT("vocalType");     if(vt) setVocalType(vt);
        var vn=getT("vocalTone");     if(vn) setVocalTone(vn);
        var ac=getT("accent");        if(ac) setAccent(ac);
        var dy=getArr("dynamics");    if(dy.length) setDynamics(dy);
        var sk=getT("songKey");       if(sk) setSongKey(sk);
        var pf=getArr("prodFx");      if(pf.length) setProdFx(pf);
        var er=getT("era");           if(er) setEra(er);
        var ln=getT("lang");          if(ln) setLang(ln);
        var st=getArr("structure");   if(st.length) setStructure(st);
        var lt=getArr("lyricThemes"); if(lt.length) setLyricThemes(lt);
        var lc=getT("lyricContent");  if(lc) setLyricContent(lc);
        var ol=getT("ownLyrics");     if(ol) setOwnLyrics(ol);
        var ds=getT("description");   if(ds) setDescription(ds);
        var ts=getT("titleSugg");     if(ts) setTitleSugg(ts);
        var ex=getT("excludeStyle");  if(ex) setExcludeStyle(ex);
        var mm=getT("maxMode");       setMaxMode(mm==="true");
        var im=getT("instrumental");  setInstrumental(im==="true");
        var vm=getT("voicesMode");    setVoicesMode(vm==="true");
        var wr=getT("weirdness");     if(wr) setWeirdness(Number(wr));
        var si=getT("styleInf");      if(si) setStyleInf(Number(si));
        var aa=getT("autoAdvanced");  if(aa) setAutoAdvanced(aa==="true");
        setImportMsg(t.importOk);
        setTimeout(function(){setImportMsg("");},3000);
      }catch(err){
        setImportMsg("Error: "+err.message);
        setTimeout(function(){setImportMsg("");},4000);
      }
    };
    reader.readAsText(file);
  }

  var tabs = useMemo(function(){ return [
    {key:"lyrics",label:t.tab1,icon:"🎤"},
    {key:"style", label:t.tab2,icon:"🎨"},
    {key:"meta",  label:t.tab3,icon:"⚙️"},
    {key:"all",   label:isEn?"4 All":"4 Alle",icon:"📋"}
  ]; }, [t, isEn]);

  return (
    <div style={{fontFamily:"system-ui,sans-serif"}}
      className={"min-h-screen bg-zinc-950 text-zinc-100 flex flex-col "+(theme==="light"?"theme-light":"")}>
      <style>{`
        input,textarea,select{font-size:16px!important}
        /* On touch devices iOS Safari leaves :hover stuck after a tap, so a
           chip that shifted into the just-tapped spot inherits the hover
           background. Disable hover-bg effects when no real hover capability
           is present. */
        @media (hover: none) {
          .hover\\:bg-red-600:hover,
          .hover\\:bg-red-700:hover,
          .hover\\:bg-red-500:hover,
          .hover\\:bg-white:hover,
          .hover\\:bg-opacity-10:hover { background-color: transparent !important; }
          .hover\\:bg-zinc-700:hover { background-color: inherit !important; }
          .hover\\:bg-zinc-600:hover { background-color: inherit !important; }
          .hover\\:text-white:hover,
          .hover\\:text-zinc-300:hover { color: inherit !important; }
        }
        /* Root may have bg-zinc-950 + theme-light on the SAME element — match both descendant AND same-element */
        .theme-light.bg-zinc-950, .theme-light .bg-zinc-950 { background-color: #ffffff !important; }
        .theme-light.bg-zinc-900, .theme-light .bg-zinc-900 { background-color: #fafafa !important; }
        .theme-light.bg-zinc-800, .theme-light .bg-zinc-800 { background-color: #f4f4f5 !important; }
        .theme-light.bg-zinc-700, .theme-light .bg-zinc-700 { background-color: #e4e4e7 !important; }
        .theme-light.bg-zinc-600, .theme-light .bg-zinc-600 { background-color: #d4d4d8 !important; }
        .theme-light.bg-zinc-500, .theme-light .bg-zinc-500 { background-color: #a1a1aa !important; }
        .theme-light.text-zinc-100, .theme-light .text-zinc-100 { color: #27272a !important; }
        .theme-light.text-zinc-200, .theme-light .text-zinc-200 { color: #3f3f46 !important; }
        .theme-light.text-zinc-300, .theme-light .text-zinc-300 { color: #52525b !important; }
        .theme-light.text-zinc-400, .theme-light .text-zinc-400 { color: #52525b !important; }
        .theme-light.text-zinc-500, .theme-light .text-zinc-500 { color: #71717a !important; }
        .theme-light.text-zinc-600, .theme-light .text-zinc-600 { color: #71717a !important; }
        /* text-white default → dark in light mode (e.g. page title), but keep it WHITE on saturated chips */
        .theme-light .text-white { color: #18181b !important; }
        .theme-light .text-white.bg-indigo-500,    .theme-light .text-white.bg-indigo-600,
        .theme-light .text-white.bg-indigo-700,    .theme-light .text-white.bg-purple-500,
        .theme-light .text-white.bg-purple-600,    .theme-light .text-white.bg-purple-700,
        .theme-light .text-white.bg-teal-600,      .theme-light .text-white.bg-red-500,
        .theme-light .text-white.bg-red-600,       .theme-light .text-white.bg-red-700,
        .theme-light .text-white.bg-rose-600,      .theme-light .text-white.bg-orange-500,
        .theme-light .text-white.bg-orange-600,    .theme-light .text-white.bg-amber-600,
        .theme-light .text-white.bg-emerald-500,   .theme-light .text-white.bg-emerald-600,
        .theme-light .text-white.bg-fuchsia-600,   .theme-light .text-white.bg-cyan-500,
        .theme-light .text-white.bg-yellow-500,
        .theme-light [class*="bg-gradient-"].text-white { color: #ffffff !important; }
        .theme-light .border-zinc-500 { border-color: #d4d4d8 !important; }
        .theme-light .border-zinc-600 { border-color: #d4d4d8 !important; }
        .theme-light .border-zinc-700 { border-color: #d4d4d8 !important; }
        .theme-light .border-zinc-800 { border-color: #e4e4e7 !important; }
        .theme-light .placeholder-zinc-600::placeholder { color: #71717a !important; }
        .theme-light .hover\\:bg-zinc-700:hover { background-color: #d4d4d8 !important; }
        .theme-light .hover\\:bg-zinc-600:hover { background-color: #a1a1aa !important; }
        .theme-light .hover\\:text-zinc-300:hover { color: #3f3f46 !important; }
        .theme-light .hover\\:text-white:hover { color: #18181b !important; }
        /* Alert/info dark backgrounds → pale tints */
        .theme-light .bg-indigo-950 { background-color: #eef2ff !important; }
        .theme-light .border-indigo-800 { border-color: #c7d2fe !important; }
        .theme-light .text-indigo-300 { color: #4338ca !important; }
        .theme-light .text-indigo-500 { color: #6366f1 !important; }
        .theme-light .text-indigo-200 { color: #4338ca !important; }
        .theme-light .bg-red-950 { background-color: #fef2f2 !important; }
        .theme-light .bg-red-900 { background-color: #fee2e2 !important; }
        .theme-light .border-red-800 { border-color: #fecaca !important; }
        .theme-light .text-red-300 { color: #b91c1c !important; }
        .theme-light .text-red-400 { color: #b91c1c !important; }
        .theme-light .text-red-600 { color: #b91c1c !important; }
        .theme-light .text-red-700 { color: #b91c1c !important; }
        .theme-light .bg-gradient-to-r.from-pink-950.to-purple-950 {
          background-image: linear-gradient(to right, #fdf2f8, #faf5ff) !important;
        }
        .theme-light .border-pink-800 { border-color: #fbcfe8 !important; }
        .theme-light .text-pink-200 { color: #9d174d !important; }
        .theme-light .text-pink-300 { color: #be185d !important; }
        .theme-light .text-pink-500 { color: #db2777 !important; }
        .theme-light .border-emerald-800 { border-color: #a7f3d0 !important; }
        .theme-light .border-emerald-900 { border-color: #6ee7b7 !important; }
        .theme-light .text-emerald-300 { color: #047857 !important; }
        .theme-light .text-emerald-400 { color: #047857 !important; }
        .theme-light .border-amber-800 { border-color: #fde68a !important; }
        .theme-light .text-amber-300 { color: #b45309 !important; }
        .theme-light .text-amber-400 { color: #b45309 !important; }
        .theme-light .text-sky-300 { color: #0369a1 !important; }
        .theme-light .text-yellow-400 { color: #a16207 !important; }
        .theme-light .text-fuchsia-200 { color: #86198f !important; }
        .theme-light .text-purple-200 { color: #6b21a8 !important; }
        .theme-light .text-teal-200 { color: #115e59 !important; }
        /* Chip context: text-{color}-200 stays light when nested in or on a saturated bg-{color}-N chip */
        .theme-light .bg-indigo-500 .text-indigo-200, .theme-light .bg-indigo-600 .text-indigo-200, .theme-light .bg-indigo-700 .text-indigo-200,
        .theme-light .bg-indigo-500.text-indigo-200, .theme-light .bg-indigo-600.text-indigo-200, .theme-light .bg-indigo-700.text-indigo-200 { color: #c7d2fe !important; }
        .theme-light .bg-purple-500 .text-purple-200, .theme-light .bg-purple-600 .text-purple-200, .theme-light .bg-purple-700 .text-purple-200,
        .theme-light .bg-purple-500.text-purple-200, .theme-light .bg-purple-600.text-purple-200, .theme-light .bg-purple-700.text-purple-200 { color: #e9d5ff !important; }
        .theme-light .bg-fuchsia-500 .text-fuchsia-200, .theme-light .bg-fuchsia-600 .text-fuchsia-200,
        .theme-light .bg-fuchsia-500.text-fuchsia-200, .theme-light .bg-fuchsia-600.text-fuchsia-200 { color: #f5d0fe !important; }
        .theme-light .bg-teal-500 .text-teal-200, .theme-light .bg-teal-600 .text-teal-200,
        .theme-light .bg-teal-500.text-teal-200, .theme-light .bg-teal-600.text-teal-200 { color: #99f6e4 !important; }
      `}</style>

      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-2.5 pr-12 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div title={t.appSubtitle}
            className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-lg shrink-0">🎵</div>
          <h1 className="text-base font-semibold text-white truncate">SUNO Song Creator</h1>
          <button onClick={checkApi}
            title={apiStatus==="error"?(isEn?"API error - tap to retry":"API-Fehler - tippen für neuen Versuch"):(isEn?"API connected - tap to recheck":"API verbunden - tippen für neuen Check")}
            aria-label={isEn?"API status":"API-Status"}
            className={"w-2 h-2 rounded-full shrink-0 transition-colors "+(
              apiStatus==="ok"?"bg-emerald-500":
              apiStatus==="error"?"bg-red-500":"bg-zinc-500 animate-pulse")}/>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={function(){setTheme(theme==="dark"?"light":"dark");}}
            title={isEn?"Toggle theme":"Theme wechseln"} aria-label={isEn?"Toggle theme":"Theme wechseln"}
            className="px-2.5 py-1.5 rounded text-sm border border-zinc-700 text-zinc-400 hover:border-indigo-500 hover:text-indigo-300 transition-all">
            {theme==="dark"?"☀":"🌙"}
          </button>
          <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
            <button onClick={function(){setUiLang("en");}}
              className={"px-2.5 py-1 rounded text-xs font-semibold transition-all "+
                (uiLang==="en"?"bg-indigo-600 text-white":"text-zinc-500 hover:text-zinc-300")}>EN</button>
            <button onClick={function(){setUiLang("de");}}
              className={"px-2.5 py-1 rounded text-xs font-semibold transition-all "+
                (uiLang==="de"?"bg-indigo-600 text-white":"text-zinc-500 hover:text-zinc-300")}>DE</button>
          </div>
          {!confirmReset
            ?<button onClick={function(){setConfirmReset(true);}}
              className="px-3 py-1.5 rounded text-xs font-medium border border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-red-400 transition-all">
              ↺ {t.restart}
            </button>
            :<div className="flex items-center gap-1">
              <button onClick={resetAll}
                title={t.yes} aria-label={t.yes}
                className="w-8 h-8 rounded flex items-center justify-center bg-red-700 hover:bg-red-600 text-white text-sm font-bold">
                ✓
              </button>
              <button onClick={function(){setConfirmReset(false);}}
                title={t.cancel} aria-label={t.cancel}
                className="w-8 h-8 rounded flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-bold">
                ✕
              </button>
            </div>
          }
        </div>
      </div>

      {/* Panel Toggle */}
      <div className="flex border-b border-zinc-800">
        <button onClick={function(){setPanel("settings");}}
          className={"flex-1 py-2.5 text-xs font-semibold transition-all "+
            (panel==="settings"?"bg-zinc-800 text-white border-b-2 border-indigo-500":"text-zinc-500 hover:text-zinc-300")}>
          ⚙️ {t.panelSettings}
        </button>
        <button onClick={function(){setPanel("output");}}
          className={"flex-1 py-2.5 text-xs font-semibold transition-all relative "+
            (panel==="output"?"bg-zinc-800 text-white border-b-2 border-indigo-500":"text-zinc-500 hover:text-zinc-300")}>
          🎵 {t.panelResult}
          {output&&panel!=="output"&&
            <span className="absolute top-1.5 right-6 w-2 h-2 rounded-full bg-indigo-500"/>}
        </button>
      </div>

      <div className="flex-1 overflow-hidden" style={{minHeight:0}}>

        {/* SETTINGS */}
        {panel==="settings"&&(
          <div className="h-full overflow-y-auto p-4 space-y-5">

            {/* Quick-Nav-Chips */}
            <div className="sticky top-0 -mx-4 -mt-4 px-4 pt-3 pb-2 bg-zinc-950 z-20 border-b border-zinc-800 mb-1">
              <div className="flex gap-1.5 overflow-x-auto" style={{scrollbarWidth:"none", WebkitOverflowScrolling:"touch"}}>
                {[
                  {id:"smartFill",   label:isEn?"Smart Fill":"Smart"},
                  {id:"presets",     label:isEn?"Presets":"Vorlagen"},
                  {id:"artists",     label:isEn?"Artists":"Künstler"},
                  {id:"genre",       label:"Genre"},
                  {id:"mood",        label:"Mood"},
                  {id:"energyTempo", label:"Tempo"},
                  {id:"key",         label:isEn?"Key":"Tonart"},
                  {id:"dynamics",    label:isEn?"Dynamics":"Dynamik"},
                  {id:"vocals",      label:"Vocals"},
                  {id:"production",  label:isEn?"Production":"Produktion"},
                  {id:"eraLang",     label:"Era"},
                  {id:"structure",   label:isEn?"Structure":"Struktur"},
                  {id:"lyrics",      label:"Lyrics"},
                  {id:"advanced",    label:isEn?"Advanced":"Erweitert"},
                  {id:"exportImport",label:"Export"}
                ].map(function(item){
                  return (
                    <button key={item.id} onClick={function(){navigateTo(item.id);}}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-zinc-700 text-zinc-400 whitespace-nowrap shrink-0 hover:border-indigo-500 hover:text-indigo-300 transition-all">
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Smart Fill — unified Search + Creative */}
            <Section title={isEn?"Smart Fill":"Smart-Eingabe"}
              onClear={function(){
                setSearchQ("");setSearchInfo("");setSearchErr("");
                setCreativeP("");setCreativeInfo("");setCreativeErr("");
              }}
              id="smartFill" isOpen={openSections.smartFill} onToggle={function(){toggleSec("smartFill");}}
              hasData={!!(searchQ.trim()||creativeP.trim())}>
              <div className="flex gap-1 bg-zinc-800 rounded-lg p-1 mb-3">
                <button onClick={function(){setSmartFillMode("artist");}}
                  className={"flex-1 py-1.5 rounded text-xs font-semibold transition-all "+
                    (smartFillMode==="artist"?"bg-indigo-600 text-white":"text-zinc-500 hover:text-zinc-300")}>
                  ⚡ {isEn?"Artist / Song":"Artist / Song"}
                </button>
                <button onClick={function(){setSmartFillMode("creative");}}
                  className={"flex-1 py-1.5 rounded text-xs font-semibold transition-all "+
                    (smartFillMode==="creative"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white":"text-zinc-500 hover:text-zinc-300")}>
                  ✨ {isEn?"Free Idea":"Freie Idee"}
                </button>
              </div>
              {smartFillMode==="artist" ? (
                <>
                  <p className="text-xs text-zinc-600 mb-2">{t.searchDesc}</p>
                  <div className="flex gap-2">
                    <input value={searchQ}
                      onChange={function(e){setSearchQ(e.target.value);}}
                      onKeyDown={function(e){if(e.key==="Enter")analyzeSearch();}}
                      placeholder={t.searchPlaceholder}
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"/>
                    <button onClick={analyzeSearch} disabled={searching||!searchQ.trim()}
                      className={"px-3 py-2 rounded text-xs font-medium flex items-center gap-1.5 transition-all "+
                        (searching||!searchQ.trim()?"bg-zinc-700 text-zinc-500 cursor-not-allowed":"bg-indigo-600 hover:bg-indigo-500 text-white")}>
                      {searching
                        ?<span className="w-3 h-3 border border-zinc-500 border-t-indigo-400 rounded-full animate-spin"/>
                        :"⚡"}
                      {searching?t.analyzing:t.analyzeBtn}
                    </button>
                  </div>
                  {searchInfo&&
                    <div className="mt-2 bg-indigo-950 border border-indigo-800 rounded-lg px-3 py-2">
                      <p className="text-xs text-indigo-300">{searchInfo}</p>
                      <p className="text-xs text-indigo-500 mt-0.5">{t.analyzedInfo}</p>
                    </div>}
                  {searchErr&&
                    <div className="mt-2 bg-red-950 border border-red-800 rounded-lg px-3 py-2">
                      <p className="text-xs text-red-400 font-semibold mb-0.5">{t.analysisFailed}</p>
                      <p className="text-xs text-red-300">{searchErr}</p>
                    </div>}
                </>
              ) : (
                <>
                  <p className="text-xs text-zinc-600 mb-2">{t.creativeDesc}</p>
                  <textarea value={creativeP}
                    onChange={function(e){setCreativeP(e.target.value);}}
                    onKeyDown={function(e){if(e.key==="Enter"&&(e.metaKey||e.ctrlKey))analyzeCreative();}}
                    placeholder={t.creativePlaceholder} rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-pink-500 resize-none mb-2"/>
                  <button onClick={analyzeCreative}
                    disabled={creativeAnalyzing||!creativeP.trim()}
                    className={"w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all "+
                      (creativeAnalyzing||!creativeP.trim()
                        ?"bg-zinc-700 text-zinc-500 cursor-not-allowed"
                        :"bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white")}>
                    {creativeAnalyzing
                      ?<><span className="w-3.5 h-3.5 border border-zinc-500 border-t-pink-400 rounded-full animate-spin"/>{t.creativeAnalyzing}</>
                      :<><span>✨</span>{t.creativeBtn}</>}
                  </button>
                  {creativeInfo&&
                    <div className="mt-2 bg-gradient-to-r from-pink-950 to-purple-950 border border-pink-800 rounded-lg px-3 py-2">
                      <p className="text-xs text-pink-200 font-medium mb-0.5">{t.creativeInterpretation}</p>
                      <p className="text-xs text-pink-300">{creativeInfo}</p>
                      <p className="text-xs text-pink-500 mt-1">{t.creativeApplied}</p>
                    </div>}
                  {creativeErr&&
                    <div className="mt-2 bg-red-950 border border-red-800 rounded-lg px-3 py-2">
                      <p className="text-xs text-red-400">{creativeErr}</p>
                    </div>}
                </>
              )}
            </Section>

            {/* Presets */}
            <Section title={isEn?"Presets":"Vorlagen"}
              id="presets" isOpen={openSections.presets} onToggle={function(){toggleSec("presets");}}>
              <p className="text-[11px] font-medium text-zinc-400 mb-1.5">{isEn?"Templates":"Vorlagen"}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {BUILTIN_PRESETS.map(function(p){
                  return (
                    <button key={p.name} onClick={function(){loadPreset(p);}}
                      className="px-2.5 py-1 rounded-full text-xs border border-zinc-700 text-zinc-300 hover:border-indigo-500 hover:text-indigo-300 transition-all">
                      {p.name}
                    </button>
                  );
                })}
              </div>
              {presets.length>0&&(
                <>
                  <p className="text-[11px] font-medium text-zinc-400 mb-1.5">{isEn?"Saved":"Gespeichert"}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {presets.map(function(p){
                      return (
                        <span key={p.id} className="flex items-center rounded-full border border-zinc-700 bg-zinc-800 text-xs overflow-hidden">
                          <button onClick={function(){loadPreset(p);}}
                            className="px-2.5 py-1 text-zinc-300 hover:bg-white hover:bg-opacity-10">
                            {p.name}
                          </button>
                          <button onClick={function(){deletePreset(p.id);}}
                            className="px-1.5 py-1 text-zinc-500 hover:bg-red-700 hover:text-white border-l border-zinc-700">x</button>
                        </span>
                      );
                    })}
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <input value={newPresetName}
                  onChange={function(e){setNewPresetName(e.target.value);}}
                  onKeyDown={function(e){if(e.key==="Enter")savePreset();}}
                  placeholder={isEn?"Save current as...":"Aktuelle speichern als..."}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"/>
                <button onClick={savePreset} disabled={!newPresetName.trim()}
                  className={"px-3 py-1.5 rounded text-xs font-medium "+
                    (newPresetName.trim()?"bg-indigo-700 hover:bg-indigo-600 text-white":"bg-zinc-700 text-zinc-500 cursor-not-allowed")}>
                  💾 {isEn?"Save":"Speichern"}
                </button>
              </div>
            </Section>

            {/* Artists */}
            <Section title={t.artistTitle}
              onClear={function(){clearWithUndo(t.artistTitle, function(){
                var sa=artists, sav=availArtists, sca=customArtist;
                setArtists([]); setAvailArtists(PRESET_ARTISTS.slice()); setCustomArtist("");
                return function(){ setArtists(sa); setAvailArtists(sav); setCustomArtist(sca); };
              });}}
              id="artists" isOpen={openSections.artists} onToggle={function(){toggleSec("artists");}}
              hasData={artists.length>0}>
              <p className="text-xs text-zinc-600 mb-2">{t.artistDesc}</p>
              <div className="flex gap-2 mb-3">
                <input value={customArtist}
                  onChange={function(e){setCustomArtist(e.target.value);}}
                  onKeyDown={function(e){if(e.key==="Enter"){addArtist(customArtist);setCustomArtist("");}}}
                  placeholder={t.artistAdd}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500"/>
                <button onClick={function(){addArtist(customArtist);setCustomArtist("");}}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 rounded text-xs text-white font-medium">+ Add</button>
              </div>
              <div className="space-y-3 mb-3">
                {ARTIST_GROUPS.map(function(grp){
                  var vis=grp.artists.filter(function(a){return availArtists.includes(a);});
                  if(!vis.length)return null;
                  return (
                    <div key={grp.label}>
                      <p className="text-xs text-zinc-600 mb-1">{grp.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {vis.map(function(a){
                          var active=artists.includes(a);
                          return (
                            <span key={a}
                              className={"flex items-center rounded border text-xs transition-all overflow-hidden "+
                                (active?"bg-purple-600 border-purple-500 text-white":"bg-zinc-800 border-zinc-700 text-zinc-300")}>
                              <button onClick={function(){toggle(artists,setArtists,a);}}
                                className="px-2 py-1 hover:bg-white hover:bg-opacity-10">{a}</button>
                              <button onClick={function(){removeArtist(a);}}
                                className={"px-1.5 py-1 border-l "+
                                  (active?"border-purple-400 hover:bg-red-600 text-purple-200 hover:text-white":"border-zinc-700 hover:bg-red-700 text-zinc-500 hover:text-white")}>x</button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {availArtists.filter(function(a){return !PRESET_ARTISTS.includes(a);}).length>0&&(
                  <div>
                    <p className="text-xs text-zinc-600 mb-1">Custom</p>
                    <div className="flex flex-wrap gap-1.5">
                      {availArtists.filter(function(a){return !PRESET_ARTISTS.includes(a);}).map(function(a){
                        var active=artists.includes(a);
                        return (
                          <span key={a}
                            className={"flex items-center rounded border text-xs transition-all overflow-hidden "+
                              (active?"bg-fuchsia-600 border-fuchsia-500 text-white":"bg-zinc-800 border-zinc-700 text-zinc-300")}>
                            <button onClick={function(){toggle(artists,setArtists,a);}}
                              className="px-2 py-1 hover:bg-white hover:bg-opacity-10">{a}</button>
                            <button onClick={function(){removeArtist(a);}}
                              className={"px-1.5 py-1 border-l "+
                                (active?"border-fuchsia-400 hover:bg-red-600 text-fuchsia-200 hover:text-white":"border-zinc-700 hover:bg-red-700 text-zinc-500 hover:text-white")}>x</button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {artists.length>0&&
                <p className="text-xs text-zinc-500 mt-1.5">{t.artistAnalyze}{artists.join(", ")}</p>}
            </Section>

            {/* Genre */}
            <Section title={t.genreTitle}
              onClear={function(){clearWithUndo(t.genreTitle, function(){
                var sg=genres, seg=extraGenres, shg=hiddenGenres, ssh=showHidden;
                setGenres([]); setExtraGenres([]); setHiddenGenres([]); setShowHidden(false);
                return function(){ setGenres(sg); setExtraGenres(seg); setHiddenGenres(shg); setShowHidden(ssh); };
              });}}
              id="genre" isOpen={openSections.genre} onToggle={function(){toggleSec("genre");}}
              hasData={genres.length>0}>
              <div className="flex gap-2 mb-3">
                <input value={customGenre}
                  onChange={function(e){setCustomGenre(e.target.value);}}
                  onKeyDown={function(e){if(e.key==="Enter"){addCustomGenre(customGenre);setCustomGenre("");}}}
                  placeholder={t.genreAdd}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"/>
                <button onClick={function(){addCustomGenre(customGenre);setCustomGenre("");}}
                  className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 rounded text-xs text-white font-medium">+ Add</button>
              </div>
              <div className="space-y-3 mb-2">
                {GENRE_GROUPS.map(function(grp){
                  var vis=grp.genres.filter(function(g){return !hiddenGenres.includes(g);});
                  if(!vis.length)return null;
                  return (
                    <div key={grp.label}>
                      <p className="text-xs text-zinc-600 mb-1">{grp.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {vis.map(function(g){
                          var active=genres.includes(g);
                          return (
                            <span key={g}
                              className={"flex items-center rounded border text-xs transition-all overflow-hidden "+
                                (active?"bg-indigo-600 border-indigo-500 text-white":"bg-zinc-800 border-zinc-700 text-zinc-300")}>
                              <button onClick={function(){toggle(genres,setGenres,g);if(!genres.includes(g))autoBpm(g);}}
                                className="px-2 py-1 hover:bg-white hover:bg-opacity-10">{g}</button>
                              <button onClick={function(){hideGenre(g);}}
                                className={"px-1.5 py-1 border-l "+
                                  (active?"border-indigo-400 text-indigo-200 hover:bg-red-600 hover:text-white":"border-zinc-700 text-zinc-600 hover:bg-zinc-700 hover:text-zinc-300")}>x</button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {extraGenres.filter(function(g){return !hiddenGenres.includes(g);}).length>0&&(
                  <div>
                    <p className="text-xs text-zinc-600 mb-1">Custom</p>
                    <div className="flex flex-wrap gap-1.5">
                      {extraGenres.filter(function(g){return !hiddenGenres.includes(g);}).map(function(g){
                        var active=genres.includes(g);
                        return (
                          <span key={g}
                            className={"flex items-center rounded border text-xs transition-all overflow-hidden "+
                              (active?"bg-teal-600 border-teal-500 text-white":"bg-zinc-800 border-zinc-700 text-zinc-300")}>
                            <button onClick={function(){toggle(genres,setGenres,g);if(!genres.includes(g))autoBpm(g);}}
                              className="px-2 py-1 hover:bg-white hover:bg-opacity-10">{g}</button>
                            <button onClick={function(){hideGenre(g);}}
                              className={"px-1.5 py-1 border-l "+
                                (active?"border-teal-400 text-teal-200 hover:bg-red-600 hover:text-white":"border-zinc-700 text-zinc-600 hover:bg-zinc-700 hover:text-zinc-300")}>x</button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                {hiddenGenres.length>0&&(
                  <div>
                    <button onClick={function(){setShowHidden(!showHidden);}}
                      className="text-xs text-zinc-500 hover:text-zinc-300">
                      {showHidden?"▲":"▼"} {hiddenGenres.length}{t.hiddenGenres}
                    </button>
                    {showHidden&&(
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {hiddenGenres.map(function(g){
                          return (
                            <button key={g} onClick={function(){restoreGenre(g);}}
                              className="px-2 py-1 rounded border text-xs bg-zinc-800 border-zinc-600 text-zinc-500 hover:border-indigo-500 hover:text-indigo-300">
                              + {g}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {genres.length>0&&BPM_GUIDE[genres[0]]&&
                <p className="text-xs text-zinc-500 mt-1">{t.genreTypical}{genres[0]}: {BPM_GUIDE[genres[0]]} BPM</p>}
            </Section>

            {/* Mood */}
            <Section title={t.moodTitle}
              onClear={function(){clearWithUndo(t.moodTitle, function(){
                var sm=moods;
                setMoods([]);
                return function(){ setMoods(sm); };
              });}}
              id="mood" isOpen={openSections.mood} onToggle={function(){toggleSec("mood");}}
              hasData={moods.length>0}>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map(function(m){
                  var active=moods.includes(m);
                  return (
                    <button key={m} onClick={function(){toggle(moods,setMoods,m);}}
                      className={"px-2 py-1 rounded text-xs border transition-all "+
                        (active?"bg-purple-600 text-white border-purple-500":"bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-purple-500")}>
                      {m}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Energy & Tempo */}
            <Section title={t.energyTempoTitle}
              onClear={function(){clearWithUndo(t.energyTempoTitle, function(){
                var se=energy, st=tempoTerm, sb1=bpmMin, sb2=bpmMax;
                setEnergy("Medium"); setTempoTerm(""); setBpmMin(""); setBpmMax("");
                return function(){ setEnergy(se); setTempoTerm(st); setBpmMin(sb1); setBpmMax(sb2); };
              });}}
              id="energyTempo" isOpen={openSections.energyTempo} onToggle={function(){toggleSec("energyTempo");}}
              hasData={!!(energy!=="Medium"||tempoTerm||bpmMin||bpmMax)}>
              <div className="flex gap-2 mb-3">
                {["Low","Medium","High"].map(function(lv){
                  return (
                    <button key={lv} onClick={function(){setEnergy(lv);}}
                      className={"flex-1 py-1.5 rounded text-xs font-medium border transition-all "+
                        (energy===lv?"bg-teal-600 border-teal-500 text-white":"bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-teal-600")}>
                      {lv}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-zinc-500 mb-1.5">{t.tempoGlossary}</p>
              <div className="space-y-1 mb-3">
                {TEMPO_TERMS.map(function(term){
                  return (
                    <button key={term.label} onClick={function(){applyTempoTerm(term.label);}}
                      className={"flex items-center justify-between w-full px-3 py-1.5 rounded text-xs border transition-all "+
                        (tempoTerm===term.label?"bg-indigo-700 border-indigo-500 text-white":"bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-indigo-500")}>
                      <span className="font-medium">{term.label}</span>
                      <span className={tempoTerm===term.label?"text-indigo-200":"text-zinc-500"}>
                        {term.bpmLo>0?term.bpmLo+"-"+term.bpmHi+" BPM ":""}
                        {isEn?term.en:term.de}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 items-center">
                <input value={bpmMin} onChange={function(e){setBpmMin(e.target.value);}}
                  placeholder={t.minBpm}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"/>
                <span className="text-zinc-600 text-xs">-</span>
                <input value={bpmMax} onChange={function(e){setBpmMax(e.target.value);}}
                  placeholder={t.maxBpm}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"/>
              </div>
            </Section>

            {/* Key */}
            <Section title={t.keyTitle}
              onClear={function(){clearWithUndo(t.keyTitle, function(){
                var sk=songKey;
                setSongKey("");
                return function(){ setSongKey(sk); };
              });}}
              id="key" isOpen={openSections.key} onToggle={function(){toggleSec("key");}}
              hasData={!!songKey}>
              <div className="flex gap-2">
                {["Major","Minor"].map(function(k){
                  return (
                    <button key={k} onClick={function(){setSongKey(songKey===k?"":k);}}
                      className={"flex-1 py-1.5 rounded text-xs font-medium border transition-all "+
                        (songKey===k?"bg-indigo-600 border-indigo-500 text-white":"bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-indigo-500")}>
                      {k}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Dynamics */}
            <Section title={t.dynamicsTitle}
              onClear={function(){clearWithUndo(t.dynamicsTitle, function(){
                var sd=dynamics;
                setDynamics([]);
                return function(){ setDynamics(sd); };
              });}}
              id="dynamics" isOpen={openSections.dynamics} onToggle={function(){toggleSec("dynamics");}}
              hasData={dynamics.length>0}>
              <div className="flex flex-wrap gap-1.5">
                {DYNAMICS.map(function(d){
                  var active=dynamics.includes(d);
                  var info=DYNAMICS_INFO[d];
                  return (
                    <TooltipBtn key={d} label={d} active={active}
                      onClick={function(){toggle(dynamics,setDynamics,d);}}
                      tooltip={info?(isEn?info.en:info.de):null}
                      activeClass="bg-orange-600 text-white border-orange-500"
                      inactiveClass="bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-orange-500"/>
                  );
                })}
              </div>
            </Section>

            {/* Vocals */}
            <Section title={t.vocalsTitle}
              onClear={function(){clearWithUndo(t.vocalsTitle, function(){
                var svt=vocalType, svn=vocalTone, sac=accent;
                setVocalType(""); setVocalTone(""); setAccent("");
                return function(){ setVocalType(svt); setVocalTone(svn); setAccent(sac); };
              });}}
              id="vocals" isOpen={openSections.vocals} onToggle={function(){toggleSec("vocals");}}
              hasData={!!(vocalType||vocalTone||accent)}>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {VOCAL_TYPES.map(function(v){
                  var active=vocalType===v;
                  return (
                    <button key={v} onClick={function(){setVocalType(active?"":v);}}
                      className={"px-2 py-1 rounded text-xs border transition-all "+
                        (active?"bg-teal-600 text-white border-teal-500":"bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-teal-500")}>
                      {v}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-zinc-500 mb-1.5">{t.vocalToneLabel}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {VOCAL_TONES.map(function(v){
                  var active=vocalTone===v;
                  return (
                    <button key={v} onClick={function(){setVocalTone(active?"":v);}}
                      className={"px-2 py-1 rounded text-xs border transition-all "+
                        (active?"bg-purple-600 text-white border-purple-500":"bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-purple-500")}>
                      {v}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-zinc-500 mb-1.5">{isEn?"Accent / Dialect:":"Akzent / Dialekt:"}</p>
              <div className="flex flex-wrap gap-1.5">
                {ACCENTS.map(function(a){
                  var active=accent===a.value;
                  return (
                    <TooltipBtn key={a.label} label={a.label} active={active}
                      onClick={function(){setAccent(active?"":a.value);}}
                      tooltip={a.value}
                      activeClass="bg-amber-600 text-white border-amber-500"
                      inactiveClass="bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-amber-500"/>
                  );
                })}
              </div>
              {accent&&<p className="text-xs text-amber-400 mt-1.5 italic">{accent}</p>}
            </Section>

            {/* Production */}
            <Section title={t.productionTitle}
              onClear={function(){clearWithUndo(t.productionTitle, function(){
                var sp=prodFx;
                setProdFx([]);
                return function(){ setProdFx(sp); };
              });}}
              id="production" isOpen={openSections.production} onToggle={function(){toggleSec("production");}}
              hasData={prodFx.length>0}>
              <div className="flex flex-wrap gap-1.5">
                {PROD_FX.map(function(f){
                  var active=prodFx.includes(f);
                  var info=PROD_FX_INFO[f];
                  return (
                    <TooltipBtn key={f} label={f} active={active}
                      onClick={function(){toggle(prodFx,setProdFx,f);}}
                      tooltip={info?(isEn?info.en:info.de):null}
                      activeClass="bg-rose-600 text-white border-rose-500"
                      inactiveClass="bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-rose-500"/>
                  );
                })}
              </div>
            </Section>

            {/* Era & Language */}
            <Section title={t.eraLabel}
              onClear={function(){clearWithUndo(t.eraLabel, function(){
                var ser=era;
                setEra("");
                return function(){ setEra(ser); };
              });}}
              id="eraLang" isOpen={openSections.eraLang} onToggle={function(){toggleSec("eraLang");}}
              hasData={!!era}>
              <select value={era} onChange={function(e){setEra(e.target.value);}}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500">
                <option value="">{t.modern}</option>
                {ERAS.map(function(er){return <option key={er} value={er}>{er}</option>;})}
              </select>
            </Section>

            {/* Structure */}
            <Section title={t.structureTitle}
              onClear={function(){clearWithUndo(t.structureTitle, function(){
                var ss=structure;
                setStructure(DEF_STRUCT.slice());
                return function(){ setStructure(ss); };
              });}}
              id="structure" isOpen={openSections.structure} onToggle={function(){toggleSec("structure");}}
              hasData={JSON.stringify(structure)!==JSON.stringify(DEF_STRUCT)}>
              <div className="space-y-1 mb-2">
                {structure.map(function(s,i){
                  return (
                    <div key={i} className="flex items-center gap-2 bg-zinc-800 rounded px-2 py-1">
                      <span className="text-zinc-500 text-xs w-4">{i+1}</span>
                      <span className="text-xs text-zinc-200 flex-1">{s}</span>
                      <div className="flex gap-1">
                        <button onClick={function(){
                          if(i>0){
                            var a=structure.slice();
                            var tmp=a[i-1];a[i-1]=a[i];a[i]=tmp;
                            setStructure(a);
                          }
                        }} className="text-zinc-600 hover:text-zinc-300 text-xs px-1">▲</button>
                        <button onClick={function(){
                          if(i<structure.length-1){
                            var a=structure.slice();
                            var tmp=a[i];a[i]=a[i+1];a[i+1]=tmp;
                            setStructure(a);
                          }
                        }} className="text-zinc-600 hover:text-zinc-300 text-xs px-1">▼</button>
                        <button onClick={function(){
                          setStructure(structure.filter(function(_,j){return j!==i;}));
                        }} className="text-red-700 hover:text-red-400 text-xs px-1">x</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <select value={addSec} onChange={function(e){setAddSec(e.target.value);}}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500">
                  {STRUCT_OPTS.map(function(o){return <option key={o}>{o}</option>;})}
                </select>
                <button onClick={function(){setStructure(structure.concat([addSec]));}}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs text-white font-medium">
                  + {t.addSection}
                </button>
              </div>
            </Section>

            {/* Lyrics & Content */}
            <Section title={isEn?"Lyrics & Content":"Lyrics & Inhalt"}
              onClear={function(){clearWithUndo(isEn?"Lyrics & Content":"Lyrics & Inhalt", function(){
                var slt=lyricThemes, slc=lyricContent, sol=ownLyrics, sts=titleSugg, sds=description;
                setLyricThemes([]); setLyricContent(""); setOwnLyrics(""); setTitleSugg(""); setDescription("");
                return function(){ setLyricThemes(slt); setLyricContent(slc); setOwnLyrics(sol); setTitleSugg(sts); setDescription(sds); };
              });}}
              id="lyrics" isOpen={openSections.lyrics} onToggle={function(){toggleSec("lyrics");}}
              hasData={!!(lyricThemes.length||lyricContent||ownLyrics||titleSugg||description)}>
              <div className="mb-4">
                <p className="text-[11px] font-medium text-zinc-400 mb-1.5">{t.lyricThemesTitle}</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {THEMES.map(function(theme){
                    var active=lyricThemes.includes(theme);
                    return (
                      <button key={theme} onClick={function(){toggle(lyricThemes,setLyricThemes,theme);}}
                        className={"px-2 py-1 rounded text-xs border transition-all "+
                          (active?"bg-teal-600 text-white border-teal-500":"bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-teal-500")}>
                        {theme}
                      </button>
                    );
                  })}
                </div>
                <textarea value={lyricContent}
                  onChange={function(e){setLyricContent(e.target.value);}}
                  placeholder={t.lyricContentPlaceholder} rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-teal-500 resize-none"/>
              </div>
              <div className="mb-4">
                <p className="text-[11px] font-medium text-zinc-400 mb-1.5">{t.ownLyricsTitle}</p>
                <textarea value={ownLyrics}
                  onChange={function(e){setOwnLyrics(e.target.value);}}
                  placeholder={t.ownLyricsPlaceholder} rows={5}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"/>
              </div>
              <div className="mb-4">
                <p className="text-[11px] font-medium text-zinc-400 mb-1">{t.titleTitle}</p>
                <p className="text-xs text-zinc-600 mb-1.5">{t.titleDesc}</p>
                <input value={titleSugg} onChange={function(e){setTitleSugg(e.target.value);}}
                  placeholder={t.titlePlaceholder}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"/>
              </div>
              <div>
                <p className="text-[11px] font-medium text-zinc-400 mb-1.5">{t.descTitle}</p>
                <textarea value={description}
                  onChange={function(e){setDescription(e.target.value);}}
                  placeholder={t.descPlaceholder} rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"/>
              </div>
            </Section>

            {/* Advanced */}
            <Section title={t.advancedTitle}
              onClear={function(){clearWithUndo(t.advancedTitle, function(){
                var sex=excludeStyle, smm=maxMode, sin=instrumental, svm=voicesMode, sw=weirdness, ssi=styleInf, saa=autoAdvanced;
                setExcludeStyle(""); setMaxMode(true); setInstrumental(false); setVoicesMode(false);
                setWeirdness(62); setStyleInf(70); setAutoAdvanced(true);
                return function(){ setExcludeStyle(sex); setMaxMode(smm); setInstrumental(sin); setVoicesMode(svm); setWeirdness(sw); setStyleInf(ssi); setAutoAdvanced(saa); };
              });}}
              id="advanced" isOpen={openSections.advanced} onToggle={function(){toggleSec("advanced");}}
              hasData={!!(excludeStyle||!maxMode||instrumental||voicesMode||weirdness!==62||styleInf!==70||!autoAdvanced)}>
              <div className="mb-4">
                <label className="text-xs font-medium text-zinc-300 block mb-1">{t.excludeLabel}</label>
                <input value={excludeStyle}
                  onChange={function(e){setExcludeStyle(e.target.value);}}
                  placeholder={t.excludePlaceholder}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-500"/>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  {val:maxMode,  set:setMaxMode,  color:"bg-indigo-600",
                   label:t.maxModeLabel, desc:t.maxModeDesc},
                  {val:instrumental, set:setInstrumental, color:"bg-teal-600",
                   label:isEn?"Instrumental":"Instrumental",
                   desc:isEn?"No vocals - music only":"Keine Vocals - nur Musik"},
                  {val:voicesMode, set:setVoicesMode, color:"bg-purple-600",
                   label:isEn?"Voices (v5.5)":"Voices (v5.5)",
                   desc:isEn?"Cloned voice - removes gender tags":"Geklonte Stimme - entfernt Gender-Tags"},
                  {val:autoAdvanced, set:setAutoAdvanced, color:"bg-emerald-600",
                   label:isEn?"Auto Mode":"Auto-Modus",
                   desc:isEn?"Claude picks Weirdness & Style Influence":"Claude wählt Weirdness & Style Influence"},
                ].map(function(item){
                  return (
                    <div key={item.label} title={item.desc}
                      className="flex flex-col bg-zinc-800 rounded-lg px-2.5 py-2 gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-zinc-200 leading-tight">{item.label}</p>
                        <Toggle value={item.val} color={item.color}
                          onToggle={function(){item.set(!item.val);}}/>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-snug">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mb-4" style={{opacity: autoAdvanced ? 0.5 : 1}}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-zinc-400">{t.weirdnessLabel}</label>
                  <span className="text-xs font-semibold text-white">{autoAdvanced ? "AUTO" : weirdness+"%"}</span>
                </div>
                <input type="range" min="0" max="100" value={weirdness}
                  disabled={autoAdvanced}
                  onChange={function(e){setWeirdness(Number(e.target.value));}}
                  className="w-full accent-indigo-500 disabled:cursor-not-allowed"/>
                <div className="flex justify-between text-xs text-zinc-600 mt-0.5">
                  <span>{t.weirdnessLeft}</span>
                  <span className="text-red-600">{t.weirdnessAvoid}</span>
                  <span>{t.weirdnessRight}</span>
                </div>
              </div>
              <div style={{opacity: autoAdvanced ? 0.5 : 1}}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-zinc-400">{t.styleInfluenceLabel}</label>
                  <span className="text-xs font-semibold text-white">{autoAdvanced ? "AUTO" : styleInf+"%"}</span>
                </div>
                <input type="range" min="0" max="100" value={styleInf}
                  disabled={autoAdvanced}
                  onChange={function(e){setStyleInf(Number(e.target.value));}}
                  className="w-full accent-purple-500 disabled:cursor-not-allowed"/>
                <div className="flex justify-between text-xs text-zinc-600 mt-0.5">
                  <span>{t.styleLeft}</span>
                  <span>{t.styleRight}</span>
                </div>
              </div>
            </Section>

            {/* Export / Import */}
            <Section title={t.exportImport}
              id="exportImport" isOpen={openSections.exportImport} onToggle={function(){toggleSec("exportImport");}}>
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-zinc-800 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"/>
                <p className="text-xs text-zinc-400">{t.autoSaved}</p>
              </div>
              <div className="flex gap-2 mb-2">
                <button onClick={exportXML}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-zinc-600 bg-zinc-800 text-zinc-300 hover:border-emerald-500 hover:text-emerald-300 transition-all">
                  📋 {t.exportXml}
                </button>
                <label className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-zinc-600 bg-zinc-800 text-zinc-300 hover:border-sky-500 hover:text-sky-300 transition-all cursor-pointer">
                  📤 {t.importXml}
                  <input type="file" accept=".xml" className="hidden"
                    onChange={function(e){importXML(e.target.files[0]);e.target.value="";}}/>
                </label>
              </div>
              {xmlExport&&(
                <div className="bg-zinc-900 border border-emerald-800 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-900">
                    <p className="text-xs text-emerald-400 font-medium">{t.copyAndSave}</p>
                    <div className="flex gap-2">
                      <button onClick={function(){
                        var w=window.open("","_blank");
                        if(w){
                          w.document.open();
                          w.document.write(
                            "<pre style='font-family:monospace;white-space:pre-wrap;padding:16px'>"+
                            xmlExport.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")+
                            "</pre>"
                          );
                          w.document.close();
                        }
                      }} className="px-2 py-1 rounded text-xs bg-zinc-700 text-zinc-300 hover:bg-zinc-600">
                        {t.openTab}
                      </button>
                      <CopyBtn text={xmlExport} label={t.copyXml} doneLabel={t.copied}/>
                      <button onClick={function(){setXmlExport("");}}
                        className="text-xs text-zinc-500 hover:text-zinc-300 px-2">✕</button>
                    </div>
                  </div>
                  <textarea readOnly value={xmlExport} rows={6}
                    className="w-full bg-zinc-900 px-3 py-2 text-xs text-zinc-400 font-mono resize-none focus:outline-none"/>
                </div>
              )}
              {importMsg&&
                <p className="text-xs mt-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
                  {importMsg}
                </p>}
            </Section>

            <div className="sticky bottom-0 -mx-4 px-4 pt-2 pb-3 bg-zinc-950 border-t border-zinc-800 z-10">
              {undoAction && (
                <div className="mb-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-between gap-2">
                  <p className="text-xs text-zinc-300 truncate">{undoAction.label}</p>
                  <button onClick={triggerUndo}
                    className="px-3 py-1 rounded text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0">
                    {isEn?"Undo":"Rückgängig"}
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] text-zinc-500 shrink-0">
                  📝 {isEn?"Lyrics in":"Lyrics auf"}:
                </span>
                <select value={lang} onChange={function(e){setLang(e.target.value);}}
                  className="bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-[11px] font-medium text-zinc-200 focus:outline-none focus:border-indigo-500">
                  {LANGUAGES.map(function(ln){return <option key={ln} value={ln}>{ln}</option>;})}
                </select>
              </div>
              <button onClick={generate} disabled={loading}
                className={"w-full py-3 rounded-lg font-semibold text-sm transition-all "+
                  (loading?"bg-zinc-700 text-zinc-500 cursor-not-allowed":"bg-indigo-600 hover:bg-indigo-500 text-white")}>
                {loading
                  ?<span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-zinc-500 border-t-indigo-400 rounded-full animate-spin"/>
                    {t.generating}
                  </span>
                  :"🎵 "+t.generateBtn}
              </button>
              {error&&<p className="text-xs text-red-400 bg-red-900 rounded p-2 mt-2">{error}</p>}
            </div>
          </div>
        )}

        {/* OUTPUT */}
        {panel==="output"&&(
          <div className="h-full overflow-y-auto flex flex-col">
            {!output&&!loading&&(
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-3xl mb-4">🎵</div>
                <h2 className="text-lg font-semibold text-zinc-300 mb-2">{t.readyTitle}</h2>
                <p className="text-sm text-zinc-500 max-w-sm">{t.readyDesc}</p>
              </div>
            )}
            {loading&&(
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin"/>
                <p className="text-sm text-zinc-400">{t.generating}</p>
              </div>
            )}
            {output&&(
              <div className="p-4">
                {history.length>1&&(
                  <div className="mb-3">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                      {isEn?"History":"Verlauf"} ({history.length})
                    </p>
                    <div className="flex gap-1.5 overflow-x-auto pb-1" style={{scrollbarWidth:"none", WebkitOverflowScrolling:"touch"}}>
                      {history.map(function(entry, i){
                        var isCurrent = output && entry.output && entry.output.lyrics===output.lyrics && entry.output.style===output.style;
                        return (
                          <button key={entry.ts}
                            onClick={function(){setOutput(entry.output); setActiveTab("lyrics");}}
                            className={"px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 border transition-all "+
                              (isCurrent?"bg-indigo-600 border-indigo-500 text-white":"bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-indigo-500 hover:text-indigo-300")}>
                            {i===0?"🎵 ":""}{entry.title}
                          </button>
                        );
                      })}
                      <button onClick={function(){if(confirm(isEn?"Clear history?":"Verlauf löschen?")) setHistory([]);}}
                        title={isEn?"Clear history":"Verlauf löschen"}
                        className="px-2 py-1 rounded-full text-[11px] shrink-0 border border-zinc-700 text-zinc-600 hover:border-red-600 hover:text-red-400">
                        🗑
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex gap-1 bg-zinc-900 rounded-lg p-1 mb-4">
                  {tabs.map(function(tab){
                    return (
                      <button key={tab.key}
                        onClick={function(){setActiveTab(tab.key);}}
                        className={"flex-1 py-1.5 rounded-md text-xs font-medium transition-all "+
                          (activeTab===tab.key?"bg-zinc-700 text-white":"text-zinc-500 hover:text-zinc-300")}>
                        {tab.icon} {tab.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end mb-2">
                  <CopyBtn
                    text={"# 1. LYRICS\n```\n"+output.lyrics+"\n```\n\n# 2. STYLE\n```\n"+output.style+"\n```\n\n# 4. TITLE\n```\n"+output.title+"\n```"}
                    label={t.copyAll} doneLabel={t.copied}/>
                </div>
                {activeTab==="lyrics"&&(
                  <div>
                    <ActionBar onRegen={regenLyrics} onOptimize={optimizeLyrics}
                      loadingRegen={loadingLyrics} loadingOptimize={optimizingLyrics} t={t}/>
                    <OutputSection title={t.lyricsTitle} subtitle={t.lyricsSubtitle}
                      icon="🎤" content={output.lyrics} t={t}/>
                  </div>
                )}
                {activeTab==="style"&&(
                  <div>
                    <ActionBar onRegen={regenStyle} onOptimize={optimizeStyle}
                      loadingRegen={loadingStyle} loadingOptimize={optimizingStyle} t={t}/>
                    <OutputSection title={t.styleTitle} subtitle={t.styleSubtitle}
                      icon="🎨" content={output.style} t={t}/>
                    <div className="mt-2 flex justify-end items-center gap-2">
                      <span className={
                        output.style.length>1000?"text-red-400 font-semibold text-xs":
                        output.style.length>850?"text-yellow-400 text-xs":"text-zinc-500 text-xs"}>
                        {output.style.length} / 1000 {t.chars}
                      </span>
                      {output.style.length>1000&&
                        <span className="text-xs text-red-400">{t.tooLong}</span>}
                    </div>
                  </div>
                )}
                {activeTab==="meta"&&(
                  <div className="space-y-4">
                    <AdvancedDisplay content={output.advanced} t={t} isEn={isEn}/>
                    <OutputSection title={t.titleSectionTitle} subtitle={t.titleSectionSubtitle}
                      icon="✏️" content={output.title} t={t}/>
                  </div>
                )}
                {activeTab==="all"&&(
                  <div className="space-y-4">
                    <OutputSection title={t.lyricsTitle} subtitle={t.lyricsSubtitle}
                      icon="🎤" content={output.lyrics} t={t}/>
                    <OutputSection title={t.styleTitle} subtitle={t.styleSubtitle}
                      icon="🎨" content={output.style} t={t}/>
                    <AdvancedDisplay content={output.advanced} t={t} isEn={isEn}/>
                    <OutputSection title={t.titleSectionTitle} subtitle={t.titleSectionSubtitle}
                      icon="✏️" content={output.title} t={t}/>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}