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
goog.provide('cast.games.spellcast.states.PausedState');


goog.require('cast.games.spellcast.State');
goog.require('cast.games.spellcast.messages.GameStateId');



/**
 * Shows paused screen until a player sends a "playing" message.
 * @param {!cast.games.spellcast.SpellcastGame} game
 * @param {!cast.games.spellcast.StateMachine} stateMachine
 * @param {!cast.games.spellcast.ActionManager} actionManager
 * @constructor
 * @implements {cast.games.spellcast.State}
 */
cast.games.spellcast.states.PausedState = function(game, stateMachine,
    actionManager) {
  /** @private {!cast.games.spellcast.SpellcastGame} */
  this.game_ = game;

  /** @private {!cast.receiver.games.GameManager} */
  this.gameManager_ = this.game_.getGameManager();

  /** @private {!cast.games.spellcast.ActionManager} */
  this.actionManager_ = actionManager;

  /** @private {!cast.games.spellcast.StateMachine} */
  this.stateMachine_ = stateMachine;

  /** @private {cast.games.spellcast.messages.GameStateId} */
  this.previousStateId_ = cast.games.spellcast.messages.GameStateId.UNKNOWN;

  /**
   * Reusable array of players to move to idle state or move out of idle state.
   * @private {!Array.<cast.receiver.games.PlayerInfo>}
   */
  this.idlePlayers_ = [];

  /**
   * Pre-bound handler when a player sends a playing message.
   * @private {function(!cast.receiver.games.Event)}
   */
  this.boundPlayerPlayingCallback_ = this.onPlayerPlaying_.bind(this);
};


/** @override */
cast.games.spellcast.states.PausedState.prototype.onEnter =
    function(previousStateId) {
  this.previousStateId_ = previousStateId;
  this.game_.getPausedDisplay().activate(this.game_.getTopLeftPosition());

  this.gameManager_.updateGameplayState(
      cast.receiver.games.GameplayState.PAUSED, null);
  this.actionManager_.pause();

  // Move all players to IDLE state and change game state to PAUSED.
  this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING,
      this.idlePlayers_);
  for (var i = 0; i < this.idlePlayers_.length; i++) {
    this.gameManager_.updatePlayerState(this.idlePlayers_[i].playerId,
        cast.receiver.games.PlayerState.IDLE, null);
  }

  // Listen to when a player tries to unpause the game.
  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.PLAYER_PLAYING,
      this.boundPlayerPlayingCallback_);
};


/** @override */
cast.games.spellcast.states.PausedState.prototype.onUpdate = function() {
};


/** @override */
cast.games.spellcast.states.PausedState.prototype.onExit =
    function(nextStateId) {
  // Stop listening to when a player tries to unpause the game.
  this.gameManager_.removeEventListener(
      cast.receiver.games.EventType.PLAYER_PLAYING,
      this.boundPlayerPlayingCallback_);

  // Move all IDLE players to PLAYING and change game state to RUNNING.
  this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.IDLE,
      this.idlePlayers_);
  for (var i = 0; i < this.idlePlayers_.length; i++) {
    this.gameManager_.updatePlayerState(this.idlePlayers_[i].playerId,
        cast.receiver.games.PlayerState.PLAYING, null);
  }

  this.actionManager_.resume();
  this.gameManager_.updateGameplayState(
      cast.receiver.games.GameplayState.RUNNING, null);

  this.game_.getPausedDisplay().deactivate();
};


/**
 * Handles when a player sends a playing message.
 * @param {!cast.receiver.games.Event} event
 * @private
 */
cast.games.spellcast.states.PausedState.prototype.onPlayerPlaying_ =
    function(event) {
  if (event.statusCode != cast.receiver.games.StatusCode.SUCCESS) {
    console.log('Error: Event status code: ' + event.statusCode);
    console.log('Reason for error: ' + event.errorDescription);
    return;
  }
  this.stateMachine_.goToState(this.previousStateId_);
};
