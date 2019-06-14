
/**
 * Several functions to display help / tutorials
 */

function showHelp(pre, subject, param, user, channel) {
	switch (subject) {
		case 'classes':
			sendClassTree(pre, user, param, channel);
			break;
        case 'class':
            sendClassInfo(pre, user, param, channel);
            break;
        case 'skill':
            sendSkillInfo(pre, user, param, channel);
	}
}

function sendClassInfo(pre, user, param, channel) {
    param = param.join(" ");
    param = param.charAt(0).toUpperCase() + param.slice(1);
    if (param == "") {
        printMessage(channel, "Sorry, but you specified no class. To view all classes use " + pre + "help classes.");
    }
    const classList = require('./unitinfo.json').player;
    if (param in classList) {
        var text = "Displaying information about the class **" + param + "**:\n```";
        var unitInfo = classList[param];
        text += "\nMain Class: " + unitInfo.Class;
        text += "\nEvolves from: " + unitInfo.Parent;
        text += "\n\nBase Health: " + unitInfo.BaseHP;
        text += "\nBase Mana: " + unitInfo.BaseMana;
        text += "\nActive Skills: " + Object.entries(unitInfo.Skills.Active).map(([k,v]) => k + " (lvl " + v + ")").join(", ");
        text += "\nPassive Skills: " + Object.entries(unitInfo.Skills.Passive).map(([k,v]) => k + " (lvl " + v + ")").join(", ");
        text += "```\n(For more information about the skills use " + pre + "help skill [name of skill])";

        printMessage(channel, text);
    } else {
        printMessage(channel, "This class does not exist (yet)!");
    }
}

function sendSkillInfo(pre, user, param, channel) {
    param = param.join(" ");
    param = param.charAt(0).toUpperCase() + param.slice(1);
    if (param == "") {
        printMessage(channel, "Sorry, but you specified no skill. To view all skills use " + pre + "help skill all.");
    }
    if (param == "all") {
        printMessage(channel, "Displaying a list of all skills: \nNo list made yet");
    }
    const skillList = require('./skillinfo.json');
    var activeSkills = skillList.Active;
    var passiveSkills = skillList.Passive;
    if (param in activeSkills) {

        var text = "Displaying information about the skill **" + param + "**:\n```";
        var skillInfo = activeSkills[param];
        text += "\nDescription : " + skillInfo.Description;
        text += "\n";
        if (skillInfo.ManaCost > 0 ) { text += "\nMana Cost: " + skillInfo.ManaCost }
        if (skillInfo.HealthCost > 0 ) { text += "\nHealth Cost: " + skillInfo.HealthCost }
        text += "\nTurn : " + skillInfo.Turn;
        text += "\nCooldown: " + skillInfo.Cooldown;
        text += "\nType: Active\n\nOther Info (not available yet)";
        text += "\n```";

        printMessage(channel, text);

    } else if (param in passiveSkills) {
        var text = "Displaying information about the skill **" + param + "**:\n```";
        var skillInfo = passiveSkills[param];
        text += "\nDescription : " + skillInfo.Description;
        text += "\nType: Passive\n";
        text += "\nOther Info (not available yet)";
        text += "\n```";

        printMessage(channel, text);
    } else {
        printMessage(channel, "This skill does not exist (yet)!");
    }
}

