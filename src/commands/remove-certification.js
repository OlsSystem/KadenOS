const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js')
const profilesSchema = require('../Schemas/profiles');
const permSchema = require('../Schemas/perms');
const { QuickDB } = require('quick.db');
const db = new QuickDB;

module.exports = {
    mod: true,
    data: new SlashCommandBuilder()
        .setName('remove-certification')
        .setDescription('removes a users licence')
        .addUserOption(option => option.setName('user').setDescription('user you are editing').setRequired(true)),
    async execute(interaction) {

            await interaction.deferReply({ ephemeral: true })
            const user = await interaction.guild.members.fetch(interaction.options.getUser('user'));

            const userdata = await profilesSchema.findOne({ GuildID: interaction.guild.id, UserID: user.id })

            if (!userdata) return await interaction.reply({ content: "User has no profile.", ephemeral: true });

            await profilesSchema.updateMany({
                Certification: "N/A",
            });

            await userdata.save();

            const channelID = await db.get(`strikechannel_${user.guild.id}`);
            const channel = user.guild.channels.cache.get(channelID);
            const logembed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Certification Removal Logs')
                .setFields(
                    { name: "User:", value: `${user} | ${userdata.UserName}` },
                    { name: "Issued By", value: `${interaction.user.username}` }
                )
                .setTimestamp()

            await channel.send({ embeds: [logembed] });

            await interaction.followUp({ content: `User ${userdata.UserName} has had their Licence Removed.`, ephemeral: true })
    }
};