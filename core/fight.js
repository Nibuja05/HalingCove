const Discord = require ('discord.js');

async function start(con, user, channel) {
	console.log("[FT] Starting...");
	var Unit = require('./classes/unit.js');
	var FightWindow = require('./classes/helper.js').FightWindow;

	var player = new Unit();
	await player.initPlayer(con, user, channel);
	var slime = new Unit();
	slime.initCreep("Slime", 1);
	var slime2 = new Unit();
	slime2.initCreep("Slime", 1);

	var fightWindow = new FightWindow(channel, "Starting Fight...", "#660000", user.id, player, [slime, slime2]);
}

async function test(con, user, channel) {
	var Unit = require('./classes/unit.js');
	var Skill = require('./classes/skill.js');
	var Body = require('./classes/body.js');

	var player = new Unit();
	// await player.initPlayer(con, user);

	var testBody = new Body(player, "Human", "All", "All");
	console.log(testBody.toString());

	var slimeBody = new Body(player, "Slime", "None", "All");
	console.log(slimeBody.toString());

}

module.exports.start = start;
module.exports.test = test;