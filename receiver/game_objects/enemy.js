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
goog.provide('cast.games.spellcast.gameobjects.Enemy');



/**
 * All enemies in the game implement this interface.
 * @interface
 */
cast.games.spellcast.gameobjects.Enemy = function() {
};


/**
 * Implement this to update position and animation state.
 * @param {number} deltaTime Time in msec between current and previous animation
 *     frame. Useful for adjusting speeds depending on frame rate.
 */
cast.games.spellcast.gameobjects.Enemy.prototype.update;


/**
 * Activates this enemy with a specific element and animation.
 * @param {!cast.games.spellcast.gameobjects.EnemyAnimation} animation
 */
cast.games.spellcast.gameobjects.Enemy.prototype.activate;


/**
 * Deactivates this enemy with its current animation.
 */
cast.games.spellcast.gameobjects.Enemy.prototype.deactivate;


/**
 * Returns the idle animation for a specific spell element.
 * @param {cast.games.spellcast.messages.SpellElement} spellElement
 * @return {!cast.games.spellcast.gameobjects.EnemyAnimation} Idle animation.
 */
cast.games.spellcast.gameobjects.Enemy.prototype.getIdleAnimation;


/**
 * Returns the attack animation for a specific spell element.
 * @param {cast.games.spellcast.messages.SpellElement} spellElement
 * @return {!cast.games.spellcast.gameobjects.EnemyAnimation} Attack animation.
 */
cast.games.spellcast.gameobjects.Enemy.prototype.getAttackAnimation;


/**
 * Returns the hit (by player spell) animation for a specific spell element.
 * @param {cast.games.spellcast.messages.SpellElement} spellElement
 * @return {!cast.games.spellcast.gameobjects.EnemyAnimation} Hit animation.
 */
cast.games.spellcast.gameobjects.Enemy.prototype.getHitAnimation;


/** @return {!PIXI.Point} Starting position for attack spells. */
cast.games.spellcast.gameobjects.Enemy.prototype.getAttackPosition;


/** @return {!PIXI.Point} Position for explosions hitting enemy. */
cast.games.spellcast.gameobjects.Enemy.prototype.getExplosionPosition;


/** @return {!PIXI.Sprite} Sprite from current animation. */
cast.games.spellcast.gameobjects.Enemy.prototype.getSprite;
