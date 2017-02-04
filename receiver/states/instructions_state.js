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
goog.provide('cast.games.spellcast.states.InstructionsState');


goog.require('cast.games.spellcast.GameConstants');
goog.require('cast.games.spellcast.State');
goog.require('cast.games.spellcast.messages.GameStateId');



/**
 * Shows the game instructions for a limited period of time.
 * @param {!cast.games.spellcast.SpellcastGame} game
 * @param {!cast.games.spellcast.StateMachine} stateMachine
 * @param {!cast.games.spellcast.ActionManager} actionManager
 * @constructor
 * @implements {cast.games.spellcast.State}
 */
cast.games.spellcast.states.InstructionsState = function(game, stateMachine,
    actionManager) {
  /** @private {!cast.games.spellcast.SpellcastGame} */
  this.game_ = game;

  /** @private {!cast.receiver.games.GameManager} */
  this.gameManager_ = game.getGameManager();

  /** @private {!cast.games.spellcast.StateMachine} */
  this.stateMachine_ = stateMachine;

  /** @private {!cast.games.spellcast.ActionManager} */
  this.actionManager_ = actionManager;
};


/** @override */
cast.games.spellcast.states.InstructionsState.prototype.onEnter =
    function(previousStateId) {
  var instructionsDisplay = this.game_.getInstructionsDisplay();
  if (!instructionsDisplay) {
    throw Error('No instructions display');
  }
  var actions = this.actionManager_.getActionList();
  actions.push(this.actionManager_.getFullScreenDisplayAction(
      instructionsDisplay,
      cast.games.spellcast.GameConstants.INSTRUCTIONS_DELAY));
  this.actionManager_.startExecuting(actions);

  this.gameManager_.updateGameplayState(
      cast.receiver.games.GameplayState.SHOWING_INFO_SCREEN, null);
};


/** @override */
cast.games.spellcast.states.InstructionsState.prototype.onUpdate = function() {
  // Exit early if all players dropped out.
  if (this.gameManager_.getConnectedPlayers().length == 0) {
    this.stateMachine_.goToState(
        cast.games.spellcast.messages.GameStateId.WAITING_FOR_PLAYERS);
    return;
  }

  if (!this.actionManager_.isDone()) {
    return;
  }

  this.stateMachine_.goToState(
      cast.games.spellcast.messages.GameStateId.PLAYER_ACTION);
};


/** @override */
cast.games.spellcast.states.InstructionsState.prototype.onExit =
    function(nextStateId) {
  this.actionManager_.reset();

  if (nextStateId == cast.games.spellcast.messages.GameStateId.PLAYER_ACTION) {
    this.gameManager_.updateGameplayState(
        cast.receiver.games.GameplayState.RUNNING, null);
    this.game_.setupWorld();
  }
};
