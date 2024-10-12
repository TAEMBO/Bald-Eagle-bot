import type { ButtonInteraction } from "discord.js";
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
    }
}