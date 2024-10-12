import type { ChatInputCommandInteraction } from "discord.js";
import { ERR_TEXT, log } from "#util";

export async function handleChatInputCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const subCmd = interaction.options.getSubcommand(false);
    const command = interaction.client.chatInputCommands.get(interaction.commandName);

    if (!command) {
        await interaction.reply(ERR_TEXT);
        return log("Red", `ChatInput - missing command: /${interaction.commandName}`);
    }

    log("White", `\x1b[32m${interaction.user.tag}\x1b[37m used \x1b[32m/${interaction.commandName} ${subCmd ?? ""}\x1b[37m in \x1b[32m#${interaction.channel!.name}`);

    try {
        await command.run(interaction);
    } catch (err) {
        log("Red", err);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(ERR_TEXT);
        } else {
            await interaction.reply(ERR_TEXT);
        }
    }
}