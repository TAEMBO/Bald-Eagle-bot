import { roleMention, type Client } from "discord.js";
import { jsonFromXML, log, NEW_UPLOADS_CHANNEL_ID, NOTIFICATIONS_ROLE_ID } from "#util";
import type { YTCacheFeed } from "#types";

export async function ytLoop(client: Client) {
    const res = await fetch(
        "https://www.youtube.com/feeds/videos.xml?channel_id=UCh8f8vssLddD2PbnU3Ag_Bw",
        { signal: AbortSignal.timeout(5_000) }
    ).catch(() => log("Red", "YTLoop fetch fail"));
    let data;

    if (!res) return;

    try {
        data = jsonFromXML<YTCacheFeed>(await res.text());
    } catch (err) {
        return log("Red", "YTLoop parse fail");
    }

    const latestVid = data.feed.entry[0];

    if (!client.ytCache) {
        client.ytCache = latestVid["yt:videoId"]._text;

        return;
    }

    if (data.feed.entry[1]["yt:videoId"]._text !== client.ytCache) return;

    client.ytCache = latestVid["yt:videoId"]._text;

    const channel = client.channels.cache.get(NEW_UPLOADS_CHANNEL_ID);

    if (!channel?.isSendable()) return log("Red", "Unable to send YTLoop notification to channel");

    await channel.send(`${roleMention(NOTIFICATIONS_ROLE_ID)}\n${latestVid.link._attributes.href}`);
}
