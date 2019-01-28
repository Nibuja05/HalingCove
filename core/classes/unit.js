class Unit {
	initCreep(con, name) {
		return new Promise(async (resolve, reject) => {

		});
	}
	initPlayer(con, user) {
		return new Promise(async (resolve, reject) => {
			const character = require('./../character.js');
			const helper = require('./../helperfuncs.js');
			var equip = await character.getEquip(con, user);

			var attackCount = 4;
			var defendCount = 4;
			var attackActions = [];
			var defendActions = [];
			for (const key in equip) {
				let value = equip[key];
				var item = await helper.getItemByID(con, value);
				if (item.slot == 1) {
					console.log("1:")
					var actions = helper.getActionsFromItem(item);
					attackCount -= actions.length;
					attackActions = actions;
				}
				if ((item.slot == 2 || item.slot == 0) && attackCount > 0) {
					console.log("0 or 2:")
					var actions = helper.getActionsFromItem(item);
					if (item.category == 'Weapon') {
						actions = actions.filter(x => !attackActions.includes(x));
						if (attackCount - actions.length >= 0) {
							attackActions = attackActions.concat(actions);
						}
					} else {
						actions = actions.filter(x => !defendActions.includes(x));
						if (defendCount - actions.length >= 0) {
							defendActions = defendActions.concat(actions);
						}
					}
				}
			};

			var sql = "SELECT name AS charName, level, class AS charClass, modifiers FROM charList WHERE active = 1 AND userID = " + user.id;
			var result = await con.query(sql);

			if (result.length > 0) {
				result = result[0];
				const unitInfo = require('./../unitinfo.json').player[result.charClass];

				var hp = this.calculateStartHP(unitInfo.BaseHP, true);
				var mana = this.calculateStartMana(unitInfo.BaseMana, true);
				this.setVals(result.charName, "player", result.level, result.charClass, hp, mana, attackActions, defendActions);
				resolve();
			} else {
				reject();
			}
		});
	}
	initCreep(name, level, modifiers) {
		const unitInfo = require('./../unitinfo.json').creep[name];

		var hp = this.calculateStartHP(unitInfo.BaseHP, false);
		var mana = this.calculateStartMana(unitInfo.BaseMana, false);
		this.setVals(name, "creep", level, unitInfo.MovePattern, hp, mana, unitInfo.AttackPattern, unitInfo.DefendPattern)
	}
	calculateStartHP(baseHP, isPlayer) {
		var hp = baseHP;
		return hp;
	}
	calculateStartMana(baseMana, isPlayer) {
		var mana = baseMana;
		return mana;
	}
	setVals(unitName, unitType, level, unitClass, maxHP, maxMana, attackActions, defendActions) {
		this.unitName = unitName;
		this.level = level;
		this.unitClass = unitClass;
		this.unitType = unitType;
		this.maxHP = maxHP;
		this.curHP = maxHP;
		this.maxMana = maxMana;
		this.curMana = maxMana;
		this.alive = true;
		this.modifiers = [];
		this.attackActions = attackActions;
		this.defendActions = defendActions;
	}
	toString() {
		return this.unitName + " (lvl " + this.level + ")";
	}
	isAlive() {
		return this.alive;
	}
	isCreep() {
		if (this.unitType == "creep") {
			return true;
		}
		return false;
	}
	isMinLevel(level) {
		if (level <= this.level) {
			return true;
		}
		return false;
	}
	canSurvive(damage) {
		if ((this.curHP - damage) > 0) {
			return true;
		}
		return false;
	}
	canCast(manaCost) {
		if ((this.curMana - manaCost) > 0) {
			return true;
		}
		return false;
	}
	hasModifier(modifierName) {
		var nameList = this.modifiers.map(x => x.modName);
		if (modifierName in nameList) {
			return true;
		}
		return false;
	}
	dealDamage(damage) {
		if (this.canSurvive(damage)) {
			this.curHP = this.curHP - damage;
		} else {
			
			this.alive = false;
		}
		return this.alive;
	}
	kill() {
		this.alive = false;
	}
	isPlayer() {
		if (this.unitType == "player") {
			return true;
		}
		return false;
	}
	getAttackActions() {
		return this.attackActions;
	}
	getDefendActions() {
		return this.defendActions;
	}

}

module.exports = Unit;