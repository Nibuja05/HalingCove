var Discord = require('discord.js');
var auth = require('./auth.json');

const client = new Discord.Client();
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(auth.token);

//initialize important variables
var character = require('./core/character.js')
var item = require('./core/item.js')
var mysql = require('mysql')
const pre = '$$'

//Establish Connection to the database
console.log("Start Connecting to DB...");

/*
var server = "sql7.freemysqlhosting.net"
var database = "sql7270616"
var user = "sql7270616"
var password = "1XgI9ZR5yD"
 */

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

client.on('message', msg => {
	var len = pre.length;

    var user = msg.client.user;
    var userID = user.id;
    var channel = msg.channel;
    var channelID = channel.id;
    var message = msg.content;


    //check the last command
    checkLastCommand(userID, channelID, message, function(confirm, newMessage) {

        console.log(" -> new Message: " + newMessage + " (confirm: " + confirm + ")");

        var args = newMessage.substring(len).split(' ');
        var cmd = args[0];
        args = args.splice(1);

        userCheck(user, userID)
        
        switch(cmd) {
            // !ping
            case 'ping':
                printMessage(channel, "Pong!");
                break;
            case 'c':
                manageCharacter(msg, user, userID, channel, args, confirm);
                break;
            case 'char':
                manageCharacter(msg, user, userID, channel, args, confirm);
                break;
            case 'character':
                manageCharacter(msg, user, userID, channel, args, confirm);
            	break;
            case 'dev':
            	manageDevOperations(msg, user, userID, channel, args, confirm);
            break;
            // Just add any case commands if you want to..
        }
    });
});

function checkLastCommand(userID, channel, message, callback) {
    var sql = "SELECT functionName, optValues FROM lastCommand WHERE userID = " + userID;
    con.query(sql, function (err, result) {
        if (err) throw err;
        var functionName = message.substring(pre.length);
        if (result.length > 0) {
            if (message === pre) {
                console.log("Executing command again: $$" + result[0].functionName);
                return callback(false, "$$" + result[0].functionName);
            } else {
                var optVal = result[0].optValues;
                if (optVal === "confirm") {
                    if (message.substring(0, pre.length) == pre) {
                        var text = "No new command allowed, please answer or write 'cancel'"
                        printMessage(channel, text);
                        return;
                    } else if (message == "cancel") {
                        sql = "UPDATE lastCommand SET optValues = 'none' WHERE userID = " + userID;
                        con.query(sql, function (err, result) {
                            if (err) throw err;
                            console.log("[DB] 1 record updated (lastCommand)")
                        });
                        var text = "Action canceled"
                        printMessage(channel, text);
                        return;
                    } else {
                        return callback(message, "$$" + result[0].functionName);
                    }
                }
                if (message.substring(0, pre.length) == pre) {
                    sql = "UPDATE lastCommand SET functionName = '" + functionName + "' WHERE userID = " + userID;
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log("[DB] 1 record updated (lastCommand)");
                        return callback(false, message);
                    });
                }
            }
        } else {
            if (message.substring(0, pre.length) == pre) {
                sql = "INSERT INTO lastCommand (userID, functionName, optValues) VALUES (" + userID + ", '" + functionName + "', 'none')";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("[DB] 1 record inserted (lastCommand)");
                    return callback(false, message);
                });
            }
        }
    });
}

function userCheck(user, userID) {
    var sql = "SELECT * FROM userList WHERE userID = " + userID;
    con.query(sql, function (err, result) {
        if (err) throw err;
        if (result.length < 1) {
            console.log("No user in DB with ID " + userID + ". Creating new entry")
            var sql = "INSERT INTO userList (userID, name) VALUES ('" + userID + "', '" + user + "')";
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("[DB] 1 record inserted (userList)");
            });
        }
    });
}

function manageCharacter(msg, user, userID, channel, args, confirm) {
    //find user arguments
    var cmd = args[0];
    args = args.splice(1);

    switch(cmd) {
        case 'create':
            character.createNew(con, userID, channel, args)
            break;
        case 'delete':
            character.deleteChar(con, userID, channel, args, confirm);
            break;
        case 'show':
            character.show(con, userID, channel);
            break;
        case 'select':
            character.select(con, userID, channel, args);
            break;
        case 'showAll':
            character.showAll(con, userID, channel);
        break;
    }
}

function manageDevOperations(msg, user, userID, channel, args, confirm) {
	//find user arguments
	var admin = false;
	var adminRole = '524938050380365836';
	admin = true;

	if (admin) {
		var cmd = args[0];
	    args = args.splice(1);

	    switch(cmd) {
	        case 'createRandomItem':
	        	if (args.length < 1) {
	            	item.createRandom(con);
	        	} else {
	        		item.createRandomMultiple(con, args);
	        	}
	            break;
	        case 'test':
	        	console.log("[Admin] Test!")
	        break;
	    }
	}

}

function showTable(con, name) {
    var sql = "SELECT * FROM " + name;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result);
    });
}

/**
 * sends a message in the current Channel
 * @param  {string} channelID channel identifier
 * @param  {string} text      text to send
 */
function printMessage(channel, text) {
    channel.send(text)
  	.then(message => console.log(`Sent message: ${message.content}`))
  	.catch(console.error);
}

/**
 * @module main
 */

 