

Attack Modifiers:
BoneCrush: Crushes the bone and disables this body part for the entire fight (Heavy Wound)
 -> Crush on Head: Instakill (revivable)
PhysPierce: Ignores a part of the physical armor of the target
CutOff: Chance to cut of a body part, disables this body
 -> Cut off Head: Instakill (unrevivable)
 MultiTarget: Hits other enemies for a portion of the main targets damage
 -> cannot inflict BoneCrush, Pierce or Cutoff
Weight: Lighter weight means more mobility to move or dogde attacks

 Defend Modifier:
Padding: absorbs the impact of blows to reduce the chance of bone crushes 
Sturdy: reduces the chance that body parts can be cut off
Thick: reduces the Pierce damage
Weight: Lighter weight means more mobility to move or dogde attacks



{"PhysArmor":"1","Padding":"0.3","Weight":"15"}

{"PhysAttack":"1.2","BoneCrush": "0.3","Weight":"2"}

{"PhysArmor":"1.5","Sturdy":"0.3","Thick":"0.5","Weight":"25"}

{"MagicAttack":"1","Range":"20","Weight":"0.5"}

{"PhysBlock": "0.7","PhysAttack": "1.5","PhysPierce": "0.3","Weight":"1"}

{"PhysArmor":"0.5","Padding":"0.5","weight":"3"}

UPDATE `itemType` SET `statMultiplier` = '' WHERE `typeID` = 5