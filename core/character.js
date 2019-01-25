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
	
	var text = "Equipment of **" + user.username + "**:";
	var equip = await getEquip(con, user);
	for (const key in equip) {
		let value = equip[key];

		var sql = "SELECT name FROM itemList WHERE itemID = " + value;
		var result = await con.query(sql);

		if (result.length > 0) {
			text += "\n\t" + getSlotName(key) + ": `" + result[0].name + "`";
		};
	};

	printMessage(channel, text);
}

function getEquip(con, user) {
	return new Promise(async (resolve, reject) => {
		const char = await getActive(con, user.id);
		var sql = "SELECT name FROM charEquip WHERE cNr = " + char;
		var result = await con.query(sql);

		if (result.length == 0) {
			sql = "INSERT INTO charEquip (cNr, name) VALUES (" + char + ", 'base')";
			result = await con.query(sql);
		}
		var equip = {};
		var name = "";
		sql = "SELECT handLeft, handRight, head, upperBody, lowerBody FROM charEquip WHERE cNR = " + char;
		result = await con.query(sql);
		var equip = {};
		equip[2] = result[0].handLeft;
		equip[1] = result[0].handRight;
		equip[4] = result[0].head;
		equip[5] = result[0].upperBody;
		equip[6] = result[0].lowerBody;
		resolve(equip);
	});
}

function getSlotName(slot) {
	var name = "";
	slot = Number(slot);
	switch(slot) {
		case 1:
			name = "Right Hand";
			break;
		case 2:
			name = "Left Hand";
			break;
		case 3:
			name = "Both Hands";
			break;
		case 4:
			name = "Head";
			break;
		case 5:
			name = "Upper Body";
			break;
		case 6:
			name = "Lower Body";
			break;
	}
	return name;
}

function getSlotNameDB(slot) {
	var name = "";
	slot = Number(slot);
	switch(slot) {
		case 1:
			return "handRight";
		case 2:
			return "handLeft";
		case 3:
			return ["handRight", "handLeft"];
		case 4:
			return "head";
		case 5:
			return "upperBody";
		case 6:
			return "lowerBody";
	}
}


async function equip(con, user, channel, input) {

	const inventory = require('./inventory.js');
	var inv = await inventory.getInventory(con, user);

	try {
		var itemNumber = Number(input);
		var itemList = {};
		var itemIndex = 1;
		for (const key in inv) {
		  	let value = inv[key];
		  	value.forEach(res => {
		  		itemList[itemIndex] = res;
				itemIndex++;
		  	});
		};
		if (itemNumber in itemList) {
			console.log("Item exists!")
			var item = itemList[itemNumber];
			var slot = item.slot;

			var oldItems = [];
			var sql = "SELECT handLeft, handRight, head, upperBody, lowerBody FROM charEquip WHERE cNr = " + item.cNr;
			var result = await con.query(sql);
			if (result.length > 0) {
				let res = result[0];
				switch(slot) {
					case 1:
						oldItems.push(res.handRight);
						break;
					case 2:
						oldItems.push(res.leftRight);
						break;
					case 3:
						oldItems.push(res.handRight);
						oldItems.push(res.handLeft);
						break;
					case 4:
						oldItems.push(res.head);
						break;
					case 5:
						oldItems.push(res.upperBody);
						break;
					case 6:
						oldItems.push(res.lowerBody);
						break;
				};
			};

			if (oldItems.length == 1) {
				sql = "SELECT name FROM itemList WHERE itemID = " + oldItems[0];
				result = await con.query(sql);

				if (result.length > 0) {
					if (result[0].name != "Nothing") {
						printMessage(channel, "Unequipped " + result[0].name);
					}
				}

				var slotName = getSlotNameDB(slot);
				sql = "UPDATE charEquip SET " + slotName + " = " + item.ID + " WHERE cNr = " + item.cNr;
				result = await con.query(sql);
				printMessage(channel, "Equipped " + item.itemName);

			} else if(oldItems.length == 2) {
				sql = "SELECT A.name name1, B.name name2 FROM (SELECT name FROM itemList WHERE itemID = " + oldItems[0] + ") A,";
				sql += " (SELECT name FROM itemList WHERE itemID = " + oldItems[1] + ") B";
				result = await con.query(sql);

				if (result.length > 0) {
					if (result[0].name1 != "Nothing") {
						var second = "";
						if ((result[0].name1 != result[0].name2) && (result[0].name2 != "Nothing")) {
							second = " and " + result[0].name2;
						}
						printMessage(channel, "Unequipped " + result[0].name1 + second);
					}
				}

				var slotName = getSlotNameDB(slot);
				sql = "UPDATE charEquip SET " + slotName[0] + " = " + item.ID + ", " + slotName[1] + " = " + item.ID + " WHERE cNr = " + item.cNr;
				result = await con.query(sql);
				printMessage(channel, "Equipped " + item.itemName);
			}

		} else {
			printMessage(channel, "This item is not in your inventory!")
		}
	} catch(e) {
		console.log(e);
		console.log("Invalid Arguments!");
	}
}

function checkRequirements(con, user, char) {
	return true;
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
module.exports.equip = equip;
module.exports.getEquip = getEquip;
