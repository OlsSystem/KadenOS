const { REST } = require("@discordjs/rest");
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const chalk = require('chalk');

const clientId = '885183649513893888'; 
const guildId = '996820607557718116'; 

module.exports = (client) => {
    client.handleCommands = async (commandFolders, path) => {
        client.commandArray = [];
            const commandFiles = fs.readdirSync(`${path}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`../commands/${file}`);
                client.commands.set(command.data.name, command);
                client.commandArray.push(command.data.toJSON());
            }

        const rest = new REST({
            version: '9'
        }).setToken(process.env.token);

        await (async () => {
            try {

                await rest.put(
                    Routes.applicationCommands(clientId), {
                        body: client.commandArray
                    },
                );

                console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.green('INFO') + chalk.white('] ') + chalk.green('COMMANDS') + chalk.white(' Loaded!'))
            } catch (error) {
                console.error(error);
            }
        })();
    };
};