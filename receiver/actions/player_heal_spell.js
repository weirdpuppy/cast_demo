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
goog.provide('cast.games.spellcast.actions.PlayerHealSpell');

goog.require('cast.games.spellcast.Action');
goog.require('cast.games.spellcast.GameConstants');
goog.require('cast.games.spellcast.messages.PlayerBonus');
goog.require('cast.games.spellcast.messages.SpellAccuracy');



/**
 * Attack spell cast by players. Constructor has no parameters to make this easy
 * to allocate from a pool.
 * @constructor
 * @implements {cast.games.spellcast.Action}
 */
cast.games.spellcast.actions.PlayerHealSpell = function() {
  /** @private {cast.games.spellcast.SpellcastGame} */
  this.game_ = null;

  /** @private {cast.games.spellcast.gameobjects.Player} */
  this.caster_ = null;

  /** @private {cast.games.spellcast.messages.SpellAccuracy} */
  this.accuracy_ = cast.games.spellcast.messages.SpellAccuracy.GOOD;

  /** @private {!cast.games.spellcast.messages.PlayerBonus} */
  this.casterBonus_ = cast.games.spellcast.messages.PlayerBonus.NONE;

  /** @private {boolean} */
  this.healUpdated_ = false;
};


/**
 * Initializes the heal spell.
 * @param {!cast.games.spellcast.SpellcastGame} game
 * @param {!cast.games.spellcast.gameobjects.Player} caster
 * @param {!cast.games.spellcast.messages.SpellAccuracy} accuracy
 */
cast.games.spellcast.actions.PlayerHealSpell.prototype.init =
    function(game, caster, accuracy) {
  this.game_ = game;
  this.caster_ = caster;
  this.accuracy_ = accuracy;
};


/** @override */
cast.games.spellcast.actions.PlayerHealSpell.prototype.onStart = function() {
  if (!this.caster_.playerId) {
    throw Error('Missing caster player ID');
  }
  this.casterBonus_ = this.game_.getPlayerBonus(this.caster_.playerId);
  this.caster_.moveForward();

  this.game_.getAudioManager().playHeal();
};


/** @override */
cast.games.spellcast.actions.PlayerHealSpell.prototype.onUpdate =
    function(timeElapsed) {
  if (timeElapsed > cast.games.spellcast.GameConstants.HEAL_FX_DURATION &&
      !this.healUpdated_) {
    this.game_.enableHeal(cast.games.spellcast.GameConstants.
        PLAYER_HEAL_SPRITE_SCALE_MAP[this.accuracy_]);
    this.healUpdated_ = true;
  }
};


/** @override */
cast.games.spellcast.actions.PlayerHealSpell.prototype.onFinish = function() {
  this.caster_.moveBackward();
  this.game_.disableHeal();

  var healthValue = cast.games.spellcast.GameConstants.
      PLAYER_HEAL_SPELL_VALUE_MAP[this.accuracy_];

  if (this.casterBonus_ == cast.games.spellcast.messages.PlayerBonus.HEAL) {
    healthValue += cast.games.spellcast.GameConstants.PLAYER_HEAL_BONUS;
  }

  this.game_.updatePartyHealth(healthValue);
};


/** @override */
cast.games.spellcast.actions.PlayerHealSpell.prototype.getExecutionTime =
    function() {
  return 2000;
};


/** @override */
cast.games.spellcast.actions.PlayerHealSpell.prototype.
    getShouldFinishOnNextUpdate = function() {
  return false;
};
