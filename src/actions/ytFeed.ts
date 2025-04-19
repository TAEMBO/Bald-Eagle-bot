import { ChannelType, roleMention, type Client } from "discord.js";
import { createHmac } from "node:crypto";
import { URLSearchParams } from "node:url";
import type { Request } from "express-serve-static-core";
import cron from "node-cron";
import polka from "polka";
import { formatTime, jsonFromXML, log, NEW_UPLOADS_CHANNEL_ID, NOTIFICATIONS_ROLE_ID } from "#util";
import type { YTFeedData } from "#types";

async function parseBody(req: Request) {
    let data = "";

    for await (const chunk of req) data += chunk;
    
    return data;
}

const MAX_CACHE_AGE = 86_400_000;

export function ytFeed(client: Client) {
    const server = polka();

    server.get("/", (req, res) => {
        if (!req.query["hub.topic"] || !req.query["hub.mode"] || !req.query["hub.challenge"]) {
            log("Yellow", "YTFeed invalid GET");

            return void res.writeHead(400).end();
        }

        const leaseTime = formatTime(parseInt(req.query["hub.lease_seconds"] as string, 10) * 1_000, 5);

        log("Green", `YTFeed valid GET with ${leaseTime} lease time, echoing`);

        res.writeHead(200).end(req.query["hub.challenge"]);
    });

    server.post("/", async (req, res) => {
        const rawBody = await parseBody(req);
        const signatureHeader = req.headers["x-hub-signature"];

        if (!signatureHeader || Array.isArray(signatureHeader)) {
            log("Yellow", "YTFeed invalid header");

            return void res.writeHead(403).end();
        }
    
        const [algo, signature] = signatureHeader.split("=");
        let hmac;
    
        try {
            hmac = createHmac(algo, process.env.YT_FEED_SECRET!);
        } catch (e) {
            log("Yellow", "YTFeed invalid sig");

            return void res.writeHead(403).end();
        }

        if (hmac.update(rawBody).digest("hex").toLowerCase() !== signature) {
            log("Yellow", "YTFeed mismatched sig");

            return void res.writeHead(403).end();
        }

        res.writeHead(200).end();

        const data = jsonFromXML<YTFeedData>(rawBody);
        const videoId = data.feed.entry["yt:videoId"]._text;
        const publishUnix = new Date(data.feed.entry.published._text).getTime();

        if ((Date.now() - publishUnix) > MAX_CACHE_AGE) return log("Yellow", `Skipped ${videoId}; age over ${MAX_CACHE_AGE.toLocaleString()}ms`);
        
        if (client.ytCache.has(videoId)) return log("Yellow", `Skipped ${videoId}; already cached`);

        client.ytCache.add(videoId);

        setTimeout(() => client.ytCache.delete(videoId), MAX_CACHE_AGE);

        const channel = client.channels.cache.get(NEW_UPLOADS_CHANNEL_ID);

        if (channel?.type !== ChannelType.GuildAnnouncement) return log("Red", "YTFeed invalid channel:", channel?.type);

        const videoURL = (Array.isArray(data.feed.entry.link) ? data.feed.entry.link[0] : data.feed.entry.link)._attributes.href;
        const msg = await channel.send(`${roleMention(NOTIFICATIONS_ROLE_ID)}\n${videoURL}`);
        
        await msg.crosspost();
    });

    server.listen(process.env.YT_FEED_PORT!, () => log("Purple", "YTFeed listening on port", process.env.YT_FEED_PORT));

    cron.schedule("0 0 * * WED", async () => {
        for (const channelId of process.env.YT_FEED_CHANNELIDS!.split(":")) {
            const res = await fetch(
                "https://pubsubhubbub.appspot.com/subscribe",
                {
                    method: "POST",
                    body: new URLSearchParams({
                        "hub.callback": process.env.YT_FEED_CALLBACK!,
                        "hub.topic": "https://www.youtube.com/xml/feeds/videos.xml?channel_id=" + channelId,
                        "hub.verify": "sync",
                        "hub.mode": "subscribe",
                        "hub.secret": process.env.YT_FEED_SECRET!,
                        "hub.lease_seconds": "864000"
                    })
                }
            );
            
            log("Yellow", `YTFeed lease renew for ${channelId}:`, res.status);
        }
    }, { timezone: "UTC" });
}