/**
 * @module bot
 */

//initialize Discord Bot
const Discord = require('discord.js');
const auth = require('./auth.json');
const mysql = require('mysql')
const client = new Discord.Client();
const prefix = "$$";

client.login(auth.token);

client.on('ready', () => {
  	console.log(`Logged in as ${client.user.tag}!`);
  	client.user.setActivity(prefix + " as prefix");
});

//Establish Connection to the database
console.log("Start Connecting to DB...");

var server = "www.db4free.net"
var database = "dungeondwarfs"
var user = "nibuja"
var password = "pw1345!PW"

var con = mysql.createConnection({
  host: server,
  user: user,
  password: password,
  database: database
});

con.connect(err => {
    if(err) throw err;
    con.query("SHOW TABLES", console.log);
    console.log("Connected to database!");
});

//main stuff here
client.on('message', msg => {

  	function emoji (id) {
		return client.emojis.get(id).toString();
	}

	if (msg.author.bot) return;

	checkLastCommand(msg, function(confirm, newMessage) {
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
			}
		}
	});
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

function checkLastCommand(msg, callback) {
	var user = msg.author;
	var channel = msg.channel;
	var message = msg.content;
    var sql = "SELECT functionName, optValues FROM lastCommand WHERE userID = " + user.id;
    con.query(sql, function (err, result) {
        if (err) throw err;
        var functionName = message.substring(prefix.length);
        if (result.length > 0) {
            if (message === prefix) {
                console.log("Executing command again: $$" + result[0].functionName);
                return callback(false, prefix + result[0].functionName);
            } else {
                var optVal = result[0].optValues;
                if (optVal === "confirm") {
                    if (message.substring(0, prefix.length) == prefix) {
                        var text = "No new command allowed, please answer or write 'cancel'"
                        printMessage(channel, text);
                        return;
                    } else if (message == "cancel") {
                        sql = "UPDATE lastCommand SET optValues = 'none' WHERE userID = " + user.id;
                        con.query(sql, function (err, result) {
                            if (err) throw err;
                            console.log("[DB] 1 record updated (lastCommand)")
                        });
                        var text = "Action canceled"
                        printMessage(channel, text);
                        return;
                    } else {
                        return callback(message, prefix + result[0].functionName);
                    }
                }
                if (message.substring(0, prefix.length) == prefix) {
                    sql = "UPDATE lastCommand SET functionName = '" + functionName + "' WHERE userID = " + user.id;
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log("[DB] 1 record updated (lastCommand)");
                        return callback(false, message);
                    });
                }
            }
        } else {
            if (message.substring(0, prefix.length) == prefix) {
                sql = "INSERT INTO lastCommand (userID, functionName, optValues) VALUES (" + user.id + ", '" + functionName + "', 'none')";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("[DB] 1 record inserted (lastCommand)");
                    return callback(false, message);
                });
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
    }
}

function printMessage(channel, text) {
	channel.send(text)
  	.then(message => console.log(`Sent message: ${message.content}`))
  	.catch(console.error);
}
