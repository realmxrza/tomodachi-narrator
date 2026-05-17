import { ConnectSrc, CspPolicies } from "@main/csp";
import { IpcMainInvokeEvent } from "electron";


CspPolicies["talkmodachi.dylanpdx.io"] = ConnectSrc;

export async function fetchTtsAudio(_: IpcMainInvokeEvent, url: string): Promise<{
    ok: boolean;
    status: number;
    contentType?: string;
    base64?: string;
    error?: string;
}> {
    try {
        const res = await fetch(url, {
            method: "GET",
            headers: { "Accept": "audio/wav, audio/*" }
        });
        if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status} ${res.statusText}` };

        const buf = Buffer.from(await res.arrayBuffer());
        return {
            ok: true,
            status: res.status,
            contentType: res.headers.get("content-type") ?? "audio/wav",
            base64: buf.toString("base64")
        };
    } catch (e: any) {
        return { ok: false, status: -1, error: String(e?.message ?? e) };
    }
}
