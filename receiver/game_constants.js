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
goog.provide('cast.games.spellcast.GameConstants');


goog.require('cast.games.spellcast.messages.DifficultySetting');
goog.require('cast.games.spellcast.messages.PlayerBonus');
goog.require('cast.games.spellcast.messages.SpellAccuracy');
goog.require('cast.games.spellcast.messages.SpellElement');



/**
 * Static class to hold constants for game tuning and balance.
 * @constructor
 */
cast.games.spellcast.GameConstants = function() {};


/**
 * Maximum number of players supported. Assumes game can support this many
 * player assets.
 * @const {number}
 */
cast.games.spellcast.GameConstants.MAX_PLAYERS = 4;


/**
 * Number of ms to show full screen displays when the players win or lose.
 * @const {number}
 */
cast.games.spellcast.GameConstants.ENDGAME_DISPLAY_DELAY = 5000;


/**
 * Number of ms to show full screen display showing the instructions.
 * @const {number}
 */
cast.games.spellcast.GameConstants.INSTRUCTIONS_DELAY = 10000;


/**
 * Number of ms to play sound fx to warn players that time is running out.
 * This should be before the actual time limit of player action phase.
 * @const {number}
 */
cast.games.spellcast.GameConstants.TIME_RUNNING_OUT_DELAY = 12000;


/**
 * Duration of enemy or party death animation effect in msec.
 * @const {number}
 */
cast.games.spellcast.GameConstants.DEATH_FX_DURATION = 2500;


/**
 * Duration of explosion animation in msec.
 * @const {number}
 */
cast.games.spellcast.GameConstants.EXPLOSION_FX_DURATION = 750;


/**
 * Duration of heal effect in msec.
 * @const {number}
 */
cast.games.spellcast.GameConstants.HEAL_FX_DURATION = 500;


/**
 * Duration of shield effect in msec.
 * @const {number}
 */
cast.games.spellcast.GameConstants.SHIELD_FX_DURATION = 500;


/**
 * @const {number} Tint for a normal shield spell effect.
 */
cast.games.spellcast.GameConstants.SHIELD_NORMAL_TINT = 0xF56F08;


/**
 * @const {number} Tint for a shield spell effect with a shield bonus.
 */
cast.games.spellcast.GameConstants.SHIELD_BONUS_TINT = 0xAA3333;


/**
 * Constants used for player action phase duration (in milliseconds) based on
 * the game difficulty.
 * @const {!Object.<!cast.games.spellcast.messages.DifficultySetting, number>}
 */
cast.games.spellcast.GameConstants.DIFFICULTY_ACTION_PHASE_DURATION_MAP =
    Object.create(null);

cast.games.spellcast.GameConstants.DIFFICULTY_ACTION_PHASE_DURATION_MAP[
    cast.games.spellcast.messages.DifficultySetting.EASY] = 15000;
cast.games.spellcast.GameConstants.DIFFICULTY_ACTION_PHASE_DURATION_MAP[
    cast.games.spellcast.messages.DifficultySetting.NORMAL] = 12000;
cast.games.spellcast.GameConstants.DIFFICULTY_ACTION_PHASE_DURATION_MAP[
    cast.games.spellcast.messages.DifficultySetting.HARD] = 9000;


/**
 * Constants used to calculate player attack spell damage based on the accuracy
 * of the drawing.
 * @const {!Object.<!cast.games.spellcast.messages.SpellAccuracy, number>}
 */
cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPELL_DAMAGE_MAP =
    Object.create(null);

cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPELL_DAMAGE_MAP[
    cast.games.spellcast.messages.SpellAccuracy.GOOD] = 1;
cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPELL_DAMAGE_MAP[
    cast.games.spellcast.messages.SpellAccuracy.GREAT] = 2;
cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPELL_DAMAGE_MAP[
    cast.games.spellcast.messages.SpellAccuracy.PERFECT] = 3;


/**
 * Constants used to calculate player heal spell value based on the accuracy
 * of the drawing.
 * @const {!Object.<!cast.games.spellcast.messages.SpellAccuracy, number>}
 */
cast.games.spellcast.GameConstants.PLAYER_HEAL_SPELL_VALUE_MAP =
    Object.create(null);

