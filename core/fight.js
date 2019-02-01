const Discord = require ('discord.js');

async function start(con, user, channel) {
	console.log("[FT] Starting...");
	var Unit = require('./classes/unit.js');

	//var player = new Unit("Rüdiger", "player", 1, "Unexperienced Adventurer", 100, 20);
	//await player.loadPlayerData(con, user);
	var player = new Unit();
	await player.initPlayer(con, user);
	var slime = new Unit();
	slime.initCreep("Slime", 1);
	var slime2 = new Unit();
	slime2.initCreep("Slime", 1);

   	sendEmbed(channel, "Starting Fight...", "#660000", user.id, player, [slime, slime2]);
}

async function test(con, user, channel) {
	var Unit = require('./classes/unit.js');

	var player = new Unit();
	await player.initPlayer(con, user);
}

function sendEmbed(channel, title, color, origUser, player, enemies) {

	const helper = require('./classes/helper.js')
	var log = new helper.BattleLog(10);
	var description = getFightDescription(player, enemies, log, "player")

	var embed = new Discord.RichEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)

    const client = new Discord.Client();

    function emoji (id) {
		return client.emojis.get(id).toString();
	}

	const e1= getEmojiChar("A");
	const e2 = getEmojiChar("B");
	const e3 = getEmojiChar("C");
	const e4 = getEmojiChar("D");
	const e5 = getEmojiChar("M");
	const e6 = getEmojiChar("skill");
	const e7 = getEmojiChar("leave");

	var emojiList = [e1, e2, e3, e4, e5, e6, e7];

    const filter = (reaction, user) => {
        return emojiList.includes(reaction.emoji.name) && user.id === origUser;
    }; 

    var turn = "player";

    channel.send(embed)
    .then((message) => {
    	reactWith(message, emojiList);
    	getReactions(message, embed, filter, log, origUser, player, enemies, turn);
    })
    .catch(() => console.error('One of the emojis failed to react.'))
}

function getReactions(message, embed, filter, log, origUser, player, enemies, turn) {
	message.edit(embed)
	//.then(() => message.clearReactions())
	.then(() => {
		let collector = message.createReactionCollector(filter, { max: 1, time: 10000, errors: ['time'] });
		var exit = false;

    	collector.on('collect',async reaction => {
    		var reactAnswer = reactTo(reaction.emoji, log, origUser, player, enemies, turn);
    		log = reactAnswer[1];
    		exit = reactAnswer[2];
    		turn = reactAnswer[3];

    		embed.setDescription(reactAnswer[0]);
    		message.edit(embed);
    		collector.stop();

    		if (exit) {
    			var newEmbed = embed;
    			newEmbed.setDescription(embed.description + "\n\n -> The Battle is Over! <-");
    			message.edit(embed);
    			message.clearReactions();
    		}
    		await reaction.remove(origUser);
    	});
    	collector.on('end', collected => {
    		if (collected.size > 0 && exit == false) {
    			getReactions(message, embed, filter, log, origUser, player, enemies, turn);
    		} else if (exit == false) {
    			var newEmbed = embed;
    			newEmbed.setDescription(embed.description + "\n\n -> The Battle is Over! <-");
    			message.edit(embed);
    			message.clearReactions();
    		}
    	});
	})
}

function reactTo(emoji, log, origUser, player, enemies, turn) {
	var text = "";
	var exit = false;

	var actionList = [];
	var validInput = false;
	if (turn == "player") {
		actionList = player.getAttackActions();
	} else {
		actionList = player.getDefendActions();
	}

	var firstEnemy;
	for (var i = 0; i < enemies.length; i++) {
		let enemy = enemies[i];
		firstEnemy = enemy;
		if (enemy.isAlive())  {
			break;
		}
	}

	if (actionList.length < 1) {
		text = "Passing...";
		validInput = true;
	} else {
		switch(emoji.name) {
			case getEmojiChar("A"):
				if (actionList[0] != undefined) {
					text = attack(player, firstEnemy, actionList[0]);
					validInput = true;
				} else {
					text = "Action not avaliable!";
				}
				break;
			case getEmojiChar("B"):
				if (actionList[1] != undefined) {
					text =  attack(player, firstEnemy, actionList[1]);
					validInput = true;
				} else {
					text = "Action not avaliable!";
				}
				break;
			case getEmojiChar("C"):
				if (actionList[2] != undefined) {
					text =  attack(player, firstEnemy, actionList[2]);
					validInput = true;
				} else {
					text = "Action not avaliable!";
				}
				break;
			case getEmojiChar("D"):
				if (actionList[3] != undefined) {
					text = attack(player, firstEnemy, actionList[3]);
					validInput = true;
				} else {
					text = "Action not avaliable!";
				}
				break;
			case getEmojiChar("M"):
				text = "Moved. Somewhere. Nobody knows. But your still there. Hmm..."
				exit = false;
				break;
			case getEmojiChar("skill"):
				text = "You want to use your incredibly overpowered magic spell! But you dont have enough mana..."
				exit = false;
				break;
			case getEmojiChar("leave"):
				text = player.toString() + " ran away from the fight like a coword!"
				exit = true;
				break;
		}
	}

	if (validInput == true) {
		if (turn == "player") {
			turn = "enemy";
		} else {
			enemies.forEach(enemy => {
				text += "\n" +  enemyTurn(enemy, player);
				turn = "player";
			})
		}
	}

	var dead = true;
	enemies.forEach(enemy => {
		if (enemy.isAlive()) {
			dead = false;
		}
	});
	if (!player.isAlive() || dead == true) {
		exit = true;
		text += "\nBattle end.";
	}

	log.add(text);
	return [getFightDescription(player, enemies, log, turn), log, exit, turn];
}

