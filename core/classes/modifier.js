
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
	constructor(name, target, source, value, duration) {
		this.name = name;
		this.parent = target;
		this.val = value;
		this.duration = duration;
		this.source = source;
		this.age = 0;

		var modifierInfo = require('./../modifierinfo.json');
		this.events = modifierInfo[name]["Events"];
		this.bonuses = modifierInfo[name]["Bonuses"];
		this.showName = modifierInfo[name]["Name"];
		this.Emitter = target.addModifier(this);

		this.tick = this.tick.bind(this);
		this.onAttackLanded = this.onAttackLanded.bind(this);
		this.onTakeDamage = this.onTakeDamage.bind(this);

		this.addListener();
	}
	/**
	 * removes this modifier from its unit
	 * @return {[type]} [description]
	 */
	remove() {
		this.parent.removeModifier(this);
		this.parent.battleLog.addDelayed(this.parent.toString() + " is no longer affected by " + this.showName);
		console.log(this.Emitter.listenerCount("OnTurnStart"));
		this.listener.forEach(listener => {
			this.Emitter.removeListener(listener.event, listener.func);
		});
		console.log(this.Emitter.listenerCount("OnTurnStart"));
	}
	/**
	 * adds all important event listener for this modifier
	 */
	addListener() {
		this.Emitter.addListener("OnTurnStart", this.tick);
		this.listener = [{event:"OnTurnStart",func:this.tick}];
		//filter duplicates
		var eventArr = [];
		this.events.forEach(event => {
			if ("OnAttackLanded" in event && !(eventArr.includes("OnAttackLanded"))) {
				eventArr.push("OnAttackLanded");
			} else if ("OnTakeDamage" in event && !(eventArr.includes("OnTakeDamage"))) {
				eventArr.push("OnTakeDamage");
			}
		});
		//add listener
		eventArr.forEach(event => {
			if (event == "OnAttackLanded") {
				this.Emitter.addListener(event, this.onAttackLanded);
				this.listener.push({event:"OnAttackLanded",func:this.onAttackLanded})
			} else if (event == "OnTakeDamage") {
				this.Emitter.addListener(event, this.onTakeDamage);
				this.listener.push({event:"OnTakeDamage",func:this.onTakeDamage})
			}
		});
	}
	/**
	 * converts a string value to a number
	 * @param  {string} value value string, eg. '%val * 2'
	 * @return {int/float}       number representation
	 */
	getValue(value) {
		value = value.replace("%val", this.val);
		value = value.replace("%age", this.age);
		return Number(eval(value));
	}
	/**
	 * executes every time the player starts its turn
	 */
	tick(unit) {
		if (unit == this.parent) {
			console.log("[MOD] Tick for " + this.name + "!");
			this.duration--;
			this.age++;

			this.events.forEach(event => {
				if ("OnTurnStart" in event) {
					var eventInfo = event["OnTurnStart"];
					this.doActions(eventInfo, "OnTurnStart", undefined, this.parent);
				}
			});

			if (this.duration == 0) {
				this.remove();
			}
		}
	}
	/**
	 * executes every time the parent succesfully attacks somebody
	 * @param  {Dict} data event data
	 */
	onAttackLanded(data) {
		console.log("[MOD] Attack Landed!");
		this.events.forEach(event => {
			if ("OnAttackLanded" in event) {
				var eventInfo = event["OnAttackLanded"];
				this.doActions(eventInfo, "OnAttackLanded", data.victim, data.attacker, data);
			}
		});
	}
	/**
	 * executes every time the parent takes damage from any source
	 * @param  {Disct} data ebent data
	 */
	onTakeDamage(data) {
		console.log("[MOD] Took Damage!");
		this.events.forEach(event => {
			if ("OnTakeDamage" in event) {
				var eventInfo = event["OnTakeDamage"];
				this.doActions(eventInfo, "OnTakeDamage", data.victim, data.attacker, data);
			}
		});
	}
	/**
	 * executes all type of actions
	 * @param  {Dict} eventInfo event dictionary
	 * @param  {Unit} target    target unit
	 */
	doActions(eventInfo, eventName, target, source, optData) {
		const act = require("./../fightactions.js");
		if ("EventMessage" in eventInfo) {
			var message = eventInfo["EventMessage"];
			var text = this.getEventMessage(message, eventName, target, source, optData);
			if (eventName == "OnTurnStart") {
				this.parent.battleLog.add(text);
			} else {
				this.parent.battleLog.addDelayed(text);
			}
		}
		if ("ApplyModifier" in eventInfo) {
			var actionInfo = eventInfo["ApplyModifier"];
			act.applyModifier(actionInfo["Name"], act.getTarget(actionInfo["Target"], target, source),
			 source, this.getValue(actionInfo["Strength"]), this.getValue(actionInfo["Duration"]));
		} else if ("DealDamage" in eventInfo) {
			var actionInfo = eventInfo["DealDamage"];
			var damage = [this.getValue(actionInfo["PhysDamage"]), this.getValue(actionInfo["MagicDamage"]), this.getValue(actionInfo["PureDamage"])];
			act.dealDamage(damage, act.getTarget(actionInfo["Target"], target, source), source);
		}
	}
	/**
	 * replaces all relative values in an event message with the right strings
	 */
	getEventMessage(msg, eventName, target, source, optData) {
		var msg = msg.replace("%parent", this.parent.toString());
		if (!(target == undefined)) {
			msg = msg.replace("%target", target.toString());
		}
		var splitArr = [];
		var matches = msg.match(/\{(.*?)\}/g);
		if (matches) {
			matches.forEach(m => {
				var content = m.slice(1,m.length - 1);
				msg = msg.replace(m, this.getValue(content));
			});
		}
		return msg;
	}
}

module.exports = Modifier;