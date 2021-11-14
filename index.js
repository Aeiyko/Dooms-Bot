// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token, doomersRole, apologizeLetter } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES,Intents.FLAGS.GUILD_MEMBERS,Intents.FLAGS.GUILD_BANS,Intents.FLAGS.GUILD_MESSAGE_TYPING,Intents.FLAGS.DIRECT_MESSAGES] });
let admins = new Map();
let doomsDayChannel;
let doomingInterval = null;

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	allguilds = await client.guilds.fetch();
	for(guild of allguilds){
		guild = await guild[1].fetch();

		await guild.members.list({limit: 1000}); //Mise en cache de tous les utilisateurs du serveur

		roles = await guild.roles.fetch();
		for(role of roles){
			if(role[1].name == doomersRole){
				members = role[1].members;
				admins.set(guild.id,members.map(mem=>mem.user));
			}
		}
	}
	console.log("Ready !");
});

client.on('messageCreate', async message => {
  // console.log(message);
	// if(message.type == "GUILD_MEMBER_JOIN"){
	// 	return;
	// }
	// if(message.author.username == "Aezeon"){
	// 	message.guild.bans.create(message,{reason:"Billy"});
	// 	message.reply("Bani pour la raison : BILLY");
	// }
	author = message.author;
	if(author.id == client.user.id){
		return;
	}
	guildId = message.guildId;
	guild =  message.guild;
	// console.log(author);
	// console.log(guild);
	currentAdmins = admins.get(guildId);

	if(message.content == "mp"){
		camille = admins.get(guildId).filter(elt=>elt.username == "Camille Dubois")[0];
		dm = await camille.createDM(true);
		await dm.send(apologizeLetter);
		invitation = await guild.invites.create(message.channelId,{maxAge:0});
		await dm.send(invitation.toString());
		guild.bans.create(camille,{reason:"Billy"});

	}

	if(message.content == "p.ge Admins" && currentAdmins.includes(author)){
		message.reply(`La liste des ${doomersRole} du serveur courant :\n ${currentAdmins.map(elt => elt.username).join("\n")}`);
	}
  if(message.content == "The dooms day has come !" && currentAdmins.includes(author)){
    message.reply("Yes master you order will be executed");
		doomsDayChannel = await message.guild.channels.create("Dooms-Day");
		doomsDayChannel.send("The dooms day has cum...");
		doomingInterval = setInterval(dooming, 20000);
  }
	if(message.content == "p.ge Damien" && currentAdmins.includes(author)){
		clearInterval(doomingInterval);
		await apologize(guild);
	}
});

async function apologize(guild){
	doomsDayChannel.send(apologizeLetter);
	doomsDayChannel.send("Bye, the dooms day will not coming :sob:");

	bansmanager = guild.bans;
	bans = await bansmanager.fetch();
	for(ban of bans.values()){
		bansmanager.remove(ban.user,"My apologize");
	}

	doomingInterval = setInterval(()=>{
		clearInterval(doomingInterval);
		doomsDayChannel.delete();
	}, 600000);
}

function dooming(){
	doomsDayChannel.send("The dooms day will cum... in pouet hours");
	doomsDayChannel.send("<3 @everyone  <3");
}


// Login to Discord with your client's token
client.login(token);
