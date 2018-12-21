var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

//initialize important variables
var character = require('./core/character.js')
var mysql = require('mysql')
pre = '$$'

//Establish Connection to the database
console.log("Start Connecting to DB...");

var server = "sql7.freemysqlhosting.net"
    var database = "sql7270616"
    var user = "sql7270616"
    var password = "1XgI9ZR5yD"

var con = mysql.createConnection({
  host: server,
  user: user,
  password: password,
  database: database
});

con.connect(err => {
    if(err) throw err;
    console.log("Connected to database!");
    con.query("SHOW TABLES", console.log);
});

//OnMessage Event
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    var len = pre.length;

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
                printMessage(channelID, "Pong!");
                break;
            case 'c':
                manageCharacter(user, userID, channelID, args, evt, confirm);
                break;
            case 'char':
                manageCharacter(user, userID, channelID, args, evt, confirm);
                break;
            case 'character':
                manageCharacter(user, userID, channelID, args, evt, confirm);
            break;
            // Just add any case commands if you want to..
        }
    });
});

function checkLastCommand(userID, channelID, message, callback) {
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
                        printMessage(channelID, text);
                        return;
                    } else if (message == "cancel") {
                        sql = "UPDATE lastCommand SET optValues = 'none' WHERE userID = " + userID;
                        con.query(sql, function (err, result) {
                            if (err) throw err;
                            console.log("[DB] 1 record updated (lastCommand)")
                        });
                        var text = "Action canceled"
                        printMessage(bot, channelID, text);
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

function manageCharacter(user, userID, channelID, args, evt, confirm) {
    //find user arguments
    var cmd = args[0];
    args = args.splice(1);

    switch(cmd) {
        case 'create':
            character.createNew(bot, con, userID, channelID, args)
            break;
        case 'delete':
            character.deleteChar(bot, con, userID, channelID, args, confirm);
            break;
        case 'show':
            character.show(bot, con, userID, channelID);
            break;
        case 'select':
            character.select(bot, con, userID, channelID, args);
            break;
        case 'showAll':
            character.showAll(bot, con, userID, channelID);
        break;
    }
}

function showTable(con, name) {
    var sql = "SELECT * FROM " + name;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result);
    });
}

function printMessage(channelID, text) {
    bot.sendMessage({
        to: channelID,
        message: text
    });
}