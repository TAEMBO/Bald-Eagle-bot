import { roleMention, type ButtonInteraction } from "discord.js";
import { UNVERIFIED_ROLE_ID, VERIFIED_ROLE_ID } from "#util";

export async function handleButton(interaction: ButtonInteraction<"cached">) {
    if (interaction.customId === "verify") {
        if (interaction.member.roles.cache.has(VERIFIED_ROLE_ID)) {
            return interaction.reply({ content: "You have already verified!", ephemeral: true });
        }

        await Promise.all([
            interaction.member.roles.set([...interaction.member.roles.cache.keys(), VERIFIED_ROLE_ID].filter(x => x !== UNVERIFIED_ROLE_ID)),
            interaction.reply({ content: "You have successfully verified!", ephemeral: true })
        ]);
    } else if (interaction.customId.startsWith("roles-")) {
        const roleId = interaction.customId.split("-")[1];

        if (interaction.member.roles.cache.has(roleId)) {
            await Promise.all([
                interaction.member.roles.remove(roleId),
                interaction.reply({ content: `Successfully removed from ${roleMention(roleId)}!`, ephemeral: true })
            ]);
        } else {
            await Promise.all([
                interaction.member.roles.add(roleId),
                interaction.reply({ content: `Successfully added to ${roleMention(roleId)}!`, ephemeral: true })
            ]);
        }
    }
}