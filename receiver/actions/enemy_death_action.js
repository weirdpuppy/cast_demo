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
goog.provide('cast.games.spellcast.actions.EnemyDeathAction');

goog.require('cast.games.spellcast.Action');
goog.require('cast.games.spellcast.GameConstants');



/**
 * Shows enemy death followed by player victory message.  Constructor has no
 * parameters to make this easy to allocate from a pool.
 * @constructor
 * @implements {cast.games.spellcast.Action}
 */
cast.games.spellcast.actions.EnemyDeathAction = function() {
  /** @private {cast.games.spellcast.gameobjects.Enemy} */
  this.enemy_ = null;

  /** @private {number} */
  this.alpha_ = 1.0;

  /** @private {number} */
  this.whenToChangeAlpha_ = 250;
};


/**
 * Initializes this enemy death action.
 * @param {!cast.games.spellcast.gameobjects.Enemy} enemy
 */
cast.games.spellcast.actions.EnemyDeathAction.prototype.init =
    function(enemy) {
  this.enemy_ = enemy;
};


/** @override */
cast.games.spellcast.actions.EnemyDeathAction.prototype.onStart = function() {
  this.whenToChangeAlpha_ = 250;
  this.enemy_.getSprite().alpha = this.alpha_;
};


/** @override */
cast.games.spellcast.actions.EnemyDeathAction.prototype.onUpdate =
    function(elapsedTime) {
  // Return if not time yet to update alpha.
  if (elapsedTime < this.whenToChangeAlpha_) {
    return;
  }

  this.alpha_ = (cast.games.spellcast.GameConstants.DEATH_FX_DURATION -
      elapsedTime) / cast.games.spellcast.GameConstants.DEATH_FX_DURATION;
  this.whenToChangeAlpha_ += 250;
  this.enemy_.getSprite().alpha = this.alpha_;
};


/** @override */
cast.games.spellcast.actions.EnemyDeathAction.prototype.onFinish = function() {
};


/** @override */
cast.games.spellcast.actions.EnemyDeathAction.prototype.getExecutionTime =
    function() {
  return cast.games.spellcast.GameConstants.DEATH_FX_DURATION;
};


/** @override */
cast.games.spellcast.actions.EnemyDeathAction.prototype.
    getShouldFinishOnNextUpdate = function() {
  return false;
};
