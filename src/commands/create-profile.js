const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js')
const profilesSchema = require('../Schemas/profiles');
const { QuickDB } = require('quick.db');
const db = new QuickDB;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-profile')
        .setDescription('makes the user a staff profile')
        .addUserOption(option => option.setName('user').setDescription('user your adding to the database').setRequired(true))
        .addStringOption(option => option.setName('username').setDescription('the roblox username').setRequired(true))
        .addStringOption(option => option.setName('role').setDescription('whats their job?').setRequired(true))
        .addStringOption(option => option.setName('timezone').setDescription('what time zone').setRequired(true))
        .addStringOption(option => option.setName('banner').setDescription('custom profile banner')),
    async execute(interaction) {

        await interaction.deferReply()
        const user = await interaction.guild.members.fetch(interaction.options.getUser('user'));
        const role = interaction.options.getString('role');
        const username = interaction.options.getString('username')
        const timezone = interaction.options.getString('timezone')
        const customBanner = interaction.options.getString('banner') || "https://i.imgur.com/lHkUyUm.png"

        const data = await profilesSchema.findOne({ GuildID: interaction.guild.id, UserID: user.id });

        const channelID = await db.get(`strikechannel_${user.guild.id}`);
        const channel = user.guild.channels.cache.get(channelID);

        if (!channelID) return await interaction.editReply({ content: "A Logs channel needs setting up before use of this command.", ephemeral: true })
        if (role.length > 12) return await interaction.editReply({ content: "Your Rank must be less then 12 Characters.", ephemeral: true })
     

        if (!data) {
            await profilesSchema.create({
                GuildID: interaction.guild.id,
                UserID: user.id,
                UserName: username,
                Role: role,
                Strikes: 0,
                Points: 0,
                Certification: "N/A",
                Timezone: timezone,
                Banner: customBanner
            });

            
            const logembed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Profile Creation Logs')
                .setFields(
                    { name: "User:", value: `${user} | ${username}` },
                    { name: "Rank:", value: `${role}` },
                    { name: "Issued By", value: `${interaction.user.username}` }
                )
                .setTimestamp()

            await channel.send({ embeds: [logembed] });
            return await interaction.editReply({ content: "Profile has been set up!" });
        } else {
            return await interaction.editReply({ content: "Profile has been set up for this user before." });
        }
    }
};
