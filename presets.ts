export interface VoicePreset {
    name: string;
    pitch: number;
    speed: number;
    quality: number;
    tone: number;
    accent: number;
    intonation: number;
}

// values mirror dylanpdx/talkmodachi (web/manageVoices.js)
export const BUILTIN_PRESETS: Record<string, VoicePreset> = {
    youngm: { name: "Young Man",   pitch: 60, speed: 59, quality: 72, tone: 25, accent: 25, intonation: 1 },
    youngf: { name: "Young Woman", pitch: 83, speed: 65, quality: 78, tone: 25, accent: 25, intonation: 1 },
    adultm: { name: "Adult Man",   pitch: 33, speed: 52, quality: 39, tone: 25, accent: 25, intonation: 1 },
    adultf: { name: "Adult Woman", pitch: 68, speed: 39, quality: 58, tone: 25, accent: 25, intonation: 1 },
    oldm:   { name: "Old Man",     pitch: 25, speed: 29, quality: 39, tone: 15, accent: 25, intonation: 1 },
    oldf:   { name: "Old Woman",   pitch: 67, speed: 18, quality: 69, tone: 12, accent: 42, intonation: 1 }
};

export const LANGUAGES = [
    { value: "useng", label: "US English" },
    { value: "eueng", label: "EU English" },
    { value: "es",    label: "Spanish"    },
    { value: "de",    label: "German"     },
    { value: "fr",    label: "French"     },
    { value: "it",    label: "Italian"    },
    { value: "jp",    label: "Japanese"   },
    { value: "kr",    label: "Korean"     }
];
