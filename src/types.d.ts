import type { Collection, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";
import type { Command } from "#structures";

declare module "discord.js" {
    interface Client {
        readonly chatInputCommands: Collection<string, Command<"chatInput">>;
        readonly contextMenuCommands: Collection<string, Command<"message" | "user">>;
    }
}

export type CombinedContextMenuCommandInteraction = MessageContextMenuCommandInteraction<"cached"> | UserContextMenuCommandInteraction<"cached">;