
function show(con, channel, user) {

	var sql = "SELECT DISTINCT Cha.name AS charName, Item.name AS itemName, Inv.count, Inv.category";
	sql += " FROM charList AS Cha, itemList AS Item, isInInventory AS Inv, itemType As Itype";
	sql += " WHERE Cha.cNr = Inv.cNr AND Item.itemID = Inv.itemID";
	con.query(sql, function (err, result) {
		if (err) throw err;
		var invText = "Inventory from " + user.username + ":";
		var categories = {};
		result.forEach(res => {
			if (categories[res.category] == undefined) {
				categories[res.category] = [];
			}
			var tempText = "\t" + res.count + "x " + res.itemName + " (Level ?)";
			tempText += "\n\t\tMore Inforamtion!!"
			categories[res.category].push(tempText);
		})

		console.log(categories)
		//printMessage(channel, invText);
	});
}

function add(con, channel, user, charID, itemID) {

	var sql = "INSERT INTO isInInventory (cNr, itemID, count, category) VALUES (" + charID + ", " + itemID + ", 1, 'Weapon')";
	con.query(sql, function (err, result) {
		if (err) throw err;
		console.log("[DB] 1 record inserted (isInInventory)");
	});
}

function printMessage(channel, text) {
    channel.send(text)
  	.then(message => console.log(`Sent message: ${message.content}`))
  	.catch(console.error);
}

module.exports.show = show;
module.exports.add = add;