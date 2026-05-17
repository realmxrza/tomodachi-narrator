# Tomodachi Narrator

A [Vencord](https://github.com/Vendicated/Vencord) plugin that narrates voice channel events using Tomodachi Life style TTS voices, powered by [talkmodachi](https://talkmodachi.dylanpdx.io/) by [dylanpdx](https://github.com/dylanpdx/talkmodachi).

Plays **locally only** — nobody else in the call hears it.

## Features

- 6 built-in Mii voice presets: Young Man, Young Woman, Adult Man, Adult Woman, Old Man, Old Woman
- Full custom voice: pitch, speed, quality, tone, accent, intonation (0-100)
- 8 ROM languages: US/EU English, Spanish, German, French, Italian, Japanese, Korean
- Auto tone switching — cycle / random / per-event
- Pick which name to announce: display name (default), server nickname, or username
- Configurable messages for join / leave / move / mute / unmute / deafen / undeafen
- Placeholders: `{{USER}}`, `{{DISPLAY_NAME}}`, `{{NICKNAME}}`, `{{CHANNEL}}`

## Install

You need [Vencord built from source](https://docs.vencord.dev/installing/) (the regular installer doesn't support user plugins).

From the root of your Vencord checkout:

```bash
git clone https://github.com/realmxrza/tomodachi-narrator src/userplugins/tomodachiNarrator
pnpm build
```

Then re-inject Vencord (`pnpm inject`) or just restart Discord if you already had it injected. Enable **Tomodachi Narrator** in plugin settings.

## Settings

| Setting | What it does |
|---|---|
| Use a built-in voice preset | Toggle between presets and the manual sliders |
| Voice preset | Which built-in Mii voice to use |
| Voice language | ROM region — controls accent/phonemes |
| Auto tone switching | Off / Cycle / Random / Per event type |
| Intonation | Fixed 1-4 used when auto tone is Off |
| Pitch / Speed / Quality / Tone / Accent | Manual voice sliders (0-100) when preset is off |
| Volume | Playback volume |
| Name to announce | Display name / server nickname / username |
| Say own name | Whether to narrate your own events |
| Latin only | Strip non-Latin characters from names |
| Join/Leave/Move/Mute/Unmute/Deafen/Undeafen Message | Templates with placeholders |

## Notes

- TTS audio is fetched from `talkmodachi.dylanpdx.io` and played through an `<audio>` element on your machine. The Discord voice connection is never touched, so other people in the call will not hear it. If you want everyone in the call to hear the narration, run a TTS bot inside the channel instead — that's a separate piece of software.
- On Discord Desktop the request goes through the main process to bypass Discord's CSP. The included `native.ts` whitelists the host.

## Credits

- Voice synthesis & values: [dylanpdx/talkmodachi](https://github.com/dylanpdx/talkmodachi)
- Event handling structure inspired by Vencord's built-in [VcNarrator](https://github.com/Vendicated/Vencord/tree/main/src/plugins/vcNarrator) plugin

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
