const { Client, GatewayIntentBits, Events, Collection, EmbedBuilder } = require(`discord.js`);
const readline = require('readline');
const { QuickDB } = require(`quick.db`)
const chalk = require('chalk');
const db = new QuickDB();
const fs = require('fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const mongoose = require('mongoose');
const { loadError } = require('./src/handler/crashlog');
const { loadCore } = require('./src/handler/ascore')
require('colors');
const axios = require('axios')
const cron = require('node-cron');



require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFiles = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"));

const process = require('node:process');

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection found at:', promise, 'For the reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.log('Uncaught Expection:', err);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
  console.log('Uncaught Expection:', err, origin);
});
client.on("guildCreate", async guild => {
  console.log(`Joined new guild: ${guild.name}`);
  const logschannelid = "1123004926524657767";
  const logsChannel = await client.channels.cache.get(logschannelid);
  const serverCount = client.guilds.cache.size;
  const embed = new EmbedBuilder()
    .setTitle("New Server")
    .setColor("Green")
    .setDescription(`${guild.name} has added KadenOS to their server! Yay`)
    .addFields({ name: "Guilds KadenOS is in:", value: `${serverCount}` })
    .setTimestamp()
    .setFooter({ text: "KadenOS: Management Sorted." })
  logsChannel.send({ embeds: [embed] });
});

client.on("guildDelete", async guild => {
  console.log(`Left a guild: ${guild.name}`);
  const logschannelid = "1123004926524657767";
  const logsChannel = await client.channels.cache.get(logschannelid);
  const serverCount = client.guilds.cache.size;
  const embed = new EmbedBuilder()
    .setTitle("Removed from Server")
    .setColor("Red")
    .setDescription(`${guild.name} has removed KadenOS from their server! :c`)
    .addFields({ name: "Guilds KadenOS is in:", value: `${serverCount}` })
    .setTimestamp()
    .setFooter({ text: "KadenOS: Management Sorted." })
  logsChannel.send({ embeds: [embed] });
});

const statusCheck = async (interval) => {
  setTimeout(async () => {
    const status = {
      memberCount: client.guilds.cache.map((guild) => guild.memberCount).reduce((p, c) => p + c),
      serverCount: client.guilds.cache.size,
      botStatus: 'Online'
    }
    await axios.post('https://project-showtime.vercel.app/api/kadenStats', status).then(async (response) => {
      console.log('Status Check Successfull:', response.data)
    })
      .catch(error => {
        console.error('Error uploading stats:', error);
      });
  }, 5000)
}

const dipSchema = require('./src/Schemas/dip');

const scheduleMessages = async (interval) => {
  const currentTime = Date.now();

  const expiredDips = await dipSchema.find({ EndTime: { $lte: currentTime } });

  expiredDips.forEach(async (dip) => {
    const { guildID, UserID } = dip;

    const userToDM = await client.users.fetch(UserID);
    if (userToDM) {
      await userToDM.send(`Your Leave of Absence has ended. Welcome back! Request more time if required!`);
      await dipSchema.deleteOne({ EndTime: { $lte: currentTime } });
    }
  });

  const remainingDips = await dipSchema.countDocuments();
  console.log(`Remaining Leave of Absence Documents: ${remainingDips}`);

  // Schedule the next check
  setTimeout(() => {
    scheduleMessages(interval);
  }, interval);
};



(async () => {
  mongoose.connect(process.env.MONGODBURL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.green('INFO') + chalk.white('] ') + chalk.green('MONGODB') + chalk.white(' Connected!'))).catch(error => console.error("mongoose connection failed...".red, error))

  for (file of functions) {
    require(`./src/functions/${file}`)(client);
  }
  client.commands = new Collection();
  client.handleEvents(eventFiles, "./src/events");
  client.handleCommands(commandFiles, "./src/commands");
  client.login(process.env.token).then(() => { loadError(client); }).catch((e) => console.log(e)).then(() => { loadCore(client); }).catch((e) => console.log(e))
  statusCheck(69420)
})();

