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
			this.weapons = [];
			for (const key in equip) {
				let value = equip[key];
				var item = await helper.getItemByID(con, value);
				this.addWeapon(key, item);
			};
			this.weapons.forEach(item => {
				var actions = helper.getActionsFromItem(item);
				actions = actions.filter(x => !attackActions.includes(x));
				if (attackCount - actions.length >= 0) {
					attackActions = attackActions.concat(actions);
				}
			})

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
		this.creepDamage = [Number(unitInfo.PhysAttack), Number(unitInfo.MagicAttack), Number(unitInfo.PureAttack)];
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
	addWeapon(slot, item) {
		if (slot == 1) {
			if (item.slot == 1 || item.slot == 0 || item.slot == 3) {
				this.weapons.push(item);
			}
		} else if (slot == 2) {
			if (item.slot == 2) {
				this.weapons.push(item);
			} else {
				console.log("[U] Dual wielding!")
			}
		}
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
	getClass() {
		return this.unitClass;
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
	//returns the true damage the unit received after all reductions
	dealDamage(damageTable) {
		var damage = damageTable.damage;
		var attacker = damageTable.attacker;
		var range = damageTable.range;
		var damageSum = damage[0] +  damage[1] +  damage[2]
		if (this.canSurvive(damageSum)) {
			this.curHP = this.curHP - damageSum;
		} else {
			this.curHP = 0;
			this.alive = false;
		}
		return damageSum;
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
	//returns a damage Table (Phys / Magic / Pure)
	getAttackDamage() {
		//get base damage from weapons
		var damage = [0, 0, 0];
		if (this.isPlayer()) {
			if (this.weapons.length > 0) {
				this.weapons.forEach(item => {
					var statType = item.stat1Description;
					if (statType == "PhysAttack") {
						damage[0] += item.stat1;
					} else if (statType == "MagicAttack") {
						damage[1] += item.stat1;
					} else if (statType == "PureAttack") {
						damage[2] += item.stat1;
					}
					var statType = item.stat2Description;
					if (statType == "PhysAttack") {
						damage[0] += item.stat2;
					} else if (statType == "MagicAttack") {
						damage[1] += item.stat2;
					} else if (statType == "PureAttack") {
						damage[2] += item.stat2;
					}
				});
			}
		} else {
			damage = this.creepDamage;
		}
		//add damage variation of 25% (ceil)
		damage.forEach((dmg, index) => {
			if (dmg != 0) {
				var value = Math.ceil(dmg / 4);
				if (value < 1) value = 1;
				var variation = getRandomInt(-value, value);
				damage[index] += variation;
				if (damage[index] < 1) {
					damage[index] = 0;
				}
			}
		})
		return damage;
	}
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = Unit;