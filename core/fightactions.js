
const Modifier = require('./classes/modifier.js');

/**
 * apllies a modifier to a given unit, with a certain strength for a duration
 * @param  {string} name     name of the modifier
 * @param  {Unit} target     target unit
 * @param  {string} strength strength of the modifier
 * @param  {int} duration    duration in turn
 */
function applyModifier(name, target, source, strength, duration) {
	console.log("[FA] Applying Modifier '" + name + "' on " + target.toString() + " with strength " + strength + " for " + duration + " turns.");
	var newModifier = new Modifier(name, target, source, strength, Number(duration));
}

function dealDamage(damage, target, source) {
	console.log("[FA] Dealing damage to " + target.toString());
	target.dealDamage({damage:damage, attacker:source, range:1});
}

/**
 * gets the actual target from the 'Target' string and the optional target unit
 * @param  {string} targetType type, defines in the json
 * @param  {Unit} target       optional target unit
 * @param  {Unit} owner        the unit this skill belongs to
 * @return {Unit}              the actual target(s) of this skill
 */
function getTarget(targetType, target, owner) {
	if (targetType == "Self") {
		return owner;
	} else if (targetType == "Enemy") {
		return target;
	}
}

module.exports.applyModifier = applyModifier;
module.exports.dealDamage = dealDamage;
module.exports.getTarget = getTarget;