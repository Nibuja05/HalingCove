
const to = require('await-to-js').default;

/**
 * returns the possible actions for the specific weapon types
 * @param  {Dictionary<String>} 	item 	Item to get actions from
 * @return {Array<String>}     				possible actions 			
 */
function getActionsFromItem(item) {
	var mainCategory = item.mainCategory;
	if (typeof mainCategory != 'undefined') {
		switch(mainCategory) {
			case 'Hand':
				return ["High", "Middle"];
			case 'Swordlike':
				return ["High", "Left", "Right", "Low"];
			case 'Spear':
				return ["High", "Middle", "Low"];
			case 'Shield':
				return ["High", "Left", "Right", "Low"];
			case 'Magic':
				return ["Random"];
			break;
		}
	}
	return [];
}

/**
 * requests all information about a specific item
 * @param  {Connection} 	con 	connection to database
 * @param  {int} 			ID  	item identififer
 * @return {Dictionary}				item dictionary     			
 */
async function getItemByID(con, ID) {
	var sql = "SELECT name AS itemName, value, rarity, level FROM itemList WHERE itemID = " + ID;
	var itemResult = await databaseRequest(con, sql);
	sql = "SELECT * FROM itemList AS Item, itemType AS IType WHERE Item.type = IType.typeID AND Item.itemID = " + ID;
	var typeResult = await databaseRequest(con, sql);
	var endResult = [];
	if (itemResult.length > 0) {
		endResult = itemResult[0];
		endResult = Object.assign({}, endResult, typeResult[0]); 
	} 
	return endResult;
}

/**
 * requests all information about a specific unique item
 * @param  {Connection} 	con 	connection to database
 * @param  {int} 			uID  	unique item identififer
 * @return {Dictionary}				item dictionary     			
 */
async function getUniqueItemByID(con, uID) {
	var sql = "SELECT cond AS condition, charges FROM uniqueItemList WHERE uItemID = " + uID;
	itemResult = await databaseRequest(con, sql);
	sql = "SELECT * FROM itemList AS Item, itemType AS IType, uniqueItemList As uItem WHERE Item.type = IType.typeID AND Item.itemID = uItem.refItem AND uItem.uItemID = " + uID;
	typeResult = await databaseRequest(con, sql);
	var endResult = [];
	if (itemResult.length > 0) {
		endResult = itemResult[0];
		endResult = Object.assign({}, endResult, typeResult[0]); 
	} 
	return endResult;
}

/**
 * gets the base itemID for this unique item
 * @param  {Connection} 	con 	connection to database
 * @param  {int} 			uID  	unique item identififer
 * @return {item}					item identifier  
 */
async function getItemIDFromUID(con, uID) {
	var sql = "SELECT itemID FROM itemList, uniqueItemList WHERE itemID = refItem AND uItemID = " + uID;
	var result = await databaseRequest(con, sql);
	var itemID = "";
	if (result.length > 0) {
		itemID = result[0].itemID;
	}
	return itemID;
}

/**
 * general function to make a sql request on the database
 * @param  {Connection} 	con   	connection to database
 * @param  {String} 		query 	sql query
 * @return {String}       			sql answer from database
 */
async function databaseRequest(con, query) {
	let err, result;

	[err, result] = await to(con.query(query));
	if(err) {
		console.log("[DB] Something went wrong:");
		console.log(err);
		return [];
	}
	return result;
}

module.exports.getItemByID = getItemByID;
module.exports.getItemIDFromUID = getItemIDFromUID;
module.exports.getActionsFromItem = getActionsFromItem;
module.exports.getUniqueItemByID = getUniqueItemByID;
module.exports.databaseRequest = databaseRequest;