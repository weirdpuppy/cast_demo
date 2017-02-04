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
goog.provide('cast.games.spellcast.states.PlayerResolutionPhase');


goog.require('cast.games.spellcast.State');
goog.require('cast.games.spellcast.messages.GameStateId');



/**
 * @param {!cast.games.spellcast.SpellcastGame} game
 * @param {!cast.games.spellcast.StateMachine} stateMachine
 * @param {!cast.games.spellcast.ActionManager} actionManager
 * @constructor
 * @implements {cast.games.spellcast.State}
 */
cast.games.spellcast.states.PlayerResolutionPhase = function(game,
    stateMachine, actionManager) {
  /** @private {!cast.games.spellcast.SpellcastGame} */
  this.game_ = game;

  /** @private {!cast.receiver.games.GameManager} */
  this.gameManager_ = this.game_.getGameManager();

  /** @private {!cast.games.spellcast.StateMachine} */
  this.stateMachine_ = stateMachine;

  /** @private {!cast.games.spellcast.ActionManager} */
  this.actionManager_ = actionManager;

  /**
   * This will be provided by the previous state (PlayerActionPhase).
   * Keys are player ids, values are the actions that player took this round.
   * @private {Object.<string, !Array.<!cast.games.spellcast.Action>>}
   */
  this.playerActions_ = null;

  /** @private {cast.games.spellcast.gameobjects.Enemy} */
  this.enemy_ = null;

  /** @private {boolean} */
  this.showedEnemyDeath_ = false;

  /**
   * Pre-bound call to #onPlayerIdle which is used to pause the game.
   * @private {function(cast.receiver.games.Event)}
   */
  this.boundPlayerIdleCallback_ = this.onPlayerIdle_.bind(this);
};


/**
 * ID of player resolution phase state.
 * @const {string}
 */
cast.games.spellcast.states.PlayerResolutionPhase.ID = 'PlayerResolutionPhase';


/** @override */
cast.games.spellcast.states.PlayerResolutionPhase.prototype.onEnter =
    function(previousStateId) {
  // Do not initialize the state if unpausing the game.
  if (previousStateId == cast.games.spellcast.messages.GameStateId.PAUSED) {
    return;
  }

  if (!this.playerActions_) {
    throw Error('No player actions provided for the PlayerResolutionPhase');
  }

  this.game_.resetNumberOfShieldSpellsCastThisRound();

  // Sort player actions so that we end up with array where player turns happen
  // one at a time instead of a player executing all their actions before moving
  // to the next player.
  var sortedActions = this.actionManager_.getActionList();
  var currentSpellIndex = 0;
  var keys = Object.keys(this.playerActions_);

  var allPlayersDone = false;
  while (!allPlayersDone) {
    allPlayersDone = true;
    for (var i = 0; i < keys.length; i++) {
      var currentPlayerActions = this.playerActions_[keys[i]];
      if (currentSpellIndex < currentPlayerActions.length) {
        allPlayersDone = false;
        sortedActions.push(currentPlayerActions[currentSpellIndex]);
      }
    }
    currentSpellIndex++;
  }
  this.actionManager_.startExecuting(sortedActions);

  this.enemy_ = this.game_.getEnemy();
  this.showedEnemyDeath_ = false;

  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.PLAYER_IDLE,
      this.boundPlayerIdleCallback_);
};


/** @override */
cast.games.spellcast.states.PlayerResolutionPhase.prototype.onUpdate =
    function() {
  if (this.actionManager_.isDone()) {
    if (this.game_.getEnemyHealth() > 0) {
      this.stateMachine_.goToState(
          cast.games.spellcast.messages.GameStateId.ENEMY_RESOLUTION);
    } else if (!this.showedEnemyDeath_ && this.enemy_) {
      // Before going to player victory state, execute enemy death action.
      var actions = this.actionManager_.getActionList();
      actions.push(this.actionManager_.getEnemyDeathAction(this.enemy_));
      this.actionManager_.reset();
      this.actionManager_.startExecuting(actions);
      this.showedEnemyDeath_ = true;
    } else {
      this.stateMachine_.goToState(
          cast.games.spellcast.messages.GameStateId.PLAYER_VICTORY);
    }
  }
};


/** @override */
cast.games.spellcast.states.PlayerResolutionPhase.prototype.onExit =
    function(nextStateId) {
  // Do not clean up player actions and shield accounting if pausing.
  if (nextStateId == cast.games.spellcast.messages.GameStateId.PAUSED) {
    return;
  }

  this.gameManager_.removeEventListener(
      cast.receiver.games.EventType.PLAYER_IDLE,
      this.boundPlayerIdleCallback_);

  if (this.playerActions_) {
    // Release just the action lists from all players - the actions themselves
    // were already released when they were passed to the sortedActions list.
    var keys = Object.keys(this.playerActions_);
    for (var i = 0; i < keys.length; i++) {
      this.actionManager_.releaseActionList(this.playerActions_[keys[i]],
          /* opt_releaseListOnly */ true);
    }
  }

  this.playerActions_ = null;
  this.game_.resetNumberOfShieldSpellsCastThisRound();
};


/**
 * Provides the actions to be executed in this phase.
 * @param {!Object.<string,
 *     !Array.<!cast.games.spellcast.Action>>} playerActions Keys are player
 *     IDs, values are the actions that player took this round.
 */
cast.games.spellcast.states.PlayerResolutionPhase.prototype.setPlayerActions =
    function(playerActions) {
  this.playerActions_ = playerActions;
};


/**
 * Handles when a player pauses.
 * @param {cast.receiver.games.Event} event
 * @private
 */
cast.games.spellcast.states.PlayerResolutionPhase.prototype.onPlayerIdle_ =
    function(event) {
  if (event.statusCode != cast.receiver.games.StatusCode.SUCCESS) {
    console.log('Error: Event status code: ' + event.statusCode);
    console.log('Reason for error: ' + event.errorDescription);
    return;
  }
  // Check if the game is already paused.
  if (this.gameManager_.getGameplayState() ==
      cast.receiver.games.GameplayState.PAUSED) {
    return;
  }

  this.stateMachine_.goToState(
      cast.games.spellcast.messages.GameStateId.PAUSED);
};
