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
goog.provide('cast.games.spellcast.actions.CountdownAction');

goog.require('cast.games.spellcast.Action');
goog.require('cast.games.spellcast.GameConstants');



/**
 * Shows a 3 second countdown followed by a message indicating the game is
 * waiting for player actions.  Constructor has no parameters to make this easy
 * to allocate from a pool.
 * @constructor
 * @implements {cast.games.spellcast.Action}
 */
cast.games.spellcast.actions.CountdownAction = function() {
  /** @private {cast.games.spellcast.SpellcastGame} */
  this.game_ = null;

  /** @private {number} */
  this.countdownIndex_ = 0;

  /** @private {!PIXI.Point} Positions displayed text at the center. */
  this.displayPosition_ = new PIXI.Point(0.5, 0.5);
};


/**
 * Initializes the countdown action.
 * @param {!cast.games.spellcast.SpellcastGame} game
 */
cast.games.spellcast.actions.CountdownAction.prototype.init = function(game) {
  this.game_ = game;
};


/** @override */
cast.games.spellcast.actions.CountdownAction.prototype.onStart = function() {
  var GameConstants = cast.games.spellcast.GameConstants;
  this.game_.getCountdownPlayerActionDisplay().activate(this.displayPosition_);
  this.game_.getCountdownPlayerActionDisplay().setText(
      GameConstants.PLAYER_COUNTDOWN[0]);
  this.countdownIndex_ = 1;
};


/** @override */
cast.games.spellcast.actions.CountdownAction.prototype.onUpdate =
    function(elapsedTime) {
  var GameConstants = cast.games.spellcast.GameConstants;
  if (this.countdownIndex_ < GameConstants.PLAYER_COUNTDOWN.length &&
      elapsedTime >= (this.countdownIndex_ * 1000)) {
    // Update the number shown on the countdown.
    this.game_.getCountdownPlayerActionDisplay().setText(
        GameConstants.PLAYER_COUNTDOWN[this.countdownIndex_]);
    this.countdownIndex_ = this.countdownIndex_ + 1;
  }
};


/** @override */
cast.games.spellcast.actions.CountdownAction.prototype.onFinish = function() {
  this.game_.getCountdownPlayerActionDisplay().deactivate();
  this.game_.getWaitingPlayerActionDisplay().activate(this.displayPosition_);
  this.game_.getWaitingPlayerActionDisplay().setText(
      cast.games.spellcast.GameConstants.WAITING_FOR_PLAYER_ACTIONS_TEXT);
};


/** @override */
cast.games.spellcast.actions.CountdownAction.prototype.getExecutionTime =
    function() {
  return 3000;
};


/** @override */
cast.games.spellcast.actions.CountdownAction.prototype.
    getShouldFinishOnNextUpdate = function() {
  return false;
};
