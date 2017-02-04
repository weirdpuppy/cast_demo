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
goog.provide('cast.games.spellcast.actions.PartyDeathAction');

goog.require('cast.games.spellcast.Action');
goog.require('cast.games.spellcast.GameConstants');



/**
 * Party death effect.  Constructor has no parameters to make this easy to
 * allocate from a pool.
 * @constructor
 * @implements {cast.games.spellcast.Action}
 */
cast.games.spellcast.actions.PartyDeathAction = function() {
  /** @private {cast.games.spellcast.SpellcastGame} */
  this.game_ = null;

  /** @private {cast.receiver.games.GameManager} */
  this.gameManager_ = null;

  /** @private {number} */
  this.alpha_ = 1.0;

  /** @private {number} */
  this.whenToChangeAlpha_ = 250;
};


/**
 * Initializes this party death action.
 * @param {!cast.games.spellcast.SpellcastGame} game
 */
cast.games.spellcast.actions.PartyDeathAction.prototype.init = function(game) {
  this.game_ = game;
  this.gameManager_ = this.game_.getGameManager();
};


/** @override */
cast.games.spellcast.actions.PartyDeathAction.prototype.onStart = function() {
  this.updateAlphas_();
  this.whenToChangeAlpha_ = 250;
};


/** @override */
cast.games.spellcast.actions.PartyDeathAction.prototype.onUpdate =
    function(elapsedTime) {
  if (elapsedTime < this.whenToChangeAlpha_) {
    return;
  }

  this.alpha_ = (cast.games.spellcast.GameConstants.DEATH_FX_DURATION -
      elapsedTime) / cast.games.spellcast.GameConstants.DEATH_FX_DURATION;
  this.whenToChangeAlpha_ += 250;
  this.updateAlphas_();
};


/** @override */
cast.games.spellcast.actions.PartyDeathAction.prototype.onFinish = function() {
  // Remove the enemy.
  this.game_.getEnemy().deactivate();
};


/**
 * Update the alpha of all players on the screen.
 * @private
 */
cast.games.spellcast.actions.PartyDeathAction.prototype.updateAlphas_ =
    function() {
  var connectedPlayers = this.gameManager_.getConnectedPlayers();
  for (var i = 0; i < connectedPlayers.length; i++) {
    var player = this.game_.getPlayer(connectedPlayers[i].playerId);
    player.sprite.alpha = this.alpha_;
  }
};


/** @override */
cast.games.spellcast.actions.PartyDeathAction.prototype.getExecutionTime =
    function() {
  return cast.games.spellcast.GameConstants.DEATH_FX_DURATION;
};


/** @override */
cast.games.spellcast.actions.PartyDeathAction.prototype.
    getShouldFinishOnNextUpdate = function() {
  return false;
};
