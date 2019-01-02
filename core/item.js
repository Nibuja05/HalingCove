/**
 * @module core/item
 */

/**
 * generates an item with radnom properties and saves it in the database
 * @param  {Connection} con 	database connection 
 */
async function createRandom(con, channel, itemLevel, insert) {
	console.log(itemLevel);
	return new Promise(async (resolve, reject) => {
		console.log(itemLevel);
		try {
			console.log("Level: " + itemLevel + ", " + typeof(itemLevel));
			var level = Number(itemLevel);
		} catch (e) {
			console.log("Invalid Arguments");
			reject();
		}

		console.log(level);

		const types = await getAllTypes(con);

		var type = getRandomElement(types);
		var typeID = type[0];
		var typeName = type[1];

		var quality = getPseudoRandomInt(0, 10, 'expMin', -0.5);

		var name = await generateRandomName(con, typeName, quality, level, false);
		var value = generateValue(quality, level, null)

		var statType1 = type[2];
		var stat1 = generateStat(statType1, quality, level, null)
		var statType2 = type[3];
		var stat2 = generateStat(statType2, quality, level, null)

		var itemText = "[Item] Created New Item:\n" + name + "\n\tType: " + typeName + "\n\tLevel: " + level;
		itemText +=  "\n\tGrade: " + getGradeName(quality) + "\n\t" + statType1 + ": " + stat1 + "\n\t" + statType2 + ": " + stat2;
		itemText += "\n\tValue: " + value;
		//printMessage(channel, itemText);

		if (insert == true) {
			console.log("[Item] Inserting item to DB...")
			var sql = "INSERT INTO itemList (name, type, stat1, stat2, value, rarity, level) VALUES ('" + name + "'," + typeID + "," + stat1 + "," + stat2 + "," + value + "," + quality + ", " + level + ")";
			var result = await con.query(sql);

			console.log("[DB] 1 record inserted (itemList)");
			resolve([name, result.insertId]);
		} else {
			resolve([]);
		}

	});
}

/**
 * create multiple items at once
 * @param  {Connection} con   	database connection
 * @param  {string} 	input 	input string
 */
function createRandomMultiple(con, channel, input) {
	console.log("[Item] Creating multiple items:")
	try {
		var amount = parseInt(input[0], 10);
		var insert = false;
		if (amount == 1) {
			insert = true;
		}
		for (var i = 0; i < amount; i++) {
			createRandom(con, channel, input[1], insert);
		}
	} catch (e) {
		console.log("Invalid Arguments");
		return;
	}
}

/**
 * return an array with information about every available item type
 * @param  {Connection}	con      	database connection
 * @param  {Function} 	callback 	function to call with result
 * @return {Array}            		array with elements: [typeID(int),name(string),type1(string),type2(string)]
 */
function getAllTypes(con) {
	return new Promise(async (resolve, reject) => {
		var types = [];
		var sql = "SELECT typeID, name, stat1Description, stat2Description FROM itemType";
		var result = await con.query(sql);
		result.forEach( res => {
			var tempArr = [res.typeID, res.name, res.stat1Description, res.stat2Description];
			types.push(tempArr);
		});
		resolve(types);
	})

}

/**
 * generates a random Integer value between min and max (including)
 * @param  {int} 	min 	minimum value
 * @param  {int} 	max 	maximum value
 * @return {int}     		radnom integer
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * generates a random Float value between min and max (including)
 * @param  {float} 	min 	minimum value
 * @param  {float} 	max 	maximum value
 * @return {float}     		radnom integer
 */
function getRandomFloat(min, max) 
{
    return Math.random() * (max-min) + min ;
} 

/**
 * returns a radnom element from an array
 * @param  {Array} 		arr 	array to choose from
 * @return {Element}     		elemet from array
 */
function getRandomElement(arr) {
	var max = arr.length - 1;
	return arr[getRandomInt(0,max)];
}

function getPseudoRandomInt(min, max, genType, genStat) {
	var globMax = 1000;
	var rand = getRandomInt(1, globMax);
	var randDict = {};
	switch(genType) {
		//lowest number with highest probability
		//genStat: bonus for lowest number
		case 'expMin':
			let randArr = new Array(max + 1 - min).fill(1);
			randArr = randArr.map((x, index) => min + x * index);
			let boost = genStat * globMax
			let mult = (globMax - boost) / (Math.sqrt(max + 1 - min));
			function func(x) { return boost + Math.sqrt(x) * mult };
			let prob = 0;
			randArr.forEach((x, index) => {
				randDict[x] = func(index + 1);
			});
		break;
	}
	var pseudoRand = min;
	for (const key in randDict) {
		let value = randDict[key];
		if (value < rand) {
			pseudoRand = key;
		} else {
			break;
		}
	};
	return pseudoRand;
}

/**
 * returns a random item name for an specific item type and grade
 * @param  {string} 	type  	item type
 * @param  {int} 		grade 	rarity/quality from 0 to 10
 * @param  {int} 		level  	item level
 * @return {string}       		random name
 */
