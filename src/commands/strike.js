const { EmbedBuilder, SlashCommandBuilder, Embed } = require("discord.js");
const warningSchema = require('../Schemas/strikes');
const permSchema = require('../Schemas/perms');
const profilesSchema = require('../Schemas/profiles');
const { QuickDB } = require('quick.db');
const db = new QuickDB;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('strike')
        .setDescription('strike em innit')
        .addSubcommand(subcommand => subcommand.setName('add').setDescription('adds a strike to someone').addUserOption(option => option.setName('target').setDescription('who').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('why').setRequired(true)).addStringOption(option => option.setName('evidence').setDescription('show').setRequired(false)))
        .addSubcommand(subcommand => subcommand.setName('check').setDescription('check dem strikes'))
        .addSubcommand(subcommand => subcommand.setName('check-admin').setDescription('check strikes').addUserOption(option => option.setName('target').setDescription('who').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('remove').setDescription('removes a strike from someone').addUserOption(option => option.setName('target').setDescription('who').setRequired(true)).addIntegerOption(option => option.setName('id').setDescription('can i see some id pls').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('clear').setDescription('remove all dem strikes').addUserOption(option => option.setName('target').setDescription('who').setRequired(true))),

    async execute(interaction) {

        const { options, guildId, member } = interaction;
        const user = interaction.user;
        const sub = options.getSubcommand(["add", "check", "check-admin", "remove", "clear"]);
        const target = options.getUser("target") || interaction.user;
        const reason = options.getString('reason') || "No Reason Provided.";
        const evidence = options.getString('evidence') || "No Evidence Provided.";
        const warnId = options.getInteger("id") - 1;
        const warnDate = new Date(interaction.createdTimestamp).toLocaleDateString();
        const userdata = await profilesSchema.findOne({ GuildID: interaction.guild.id, UserID: user.id });
        let userTag = `${target.username}#0`;


        switch (sub) {
            case "add":
                try {
                    const permdata = await permSchema.find({ GuildID: interaction.guild.id });
                    const userdata = await profilesSchema.findOne({ GuildID: interaction.guild.id, UserID: user.id });
                    if (!permdata) return interaction.reply({ content: "The permissions haven\'t been added. Please run /setup-perms to use this commnad.", ephemeral: true })

                    let hasPermission = false;

                    for (const permDocument of permdata) {
                        if (interaction.member.roles.cache.has(permDocument.Role)) {
                            hasPermission = true;
                            break; // Break out of the loop since permission is found
                        }
                    }

                    if (!hasPermission) {
                        await interaction.reply({ content: "https://imgflip.com/i/7ph52m no perms?" });
                        return;
                    }

                    let data = await warningSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: userTag })
                    if (!data) {
                        data = new warningSchema({
                            GuildID: guildId,
                            UserID: target.id,
                            UserTag: userTag,
                            Content: [
                                {
                                    ExecutorId: user.id,
                                    ExecutorTag: user.tag,
                                    Reason: reason,
                                    Evidence: evidence,
                                    Date: warnDate
                                }
                            ],
                        });
                    } else {
                        const warnContent = {
                            ExecutorId: user.id,
                            ExecutorTag: user.tag,
                            Reason: reason,
                            Evidence: evidence,
                            Date: warnDate
                        }
                        data.Content.push(warnContent);
                    }
                    data.save();


                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`
                    **Warning Added:** ${userTag} | ||${target.id}||
                    **Reason:** ${reason}
                    **Evidence:** ${evidence}
                    `)
                        .setFooter({ text: "Kaden Logging System" })
                        .setTimestamp()

                    const channelID = await db.get(`strikechannel_${guildId}`);
                    const channel = interaction.guild.channels.cache.get(channelID);
                    userdata.Strikes += 1;
                    userdata.save();

                    channel.send({ embeds: [embed] })
                    await interaction.reply({ embeds: [embed], ephemeral: true });


                } catch (error) {
                    console.error(error);
                    return await interaction.followUp({ content: "An error occurred while processing the command." });
                }
                break;
            case "check":
                const nostrike = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`${userTag} | ||${user.id}|| has no warnings.`)
                    .setFooter({ text: "Kaden Strike System" })
                    .setTimestamp()

                let data = await warningSchema.findOne({ GuildID: guildId, UserID: user.id, UserTag: userTag })
                if (data) {
                    if (!data.Content.length) return await interaction.reply({ embeds: [nostrike], ephemeral: true})
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${data.Content.map(
                            (w, i) =>
                                `**ID:** ${i + 1}
                    **By:** ${w.ExecutorTag}
                    **Date:** ${w.Date}
                    **Reason:** ${w.Reason}
                    **Evidence:** ${w.Evidence}\n\n
                    `
                        ).join(" ")}`)
                        .setFooter({ text: "Kaden Strike System" })
                        .setTimestamp()

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${userTag} | ||${user.id}|| has no warnings.`)
                        .setFooter({ text: "Kaden Strike System" })
                        .setTimestamp()

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }

                break;
            case "check-admin":
                try {
                    const permdata = await permSchema.find({ GuildID: interaction.guild.id });
                    const userdata = await profilesSchema.findOne({ GuildID: interaction.guild.id, UserID: user.id });
                    if (!permdata) return interaction.reply({ content: "The permissions haven\'t been added. Please run /setup-perms to use this commnad.", ephemeral: true })

                    let hasPermission = false;

                    for (const permDocument of permdata) {
                        if (interaction.member.roles.cache.has(permDocument.Role)) {
                            hasPermission = true;
                            break; // Break out of the loop since permission is found
                        }
                    }

                    if (!hasPermission) {
                        await interaction.reply({ content: "https://imgflip.com/i/7ph52m no perms?" });
                        return;
                    }

                    let data = await warningSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: userTag })
                    if (data) {
                        const embed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`${data.Content.map(
                                (w, i) =>
                                    `**ID:** ${i + 1}
                        **By:** ${w.ExecutorTag}
                        **Date:** ${w.Date}
                        **Reason:** ${w.Reason}
                        **Evidence:** ${w.Evidence}\n\n
                        `
                            ).join(" ")}`)
                            .setFooter({ text: "Kaden Strike System" })
                            .setTimestamp()

                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    } else {
                        const embed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`${userTag} | ||${target.id}|| has no warnings.`)
                            .setFooter({ text: "Kaden Strike System" })
                            .setTimestamp()

                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }


                } catch (error) {
                    console.error(error);
                    return await interaction.followUp({ content: "An error occurred while processing the command." });
                }
                break;
            case "remove":
                try {
                    const permdata = await permSchema.find({ GuildID: interaction.guild.id });
                    const userdata = await profilesSchema.findOne({ GuildID: interaction.guild.id, UserID: user.id });
                    if (!permdata) return interaction.reply({ content: "The permissions haven\'t been added. Please run /setup-perms to use this commnad.", ephemeral: true })

                    let hasPermission = false;

                    for (const permDocument of permdata) {
                        if (interaction.member.roles.cache.has(permDocument.Role)) {
                            hasPermission = true;
                            break; // Break out of the loop since permission is found
                        }
                    }

                    if (!hasPermission) {
                        await interaction.reply({ content: "https://imgflip.com/i/7ph52m no perms?" });
                        return;
                    }

                    let data = await warningSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: userTag })
                    if (data) {
                        userdata.Strikes -= 1;
                        await userdata.save();

                        data.Content.splice(warnId, 1);
                        await data.save();

                        const embed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`${userTag}'s strike id: ${warnId + 1} has been removed.`)
                            .setFooter({ text: "Kaden Strike System" })
                            .setTimestamp()

                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    } else {
                        const embed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`${userTag} | ||${target.id}|| has no strikes.`)
                            .setFooter({ text: "Kaden Strike System" })
                            .setTimestamp()

                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }


                } catch (error) {
                    console.error(error);
                    return await interaction.followUp({ content: "An error occurred while processing the command." });
                }
                break;
            case "clear":
                try {
                    const permdata = await permSchema.find({ GuildID: interaction.guild.id });
                    const userdata = await profilesSchema.findOne({ GuildID: interaction.guild.id, UserID: user.id });
                    if (!permdata) return interaction.reply({ content: "The permissions haven\'t been added. Please run /setup-perms to use this commnad.", ephemeral: true })

                    let hasPermission = false;

                    for (const permDocument of permdata) {
                        if (interaction.member.roles.cache.has(permDocument.Role)) {
                            hasPermission = true;
                            break; // Break out of the loop since permission is found
                        }
                    }

                    if (!hasPermission) {
                        await interaction.reply({ content: "https://imgflip.com/i/7ph52m no perms?" });
                        return;
                    }

                    let data = await warningSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: userTag })
                    if (data) {
                        await warningSchema.findOneAndDelete({ GuildID: guildId, UserID: target.id, UserTag: userTag });
                        userdata.Strikes = 0;
                        userdata.save();

                        const embed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`${userTag}'s strikes have been cleared.`)
                            .setFooter({ text: "Kaden Strike System" })
                            .setTimestamp()

                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    } else {
                        const embed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`${userTag} | ||${target.id}|| has no strikes.`)
                            .setFooter({ text: "Kaden Strike System" })
                            .setTimestamp()

                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }


                } catch (error) {
                    console.error(error);
                    return await interaction.followUp({ content: "An error occurred while processing the command." });
                }
                break;
        }
    }
}