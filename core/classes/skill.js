
/**
 * A class for every skill a unit can have, either active or passive
 */
class Skill{
	/**
	 * skill constructor
	 * @param  {string} name  	name of this skill
	 * @param  {int} level 		level (determines strength)
	 * @param  {Unit} owner 	the unit this skill belongs to
	 * @param  {EventEmitter} emitter  	event emiiter from the owner unit
	 * @return {Skill}       	this skill
	 */
	constructor(name, level, owner, emitter) {
		this.name = name;
		this.level = level;
		this.owner = owner;
		this.emitter = emitter;

		this.emitter.addListener("OnTurnStart", data => this.reduceCooldown());

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
		this.count = 0;
	}
	/**
	 * returs a text representation of this skill
	 * @return {string} name and current cooldown
	 */
	toString() {
		var cooldown = this.curCooldown;
		if (cooldown == 0) {
			cooldown = "Ready";
		}
		return this.name + " (" + this.curCooldown + ")";
	}
	/**
	 * activates this ability if it can be activated
	 * @param  {Unit} target  target of this skill (optional)
	 * @return {string}       reason why it can't be activated
	 */
	activate(target = undefined) {
		if (this.skillType == "Passive") {
			return {success:false,text:"This skill is passive and cannot be activated!"};
		}
		if (this.skillType == undefined) {
			return {success:false,text:"This skill cannot be activated!"};
		}
		if (!this.owner.canCast(this.manaCost, this.healthCost)) {
			return {success:false,text:"You can't cast this right now!"};
		}
		if (this.curCooldown > 0) {
			return {success:false,text:"This skill is currently on cooldown!"};
		}
		const act = require("./../fightactions.js");
		this.actions.forEach(action => {
			if ("ApplyModifier" in action) {
				var actionInfo = action["ApplyModifier"];
				act.applyModifier(actionInfo["Name"], act.getTarget(actionInfo["Target"], target, this.owner),
				 this.owner, this.getStrength(actionInfo["Strength"]), this.getStrength(actionInfo["Duration"]));
			}
		});
		this.startCooldwon();
		this.spendCost();
		return {success:true,text:this.owner.toString() + " used " + this.name};
	}
	/**
	 * is this skill an attack skill?
	 * @return {Boolean} status
	 */
	isAttackSkill() {
		if (this.turn.includes("Attack")) {
			return true;
		}
		return false;
	}
	/**
	 * is this skill a defend skill?
	 * @return {Boolean} status
	 */
	isDefendSkill() {
		if (this.turn.includes("Defend")) {
			return true;
		}
		return false;
	}
	/**
	 * does this skill consumes no action?
	 * @return {Boolean} status
	 */
	isBonusAction() {
		if (this.turn.includes("Bonus")) {
			return true;
		}
		return false;
	}
	/**
	 * sets this skill on cooldown (maxCooldown)
	 */
	startCooldwon() {
		this.count++;
		this.curCooldown = this.maxCooldown;
	}
	/**
	 * reduces the cooldown of this skill by 1
	 */
	reduceCooldown() {
		if (this.curCooldown > 0) {
			this.curCooldown--;
		}	
	}
	spendCost() {
		this.owner.curMana -= this.manaCost;
		this.owner.curHP -= this.healthCost;
	}
	/**
	 * converts a string value to a number
	 * @param  {string} value value string, eg. '%level * 2'
	 * @return {int/float}       number representation
	 */
	getStrength(strength) {
		strength = strength.replace("%level", this.level);
		strength = strength.replace("%count", this.count);
		return Number(eval(strength));
	}
}

module.exports = Skill;