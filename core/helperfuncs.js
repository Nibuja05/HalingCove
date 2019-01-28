

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
			break;
		}
	}
	return [];
}

function getItemByID(con, id) {
	return new Promise(async (resolve, reject) => {
		var sql = "SELECT Item.name AS itemName, Item.value, Item.rarity, Item.level, Item.stat1, Item.stat2, IType.name AS typeName, IType.description,";
		sql += " IType.category, IType.mainCategory, IType.subCategory, IType.slot, IType.requirements, IType.stat1Description, IType.stat2Description"
		sql += " FROM itemList AS Item, itemType AS IType WHERE Item.type = IType.typeID AND Item.itemID = " + id;
		var result = await con.query(sql);

		if (result.length > 0) {
			resolve(result[0]);
		} else {
			reject();
		}
	});
}

module.exports.getItemByID = getItemByID;
module.exports.getActionsFromItem = getActionsFromItem;