function enemyTurn(creep, player) {
	if (creep.isAlive()) {
		var pattern = creep.getClass();
		var attackActions = creep.getAttackActions();
		var attackOption = getRandomElement(attackActions);
		var text = "";
		switch(pattern) {
			case 'Fighter':
				return attack(creep, player, attackOption);
		}
	}
	return "";
}

function attack(attacker, victim, option) {
	var damageTable = {};
	damageTable.attacker = attacker;
	damageTable.range = 1;
	damageTable.damage = attacker.getAttackDamage();
	var trueDamage = victim.dealDamage(damageTable);
	if (victim.isAlive()) {
		var text = attacker.toString() + " attacked " + victim.toString() + " " + option + " and dealt " + trueDamage + " damage!";
		return text;
	} else {
		var text = attacker.toString() + " attacked " + victim.toString() + " " + option + " and dealt " + trueDamage + " damage!";
		text += "\n" + attacker.toString() + " killed " + victim.toString() + "!";
		return text;
	}
}

function getFightDescription(player, enemies, log, turn) {
	var playerDeath = "";
	if (!player.isAlive()) {playerDeath = " ☠";}

	var enemyText = "";
	enemies.forEach(enemy => {
		if (enemyText == "") {
			enemyText += enemy.toString();
		} else {
			enemyText += ", " + enemy.toString();
		}
	})

	var startLetter = "A";
	if (enemies.length > 1) {
		enemies.forEach(enemy => {
			var unitName = enemy.getName() + " " + startLetter;
			startLetter = String.fromCharCode(startLetter.charCodeAt(0) + 1);
			enemy.setName(unitName);
		});
	}

	var text = "Watch out for this epic battle between `" + player.toString() + "` and `" + enemyText + "`            !";
	text += "\n```";

	enemies.forEach(enemy => {
		var enemyDeath = "";
		if (!enemy.isAlive()) {enemyDeath = " ☠";}

		text += visualizeHP(enemy) + "\n";
		text += "⨠ " + enemy.toString() + enemyDeath + "\n\n";

	});
	
	text += "<------------------------------------------------>\n";
	text += log.toString();
	text += "<------------------------------------------------>\n\n" + visualizeHP(player) + "\n";
	text += "⨠ " + player.toString() + playerDeath + "\n\n";
	if (turn == "player") {
		text += "It's your turn!\n" + getUnitOptions(player, "attack");
	} else {
		text += "It's the enemies turn!\n" + getUnitOptions(player, "defend");
	}
	
	text += "```";

	return text;
}

function getUnitOptions(unit, type) {
	var actions = [];
	var symbols = ['A', 'B', 'C', 'D'];
	var text = "";
	var wording = "";
	if (type == "attack") {
		actions = unit.getAttackActions();
		text += "Your Attack Actions:\n";
		wording = "Attack";
	} else if (type == "defend") {
		actions = unit.getDefendActions();
		text += "Your Defend Actions:\n";
		wording = "Defend";
	}
	if (actions.length > 0) {
		symbols.forEach((x, index) => {
			if (actions[index] != undefined) {
				text += " - " + x + ": " + wording + " " + actions[index] + "\n";
			} else {
				text += " - " + x + ": Nothing\n";
			}
		});
		return text;
	} else {
		symbols.forEach((x, index) => {
			text += " - " + x + ": Pass\n";
		});
		return text;
	}
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
	text += "⦌ " + unit.curHP + "/" + unit.maxHP;
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

function getRandomElement(arr) {
	var max = arr.length - 1;
	return arr[getRandomInt(0,max)];
}

function getEmojiChar(char) {
	switch(char) {
		case '0':
			return ":zero:";
		case '1':
			return ":one:";
		case '2':
			return ":two:";
		case '3':
			return ":three:";
		case '4':
			return ":four:";
		case '5':
			return ":five:";
		case '6':
			return ":six:";
		case '7':
			return ":seven:";
		case '8':
			return ":eight:";
		case '9':
			return ":nine:";
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
		case 'attack':
			return "⚔";
		case 'defend':
			return "🛡";
		case 'skill':
			return "🔥"
		case 'leave':
			return "🏳";
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
module.exports.test = test;