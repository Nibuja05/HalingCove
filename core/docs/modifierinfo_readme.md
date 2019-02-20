#Modifier Info

Modifiers are buffs/debuffs that are applied to a unit and stay there until the unit dies, the duration
runs out or are removed forcefully with with help of other skills.
They feature four main lists: Events, Bonuses, Properties and States (they all are optional)



##Properties

Properties are all optional and can specify a modifier furthermore, they're also just atomar, so theyy don't need a value

### Multiple

allows the modifier to be active multiple times on a unit at the same time

### ReflectDamage

all damage donw by actions from this modifier cannot be reflected

### IgnoreDeath

this modifier is not removed when its parent unit dies and stays until the battle is over


## Bonuses

Bonuses are direct value changed that affect the parent unit, it can modify nearly all numbers of an unit

### Example

```json
"Bonuses" : [
	{
		"BodyPhysArmor" : "%val",
		"HeadPhysArmor" : "%val",
		"LegPhysArmor" : "%val"
	}
],
```

Each attribute that can be affected has its percentage counterpart by simpley adding `Perc` at the end, so `BodyPhysArmor` -> `BodyPhysArmorPerc`.
All values can perform arithmetic operations and use the relative phrase %val, shich represents the strength of the modifier

### List of Attributes

- BodyPhysArmor
- HeadPhysArmor
- LegPhysArmor
- BodyMagicArmor
- HeadMagicArmor
- LegMagicArmor
- PhysAttack
- MagicAttack
- PureAttack
- PhysBlock
- MagicBlock
- PureBlock
- MaxHealth
- MaxMana
- HealthRegen
- ManaRegen
- InDamageAmplify (always percentage based, no -Perc)
- OutDamageAmplify (always percentage based, no -Perc)
- Range
- Evasion
- HealAmplify (Regen excluded)



## States

States determine a specific state the parent of this modifier has:

### Stunned

- this unit cannot perform any action

### Silenced

- this unit cannot use any skills

### Disarmed

- this unit cannot attack or defend

### Breaked

- this unit has all passive skills disabled for the duration




## Events

Events are the most powerful tool of modifiers, that allows them to activate actions (see actions_readme.md) at nearly any time
Also every Event actions can have a seperate attribute `EventMessage` which is displayed in the battle log (delayed add) whenever an event is fired.
Event messages support a variety of relative phrases:

- %parent: the unit this modifier is attached to
- %val: strength of this modifier
- %target: the target of this event, only on events with targets
- ... various other event-specific

and also equations inside of curly brackets, e.g. `{%val * 20}`

### OnTurnStart

- start of this units turn 

### OnTakeDamage

- called when a unit is about to take damage, after all reductions
- event specific attribute: `DamageType`: event only called if damage contains this type, values are:
- Phys, Magic, Pure: they can be combined with a `+` to `Phys + Magic` 

### OnTakeDamageBeforeReductions

- called when a unit is about to take damage, before all reductions
- `DamageType` event, like in OntakeDamage

### OnTakeDamageFinal

- called after units took damage
- `DamageType` event, like in OntakeDamage

### OnAttackLanded

-  called when this units successfully attacked another unit (no skills counted)

### OnAttackStart

- called when this unit is about to attack another unit