cast.games.spellcast.GameConstants.PLAYER_HEAL_SPELL_VALUE_MAP[
    cast.games.spellcast.messages.SpellAccuracy.GOOD] = 1;
cast.games.spellcast.GameConstants.PLAYER_HEAL_SPELL_VALUE_MAP[
    cast.games.spellcast.messages.SpellAccuracy.GREAT] = 2;
cast.games.spellcast.GameConstants.PLAYER_HEAL_SPELL_VALUE_MAP[
    cast.games.spellcast.messages.SpellAccuracy.PERFECT] = 3;


/**
 * Constants used to calculate player shield damage reductions based on the
 * accuracy of the drawing.
 * @const {!Object.<!cast.games.spellcast.messages.SpellAccuracy, number>}
 */
cast.games.spellcast.GameConstants.PLAYER_SHIELD_SPELL_VALUE_MAP =
    Object.create(null);

cast.games.spellcast.GameConstants.PLAYER_SHIELD_SPELL_VALUE_MAP[
    cast.games.spellcast.messages.SpellAccuracy.GOOD] = 2;
cast.games.spellcast.GameConstants.PLAYER_SHIELD_SPELL_VALUE_MAP[
    cast.games.spellcast.messages.SpellAccuracy.GREAT] = 3;
cast.games.spellcast.GameConstants.PLAYER_SHIELD_SPELL_VALUE_MAP[
    cast.games.spellcast.messages.SpellAccuracy.PERFECT] = 4;


/**
 * Constants used for the players party initial health based on the number of
 * players in the game. Index is the number of players, values is party health.
 * @const {!Array.<number>}
 */
cast.games.spellcast.GameConstants.PARTY_INITIAL_HEALTH_MAP =
    [0, 10, 20, 30, 40];


/**
 * Constants used for the enemy initial health based on the number of players in
 * the party. Index is the number of players, values is enemy health.
 * @const {!Array.<number>}
 */
cast.games.spellcast.GameConstants.ENEMY_INITIAL_HEALTH_MAP =
    [0, 20, 40, 60, 80];


/**
 * Constants used to scale player heal sprites based on spell accuracy.
 * @const {!Object.<!cast.games.spellcast.messages.SpellAccuracy, number>}
 */
cast.games.spellcast.GameConstants.PLAYER_HEAL_SPRITE_SCALE_MAP =
    Object.create(null);

cast.games.spellcast.GameConstants.PLAYER_HEAL_SPRITE_SCALE_MAP[
    cast.games.spellcast.messages.SpellAccuracy.GOOD] = 1.0;
cast.games.spellcast.GameConstants.PLAYER_HEAL_SPRITE_SCALE_MAP[
    cast.games.spellcast.messages.SpellAccuracy.GREAT] = 1.2;
cast.games.spellcast.GameConstants.PLAYER_HEAL_SPRITE_SCALE_MAP[
    cast.games.spellcast.messages.SpellAccuracy.PERFECT] = 1.5;


/**
 * Constants used to adjust scale of player attack sprites based on spell
 * accuracy.
 * @const {!Object.<!cast.games.spellcast.messages.SpellAccuracy, number>}
 */
cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPRITE_SCALE_MAP =
    Object.create(null);

cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPRITE_SCALE_MAP[
    cast.games.spellcast.messages.SpellAccuracy.GOOD] = 0.5;
cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPRITE_SCALE_MAP[
    cast.games.spellcast.messages.SpellAccuracy.GREAT] = 0.8,
cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPRITE_SCALE_MAP[
    cast.games.spellcast.messages.SpellAccuracy.PERFECT] = 1.25;


/**
 * Constants used to adjust player casting sprite alphas based on spell
 * accuracy.
 * @const {!Object.<!cast.games.spellcast.messages.SpellAccuracy, number>}
 */
cast.games.spellcast.GameConstants.PLAYER_CASTING_SPRITE_ALPHA_MAP =
    Object.create(null);

cast.games.spellcast.GameConstants.PLAYER_CASTING_SPRITE_ALPHA_MAP[
    cast.games.spellcast.messages.SpellAccuracy.GOOD] = 0.3;
