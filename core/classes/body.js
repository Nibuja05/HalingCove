
/**
 * A class to handle all body-part specific functions like armor, bones, hitboxes etc
 */
class Body {

	constructor(unit, bodyType, skeletonType, fleshType) {

		// Assumptions made here:
		// - Every body has at least one body part
		// - Only existing body parts can be hit
		// - Bone + Flesh: Crush, Cut off possible
		// - Only Bone: Crush and Cut ogg possible -> Both destroy
		// - Only Flesh: Cut off possible
		// - Body parts without flesh are immune to effects like: poison, bleed etc
		// - Mechaical parts count as bones only
		
		this.unit = unit;
		this.hitbox = this.getHitbox(bodyType);
		this.generateBones(skeletonType);
		this.generateFlesh(fleshType);

	}

	toString() {
		// var text = "Body of " + unit + ":\n";
		var text = "";
		if (Object.keys(this.hitbox.high).length > 0) {
			text += "High: \n";
			for (const [key, value] of Object.entries(this.hitbox.high)) {
				text += "- " + value.toString() + "\n";
			}
		}
		if (Object.keys(this.hitbox.middle).length > 0) {
			text += "Middle: \n";
			for (const [key, value] of Object.entries(this.hitbox.middle)) {
				text += "- " + value.toString() + "\n";
			}
		}
		if (Object.keys(this.hitbox.low).length > 0) {
			text += "Low: \n";
			for (const [key, value] of Object.entries(this.hitbox.low)) {
				text += "- " + value.toString() + "\n";
			}
		}
		return text;
	}

	getHitbox(bodyType) {
		var hitbox = {};
		var high = {};
		var middle = {};
		var low = {};

		switch (bodyType) {
			case 'Human':
				high.head = new BodyPart("Head")
				middle.chest = new BodyPart("Chest")
				middle.rightArm = new BodyPart("Arm", "Right")
				middle.leftArm = new BodyPart("Arm", "Left")
				low.rightLeg = new BodyPart("Leg", "Right")
				low.leftLeg = new BodyPart("Leg", "Left")
				break;
			case  'Slime':
				low.chest = new BodyPart("Chest")
				break;
			case 'SmallAnimal':
				middle.head = new BodyPart("Head")
				low.chest = new BodyPart("Chest")
				low.rightArm = new BodyPart("Arm", "Right")
				low.leftArm = new BodyPart("Arm", "Left")
				low.rightLeg = new BodyPart("Leg", "Right")
				low.rightLeg = new BodyPart("Leg", "Left")
				break;
		}
		hitbox.high = high;
		hitbox.middle = middle;
		hitbox.low = low;
		return hitbox;
	}

	generateBones(skeletonType) {
		var partList = [];

		switch (skeletonType) {
			case 'All':
				partList.push("Head");
				partList.push("Chest");
				partList.push("Right Arm");
				partList.push("Left Arm");
				partList.push("Right Leg");
				partList.push("Left Leg");
				break;
		}

		partList.forEach(partName => {
			if (this.hasBodyPart(partName)) {
				var part = this.findBodypart(partName);
				part.setBone();
			}
		});
	}

	generateFlesh(fleshType) {
		var partList = [];

		switch (fleshType) {
			case 'All':
				partList.push("Head");
				partList.push("Chest");
				partList.push("Right Arm");
				partList.push("Left Arm");
				partList.push("Right Leg");
				partList.push("Left Leg");
				break;
		}

		partList.forEach(partName => {
			if (this.hasBodyPart(partName)) {
				var part = this.findBodypart(partName);
				part.setFlesh();
			}
		});
	}


	hasBodyPart(bodyPart) {
		for (const [key, value] of Object.entries(this.hitbox.high)) {
			if (value.getName() == bodyPart) {
				return true;
			}
		}
		for (const [key, value] of Object.entries(this.hitbox.middle)) {
			if (value.getName() == bodyPart) {
				return true;
			}
		}
		for (const [key, value] of Object.entries(this.hitbox.low)) {
			if (value.getName() == bodyPart) {
				return true;
			}
		}
		return false;
	}

	findBodypart(bodyPart) {
		for (const [key, value] of Object.entries(this.hitbox.high)) {
			if (value.getName() == bodyPart) {
				return value;
			}
		}
		for (const [key, value] of Object.entries(this.hitbox.middle)) {
			if (value.getName() == bodyPart) {
				return value;
			}
		}
		for (const [key, value] of Object.entries(this.hitbox.low)) {
			if (value.getName() == bodyPart) {
				return value;
			}
		}
		return undefined;
	}
}

/**
 * The actual body parts building the body
 */
class BodyPart {

	constructor(type, side) {
		this.name = type;
		if (side != undefined) {
			this.side = side;
		} else {
			this.side = "Middle";
		}
		this.bone = false;
		this.flesh = false;
	}

	getName() {
		var text = "";
		if (this.side != "Middle") {
			text += this.side + " ";
		}
		text += this.name;
		return text;
	}

	toString() {
		var text = "";
		if (this.side != "Middle") {
			text += this.side + " ";
		}
		text += this.name;
		if (this.bone) {
			text += " (Bones";
			if (this.flesh) {
				text += ", Flesh";
			}
			text += ")";
		} else if (this.flesh) {
			text += " (Flesh)";
		}
		return text;
	}

	setBone() {
		this.bone = true;
	}

	setFlesh() {
		this.flesh = true;
	}
}


module.exports = Body;