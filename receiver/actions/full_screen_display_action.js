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
goog.provide('cast.games.spellcast.actions.FullScreenDisplayAction');

goog.require('cast.games.spellcast.Action');
goog.require('cast.games.spellcast.GameConstants');



/**
 * Shows a full screen display for a duration. Constructor has no parameters to
 * make this easy to allocate from a pool.
 * @constructor
 * @implements {cast.games.spellcast.Action}
 */
cast.games.spellcast.actions.FullScreenDisplayAction = function() {
  /** @private {cast.games.spellcast.SpellcastGame} */
  this.game_ = null;

  /** @private {cast.games.spellcast.gameobjects.FullScreenDisplay} */
  this.fullScreenDisplay_ = null;

  /** @private {number} */
  this.displayDuration_ = 0;
};


/**
 * Initializes this show display action.
 * @param {!cast.games.spellcast.SpellcastGame} game
 * @param {!cast.games.spellcast.gameobjects.FullScreenDisplay}
 *     fullScreenDisplay
 * @param {number} displayDuration
 */
cast.games.spellcast.actions.FullScreenDisplayAction.prototype.init =
    function(game, fullScreenDisplay, displayDuration) {
  this.game_ = game;
  this.fullScreenDisplay_ = fullScreenDisplay;
  this.displayDuration_ = displayDuration;
};


/** @override */
cast.games.spellcast.actions.FullScreenDisplayAction.prototype.onStart =
    function() {
  this.fullScreenDisplay_.activate(this.game_.getTopLeftPosition());
};


/** @override */
cast.games.spellcast.actions.FullScreenDisplayAction.prototype.onUpdate =
    function(elapsedTime) {
};


/** @override */
cast.games.spellcast.actions.FullScreenDisplayAction.prototype.onFinish =
    function() {
  this.fullScreenDisplay_.deactivate();
};


/** @override */
cast.games.spellcast.actions.FullScreenDisplayAction.prototype.
    getExecutionTime = function() {
  return this.displayDuration_;
};


/** @override */
cast.games.spellcast.actions.FullScreenDisplayAction.prototype.
    getShouldFinishOnNextUpdate = function() {
  return false;
};
