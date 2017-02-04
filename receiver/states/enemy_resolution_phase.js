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
goog.provide('cast.games.spellcast.states.EnemyResolutionPhase');


goog.require('cast.games.spellcast.GameConstants');
goog.require('cast.games.spellcast.State');
goog.require('cast.games.spellcast.messages.GameStateId');
goog.require('cast.games.spellcast.messages.SpellElement');



/**
 * @param {!cast.games.spellcast.SpellcastGame} game
 * @param {!cast.games.spellcast.StateMachine} stateMachine
 * @param {!cast.games.spellcast.ActionManager} actionManager
 * @constructor
 * @implements {cast.games.spellcast.State}
 */
cast.games.spellcast.states.EnemyResolutionPhase = function(game,
    stateMachine, actionManager) {
  /** @private {!cast.games.spellcast.SpellcastGame} */
  this.game_ = game;

  /** @private {!cast.receiver.games.GameManager} */
  this.gameManager_ = this.game_.getGameManager();

  /** @private {!cast.games.spellcast.StateMachine} */
  this.stateMachine_ = stateMachine;

  /** @private {!cast.games.spellcast.ActionManager} */
  this.actionManager_ = actionManager;

  /** @private {boolean} */
  this.showedPartyDeath_ = false;

  /**
   * Pre-bound call to #onPlayerIdle which is used to pause the game.
   * @private {function(cast.receiver.games.Event)}
   */
  this.boundPlayerIdleCallback_ = this.onPlayerIdle_.bind(this);
};


/** @override */
cast.games.spellcast.states.EnemyResolutionPhase.prototype.onEnter =
    function(previousStateId) {
  // Do not initialize this state if the game was unpaused.
  if (previousStateId == cast.games.spellcast.messages.GameStateId.PAUSED) {
    return;
  }

  if (this.game_.getEnemyElement() ==
      cast.games.spellcast.messages.SpellElement.NONE) {
    throw Error('No enemy element selected.');
  }

  var connectedPlayers = this.gameManager_.getConnectedPlayers();
  var numberConnectedPlayers = connectedPlayers.length;
  if (numberConnectedPlayers == 0) {
    throw Error('No players for the enemy to attack.');
  }
  var victimIndex = Math.floor(Math.random() * numberConnectedPlayers);

  var attackStrengthIndex = Math.floor(Math.random() *
      cast.games.spellcast.GameConstants.RANDOM_ENEMY_ATTACK_STRENGTHS.length);
  var attackStrength = cast.games.spellcast.GameConstants.
      RANDOM_ENEMY_ATTACK_STRENGTHS[attackStrengthIndex];

  var enemy = this.game_.getEnemy();
  if (!enemy) {
    throw Error('No enemy found for enemy resolution phase.');
  }

  var victim = this.game_.getPlayer(connectedPlayers[victimIndex].playerId);
  var actions = this.actionManager_.getActionList();
  actions.push(this.actionManager_.getEnemyAttackAction(
      enemy,
      victim,
      this.game_.getEnemyElement(),
      attackStrength));
  this.actionManager_.startExecuting(actions);

  this.showedPartyDeath_ = false;

  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.PLAYER_IDLE,
      this.boundPlayerIdleCallback_);
};


/** @override */
cast.games.spellcast.states.EnemyResolutionPhase.prototype.onUpdate =
    function() {
  if (this.actionManager_.isDone()) {
    if (this.game_.getPartyHealth() > 0) {
      this.stateMachine_.goToState(
          cast.games.spellcast.messages.GameStateId.PLAYER_ACTION);
    } else if (!this.showedPartyDeath_) {
      // Before going to enemy victory state, execute party death action.
      var actions = this.actionManager_.getActionList();
      actions.push(this.actionManager_.getPartyDeathAction());
      this.actionManager_.reset();
      this.actionManager_.startExecuting(actions);
      this.showedPartyDeath_ = true;
    } else {
      // Party death action finished, so go to enemy victorys tate.
      this.stateMachine_.goToState(
          cast.games.spellcast.messages.GameStateId.ENEMY_VICTORY);
    }
  }
};


/** @override */
cast.games.spellcast.states.EnemyResolutionPhase.prototype.onExit =
    function(nextStateId) {
  this.gameManager_.removeEventListener(
      cast.receiver.games.EventType.PLAYER_IDLE,
      this.boundPlayerIdleCallback_);
};


/**
 * Handles when a player pauses.
 * @param {cast.receiver.games.Event} event
 * @private
 */
cast.games.spellcast.states.EnemyResolutionPhase.prototype.onPlayerIdle_ =
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
