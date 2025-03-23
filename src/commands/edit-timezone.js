const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js')
const profilesSchema = require('../Schemas/profiles');
const permSchema = require('../Schemas/perms');
const { QuickDB } = require('quick.db');
const db = new QuickDB;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit-timezone')
        .setDescription('changes a users timezone')
        .addUserOption(option => option.setName('user').setDescription('user you are editing').setRequired(true))
        .addStringOption(option => option.setName('timezone').setDescription('what timezone?').setRequired(true)),
    async execute(interaction) {

            await interaction.deferReply({ ephemeral: true })
            const user = await interaction.guild.members.fetch(interaction.options.getUser('user'));
            const licence = interaction.options.getString('timezone');

            const userdata = await profilesSchema.findOne({ GuildID: interaction.guild.id, UserID: user.id })
            const previousrank = userdata.Timezone;

            if (!userdata) return await interaction.reply({ content: "User has no profile.", ephemeral: true });

            await userdata.updateOne({
                Timezone: licence,
            });

            await userdata.save();

            const channelID = await db.get(`strikechannel_${user.guild.id}`);
            const channel = user.guild.channels.cache.get(channelID);
            const logembed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Edited Timezone Logs')
                .setFields(
                    { name: "User:", value: `${user} | ${userdata.UserName}` },
                    { name: "Previous Timezone:", value: `${previousrank}` },
                    { name: "New Timezone:", value: `${licence}` },
                    { name: "Issued By", value: `${interaction.user.username}` }
                )
                .setTimestamp()


            await channel.send({ embeds: [logembed] })
            await interaction.followUp({ content: `User ${userdata.UserName} has been awared the ${licence} Timezone.`, ephemeral: true })
    }
};

