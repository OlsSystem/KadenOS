const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');


module.exports = {
  data: new SlashCommandBuilder()
  .setName('help')
  .setDescription('help'),
  async execute(interaction) {

    const MenuEmbed = new EmbedBuilder()
    .setColor("Red")
    .setTitle('KadenOS | Simple Managment')
    .setThumbnail('https://cdn.discordapp.com/attachments/1121808555478110359/1150181465959706737/4674927c88f4e9879e15f41703085e8b.png')
    .setDescription(`KadenOS isn\'t your typical bot. Here we want to help you manage your business. From profiles, to points, to certifications and even strikes you can manage a small business with a single bot and no 3rd party outside websites!`)
    .addFields(
        { name: "Section 1:", value: "Administartion Commands"},
        { name: "Section 2:", value: "Miscellaneous Commands"},
        { name: "Section 3:", value: "How to Use"}
    )
    .setFooter({ text: "A project by OlsSystem" });


    const menuComponents = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('help')
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(
              {
                label: 'Administartion Commands',
                description: 'Shows Admin Commands',
                value: 'admin',
              },
              {
                label: 'Miscellaneous Commands',
                description: 'Shows Misc Commands',
                value: 'misc',
              },
              {
                label: "How to Use",
                description: "Show How to use",
                value: "howto"
              },
              {
                label: 'Menu',
                description: 'Shows The Help Menu',
                value: 'default',
              },
            ),
        );


      await interaction.reply({ embeds: [MenuEmbed], components: [menuComponents] });
  }
}