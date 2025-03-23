const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const permSchema = require('../Schemas/perms')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-perms')
        .setDescription('removes the role for admin commands')
        .addRoleOption(option => option.setName('role').setDescription('what role innit').setRequired(true)),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "https://imgflip.com/i/7ph52m no perms?" });

        const targetrole = interaction.options.getRole('role');

        await permSchema.deleteOne({ Role: targetrole.id });

        await interaction.reply({ content: "Removed Perms." })

    
    }
};