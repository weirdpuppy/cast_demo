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
/** @fileoverview JSON serializable custom messages used by spellcast. */

goog.provide('cast.games.spellcast.messages.DifficultySetting');
goog.provide('cast.games.spellcast.messages.GameData');
goog.provide('cast.games.spellcast.messages.GameStateId');
goog.provide('cast.games.spellcast.messages.PlayerBonus');
goog.provide('cast.games.spellcast.messages.PlayerMessage');
goog.provide('cast.games.spellcast.messages.PlayerPlayingData');
goog.provide('cast.games.spellcast.messages.PlayerReadyData');
goog.provide('cast.games.spellcast.messages.Spell');
goog.provide('cast.games.spellcast.messages.SpellAccuracy');
goog.provide('cast.games.spellcast.messages.SpellElement');
goog.provide('cast.games.spellcast.messages.SpellMessage');
goog.provide('cast.games.spellcast.messages.SpellType');


/**
 * @enum {number} Game difficulty settings.
 * @export
 */
cast.games.spellcast.messages.DifficultySetting = {
  UNKNOWN: 0,
  EASY: 1,
  NORMAL: 2,
  HARD: 3
};


/**
 * @enum {number} Player bonus.
 * @export
 */
cast.games.spellcast.messages.PlayerBonus = {
  UNKNOWN: 0,
  NONE: 1,
  ATTACK: 2,
  HEAL: 3,
  SHIELD: 4
};


/**
 * @enum {number} Type of spell cast.
 * @export
 */
cast.games.spellcast.messages.SpellType = {
  UNKNOWN: 0,
  BASIC_ATTACK: 1,
  HEAL: 2,
  SHIELD: 3
};


/**
 * @enum {number} Element used in spell.
 * @export
 */
cast.games.spellcast.messages.SpellElement = {
  UNKNOWN: 0,
  NONE: 1,
  AIR: 2,
  WATER: 3,
  FIRE: 4,
  EARTH: 5
};


/**
 * @enum {number} Spell accuracy.
 * @export
 */
cast.games.spellcast.messages.SpellAccuracy = {
  UNKNOWN: 0,
  PERFECT: 1,
  GREAT: 2,
  GOOD: 3
};


/**
 * @enum {number} The different spellcast game state identifiers.
 * @export
 */
cast.games.spellcast.messages.GameStateId = {
  UNKNOWN: 0,
  WAITING_FOR_PLAYERS: 1,
  INSTRUCTIONS: 2,
  PLAYER_ACTION: 3,
  PLAYER_RESOLUTION: 4,
  ENEMY_RESOLUTION: 5,
  PLAYER_VICTORY: 6,
  ENEMY_VICTORY: 7,
  PAUSED: 8
};



/**
 * JSON serializable game data that persists while the game is running. All
 * responses will include properties are exported to preserve their names during
 * compilation.
 * @struct
 * @constructor
 * @export
 */
cast.games.spellcast.messages.GameData = function() {
  /**
   * @type {cast.games.spellcast.messages.GameStateId}
   */
  this.gameStateId = cast.games.spellcast.messages.GameStateId.UNKNOWN;
};



/**
 * JSON serializable extra message data added to a PLAYER_READY message from the
 * sender. The game will persist this as player data with a player stored in the
 * game manager. Properties are exported to preserve their names during
 * compilation.
 * @struct
 * @constructor
 * @export
 */
cast.games.spellcast.messages.PlayerReadyData = function() {
  /**
   * @type {string}
   */
  this.playerName = '';

  /**
   * @type {number}
   */
  this.avatarIndex = 0;
};



/**
 * JSON serializable extra message data added to a PLAYER_PLAYING message from
 * the sender. Properties are exported to preserve their names during
 * compilation.
 * @struct
 * @constructor
 * @export
 */
cast.games.spellcast.messages.PlayerPlayingData = function() {
  /**
   * @type {cast.games.spellcast.messages.DifficultySetting}
   */
  this.difficultySetting =
      cast.games.spellcast.messages.DifficultySetting.EASY;
};



/**
 * JSON serializable message sent to players. Properties are exported to
 * preserve their names during compilation.
 * @struct
 * @constructor
 * @export
 */
cast.games.spellcast.messages.PlayerMessage = function() {
  /**
   * @type {cast.games.spellcast.messages.PlayerBonus}
   */
  this.playerBonus = cast.games.spellcast.messages.PlayerBonus.NONE;

  /**
   * @type {number}
   */
  this.castSpellsDurationMillis = 0;
};



/**
 * Describes one spell cast by a player. Used in #SpellMessage. Properties are
 * exported to preserve their names during compilation.
 * @struct
 * @constructor
 * @export
 */
cast.games.spellcast.messages.Spell = function() {
  /**
   * @type {cast.games.spellcast.messages.SpellType}
   */
  this.spellType = cast.games.spellcast.messages.SpellType.UNKNOWN;

  /**
   * @type {cast.games.spellcast.messages.SpellElement}
   */
  this.spellElement = cast.games.spellcast.messages.SpellElement.NONE;

  /**
   * @type {cast.games.spellcast.messages.SpellAccuracy}
   */
  this.spellAccuracy = cast.games.spellcast.messages.SpellAccuracy.GOOD;
};



/**
 * JSON serializable message from the sender specifying spells cast by the
 * player. Properties are exported to preserve their names during compilation.
 * @struct
 * @constructor
 * @export
 */
cast.games.spellcast.messages.SpellMessage = function() {
  /**
   * @type {!Array.<!cast.games.spellcast.messages.Spell>}
   */
  this.spells = [];
};
