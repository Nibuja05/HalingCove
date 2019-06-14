/**
 * @module bot
 */

//initialize Discord Bot
const Discord = require('discord.js');
const auth = require('C://auth.json');
const mysql = require('mysql');
const util = require('util');
const client = new Discord.Client();
const prefix = "$$";

client.login(auth.token);

client.on('ready', () => {
  	console.log("\x1b[36m%s\x1b[0m", `[BOT] Logged in as ${client.user.tag}!`);
  	client.user.setActivity(prefix + " as prefix");
});

//Establish Connection to the database
console.log("\n");
console.log("\x1b[32m%s\x1b[0m", "[DB] Start connecting...");

var server = auth.server;
var database = auth.database;
var user = auth.user;
var password = auth.password;

var con = mysql.createConnection({
  host: server,
  user: user,
  password: password,
  database: database
});

con.connect(err => {
    if(err) throw err;
    con.query = util.promisify(con.query);
    console.log("\x1b[32m%s\x1b[0m", "[DB] Connected!");
});

client.on('message', async msg => {

  	function emoji (id) {
		return client.emojis.get(id).toString();
	}

	if (msg.author.bot) return;

	checkLastCommand(msg, (confirm, newMessage) => {

		if (newMessage.startsWith(prefix)) {
			var args = newMessage.substring(prefix.length).split(' ');
			var cmd = args[0];
			args = args.splice(1);

			userCheck(msg.author)

			console.log("\x1b[33m%s\x1b[0m", "[BOT] Executing: " + newMessage + "; confirm: " + confirm);

			switch(cmd) {
			    case 'ping':
			        printMessage(msg.channel, "Pong!");
			        break;
			    case 'c':
			        manageCharacter(msg, args, confirm);
			        break;
			    case 'char':
			        manageCharacter(msg, args, confirm);
			        break;
			    case 'character':
			        manageCharacter(msg, args, confirm);
			        break;
			    case 'dev':
			    	manageDevCommands(msg, args, confirm);
			    	break;
			    case 'inv':
			    	manageInventory(msg, args, confirm);
			    	break;
			    case 'inventory':
			    	manageInventory(msg, args, confirm);
			    	break;
			    case 'explore':
			    	manageExplore(msg, args, confirm);
			    	break;
			    case 'e':
			    	manageExplore(msg, args, confirm);
			    	break;
			    case 'map':
			    	manageMap(msg, args, confirm);
			    	break;
			    case 'm':
			    	manageMap(msg, args, confirm);
			    	break;
			    case 'local':
			    	manageLocal(msg, args, confirm);
			    	break;
			    case 'help':
			    	manageHelp(msg, args, confirm);
			    	break;
			    case 'h':
			    	manageHelp(msg, args, confirm);
			    	break;
			}
		}
	});

});

/**
 * simply check, if the user is already registered
 * @param  {user} user user to check
 */
async function userCheck(user) {
    var sql = "SELECT * FROM userList WHERE userID = " + user.id;
    var result = await con.query(sql);
    
    if (result.length < 1) {
        console.log("\x1b[32m%s\x1b[0m", "[DB] No user with ID " + user.id + ". Creating new entry")
        var sql = "INSERT INTO userList (userID, name) VALUES ('" + user.id + "', '" + user.username + "')";
        result = await con.query(sql);
        console.log("\x1b[32m%s\x1b[0m", "[DB] 1 record inserted (userList)");
    }
}

/**
 * checks if the last command requires an answer and other command checking features
 * @param  {message} 	msg 	message object
 * @return {Promise}     		Promise returns confirm and the new message
 */
function checkLastCommand(msg, callback) {

	return new Promise(async (resolve, reject) => {
		var user = msg.author;
		var channel = msg.channel;
		var message = msg.content;
	    var sql = "SELECT functionName, optValues FROM lastCommand WHERE userID = " + user.id;
	    var result = await con.query(sql);
	    var functionName = message.substring(prefix.length);

	    //check if there is a last command for this user
	    if (result.length > 0) {

	    	//if the message is only the prefix, execute last command again
	        if (message === prefix) {
	            console.log("\x1b[33m%s\x1b[0m", "[BOT] Executing command again: $$" + result[0].functionName);
	            callback(false, prefix + result[0].functionName);

	        } else {

	        	//if the last command requires a confirm, execute it again with new confirm value
	            var optVal = result[0].optValues;
	            if (optVal.includes("confirm")) {

	            	//if the user wants to use a command while the bot awaits a confirm, cancel
	                if (message.substring(0, prefix.length) == prefix) {
	                    var text = "No new command allowed, please answer or write 'cancel'"
	                    printMessage(channel, text);
	                    return;

	                //possibility for the user to cancel his confirm action
	                } else if (message == "cancel") {
	                    sql = "UPDATE lastCommand SET optValues = 'none' WHERE userID = " + user.id;
	                    result = await con.query(sql);
	                    
	                    console.log("\x1b[32m%s\x1b[0m", "[DB] 1 record updated (lastCommand)")
	                    var text = "Action canceled"
	                    printMessage(channel, text);
	                    return;

	                //exevute last command with new confirm
	                } else {
	                    callback(message, prefix + result[0].functionName);
	                }
	            }

	            //if the message is an command, save it in the database
	            if (message.substring(0, prefix.length) == prefix) {
	                sql = "UPDATE lastCommand SET functionName = '" + functionName + "' WHERE userID = " + user.id;
	                result = await con.query(sql);

	                console.log("\x1b[32m%s\x1b[0m", "[DB] 1 record updated (lastCommand)");
	                callback(false, message);
	            }
	        }

	    //no last command for this user
	    } else {

	    	//create a new entry with the last command in the database
	        if (message.substring(0, prefix.length) == prefix) {
	            sql = "INSERT INTO lastCommand (userID, functionName, optValues) VALUES (" + user.id + ", '" + functionName + "', 'none')";
	            result = await con.query(sql);

	            console.log("\x1b[32m%s\x1b[0m", "[DB] 1 record inserted (lastCommand)");
	            callback(false, message);
	        }
	    }
	});
}

