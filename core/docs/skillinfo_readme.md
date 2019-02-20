
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

contains a list of actions that are executed one after the other,
for more information look in actions_readme.md




## Passive Skills

```json
"Flabby" : {
	"Name" : "modifier_flabby",
	"Strength" : "%level",
}
```

- Name: name of the modifier
- Strength: strength of the modifier