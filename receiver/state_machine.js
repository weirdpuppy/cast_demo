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
goog.provide('cast.games.spellcast.StateMachine');

goog.require('cast.games.spellcast.messages.GameStateId');



/**
 * Manages a set of {@link cast.games.spellcast.State} objects.
 * @param {!cast.games.spellcast.SpellcastGame} game
 * @constructor
 */
cast.games.spellcast.StateMachine = function(game) {
  /** @private {!cast.games.spellcast.SpellcastGame} */
  this.game_ = game;

  /**
   * @private {!Object.<cast.games.spellcast.messages.GameStateId,
   *     !cast.games.spellcast.State>}
   */
  this.states_ = Object.create(null);

  /** @private {cast.games.spellcast.messages.GameStateId} */
  this.currentStateId_ = cast.games.spellcast.messages.GameStateId.UNKNOWN;

  /** @private {cast.games.spellcast.State} */
  this.currentState_ = null;
};


/**
 * Adds a state.
 * @param {cast.games.spellcast.messages.GameStateId} id
 * @param {!cast.games.spellcast.State} state
 */
cast.games.spellcast.StateMachine.prototype.addState = function(id, state) {
  this.states_[id] = state;
};


/**
 * Removes a state.
 * @param {cast.games.spellcast.messages.GameStateId} id
 */
cast.games.spellcast.StateMachine.prototype.removeState = function(id) {
  delete this.states_[id];
};


/**
 * Go to state and broadcast current game status to all players.
 * @param {cast.games.spellcast.messages.GameStateId} id
 */
cast.games.spellcast.StateMachine.prototype.goToState = function(id) {
  if (this.currentState_) {
    this.currentState_.onExit(id);
  }
  var previousStateId = this.currentStateId_;
  this.currentStateId_ = id;
  this.currentState_ = this.states_[id];
  if (!this.currentState_) {
    throw Error('No state found for ' + id);
  }
  this.currentState_.onEnter(previousStateId);
  this.game_.broadcastGameStatus(this.currentStateId_);
};


/**
 * Returns the state object with the provided id, if it exists.
 * @param {cast.games.spellcast.messages.GameStateId} id
 * @return {cast.games.spellcast.State} The state associated with the
 *     provided id, or null if not found.
 */
cast.games.spellcast.StateMachine.prototype.getState = function(id) {
  return this.states_[id];
};


/** @return {cast.games.spellcast.State} Returns the current state if any. */
cast.games.spellcast.StateMachine.prototype.getCurrentState = function() {
  return this.currentState_;
};


/** Updates the current state. Should be called in game animation loop. */
cast.games.spellcast.StateMachine.prototype.update = function() {
  if (this.currentState_) {
    this.currentState_.onUpdate();
  }
};
