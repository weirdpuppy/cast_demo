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
goog.provide('cast.games.spellcast.actions.PlayerShieldSpell');

goog.require('cast.games.spellcast.Action');
goog.require('cast.games.spellcast.GameConstants');
goog.require('cast.games.spellcast.messages.PlayerBonus');
goog.require('cast.games.spellcast.messages.SpellAccuracy');



/**
 * A spell that enables the shield for the player's party. Constructor has no
 * parameters to make this easy to allocate from a pool.
 * @constructor
 * @implements {cast.games.spellcast.Action}
 */
cast.games.spellcast.actions.PlayerShieldSpell = function() {
  /** @private {cast.games.spellcast.SpellcastGame} */
  this.game_ = null;

  /** @private {cast.games.spellcast.gameobjects.Player} */
  this.caster_ = null;

  /** @private {boolean} True if we moved the caster forward. */
  this.casterMoved_ = false;

  /** @private {!cast.games.spellcast.messages.PlayerBonus} */
  this.casterBonus_ = cast.games.spellcast.messages.PlayerBonus.NONE;

  /**
   * Set to true when we actually update the party shield after a short delay.
   * @private {boolean}
  */
  this.partyShieldUpdated_ = false;

  /**
   * The new value of the party shields after this spell is cast.
   * @private {number}
  */
  this.partyShieldNewValue_ = 0;

  /** @private {cast.games.spellcast.messages.SpellAccuracy} */
  this.accuracy_ = cast.games.spellcast.messages.SpellAccuracy.GOOD;
};


/**
 * Initializes the shield spell.
 * @param {!cast.games.spellcast.SpellcastGame} game
 * @param {!cast.games.spellcast.gameobjects.Player} caster
 * @param {!cast.games.spellcast.messages.SpellAccuracy} accuracy
 */
cast.games.spellcast.actions.PlayerShieldSpell.prototype.init =
    function(game, caster, accuracy) {
  this.game_ = game;
  this.caster_ = caster;
  this.accuracy_ = accuracy;
};


/** @override */
cast.games.spellcast.actions.PlayerShieldSpell.prototype.onStart = function() {
  if (!this.caster_.playerId) {
    throw Error('No caster player ID');
  }
  this.casterBonus_ = this.game_.getPlayerBonus(this.caster_.playerId);

  switch (this.game_.getNumberOfShieldSpellsCastThisRound()) {
    // This is the first shield spell. Activate shields and set the proper
    // effects.
    case 0:
      this.casterMoved_ = true;
      this.caster_.moveForward();

      var shieldValue = cast.games.spellcast.GameConstants
          .PLAYER_SHIELD_SPELL_VALUE_MAP[this.accuracy_];

      if (this.casterBonus_ ==
          cast.games.spellcast.messages.PlayerBonus.SHIELD) {
        shieldValue += cast.games.spellcast.GameConstants.PLAYER_SHIELD_BONUS;
      }

      this.partyShieldNewValue_ = shieldValue;
      this.game_.getAudioManager().playShield();
      break;
    // This is the second spell. This will disrupt the previous shield.
    case 1:
      this.casterMoved_ = true;
      this.caster_.moveForward();
      this.partyShieldNewValue_ = 0;
      this.game_.getAudioManager().playShieldDisrupt();
      break;
    // Do nothing for repeated shields after the second one.
    default:
      this.game_.disablePartyShield();
      this.executionTime = 100;
      break;
  }

  this.game_.addNumberOfShieldSpellsCastThisRound();
};


/** @override */
cast.games.spellcast.actions.PlayerShieldSpell.prototype.onUpdate =
    function(elapsedTime) {
  if (elapsedTime > cast.games.spellcast.GameConstants.SHIELD_FX_DURATION &&
      !this.partyShieldUpdated_) {

    // Apply a tint if the caster has a shield bonus.
    var tint = cast.games.spellcast.GameConstants.SHIELD_NORMAL_TINT;
    if (this.casterBonus_ == cast.games.spellcast.messages.PlayerBonus.SHIELD) {
      tint = cast.games.spellcast.GameConstants.SHIELD_BONUS_TINT;
    }

    var alpha = cast.games.spellcast.GameConstants.
        PLAYER_CASTING_SPRITE_ALPHA_MAP[this.accuracy_];

    if (this.partyShieldNewValue_ > 0) {
      this.game_.enablePartyShield(this.partyShieldNewValue_, alpha, tint);
    } else {
      this.game_.disablePartyShield();
    }
    this.partyShieldUpdated_ = true;
  }
};


/** @override */
cast.games.spellcast.actions.PlayerShieldSpell.prototype.onFinish = function() {
  if (this.casterMoved_) {
    this.caster_.moveBackward();
  }
  // Note that the shield will be disabled when PlayerActionPhase begins.
};


/** @override */
cast.games.spellcast.actions.PlayerShieldSpell.prototype.getExecutionTime =
    function() {
  return 2000;
};


/** @override */
cast.games.spellcast.actions.PlayerShieldSpell.prototype.
    getShouldFinishOnNextUpdate = function() {
  return false;
};
