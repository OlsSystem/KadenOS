const { EmbedBuilder, ActivityType } = require('discord.js');
const chalk = require('chalk');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client, channel) {
    const logschannelid = "1098355458886090802";
    const logsChannel = await client.channels.cache.get(logschannelid);
    const embed = new EmbedBuilder()
      .setTitle("Kaden Online")
      .setColor("Green")
      .setDescription(":thumbsup: Kaden has come online.")
      .setTimestamp();
    logsChannel.send({ embeds: [embed] })

    console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.green('INFO') + chalk.white('] ') + chalk.green('KADENOS') + chalk.white(' Loaded!'))
    const activities = [
      'Writing up spreadsheets.',
      'Warning some kid',
      'Couting Points',
      'Beep Boop Zeep'
    ];

    setInterval(() => {
      const status = activities[Math.floor(Math.random() * activities.length)]
      client.user.setPresence({ activities: [{ type: ActivityType.Playing, name: `${status}` }] });
    }, 5000);

  }
};
