import { Event } from "#structures";
import { log } from "#util";
import { Events } from "discord.js";

export default new Event({
    name: Events.ClientReady,
    once: true,
    async run(client) {
        log("Blue", `Bot active as ${client.user.tag}`);
    }
});