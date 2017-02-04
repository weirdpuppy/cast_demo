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
goog.provide('cast.games.spellcast.states.PlayerVictoryState');


goog.require('cast.games.spellcast.GameConstants');
goog.require('cast.games.spellcast.State');
goog.require('cast.games.spellcast.messages.GameStateId');



/**
 * @param {!cast.games.spellcast.SpellcastGame} game
 * @param {!cast.games.spellcast.StateMachine} stateMachine
 * @param {!cast.games.spellcast.ActionManager} actionManager
 * @constructor
 * @implements {cast.games.spellcast.State}
 */
cast.games.spellcast.states.PlayerVictoryState = function(game,
    stateMachine, actionManager) {
  /** @private {!cast.games.spellcast.SpellcastGame} */
  this.game_ = game;

  /** @private {!cast.receiver.games.GameManager} */
  this.gameManager_ = this.game_.getGameManager();

  /** @private {!cast.games.spellcast.StateMachine} */
  this.stateMachine_ = stateMachine;

  /** @private {!cast.games.spellcast.ActionManager} */
  this.actionManager_ = actionManager;
};


/** @override */
cast.games.spellcast.states.PlayerVictoryState.prototype.onEnter =
    function(previousStateId) {
  this.game_.getEnemyHealthDisplay().deactivate();
  this.game_.getPartyHealthDisplay().deactivate();
  this.game_.getBattlefieldDisplay().deactivate();

  // Show the player victory display.
  var playerVictoryDisplay = this.game_.getPlayerVictoryDisplay();
  if (!playerVictoryDisplay) {
    throw Error('No player victory display');
  }
  var actions = this.actionManager_.getActionList();
  actions.push(this.actionManager_.getFullScreenDisplayAction(
      playerVictoryDisplay,
      cast.games.spellcast.GameConstants.ENDGAME_DISPLAY_DELAY));
  this.actionManager_.startExecuting(actions);

  this.gameManager_.updateGameplayState(
      cast.receiver.games.GameplayState.SHOWING_INFO_SCREEN, null);

  // Transition all players to idle.
  var players = this.gameManager_.getPlayersInState(
      cast.receiver.games.PlayerState.PLAYING);
  for (var i = 0; i < players.length; i++) {
    this.gameManager_.updatePlayerState(players[i].playerId,
        cast.receiver.games.PlayerState.IDLE, null);
  }

  this.game_.removeAllPlayers();
  this.game_.removeEnemy();
};


/** @override */
cast.games.spellcast.states.PlayerVictoryState.prototype.onUpdate = function() {
  if (this.actionManager_.isDone()) {
    this.stateMachine_.goToState(
        cast.games.spellcast.messages.GameStateId.WAITING_FOR_PLAYERS);
  }
};


/** @override */
cast.games.spellcast.states.PlayerVictoryState.prototype.onExit =
    function(nextStateId) {
  // Transition all players to available.
  var players = this.gameManager_.getPlayersInState(
      cast.receiver.games.PlayerState.IDLE);
  for (var i = 0; i < players.length; i++) {
    this.gameManager_.updatePlayerState(players[i].playerId,
        cast.receiver.games.PlayerState.AVAILABLE, null);
  }

  this.game_.getPlayerVictoryDisplay().deactivate();

  this.gameManager_.updateGameplayState(
      cast.receiver.games.GameplayState.RUNNING, null);

  this.actionManager_.reset();
};
