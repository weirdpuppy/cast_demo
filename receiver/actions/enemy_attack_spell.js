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
goog.provide('cast.games.spellcast.actions.EnemyAttackSpell');

goog.require('cast.games.spellcast.Action');
goog.require('cast.games.spellcast.GameConstants');
goog.require('cast.games.spellcast.messages.SpellElement');



/**
 * Attack spell cast by an enemy.  Constructor has no parameters to make this
 * easy to allocate from a pool.
 * @constructor
 * @implements {cast.games.spellcast.Action}
 */
cast.games.spellcast.actions.EnemyAttackSpell = function() {
  /** @private {cast.games.spellcast.SpellcastGame} */
  this.game_ = null;

  /** @private {cast.receiver.games.GameManager} */
  this.gameManager_ = null;

  /** @private {cast.games.spellcast.gameobjects.Enemy} */
  this.caster_ = null;

  /** @private {cast.games.spellcast.gameobjects.Player} */
  this.target_ = null;

  /** @private {cast.games.spellcast.messages.SpellElement} */
  this.attackElement_ = cast.games.spellcast.messages.SpellElement.NONE;

  /** @private {cast.games.spellcast.gameobjects.AttackSpell} */
  this.attackSpell_ = null;

  /** @private {number} */
  this.strength_ = 0;

  /** @private {!PIXI.Point} Used to position enemy attack explosions. */
  this.targetPosition_ = new PIXI.Point(0, 0);

  /** @private {cast.games.spellcast.gameobjects.Explosion} */
  this.explosion_ = null;
};


/**
 * Initializes this enemy attack spell
 * @param {!cast.games.spellcast.SpellcastGame} game
 * @param {!cast.games.spellcast.gameobjects.Enemy} caster
 * @param {!cast.games.spellcast.gameobjects.Player} target
 * @param {cast.games.spellcast.messages.SpellElement} element
 * @param {number} strength One of the constants defined in
 *     {@link cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH}
 */
cast.games.spellcast.actions.EnemyAttackSpell.prototype.init =
    function(game, caster, target, element, strength) {
  this.game_ = game;
  this.gameManager_ = this.game_.getGameManager();
  this.caster_ = caster;
  this.target_ = target;
  this.strength_ = strength;
  this.attackElement_ = element;
  this.attackAnimation_ = this.caster_.getAttackAnimation(this.attackElement_);
  this.attackSpell_ = this.game_.setCurrentAttackSpellElement(
      this.attackElement_);
};


/** @override */
cast.games.spellcast.actions.EnemyAttackSpell.prototype.onStart = function() {
  // Animate the caster using the attack animation and play attack sound.
  this.caster_.activate(this.attackAnimation_);
};


/** @override */
cast.games.spellcast.actions.EnemyAttackSpell.prototype.onFinish = function() {
  this.explosion_ = null;
  this.attackSpell_.deactivate();

  var damage = this.strength_;
  var numberConnectedPlayers = this.gameManager_.getConnectedPlayers().length;

  // Apply bonus damage based on the number of players in the party.
  damage += cast.games.spellcast.GameConstants.ENEMY_STRENGTH_BONUS_MAP[
      numberConnectedPlayers];

  // Reduce damage if the party has shields.
  damage -= this.game_.getPartyShieldValue();

  if (damage < 0) {
    damage = 0;
  }

  this.game_.updatePartyHealth(-damage);
};


/** @override */
cast.games.spellcast.actions.EnemyAttackSpell.prototype.onUpdate =
    function(timeElapsed) {
  if (!this.attackAnimation_.active && !this.attackSpell_.active &&
      !this.explosion_) {
    this.startAttackSpell_(timeElapsed);
  }
};


/** @override */
cast.games.spellcast.actions.EnemyAttackSpell.prototype.getExecutionTime =
    function() {
  return 6000;
};


/** @override */
cast.games.spellcast.actions.EnemyAttackSpell.prototype.
    getShouldFinishOnNextUpdate = function() {
  return false;
};


/**
 * Start moving attack spell across the screen.
 * @param {number} timeElapsed
 * @private
 */
cast.games.spellcast.actions.EnemyAttackSpell.prototype.startAttackSpell_ =
    function(timeElapsed) {
  this.game_.getAudioManager().playAttackSound();

  this.targetPosition_.x = this.target_.posX;
  this.targetPosition_.y = this.target_.posY;
  this.explosion_ = this.game_.setCurrentExplosionSpellElement(
      this.attackElement_);
  this.attackSpell_.activate(
      this.caster_.getAttackPosition(),
      this.targetPosition_,
      this.getExecutionTime() - timeElapsed -
          cast.games.spellcast.GameConstants.EXPLOSION_FX_DURATION,
      this.explosion_);

  switch (this.strength_) {
    case cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH.WEAK:
      this.attackSpell_.sprite.scale.x = 0.5;
      this.attackSpell_.sprite.scale.y = 0.5;
      break;
    case cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH.MEDIUM:
      this.attackSpell_.sprite.scale.x = 0.8;
      this.attackSpell_.sprite.scale.y = 0.8;
      break;
    case cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH.STRONG:
      this.attackSpell_.sprite.scale.x = 1.25;
      this.attackSpell_.sprite.scale.y = 1.25;
      break;
  }
};
