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
goog.provide('cast.games.spellcast.states.WaitingForPlayersState');


goog.require('cast.games.spellcast.GameConstants');
goog.require('cast.games.spellcast.State');
goog.require('cast.games.spellcast.messages.DifficultySetting');
goog.require('cast.games.spellcast.messages.GameStateId');



/**
 * @param {!cast.games.spellcast.SpellcastGame} game
 * @param {!cast.games.spellcast.StateMachine} stateMachine
 * @constructor
 * @implements {cast.games.spellcast.State}
 */
cast.games.spellcast.states.WaitingForPlayersState = function(game,
    stateMachine) {
  /** @private {!cast.games.spellcast.SpellcastGame} */
  this.game_ = game;

  /** @private {!cast.receiver.games.GameManager} */
  this.gameManager_ = this.game_.getGameManager();

  /** @private {!cast.games.spellcast.StateMachine} */
  this.stateMachine_ = stateMachine;

  /** @private {number} */
  this.waitingForRandomAiDelay_ = 0;

  /**
   * A reusable array of ready players that is updated in #onUpdate.
   * @private {!Array.<!cast.receiver.games.PlayerInfo>}
   */
  this.readyPlayers_ = [];

  /**
   * The player ID of the host.
   * @private {?string}
   */
  this.hostPlayerId_ = null;

  /**
   * Pre-bound handler when a player becomes ready.
   * @private {function(!cast.receiver.games.Event)}
   */
  this.boundPlayerReadyCallback_ = this.onPlayerReady_.bind(this);

  /**
   * Pre-bound handler when a player starts playing.
   * @private {function(!cast.receiver.games.Event)}
   */
  this.boundPlayerPlayingCallback_ = this.onPlayerPlaying_.bind(this);
};


/** @override */
cast.games.spellcast.states.WaitingForPlayersState.prototype.onEnter =
    function(previousStateId) {
  // Do not show health displays and enemy in this state.
  this.game_.getEnemyHealthDisplay().deactivate();
  this.game_.getPartyHealthDisplay().deactivate();
  this.game_.getEnemy().deactivate();

  this.waitingForRandomAiDelay_ = Date.now() + 1000;
  this.game_.getLobbyDisplay().activate(this.game_.getTopLeftPosition());

  // Add any players that are ready.
  this.readyPlayers_ = this.gameManager_.getPlayersInState(
      cast.receiver.games.PlayerState.READY, this.readyPlayers_);
  for (var i = 0; i < this.readyPlayers_.length; i++) {
    var player = this.readyPlayers_[i];
    this.addPlayer_(player.playerId, player.playerData, i == 0);
  }

  // Listen to when a player is ready or starts playing.
  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.PLAYER_READY,
      this.boundPlayerReadyCallback_);
  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.PLAYER_PLAYING,
      this.boundPlayerPlayingCallback_);

  // The game is showing lobby screen and the lobby is open for new players.
  this.gameManager_.updateGameplayState(
      cast.receiver.games.GameplayState.SHOWING_INFO_SCREEN, null);
  this.gameManager_.updateLobbyState(cast.receiver.games.LobbyState.OPEN,
      null);
};


/** @override */
cast.games.spellcast.states.WaitingForPlayersState.prototype.onUpdate =
    function() {
  var now = Date.now();
  this.readyPlayers_ = this.gameManager_.getPlayersInState(
      cast.receiver.games.PlayerState.READY, this.readyPlayers_);
  var numberReadyPlayers = this.readyPlayers_.length;

  // Check if we need to update who is the game host.
  var hostPlayer = this.hostPlayerId_ ?
      this.gameManager_.getPlayer(this.hostPlayerId_) : null;
  if (hostPlayer && this.hostPlayerId_ && numberReadyPlayers > 0 &&
      hostPlayer.playerState != cast.receiver.games.PlayerState.READY) {
    this.updateHost_(this.readyPlayers_[0].playerId);
  }

  if (this.game_.randomAiEnabled && now > this.waitingForRandomAiDelay_) {
    if (numberReadyPlayers <
        cast.games.spellcast.GameConstants.MAX_PLAYERS) {
      this.game_.testCreatePlayer();
    } else {
      this.game_.testStartGame();
    }
    this.waitingForRandomAiDelay_ += 1000;
  }
};


/**
 * Handles when a player becomes ready.
 * @param {!cast.receiver.games.Event} event
 * @private
 */
cast.games.spellcast.states.WaitingForPlayersState.prototype.onPlayerReady_ =
    function(event) {
  if (event.statusCode != cast.receiver.games.StatusCode.SUCCESS) {
    console.log('Error: Event status code: ' + event.statusCode);
    console.log('Reason for error: ' + event.errorDescription);
    return;
  }
  if (this.readyPlayers_.length >
      cast.games.spellcast.GameConstants.MAX_PLAYERS) {
    return;
  }

  this.addPlayer_(event.playerInfo.playerId, event.requestExtraMessageData,
      this.readyPlayers_.length == 0);
};


