const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js')
const profilesSchema = require('../Schemas/profiles');
const permSchema = require('../Schemas/perms');
const { QuickDB } = require('quick.db');
const db = new QuickDB;

module.exports = {
    mod: true,
    data: new SlashCommandBuilder()
        .setName('add-points')
        .setDescription('gives a user some points')
        .addUserOption(option => option.setName('user').setDescription('user you are editing').setRequired(true))
        .addIntegerOption(option => option.setName('points').setDescription('how many points u giving?').setRequired(true)),
    async execute(interaction) {

            await interaction.deferReply({ ephemeral: true })
            const user = await interaction.guild.members.fetch(interaction.options.getUser('user'));
            const points = interaction.options.getInteger('points');

            const userdata = await profilesSchema.findOne({ GuildID: interaction.guild.id, UserID: user.id })

            if (!userdata) return await interaction.reply({ content: "User has no profile.", ephemeral: true });

            userdata.Points += points;
            await userdata.save();

            const channelID = await db.get(`strikechannel_${user.guild.id}`);
            const channel = user.guild.channels.cache.get(channelID);
            const logembed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Points Logs')
                .setFields(
                    { name: "User:", value: `${user} | ${userdata.UserName}` },
                    { name: "Payout Given:", value: `${points}` },
                    { name: "Total Payout:", value: `${userdata.Points}` },
                    { name: "Issued By", value: `${interaction.user.username}` }
                )
                .setTimestamp()

            await channel.send({ embeds: [logembed] });
            await interaction.followUp({ content: `User ${userdata.UserName} has been awared ${points} Points!`, ephemeral: true })
    }
};