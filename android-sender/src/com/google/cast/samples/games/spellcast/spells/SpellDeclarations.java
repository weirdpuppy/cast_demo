// Copyright 2015 Google Inc. All Rights Reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package com.google.cast.samples.games.spellcast.spells;

import com.google.cast.samples.games.spellcast.R;
import com.google.cast.samples.games.spellcast.messages.SpellCastMessage;

/**
 * Class to hold all the static spells.
 */
public class SpellDeclarations {
    public static Spell sWaterAttackSpell = new Spell(
            R.string.ability_name_attack_water,
            R.drawable.icon_water,
            R.drawable.icon_water,
            SpellCastMessage.SpellElement.WATER,
            SpellCastMessage.SpellType.BASIC_ATTACK,
            "water_1.png",
            "water_1.png",
            4);
    public static Spell sFireAttackSpell = new Spell(
            R.string.ability_name_attack_fire,
            R.drawable.icon_fire,
            R.drawable.icon_fire,
            SpellCastMessage.SpellElement.FIRE,
            SpellCastMessage.SpellType.BASIC_ATTACK,
            "fire_1.png",
            "fire_1.png",
            2);
    public static Spell sAirAttackSpell = new Spell(
            R.string.ability_name_attack_air,
            R.drawable.icon_air,
            R.drawable.icon_air,
            SpellCastMessage.SpellElement.AIR,
            SpellCastMessage.SpellType.BASIC_ATTACK,
            "air_1.png",
            "air_1.png",
            3);
    public static Spell sEarthAttackSpell = new Spell(
            R.string.ability_name_attack_earth,
            R.drawable.icon_earth,
            R.drawable.icon_earth,
            SpellCastMessage.SpellElement.EARTH,
            SpellCastMessage.SpellType.BASIC_ATTACK,
            "earth_1.png",
            "earth_1.png",
            4);
    public static Spell sHealSpell = new Spell(
            R.string.ability_name_heal,
            R.drawable.icon_heal,
            R.drawable.icon_heal,
            SpellCastMessage.SpellElement.NONE,
            SpellCastMessage.SpellType.HEAL,
            "heal_1.png",
            "heal_1.png",
            4);
    public static Spell sShieldSpell = new Spell(
            R.string.ability_name_shield,
            R.drawable.icon_shield,
            R.drawable.icon_shield,
            SpellCastMessage.SpellElement.NONE,
            SpellCastMessage.SpellType.SHIELD,
            "shield_1.png",
            "shield_1.png",
            2);
}
