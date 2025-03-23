const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const profilesSchema = require('../Schemas/profiles');
const { createCanvas, Image, loadImage } = require('canvas');

/**
     * @param {object} ops Fonts
     * @param {string} [ops.fontX="MANROPE_BOLD"] Bold font family
     * @param {string} [ops.fontY="MANROPE_REGULAR"] Regular font family
     * @returns {Promise<Buffer>}
     */

function shorten(text, len) {
    if (typeof text !== "string") return "";
    if (text.length <= len) return text;
    return text.substr(0, len).trim() + "...";
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('view a profile')
        .addUserOption(option => option.setName('user').setDescription('whos profile u wanna see?').setRequired(false)),

    async execute(interaction) {

        const { options, user, guild } = interaction;
        const Member = options.getMember('user') || user;
        const member = guild.members.cache.get(Member.id);

        const profileInfomation = await profilesSchema.findOne({ GuildID: guild.id, UserID: member.id })
        let background = null

        if (!profileInfomation) return await interaction.reply({ content: "User has no data.", ephemeral: true });

        ops = { fontX: "MANROPE_BOLD,NOTO_COLOR_EMOJI", fontY: "MANROPE_BOLD,NOTO_COLOR_EMOJI" }

        const customBanner = profileInfomation.Banner || "https://i.imgur.com/lHkUyUm.png"
        const canvas = createCanvas(934, 282)
        const ctx = canvas.getContext('2d')
        try {
            background = await loadImage(customBanner)
        } catch (error) {
            background = await loadImage('https://i.imgur.com/lHkUyUm.png')
        }

        const avatar = await loadImage(member.displayAvatarURL({ forceStatic: false, extension: 'png' }))


        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
        ctx.globalAlpha = 0.5
        ctx.fillStyle = '#333640'
        ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40)
        ctx.globalAlpha = 1

        ctx.save()

        const name = shorten(member.user.username, 5)
        ctx.fillStyle = '#FFFFFF'
        ctx.font = `bold 36px ${ops.fontX}`;
        ctx.textAlign = 'start'
        ctx.fillText(`${name} - ${profileInfomation.Role} | ${profileInfomation.Timezone}`, 257 + 15, 164)

        ctx.save()

        ctx.beginPath();
        ctx.arc(125 + 10, 125 + 20, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(avatar, 35, 45, 180 + 20, 180 + 20)
        ctx.restore()

        ctx.save()

        ctx.fillStyle = '#FFFFFF'
        ctx.font = `30px ${ops.fontX}`;
        ctx.textAlign = 'start'
        ctx.fillText(`${profileInfomation.Points} Points, ${profileInfomation.Strikes} Strikes, Certifications: ${profileInfomation.Certification}`, 257 + 18.5, 164 + 36.25)


        const buffer = canvas.toBuffer('image/png');
        const attachment = new AttachmentBuilder(buffer, { name: 'image.png' });

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`${profileInfomation.UserName}\'s profile`)
            .setImage("attachment://image.png")

        try {
            await interaction.reply({ embeds: [embed], files: [attachment] })
        } catch (error) {
            console.log(error)
            await interaction.reply({ content: "The Bot has failed to load your Profile. The main cause of this could be your Custom Background. Please make sure it is a **IMAGE LINK**. To do this right click an image and copy link. Then do /change-banner and paste the new link. If it doesn\'t work contact AxolSystems Support." })
        }


    }
}