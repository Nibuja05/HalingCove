
/**
 * generates an item with radnom properties and saves it in the database
 * @param  {Connection} con 	database connection
 * @return {Null}     
 */
function createRandom(con) {

	getAllTypes(con, function(types) {
		var type = getRandomElement(types);
		var typeID = type[0];
		var typeName = type[1];
		var name = generateRandomName(typeName);

		console.log(name)

		console.log("[Item] random Item created!");
	});
}

/**
 * return an array with information about every available item type
 * @param  {Connection}	con      	database connection
 * @param  {Function} 	callback 	function to call with result
 * @return {Array}            		array with elements: [typeID(int),name(string)]
 */
function getAllTypes(con, callback) {
	var types = [];
	var sql = "SELECT typeID, name FROM itemType";
	con.query(sql, function (err, result) {
		if (err) throw err;
		result.forEach( function(res) {
			var tempArr = [res.typeID, res.name];
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
 * @return {string}       		random name
 */
function generateRandomName(type, grade) {
	return "Amazing " + type
}

module.exports.createRandom = createRandom;