
/**
 * A class for all units in a battle to quickly perform actions like attacking, casting, etc
 */
class Unit {
	/**
	 * initializes a player with values from the database
	 * @param  {Connection} con  	database connection
	 * @param  {User} user 			player
	 * @return {Promise}      		promise
	 */
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
	/**
	 * initializes a creep with values from unitinfo.json
	 * @param  {string} name      	name of this creep
	 * @param  {int} level     		level of this creep
	 * @param  {Array<Modifier>} modifiers array of modifiers this unit has from the start
	 */
	initCreep(name, level, modifiers) {
		const unitInfo = require('./../unitinfo.json').creep[name];

		var hp = this.calculateStartHP(unitInfo.BaseHP, false);
		var mana = this.calculateStartMana(unitInfo.BaseMana, false);
		this.creepDamage = [Number(unitInfo.PhysAttack), Number(unitInfo.MagicAttack), Number(unitInfo.PureAttack)];
		this.setVals(name, "creep", level, unitInfo.MovePattern, hp, mana, unitInfo.AttackPattern, unitInfo.DefendPattern)
	}
	/**
	 * calculates the starting HP
	 * @param  {int}  baseHP   base HP
	 * @param  {Boolean} isPlayer if this unit is player
	 */
	calculateStartHP(baseHP, isPlayer) {
		var hp = baseHP;
		return hp;
	}
	/**
	 * calculates the starting Mana
	 * @param  {int}  baseHP   base Mana
	 * @param  {Boolean} isPlayer if this unit is player
	 */
	calculateStartMana(baseMana, isPlayer) {
		var mana = baseMana;
		return mana;
	}
	/**
	 * saves all important values to this unit
	 * @param {string} unitName      name of this unit
	 * @param {string} unitType      type of this unit
	 * @param {int} level         	 level of this unit
	 * @param {string} unitClass     class of this unit
	 * @param {int} maxHP         maximum HP
	 * @param {int} maxMana       maximum Mana
	 * @param {Array<string>} attackActions avaliable attack actions
	 * @param {Array<string>} defendActions avaliable defend actions
	 */
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
		this.range = 1;

		this.events = require('events');
		this.emitter = new this.events.EventEmitter();
	}
	/**
	 * return the name if this unit
	 * @return {string} name
	 */
	getName() {
		return this.unitName;
	}
	/**
	 * changes the name of this unit
	 * @param {string} name new name
	 */
	setName(name) {
		if (!this.modifiedName) {
			this.modifiedName = true;
			this.unitName = name;
		}		
	}
	/**
	 * equips a new weapon to this unit
	 * @param {int} slot equip slot
	 * @param {Item} item the item to equip
	 */
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
	/**
	 * return a string representation of this unit
	 * @return {string} name, class and level
	 */
	toString() {
		return this.unitName + " (lvl " + this.level + ")";
	}
	/**
	 * is this unit alive?
	 * @return {Boolean} is status
	 */
	isAlive() {
		return this.alive;
	}
	/**
	 * is this unit a creep?
	 * @return {Boolean} status
	 */
	isCreep() {
		if (this.unitType == "creep") {
			return true;
		}
		return false;
	}
	/**
	 * is this unit at least level x?
	 * @param  {int}  level level to test
	 * @return {Boolean}       answer
	 */
	isMinLevel(level) {
		if (level <= this.level) {
			return true;
		}
		return false;
	}
	/**
	 * return the unit class of this unit
	 * @return {string} unit class
	 */
	getClass() {
		return this.unitClass;
	}
	/**
	 * decides if this unit can survive gievn damage
	 * @param  {int} damage damage to test
	 * @return {Boolean}        status
	 */
	canSurvive(damage) {
		if ((this.curHP - damage) > 0) {
			return true;
		}
		return false;
	}
	/**
	 * can this unit cast something with this costs?
	 * @param  {int} manaCost   mana cost
	 * @param  {int} healthCost health cost
	 * @return {Boolean}            status
	 */
	canCast(manaCost, healthCost = 0) {
		if ((this.curMana - manaCost) >= 0) {
			if ((this.curMana - healthCost) >= 0) {
				return true;
			}
		}
		return false;
	}
	/**
	 * has this unit a modifier with this name?
	 * @param  {string}  modifierName name of the modifier
	 * @return {Boolean}              status
	 */
	hasModifier(modifierName) {
		var nameList = this.modifiers.map(x => x.modName);
		if (modifierName in nameList) {
			return true;
		}
		return false;
	}
	/**
	 * deals damage to this unit
	 * @param  {Array<int>} damageTable 	damage table (Phys / Magic / Pure)
	 * @return {int}             			sum of the true damage this unit received after all reductions
	 */
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
		this.emitter.emit("OnTakeDamage", {attacker:attacker, victim:this, distance:range, dealtDamage:damageSum, origDamage:damage});
		return damageSum;
	}
	/**
	 * kills this unit immideatly
	 */
	kill() {
		this.alive = false;
	}
	/**
	 * is this unit a player?
	 * @return {Boolean} status
	 */
	isPlayer() {
		if (this.unitType == "player") {
			return true;
		}
		return false;
	}
	/**
	 * add a new modifier to this unit
	 * @param {Modifier} modifier new modifier
	 * @return {EventEmitter}	event emitter of this unit
	 */
	addModifier(modifier) {
		this.modifiers.push(modifier);
		return this.emitter;
	}
	/**
	 * remove a given modifier from this unit
	 * @param  {Modifier} modifier modifier to remove
	 */
	removeModifier(modifier) {
		var newModifiers = [];
		this.modifiers.forEach(mod => {
			if (!(mod === modifier)) {
				newModifiers.push(mod);
			}
		});
		this.modifiers = newModifiers;
	}
	/**
	 * remove all modifiers with a given name from this unit
	 * @param  {string} modifierName name of the modifier
	 */
	removeModifierByName(modifierName) {
		var newModifiers = [];
		this.modifiers.forEach(mod => {
			if (!(mod.name == modifierName)) {
				newModifiers.push(mod);
			}
		});
		this.modifiers = newModifiers;
	}
	/**
	 * return a list of all possible attack actions
	 * @return {Array<string>} possible attack actions
	 */
	getAttackActions() {
		return this.attackActions;
	}
	/**
	 * return a list of all possible defend actions
	 * @return {Array<string>} possible defend actions
	 */
	getDefendActions() {
		return this.defendActions;
	}
	/**
	 * returns the attack damage of this unit as damage table
	 * @return {Array<int>} damage table (Phys / Magic / Pure)
	 */
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
	/**
	 * adds the current battle log to this unit, to add important stuff directly
	 */
	addLog(log) {
		this.battleLog = log;
	}
	/**
	 * attacks an enemy to deal damage
	 * @param  {Unit} enemy 	unit to attack  	
	 */
	attackEnemy(enemy, option) {
		var damageTable = {};
		damageTable.attacker = this;
		damageTable.range = this.range;
		damageTable.damage = this.getAttackDamage();
		var trueDamage = enemy.dealDamage(damageTable);
		if (enemy.isAlive()) {
			var text = this.toString() + " attacked " + enemy.toString() + " " + option + " and dealt " + trueDamage + " damage!";
		} else {
			var text = this.toString() + " attacked " + enemy.toString() + " " + option + " and dealt " + trueDamage + " damage!";
			text += "\n" + this.toString() + " killed " + enemy.toString() + "!";	
		}
		this.emitter.emit("OnAttackLanded", {attacker:this, victim:enemy, attackOption:option, dealtDamage:trueDamage});
		this.battleLog.add(text);
	}
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = Unit;