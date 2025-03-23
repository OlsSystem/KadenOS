const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads the entire bot.'),

    execute: async (interaction) => {
        if (interaction.user.id !== '534761994629152780') return await interaction.reply({ content: "Devs only.", ephemeral: true });
        const commandsToRemove = Array.from(interaction.client.commands.keys());

        for (const commandName of commandsToRemove) {
            delete require.cache[require.resolve(`./${commandName}.js`)];
            interaction.client.commands.delete(commandName);

            try {
                const newCommand = require(`./${commandName}.js`);
                interaction.client.commands.set(newCommand.data.name, newCommand);
                console.log(`[ASCORE] Reloaded ${commandName}!`)
            } catch (error) {
                console.error(`Error reloading command ${commandName}: ${error}`);
                await interaction.reply(`Error reloading command ${commandName}`);
                return;
            }
        }

        await interaction.reply({ content: 'Reload Successful', ephemeral: true})

    },
    init: async (client) => {
        console.log('AA')
    }
}