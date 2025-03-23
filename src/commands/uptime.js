const { SlashCommandBuilder, messageLink } = require('@discordjs/builders');
const { Client, GatewayIntentBits, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Guild, ChannelType, channels } = require(`discord.js`);
const { User } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require(`quick.db`);
const db = new QuickDB


require('dotenv').config();
const client = new Client({ intents: [Object.keys(GatewayIntentBits)] }); 

module.exports = {
  data: new SlashCommandBuilder()
  .setName('uptime')
  .setDescription('how long has the bot been alive for?'),
  async execute(interaction, client) {
    let days = Math.floor(client.uptime / 86400000)
    let hours = Math.floor(client.uptime / 3600000) % 24
    let minutes = Math.floor(client.uptime / 60000) % 60
    let seconds = Math.floor(client.uptime / 1000) % 60

    const embed = new EmbedBuilder()
    .setColor("Red")
    .setDescription(`:white_check_mark: The bot hasn't killed its self in \`${days}\` days, \`${hours}\` hours, \`${minutes}\` minutes, \`${seconds}\` seconds.`)

    await interaction.reply({ embeds: [embed] })
  }
}