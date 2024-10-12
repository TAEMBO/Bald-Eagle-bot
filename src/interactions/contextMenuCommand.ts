import { ERR_TEXT, log } from "#util";
import type { CombinedContextMenuCommandInteraction } from "#types";

export async function handleContextMenuCommand(interaction: CombinedContextMenuCommandInteraction) {
    const command = interaction.client.contextMenuCommands.get(interaction.commandName);
    
    if (!command) {
        await interaction.reply(ERR_TEXT);
        return log("Red", `ContextMenu - missing command: ${interaction.commandName}`);
    }

    log("White", `\x1b[32m${interaction.user.tag}\x1b[37m used \x1b[32m${interaction.commandName}\x1b[37m in \x1b[32m#${interaction.channel!.name}`);

    try {
        await command.run(interaction);
    } catch (err: any) {
        log("Red", err);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(ERR_TEXT);
        } else {
            await interaction.reply(ERR_TEXT);
        }
    }
}