
async function show(con, channel, user) {

	const character = require('./character.js');
	var char = await character.getActive(con, user.id);

	var sql = "SELECT name FROM charList WHERE cNr = " + char;
	var result = await con.query(sql);

	var inventory = await getInventory(con, user);

	var invText = "**Inventory from " + result[0].name + ":**";
	var itemIndex = 1;

	if (Object.keys(inventory).length > 0) {
		for (const key in inventory) {
		  	let value = inventory[key];
		  	let optEnding = "";
		  	if(value.length > 1) optEnding = "s";
		  	invText += "\n" + key + optEnding + ":```";
		  	value.forEach(res => {
		  		var tempText = "\n[" + itemIndex + "]\t" + res.count + "x " + res.itemName + " (Level " + res.level + ") ~ *" + res.itemValue + " Gold*";
				tempText += "\n\t\t  " + res.stat1Description + ": " + res.stat1 + ", " + res.stat2Description + ": " + res.stat2;
				invText += tempText
				itemIndex++;
		  	});
		  	invText += "```";
		};
	} else {
		invText += "\n\nIt's empty here...";
	}

	printMessage(channel, invText);
}

function getInventory(con, user) {
	return new Promise(async (resolve, reject) => {
		const character = require('./character.js');
		const char = await character.getActive(con, user.id);

		var sql = "SELECT DISTINCT Cha.cNr, Cha.name AS charName, Item.name AS itemName, Item.itemID AS ID, Inv.count, Itype.slot, Itype.category";
		sql += ", Itype.stat1Description, Itype.stat2Description, Item.stat1, Item.stat2, Item.value AS itemValue, Item.level"
		sql += " FROM charList AS Cha, itemList AS Item, isInInventory AS Inv, itemType As Itype";
		sql += " WHERE Cha.cNr = Inv.cNr AND Item.itemID = Inv.itemID AND Item.type = Itype.typeID AND Cha.cNr = " + char;
		var result = await con.query(sql);
		
		var categories = {};
		result.forEach(res => {
			if (categories[res.category] == undefined) {
				categories[res.category] = [];
			}
			
			categories[res.category].push(res);
		})
		resolve(categories);
	});
}

async function add(con, channel, user, charID, itemID) {

	var sql = "INSERT INTO isInInventory (cNr, itemID, count) VALUES (" + charID + ", " + itemID + ", 1)";
	var result = await con.query(sql);
	console.log("[DB] 1 record inserted (isInInventory)");
}

function printMessage(channel, text) {
    channel.send(text)
  	.then(message => console.log(`Sent message: ${message.content}`))
  	.catch(console.error);
}

module.exports.show = show;
module.exports.add = add;
module.exports.getInventory = getInventory;