/**
 * Handles when a player sends a playing message.
 * @param {!cast.receiver.games.Event} event
 * @private
 */
cast.games.spellcast.states.WaitingForPlayersState.prototype.onPlayerPlaying_ =
    function(event) {
  if (event.statusCode != cast.receiver.games.StatusCode.SUCCESS) {
    console.log('Error: Event status code: ' + event.statusCode);
    console.log('Reason for error: ' + event.errorDescription);
    return;
  }
  if (event.requestExtraMessageData) {
    var playerPlayingData =
        /** @type {!cast.games.spellcast.messages.PlayerPlayingData} */ (
            event.requestExtraMessageData);
    this.game_.setDifficultySetting(playerPlayingData.difficultySetting ||
        cast.games.spellcast.messages.DifficultySetting.EASY);
  }

  this.stateMachine_.goToState(
      cast.games.spellcast.messages.GameStateId.INSTRUCTIONS);
};


/**
 * Adds a player. Updates playerData with host flag.
 * @param {string} playerId
 * @param {Object} playerData
 * @param {boolean} isHost
 * @private
 */
cast.games.spellcast.states.WaitingForPlayersState.prototype.addPlayer_ =
    function(playerId, playerData, isHost) {
  if (isHost) {
    this.updateHost_(playerId, playerData);
  } else {
    playerData = playerData || {};
    playerData['host'] = false;
    this.gameManager_.updatePlayerData(playerId, playerData);
  }

  var parsedPlayerData =
      /** @type {!cast.games.spellcast.messages.PlayerReadyData} */ (
          playerData);

  var player = this.game_.createPlayer(
      /* id */ playerId,
      /* name */ parsedPlayerData.playerName || '???',
      /* avatarindex */ parsedPlayerData.avatarIndex);

  player.activate(player.lobbyPosition, /* showNameText */ true);
};


/**
 * Sets a player to become the host and updates the player data.
 * @param {string} newHostPlayerId
 * @param {Object=} opt_newHostPlayerData
 * @private
 */
cast.games.spellcast.states.WaitingForPlayersState.prototype.updateHost_ =
    function(newHostPlayerId, opt_newHostPlayerData) {
  if (newHostPlayerId == this.hostPlayerId_) {
    return;
  }

  if (newHostPlayerId != this.hostPlayerId_ && this.hostPlayerId_ &&
      this.gameManager_.isPlayerConnected(this.hostPlayerId_)) {
    var oldHostPlayer = this.gameManager_.getPlayer(this.hostPlayerId_);
    var oldHostPlayerData = oldHostPlayer.playerData || {};
    oldHostPlayerData['host'] = false;
    this.gameManager_.updatePlayerData(this.hostPlayerId_, oldHostPlayerData,
        /* opt_noBroadcastUpdate*/ false);
  }

  var newHostPlayerData = null;
  if (opt_newHostPlayerData) {
    newHostPlayerData = opt_newHostPlayerData;
  } else {
    var newHostPlayer = this.gameManager_.getPlayer(newHostPlayerId);
    newHostPlayerData = newHostPlayer.playerData || {};
  }
  newHostPlayerData['host'] = true;
  this.hostPlayerId_ = newHostPlayerId;
  this.gameManager_.updatePlayerData(this.hostPlayerId_, newHostPlayerData);
};


/** @override */
cast.games.spellcast.states.WaitingForPlayersState.prototype.onExit =
    function(nextStateId) {
  // Stop listening to player events in this state.
  this.gameManager_.removeEventListener(
      cast.receiver.games.EventType.PLAYER_READY,
      this.boundPlayerReadyCallback_);
  this.gameManager_.removeEventListener(
      cast.receiver.games.EventType.PLAYER_PLAYING,
      this.boundPlayerPlayingCallback_);

  // Update all ready players to playing state. Hide ready and playing players.
  var players = this.gameManager_.getPlayers();
  for (var i = 0; i < players.length; i++) {
    var playerState = players[i].playerState;
    if (playerState == cast.receiver.games.PlayerState.READY) {
      this.gameManager_.updatePlayerState(players[i].playerId,
          cast.receiver.games.PlayerState.PLAYING, null);
    }
    if (playerState == cast.receiver.games.PlayerState.READY ||
        playerState == cast.receiver.games.PlayerState.PLAYING) {
      this.game_.getPlayer(players[i].playerId).deactivate();
    }
  }

  // The lobby is now closed for new players.
  this.gameManager_.updateLobbyState(cast.receiver.games.LobbyState.CLOSED,
      null);
  this.game_.getLobbyDisplay().deactivate();
};
