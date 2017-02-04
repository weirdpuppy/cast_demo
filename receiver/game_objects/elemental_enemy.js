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
goog.provide('cast.games.spellcast.gameobjects.ElementalEnemy');

goog.require('cast.games.spellcast.gameobjects.Enemy');
goog.require('cast.games.spellcast.gameobjects.MovieEnemyAnimation');
goog.require('cast.games.spellcast.messages.SpellElement');



/**
 * The elemental enemy, composed of different animations. Assumes PIXI asset
 * loader already loaded the required assets (frame names for fire, water,
 * earth, air elementals and their idle, attack, and hit animation states).
 *
 * @param {!PIXI.Container} container
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @implements {cast.games.spellcast.gameobjects.Enemy}
 * @struct
 * @constructor
 */
cast.games.spellcast.gameobjects.ElementalEnemy = function(container,
    canvasWidth, canvasHeight) {
  /**
   * Map of spell elements to idle animations.
   * @private {!Object.<cast.games.spellcast.messages.SpellElement,
   *     !cast.games.spellcast.gameobjects.MovieEnemyAnimation>}
   */
  this.idleAnimations_ = Object.create(null);

  /**
   * Map of spell elements to attack animations.
   * @private {!Object.<cast.games.spellcast.messages.SpellElement,
   *     !cast.games.spellcast.gameobjects.MovieEnemyAnimation>}
   */
  this.attackAnimations_ = Object.create(null);

  /**
   * Map of spell elements to hit (by player) animations.
   * @private {!Object.<cast.games.spellcast.messages.SpellElement,
   *     !cast.games.spellcast.gameobjects.MovieEnemyAnimation>}
   */
  this.hitAnimations_ = Object.create(null);

  /** @private {!PIXI.Point} Normalized position for attack spells. */
  this.attackSpellPosition_ = new PIXI.Point(0.7575, 0.63611);

  /** @private {!PIXI.Point} Normalized position for explosions. */
  this.explosionPosition_ = new PIXI.Point(0.7575, 0.63611);

  /** @private {!PIXI.Point} Idle animation normalized position. */
  this.idlePosition_ = new PIXI.Point(0.60359375, 0.4305556);

  /** @private {!PIXI.Point} Attack animation normalized position. */
  this.attackPosition_ = new PIXI.Point(0.399375, 0.2086111);

  /** @private {!PIXI.Point} Hit animation normalized position. */
  this.hitPosition_ = new PIXI.Point(0.5408124, 0.3241667);

  /** @private {!PIXI.Point} Scale of all animations. */
  this.scale_ = new PIXI.Point(1.25, 1.25);

  /** @private {cast.games.spellcast.gameobjects.EnemyAnimation} */
  this.currentAnimation_ = null;

  var SpellElement = cast.games.spellcast.messages.SpellElement;

  this.idleAnimations_[SpellElement.AIR] =
      new cast.games.spellcast.gameobjects.MovieEnemyAnimation(
          'air_elemental_idle', 12, this.idlePosition_, this.scale_,
          container, canvasWidth, canvasHeight,
          /* animationFinishedCallback */ null);
  this.idleAnimations_[SpellElement.EARTH] =
      new cast.games.spellcast.gameobjects.MovieEnemyAnimation(
          'earth_elemental_idle', 12, this.idlePosition_, this.scale_,
          container, canvasWidth, canvasHeight,
          /* animationFinishedCallback */ null);
  this.idleAnimations_[SpellElement.FIRE] =
      new cast.games.spellcast.gameobjects.MovieEnemyAnimation(
          'fire_elemental_idle', 12, this.idlePosition_, this.scale_,
          container, canvasWidth, canvasHeight,
          /* animationFinishedCallback */ null);
  this.idleAnimations_[SpellElement.WATER] =
      new cast.games.spellcast.gameobjects.MovieEnemyAnimation(
          'water_elemental_idle', 12, this.idlePosition_, this.scale_,
          container, canvasWidth, canvasHeight,
          /* animationFinishedCallback */ null);

  this.attackAnimations_[SpellElement.AIR] =
      new cast.games.spellcast.gameobjects.MovieEnemyAnimation(
          'air_elemental_attack', 10, this.attackPosition_, this.scale_,
          container, canvasWidth, canvasHeight,
          /* animationFinishedCallback */ this.onAnimationFinished_.bind(this,
              SpellElement.AIR));
  this.attackAnimations_[SpellElement.EARTH] =
      new cast.games.spellcast.gameobjects.MovieEnemyAnimation(
          'earth_elemental_attack', 10, this.attackPosition_,
          this.scale_, container, canvasWidth, canvasHeight,
          /* animationFinishedCallback */ this.onAnimationFinished_.bind(this,
              SpellElement.EARTH));
  this.attackAnimations_[SpellElement.FIRE] =
      new cast.games.spellcast.gameobjects.MovieEnemyAnimation(
          'fire_elemental_attack', 10, this.attackPosition_,
          this.scale_, container, canvasWidth, canvasHeight,
          /* animationFinishedCallback */ this.onAnimationFinished_.bind(this,
              SpellElement.FIRE));
  this.attackAnimations_[cast.games.spellcast.messages.SpellElement.WATER] =
      new cast.games.spellcast.gameobjects.MovieEnemyAnimation(
          'water_elemental_attack', 10, this.attackPosition_,
          this.scale_, container, canvasWidth, canvasHeight,
          /* animationFinishedCallback */ this.onAnimationFinished_.bind(this,
              SpellElement.WATER));

  this.hitAnimations_[SpellElement.AIR] =
      new cast.games.spellcast.gameobjects.MovieEnemyAnimation(
          'air_elemental_hit', 3, this.hitPosition_, this.scale_,
          container, canvasWidth, canvasHeight,
          /* animationFinishedCallback */ this.onAnimationFinished_.bind(this,
              SpellElement.AIR));
  this.hitAnimations_[SpellElement.EARTH] =
      new cast.games.spellcast.gameobjects.MovieEnemyAnimation(
          'earth_elemental_hit', 3, this.hitPosition_, this.scale_,
          container, canvasWidth, canvasHeight,
          /* animationFinishedCallback */ this.onAnimationFinished_.bind(this,
              SpellElement.EARTH));
  this.hitAnimations_[SpellElement.FIRE] =
      new cast.games.spellcast.gameobjects.MovieEnemyAnimation(
          'fire_elemental_hit', 3, this.hitPosition_, this.scale_,
          container, canvasWidth, canvasHeight,
          /* animationFinishedCallback */ this.onAnimationFinished_.bind(this,
              SpellElement.FIRE));
  this.hitAnimations_[SpellElement.WATER] =
      new cast.games.spellcast.gameobjects.MovieEnemyAnimation(
          'water_elemental_hit', 3, this.hitPosition_, this.scale_,
          container, canvasWidth, canvasHeight,
          /* animationFinishedCallback */ this.onAnimationFinished_.bind(this,
              SpellElement.WATER));
};


