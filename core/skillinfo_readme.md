
# SkillInfo

Contains information how every skill in the game works specifically

## Active Skills

```json
"Fortify" : {
	"ManaCost" : "10",
	"HealthCost" : "0",
	"Turn" : "Attack",
	"Cooldown" : "3",
	"Actions" : [
		{
			"ApplyModifier" : {
				"Target" : "Self",
				"Name" : "modifier_fortify",
				"Strength" : "%level",
				"Duration" : "3"
			}
		}
	]
},
```

- ManaCost/HealthCost: How much mana/health is reduced on usage
- Turn: when this skill can be used, desctiped below
- Cooldown: How this skill cant be used after activation
- Actions: What happens when this skill is used

### Turn

- Attack: used instead of an attack action
- AttackBonus: used when you can attack, but consumes no action
- Defend: used instead of blocking
- DefendBonus: used when you can defend, but consumes no action

### Actions

contains a list of actions that are executed one after the other

#### ApplyModifier

- Target: which unit receives the modifier:
  - Self: applies the modifier to the caster
  - Team: applies the modifier to the whole team of the caster
  - Enemy: applies the modifier to a single enemy unit
  - EnemyGroup: applies the modifier to a group of enemies. Note: additional parameter 'Count avaliable'
- Name: name of the modifier
- Strength: how strong is this modifier. Relative values and arithmetics can be used: (-> refers to %val in the modifier)
  - %level: level of this skill, normally defined in unitinfo.json
  - %count: how many times this skill has been activated
- Duration: how long this modifier lasts