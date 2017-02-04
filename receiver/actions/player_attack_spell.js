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
goog.provide('cast.games.spellcast.actions.PlayerAttackSpell');

goog.require('cast.games.spellcast.Action');
goog.require('cast.games.spellcast.GameConstants');
goog.require('cast.games.spellcast.messages.PlayerBonus');
goog.require('cast.games.spellcast.messages.SpellAccuracy');
goog.require('cast.games.spellcast.messages.SpellElement');



/**
 * Attack spell cast by players. Constructor has no parameters to make this easy
 * to allocate from a pool.
 * @constructor
 * @implements {cast.games.spellcast.Action}
 */
cast.games.spellcast.actions.PlayerAttackSpell = function() {
  /** @private {cast.games.spellcast.SpellcastGame} */
  this.game_ = null;

  /** @private {cast.games.spellcast.gameobjects.Player} */
  this.caster_ = null;

  /** @private {cast.games.spellcast.gameobjects.Enemy} */
  this.target_ = null;

  /** @private {cast.games.spellcast.messages.SpellElement} */
  this.attackElement_ = cast.games.spellcast.messages.SpellElement.NONE;

  /** @private {cast.games.spellcast.messages.SpellAccuracy} */
  this.accuracy_ = cast.games.spellcast.messages.SpellAccuracy.GOOD;

  /** @private {!cast.games.spellcast.messages.PlayerBonus} */
  this.casterBonus_ =
      cast.games.spellcast.messages.PlayerBonus.NONE;

  /** @private {!PIXI.Point} Used to position caster effects and spells. */
  this.casterEffectAndSpellPosition_ = new PIXI.Point(0, 0);

  /** @private {number} */
  this.damage_ = 0;
};


/**
 * Initializes the attack spell.
 * @param {!cast.games.spellcast.SpellcastGame} game
 * @param {!cast.games.spellcast.gameobjects.Player} caster
 * @param {!cast.games.spellcast.gameobjects.Enemy} target
 * @param {!cast.games.spellcast.messages.SpellElement} attackElement
 * @param {!cast.games.spellcast.messages.SpellAccuracy} accuracy
 */
cast.games.spellcast.actions.PlayerAttackSpell.prototype.init =
    function(game, caster, target, attackElement, accuracy) {
  this.game_ = game;
  this.caster_ = caster;
  this.target_ = target;
  this.attackElement_ = attackElement;
  this.accuracy_ = accuracy;
};


/** @override */
cast.games.spellcast.actions.PlayerAttackSpell.prototype.onStart = function() {
  if (!this.caster_.playerId) {
    throw Error('Missing caster player ID');
  }
  this.casterBonus_ = this.game_.getPlayerBonus(this.caster_.playerId);

  this.damage_ = this.getDamageForSpell(
      this.attackElement_,
      this.game_.getEnemyElement(),
      this.accuracy_);

  // Only show an explosion if damage will be dealt.
  var explosion = null;
  if (this.damage_ > 0 && this.target_) {
    explosion = this.game_.setCurrentExplosionSpellElement(this.attackElement_);
    explosion.setHitEnemyAndSpellElement(this.target_,
        this.game_.getEnemyElement());
  }

  // Shift the player forward when casting the spell.
  // Shift enemy target Y position higher to correctly position explosion.
  this.caster_.moveForward();

  this.casterEffectAndSpellPosition_.x = this.caster_.posX;
  this.casterEffectAndSpellPosition_.y = this.caster_.posY;

  var attackSpell = this.game_.setCurrentAttackSpellElement(
      this.attackElement_);
  attackSpell.activate(
      this.casterEffectAndSpellPosition_,
      this.target_.getExplosionPosition(),
      this.getExecutionTime() -
          cast.games.spellcast.GameConstants.EXPLOSION_FX_DURATION,
      explosion);

  var scale = cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPRITE_SCALE_MAP[
      this.accuracy_];
  if (this.casterBonus_ ==
      cast.games.spellcast.messages.PlayerBonus.ATTACK) {
    scale += 0.25;
  }
  attackSpell.sprite.scale.x = scale;
  attackSpell.sprite.scale.y = scale;

  this.game_.getAudioManager().playAttackSound();
};


/** @override */
cast.games.spellcast.actions.PlayerAttackSpell.prototype.onFinish = function() {
  this.caster_.moveBackward();
  this.game_.getCurrentAttackSpell().deactivate();

  // If the element of this attack matches the enemy, the enemy will heal due
  // to player error.
  if (this.attackElement_ === this.game_.getEnemyElement()) {
    this.game_.updateEnemyHealth(
        cast.games.spellcast.GameConstants.ENEMY_HEAL_VALUE);
    this.game_.getAudioManager().playHeal();
  } else {
    this.game_.updateEnemyHealth(-this.damage_);
  }
};


/**
 * Returns the amount of damage to be dealt based on the element types.
 * @param  {!cast.games.spellcast.messages.SpellElement} attackElement The
 *     element of the attack.
 * @param  {!cast.games.spellcast.messages.SpellElement} enemyElement The
 *     element of the enemy.
 * @param  {!cast.games.spellcast.messages.SpellAccuracy} accuracy The accuracy
 *     of this spell, based on how well it was drawn by the player.
 * @return {number} The amount of damage
 */
cast.games.spellcast.actions.PlayerAttackSpell.prototype.getDamageForSpell =
    function(attackElement, enemyElement, accuracy) {
  var Elements = cast.games.spellcast.messages.SpellElement;

  if (enemyElement == Elements.FIRE && attackElement != Elements.WATER) {
    return 0;
  }

  if (enemyElement == Elements.WATER && attackElement != Elements.FIRE) {
    return 0;
  }

  if (enemyElement == Elements.AIR && attackElement != Elements.EARTH) {
    return 0;
  }

  if (enemyElement == Elements.EARTH && attackElement != Elements.AIR) {
    return 0;
  }

  var damage = cast.games.spellcast.GameConstants.
      PLAYER_ATTACK_SPELL_DAMAGE_MAP[accuracy];

  if (this.casterBonus_ ==
      cast.games.spellcast.messages.PlayerBonus.ATTACK) {
    damage += cast.games.spellcast.GameConstants.PLAYER_ATTACK_BONUS;
  }

  return damage;
};


/** @override */
cast.games.spellcast.actions.PlayerAttackSpell.prototype.onUpdate =
    function(timeElapsed) {
};


/** @override */
cast.games.spellcast.actions.PlayerAttackSpell.prototype.getExecutionTime =
    function() {
  return 3000;
};


/** @override */
cast.games.spellcast.actions.PlayerAttackSpell.prototype.
    getShouldFinishOnNextUpdate = function() {
  return false;
};