cast.games.spellcast.GameConstants.PLAYER_CASTING_SPRITE_ALPHA_MAP[
    cast.games.spellcast.messages.SpellAccuracy.GREAT] = 0.6;
cast.games.spellcast.GameConstants.PLAYER_CASTING_SPRITE_ALPHA_MAP[
    cast.games.spellcast.messages.SpellAccuracy.PERFECT] = 1.0;


/**
 * List of elements to randomly pick from.
 * @const {!Array.<!cast.games.spellcast.messages.SpellElement>}
 */
cast.games.spellcast.GameConstants.RANDOM_ELEMENTS = [
  cast.games.spellcast.messages.SpellElement.AIR,
  cast.games.spellcast.messages.SpellElement.WATER,
  cast.games.spellcast.messages.SpellElement.FIRE,
  cast.games.spellcast.messages.SpellElement.EARTH
];


/**
 * List of player bonuses to randomly pick from.
 * NONE is repeated so that is happens more often.
 * @const {!Array.<!cast.games.spellcast.messages.PlayerBonus>}
 */
cast.games.spellcast.GameConstants.RANDOM_PLAYER_BONUS = [
  cast.games.spellcast.messages.PlayerBonus.NONE,
  cast.games.spellcast.messages.PlayerBonus.NONE,
  cast.games.spellcast.messages.PlayerBonus.ATTACK,
  cast.games.spellcast.messages.PlayerBonus.SHIELD,
  cast.games.spellcast.messages.PlayerBonus.HEAL

];


/**
 * @const {number} Amount of damage the enemy will heal if the players attack
 *     with the same element the enemy has.
 */
cast.games.spellcast.GameConstants.ENEMY_HEAL_VALUE = 3;


/**
 * @const {number} Player attack bonus value
 */
cast.games.spellcast.GameConstants.PLAYER_ATTACK_BONUS = 1;


/**
 * @const {number} Player heal bonus value.
 */
cast.games.spellcast.GameConstants.PLAYER_HEAL_BONUS = 1;


/**
 * @const {number} Player shield bonus value.
 */
cast.games.spellcast.GameConstants.PLAYER_SHIELD_BONUS = 1;


/**
 * Constants used for enemy attack damage calculation.
 * @enum {number} The damage for the attack.
 */
cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH = {
  WEAK: 4,
  MEDIUM: 5,
  STRONG: 6
};


/**
 * Constants used to calculate enemy attack spell damage based on the number of
 * players in the party. Index is the number of players. Value is spell damage.
 * @const {!Array.<number>}
 */
cast.games.spellcast.GameConstants.ENEMY_STRENGTH_BONUS_MAP = [0, 0, 3, 6, 9];


/**
 * List of enemy attack strengths to pick from.
 * @const {!Array.<!cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH>}
 */
cast.games.spellcast.GameConstants.RANDOM_ENEMY_ATTACK_STRENGTHS = [
  cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH.WEAK,
  cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH.MEDIUM,
  cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH.STRONG
];


/** @type {number} Initial x position of a player. */
cast.games.spellcast.GameConstants.PLAYER_X_POS = 0.1;


/** @type {number} Initial y position of a player. */
cast.games.spellcast.GameConstants.PLAYER_Y_POS = 0.8;


/** @type {number} X position offset of a player casting a spell. */
cast.games.spellcast.GameConstants.PLAYER_SPELL_X_OFFSET = 0.06;


/** @type {string} Waiting for players message when the game starts. */
cast.games.spellcast.GameConstants.WAITING_FOR_PLAYERS_TEXT =
    'SPELLCAST\n\nWaiting for players to join game...\n';


/** @type {string} Message when max players reached when the game starts. */
cast.games.spellcast.GameConstants.MAX_PLAYERS_TEXT =
    'SPELLCAST\n\nMaximum players reached...\n';


/** @type {!Array.<string>} Player countdown messages (desconding order). */
cast.games.spellcast.GameConstants.PLAYER_COUNTDOWN = [
  '3',
  '2',
  '1'
];


/** @type {string} Waiting for player actions message. */
cast.games.spellcast.GameConstants.WAITING_FOR_PLAYER_ACTIONS_TEXT =
    'Waiting for players to draw spells...\n';
