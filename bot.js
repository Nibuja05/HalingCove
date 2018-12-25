/**
 * @module bot
 */

const Discord = require('discord.js');
var auth = require('./auth.json');
const client = new Discord.Client();
const prefix = "$$";

client.login(auth.token);

client.on('ready', () => {
  	console.log(`Logged in as ${client.user.tag}!`);
  	client.user.setActivity("& as prefix");
});

client.on('message', msg => {

  	function emoji (id) {
		return client.emojis.get(id).toString();
	}

	if (msg.author.bot) return;

	if (msg.content.startsWith(prefix)) {
		var args = msg.content.substring(prefix.length).split(' ');
		var cmd = args[0];
		args = args.splice(1);

		userCheck(user, userID)

		switch(cmd) {
		    case 'ping':
		        printMessage(channel, "Pong!");
		        break;
		    case 'c':
		        manageCharacter(msg, args, confirm);
		        break;
		    case 'char':
		        manageCharacter(msg, args, confirm);
		        break;
		    case 'character':
		        manageCharacter(msg, asg, confirm);
		    break;
		}

	}
});

function manageCharacter(msg, args, confirm) {
    //find user arguments
    
    var character = require('./core/character.js');
    var cmd = args[0];
    args = args.splice(1);

    var user = msg.author;

    switch(cmd) {
        case 'create':
            character.createNew(con, user.id, channel, args);
            break;
        case 'delete':
            character.deleteChar(con, user.id, channel, args, confirm);
            break;
        case 'show':
            character.show(con, user.id, channel);
            break;
        case 'select':
            character.select(con, user.id, channel, args);
            break;
        case 'showAll':
            character.showAll(con, user.id, channel);
        break;
    }
}

function sendMessage(channel, text) {
	channel.send(text)
  	.then(message => console.log(`Sent message: ${message.content}`))
  	.catch(console.error);
}
