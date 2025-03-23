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
        .setName('dip')
        .setDescription('gotta take a leave of absence? use me!')
        .addStringOption(option => option.setName('reason').setDescription('why').setRequired(true))
        .addStringOption(option => option.setName('how-long-for').setDescription("3 day minimum for the system to work. ie 3d or 5d").setRequired(true)),

    async execute(interaction) {

        const { guildId } = interaction;
        const user = interaction.guild.members.cache.get(interaction.user.id)
        const timeo = interaction.options.getString('how-long-for');
        const reason = interaction.options.getString('reason');

        const timems = ms(timeo)

        const data = await dipSchema.findOne({ GuildID: guildId, UserID: interaction.user.id })

        const getCDStamp = (timestamp = Date.now()) => `<t:${Math.round(timestamp / 1000)}>`;

        if (data) {
            const embeddata = new EmbedBuilder()
                .setDescription(`You have an on going Leave of Absence till ${getCDStamp(data.EndTime)}`)
                .setColor('Red')
            return await interaction.reply({ embeds: [embeddata] });
        }

        let newtime = Date.now() + timems;




        const embeda = new EmbedBuilder()
            .setTitle('LOA Request')
            .setFields(
                { name: "Username:", value: `${user.displayName}` },
                { name: "Reason:", value: `${reason}` },
                { name: "Length", value: `${timeo}` },
                { name: "Ends At:", value: `${getCDStamp(newtime)}` }
            )
            .setColor('Red')



        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel("Accept LOA")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('deny')
                    .setLabel("Deny LOA")
                    .setStyle(ButtonStyle.Danger)
            )

        const channelID = await db.get(`dip_${guildId}`);
        const channel = interaction.guild.channels.cache.get(channelID);
        console.log(timems)

        if (typeof timems === 'undefined') {
            return await interaction.reply({ content: "The time presented is Invalid. Try it in days (d) or weeks (w).", ephemeral: true })
        }

        if (!channel) return await interaction.reply({ content: "Not Setup. Ask admin to set me up!", ephemeral: true })

        const msg = await channel.send({ embeds: [embeda], components: [button] })
        await interaction.reply({ content: "A request for LoA has been sent to the higher ups. You will receive a DM with the results.", ephemeral: true })
        const collector = msg.createMessageComponentCollector()

        collector.on('collect', async i => {
            if (i.customId == "accept") {
                const makedata = dipSchema.create({
                    GuildID: guildId,
                    UserID: interaction.user.id,
                    Username: user.displayName,
                    Reason: reason,
                    Lenth: timeo,
                    EndTime: newtime
                });
                const embeda = new EmbedBuilder()
                    .setTitle('LOA Request')
                    .setFields(
                        { name: "Username:", value: `${user.displayName}` },
                        { name: "Reason:", value: `${reason}` },
                        { name: "Length", value: `${timeo}` },
                        { name: "Ends At:", value: `${getCDStamp(newtime)}` }
                    )
                    .setColor('Red')
                    .setFooter({ text: `Accepted by ${i.user.tag}`})
                msg.edit({ components: [], embeds: [embeda] })
                msg.react('✅')
                await interaction.member.send('Your LOA Request has been accepted enjoy your time! You return at: ' + getCDStamp(newtime))
            }
        })

        collector.on('collect', async i => {
            if (i.customId == "deny") {
                msg.edit({ components: [] })
                msg.react('❌')
                await interaction.member.send('Your LOA Request has been denied. Please check with ' + i.user.tag + ' as to why it was denied.')
            }
        })


    }
}