const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const dipSchema = require('../Schemas/dip');


module.exports = {
    data: new SlashCommandBuilder()
    .setName('dip-remove')
    .setDescription('honey im home!'),

    async execute (interaction) {

        const { guildId } = interaction;

        const data = await dipSchema.findOne({ GuildID: guildId, UserID: interaction.user.id })
        const member = await interaction.guild.members.fetch(interaction.user);

        if (!data) return await interaction.reply({ content: "You have no on going Inactivity\'s."})

        const embed = new EmbedBuilder()
        .setDescription('Are you sure you wish to cancel you Inactivity Notice?')
        .setColor('Red')

        const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('yes')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Danger)
        )

        const msg = await interaction.reply({ embeds: [embed], components: [button] })
        const collector = msg.createMessageComponentCollector()

        collector.on('collect', async i => {
            if (i.customId == "yes") {
                msg.edit({ content: "Inactivity Cancelled! Welcome back!", components: [], embeds: [] })
                await dipSchema.deleteOne({ GuildID: guildId, UserID: interaction.user.id })
                await member.send(`Your Leave of Absence has ended. Welcome back! Request more time if required!`);
            }
        })

 
    }
}