function manageCharacter(msg, args, confirm) {
    //find user arguments
    
    var character = require('./core/character.js');
    var cmd = args[0];
    args = args.splice(1);

    var user = msg.author;
    var channel = msg.channel;

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
        case undefined:
            character.show(con, user.id, channel);
            break;
        case 'select':
            character.select(con, user.id, channel, args);
            break;
        case 'showAll':
            character.showAll(con, user.id, channel);
            break;
        case 'equipment':
        	character.showEquip(con, user, channel);
        	break;
        case 'equip':
        	character.equip(con, user, channel, args);
        	break;
    }
}

async function manageDevCommands(msg, args, confirm) {

	const item = require('./core/item.js');
	const fight = require('./core/fight.js');
	const explore = require('./core/explore.js');
	const character = require('./core/character.js');
    const helper = require('./core/helperfuncs.js');
    var cmd = args[0];
    args = args.splice(1);

    var user = msg.author;
    var channel = msg.channel;

    switch(cmd) {
        case 'test':
            console.log("[DEV] Test!")
            break;
        case 'createRandomItems':
            item.createRandomMultiple(con, channel, user, args);
            break;
        case 'createRandomItem':
        	item.createSpecific(con, channel, user, args);
        	break;
        case 'testFight':
        	fight.start(con, user, channel);
        	break;
        case 'endExplore':
        	explore.endExplore(con, channel, user);
        	break;
        case 'playerTest':
        	fight.test(con, user, channel);
        	break;
        case 'classChange':
        	character.changeClass(con, user, channel, args);
        	break;
        case 'DB':
            var sql = "SELECT functionName, optValues FROM lastCommand WHERE userID = " + user.id;
            var result = await helper.databaseRequest(con, sql);
            console.log(result);
            break;
        case 'item':
            var itemID = 1;
            var result = await helper.getItemByID(con, itemID);
            console.log(result);
            break;
        case 'uItem':
            var itemID = 1;
            var result = await helper.getUniqueItemByID(con, itemID);
            console.log(result);
            break;

    }
}

function manageInventory(msg, args, confirm) {

	var inventory = require('./core/inventory.js');
	var cmd = args[0];
    args = args.splice(1);

    var user = msg.author;
    var channel = msg.channel;

    switch(cmd) {
        case 'show':
            inventory.show(con, channel, user);
            break;
        case undefined:
        	inventory.show(con, channel, user);
        	break;
    }
}

function manageExplore(msg, args, confirm) {

	var explore = require('./core/explore.js');
	var cmd = args[0];
    args = args.splice(1);

    var user = msg.author;
    var channel = msg.channel;

    switch(cmd) {
        case 'start':
            explore.start(con, channel, user, args, confirm);
            break;
        case undefined:
        	explore.help(con, channel, user);
        	break;
        case 'status':
        	explore.status(con, channel, user);
        	break;
        case 'claim':
        	explore.claim(con, channel, user);
        	break;
    }
}

function manageMap(msg, args, confirm) {
	var map = require('./core/map.js');
	var cmd = args[0];
    args = args.splice(1);

    var user = msg.author;
    var channel = msg.channel;

    switch(cmd) {
        case 'show':
        	map.show(con, channel, user);
            break;
        case undefined:
        	map.show(con, channel, user);
        	break;
        case 'travel':
        	map.travelTo(con, channel, user, args);
        	break;
    }
}

function manageLocal(msg, args, confirm) {
	var map = require('./core/map.js');
	var cmd = args[0];

    var user = msg.author;
    var channel = msg.channel;

    map.showLocal(con, channel, user, args, confirm);
}

function manageHelp(msg, args, confirm) {
	var help = require('./core/help.js');
    var cmd = args[0];
    args = args.splice(1);

    var user = msg.author;
    var channel = msg.channel;

    help.showHelp(prefix, cmd, args, user, channel);

}

function printMessage(channel, text) {
	channel.send(text)
  	.then(message => console.log("\x1b[36m%s\x1b[0m", `[BOT] Sent message: ${message.content}`))
  	.catch(console.error);
}
