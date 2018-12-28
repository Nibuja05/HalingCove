
async function start(con, channel, user, input, confirm) {

	try {
		var exploreID = Number(input[0]);
		var sql = "SELECT name, baseDuration FROM exploreType WHERE exploreTypeID = " + exploreID;
		var result = await con.query(sql);

		if (result.length > 0) {

			var name = result[0].name;
			var date = new Date();
			var startTime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(); 
			var fullTime = result[0].baseDuration;

			const character = require('./character.js');
			const char = await character.getActive(con, user.id)

			if (char != undefined) {
			//delete old explorations
				sql = "SELECT * FROM exploration WHERE cNr = " + char;
				result = await con.query(sql);
				if (result.length == 0) {

					sql = "INSERT INTO exploration (cNr, exploreType, startTime, fullTime, modifier) VALUES (" + char + ", " + exploreID + ", '" + startTime + "', '" + fullTime + "', 'None')";
					result = await con.query(sql);
					console.log("[DB] 1 record deleted (exploration)")
					printMessage(channel, "Start exploring " + name + "...");

				} else {
					printMessage(channel, "You cannot start a new exploration, if you have running or unclaimed missions!")
				}

			} else {
				printMessage(channel, "No active character!")
			}

		} else {
			printMessage(channel, "No exploration with that ID! Use *$$explore list* to view your possibilitites")
		}

	} catch(e) {
		console.log(e);
		console.log("Invalid Arguments!");
	}
}

async function status(con, channel, user) {

	const rdy = await isMissionReady(con, user);
	var difference = rdy[0];
	var fullTimeSec = rdy[1];

	if(difference < fullTimeSec) {
		var newDiff = Math.ceil(fullTimeSec - difference);
		printMessage(channel, "Currently on a mission, ending in " + newDiff + " seconds");
	} else
	{
		printMessage(channel, "Last Mission Complete");
	}

}

function isMissionReady(con, user) {

	return new Promise((resolve, reject) => {
		try {
			var sql = "SELECT EX.startTime, EX.fullTime, CH.cNR FROM exploration AS EX, charList AS CH WHERE EX.cNr = CH.cNr AND CH.active = 1 AND CH.userID = " + user.id;
			con.query(sql, function (err, result) { 
				if (err) throw err;

				if (result.length > 0) {
					var startDate = new Date(result[0].startTime);
					var fullTime = result[0].fullTime;
					var fullTimeVal = fullTime.match(/\d+/g);
					var fullTimeSec = [3600, 60, 1].map( (x,index) => x * fullTimeVal[index]).reduce((a, b) => a + b, 0);
					var nowDate = new Date();
					var difference = (nowDate.getTime() - startDate.getTime()) / 1000;

					resolve([difference, fullTimeSec]);	
				} else {
					resolve([0,0]);
				}
			});
		} catch(e) {
			reject(e);
		}
	});

}

async function claim(con, channel, user) {

	const item = require('./item.js');
	const inventory = require('./inventory.js');
	const rdy = await isMissionReady(con, user);
	var difference = rdy[0];
	var fullTimeSec = rdy[1];

	if(difference < fullTimeSec) {
		status(con, channel, user);
	} else {
		const character = require("./character.js");
		const char = await character.getActive(con, user.id);
	
		if (char != undefined) {
			sql = "DELETE FROM exploration WHERE cNr = " + char;
			result = await con.query(sql);

			if(result.affectedRows > 0) {
				console.log("[DB] 1 record deleted (exploration)");

				const reward = await item.createRandom(con, channel, "1", true);
				var rewardName = reward[0];
				var rewardID = reward[1];
				inventory.add(con, channel, user, char, rewardID);
				printMessage(channel, "Sucessfully claimed reward for last exploration!\n**Reward:** " + rewardName);
			} else {
				printMessage(channel, "No active exploration!")
			}
		}
	}
}

function help(con, channel, user) {

	var helpText = "To explore please use explore *$$start [name|id]*!\n";
	helpText += "For more information please use the tutorial ( *$$tutorial* ), the general help ( *$$help* ) or visit [url]."
	printMessage(channel, helpText);

}

function printMessage(channel, text) {
    channel.send(text)
  	.then(message => console.log(`Sent message: ${message.content}`))
  	.catch(console.error);
}

module.exports.start = start;
module.exports.help = help;
module.exports.status = status;
module.exports.claim = claim;