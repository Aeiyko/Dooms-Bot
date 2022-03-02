// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token, doomersRole, apologizeLetter } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES,Intents.FLAGS.GUILD_MEMBERS,Intents.FLAGS.GUILD_BANS,Intents.FLAGS.GUILD_MESSAGE_TYPING,Intents.FLAGS.DIRECT_MESSAGES] });
let admins = new Map();
let doomsDayChannel = null;
let doomingInterval = null;

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOURS = MINUTE * 60;

const COMMANDS = [
	{
		// command for test dm
		condition: (message, currentAdmins) => message.content == "mp",
		action: async (message, currentAdmins) => {
			let camille = admins.get(message.guildId).filter(elt=>elt.username == "Camille Dubois")[0];
			let dm = await camille.createDM(true);
			await dm.send(apologizeLetter);
			let invitation = await message.guild.invites.create(message.channelId,{maxAge:0});
			await dm.send(invitation.toString());
			guild.bans.create(camille,{reason:"Billy"});
		},
	},
	{
		// list all admins in the server
		condition: (message, currentAdmins) => message.content == "p.ge Admins" && currentAdmins.includes(message.author),
		action: async (message, currentAdmins) => {
			message.reply(`La liste des ${doomersRole} du serveur courant :\n ${currentAdmins.map(elt => elt.username).join("\n")}`);
		},
	},
	{
		// launch the dooms day
		condition: (message, currentAdmins) => message.content == "The dooms day has come !" && currentAdmins.includes(message.author),
		action: async (message, currentAdmins) => {
			message.reply("Yes master you order will be executed");
			doomsDayChannel = await message.guild.channels.create("Dooms-Day");
			doomsDayChannel.send("The dooms day has cum...");
			doomingInterval = setInterval(dooming, 20 * SECOND);
		},
	},
	{
		// cancel the dooms day
		condition: (message, currentAdmins) => doomingInterval && message.content == "p.ge Damien" && currentAdmins.includes(message.author),
		action: async (message, currentAdmins) => {
			clearInterval(doomingInterval);
			await apologize(message.guild);
		},
	},
	{
		// auto ban any people who's talking in the dooms day channel
		condition: (message, currentAdmins) => doomingInterval && message.channelId == doomsDayChannel.id && !currentAdmins.includes(message.author),
		action: async (message, currentAdmins) => {
			message.guild.bans.create(message,{reason:"Billy"});
			message.reply("Bani pour la raison : BILLY");
		},
	},
]

// When the client is ready, run this code (only once)
client.once('ready', async () => {
    let allguilds = await client.guilds.fetch();
    for(let guild of allguilds){
        guild = await guild[1].fetch();

        await guild.members.list({limit: 1000}); //Mise en cache de tous les utilisateurs du serveur

        let roles = await guild.roles.fetch();
        for(let role of roles){
            if(role[1].name == doomersRole){
                let members = role[1].members;
                admins.set(guild.id,members.map(mem=>mem.user));
            }
        }
    }
    console.log("Ready !");
});

client.on('messageCreate', async message => {
    console.log(message);
    // if(message.author.username == "Aezeon"){
    // 	message.guild.bans.create(message,{reason:"Billy"});
    // 	message.reply("Bani pour la raison : BILLY");
    // }
    if(message.author.id == client.user.id || message.type == "GUILD_MEMBER_JOIN"){
        return;
    }
    let currentAdmins = admins.get(message.guildId);

    for (const command of COMMANDS) {
		if(command.condition(message, currentAdmins)) command.action(message, currentAdmins);
	}
});

async function apologize(guild){
    doomsDayChannel.send(apologizeLetter);
    doomsDayChannel.send("Bye, the dooms day will not coming :sob:");

    let bansmanager = guild.bans;
    let bans = await bansmanager.fetch();
    for(let ban of bans.values()){
        bansmanager.remove(ban.user,"My apologize");
    }

    doomingInterval = setInterval(()=>{
        clearInterval(doomingInterval);
        doomsDayChannel.delete();
		doomsDayChannel = null;
		doomingInterval = null;
    }, 10 * MINUTE);
}

function dooming(){
    doomsDayChannel.send("The dooms day will cum... in pouet hours");
    doomsDayChannel.send("<3 @everyone  <3");
}

// Login to Discord with your client's token
client.login(token);