function sendClassTree(pre, user, param, channel) {
	if (param == "") {
		param = "all";
	}
	var arr = ["all", "defender", "warrior", "assassin", "archer", "mage", "priest"];
    param = param.toString().toLowerCase();
	if (!(arr.includes(param))) {
		printMessage(channel, "Sorry but '" + param + "' is no existing main class tree! Try " + pre + "help classes to view all main class trees.");
		return;
	}
	var text = "This is the main class tree for ";
	if (param == "all") {
		text += "all classes. You can also view this tree for only one main class with " + pre + "help classes [classname].";
	} else {
		text += " the **" + param + "** class.";
	}
	text += "\nTo get more specific informations about a specific class use " + pre + "help class [classname].\n";
	text += "\n```\n"

	if (param == "all") {
		text += `
+-----------+  Unexperienced Adventurer
|
+-> Defender
|
+-> Warrior
|
+-> Assassin
|
+-> Archer
|
+-> Mage
|
+-> Priest
		`;
	} else if (param == "defender") {
		text += `
+-----------+  Unexperienced Adventurer
|
+-> +-Defender-------------+----------------------+
|   |                      v                      |
|   |                Backup Guard                 |
|   |                      |                      |
|   |                      v                      |
|   |                  Bodyguard                  |
|   |                      |                      |
|   |            +------------------+             |
|   |            v                  v             |
|   |       Royal Guard           Knight          |
|   |            |                  |             |
|   |     +-----------+        +-----------+      |
|   |     v           v        v           v      |
|   |  Imperial   Legionary  Paladin    Lancer    |
|   |  Bodyguard                                  |
|   |                                             |
V   +---------------------------------------------+
    	`;
	} else if (param == "warrior") {
		text += `
+-----------+  Unexperienced Adventurer
|
+-> +-Warrior--------------+----------------------+
|   |                      v                      |
|   |                  Daredevil                  |
|   |                      |                      |
|   |                      v                      |
|   |                   Fighter                   |
|   |                      |                      |
|   |            +------------------+             |
|   |            v                  v             |
|   |        Swordsman           Warrior          |
|   |            |                  |             |
|   |     +-----------+        +-----------+      |
|   |     v           v        v           v      |
|   |  Blademaster Champion Mercenary Slaughterer |
|   |                                             |
V   +---------------------------------------------+
    	`;
    } else if (param == "assassin") {
    	text += `
+-----------+  Unexperienced Adventurer
|
+-> +-Assassin-------------+----------------------+
|   |                      v                      |
|   |                 Road Thief                  |
|   |                      |                      |
|   |                      v                      |
|   |                    Bandit                   |
|   |                      |                      |
|   |            +------------------+             |
|   |            v                  v             |
|   |          Rogue             Villain          |
|   |            |                  |             |
|   |     +-----------+        +-----------+      |
|   |     v           v        v           v      |
|   |   Outlaw    Marauder   Sinner    Antihero   |
|   |                                             |
V   +---------------------------------------------+
    	`;
	} else if (param == "archer") {
		text += `
+-----------+  Unexperienced Adventurer
|
+-> +-Archer---------------+----------------------+
|   |                      v                      |
|   |                   Poacher                   |
|   |                      |                      |
|   |                      v                      |
|   |                    Hunter                   |
|   |                      |                      |
|   |            +------------------+             |
|   |            v                  v             |
|   |         Archer            Gunslinger        |
|   |            |                  |             |
|   |     +-----------+        +-----------+      |
|   |     v           v        v           v      |
|   |   Cross-    Great-     Sharp-    Grenadier  |
|   |   bowman    bowman     shooter              |
|   |                                             |
V   +---------------------------------------------+
    	`;
	} else if (param == "mage") {
		text += `
+-----------+  Unexperienced Adventurer
|
+-> +-Mage-----------------+----------------------+
|   |                      v                      |
|   |                 Magic Pupil                 |
|   |                      |                      |
|   |                      v                      |
|   |                   Magician                  |
|   |                      |                      |
|   |            +------------------+             |
|   |            v                  v             |
|   |         Wizard             Warlock          |
|   |            |                  |             |
|   |     +-----------+        +-----------+      |
|   |     v           v        v           v      |
|   |  Archmage  Conjurer  Necromancer  Occultist |
|   |                                             |
V   +---------------------------------------------+
    	`;
	} else if (param == "priest") {
		text += `
+-----------+  Unexperienced Adventurer
|
+-> +-Priest---------------+----------------------+
|   |                      v                      |
|   |                   Pilgrim                   |
|   |                      |                      |
|   |                      v                      |
|   |                     Monk                    |
|   |                      |                      |
|   |            +------------------+             |
|   |            v                  v             |
|   |          Cleric             Friar           |
|   |            |                  |             |
|   |     +-----------+        +-----------+      |
|   |     v           v        v           v      |
|   |   Priest      Elder   Prophet    Inquisitor |
|   |                                             |
V   +---------------------------------------------+
    	`;
    }

    text += "\n```"
	printMessage(channel, text);
}

function printMessage(channel, text) {
	channel.send(text)
  	.then(message => console.log("\x1b[36m%s\x1b[0m", `[BOT] Sent message: ${message.content}`))
  	.catch(console.error);
}

module.exports.showHelp = showHelp;