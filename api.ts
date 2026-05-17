import { Logger } from "@utils/Logger";
import { PluginNative } from "@utils/types";

import { BUILTIN_PRESETS } from "./presets";
import { settings } from "./settings";

const logger = new Logger("TomodachiNarrator");
const API_BASE = "https://talkmodachi.dylanpdx.io/tts";

const Native = (typeof VencordNative !== "undefined"
    ? (VencordNative.pluginHelpers as any)?.["Tomodachi Narrator"]
    : undefined) as PluginNative<typeof import("./native")> | undefined;

let currentAudio: HTMLAudioElement | null = null;
let toneCounter = 0;
let lastRandomTone = 0;
let isSpeaking = false;

interface QueueItem {
    text: string;
    eventType?: string;
}
const queue: QueueItem[] = [];

const EVENT_TONE_MAP: Record<string, number> = {
    join: 1,
    leave: 2,
    move: 3,
    mute: 4,
    unmute: 4,
    deafen: 4,
    undeafen: 4
};

function clamp(n: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, n));
}

function resolveTone(eventType?: string): number {
    const mode = (settings.store as any).autoToneMode as string;
    switch (mode) {
        case "cycle":
            toneCounter = (toneCounter % 4) + 1;
            return toneCounter;
        case "random": {
            // Avoid immediately repeating the same tone
            let pick = Math.floor(Math.random() * 4) + 1;
            if (pick === lastRandomTone) pick = (pick % 4) + 1;
            lastRandomTone = pick;
            return pick;
        }
        case "per-event":
            if (eventType && EVENT_TONE_MAP[eventType]) return EVENT_TONE_MAP[eventType];
            return clamp(Number((settings.store as any).intonation) || 1, 1, 4);
        case "off":
        default:
            return clamp(Number((settings.store as any).intonation) || 1, 1, 4);
    }
}

interface VoiceParams {
    pitch: number;
    speed: number;
    quality: number;
    tone: number;
    accent: number;
    intonation: number;
}

function buildVoiceParams(eventType?: string): VoiceParams {
    const s = settings.store as any;
    const usePreset = !!s.usePreset;
    const preset = usePreset ? BUILTIN_PRESETS[s.preset as string] : null;

    return {
        pitch:   clamp(preset ? preset.pitch   : Number(s.pitch),   0, 100),
        speed:   clamp(preset ? preset.speed   : Number(s.speed),   0, 100),
        quality: clamp(preset ? preset.quality : Number(s.quality), 0, 100),
        tone:    clamp(preset ? preset.tone    : Number(s.tone),    0, 100),
        accent:  clamp(preset ? preset.accent  : Number(s.accent),  0, 100),
        intonation: resolveTone(eventType)
    };
}

export function resetToneCounter() {
    toneCounter = 0;
    lastRandomTone = 0;
}

export function stopAll() {
    queue.length = 0;
    if (currentAudio) {
        try { currentAudio.pause(); } catch { /* ignore */ }
        currentAudio = null;
    }
    isSpeaking = false;
}

export function speak(text: string, eventType?: string) {
    if (!text) return;
    queue.push({ text, eventType });
    if (!isSpeaking) void processQueue();
}

async function processQueue() {
    isSpeaking = true;
    try {
        while (queue.length) {
            const item = queue.shift()!;
            try {
                await playOne(item.text, item.eventType);
            } catch (e) {
                logger.error("Failed to play TTS for:", item.text, e);
            }
        }
    } finally {
        isSpeaking = false;
    }
}

function truncateForLang(text: string, lang: string): string {
    const max = lang === "jp" ? 1024 : 2000;
    return text.length > max ? text.slice(0, max) : text;
}

function base64ToBlob(base64: string, contentType: string): Blob {
    const binStr = atob(base64);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
    return new Blob([bytes], { type: contentType });
}

async function fetchAudioBlob(url: string): Promise<Blob> {
    if (Native) {
        const r = await Native.fetchTtsAudio(url);
        if (!r.ok || !r.base64) throw new Error(r.error ?? `native fetch failed (status ${r.status})`);
        return base64ToBlob(r.base64, r.contentType ?? "audio/wav");
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`TTS request failed: ${res.status} ${res.statusText}`);
    return await res.blob();
}

async function playOne(text: string, eventType?: string): Promise<void> {
    const s = settings.store as any;
    const lang = (s.language as string) || "useng";
    const params = buildVoiceParams(eventType);

    const url = new URL(API_BASE);
    url.searchParams.set("text", truncateForLang(text, lang));
    url.searchParams.set("lang", lang);
    url.searchParams.set("pitch", String(params.pitch));
    url.searchParams.set("speed", String(params.speed));
    url.searchParams.set("quality", String(params.quality));
    url.searchParams.set("tone", String(params.tone));
    url.searchParams.set("accent", String(params.accent));
    url.searchParams.set("intonation", String(params.intonation));

    const blob = await fetchAudioBlob(url.toString());
    const objUrl = URL.createObjectURL(blob);

    await new Promise<void>(resolve => {
        const audio = new Audio(objUrl);
        currentAudio = audio;
        audio.volume = clamp(Number(s.volume), 0, 1);
        const cleanup = () => {
            URL.revokeObjectURL(objUrl);
            if (currentAudio === audio) currentAudio = null;
            resolve();
        };
        audio.onended = cleanup;
        audio.onerror = () => {
            logger.warn("Audio element reported an error during playback");
            cleanup();
        };
        audio.play().catch(err => {
            logger.error("audio.play() rejected:", err);
            cleanup();
        });
    });
}
