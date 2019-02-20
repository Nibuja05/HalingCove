# Action Info

Actions are tasks that can be performed by a skill or within a modifier event,
they all are very differnt and work as described below:

## ApplyModifier

Adds a modifier to an unit

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

## DealDamage

Deals damage to another unit

- Target: which unit receives the modifier:
  - Self: applies the modifier to the caster
  - Team: applies the modifier to the whole team of the caster
  - Enemy: applies the modifier to a single enemy unit
  - EnemyGroup: applies the modifier to a group of enemies. Note: additional parameter 'Count avaliable'
- MagicDamage[Perc]: the amount of magic damage that is applied [OPTIONAL]
- PhysDamage[Perc]: the amount of physical damage that is applied [OPTIONAL]
- PureDamage[Perc]: the amount of pure damage that is applied [OPTIONAL]

## Random

Special action, that can have multiple actions inside, these actions perform only with a certain chance

- Chance: the chance that the actions will perform
- Actions: A list of actions
- ActionMessage: a message to be displayed (delayed add) when the chance was succesfull

## BlockDamage

Blocks a certain amount of damage for the next times this unit receives damage

- Count: the amount of times damage can be blocked with this
- PhysBlock[Perc]: how much physical damage is blocked in the next reduction step (before armor, etc) [OPTIONAL]
- MagicBlock[Perc]: how much magical damage is blocked in the next reduction step (before armor, etc) [OPTIONAL]
- PureBlock[Perc]: how much pure damage is blocked in the next reduction step (before armor, etc) [OPTIONAL]

if PhysBlock, MagicBlock or PureBlock is not defined, the block will not 'consume' a count if no damage is blocked

## Heal

Heals a unit for a certain amount 

- Target: which unit receives the modifier:
  - Self: applies the modifier to the caster
  - Team: applies the modifier to the whole team of the caster
  - Enemy: applies the modifier to a single enemy unit
  - EnemyGroup: applies the modifier to a group of enemies. Note: additional parameter 'Count avaliable'
- Amount[Perc]: how much the unit will be healed

## Move

Moves a unit closer or farther away from the center of fight

- Target: which unit receives the modifier:
  - Self: applies the modifier to the caster
  - Team: applies the modifier to the whole team of the caster
  - Enemy: applies the modifier to a single enemy unit
  - EnemyGroup: applies the modifier to a group of enemies. Note: additional parameter 'Count avaliable'
- Direction: Closer/Away
- Distance: how far the units get moved

## Attack

Attacks another unit, can be out of normal attack turn-order

- Target: which unit receives the modifier:
  - Self: applies the modifier to the caster
  - Team: applies the modifier to the whole team of the caster
  - Enemy: applies the modifier to a single enemy unit
  - EnemyGroup: applies the modifier to a group of enemies. Note: additional parameter 'Count avaliable'
- MagicDamage[Perc]: the amount of magic damage that is added  to this attack [OPTIONAL]
- PhysDamage[Perc]: the amount of physical damage that is added  to this attack [OPTIONAL]
- PureDamage[Perc]: the amount of pure damage that is added  to this attack [OPTIONAL]