const readline = require('readline');
const chalk = require('chalk');
const axios = require('axios');
let listenChannelList = []

function loadCore(client) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.green('INFO') + chalk.white('] ') + chalk.green('ASCORE') + chalk.white(' Loaded!'))


    // Set up an event listener for the 'line' event
    rl.on('line', async (input) => {

        const cmd = input.split(" ")
        const cmdList = ['stats', 'profservercheck', 'speak', 'help', 'proftotal', 'listen']
        const profileSchema = require('../Schemas/profiles')

        let cmdInArray = false;

        for (let i = 0; i < cmdList.length; i++) {
            if (cmd[0] === cmdList[i]) {
                cmdInArray = true;
                break; // Exit the loop early if a match is found
            }
        }

        if (cmdInArray == false) {
            console.log(`[ASCORE] ${cmd[0]} is not a registered command. Use help to list all useable commands.`)
        } else {
            if (cmd[0] == 'stats') {
                const response = await axios.get('https://api.olssystem.repl.co/totalstats')
                const stats = response.data;
                let days = Math.floor(client.uptime / 86400000)
                let hours = Math.floor(client.uptime / 3600000) % 24
                let minutes = Math.floor(client.uptime / 60000) % 60
                let seconds = Math.floor(client.uptime / 1000) % 60
                let str = `MemberCount: ${stats.kadenMemberCount}\nServerCount: ${stats.kadenServerCount}\nUptime: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds.`
                console.log(`[ASCORE] KadenOS Stats:`)
                import('boxen').then(b => {
                    console.log(b.default(str, { padding: 1 }))
                })
            }

            if (cmd[0] == 'profservercheck') {
                const target = cmd[1] || null
                const guild = cmd[2] || null
                if (!target) {
                    console.log('[ASCORE] Missing target. profservercheck <target:username> <guild:guildID>')
                }
                if (target) {
                    if (!guild) {
                        console.log('[ASCORE] Missing GuildID. profservercheck <target:username> <guild:guildID>')
                    }
                    let targetCheck = await profileSchema.findOne({ GuildID: cmd[2], UserName: cmd[1] })
                    if (!targetCheck) {
                        console.log('[ASCODE] Target Not Found. Must be accurate to the UserName Parameter found in the DB. ')
                    } else {
                        import('boxen').then(b => {
                            const jsonString = JSON.stringify(targetCheck, null, 2);
                            console.log(b.default(jsonString, { padding: 1 }))
                        })
                    }
                }
            }

            if (cmd[0] == 'profallcheck') {
                const target = cmd[1] || null
                if (!target) {
                    console.log('[ASCORE] Missing target. profallcheck <target:username> ')
                }
                if (target) {
                    let targetCheck = await profileSchema.find({ UserName: cmd[1] })
                    if (!targetCheck) {
                        console.log('[ASCODE] Target Not Found. Must be accurate to the UserName Parameter found in the DB. ')
                    } else {
                        import('boxen').then(b => {
                            const jsonString = JSON.stringify(targetCheck, null, 2);
                            console.log(b.default(jsonString, { padding: 1 }))
                        })
                    }
                }
            }

            if (cmd[0] == 'help') {
                let strkaden = 'profservercheck <target:username> <guild:guildID>\nprofallcheck <target:username>\nproftotal'
                let strcore = 'speak <guild:guildID> <channel:channelName> <message:content>\n listen <guild:guildID> <channel:channelName>'
                import('boxen').then(b => {
                    console.log('[ASCORE] AxolSystem:KadenOS Commands')
                    console.log(b.default(strkaden, { padding: 1 }))
                    console.log('[ASCORE] AxolSystem:Core Commands')
                    console.log(b.default(strcore, { padding: 1 }))
                })
            }

            if (cmd[0] == 'speak') {
                const guild = cmd[1] || null
                const channel = cmd[2] || null
                const args = cmd.slice(3) || ['[ASCORE] Speak Command was used without a message input']; // Assuming cmd is an array of strings
                const msgString = args.join(' ');

                if (!guild) {
                    console.log('[ASCORE] Missing GuildID. speak <guild:guildID> <channel:channelName> <message:content>')
                }
                if (guild) {
                    if (!channel) {
                        console.log('[ASCORE] Missing ChannelName. speak <guild:guildID> <channel:channelName> <message:content>')
                    }
                    if (channel) {
                        const getGuild = await client.guilds.cache.get(guild)
                        const getChannel = await getGuild.channels.cache.find(ch => ch.name === channel);
                        if (!getChannel) return console.log(`[ASCORE] ${channel} isn\'t accessable or is not real. Try again.`)
                        getChannel.send(msgString)
                        console.log(`[ASCORE] ${msgString} was sent in ${getGuild.name} in the channel ${getChannel.name}`)
                    }
                }
            }

            if (cmd[0] == 'proftotal') {
                let totalProfiles = await profileSchema.countDocuments()
                console.log(`[ASCORE] There is a total of ${totalProfiles} registered with KadenOS`)
            }

            if (cmd[0] == 'listen') {
                const guild = cmd[1] || null
                const channel = cmd[2] || null

                if (!guild) {
                    if (listenChannelList.length > 0) {
                        listenChannelList = []
                        console.log('[DEBUG]' + listenChannelList)
                        return console.log('[ASCORE] Listen List has been cleared.')
                    }
                    console.log('[ASCORE] Missing GuildID. speak <guild:guildID> <channel:channelName> <message:content>')
                }
                if (guild) {
                    if (!channel) {
                        console.log('[ASCORE] Missing ChannelName. speak <guild:guildID> <channel:channelName> <message:content>')
                    }
                    if (channel) {
                        const getGuild = await client.guilds.cache.get(guild)
                        const getChannel = await getGuild.channels.cache.find(ch => ch.name === channel);
                        if (!getChannel) return console.log(`[ASCORE] ${channel} isn\'t accessable or is not real. Try again.`)
                        listenChannelList.push(getChannel.id)
                        console.log(`[ASCORE] ${getChannel.name} has been whitelisted. New List: ${listenChannelList}`)
                        
                    }
                }
            }

        }



        rl.prompt();
    });

    // Set up an event listener for the 'close' event
    rl.on('close', () => {
        console.log('Goodbye!');
        process.exit()
    });

    // Start by prompting for input
    rl.setPrompt('');
    rl.prompt();

}


module.exports = { loadCore, listenChannelList }