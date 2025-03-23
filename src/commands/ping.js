const { SlashCommandBuilder, messageLink } = require('@discordjs/builders');
const { Client, GatewayIntentBits, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Guild, ChannelType, channels } = require(`discord.js`);
const { User } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

require('dotenv').config();
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

module.exports = {
  data: new SlashCommandBuilder()
  .setName('ping')
  .setDescription('says the ping of the bot'),
  async execute(interaction) {
    if (!interaction) return;
    const sent = await interaction.reply({ content: "Pinging...", fetchReply: true });
    const timeDiff = (sent.editedAt || sent.createdAt) - (interaction.editedAt || interaction.createdAt);
    await interaction.followUp(`Pong! Latency: ${timeDiff}ms`);
  }
}