cron.schedule('* * * * *', () => {
  statusCheck(69420)
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  const { customId } = interaction;

  if (customId === 'help') {
    let choices = "";

    await interaction.values.forEach(async value => {
      choices += `${value}`


      switch (value) {
        case 'admin':
          const ModerationEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Administration Commands:")
            .addFields(
              { name: "/add-certification - Requires MOD Role", value: "Give you a certificate!!" },
              { name: "/add-points - Requires MOD Role", value: "Points points points!" },
              { name: "/change-rank - Requires MOD Role", value: "You got promoted or demoted well done!" },
              { name: "/create-profile", value: "Welcome to the club makes you a profile." },
              { name: "/loa-logs", value: "Sets up logs for /dip. (Server Admin Only)" },
              { name: "/feedback-logs", value: "Sets up logs for /review. (Server Admin Only)" },
              { name: "/setup-logs", value: "Sets up logs for all commands. (Server Admin Only)" },
              { name: "/setup-perms", value: "Setups up who can use these commands. (Server Admin Only)" },
              { name: "/strike add - Requires MOD Role", value: "Give a naughty boy a strike." },
              { name: "/strike clear - Requires MOD Role", value: "Removes all of a persons strikes." },
              { name: "/strike check-admin - Requires MOD Role", value: "Allows admins to check strikes." },
              { name: "/strike remove - Requires MOD Role", value: "Removes a strike!" },
              { name: "/remove-profile - Requires MOD Role", value: "Use this to fire and delete someones Profile!" },
              { name: "/remove-perms", value: "Removes perms from a rank! (Server Admin Only)" },
              { name: "/remove-points - Requires MOD Role", value: "Delete dem points!" },
              { name: "/remove-certification - Requires MOD Role", value: "Get rid of their award." },
              { name: "/purge-points", value: "Exterminate all points from all profiles! (Server Admin Only)" }

            )
            .setFooter({ text: "A project by OlsSystem" })
            .setThumbnail('https://cdn.discordapp.com/attachments/1121808555478110359/1150181465959706737/4674927c88f4e9879e15f41703085e8b.png')
            .setTimestamp();

          await interaction.update({ embeds: [ModerationEmbed] })
          break;
        case 'misc':
          const FunCommands = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Miscellaneous Commands:")
            .addFields(
              { name: "/dip", value: "Sends a request to to a leave of absence. 3 days+." },
              { name: "/dip-remove", value: "Lets you return to your business. (Boring)" },
              { name: "/help", value: "Your looking at it." },
              { name: "/ping", value: "For the nerds who want to know" },
              { name: "/support", value: "Sends you to the Support server." },
              { name: "/uptime", value: "How long has the bot been alive for?" },
              { name: "/profiles", value: "Look at dem profiles." },
              { name: "/review", value: "Tis the product good?" },
              { name: "/strike check", value: "Check if you\'ve been a bad boy." }

            )
            .setFooter({ text: "A project by OlsSystem" })
            .setThumbnail('https://cdn.discordapp.com/attachments/1121808555478110359/1150181465959706737/4674927c88f4e9879e15f41703085e8b.png')
            .setTimestamp();

          await interaction.update({ embeds: [FunCommands] })
          break;
        case 'howto':
          const howto = new EmbedBuilder()
            .setColor("Red")
            .setTitle("How to use:")
            .addFields(
              { name: "Step 1", value: "Setup Perms (/setup-perms) for ranks that you want to control the strikes, rank changing, point things, etc." },
              { name: "Step 2:", value: "Setup Logs for all the things you wish to use. Ie LOA (/loa-logs), feedback (/feedback-logs), normal logs (/setup-logs)" },
              { name: "Step 3:", value: "Play around with the bot and setup profiles for you staff team! They can do it their self or you can! (/create-profile)" },
              { name: "Step 4:", value: "My last tip for you is to tell you community how to use the review command if you wanna use it. Very useful." }

            )
            .setFooter({ text: "A project by OlsSystem" })
            .setThumbnail('https://cdn.discordapp.com/attachments/1121808555478110359/1150181465959706737/4674927c88f4e9879e15f41703085e8b.png')
            .setTimestamp();

          await interaction.update({ embeds: [howto] })
          break;
        default:
          const MenuEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle('KadenOS | Simple Managment')
            .setThumbnail('https://cdn.discordapp.com/attachments/1121808555478110359/1150181465959706737/4674927c88f4e9879e15f41703085e8b.png')
            .setDescription(`KadenOS isn\'t your typical bot. Here we want to help you manage your business. From profiles, to points, to certifications and even strikes you can manage a small business with a single bot and no 3rd party outside websites!`)
            .addFields(
              { name: "Section 1:", value: "Administartion Commands" },
              { name: "Section 2:", value: "Miscellaneous Commands" },
              { name: "Section 3:", value: "How to Use" }
            )
            .setFooter({ text: "A project by OlsSystem" });

          await interaction.update({ embeds: [MenuEmbed] })
          break;
      }

    })
  }
});



client.on('messageCreate', message => {
  const modulePath = './src/handler/ascore';
  const { listenChannelList } = require(modulePath);
  if (listenChannelList.includes(message.channel.id)) {
    const targetUser = message.guild.members.cache.get(message.author.id);
    console.log(`[ASCORE | LISTENING TO ${message.channel.name.toLocaleUpperCase()}] ${targetUser.nickname || message.author.username}: ${message.content}`);
  }
});