/** @override */
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.update =
    function(deltaTime) {
  if (this.currentAnimation_ && this.currentAnimation_.active) {
    this.currentAnimation_.update(deltaTime);
  }
};


/** @override */
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.activate =
    function(animation) {
  if (this.currentAnimation_) {
    this.currentAnimation_.deactivate();
  }

  this.currentAnimation_ = animation;
  this.currentAnimation_.activate();
};


/** @override */
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.deactivate =
    function() {
  if (this.currentAnimation_) {
    this.currentAnimation_.deactivate();
  }

  this.currentAnimation_ = null;
};


/** @override */
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.getIdleAnimation =
    function(spellElement) {
  return this.idleAnimations_[spellElement];
};


/** @override */
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.getAttackAnimation =
    function(spellElement) {
  return this.attackAnimations_[spellElement];
};


/** @override */
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.getHitAnimation =
    function(spellElement) {
  return this.hitAnimations_[spellElement];
};


/** @override */
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.getAttackPosition =
    function() {
  return this.attackSpellPosition_;
};


/** @override */
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.getExplosionPosition =
    function() {
  return this.explosionPosition_;
};


/** @override */
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.getSprite =
    function() {
  if (!this.currentAnimation_) {
    throw Error('Cannot get sprite - no current animation active');
  }

  return this.currentAnimation_.sprite;
};


/**
 * Called when non-looping animation finishes (e.g. attack or hit). If there
 * is still a current animation, deactivate it and play the idle animation for
 * the current spell element.
 * @param {cast.games.spellcast.messages.SpellElement} currentSpellElement
 * @private
 */
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.onAnimationFinished_ =
    function(currentSpellElement) {
  if (!this.currentAnimation_) {
    return;
  }

  this.currentAnimation_.deactivate();
  this.activate(this.getIdleAnimation(currentSpellElement));
};
