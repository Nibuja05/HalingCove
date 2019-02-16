
/**
 * A class for every skill a unit can have, either active or passive
 */
class Skill{
	/**
	 * skill constructor
	 * @param  {string} name  	name of this skill
	 * @param  {int} level 		level (determines strength)
	 * @param  {Unit} owner 	the unit this skill belongs to
	 * @return {Skill}       	this skill
	 */
	constructor(name, level, owner) {
		this.name = name;
		this.level = level;
		this.owner = owner;

		const skillInfo = require('./../skillinfo.json');
		var actives = skillInfo.Active;
		var passives = skillInfo.Passive;
		var infos;
		if (name in actives) {
			this.skillType = "Active";
			infos = actives[name];
			this.manaCost = Number(infos["ManaCost"]);
			this.manaCost = 0;
			this.healthCost = Number(infos["HealthCost"]);
			this.turn = infos["Turn"];
			this.actions = infos["Actions"];
		} else if (name in passives) {
			this.skillType = "Passive";
			infos = passives[name];
		} else {
			return;
		}
		this.maxCooldown = Number(infos["Cooldown"])
		this.curCooldown = 0;
	}
	/**
	 * activates this ability if it can be activated
	 * @param  {Unit} target  target of this skill (optional)
	 * @return {string}       reason why it can't be activated
	 */
	activate(target = undefined) {
		if (this.skillType == "Passive") {
			return "This skill is passive and cannot be activated!";
		}
		if (this.skillType == undefined) {
			return "This skill cannot be activated!";
		}
		if (!this.owner.canCast(this.manaCost, this.healthCost)) {
			return "You can't cast this right now!";
		}
		if (this.curCooldown > 0) {
			return "This skill is currently on cooldown!"
		}
		this.actions.forEach(action => {
			if ("ApplyModifier" in action) {
				var actionInfo = action["ApplyModifier"];
				this.applyModifier(actionInfo["Name"], this.getTarget(actionInfo["Target"], target, this.owner), actionInfo["Strength"], actionInfo["Duration"]);
			}
		});
	}
	/**
	 * gets the actual target from the 'Target' string and the optional target unit
	 * @param  {string} targetType type, defines in the json
	 * @param  {Unit} target       optional target unit
	 * @param  {Unit} owner        the unit this skill belongs to
	 * @return {Unit}              the actual target(s) of this skill
	 */
	getTarget(targetType, target, owner) {
		if (targetType == "Self") {
			return owner;
		} else if (targetType == "Target") {
			return target;
		}
	}
	/**
	 * sets this skill on cooldown (maxCooldown)
	 */
	startCooldwon() {
		this.curCooldown = this.maxCooldown;
	}
	/**
	 * apllies a modifier to a given unit, with a certain strength for a duration
	 * @param  {string} name     name of the modifier
	 * @param  {Unit} target     target unit
	 * @param  {string} strength strength of the modifier
	 * @param  {int} duration    duration in turn
	 */
	applyModifier(name, target, strength, duration) {
		console.log("Applying Modifier '" + name + "' on " + target.toString() + " with strength " + strength + " for " + duration + " turns.");
		const Modifier = require('./modifier.js');
		var newModifier = new Modifier(name, target, strength, Number(duration));
	}

}

module.exports = Skill;