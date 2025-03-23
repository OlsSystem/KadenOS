const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const dipSchema = require('../Schemas/dip');
const { QuickDB } = require('quick.db');
const db = new QuickDB;
const { time } = require('discord.js');
const date = new Date();
const ms = require('ms')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('dip-check')
        .setDescription('gotta check who on dip')
        .addUserOption(option => option.setName('user').setDescription('who we looking at?').setRequired(true)),

    async execute(interaction) {

        const { guildId } = interaction;
        const user = await interaction.guild.members.fetch(interaction.options.getUser('user'));



        const data = await dipSchema.findOne({ GuildID: guildId, UserID: user.id })

        const getCDStamp = (timestamp = Date.now()) => `<t:${Math.round(timestamp / 1000)}>`;

        if (data) {
            const embeddata = new EmbedBuilder()
                .setDescription(`${user} has a Leave of Absence till ${getCDStamp(data.EndTime)}`)
                .setColor('Red')
            return await interaction.reply({ embeds: [embeddata], ephemeral: true });
        } else {
            return await interaction.reply({ content: "No Leave of Absence Found for this user.", ephemeral: true})
        }



    }
}