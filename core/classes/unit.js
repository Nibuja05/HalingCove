class Unit {
	constructor(unitName, unitType, level, unitClass, maxHP, maxMana) {
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

	//player specific
	isPlayer() {
		if (this.unitType == "player") {
			return true;
		}
		return false;
	}
	loadPlayerData(con, player) {
		return new Promise(async (resolve, reject) => {
			resolve();
		});
	}

}

module.exports = Unit;