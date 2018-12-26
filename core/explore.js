
function start(con, channel, user, input, confirm) {

	try {
		var exploreID = Number(input[0]);
		var sql = "SELECT name, baseDuration FROM exploreType WHERE exploreTypeID = " + exploreID;
		con.query(sql, function (err, result) {
			if (err) throw err;
			if (result.length > 0) {

				var name = result[0].name;
				var date = new Date();
				var startTime = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDay() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(); 
				var fullTime = result[0].baseDuration;

				sql = "SELECT cNr FROM charList WHERE active = 1 AND userID = " + user.id;
				con.query(sql, function (err, result) { 
					if (err) throw err;
					if (result.length) {

						var charNr = result[0].cNr;
						sql = "INSERT INTO exploration (cNr, exploreType, startTime, fullTime, modifier) VALUES (" + charNr + ", " + exploreID + ", '" + startTime + "', '" + fullTime + "', 'None')";

						console.log("SQL: " + sql);
						console.log(startTime + " | " + fullTime);

						con.query(sql, function (err, result) { 
							if (err) throw err;

							printMessage(channel, "Start exploring " + name + "...");
						});
					} else {
						printMessage(channel, "No active character!")
					}
				});
			} else {
				printMessage(channel, "No exploration with that ID! Use *$$explore list* to view your possibilitites")
			}
		});
	} catch(e) {
		console.log(e);
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