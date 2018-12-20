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

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    var len = pre.length;
    if (message.substring(0, len) == pre) {
        var args = message.substring(len).split(' ');
        var cmd = args[0];
        args = args.splice(1);

        userCheck(user, userID)
        
        switch(cmd) {
            // !ping
            case 'ping':
                printMessage(channelID, "Pong!");
                break;
            case 'c':
                manageCharacter(user, userID, channelID, args, evt);
                break;
            case 'char':
                manageCharacter(user, userID, channelID, args, evt);
                break;
            case 'character':
                manageCharacter(user, userID, channelID, args, evt);
            break;
            // Just add any case commands if you want to..
         }
     }
});

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

function userCheck(user, userID) {
    var sql = "SELECT * FROM userList WHERE userID = " + userID;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result)
        if (result.length < 1) {
            console.log("No user in DB with ID " + userID + ". Creating new entry")
            var sql = "INSERT INTO userList (userID, name) VALUES ('" + userID + "', '" + user + "')";
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
        }
    });
}

function manageCharacter(user, userID, channelID, args, evt) {
    //find user arguments
    var cmd = args[0];
    args = args.splice(1);

    switch(cmd) {
        case 'create':
            if (character.createNew(con, userID, args)) {
                character.show(bot, con, userID, channelID);
            };
            break;
        case 'delete':
            character.deleteChar(bot, con, userID, channelID, args, true);
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