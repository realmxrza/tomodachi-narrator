# Tomodachi Narrator

A [Vencord](https://github.com/Vendicated/Vencord) plugin that narrates voice channel events using Tomodachi Life style TTS voices, powered by [talkmodachi](https://talkmodachi.dylanpdx.io/) by [dylanpdx](https://github.com/dylanpdx/talkmodachi).

**client side only** nobody else in the call hears it.

## Features

- 6 Mii voice presets: Young Man, Young Woman, Adult Man, Adult Woman, Old Man, Old Woman
- Full custom voice: pitch, speed, quality, tone, accent, intonation (0-100)
- 8 languages: US/EU English, Spanish, German, French, Italian, Japanese, Korean
- Auto tone switching — cycle / random / per-event
- Pick which name to announce: display name (default), server nickname, or username
- Configurable messages for join / leave / move / mute / unmute / deafen / undeafen
- Placeholders: `{{USER}}`, `{{DISPLAY_NAME}}`, `{{NICKNAME}}`, `{{CHANNEL}}`

## Install

You need [Vencord built from source](https://docs.vencord.dev/installing/).

```bash
git clone https://github.com/realmxrza/tomodachi-narrator src/userplugins/tomodachiNarrator
pnpm build
```

(`pnpm inject`) Enable **Tomodachi Narrator** in plugin settings.

## Settings

| Setting | What it does |
|---|---|
| Use a built-in voice preset | Toggle between presets and the manual sliders |
| Voice preset | Built-in Mii voice to use |
| Voice language | controls accent |
| Auto tone switching | Off / Cycle / Random / Per event type |
| Intonation | Fixed 1-4 used when auto tone is Off |
| Pitch / Speed / Quality / Tone / Accent | Manual voice sliders (0-100) when preset is off |
| Volume | Playback volume |
| Name to announce | Display name / server nickname / username |
| Say own name | option to say your name |
| Latin only | Strip non-Latin characters from names |
| Join/Leave/Move/Mute/Unmute/Deafen/Undeafen Message | Templates with placeholders |


## Credits

- Voice synthesis & values: [dylanpdx/talkmodachi](https://github.com/dylanpdx/talkmodachi)
- Event handling structure inspired by Vencord's built-in [VcNarrator](https://github.com/Vendicated/Vencord/tree/main/src/plugins/vcNarrator) plugin

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
