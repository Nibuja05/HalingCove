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
  	console.log(`Logged in as ${client.user.tag}!`);
  	client.user.setActivity(prefix + " as prefix");
});

//Establish Connection to the database
console.log("Start Connecting to DB...");

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
    console.log("Connected to database!");
});

//main stuff here
client.on('message', async msg => {

  	function emoji (id) {
		return client.emojis.get(id).toString();
	}

	if (msg.author.bot) return;

	const check = await checkLastCommand(msg);
	console.log(check);
	var confirm = check[0];
	var newMessage = check[1];

	if (newMessage.startsWith(prefix)) {
		var args = newMessage.substring(prefix.length).split(' ');
		var cmd = args[0];
		args = args.splice(1);

		userCheck(msg.author)

		console.log("Executing: " + newMessage + " with " + confirm);

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
		}
	}
});

function userCheck(user) {
    var sql = "SELECT * FROM userList WHERE userID = " + user.id;
    con.query(sql, function (err, result) {
        if (err) throw err;
        if (result.length < 1) {
            console.log("No user in DB with ID " + user.id + ". Creating new entry")
            var sql = "INSERT INTO userList (userID, name) VALUES ('" + user.id + "', '" + user.username + "')";
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("[DB] 1 record inserted (userList)");
            });
        }
    });
}

/**
 * checks if the last command requires an answer and other command checking features
 * @param  {message} 	msg 	message object
 * @return {Promise}     		Promise returns confirm and the new message
 */
function checkLastCommand(msg) {

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
	            console.log("Executing command again: $$" + result[0].functionName);
	            resolve([false, prefix + result[0].functionName]);

	        } else {

	        	//if the last command requires a confirm, execute it again with new confirm value
	            var optVal = result[0].optValues;
	            if (optVal === "confirm") {

	            	//if the user wants to use a command while the bot awaits a confirm, cancel
	                if (message.substring(0, prefix.length) == prefix) {
	                    var text = "No new command allowed, please answer or write 'cancel'"
	                    printMessage(channel, text);
	                    reject();

	                //possibility for the user to cancel his confirm action
	                } else if (message == "cancel") {
	                    sql = "UPDATE lastCommand SET optValues = 'none' WHERE userID = " + user.id;
	                    result = await con.query(sql);
	                    
	                    console.log("[DB] 1 record updated (lastCommand)")
	                    var text = "Action canceled"
	                    printMessage(channel, text);
	                    reject();

	                //exevute last command with new confirm
	                } else {
	                    resolve([message, prefix + result[0].functionName]);
	                }
	            }

	            //if the message is an command, save it in the database
	            if (message.substring(0, prefix.length) == prefix) {
	                sql = "UPDATE lastCommand SET functionName = '" + functionName + "' WHERE userID = " + user.id;
	                result = await con.query(sql);

	                console.log("[DB] 1 record updated (lastCommand)");
	                resolve([false, message]);
	            }
	        }

	    //no last command for this user
	    } else {

	    	//create a new entry with the last command in the database
	        if (message.substring(0, prefix.length) == prefix) {
	            sql = "INSERT INTO lastCommand (userID, functionName, optValues) VALUES (" + user.id + ", '" + functionName + "', 'none')";
	            result = await con.query(sql);

	            console.log("[DB] 1 record inserted (lastCommand)");
	            return callback(false, message);
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
    }
}

function manageDevCommands(msg, args, confirm) {

	var item = require('./core/item.js');
    var cmd = args[0];
    args = args.splice(1);

    var user = msg.author;
    var channel = msg.channel;

    switch(cmd) {
        case 'test':
            console.log("Test!")
            break;
        case 'createRandomItem':
            item.createRandomMultiple(con, channel, args);
            break;
        case 'itemTest':
        	item.createRandom(con, channel, 10, false);
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

function printMessage(channel, text) {
	channel.send(text)
  	.then(message => console.log(`Sent message: ${message.content}`))
  	.catch(console.error);
}
