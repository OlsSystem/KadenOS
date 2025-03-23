const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js')
const profilesSchema = require('../Schemas/profiles');
const permSchema = require('../Schemas/perms');
const { QuickDB } = require('quick.db');
const db = new QuickDB;

module.exports = {
    mod: true,
    data: new SlashCommandBuilder()
        .setName('remove-profile')
        .setDescription('removes the users staff profile')
        .addUserOption(option => option.setName('user').setDescription('who u removing?').setRequired(true)),
    async execute(interaction) {

            const user = await interaction.guild.members.fetch(interaction.options.getUser('user'));

            const data = await profilesSchema.findOne({ GuildID: interaction.guild.id, UserID: user.id });

            const channelID = await db.get(`strikechannel_${user.guild.id}`);
            const channel = user.guild.channels.cache.get(channelID);
            if (!channelID) return await interaction.reply({ content: "A Logs channel needs setting up before use of this command.", ephemeral: true })

            if (!data) return await interaction.reply({ content: "There is no profile for this user" });
            await interaction.deferReply({ ephemeral: true });

            
            const logembed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Profile Removal Logs')
                .setFields(
                    { name: "User:", value: `${user} | ${data.UserName}` },
                    { name: "Issued By", value: `${interaction.user.username}` }
                )
                .setTimestamp()
            await channel.send({ embeds: [logembed] })
            await profilesSchema.deleteMany({ GuildID: interaction.guild.id, UserID: user.id });
            await interaction.followUp({ content: "Profile was removed." })
    }
};