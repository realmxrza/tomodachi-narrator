import { Margins } from "@utils/margins";
import { wordsToTitle } from "@utils/text";
import definePlugin, { ReporterTestable } from "@utils/types";
import {
    AuthenticationStore,
    Button,
    ChannelStore,
    Forms,
    GuildMemberStore,
    SelectedChannelStore,
    SelectedGuildStore,
    useMemo,
    UserStore,
    VoiceStateStore
} from "@webpack/common";

import { resetToneCounter, speak, stopAll } from "./api";
import { settings } from "./settings";

interface VoiceState {
    userId: string;
    channelId?: string;
    oldChannelId?: string;
    deaf: boolean;
    mute: boolean;
    selfDeaf: boolean;
    selfMute: boolean;
    sessionId: string;
}

function clean(s: string) {
    const re = settings.store.latinOnly
        ? /[^\p{Script=Latin}\p{Number}\p{Punctuation}\s]/gu
        : /[^\p{Letter}\p{Number}\p{Punctuation}\s]/gu;
    return s.normalize("NFKC").replace(re, "").replace(/_{2,}/g, "_").trim();
}

function fill(tpl: string, user: string, channel: string, display: string, nickname: string) {
    return tpl
        .replaceAll("{{USER}}", clean(user) || (user ? "Someone" : ""))
        .replaceAll("{{CHANNEL}}", clean(channel) || "channel")
        .replaceAll("{{DISPLAY_NAME}}", clean(display) || (display ? "Someone" : ""))
        .replaceAll("{{NICKNAME}}", clean(nickname) || (nickname ? "Someone" : ""));
}

function pickName(userId: string, guildId: string | null): string {
    const u = UserStore.getUser(userId) as any;
    if (!u) return "";
    const username = u.username ?? "";
    const display = u.globalName ?? username;
    const nickname = (guildId && GuildMemberStore.getNick(guildId, userId)) || display;

    switch (settings.store.nameSource as string) {
        case "username": return username;
        case "nickname": return nickname;
        case "display":
        default:         return display;
    }
}

let myLastChannelId: string | undefined;

function getTypeAndChannelId({ channelId, oldChannelId }: VoiceState, isMe: boolean) {
    if (isMe && channelId !== myLastChannelId) {
        oldChannelId = myLastChannelId;
        myLastChannelId = channelId;
    }
    if (channelId !== oldChannelId) {
        if (channelId)    return [oldChannelId ? "move" : "join", channelId] as const;
        if (oldChannelId) return ["leave", oldChannelId] as const;
    }
    return ["", ""] as const;
}

function playSample(type: string) {
    const me = UserStore.getCurrentUser();
    const guildId = SelectedGuildStore.getGuildId();
    const display = (me as any).globalName ?? me.username;
    const nickname = (guildId && GuildMemberStore.getNick(guildId, me.id)) || display;

    speak(
        fill(
            (settings.store as any)[type + "Message"],
            pickName(me.id, guildId),
            "general",
            display,
            nickname
        ),
        type
    );
}

export default definePlugin({
    name: "Tomodachi Narrator",
    description: "Tomodachi Life narrator for voice channels. Client Sided",
    tags: ["Voice", "Accessibility"],
    authors: [{ name: "slushieye", id: 1348602887986745385n }],
    reporterTestable: ReporterTestable.None,

    settings,

    flux: {
        VOICE_STATE_UPDATES({ voiceStates }: { voiceStates: VoiceState[]; }) {
            const guildId = SelectedGuildStore.getGuildId();
            const myChan = SelectedChannelStore.getVoiceChannelId();
            const myId = UserStore.getCurrentUser().id;

            if (ChannelStore.getChannel(myChan!)?.type === 13) return;

            for (const state of voiceStates) {
                const { userId, channelId, oldChannelId } = state;
                const isMe = userId === myId;
                if (isMe && state.sessionId !== AuthenticationStore.getSessionId()) continue;
                if (!isMe) {
                    if (!myChan) continue;
                    if (channelId !== myChan && oldChannelId !== myChan) continue;
                }

                const [type, id] = getTypeAndChannelId(state, isMe);
                if (!type) continue;

                const tpl = (settings.store as any)[type + "Message"];
                const user = isMe && !settings.store.sayOwnName ? "" : pickName(userId, guildId);
                const u = UserStore.getUser(userId) as any;
                const display = user && (u?.globalName ?? u?.username ?? "");
                const nickname = user && (GuildMemberStore.getNick(guildId!, userId) ?? display);
                const channelName = ChannelStore.getChannel(id).name;

                speak(fill(tpl, user, channelName, display, nickname), type);
            }
        },

        AUDIO_TOGGLE_SELF_MUTE() {
            const chan = SelectedChannelStore.getVoiceChannelId()!;
            const s = VoiceStateStore.getVoiceStateForChannel(chan);
            if (!s) return;
            const ev = s.mute || s.selfMute ? "unmute" : "mute";
            speak(fill((settings.store as any)[ev + "Message"], "", ChannelStore.getChannel(chan).name, "", ""), ev);
        },

        AUDIO_TOGGLE_SELF_DEAF() {
            const chan = SelectedChannelStore.getVoiceChannelId()!;
            const s = VoiceStateStore.getVoiceStateForChannel(chan);
            if (!s) return;
            const ev = s.deaf || s.selfDeaf ? "undeafen" : "deafen";
            speak(fill((settings.store as any)[ev + "Message"], "", ChannelStore.getChannel(chan).name, "", ""), ev);
        }
    },

    start() {
        resetToneCounter();
    },

    stop() {
        stopAll();
    },

    settingsAboutComponent() {
        const types = useMemo(
            () => Object.keys(settings.def).filter(k => k.endsWith("Message")).map(k => k.slice(0, -7)),
            []
        );

        return (
            <section>
                <Forms.FormText>
                    Plays Tomodachi Life style narration for voice channel events. Audio comes from{" "}
                    <a href="https://talkmodachi.dylanpdx.io/" target="_blank" rel="noreferrer noopener">talkmodachi</a>{" "}
                    and is played locally on your machine — nobody else in the call hears it.
                </Forms.FormText>
                <Forms.FormText className={Margins.top8}>
                    Pick a preset for the classic Mii voices, or turn off <i>Use a built-in voice preset</i> and tweak the sliders yourself.
                </Forms.FormText>
                <Forms.FormText className={Margins.top8}>
                    Placeholders: <code>{"{{USER}}"}</code>, <code>{"{{DISPLAY_NAME}}"}</code>, <code>{"{{NICKNAME}}"}</code>, <code>{"{{CHANNEL}}"}</code>. Leave a message blank to disable that event.
                </Forms.FormText>

                <Forms.FormTitle className={Margins.top20} tag="h3">Play example</Forms.FormTitle>
                <div
                    style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}
                    className="vc-tomodachi-narrator-buttons"
                >
                    {types.map(t => (
                        <Button key={t} onClick={() => playSample(t)}>
                            {wordsToTitle([t])}
                        </Button>
                    ))}
                </div>
            </section>
        );
    }
});
