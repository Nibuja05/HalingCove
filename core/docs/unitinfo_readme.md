
# Unitinfo

stores information about every unit type and player class in the game.

## Player 

```json
"Unexperienced Adventurer" : {
	"BaseHP" : "50",
	"BaseMana" : "0",
	"Class" : "None",
	"Skills" : {
		"Active" : {
		},
		"Passive" : {		
		}
	}
}
```

- Class: specifies the main class, like Warrior, Assasin, etc
- Skills: Define a set of active and passive skills and their base strength (mastery)

## Creep

```json
"Rat" : {
	"BaseHP" : "10",
	"BaseMana" : "0",
	"PhysAttack" : "1",
	"MagicAttack" : "0",
	"PureAttack" : "0",
	"GrowSpeed" : "1",
	"MovePattern" : "Fighter",
	"AttackPattern" : [
		"Middle",
		"Low"
	],
	"DefendPattern" : [
	],
	"Skills" : {
		"Active" : {
		},
		"Passive" : {		
		}
	}
},
```

- PhysAttack/MagicAttack/PureAttack: Power which this unit attacks with
- GrowSpeed: Multiplier for attack values per level
- MovePattern: Defines the AI / what actions this creep is taking in his turn
- AttaclPAttern/DefendPattern: Defines which moves this unit can do
- Skills: Define a set of active and passive skills and their base strength (mastery)