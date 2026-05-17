import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

import { resetToneCounter } from "./api";
import { BUILTIN_PRESETS, LANGUAGES } from "./presets";

const presetOptions = Object.entries(BUILTIN_PRESETS).map(([value, p], i) => ({
    label: p.name,
    value,
    default: i === 0
}));

const languageOptions = LANGUAGES.map((l, i) => ({
    label: l.label,
    value: l.value,
    default: i === 0
}));

const slider100 = (description: string) => ({
    type: OptionType.SLIDER as const,
    description,
    default: 50,
    markers: [0, 25, 50, 75, 100],
    stickToMarkers: false
});

export const settings = definePluginSettings({
    usePreset: {
        type: OptionType.BOOLEAN,
        description: "Use a built-in voice preset (uncheck to use the sliders below)",
        default: true
    },
    preset:   { type: OptionType.SELECT, description: "Voice preset",   options: presetOptions },
    language: { type: OptionType.SELECT, description: "Voice language / ROM region", options: languageOptions },

    autoToneMode: {
        type: OptionType.SELECT,
        description: "Auto tone switching (intonation 1-4)",
        options: [
            { label: "Off",                          value: "off", default: true },
            { label: "Cycle 1 → 2 → 3 → 4",          value: "cycle" },
            { label: "Random (no immediate repeat)", value: "random" },
            { label: "Per event type",               value: "per-event" }
        ],
        onChange: () => resetToneCounter()
    },
    intonation: {
        type: OptionType.SLIDER,
        description: "Fixed intonation (used when auto tone is Off)",
        default: 1,
        markers: [1, 2, 3, 4],
        stickToMarkers: true
    },

    pitch:   slider100("Pitch"),
    speed:   slider100("Speed"),
    quality: slider100("Quality"),
    tone:    slider100("Tone"),
    accent:  slider100("Accent"),

    volume: {
        type: OptionType.SLIDER,
        description: "Playback volume",
        default: 1,
        markers: [0, 0.25, 0.5, 0.75, 1],
        stickToMarkers: false
    },

    nameSource: {
        type: OptionType.SELECT,
        description: "Which name to announce — controls what {{USER}} resolves to",
        options: [
            { label: "Display name only",                            value: "display", default: true },
            { label: "Server nickname (falls back to display name)", value: "nickname" },
            { label: "Username (the @handle)",                       value: "username" }
        ]
    },
    sayOwnName: { type: OptionType.BOOLEAN, description: "Say your own name on your own events", default: false },
    latinOnly:  { type: OptionType.BOOLEAN, description: "Strip non-Latin characters from names", default: false },

    joinMessage:     { type: OptionType.STRING, description: "Join message",     default: "{{USER}} joined" },
    leaveMessage:    { type: OptionType.STRING, description: "Leave message",    default: "{{USER}} left" },
    moveMessage:     { type: OptionType.STRING, description: "Move message",     default: "{{USER}} moved to {{CHANNEL}}" },
    muteMessage:     { type: OptionType.STRING, description: "Mute message",     default: "{{USER}} muted" },
    unmuteMessage:   { type: OptionType.STRING, description: "Unmute message",   default: "{{USER}} unmuted" },
    deafenMessage:   { type: OptionType.STRING, description: "Deafen message",   default: "{{USER}} deafened" },
    undeafenMessage: { type: OptionType.STRING, description: "Undeafen message", default: "{{USER}} undeafened" }
});
