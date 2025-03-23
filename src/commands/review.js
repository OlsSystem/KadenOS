const { SlashCommandBuilder, messageLink } = require('@discordjs/builders');
const { Client, GatewayIntentBits, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Guild, ChannelType, channels } = require(`discord.js`);
const { User } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require(`quick.db`);
const db = new QuickDB


require('dotenv').config();


module.exports = {
  data: new SlashCommandBuilder()
    .setName('review')
    .setDescription('give us your thoughts')
    .addStringOption(option => option.setName('product').setDescription('what product are you reviewing?').setRequired(true))
    .addIntegerOption(option => option.setName('rating').setDescription('give a rating between 1-10.').setMinValue(0).setMaxValue(10).setRequired(true))
    .addStringOption(option => option.setName('good').setDescription('what did you like about it?').setRequired(true))
    .addStringOption(option => option.setName('improve').setDescription('what could we do to help make it better?').setRequired(true)),

  async execute(interaction) {

    const { guildId } = interaction;
    const rating = interaction.options.getInteger('rating');
    const good = interaction.options.getString('good');
    const improve = interaction.options.getString('improve');
    const product = interaction.options.getString('product');

    await interaction.deferReply()

    const embeda = new EmbedBuilder()
      .setTitle(`${product} review`)
      .setFields(
        { name: "Review By:", value: `${interaction.user.username}` },
        { name: "Rating:", value: `${rating}/10` },
        { name: "What did I like?", value: `${good}` },
        { name: "What can we Improve on Next Time?", value: `${improve}` }
      )
      .setTimestamp()
      .setColor('Red')
      .setFooter({ text: "Kaden Review System" })

    const channelID = await db.get(`feedbacklog_${guildId}`);
    const channel = interaction.guild.channels.cache.get(channelID);

    if (!channelID) return await interaction.editReply({ content: "This server hasn\'t setup the review system. Ask an Admin to.", ephemeral: true });

    channel.send({ embeds: [embeda] })
    await interaction.editReply({ embeds: [embeda] })
  }

}