async function generateRandomName(con, type, grade, level, isInSet) {
	var sets = ["of Abserath", "of Kalingdor", "of Sphirenar", "of Lar", "of Haldrin", "of Jerfandur", "of Cerwantes"];
	var set = getRandomElement(sets);
	if(isInSet == false) {
		set = "";
	}
	var name = getGradeName(grade) + " " + await getLevelName(con, level, type) + " " + set;

	return name;
}

/**
 * returns the name for a specific grade
 * @param  {int} 	grade 	rarity/quality from 0 to 10
 * @return {string}    		grade name   
 */
function getGradeName(grade) {
	var grades = ["Broken", "Corridated", "Old", "Shabby", "Ordinary", "New", "Shiny", "Superior", "Majestic", "Epic", "Legendary"];
	if (grade < 0 || grade > 10) {
		return "";
	}
	return grades[grade];
}

async function getLevelName(con, level, type) {
	if(level < 1 || level > 100) return "";
	var name = "";
	var mainIndex = (level - 1) % 10;
	var preIndex = Math.floor(level / 10);

	var metal = ["Copper", "Iron", "Bronze", "Steel", "Silver", "Platinum", "Titanium", "Mithril", "Adamant", "Arcanium"];
	var metalPre = ["", "Polished ", "Hardened ", "Reinforced ", "Ornamented ", "Enchanted ", "Blessed ", "Eternal ", "Holy ", "Dragon Blood "];

	var magic = ["Birch", "Cedar", "Oak", "Bone", "Ironwood", "Quartz", "Silver", "Gold", "Ivory", "Crystal" ];
	var magicPre = ["", "Polished ", "Carved ", "Decorated ", "Ornamented ", "Enchanted ", "Blessed ", "Eternal ", "Holy ", "Dragon Blood "];

	var category = await getSubCategory(con, type);
	switch(category) {
		case 'metal':
			name = metalPre[preIndex] + metal[mainIndex] + " " + type;
			break;
		case 'magic':
			name = magicPre[preIndex] + magic[mainIndex] + " " + type;
		break;
	}
	return name;
}

function getSubCategory(con, type) {
	return new Promise(async (resolve, reject) => {
		var sql = "SELECT subCategory FROM itemType WHERE name = '" + type + "'";
		const result = await con.query(sql)
		if (result.length > 0) {
			resolve(result[0].subCategory);
		} else {
			resolve("");
		}
	})
}

/**
 * calculates the value for an item
 * @param  {int} 		grade    	rarity/quality from 0 to 10
 * @param  {int} 		level    	item level
 * @param  {Array} 		modifier 	additional modifiers, eg. cursed, etc
 * @return {int}          			value in gold
 */
function generateValue(grade, level, modifier) {
	var value = 0;
	var minGrade = 0;
	if (grade > 3) { minGrade = grade - 3 }
	var baseGoldValue = 10;
	var minBaseGold = baseGoldValue - (baseGoldValue / 10);
	var maxBaseGold = baseGoldValue + (baseGoldValue / 10);

	var randomGrade = getRandomInt(minGrade + 1, grade + 1);
	var randomGold = getRandomFloat(minBaseGold, maxBaseGold);
	value = Math.floor((randomGrade * randomGold) * getRandomInt(level - 1, level + 1));

	//add modifier stuff here

	return value;
}

/**
 * calculates attributes for items
 * @param  {string} 	type     	stat type
 * @param  {int} 		grade    	rarity/quality from 0 to 10
 * @param  {int} 		level    	item level
 * @param  {array} 		modifier 	additional modifiers, eg. cursed, etc
 * @return {int}          			stat value
 */
function generateStat(type, grade, level, modifier) {

	if (type == "None") {
		return 0;
	}

	var value = 0;
	var baseGradeMult = 1.0;
	var newGrade = -(5 - grade);
	var gradeMult = baseGradeMult + (newGrade / 15)
	var minGradeMult = gradeMult - 0.1
	var baseStatValue = 0;
	switch(type) {
		case 'PhysAttack':
			baseStatValue = 4;
			break;
		case 'ArmorPierce':
			baseStatValue = 1.5;
			break;
		case 'ArmorBreak':
			baseStatValue = 0.5;
			break;
		case 'MagicAttack':
			baseStatValue = 3;
			break;
		case 'PhysArmor':
			baseStatValue = 2;
			break;
		case 'MagicalArmor':
			baseStatValue = 1;
			break;
	}
	var minStatValue = baseStatValue - (baseStatValue / 10);
	var maxStatValue = baseStatValue + (baseStatValue / 10);
	var randomStatValue = getRandomFloat(minStatValue, maxStatValue);
	if (randomStatValue < 0) { randomStatValue = 0 }

	var randomGradeMult = getRandomFloat(minGradeMult, gradeMult);
	value = Math.floor((randomGradeMult * randomStatValue) * level);

	//add modifier stuff here
	
	return value;
}

function printMessage(channel, text) {
    channel.send(text)
  	.then(message => console.log(`Sent message: ${message.content}`))
  	.catch(console.error);
}

module.exports.createRandom = createRandom;
module.exports.createRandomMultiple = createRandomMultiple;