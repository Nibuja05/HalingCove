
async function show(con, channel, user) {

	var sql = "SELECT DISTINCT Cha.name AS charName, Item.name AS itemName, Inv.count, Itype.category";
	sql += ", Itype.stat1Description, Itype.stat2Description, Item.stat1, Item.stat2, Item.value AS itemValue, Item.level"
	sql += " FROM charList AS Cha, itemList AS Item, isInInventory AS Inv, itemType As Itype";
	sql += " WHERE Cha.cNr = Inv.cNr AND Item.itemID = Inv.itemID AND Item.type = Itype.typeID";
	var result = await con.query(sql);

	var invText = "Inventory from " + user.username + ":";
	var categories = {};
	result.forEach(res => {
		if (categories[res.category] == undefined) {
			categories[res.category] = [];
		}
		var tempText = "\n\n\t" + res.count + "x " + res.itemName + " (Level " + res.level + ") ~ *" + res.itemValue + " Gold*";
		tempText += "\n\t\t" + res.stat1Description + ": " + res.stat1 + ", " + res.stat2Description + ": " + res.stat2;
		categories[res.category].push(tempText);
	})

	for (const key in categories) {
	  	let value = categories[key];
	  	let optEnding = "";
	  	if(value.length > 1) optEnding = "s";
	  	invText += "\n\n**" + key + optEnding + "**:";
	  	invText += value.reduce((a, b) => a + b, "");
	}

	printMessage(channel, invText);
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