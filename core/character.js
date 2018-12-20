
function createNew(con, userID, input) {
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

function show(bot, con, userID, channelID) {
	try {
		var sql = "SELECT userList.name AS userName, charList.name AS characterName, charList.level, charList.class FROM charList INNER JOIN userList ON charList.userID = userList.userID WHERE charList.active = 1 AND userList.userID = " + userID;
	    con.query(sql, function (err, result) {
	        if (err) throw err;
	        if (result.length > 0) {
	        	var uName = result[0].userName;
		       	var charName = "**" + result[0].characterName + "**";
		       	var level = result[0].level;
		       	var className = result[0].class;
		       	var text = "<@" + userID + ">: You're currently playing as the " + className + " " + charName + " lvl " + level + ".";
		       	printMessage(bot, channelID, text); 
	       	} else {
	       		var text = "You have no active character!"
	       		printMessage(bot, channelID, text)
	       	}
	    });
	} 
	catch (e) {
		console.log("Invalid Arguments")
	}
} 

function deleteChar(bot, con, userID, channelID, input, confirm) {
	try {
		var name = input[0];
		if (name.length == 0) {
			throw "Not a valid name for the character";
		}
		console.log("Deleting the character " + name);
		var found = false;
		var sql = "SELECT cNr, name FROM charList WHERE name = '" + name +"' AND userID = " + userID + "";
		con.query(sql, function (err, result) {
		    if (err) throw err;
			if (result.length > 0) {
				found = true;
			};
			if (found == true && confirm == true) {
				sql = "DELETE FROM charList WHERE name = '" + name +"' AND userID = " + userID + "";
				con.query(sql, function (err, result) {
				    if (err) throw err;
					console.log("1 record deleted");
				});
				var text = "<@" + userID + ">: Succesfully deleted the character " + name + "."; 
				printMessage(bot, channelID, text);
			}
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

function select(bot, con, userID, channelID, input) {
	try {
		var name = input[0];
		var sql = "SELECT cNr FROM charList WHERE userID = " + userID + " AND name = '" + name + "'";
	    con.query(sql, function (err, result) {
	        if (err) throw err;
	        if (result.length > 0) {
	        	var newChar = result[0];
	        	console.log(newChar)
	        	var oldChar = 0;
	        	sql = "SELECT cNr FROM charList WHERE userID = " + userID + " AND active = 1";
	        	con.query(sql, function (err, result) {
				    if (err) throw err;
				    oldChar = result[0];
					if (oldChar != undefined) {
						if (oldChar.cNr != newChar.cNr) {
							sql = "UPDATE charList SET active = 0 WHERE cNr = " + oldChar.cNr;
							con.query(sql, function (err, result) {
								if (err) throw err;
								sql = "UPDATE charList SET active = 1 WHERE cNr = " + newChar.cNr;
								con.query(sql, function (err, result) {
									if (err) throw err;
									show(bot, con, userID, channelID);
								});
							});
						} else {
							var text = "This character is already active"
	       					printMessage(bot, channelID, text)
						}
					} else {
						sql = "UPDATE charList SET active = 1 WHERE cNr = " + newChar.cNr;
						con.query(sql, function (err, result) {
							if (err) throw err;
							show(bot, con, userID, channelID);
						});
					}
				});
	       	} else {
	       		var text = "This character does not exist!"
	       		printMessage(bot, channelID, text)
	       	}
	    });
	} 
	catch (e) {
		console.log("Invalid Arguments")
	}
}

function printMessage(bot, channelID, text) {
    bot.sendMessage({
        to: channelID,
        message: text
    });
}

module.exports.createNew = createNew;
module.exports.show = show;
module.exports.deleteChar = deleteChar;
module.exports.select = select;
