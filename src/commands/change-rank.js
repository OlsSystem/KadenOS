const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js')
const profilesSchema = require('../Schemas/profiles');
const permSchema = require('../Schemas/perms');
const { QuickDB } = require('quick.db');
const db = new QuickDB;

module.exports = {
    mod: true,
    data: new SlashCommandBuilder()
        .setName('change-rank')
        .setDescription('changes a users rank')
        .addUserOption(option => option.setName('user').setDescription('user you are editing').setRequired(true))
        .addStringOption(option => option.setName('rank').setDescription('what rank u giving?').setRequired(true)),
    async execute(interaction) {

            await interaction.deferReply({ ephemeral: true })
            const user = await interaction.guild.members.fetch(interaction.options.getUser('user'));
            const licence = interaction.options.getString('rank');

            if (licence.length > 12) return await interaction.reply({ content: "Your Rank must be less then 12 Characters.", ephemeral: true })

            const userdata = await profilesSchema.findOne({ GuildID: interaction.guild.id, UserID: user.id })
            const previousrank = userdata.Role;

            if (!userdata) return await interaction.reply({ content: "User has no profile.", ephemeral: true });

            await userdata.updateOne({
                Role: licence,
            });

            await userdata.save();

            const channelID = await db.get(`strikechannel_${user.guild.id}`);
            const channel = user.guild.channels.cache.get(channelID);
            const logembed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Rank Editing Logs')
                .setFields(
                    { name: "User:", value: `${user} | ${userdata.UserName}` },
                    { name: "Previous Rank:", value: `${previousrank}` },
                    { name: "New Rank:", value: `${licence}` },
                    { name: "Issued By", value: `${interaction.user.username}` }
                )
                .setTimestamp()


            await channel.send({ embeds: [logembed] })
            await interaction.followUp({ content: `User ${userdata.UserName} has been awared the ${licence} Role.`, ephemeral: true })
    }
};

