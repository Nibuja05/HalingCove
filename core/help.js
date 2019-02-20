
/**
 * Several functions to display help / tutorials
 */

function showHelp(pre, subject, param, user, channel) {
	switch (subject) {
		case 'classes':
			sendClassTree(pre, user, param, channel);
			break;
	}
}

function sendClassTree(pre, user, param, channel) {
	if (param == "") {
		param = "all";
	}
	var arr = ["all", "defender", "warrior", "assassin", "archer", "mage", "priest"];
	if (!(arr.includes(param.toString()))) {
		printMessage(channel, "Sorry but '" + param + "' is no existing class tree! Try " + pre + "help classes to view all class trees.");
		return;
	}
	var text = "This is the class tree for ";
	if (param == "all") {
		text += "all classes. You can also view this tree for only one class with " + pre + "help classes [classname].";
	} else {
		text += " the " + param + " class.";
	}
	text += "\nTo get more specific informations about a specific class use " + pre + "help class [classname].\n\n\n";
	text += "\n```\n"

	if (param == "all") {
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
|   +---------------------------------------------+
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
|   +---------------------------------------------+
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
|   +---------------------------------------------+
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
|   +---------------------------------------------+
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
|   +---------------------------------------------+
|
+-> +-Priest---------------+----------------------+
    |                      v                      |
    |                   Pilgrim                   |
    |                      |                      |
    |                      v                      |
    |                     Monk                    |
    |                      |                      |
    |            +------------------+             |
    |            v                  v             |
    |          Cleric             Friar           |
    |            |                  |             |
    |     +-----------+        +-----------+      |
    |     v           v        v           v      |
    |   Priest      Elder   Prophet    Inquisitor |
    |                                             |
    +---------------------------------------------+
		`;
	} else if (param == "defender") {
		text += `
+-----------+  Unexperienced Adventurer
|
+-> +-Defender-------------+----------------------+
    |                      v                      |
    |                Backup Guard                 |
    |                      |                      |
    |                      v                      |
    |                  Bodyguard                  |
    |                      |                      |
    |            +------------------+             |
    |            v                  v             |
    |       Royal Guard           Knight          |
    |            |                  |             |
    |     +-----------+        +-----------+      |
    |     v           v        v           v      |
    |  Imperial   Legionary  Paladin    Lancer    |
    |  Bodyguard                                  |
    |                                             |
    +---------------------------------------------+
    	`;
	} else if (param == "warrior") {
		text += `
+-----------+  Unexperienced Adventurer
|
+-> +-Warrior--------------+----------------------+
    |                      v                      |
    |                  Daredevil                  |
    |                      |                      |
    |                      v                      |
    |                   Fighter                   |
    |                      |                      |
    |            +------------------+             |
    |            v                  v             |
    |        Swordsman           Warrior          |
    |            |                  |             |
    |     +-----------+        +-----------+      |
    |     v           v        v           v      |
    |  Blademaster Champion Mercenary Slaughterer |
    |                                             |
    	`;
    } else if (param == "assassin") {
    	text += `
+-----------+  Unexperienced Adventurer
|
+-> +-Assassin-------------+----------------------+
    |                      v                      |
    |                 Road Thief                  |
    |                      |                      |
    |                      v                      |
    |                    Bandit                   |
    |                      |                      |
    |            +------------------+             |
    |            v                  v             |
    |          Rogue             Villain          |
    |            |                  |             |
    |     +-----------+        +-----------+      |
    |     v           v        v           v      |
    |   Outlaw    Marauder   Sinner    Antihero   |
    |                                             |
    +---------------------------------------------+
    	`;
	} else if (param == "archer") {
		text += `
+-----------+  Unexperienced Adventurer
|
+-> +-Archer---------------+----------------------+
    |                      v                      |
    |                   Poacher                   |
    |                      |                      |
    |                      v                      |
    |                    Hunter                   |
    |                      |                      |
    |            +------------------+             |
    |            v                  v             |
    |         Archer            Gunslinger        |
    |            |                  |             |
    |     +-----------+        +-----------+      |
    |     v           v        v           v      |
    |   Cross-    Great-     Sharp-    Grenadier  |
    |   bowman    bowman     shooter              |
    |                                             |
    +---------------------------------------------+
    	`;
	} else if (param == "mage") {
		text += `
+-----------+  Unexperienced Adventurer
|
+-> +-Mage-----------------+----------------------+
    |                      v                      |
    |                 Magic Pupil                 |
    |                      |                      |
    |                      v                      |
    |                   Magician                  |
    |                      |                      |
    |            +------------------+             |
    |            v                  v             |
    |         Wizard             Warlock          |
    |            |                  |             |
    |     +-----------+        +-----------+      |
    |     v           v        v           v      |
    |  Archmage  Conjurer  Necromancer  Occultist |
    |                                             |
    +---------------------------------------------+
    	`;
	} else if (param == "priest") {
		text += `
+-----------+  Unexperienced Adventurer
|
+-> +-Priest---------------+----------------------+
    |                      v                      |
    |                   Pilgrim                   |
    |                      |                      |
    |                      v                      |
    |                     Monk                    |
    |                      |                      |
    |            +------------------+             |
    |            v                  v             |
    |          Cleric             Friar           |
    |            |                  |             |
    |     +-----------+        +-----------+      |
    |     v           v        v           v      |
    |   Priest      Elder   Prophet    Inquisitor |
    |                                             |
    +---------------------------------------------+
    	`;
    }

    text += "\n```"
	printMessage(channel, text);
}

function printMessage(channel, text) {
	channel.send(text)
  	.then(message => console.log(`[BOT] Sent message: ${message.content}`))
  	.catch(console.error);
}

module.exports.showHelp = showHelp;