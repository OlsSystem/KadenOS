const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const permSchema = require('../Schemas/perms');
const profilesSchema = require('../Schemas/profiles');
const { QuickDB } = require('quick.db');
const db = new QuickDB;


module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge-points')
        .setDescription('points gone just like that.'),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "https://imgflip.com/i/7ph52m no perms?" });
        const profiles = await profilesSchema.find({ GuildID: interaction.guild.id })
        const { guildId } = interaction

        if (!profiles) return await interaction.reply({ content: "Profiles need setting up before use." })
        const channelID = await db.get(`strikechannel_${guildId}`);
        const channel = interaction.guild.channels.cache.get(channelID);
        if (!channelID) return await interaction.reply({ content: "A Logs channel needs setting up before use of this command.", ephemeral: true })

        const count = await profilesSchema.countDocuments({ GuildID: interaction.guild.id })



        const points = await profilesSchema.updateMany({ GuildID: interaction.guild.id }, { $set: { Points: 0 } });
        console.log('[DEBUG] POINTS RESET STARTED')

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Points Purge Logs')
            .setFields(
                { name: "Profiles Purged:", value: `${count} profile points where purged.` },
                { name: "Issued By", value: `${interaction.user.username}` }
            )
            .setTimestamp()

        await channel.send({ embeds: [embed] })
        await interaction.reply({ content: "Points Purged! This can not be un done.", ephemeral: true })
    }
};
