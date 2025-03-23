const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const permSchema = require('../Schemas/perms')
const { QuickDB } = require('quick.db');
const db = new QuickDB;


module.exports = {
    data: new SlashCommandBuilder()
        .setName('loa-logs')
        .setDescription('sets the logs for admins')
        .addChannelOption(option => option.setName('channel').setDescription("where we strikin ppl").setRequired(true)),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "https://imgflip.com/i/7ph52m no perms?" });

        const channel = interaction.options.getChannel('channel');

        await db.set(`dip_${interaction.guild.id}`, channel.id)


        await interaction.reply({ content: "Loa Accept Channel Set." })
    }
};