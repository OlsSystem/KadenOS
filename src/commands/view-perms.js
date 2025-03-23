const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const permSchema = require('../Schemas/perms')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('view-perms')
        .setDescription('lets u view who has perms'),
    async execute(interaction) {

        const data = await permSchema.find({ GuildID: interaction.guild.id })

        console.log(data)

        async function sendEmbed(message) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Moderator Roles')
                .setDescription(message)

            await interaction.reply({ embeds: [embed] })
        }

        if (data <= 0) return await sendEmbed('This server has no Mod Roles. Use /setup-perms to add them.')


        let roleList = []
        await data.forEach(async value => {
            if (!value.Role) return console.log('no role');
            else {
                let r = await interaction.guild.roles.cache.get(value.Role);
                await roleList.push(`**Role:** ${r.name} - ${r}`)
            }
        });

        console.log(roleList)
        await sendEmbed(`${roleList.join('\n')}`)
    }
};
