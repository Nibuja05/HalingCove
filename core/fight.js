const Discord = require ('discord.js');

function start(con, user, channel) {
	console.log("[FT] Starting...");
	var Unit = require('./classes/unit.js');

	var player = new Unit("Rüdiger", "player", 1, "Unexperienced Adventurer", 100, 20);
	var slime = new Unit("Slime", "creep", 1, "Figher", 20, 0);

   	sendEmbed(channel, "Starting Fight...", "#660000", user.id, player, slime);
}

function sendEmbed(channel, title, color, origUser, player, enemy) {

	const helper = require('./classes/helper.js')
	var log = new helper.BattleLog(10);
	var description = getFightDescription(player, enemy, log)

	var embed = new Discord.RichEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)

    const client = new Discord.Client();

    function emoji (id) {
		return client.emojis.get(id).toString();
	}

	const emoji_A = getEmojiChar("A");
	const emoji_B = getEmojiChar("G");

	var emojiList = [emoji_A, emoji_B];

    const filter = (reaction, user) => {
        return [emoji_A, emoji_B].includes(reaction.emoji.name) && user.id === origUser;
    }; 

    channel.send(embed)
    .then(function (message) {
    	getReactions(message, embed, filter, emojiList, log, origUser, player, enemy);
    });
}

function getReactions(message, embed, filter, emojiList, log, origUser, player, enemy) {
	message.edit(embed)
	.then(() => message.clearReactions())
	.then(() => reactWith(message, emojiList))
    .catch(() => console.error('One of the emojis failed to react.'))
	.then(() => {
		let collector = message.createReactionCollector(filter, { max: 1, time: 10000, errors: ['time'] });
		var exit = false;

    	collector.on('collect', reaction => {
    		var reactAnswer = reactTo(reaction.emoji, log, origUser, player, enemy);
    		log = reactAnswer[1];
    		exit = reactAnswer[2];

    		embed.setDescription(reactAnswer[0]);
    		if (exit) {
    			message.edit(embed);
    		}
    	});
    	collector.on('end', collected => {
    		if (collected.size > 0 && exit == false) {
    			getReactions(message, embed, filter, emojiList, log, origUser, player, enemy);
    		} else {
    			var newEmbed = embed;
    			newEmbed.setDescription(embed.description + "\n\n -> The Battle is Over! <-");
    			message.edit(embed);
    			message.clearReactions();
    		}
    	});
	})
}

function reactTo(emoji, log, origUser, player, enemy) {
	var text = "";
	exit = false;
	switch(emoji.name) {
		case getEmojiChar("A"):
			var attackAnswer =  attack(player, enemy, getRandomInt(1,5));
			text = attackAnswer[0];
			exit = attackAnswer[1];
			break;
		case getEmojiChar("G"):
			text = player.toString() + " gave up!\nBattle lost.";
			player.kill();
			exit = true;
			break;
	}
	log.add(text);
	return [getFightDescription(player, enemy, log), log, exit];
}

function attack(attacker, victim, damage) {
	if (victim.dealDamage(damage)) {
		var text = attacker.toString() + " attacked " + victim.toString() + " and dealt " + damage + " damage!";
		return [text, false];
	} else {
		var text = "You killed " + victim.toString() + "!\nBattle won.";
		return [text, true];
	}
}

function getFightDescription(player, enemy, log) {
	var enemyDeath = "";
	if (!enemy.isAlive()) {enemyDeath = " ☠";}
	var playerDeath = "";
	if (!player.isAlive()) {playerDeath = " ☠";}

	var text = "Watch out for this epic battle between `" + player.toString() + "` and `" + enemy.toString() + "`!";
	text += "\n```";
	text += visualizeHP(enemy) + "\n";
	text += "⨠ " + enemy.toString() + enemyDeath + "\n\n<------------------------------------------------>\n";
	text += log.toString();
	text += "<------------------------------------------------>\n\n" + visualizeHP(player) + "\n";
	text += "⨠ " + player.toString() + playerDeath + "\n\n";
	text += "You have following Options:\n" + " A - Attack\n G - Give Up";
	text += "```";

	return text;
}

function visualizeHP(unit) {
	var text = "⦋";
	var blockCount = Math.floor((unit.curHP / unit.maxHP) * 25);
	for (var i = 0; i < blockCount; i++) {
		text += "■";
	}
	for (var i = blockCount; i < 25; i++) {
		text += "·";
	}
	text += "⦌";
	return text;
}

async function reactWith(message, emojiList) {
	if (emojiList.length > 0) {
		for (var i = 0; i < emojiList.length; i++) {
			await message.react(emojiList[i]);
		}
	}
}

function printMessage(channel, text) {
	channel.send(text)
	.then(message => console.log(`Sent message: ${message.content}`))
	.catch(console.error);
}

function getEmojiChar(char) {
	switch(char) {
		case 'A':
			return "🇦";
		case 'B':
			return "🇧";
		case 'C':
			return "🇨";
		case 'D':
			return "🇩";
		case 'E':
			return "🇪";
		case 'F':
			return "🇫";
		case 'G':
			return "🇬";
		case 'H':
			return "🇭";
		case 'I':
			return "🇮";
		case 'J':
			return "🇯";
		case 'K':
			return "🇰";
		case 'L':
			return "🇱";
		case 'M':
			return "🇲";
		case 'N':
			return "🇳";
		case 'O':
			return "🇴";
		case 'P':
			return "🇵";
		case 'Q':
			return "🇶";
		case 'R':
			return "🇷";
		case 'S':
			return "🇸";
		case 'T':
			return "🇹";
		case 'U':
			return "🇺";
		case 'V':
			return "🇻";
		case 'W':
			return "🇼";
		case 'X':
			return "🇽";
		case 'Y':
			return "🇾";
		case 'Z':
			return "🇿";
		break;
	}
	return "";
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.start = start;