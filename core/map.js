
async function show(con, channel, user) {
	console.log("Show!")
	const character = require('./character.js');
	var active = await character.getActive(con, user.id);
	var sql = "SELECT Loc.name, Loc.region, Loc.description, Loc.minLevel FROM locationList Loc, charList Ch WHERE Loc.locID = Ch.location AND Ch.cNr = " + active;
	var result = await con.query(sql);

	var text = "You're currently here: **" + result[0].name + "** (lvl " + result[0].minLevel + ") , " + result[0].region;
	text += "\n⨠ `" + result[0].description + "`";
	text += "\n\nTo view all your options at this location, use: $$local";
	text += "\n\nFrom here you can travel to:";

	sql = "SELECT Eloc.name endName, Trav.travelTime FROM locationList Sloc, locationList Eloc, travelPaths Trav";
	sql += " WHERE Sloc.locID = Trav.startLoc AND Eloc.locID = Trav.endLoc AND Sloc.name = '" + result[0].name + "'";
	result = await con.query(sql);

	result.forEach(res => {
		text += "\n\t- " + res.endName + ", travel time: " + res.travelTime;
	})

	printMessage(channel, text);
}

async function showLocal(con, channel, user, input, confirm) {

	const character = require('./character.js');
	var active = await character.getActive(con, user.id);
	var sql = "SELECT Loc.name, Loc.cityOptions FROM locationList Loc, charList Ch WHERE Loc.locID = Ch.location AND Ch.cNr = " + active;
	var result = await con.query(sql);
	var options = result[0].cityOptions.split(",");

	if (confirm != false) {
		visitLocal(con, channel, user, confirm, options);
	} else if (typeof(input[0]) == "string") {
		visitLocal(con, channel, user, input[0], options);
	} else {

		var text = "In **" + result[0].name + "** you have the following options:";
		options.forEach(elem => {
			text += "\n - " + elem;
		});
		text += "\n\nWho do yo want to visit? (use cancel to exit)";
		printMessage(channel, text);

		sql = "UPDATE lastCommand SET optValues = 'confirm' WHERE userID = " + user.id;
		result = await con.query(sql);
	    console.log("[DB] 1 record updated (lastCommand)")
	}
}

async function visitLocal(con, channel, user, option, options) {
	const explore = require('./explore.js');
	var stat = await explore.getStatus(con, user);
	if (!stat[0]) {
		printMessage(channel, "How can you visit somebody if your on an exploration?");
		var sql = "UPDATE lastCommand SET optValues = 'none' WHERE userID = " + user.id;
    	await con.query(sql);
	} else {
		if (options.includes(option)) {
		switch(option) {
			case 'merchant':
				visitmerchant(con, channel, user);
				break;
			case 'healer':
				visitHealer(con, channel, user);
				break;
			case 'baloon':
				visitBaloon(con, channel, user);
				break;
			case 'druid':
				visitDruid(con, channel, user);
				break;
			default:
				printMessage(channel, "You want to visit " + option + "? Have fun searching...");
				break;
		}	
	} else {
		printMessage(channel, "You want to visit the " + option + "? Have fun searching...");
	}
	}
}

async function visitmerchant(con, channel, user) {
	printMessage(channel, "Welcome to the Merchant! Look at my goods, choose as much as you like! For the corresponding price of course.");
	var sql = "UPDATE lastCommand SET optValues = 'none' WHERE userID = " + user.id;
    await con.query(sql);
}

async function visitHealer(con, channel, user) {
	printMessage(channel, "Welcome to the Healer! For a fee I can heal most injuries, what are your complaints?");
	var sql = "UPDATE lastCommand SET optValues = 'none' WHERE userID = " + user.id;
    await con.query(sql);
}

async function visitBaloon(con, channel, user) {
	printMessage(channel, "Welcome to the Baloon! Just a few coins and I'll take you wherever you want!");
	var sql = "UPDATE lastCommand SET optValues = 'none' WHERE userID = " + user.id;
    await con.query(sql);
}

async function visitDruid(con, channel, user) {
	printMessage(channel, "What do you want?!");
	var sql = "UPDATE lastCommand SET optValues = 'none' WHERE userID = " + user.id;
    await con.query(sql);
}

function travelTo(con, channel, user, input) {
	//check if the character already travels or is on exploration
	
}

function printMessage(channel, text) {
    channel.send(text)
  	.then(message => console.log(`Sent message: ${message.content}`))
  	.catch(console.error);
}

module.exports.show = show;
module.exports.showLocal = showLocal;