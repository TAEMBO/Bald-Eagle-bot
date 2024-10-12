import { Command } from "#structures";

export default new Command<"chatInput">({
    async run(interaction) {
        const msg = await interaction.deferReply({ fetchReply: true });

        await interaction.editReply(
            `Websocket: \`${interaction.client.ws.ping}\`ms\n` +
            `Round-trip: \`${msg.createdTimestamp - interaction.createdTimestamp}\`ms`
        );
    },
    data: {
        name: "ping",
        description: "Check the bot's latency",
    },
});
