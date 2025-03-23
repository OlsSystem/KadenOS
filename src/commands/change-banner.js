const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js')
const profilesSchema = require('../Schemas/profiles');
const permSchema = require('../Schemas/perms');
const { QuickDB } = require('quick.db');
const db = new QuickDB;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('change-banner')
        .setDescription('changes your banner')
        .addStringOption(option => option.setName('banner').setDescription('what banner you want? must be image link').setRequired(true)),
    async execute(interaction) {

            await interaction.deferReply({ ephemeral: true })
            const user = await interaction.guild.members.fetch(interaction.user.id);
            const banner = interaction.options.getString('banner');

            const userdata = await profilesSchema.findOne({ GuildID: interaction.guild.id, UserID: user.id })

            if (!userdata) return await interaction.reply({ content: "User has no profile.", ephemeral: true });

            await userdata.updateOne({
                Banner: banner,
            });

            await userdata.save();

            await interaction.followUp({ content: `Banner Updated.`, ephemeral: true })
    }
};

