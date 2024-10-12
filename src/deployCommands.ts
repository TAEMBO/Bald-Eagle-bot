import { API } from "@discordjs/core/http-only";
import { InteractionContextType, REST, type RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { isValidCommand } from "#actions";
import { log } from "#util";

const api = new API(new REST().setToken(process.env.DISCORD_TOKEN!));
const commandFolders = await readdir(new URL("./commands", import.meta.url));
const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

for (const folder of commandFolders) {
    const commandFiles = await readdir(new URL(join("./commands", folder), import.meta.url));

    for (const file of commandFiles) {
        const commandPath = new URL(join("./commands", folder, file), import.meta.url);
        const { default: commandFile } = await import(commandPath.toString());

        if (!isValidCommand(commandFile)) {
            log("Red", `${file} not Command`);
    
            continue;
        }

        commandFile.data.contexts = [InteractionContextType.Guild];

        commands.push(commandFile.data);
    }
}

const data = await api.applicationCommands.bulkOverwriteGlobalCommands(process.env.APPLICATION_ID!, commands);

log("Purple", `${data.length} application commands registered`);