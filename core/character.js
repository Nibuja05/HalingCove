/**
 * @module core/character
 */

/**
 * creates a new charcter for a user
 * @param  {int} 		bot       bot identification
 * @param  {connection} con       database Connection
 * @param  {int} 		userID    user identification
 * @param  {int} 		channelID channel identification
 * @param  {string} 	input     the user command
 */
function createNew(bot, con, userID, channelID, input) {
	console.log("Creating new character...");
	try {
		var name = input[0];

		//check if the user entered a name
		if (name.length == 0) {
			throw "Not a valid name for the character"
		}

		var sql = "SELECT cNr FROM charList WHERE name = '" + name + "' AND userID = " + userID + "";
		con.query(sql, function (err, result) {
		    if (err) throw err;

		    //check if this character already exists for the user
			if (result.length == 0) {
				console.log("New character, named " + name)

				//set all characters to inactive
				sql = "SELECT cNr, active FROM charList WHERE active = 1 AND userID = " + userID + "";
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

				//insert the new character and set it to active
				sql = "INSERT INTO charList (userID, name, level, class, active) VALUES ('" + userID + "', '" + name + "', '1', 'Unexperienced Adventurer', '1')";
				con.query(sql, function (err, result) {
				    if (err) throw err;
					console.log("[DB] 1 record inserted (charList)");
					show(bot, con, userID, channelID)
				});

			} else {
				var text = "You already have a character with the name **" + name + "**!";
				printMessage(bot, channelID, text);
				return;
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

/**
 * sends a message with information about the current character of this user
 * @param  {int} 		bot       bot identification
 * @param  {connection} con       database Connection
 * @param  {int} 		userID    user identification
 * @param  {int} 		channelID channel identification
 */
function show(bot, con, userID, channelID) {
	try {
		var sql = "SELECT userList.name AS userName, charList.name AS characterName, charList.level, charList.class FROM charList INNER JOIN userList ON charList.userID = userList.userID WHERE charList.active = 1 AND userList.userID = " + userID;
	    con.query(sql, function (err, result) {
	        if (err) throw err;

	        //check if there is an active character
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

/**
 * deletes a character with given name of a user. needs verification
 * @param  {int} 		bot       bot identification
 * @param  {connection} con       database Connection
 * @param  {int} 		userID    user identification
 * @param  {int} 		channelID channel identification
 * @param  {string} 	input     the user command
 * @param  {string} 	confirm   user reaction
 */
function deleteChar(bot, con, userID, channelID, input, confirm) {
	try {
		var name = input[0];

		//check if the user entered a name
		if (name.length == 0) {
			throw "Not a valid name for the character";
		}

		var found = false;
		var sql = "SELECT cNr, name FROM charList WHERE name = '" + name +"' AND userID = " + userID + "";
		con.query(sql, function (err, result) {
		    if (err) throw err;

		    //test if there is the character exists
			if (result.length > 0) {
				found = true;
			};

			//if the user answered with no, cancel the action
			if (confirm == "no" || confirm == "n") {
				sql = "UPDATE lastCommand SET optValues = 'none' WHERE userID = " + userID;
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("[DB] 1 record updated (lastCommand)")
                });
                var text = "Deleting **" + name + "** canceled"
                printMessage(bot, channelID, text);
				return;
			}

			//if the user confirmed the action, continue
			if (found == true && (confirm == "yes" || confirm == "y")) {
				console.log("Deleting the character " + name);
				sql = "DELETE FROM charList WHERE name = '" + name +"' AND userID = " + userID + "";
				con.query(sql, function (err, result) {
				    if (err) throw err;
					console.log("[DB] 1 record deleted (charList)");
				});
				var text = "<@" + userID + ">: Succesfully deleted the character " + name + "."; 
				printMessage(bot, channelID, text);
				sql = "UPDATE lastCommand SET optValues = 'none' WHERE userID = " + userID;
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("[DB] 1 record updated (lastCommand)")
                });

            //if there is no confirmation yet, ask the user if he wants to continue
			} else if(found == true && confirm == false) {
				sql = "UPDATE lastCommand SET optValues = 'confirm' WHERE userID = " + userID;
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("[DB] 1 record updated (lastCommand)")
                });
                var text = "Are you sure you want to delete **" + name + "**?";
                printMessage(bot, channelID, text)
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

/**
 * selects a character with given name of the user
 * @param  {int} 		bot       bot identification
 * @param  {connection} con       database Connection
 * @param  {int} 		userID    user identification
 * @param  {int} 		channelID channel identification
 * @param  {string} 	input     the user command
 */
function select(bot, con, userID, channelID, input) {
	try {
		var name = input[0];
		var sql = "SELECT cNr FROM charList WHERE userID = " + userID + " AND name = '" + name + "'";
	    con.query(sql, function (err, result) {
	        if (err) throw err;

	        //check if the character exists
	        if (result.length > 0) {
	        	var newChar = result[0];
	        	console.log(newChar)
	        	sql = "SELECT cNr FROM charList WHERE userID = " + userID + " AND active = 1";
	        	con.query(sql, function (err, result) {
				    if (err) throw err;
				    var oldChar = result[0];

				    //check if there is an active character
					if (oldChar != undefined) {

						//check if the character is already active
						if (oldChar.cNr != newChar.cNr) {

							//set the old character to inactive and the new one to active
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

					//set the new character to active
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

/**
 * sends a message with a list of all characters of a user
 * @param  {int} 		bot       bot identification
 * @param  {connection} con       database Connection
 * @param  {int} 		userID    user identification
 * @param  {int} 		channelID channel identification
 */
function showAll(bot, con, userID, channelID) {
	var sql = "SELECT name, level, class FROM charList WHERE userID = " + userID + "";
	con.query(sql, function (err, result) {
	    if (err) throw err;

	    //iterate over every result and add it to the list, then send the list as message
	    var text = "Currently you own following characters:\n";
		result.forEach(function(res) {
			var row = " - **" + res.name + "**, " + res.class + " level " + res.level + "\n";
			text = text + row;
		});
		printMessage(bot, channelID, text);
	});
}

/**
 * sends a message in a channel
 * @param  {int} 		bot       bot identification
 * @param  {int} 		channelID channel identification
 * @param  {string} 	text      the content of the message
 */
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
module.exports.showAll = showAll;
