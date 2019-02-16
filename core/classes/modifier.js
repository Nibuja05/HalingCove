
/**
 * A class to represent modifiers, that executee on certain events and grant bonuses/maluses
 */
class Modifier {
	/**
	 * modifier constructor
	 * @param  {string} name     name of this modifier
	 * @param  {Unit} target     unit to apply this modifier to
	 * @param  {int} value       representation of how strong this modifier is
	 * @param  {int} duration    duration for this modifier, removed after
	 * @return {Modifier}        this modifier
	 */
	constructor(name, target, value, duration) {
		this.name = name;
		this.target = target;
		this.val = value;
		this.duration = duration;

		var modifierInfo = require('./../modifierinfo.json');
		this.events = modifierInfo[name]["Events"];
		this.bonuses = modifierInfo[name]["Bonuses"];
		console.log(this.events);
		console.log(this.bonuses);
		target.addModifier(this)
	}
	/**
	 * executes
	 * @return {[type]} [description]
	 */
	tick() {
		this.duration--;

		//actions here


		if (this.duration == 0) {
			this.remove();
		}
	}
	/**
	 * removes this modifier from its unit
	 * @return {[type]} [description]
	 */
	remove() {
		this.target.removeModifier(this);
	}
}

module.exports = Modifier;