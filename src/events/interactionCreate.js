const { Interaction } = require("discord.js");
const permsData = require('../Schemas/perms')


module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        //mod check
        if (command.mod) {
            let data = await permsData.find({ GuildID: interaction.guild.id });
            if (data.length > 0) {
                let check;
                await data.forEach(async value => {
                    const mRoles = await interaction.member.roles.cache.map(role => role.id);
                    await mRoles.forEach(async role => {
                        if (role == value.Role) check = true;
                    });
                });

                if (!check) return await interaction.reply({ content: `https://imgflip.com/i/7ph52m no perms?`})
            }
        }






        if (!command) return
       
        try{


            await command.execute(interaction, client);
        } catch (error) {
            console.log(error);
            await interaction.reply({
                content: 'An Error as occured. Please try again or contact the developer.', 
                ephemeral: false
            });
        } 

    },
    


};