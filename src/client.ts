import { Client, Collection, GatewayIntentBits } from "discord.js";
import type { Command } from "#structures";

export class TClient extends Client<true> {
    public readonly chatInputCommands = new Collection<string, Command<"chatInput">>();
    public readonly contextMenuCommands = new Collection<string, Command<"message" | "user">>();
    public readonly ytCache = new Set<string>();

    public constructor() {
        super({
            intents: [GatewayIntentBits.Guilds]
        });
    }
}