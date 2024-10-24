import { AttachmentBuilder, ChannelType, type Client } from "discord.js";
import { createHmac } from "node:crypto";
import type { Request } from "express-serve-static-core";
import polka from "polka";
import { jsonFromXML, log } from "#util";
import type { YTFeedData } from "#types";

async function parseBody(req: Request) {
    let data = "";

    for await (const chunk of req) data += chunk;
    
    return data;
}

export function ytFeed(client: Client) {
    const server = polka();

    server.get("/", (req, res) => {
        if (!req.query["hub.topic"] || !req.query["hub.mode"] || !req.query["hub.challenge"]) {
            log("Yellow", "Invalid GET");

            return void res.writeHead(400).end();
        }

        log("Green", "Valid GET, echoing");

        res.writeHead(200).end(req.query["hub.challenge"]);
    });

    server.post("/", async (req, res) => {
        const rawBody = await parseBody(req);
        const signatureHeader = req.headers["x-hub-signature"];

        if (!signatureHeader || Array.isArray(signatureHeader)) {
            log("Yellow", "Invalid YTFeed header");

            return void res.writeHead(403).end();
        }
    
        const [algo, signature] = signatureHeader.split("=");
        let hmac;
    
        try {
            hmac = createHmac(algo, process.env.YT_FEED_SECRET!);
        } catch (e) {
            log("Yellow", "Invalid YTFeed sig");

            return void res.writeHead(403).end();
        }

        if (hmac.update(rawBody).digest("hex").toLowerCase() !== signature) {
            log("Yellow", "Mismatched YTFeed sig");

            return void res.writeHead(403).end();
        }

        res.writeHead(200);

        const data = jsonFromXML<YTFeedData>(rawBody);
        const channel = client.channels.cache.get("1293725255294124032");

        if (channel?.type !== ChannelType.GuildText) {
            log("Red", "Invalid YTFeed channel:", channel?.type);

            return void res.end();
        }

        log("Green", "Valid POST, notifying");

        await channel.send({
            content: data.feed.entry.link._attributes.href,
            files: [new AttachmentBuilder(Buffer.from(JSON.stringify(data, null, 4)), { name: "data.json" })]
        });

        res.end();
    });

    server.listen(process.env.YT_FEED_PORT!, () => log("Purple", "YT Feed listening on port", process.env.YT_FEED_PORT));
}