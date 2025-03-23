const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const permSchema = require('../Schemas/perms')
const { QuickDB } = require('quick.db');
const db = new QuickDB;


module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback-logs')
        .setDescription('sets the feedback logs for staff to read')
        .addChannelOption(option => option.setName('channel').setDescription("where we gettin our reviews ppl").setRequired(true)),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "https://imgflip.com/i/7ph52m no perms?" });

        const channel = interaction.options.getChannel('channel');

        await db.set(`feedbacklog_${interaction.guild.id}`, channel.id)


        await interaction.reply({ content: "Feedback Channel Set." })
    }
};