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
goog.provide('cast.games.spellcast.states.PlayerActionPhase');


goog.require('cast.games.spellcast.ActionParser');
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
cast.games.spellcast.states.PlayerActionPhase = function(game, stateMachine,
    actionManager) {
  /** @private {!cast.games.spellcast.SpellcastGame} */
  this.game_ = game;

  /** @private {!cast.receiver.games.GameManager} */
  this.gameManager_ = this.game_.getGameManager();

  /** @private {!cast.games.spellcast.StateMachine} */
  this.stateMachine_ = stateMachine;

  /** @private {!cast.games.spellcast.ActionManager} */
  this.actionManager_ = actionManager;

  /** @private {number} */
  this.startTime_ = 0;

  /** @private {boolean} */
  this.waitingForInitialDelay_ = true;

  /** @private {boolean} */
  this.waitingForTurnEnding_ = true;

  /** @private {boolean} */
  this.waitingForRandomAi_ = true;

  /**
   * Keys are player IDs.
   * @private {!Object.<string, Array.<!cast.games.spellcast.Action>>}
   */
  this.actions_ = Object.create(null);

  /**
   * Set of player IDs that already sent their action.
   * @private {!Array.<string>}
   */
  this.receivedPlayerIds_ = [];

  /**
   * Pre-bound handler a player sends a game message.
   * @private {function(!cast.receiver.games.Event)}
   */
  this.boundGameMessageCallback_ = this.onGameMessage_.bind(this);

  /**
   * Pre-bound handler when a player quits.
   * @private {function(!cast.receiver.games.Event)}
   */
  this.boundPlayerQuitCallback_ = this.onPlayerQuit_.bind(this);

  /**
   * Pre-bound call to #onPlayerIdle which is used to pause the game.
   * @private {function(cast.receiver.games.Event)}
   */
  this.boundPlayerIdleCallback_ = this.onPlayerIdle_.bind(this);
};


/** @override */
cast.games.spellcast.states.PlayerActionPhase.prototype.onEnter =
    function(previousStateId) {
  if (this.gameManager_.getConnectedPlayers().length == 0) {
    this.stateMachine_.goToState(
        cast.games.spellcast.messages.GameStateId.WAITING_FOR_PLAYERS);
    return;
  }

  // Regardless if the game was paused or not these listeners must be set
  // because either they were not set initially or removed by #onExit.
  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.GAME_MESSAGE_RECEIVED,
      this.boundGameMessageCallback_);
  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.PLAYER_QUIT,
      this.boundPlayerQuitCallback_);
  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.PLAYER_DROPPED,
      this.boundPlayerQuitCallback_);
  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.PLAYER_IDLE,
      this.boundPlayerIdleCallback_);

  // Do not initialize the state if the game was unpaused.
  if (previousStateId == cast.games.spellcast.messages.GameStateId.PAUSED) {
    return;
  }

  // Clear any player actions.
  var actionKeys = Object.keys(this.actions_);
  for (var i = 0; i < actionKeys.length; i++) {
    delete this.actions_[actionKeys[i]];
  }

  // Drop shield.
  this.game_.disablePartyShield();

  // No player IDs sent any actions yet.
  this.receivedPlayerIds_.length = 0;

  // Make sure connected players are activated.
  var connectedPlayers = this.gameManager_.getConnectedPlayers();
  for (var i = 0; i < connectedPlayers.length; i++) {
    var player = this.game_.getPlayer(connectedPlayers[i].playerId);
    player.activate(player.battlePosition, /* showNameText */ false);
  }

  // Select the enemy's element and show it so the players can strategize.
  this.game_.selectEnemyElement();

  // Start countdown.
  var actions = this.actionManager_.getActionList();
  actions.push(this.actionManager_.getCountdownAction());
  this.actionManager_.startExecuting(actions);

  // Wait for initial delay for this round.
  this.waitingForInitialDelay_ = true;

  // Wait for the beginning of the end of turn.
  this.waitingForTurnEnding_ = true;

  // Wait for random AI.
  this.waitingForRandomAi_ = true;
};


