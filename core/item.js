/**
 * @module core/item
 */

/**
 * generates an item with radnom properties and saves it in the database
 * @param  {Connection} con 	database connection 
 */
function createRandom(con, level) {

	try {
		if (typeof(level) != "string"){
			var level = getRandomInt(1, 50);
		} else {
			console.log("Parsing... " + level);
			level = Number(level);
			console.log(level)
		}
	} catch (e) {
		console.log("Invalid Arguments");
		return;
	}

	getAllTypes(con, function(types) {
		var type = getRandomElement(types);
		var typeID = type[0];
		var typeName = type[1];

		var quality = getRandomInt(0, 10);

		var name = generateRandomName(typeName, quality, level);
		var value = generateValue(quality, level, null)

		var statType1 = type[2];
		var stat1 = generateStat(statType1, quality, level, null)
		var statType2 = type[3];
		var stat2 = generateStat(statType2, quality, level, null)

		var itemText = "[Item] Created New Item:\n" + name + "\n\tType: " + typeName + "\n\tLevel: " + level;
		itemText +=  "\n\tGrade: " + getGradeName(quality) + "\n\t" + statType1 + ": " + stat1 + "\n\t" + statType2 + ": " + stat2;
		itemText += "\n\tValue: " + value;
		console.log(itemText);

	});
}

function createRandomMultiple(con, input) {
	console.log("[Item] Creating multiple items:")
	try {
		var amount = parseInt(input[0], 10);
		for (var i = 0; i < amount; i++) {
			createRandom(con, input[1]);
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
function getAllTypes(con, callback) {
	var types = [];
	var sql = "SELECT typeID, name, stat1Description, stat2Description FROM itemType";
	con.query(sql, function (err, result) {
		if (err) throw err;
		result.forEach( function(res) {
			var tempArr = [res.typeID, res.name, res.stat1Description, res.stat2Description];
			types.push(tempArr);
		});
		return callback(types);
	});
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

/**
 * returns a random item name for an specific item type and grade
 * @param  {string} 	type  	item type
 * @param  {int} 		grade 	rarity/quality from 0 to 10
 * @param  {int} 		level  	item level
 * @return {string}       		random name
 */
function generateRandomName(type, grade, level) {
	var sets = ["of Abserath", "of Kalingdor", "of Sphirenar", "of Lar", "of Haldrin", "of Jerfandur", "of Cerwantes"];

	var name = getGradeName(grade) + " " + type + " " + getRandomElement(sets);

	return name;
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
			baseStatValue = 0.5;
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

module.exports.createRandom = createRandom;
module.exports.createRandomMultiple = createRandomMultiple;