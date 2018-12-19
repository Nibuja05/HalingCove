
function createNew(userID, con, input) {
	console.log("Creating new character...");
	try {
		var name = input[0];
		if (name.length == 0) {
			throw "Not a valid name for the character"
		}
		console.log("New character, named " + name)
		console.log("Connected!");
		var sql = "SELECT cNr, active FROM charList WHERE active = 1 AND userID = " + userID + "";
		con.query(sql, function (err, result) {
		    if (err) throw err;
			result.forEach(function(res) {
				sql = "UPDATE charList SET active = 0 WHERE cNr = " + res.cNr;
				con.query(sql, function (err, result) {
					if (err) throw err;
					console.log("active changed");
				});
			});
		});
		sql = "INSERT INTO charList (userID, name, level, class, active) VALUES ('" + userID + "', '" + name + "', '1', 'Unexperienced Adventurer', '1')";
		con.query(sql, function (err, result) {
		    if (err) throw err;
			console.log("1 record inserted");
		});
	}
	catch (e) {
		if (typeof e === 'string') {
			console.log(e)
		} else {
			console.log("Invalid Arguments");
		}	
		return false;
	}
	return true;
}	

function show(bot, userID, channelID, con) {
	var sql = "SELECT userList.name AS userName, charList.name AS characterName, charList.level, charList.class FROM charList INNER JOIN userList ON charList.userID = userList.userID WHERE charList.active = 1 AND userList.userID = " + userID;
    con.query(sql, function (err, result) {
        if (err) throw err;
        var uName = result[0].userName;
       	var charName = "**" + result[0].characterName + "**";
       	var level = result[0].level;
       	var className = result[0].class;
       	var text = "<@" + userID + ">: Your currently playing as the " + className + " " + charName + " lvl " + level + ".";
       	printMessage(bot, text, channelID); 
    });
} 

function deleteChar(userID, con, input, bot, channelID, confirm) {
	try {
		var name = input[0];
		if (name.length == 0) {
			throw "Not a valid name for the character"
		}
		console.log("Deleting the character " + name)
		console.log("Connected!");
		var sql = "SELECT cNr, active FROM charList WHERE active = 1 AND userID = " + userID + "";
		con.query(sql, function (err, result) {
		    if (err) throw err;
			result.forEach(function(res) {
				sql = "UPDATE charList SET active = 0 WHERE cNr = " + res.cNr;
				con.query(sql, function (err, result) {
					if (err) throw err;
					console.log("active changed");
				});
			});
		});
		sql = "INSERT INTO charList (userID, name, level, class, active) VALUES ('" + userID + "', '" + name + "', '1', 'Unexperienced Adventurer', '1')";
		con.query(sql, function (err, result) {
		    if (err) throw err;
			console.log("1 record inserted");
		});
	}
	catch (e) {
		if (typeof e === 'string') {
			console.log(e)
		} else {
			console.log("Invalid Arguments");
		}	
		return false;
	}
	return true;

}

function printMessage(bot, text, channelID) {
    bot.sendMessage({
        to: channelID,
        message: text
    });
}

module.exports.createNew = createNew;
module.exports.show = show;
module.exports.deleteChar = deleteChar;