/** @override */
cast.games.spellcast.states.PlayerActionPhase.prototype.onUpdate =
    function(deltaTime) {
  var currentTime = Date.now();

  if (this.waitingForInitialDelay_ && this.actionManager_.isDone()) {
    // When the countdown finishes, notify players to start drawing.
    this.startTime_ = currentTime;
    this.game_.assignBonusesAndNotifyPlayers();
    this.waitingForInitialDelay_ = false;
  }

  if (!this.waitingForInitialDelay_ &&
      this.game_.randomAiEnabled && this.waitingForRandomAi_) {
    this.game_.testCreatePlayerActions();
    this.waitingForRandomAi_ = false;
  }

  if (!this.waitingForInitialDelay_ && this.waitingForTurnEnding_ &&
      currentTime - this.startTime_ >
      cast.games.spellcast.GameConstants.TIME_RUNNING_OUT_DELAY) {
    this.waitingForTurnEnding_ = false;
  }
};


/**
 * Handles when a player sends a game message.
 * @param {!cast.receiver.games.Event} event
 * @private
 */
cast.games.spellcast.states.PlayerActionPhase.prototype.onGameMessage_ =
    function(event) {
  if (event.statusCode != cast.receiver.games.StatusCode.SUCCESS) {
    console.log('Error: Event status code: ' + event.statusCode);
    console.log('Reason for error: ' + event.errorDescription);
    return;
  }
  if (!event.requestExtraMessageData) {
    return;
  }

  var playerId = event.playerInfo.playerId;
  var spellMessage =
      /** @type {!cast.games.spellcast.messages.SpellMessage} */ (
          event.requestExtraMessageData);
  var caster = this.game_.getPlayer(playerId);
  if (!caster) {
    throw Error('Got actions from an unknown player ID: ' +
        event.playerInfo.playerId);
  }
  var enemy = this.game_.getEnemy();
  if (!enemy) {
    throw Error('No enemy defined during player action phase.');
  }

  var actions = cast.games.spellcast.ActionParser.parse(
      this.actionManager_, caster, enemy, spellMessage.spells);
  this.actions_[playerId] = actions;
  if (this.receivedPlayerIds_.indexOf(playerId) == -1) {
    this.receivedPlayerIds_.push(playerId);
  }

  // Check if everyone sent in their actions (or someone dropped while we
  // received a message).
  if (this.receivedPlayerIds_.length >=
      this.gameManager_.getConnectedPlayers().length) {
    var playerResolution = this.stateMachine_.getState(
        cast.games.spellcast.messages.GameStateId.PLAYER_RESOLUTION);
    playerResolution.setPlayerActions(this.actions_);
    this.stateMachine_.goToState(
        cast.games.spellcast.messages.GameStateId.PLAYER_RESOLUTION);
  }
};


/**
 * Handles a player quits.
 * @param {!cast.receiver.games.Event} event
 * @private
 */
cast.games.spellcast.states.PlayerActionPhase.prototype.onPlayerQuit_ =
    function(event) {
  if (event.statusCode != cast.receiver.games.StatusCode.SUCCESS) {
    console.log('Error: Event status code: ' + event.statusCode);
    console.log('Reason for error: ' + event.errorDescription);
    return;
  }
  var playerId = event.playerInfo.playerId;
  delete this.actions_[playerId];

  if (this.gameManager_.getConnectedPlayers().length == 0) {
    this.stateMachine_.goToState(
        cast.games.spellcast.messages.GameStateId.WAITING_FOR_PLAYERS);
  }
};


/** @override */
cast.games.spellcast.states.PlayerActionPhase.prototype.onExit =
    function(nextStateId) {
  // Regardless if the game is paused or not, these listeners must be removed
  // since they use state-specific callbacks.
  this.gameManager_.removeEventListener(
      cast.receiver.games.EventType.GAME_MESSAGE_RECEIVED,
      this.boundGameMessageCallback_);
  this.gameManager_.removeEventListener(
      cast.receiver.games.EventType.PLAYER_QUIT,
      this.boundPlayerQuitCallback_);
  this.gameManager_.removeEventListener(
      cast.receiver.games.EventType.PLAYER_DROPPED,
      this.boundPlayerQuitCallback_);
  this.gameManager_.removeEventListener(
      cast.receiver.games.EventType.PLAYER_IDLE,
      this.boundPlayerIdleCallback_);

  // Do not clean up if the game is paused, but do not process game manager
  // messages (so this line should be after the removeEventListener calls).
  if (nextStateId == cast.games.spellcast.messages.GameStateId.PAUSED) {
    return;
  }

  this.startTime_ = 0;
  this.game_.getWaitingPlayerActionDisplay().deactivate();
  this.actionManager_.reset();
};


/**
 * Handles when a player pauses.
 * @param {cast.receiver.games.Event} event
 * @private
 */
cast.games.spellcast.states.PlayerActionPhase.prototype.onPlayerIdle_ =
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
