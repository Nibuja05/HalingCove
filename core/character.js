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
async function createNew(con, userID, channel, input) {
	console.log("Creating new character...");
	try {
		var name = input[0];

		//check if the user entered a name
		if (name.length == 0) {
			throw "Not a valid name for the character"
		}

		var sql = "SELECT cNr FROM charList WHERE name = '" + name + "' AND userID = " + userID + "";
		var result = await con.query(sql);

	    //check if this character already exists for the user
		if (result.length == 0) {
			console.log("New character, named " + name)

			//set all characters to inactive
			sql = "SELECT cNr, active FROM charList WHERE active = 1 AND userID = " + userID + "";
			result = await con.query(sql);
			result.forEach(async function(res) {
				sql = "UPDATE charList SET active = 0 WHERE cNr = " + res.cNr;
				result = await con.query(sql);
				console.log("active changed");
			});

			//insert the new character and set it to active
			sql = "INSERT INTO charList (userID, name, level, class, active) VALUES ('" + userID + "', '" + name + "', '1', 'Unexperienced Adventurer', '1')";
			result = await con.query(sql);
			console.log("[DB] 1 record inserted (charList)");
			show(con, userID, channel)

		} else {
			var text = "You already have a character with the name **" + name + "**!";
			printMessage(channel, text);
			return false;
		}
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
async function show(con, userID, channel) {
	try {
		var sql = "SELECT userList.name AS userName, charList.name AS characterName, charList.level, charList.class FROM charList INNER JOIN userList ON charList.userID = userList.userID WHERE charList.active = 1 AND userList.userID = " + userID;
	    var result = await con.query(sql);

        //check if there is an active character
        if (result.length > 0) {
        	var uName = result[0].userName;
	       	var charName = "**" + result[0].characterName + "**";
	       	var level = result[0].level;
	       	var className = result[0].class;
	       	var text = "<@" + userID + ">: You're currently playing as the " + className + " " + charName + " lvl " + level + ".";
	       	printMessage(channel, text); 

       	} else {
       		var text = "You have no active character!"
       		printMessage(channel, text)
       	}
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
async function deleteChar(con, userID, channel, input, confirm) {
	try {
		var name = input[0];

		//check if the user entered a name
		if (name.length == 0) {
			throw "Not a valid name for the character";
		}

		var found = false;
		var sql = "SELECT cNr, name FROM charList WHERE name = '" + name +"' AND userID = " + userID + "";
		var result = await con.query(sql);

		//test if there is the character exists
		if (result.length > 0) {
			found = true;
		};

		//if the user answered with no, cancel the action
		if (confirm == "no" || confirm == "n") {
			sql = "UPDATE lastCommand SET optValues = 'none' WHERE userID = " + userID;
            result = await con.query(sql);

            console.log("[DB] 1 record updated (lastCommand)")
            var text = "Deleting **" + name + "** canceled"
            printMessage(channel, text);
			return;
		}

		//if the user confirmed the action, continue
		if (found == true && (confirm == "yes" || confirm == "y")) {
			console.log("Deleting the character " + name);
			sql = "DELETE FROM charList WHERE name = '" + name +"' AND userID = " + userID + "";
			result = await con.query(sql);
			console.log("[DB] 1 record deleted (charList)");

			var text = "<@" + userID + ">: Succesfully deleted the character " + name + "."; 
			printMessage(channel, text);
			sql = "UPDATE lastCommand SET optValues = 'none' WHERE userID = " + userID;
            result = await con.query(sql);
            console.log("[DB] 1 record updated (lastCommand)")

        //if there is no confirmation yet, ask the user if he wants to continue
		} else if(found == true && confirm == false) {
			sql = "UPDATE lastCommand SET optValues = 'confirm' WHERE userID = " + userID;
			result = await con.query(sql);
            console.log("[DB] 1 record updated (lastCommand)")
            var text = "Are you sure you want to delete **" + name + "**?";
            printMessage(channel, text)
		}
	}
	catch (e) {
		console.log("Invalid Arguments");
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
async function select(con, userID, channel, input) {
	try {
		var name = input[0];
		var sql = "SELECT cNr FROM charList WHERE userID = " + userID + " AND name = '" + name + "'";
		var result = await con.query(sql);

		if (result.length > 0) {
        	const newChar = result[0].cNr;
        	const oldChar = await getActive(con, userID);

        	if (oldChar != undefined) {

				//check if the character is already active
				if (oldChar != newChar) {

					//set the old character to inactive and the new one to active
					sql = "UPDATE charList SET active = 0 WHERE cNr = " + oldChar;
					result = await con.query(sql);
					sql = "UPDATE charList SET active = 1 WHERE cNr = " + newChar;
					result = await con.query(sql);
					show(con, userID, channel);

				} else {
					var text = "This character is already active"
   					printMessage(channel, text)
				}

			//set the new character to active
			} else {
				sql = "UPDATE charList SET active = 1 WHERE cNr = " + newChar;
				result = await con.query(sql);
				show(con, userID, channel);
			}

       	} else {
       		var text = "This character does not exist!"
       		printMessage(channel, text)
       	}
	} 
	catch (e) {
		console.log(e);
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
async function showAll(con, userID, channel) {
	var sql = "SELECT name, level, class FROM charList WHERE userID = " + userID + "";
	var result = await con.query(sql);

    var text = "Currently you own following characters:\n";
	result.forEach(function(res) {
		var row = " - **" + res.name + "**, " + res.class + " level " + res.level + "\n";
		text = text + row;
	});
	printMessage(channel, text);
}

async function showEquip(con, user, channel) {
	const char = await getActive(con, user.id);
	var sql = "SELECT name FROM charEquip WHERE cNr = " + char;
	var result = await con.query(sql);

	if (result.length == 0) {
		sql = "INSERT INTO charEquip (cNr, name) VALUES (" + char + ", 'base')";
		result = await con.query(sql);
	}
	var equip = {};
	sql = "SELECT "



	printMessage(channel, "SHOW!")
}

/**
 * async, returns the character number of the active character from a user
 * @param  {connection} con       database Connection
 * @param  {int} 		userID    user identification
 * @return {int|undefined}        cNr from active character
 */
function getActive(con, userID) {
	return new Promise(async (resolve, reject) => {
		var sql = "SELECT cNr FROM charList WHERE active = 1 AND userID = " + userID;
		const result = await con.query(sql);
		if (result.length > 0) {
			resolve(result[0].cNr);
		} else {
			resolve(undefined);
		}
	});
}

/**
 * sends a message in a channel
 * @param  {int} 		bot       bot identification
 * @param  {int} 		channelID channel identification
 * @param  {string} 	text      the content of the message
 */
function printMessage(channel, text) {
    channel.send(text)
  	.then(message => console.log(`Sent message: ${message.content}`))
  	.catch(console.error);
}


module.exports.createNew = createNew;
module.exports.show = show;
module.exports.deleteChar = deleteChar;
module.exports.select = select;
module.exports.showAll = showAll;
module.exports.getActive = getActive;
module.exports.showEquip = showEquip;
