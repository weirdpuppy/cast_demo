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
goog.provide('cast.games.spellcast.SpellcastGame');

goog.require('cast.games.common.receiver.Game');
goog.require('cast.games.spellcast.ActionManager');
goog.require('cast.games.spellcast.AudioManager');
goog.require('cast.games.spellcast.GameConstants');
goog.require('cast.games.spellcast.StateMachine');
goog.require('cast.games.spellcast.gameobjects.AttackSpell');
goog.require('cast.games.spellcast.gameobjects.ElementalEnemy');
goog.require('cast.games.spellcast.gameobjects.Explosion');
goog.require('cast.games.spellcast.gameobjects.FullScreenDisplay');
goog.require('cast.games.spellcast.gameobjects.HealthDisplay');
goog.require('cast.games.spellcast.gameobjects.LargeTextDisplay');
goog.require('cast.games.spellcast.gameobjects.Player');
goog.require('cast.games.spellcast.gameobjects.TextDisplay');
goog.require('cast.games.spellcast.messages.DifficultySetting');
goog.require('cast.games.spellcast.messages.GameData');
goog.require('cast.games.spellcast.messages.GameStateId');
goog.require('cast.games.spellcast.messages.PlayerMessage');
goog.require('cast.games.spellcast.messages.PlayerPlayingData');
goog.require('cast.games.spellcast.messages.PlayerReadyData');
goog.require('cast.games.spellcast.messages.Spell');
goog.require('cast.games.spellcast.messages.SpellAccuracy');
goog.require('cast.games.spellcast.messages.SpellElement');
goog.require('cast.games.spellcast.messages.SpellMessage');
goog.require('cast.games.spellcast.messages.SpellType');
goog.require('cast.games.spellcast.states.EnemyResolutionPhase');
goog.require('cast.games.spellcast.states.EnemyVictoryState');
goog.require('cast.games.spellcast.states.InstructionsState');
goog.require('cast.games.spellcast.states.PausedState');
goog.require('cast.games.spellcast.states.PlayerActionPhase');
goog.require('cast.games.spellcast.states.PlayerResolutionPhase');
goog.require('cast.games.spellcast.states.PlayerVictoryState');
goog.require('cast.games.spellcast.states.WaitingForPlayersState');



/**
 * Spellcast game.
 *
 * The game uses a state machine to transition between different states (e.g.
 * waiting for players in a lobby, showing instructions, waiting
 * for players to cast spells, showing the enemy attack, etc). Each state can
 * use game manager API events to respond to players (e.g. the lobby shows a
 * player on the screen when the game manager API PLAYER_READY event is fired).
 * Each state also uses an action manager to coordinate how game objects are
 * animated on the screen (e.g. moving a player forward and then move a spell
 * effect and then explode the spell on the enemy).
 *
 * @param {!cast.receiver.games.GameManager} gameManager
 * @constructor
 * @struct
 * @implements {cast.games.common.receiver.Game}
 * @export
 */
cast.games.spellcast.SpellcastGame = function(gameManager) {
  /** @private {!cast.receiver.games.GameManager} */
  this.gameManager_ = gameManager;

  /**
   * Debug only. Set this to true to make the game automatically add players and
   * play by itself with no senders. Useful when testing and debugging,
   * especially when running standalone on a local web server.
   * @public {boolean}
   */
  this.randomAiEnabled = false;

  /**
   * Debug only. Call debugUi.open() or close() to show and hide an overlay
   * showing game manager and player information while testing and debugging.
   * @public {cast.receiver.games.debug.DebugUI}
   */
  this.debugUi = new cast.receiver.games.debug.DebugUI(this.gameManager_);

  /** @private {number} */
  this.canvasWidth_ = window.innerWidth;

  /** @private {number} */
  this.canvasHeight_ = window.innerHeight;

  /** @private {function(number)} Pre-bound call to #update. */
  this.boundUpdateFunction_ = this.update_.bind(this);

  /**
   * Pre-bound call to #onPlayerQuit.
   * @private {function(cast.receiver.games.Event)}
   */
  this.boundPlayerQuitCallback_ = this.onPlayerQuit_.bind(this);

  /**
   * Pre-bound call to #onGameMessageReceived.
   * @private {function(cast.receiver.games.Event)}
   */
  this.boundGameMessageReceivedCallback_ =
      this.onGameMessageReceived_.bind(this);

  /** @private {boolean} */
  this.isLoaded_ = false;

  /** @private {boolean} */
  this.isRunning_ = false;

  /** @private {!cast.games.spellcast.AudioManager} */
  this.audioManager_ = new cast.games.spellcast.AudioManager();

  /** @private {!PIXI.Container} */
  this.container_ = new PIXI.Container();

  /** @private {!PIXI.WebGLRenderer} */
  this.renderer_ = new PIXI.WebGLRenderer(this.canvasWidth_,
      this.canvasHeight_, { transparent: true });

  /** @private {Element} */
  this.loadingImageElement_ = document.createElement('img');
  // Show the loading image once the loading image is loaded.
  this.loadingImageElement_.onload = (function() {
    if (!this.isLoaded_) {
      document.body.appendChild(this.loadingImageElement_);
    }
  }).bind(this);
  this.loadingImageElement_.src = 'assets/title.jpg';

  /** @private {!PIXI.loaders.Loader} */
  this.loader_ = new PIXI.loaders.Loader();
  this.loader_.add('assets/air_explosion.json');
  this.loader_.add('assets/earth_explosion.json');
  this.loader_.add('assets/fire_explosion.json');
  this.loader_.add('assets/water_explosion.json');
  this.loader_.add('assets/heal.png');
  this.loader_.add('assets/wizards.json');
  this.loader_.add('assets/air_attack.json');
  this.loader_.add('assets/earth_attack.json');
  this.loader_.add('assets/fire_attack.json');
  this.loader_.add('assets/water_attack.json');
  this.loader_.add('assets/air_elemental_idle.json');
  this.loader_.add('assets/earth_elemental_idle.json');
  this.loader_.add('assets/fire_elemental_idle.json');
  this.loader_.add('assets/water_elemental_idle.json');
  this.loader_.add('assets/air_elemental_attack.json');
  this.loader_.add('assets/earth_elemental_attack.json');
  this.loader_.add('assets/fire_elemental_attack.json');
  this.loader_.add('assets/water_elemental_attack.json');
  this.loader_.add('assets/air_elemental_hit.json');
  this.loader_.add('assets/earth_elemental_hit.json');
  this.loader_.add('assets/fire_elemental_hit.json');
  this.loader_.add('assets/water_elemental_hit.json');
  this.loader_.add('assets/red_meter_bar.json');
  this.loader_.add('assets/green_meter_bar.json');
  this.loader_.add('assets/bg_meter_bar.json');
  this.loader_.add('assets/shield.png');
  this.loader_.add('assets/blank_tile.png');

  // When all fullscreen assets are loaded, complete PIXI asset loading.
  cast.games.spellcast.gameobjects.FullScreenDisplay.loadImages([
    'assets/background.jpg',
    'assets/lobby_text.png',
    'assets/win_text.png',
    'assets/lose_text.png',
    'assets/instructions_text.png',
    'assets/paused_text.png'
  ]).then((function() {
    this.loader_.once('complete', this.onAssetsLoaded_.bind(this));
  }).bind(this));

  /** @private {?function()} Callback used with #run. */
  this.loadedCallback_ = null;

  /** @private {!Array.<string>} */
  this.PLAYER_ASSETS_ = [
    'wizard_1.png',
    'wizard_2.png',
    'wizard_3.png',
    'wizard_4.png'
  ];

  /** @private {!Array.<!PIXI.Point>} Normalized player lobby positions. */
  this.PLAYER_LOBBY_POSITIONS_ = [
    new PIXI.Point(0.2, 0.81),
    new PIXI.Point(0.4, 0.81),
    new PIXI.Point(0.6, 0.81),
    new PIXI.Point(0.8, 0.81)
  ];

  /** @private {!Array.<!PIXI.Point>} Normalized player battle positions. */
  this.PLAYER_BATTLE_POSITIONS_ = [
    new PIXI.Point(0.234375, 0.657778),
    new PIXI.Point(0.382811, 0.69111),
    new PIXI.Point(0.29609375, 0.7675),
    new PIXI.Point(0.1875, 0.80499)
  ];

  /** @private {cast.games.spellcast.gameobjects.FullScreenDisplay} */
  this.battlefieldDisplay_ = null;

  /** @private {cast.games.spellcast.gameobjects.FullScreenDisplay} */
  this.lobbyDisplay_ = null;

  /** @private {cast.games.spellcast.gameobjects.FullScreenDisplay} */
  this.playerVictoryDisplay_ = null;

  /** @private {cast.games.spellcast.gameobjects.FullScreenDisplay} */
  this.enemyVictoryDisplay_ = null;

  /** @private {cast.games.spellcast.gameobjects.FullScreenDisplay} */
  this.instructionsDisplay_ = null;

  /** @private {cast.games.spellcast.gameobjects.FullScreenDisplay} */
  this.pausedDisplay_ = null;

  /** @private {!Array.<!cast.games.spellcast.gameobjects.Player>} */
  this.playerPool_ = [];

  /** @private {!Array.<!PIXI.Texture>} Pool of player textures. */
  this.playerTextures_ = [];

  /** @private {cast.games.spellcast.gameobjects.HealthDisplay} */
  this.partyHealthDisplay_ = null;

  /** @private {!PIXI.Point} Used to position the party health display. */
  this.partyHealthDisplayPos_ = new PIXI.Point(0.05, 0.05);

  /** @private {cast.games.spellcast.gameobjects.Enemy} */
  this.enemy_ = null;

  /** @private {cast.games.spellcast.gameobjects.HealthDisplay} */
  this.enemyHealthDisplay_ = null;

  /** @private {!PIXI.Point} Used to position the enemy health display. */
  this.enemyHealthDisplayPos_ = new PIXI.Point(0.6, 0.05);

  /** @private {cast.games.spellcast.gameobjects.LargeTextDisplay} */
  this.countdownPlayerActionDisplay_ = null;

  /** @private {cast.games.spellcast.gameobjects.TextDisplay} */
  this.waitingPlayerActionDisplay_ = null;

  /**
   * A map of spell elements to attack spells.
   * @private {!Object.<!cast.games.spellcast.messages.SpellElement,
   *     !cast.games.spellcast.gameobjects.AttackSpell>}
   */
  this.attackSpells_ = Object.create(null);

  /** @private {cast.games.spellcast.gameobjects.AttackSpell} */
  this.currentAttackSpell_ = null;

  /**
   * The amount of damage absorbed by the current party shield. 0 if no party
   * shield is active.
   * @private {number}
   */
  this.partyShieldValue_ = 0;

  /**
   * Incremented every time a player casts shield and reset at the end of the
   * player resolution phase.
   * @private {number}
   */
  this.numberOfShieldSpellsCastThisRound_ = 0;

  /**
   * A map of spell elements to explosions.
   * @private {!Object.<!cast.games.spellcast.messages.SpellElement,
   *     !cast.games.spellcast.gameobjects.Explosion>}
   */
  this.explosions_ = Object.create(null);

  /** @private {cast.games.spellcast.gameobjects.Explosion} */
  this.currentExplosion_ = null;

  /** @private {!cast.games.spellcast.messages.DifficultySetting} */
  this.gameDifficulty_ = cast.games.spellcast.messages.DifficultySetting.EASY;

  /** @private {!PIXI.Point} Re-usable top-left corner position. */
  this.topLeftPosition_ = new PIXI.Point(0, 0);

  /** @private {number} Current health of the party. */
  this.partyHealth_ = -1;

  /** @private {number} Max health of the party of players. */
  this.partyMaxHealth_ = -1;

  /** @private {number} Current health of the enemy. */
  this.enemyHealth_ = -1;

  /** @private {number} Max health of the enemy. */
  this.enemyMaxHealth_ = -1;

  /** @private {!cast.games.spellcast.messages.SpellElement} */
  this.enemyElement_ = cast.games.spellcast.messages.SpellElement.NONE;

  /**
   * A map from player ids, to their assigned bonus for this round.
   * @private {!Object.<string, !cast.games.spellcast.messages.PlayerBonus>}
   */
  this.playerBonus_ = Object.create(null);

  /** @private {PIXI.Sprite} */
  this.playerHealCastingSprite_ = null;

  /** @private {PIXI.Sprite} */
  this.playerShieldCastingSprite_ = null;

  /** @private {!cast.games.spellcast.ActionManager} */
  this.actionManager_ = new cast.games.spellcast.ActionManager(this);

  /** @private {number} */
  this.lastTime_ = 0;

  /**
   * Maps player IDs to spellcast player objects.
   * @private {!Object.<string, !cast.games.spellcast.gameobjects.Player>}
   */
  this.playerMap_ = Object.create(null);

  /**
   * A re-used list of players in the playing state updated by calls to
   * {@code cast.receiver.games.GameManager.getPlayersInState}.
   * @private {!Array.<!cast.receiver.games.PlayerInfo>}
   */
  this.playingPlayers_ = [];

  /**
   * Game data shared with players by the game manager.
   * @private {!cast.games.spellcast.messages.GameData}
   */
  this.gameData_ = new cast.games.spellcast.messages.GameData();

  /**
   * A reusable message sent to players. See #assignBonusesAndNotifyPlayers.
   * @private {!cast.games.spellcast.messages.PlayerMessage}
   */
  this.playerMessage_ = new cast.games.spellcast.messages.PlayerMessage();

  /** @private {!cast.games.spellcast.StateMachine} */
  this.stateMachine_ = new cast.games.spellcast.StateMachine(this);
  this.stateMachine_.addState(
      cast.games.spellcast.messages.GameStateId.WAITING_FOR_PLAYERS,
      new cast.games.spellcast.states.WaitingForPlayersState(this,
          this.stateMachine_));
  this.stateMachine_.addState(
      cast.games.spellcast.messages.GameStateId.INSTRUCTIONS,
      new cast.games.spellcast.states.InstructionsState(this,
          this.stateMachine_, this.actionManager_));
  this.stateMachine_.addState(
      cast.games.spellcast.messages.GameStateId.PLAYER_ACTION,
      new cast.games.spellcast.states.PlayerActionPhase(this,
          this.stateMachine_, this.actionManager_));
  this.stateMachine_.addState(
      cast.games.spellcast.messages.GameStateId.PLAYER_RESOLUTION,
      new cast.games.spellcast.states.PlayerResolutionPhase(this,
          this.stateMachine_, this.actionManager_));
  this.stateMachine_.addState(
      cast.games.spellcast.messages.GameStateId.ENEMY_RESOLUTION,
      new cast.games.spellcast.states.EnemyResolutionPhase(this,
          this.stateMachine_, this.actionManager_));
  this.stateMachine_.addState(
      cast.games.spellcast.messages.GameStateId.PLAYER_VICTORY,
      new cast.games.spellcast.states.PlayerVictoryState(this,
          this.stateMachine_, this.actionManager_));
  this.stateMachine_.addState(
      cast.games.spellcast.messages.GameStateId.ENEMY_VICTORY,
      new cast.games.spellcast.states.EnemyVictoryState(this,
          this.stateMachine_, this.actionManager_));
  this.stateMachine_.addState(
      cast.games.spellcast.messages.GameStateId.PAUSED,
      new cast.games.spellcast.states.PausedState(this,
          this.stateMachine_, this.actionManager_));
};


/**
 * Runs the game. Game should load if not loaded yet.
 * @param {function()} loadedCallback This function will be called when the game
 *     finishes loading or is already loaded and about to actually run.
 * @export
 */
cast.games.spellcast.SpellcastGame.prototype.run = function(loadedCallback) {
  // If the game is already running, return immediately.
  if (this.isRunning_) {
    loadedCallback();
    return;
  }

  // Start loading if game not loaded yet.
  this.loadedCallback_ = loadedCallback;
  if (!this.isLoaded_) {
    this.loader_.load();
    return;
  }

  // Start running.
  this.start_();
};


/**
 * Stops the game.
 * @export
 */
cast.games.spellcast.SpellcastGame.prototype.stop = function() {
  if (this.loadedCallback_ || !this.isRunning_) {
    this.loadedCallback_ = null;
    return;
  }

  this.audioManager_.pauseBackgroundMusic();

  this.isRunning_ = false;
  document.body.removeChild(this.renderer_.view);

  this.gameManager_.removeEventListener(
      cast.receiver.games.EventType.PLAYER_QUIT,
      this.boundPlayerQuitCallback_);
  this.gameManager_.removeEventListener(
      cast.receiver.games.EventType.PLAYER_DROPPED,
      this.boundPlayerQuitCallback_);
};


/**
 * Adds the renderer and run the game. Calls loaded callback passed to #run.
 * @private
 */
cast.games.spellcast.SpellcastGame.prototype.start_ = function() {
  // If callback is null, the game was stopped already.
  if (!this.loadedCallback_) {
    return;
  }

  this.audioManager_.playBackgroundMusic();

  document.body.removeChild(this.loadingImageElement_);
  this.renderer_.view.style.position = 'absolute';
  this.renderer_.view.style.left = '0';
  this.renderer_.view.style.top = '0';
  document.body.appendChild(this.renderer_.view);
  this.isRunning_ = true;
  this.gameManager_.updateGameplayState(
      cast.receiver.games.GameplayState.RUNNING, null);

  requestAnimationFrame(this.boundUpdateFunction_);

  this.loadedCallback_();
  this.loadedCallback_ = null;

  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.GAME_MESSAGE_RECEIVED,
      this.boundGameMessageReceivedCallback_);
  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.PLAYER_QUIT,
      this.boundPlayerQuitCallback_);
  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.PLAYER_DROPPED,
      this.boundPlayerQuitCallback_);
};


/**
 * Updates the game on each animation frame.
 * @param {number} timestamp
 * @private
 */
cast.games.spellcast.SpellcastGame.prototype.update_ = function(timestamp) {
  if (!this.isRunning_) {
    return;
  }

  requestAnimationFrame(this.boundUpdateFunction_);

  var deltaTime = this.lastTime_ ? timestamp - this.lastTime_ : 0;
  // Clamp deltaTime between 10-20 fps to reduce jitter.
  if (deltaTime > 100) {
    deltaTime = 100;
  } else if (deltaTime < 50) {
    deltaTime = 50;
  }
  this.lastTime_ = timestamp;

  this.stateMachine_.update();

  // If the game is paused, do not update any game objects and timed actions.
  // Just render the stage as-is.
  if (this.gameManager_.getGameplayState() ==
      cast.receiver.games.GameplayState.PAUSED) {
    this.renderer_.render(this.container_);
    return;
  }

  this.actionManager_.update();

  this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING,
      this.playingPlayers_);
  for (var i = 0; i < this.playingPlayers_.length; i++) {
    var player = this.playerMap_[this.playingPlayers_[i].playerId];
    if (player && player.active) {
      player.update(deltaTime);
    }
  }

  if (this.currentExplosion_ && this.currentExplosion_.active) {
    this.currentExplosion_.update(deltaTime);
  }

  if (this.currentAttackSpell_ && this.currentAttackSpell_.active) {
    this.currentAttackSpell_.update(deltaTime);
  }

  if (this.partyHealthDisplay_ && this.partyHealthDisplay_.active) {
    this.partyHealthDisplay_.update(deltaTime);
  }

  if (this.enemy_) {
    this.enemy_.update(deltaTime);
  }

  if (this.enemyHealthDisplay_ && this.enemyHealthDisplay_.active) {
    this.enemyHealthDisplay_.update(deltaTime);
  }

  if (this.countdownPlayerActionDisplay_ &&
      this.countdownPlayerActionDisplay_.active) {
    this.countdownPlayerActionDisplay_.update(deltaTime);
  }

  if (this.waitingPlayerActionDisplay_ &&
      this.waitingPlayerActionDisplay_.active) {
    this.waitingPlayerActionDisplay_.update(deltaTime);
  }

  this.renderer_.render(this.container_);
};


/**
 * Called when all assets are loaded.
 * @private
 */
cast.games.spellcast.SpellcastGame.prototype.onAssetsLoaded_ = function() {
  this.audioManager_.loadAllAudio();

  // Set up sprites shown over players casting spells.
  this.playerHealCastingSprite_ =
      PIXI.Sprite.fromImage('assets/heal.png');
  this.playerShieldCastingSprite_ =
      PIXI.Sprite.fromImage('assets/shield.png');

  // Set up game objects from furthest in background to furthest in foreground.

  // Displays battlefield background.
  this.battlefieldDisplay_ =
      new cast.games.spellcast.gameobjects.FullScreenDisplay(
          'assets/background.jpg', 1.0);

  // Displays lobby screen.
  this.lobbyDisplay_ =
      new cast.games.spellcast.gameobjects.FullScreenDisplay(
          'assets/background.jpg', 1.0, 'assets/lobby_text.png');

  // Displays player victory screen.
  this.playerVictoryDisplay_ =
      new cast.games.spellcast.gameobjects.FullScreenDisplay(
          'assets/background.jpg', 1.3, 'assets/win_text.png',
          new PIXI.Rectangle(0, 0, 718, 219));

  // Displays enemy victory screen.
  this.enemyVictoryDisplay_ =
      new cast.games.spellcast.gameobjects.FullScreenDisplay(
          'assets/background.jpg', 0.5, 'assets/lose_text.png',
          new PIXI.Rectangle(0, 0, 837, 220));

  // Displays the instructions screen.
  this.instructionsDisplay_ =
      new cast.games.spellcast.gameobjects.FullScreenDisplay(
          'assets/background.jpg', 1.0, 'assets/instructions_text.png');

  // Set up pool of players. Assumes MAX_PLAYERS is <= PLAYER_ASSETS_ length.
  if (this.PLAYER_ASSETS_.length <
      cast.games.spellcast.GameConstants.MAX_PLAYERS) {
    throw new Error('Not enough player assets available!');
  }
  for (var i = 0; i < cast.games.spellcast.GameConstants.MAX_PLAYERS; i++) {
    this.playerTextures_.push(PIXI.Texture.fromImage(this.PLAYER_ASSETS_[i]));
    var player = new cast.games.spellcast.gameobjects.Player(
        this.PLAYER_LOBBY_POSITIONS_[i], this.PLAYER_BATTLE_POSITIONS_[i],
        new PIXI.Sprite(this.playerTextures_[i]),
        this.container_, this.canvasWidth_, this.canvasHeight_);
    this.playerPool_.push(player);
  }

  // Set up enemies.
  this.enemy_ = new cast.games.spellcast.gameobjects.ElementalEnemy(
      this.container_, this.canvasWidth_, this.canvasHeight_);

  // Explosion and attack spell should be on top of players and enemies.
  this.explosions_[cast.games.spellcast.messages.SpellElement.AIR] =
      new cast.games.spellcast.gameobjects.Explosion('air_explosion', 12,
          this.container_, this.canvasWidth_, this.canvasHeight_,
          this.audioManager_);
  this.explosions_[cast.games.spellcast.messages.SpellElement.EARTH] =
      new cast.games.spellcast.gameobjects.Explosion('earth_explosion', 12,
          this.container_, this.canvasWidth_, this.canvasHeight_,
          this.audioManager_);
  this.explosions_[cast.games.spellcast.messages.SpellElement.FIRE] =
      new cast.games.spellcast.gameobjects.Explosion('fire_explosion', 12,
          this.container_, this.canvasWidth_, this.canvasHeight_,
          this.audioManager_);
  this.explosions_[cast.games.spellcast.messages.SpellElement.WATER] =
      new cast.games.spellcast.gameobjects.Explosion('water_explosion', 12,
          this.container_, this.canvasWidth_, this.canvasHeight_,
          this.audioManager_);

  this.attackSpells_[cast.games.spellcast.messages.SpellElement.AIR] =
      new cast.games.spellcast.gameobjects.AttackSpell('air_attack', 11,
          this.container_, this.canvasWidth_, this.canvasHeight_);
  this.attackSpells_[cast.games.spellcast.messages.SpellElement.EARTH] =
      new cast.games.spellcast.gameobjects.AttackSpell('earth_attack', 11,
          this.container_, this.canvasWidth_, this.canvasHeight_);
  this.attackSpells_[cast.games.spellcast.messages.SpellElement.FIRE] =
      new cast.games.spellcast.gameobjects.AttackSpell('fire_attack', 11,
          this.container_, this.canvasWidth_, this.canvasHeight_);
  this.attackSpells_[cast.games.spellcast.messages.SpellElement.WATER] =
      new cast.games.spellcast.gameobjects.AttackSpell('water_attack', 11,
          this.container_, this.canvasWidth_, this.canvasHeight_);

  // These displays should be on top of everything.
  this.partyHealthDisplay_ = new cast.games.spellcast.gameobjects.HealthDisplay(
      this.container_, this.canvasWidth_, this.canvasHeight_);

  this.enemyHealthDisplay_ = new cast.games.spellcast.gameobjects.HealthDisplay(
      this.container_, this.canvasWidth_, this.canvasHeight_);

  this.waitingPlayerActionDisplay_ =
      new cast.games.spellcast.gameobjects.TextDisplay();
  this.countdownPlayerActionDisplay_ =
      new cast.games.spellcast.gameobjects.LargeTextDisplay();

  // Displays the paused screen on top of everything.
  this.pausedDisplay_ =
      new cast.games.spellcast.gameobjects.FullScreenDisplay(
          'assets/background.jpg', 0.5, 'assets/paused_text.png');

  this.start_();
  this.stateMachine_.goToState(
      cast.games.spellcast.messages.GameStateId.WAITING_FOR_PLAYERS);
};


/**
 * @return {!cast.receiver.games.GameManager} The game manager.
 */
cast.games.spellcast.SpellcastGame.prototype.getGameManager = function() {
  return this.gameManager_;
};


/** @return {!cast.games.spellcast.AudioManager} The audio manager. */
cast.games.spellcast.SpellcastGame.prototype.getAudioManager = function() {
  return this.audioManager_;
};


/**
 * @return {cast.games.spellcast.gameobjects.HealthDisplay} The party health
 *     display.
 */
cast.games.spellcast.SpellcastGame.prototype.getPartyHealthDisplay =
    function() {
  return this.partyHealthDisplay_;
};


/**
 * @return {cast.games.spellcast.gameobjects.HealthDisplay} The enemy health
 *     display.
 */
cast.games.spellcast.SpellcastGame.prototype.getEnemyHealthDisplay =
    function() {
  return this.enemyHealthDisplay_;
};


/**
 * @return {cast.games.spellcast.gameobjects.LargeTextDisplay} The countdown
 *     display.
 */
cast.games.spellcast.SpellcastGame.prototype.getCountdownPlayerActionDisplay =
    function() {
  return this.countdownPlayerActionDisplay_;
};


/**
 * @return {cast.games.spellcast.gameobjects.TextDisplay} The waiting for player
 *     action display.
 */
cast.games.spellcast.SpellcastGame.prototype.getWaitingPlayerActionDisplay =
    function() {
  return this.waitingPlayerActionDisplay_;
};


/**
 * @return {cast.games.spellcast.gameobjects.FullScreenDisplay} The lobby
 *     display.
 */
cast.games.spellcast.SpellcastGame.prototype.getLobbyDisplay = function() {
  return this.lobbyDisplay_;
};


/**
 * @return {cast.games.spellcast.gameobjects.FullScreenDisplay} Player victory
 *     display.
 */
cast.games.spellcast.SpellcastGame.prototype.getPlayerVictoryDisplay =
    function() {
  return this.playerVictoryDisplay_;
};


/**
 * @return {cast.games.spellcast.gameobjects.FullScreenDisplay} Enemy victory
 *     display.
 */
cast.games.spellcast.SpellcastGame.prototype.getEnemyVictoryDisplay =
    function() {
  return this.enemyVictoryDisplay_;
};


/**
 * @return {cast.games.spellcast.gameobjects.FullScreenDisplay} The instructions
 *     display.
 */
cast.games.spellcast.SpellcastGame.prototype.getInstructionsDisplay =
    function() {
  return this.instructionsDisplay_;
};


/**
 * @return {cast.games.spellcast.gameobjects.FullScreenDisplay} The paused
 *     display.
 */
cast.games.spellcast.SpellcastGame.prototype.getPausedDisplay = function() {
  return this.pausedDisplay_;
};


/**
 * @return {cast.games.spellcast.gameobjects.FullScreenDisplay} The battlefield
 *     display.
 */
cast.games.spellcast.SpellcastGame.prototype.getBattlefieldDisplay =
    function() {
  return this.battlefieldDisplay_;
};


/** @return {!PIXI.Point} Returns top left corner position. */
cast.games.spellcast.SpellcastGame.prototype.getTopLeftPosition =
    function() {
  return this.topLeftPosition_;
};


/** @return {cast.games.spellcast.gameobjects.Enemy} The current enemy. */
cast.games.spellcast.SpellcastGame.prototype.getEnemy = function() {
  return this.enemy_;
};


/**
 * Sets the current attack spell to the specified spell element. Deactivates any
 * previous attack spell.
 * @param {cast.games.spellcast.messages.SpellElement} spellElement
 * @return {!cast.games.spellcast.gameobjects.AttackSpell} The current attack
 *     spell.
 */
cast.games.spellcast.SpellcastGame.prototype.setCurrentAttackSpellElement =
    function(spellElement) {
  var newAttackSpell = this.attackSpells_[spellElement];
  if (!newAttackSpell) {
    throw Error('No attack spell found for element ' + spellElement);
  }

  if (newAttackSpell == this.currentAttackSpell_) {
    return this.currentAttackSpell_;
  }

  if (this.currentAttackSpell_) {
    this.currentAttackSpell_.deactivate();
  }
  this.currentAttackSpell_ = newAttackSpell;
  return this.currentAttackSpell_;
};


/**
 * @return {cast.games.spellcast.gameobjects.AttackSpell} The current attack
 *     spell.
 */
cast.games.spellcast.SpellcastGame.prototype.getCurrentAttackSpell =
    function() {
  return this.currentAttackSpell_;
};


/**
 * Sets the current explosion to the specified spell element. Deactivates any
 * previous explosion.
 * @param {cast.games.spellcast.messages.SpellElement} spellElement
 * @return {!cast.games.spellcast.gameobjects.Explosion} The current explosion.
 */
cast.games.spellcast.SpellcastGame.prototype.setCurrentExplosionSpellElement =
    function(spellElement) {
  var newExplosion = this.explosions_[spellElement];
  if (!newExplosion) {
    throw Error('No explosion found for element ' + spellElement);
  }

  if (newExplosion == this.currentExplosion_) {
    return this.currentExplosion_;
  }

  if (this.currentExplosion_) {
    this.currentExplosion_.deactivate();
  }
  this.currentExplosion_ = newExplosion;
  return this.currentExplosion_;
};


/** @return {PIXI.Sprite} The sprite from player casting heal. */
cast.games.spellcast.SpellcastGame.prototype.getPlayerHealCastingSprite =
    function() {
  return this.playerHealCastingSprite_;
};


/** @return {PIXI.Sprite} The sprite from player casting shield. */
cast.games.spellcast.SpellcastGame.prototype.getPlayerShieldCastingSprite =
    function() {
  return this.playerShieldCastingSprite_;
};


/**
 * Returns a spellcast player.
 * @param {string} playerId The player ID of the spellcast player object.
 * @return {!cast.games.spellcast.gameobjects.Player} The spellcast player.
 */
cast.games.spellcast.SpellcastGame.prototype.getPlayer = function(playerId) {
  var player = this.playerMap_[playerId];
  if (!player) {
    throw Error('Unknown player with id: ' + playerId);
  }
  return player;
};


/**
 * Removes a spellcast player.
 * @param {string} playerId The player ID of the spellcast player object.
 * @private
 */
cast.games.spellcast.SpellcastGame.prototype.removePlayer_ =
    function(playerId) {
  var player = this.getPlayer(playerId);
  delete this.playerMap_[playerId];
  player.deactivate();
  this.playerPool_.push(player);
};


/**
 * Creates a new spellcast player object.
 * @param {string} playerId The player ID.
 * @param {string} name The name to show on the player.
 * @param {number} avatarAssetIndex Avatar index for the player, starts from 0.
 * @return {cast.games.spellcast.gameobjects.Player}
 */
cast.games.spellcast.SpellcastGame.prototype.createPlayer =
    function(playerId, name, avatarAssetIndex) {
  if (this.playerPool_.length <= 0) {
    console.error('Cannot create a new player, ran out of sprites.');
    return null;
  }

  var existingPlayer = this.playerMap_[playerId];
  if (existingPlayer) {
    existingPlayer.sprite.alpha = 1.0;
    existingPlayer.sprite.texture = this.playerTextures_[avatarAssetIndex];
    return existingPlayer;
  }

  var newPlayer = this.playerPool_.shift();
  if (avatarAssetIndex < 0 || avatarAssetIndex >= this.playerTextures_.length) {
    console.error('Invalid avatarIndex : ' + avatarAssetIndex);
    avatarAssetIndex = 0;
  }
  newPlayer.sprite.alpha = 1.0;
  newPlayer.sprite.texture = this.playerTextures_[avatarAssetIndex];

  newPlayer.setPlayerIdAndName(playerId, name);
  this.playerMap_[playerId] = newPlayer;
  return newPlayer;
};


/**
 * Selects a random element for the enemy and update the enemy.
 * @return {!cast.games.spellcast.messages.SpellElement} The enemy's element.
 */
cast.games.spellcast.SpellcastGame.prototype.selectEnemyElement = function() {
  this.enemyElement_ = this.getRandomElement();
  this.enemy_.activate(this.enemy_.getIdleAnimation(this.enemyElement_));
  return this.enemyElement_;
};


/**
 * @return {!cast.games.spellcast.messages.SpellElement} The enemy's currently
 *     selected element.
 */
cast.games.spellcast.SpellcastGame.prototype.getEnemyElement = function() {
  return this.enemyElement_;
};


/**
 * Selects a random player bonus element for each player and notify each player.
 */
cast.games.spellcast.SpellcastGame.prototype.assignBonusesAndNotifyPlayers =
    function() {
  this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING,
      this.playingPlayers_);
  var keys = Object.keys(this.playerBonus_);
  for (var i = 0; i < keys.length; i++) {
    delete this.playerBonus_[keys[i]];
  }
  for (var i = 0; i < this.playingPlayers_.length; i++) {
    var playerId = this.playingPlayers_[i].playerId;
    var playerBonus = this.getRandomPlayerBonus();
    this.playerBonus_[playerId] = playerBonus;
    this.playerMessage_.playerBonus = playerBonus;
    this.playerMessage_.castSpellsDurationMillis =
        cast.games.spellcast.GameConstants.
            DIFFICULTY_ACTION_PHASE_DURATION_MAP[this.gameDifficulty_];
    this.gameManager_.sendGameMessageToPlayer(playerId, this.playerMessage_);
  }
};


/**
 * Return the player bonus for a given player ID for this round.
 * @param {string} playerId
 * @return {!cast.games.spellcast.messages.PlayerBonus}
 */
cast.games.spellcast.SpellcastGame.prototype.getPlayerBonus =
    function(playerId) {
  return this.playerBonus_[playerId];
};


/**
 * Initializes the game world for a new encounter.
 */
cast.games.spellcast.SpellcastGame.prototype.setupWorld = function() {
  this.battlefieldDisplay_.activate(this.topLeftPosition_);

  this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING,
      this.playingPlayers_);

  // Place health displays above background and enemy.
  this.partyMaxHealth_ = cast.games.spellcast.GameConstants.
      PARTY_INITIAL_HEALTH_MAP[this.playingPlayers_.length];
  this.partyHealthDisplay_.deactivate();
  this.partyHealthDisplay_.activate(this.partyHealthDisplayPos_);
  this.partyHealthDisplay_.configure(this.partyMaxHealth_);
  this.setPartyHealth(this.partyMaxHealth_);

  this.enemyMaxHealth_ = cast.games.spellcast.GameConstants.
      ENEMY_INITIAL_HEALTH_MAP[this.playingPlayers_.length];
  this.enemyHealthDisplay_.deactivate();
  this.enemyHealthDisplay_.activate(this.enemyHealthDisplayPos_);
  this.enemyHealthDisplay_.configure(this.enemyMaxHealth_);
  this.setEnemyHealth(this.enemyMaxHealth_);
};


/** Increments the number of shield spells cast this round. */
cast.games.spellcast.SpellcastGame.prototype.
    addNumberOfShieldSpellsCastThisRound = function() {
  this.numberOfShieldSpellsCastThisRound_++;
};


/** @return {number} The number of shield spells cast this round. */
cast.games.spellcast.SpellcastGame.prototype.
    getNumberOfShieldSpellsCastThisRound = function() {
  return this.numberOfShieldSpellsCastThisRound_;
};


/** Resets the number of shield spells cast this round. */
cast.games.spellcast.SpellcastGame.prototype.
    resetNumberOfShieldSpellsCastThisRound = function() {
  this.numberOfShieldSpellsCastThisRound_ = 0;
};


/**
 * Enable shields for all players.
 * @param {number} value The number of hitpoints absorbed by this shield.
 * @param {number} alpha Alpha applied to all player shield sprites.
 * @param {number} tint Tint applied to all player shield sprites.
 */
cast.games.spellcast.SpellcastGame.prototype.enablePartyShield = function(value,
    alpha, tint) {

  if (value < 1) {
    throw Error('Tried to set shield with invalid value: ' + value + '.');
  }

  if (value == this.partyShieldValue_) {
    return;
  }

  this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING,
      this.playingPlayers_);
  for (var i = 0; i < this.playingPlayers_.length; i++) {
    var player = this.playerMap_[this.playingPlayers_[i].playerId];
    player.enableShield(alpha, tint);
  }
  this.partyShieldValue_ = value;
};


/** @return {number} The current party shield value. */
cast.games.spellcast.SpellcastGame.prototype.getPartyShieldValue = function() {
  return this.partyShieldValue_;
};


/**
 * Disable shields for all players.
 */
cast.games.spellcast.SpellcastGame.prototype.disablePartyShield = function() {
  if (this.partyShieldValue_ == 0) {
    return;
  }

  this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING,
      this.playingPlayers_);
  for (var i = 0; i < this.playingPlayers_.length; i++) {
    var player = this.playerMap_[this.playingPlayers_[i].playerId];
    player.disableShield();
  }
  this.partyShieldValue_ = 0;
};


/**
 * Enable heals for all players.
 * @param {number} scale X and Y scaling applied on all player heal sprites.
 */
cast.games.spellcast.SpellcastGame.prototype.enableHeal = function(scale) {
  this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING,
      this.playingPlayers_);
  for (var i = 0; i < this.playingPlayers_.length; i++) {
    var player = this.playerMap_[this.playingPlayers_[i].playerId];
    player.enableHeal(scale);
  }
};


/**
 * Disable heals for all players.
 */
cast.games.spellcast.SpellcastGame.prototype.disableHeal = function() {
  this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING,
      this.playingPlayers_);
  for (var i = 0; i < this.playingPlayers_.length; i++) {
    var player = this.playerMap_[this.playingPlayers_[i].playerId];
    player.disableHeal();
  }
};


/**
 * Returns the current health value for the player party.
 * @return {number} The health value.
 */
cast.games.spellcast.SpellcastGame.prototype.getPartyHealth = function() {
  return this.partyHealth_;
};


/**
 * Sets the current health value for the player party, making sure it stays
 * between 0 and partyMaxHealth_.
 * @param {number} value The new health value.
 * @return {number} The new health value.
 */
cast.games.spellcast.SpellcastGame.prototype.setPartyHealth = function(value) {
  this.partyHealth_ = value;
  if (this.partyHealth_ > this.partyMaxHealth_) {
    this.partyHealth_ = this.partyMaxHealth_;
  }
  if (this.partyHealth_ < 0) {
    this.partyHealth_ = 0;
  }

  this.partyHealthDisplay_.updateHealth(this.partyHealth_);
  return this.partyHealth_;
};


/**
 * Updates the current health value for the player party, making sure it stays
 * between 0 and #partyMaxHealth_.
 * @param {number} delta The delta to be applied to the current value.
 * @return {number} The new health value.
 */
cast.games.spellcast.SpellcastGame.prototype.updatePartyHealth =
    function(delta) {
  return this.setPartyHealth(this.partyHealth_ + delta);
};


/**
 * Returns the current health value for the enemy.
 * @return {number} The health value.
 */
cast.games.spellcast.SpellcastGame.prototype.getEnemyHealth = function() {
  return this.enemyHealth_;
};


/**
 * Sets the current health value for the enemy, making sure it stays
 * between 0 and #enemyMaxHealth_.
 * @param {number} value he new health value.
 * @return {number} The new health value.
 */
cast.games.spellcast.SpellcastGame.prototype.setEnemyHealth = function(value) {
  this.enemyHealth_ = value;
  if (this.enemyHealth_ > this.enemyMaxHealth_) {
    this.enemyHealth_ = this.enemyMaxHealth_;
  }
  if (this.enemyHealth_ < 0) {
    this.enemyHealth_ = 0;
  }

  this.enemyHealthDisplay_.updateHealth(this.enemyHealth_);
  return this.enemyHealth_;
};


/**
 * Updates the current health value for the enemy, making sure it stays
 * between 0 and #enemyMaxHealth_.
 * @param {number} delta The delta to be applied to the current value.
 * @return {number} The new health value.
 */
cast.games.spellcast.SpellcastGame.prototype.updateEnemyHealth =
    function(delta) {
  return this.setEnemyHealth(this.enemyHealth_ + delta);
};


/**
 * Removes all players from the game by forcing them to quit state.
 */
cast.games.spellcast.SpellcastGame.prototype.removeAllPlayers = function() {
  var playerIds = Object.keys(this.playerMap_);

  // Turn off effects affecting all players.
  this.disableHeal();
  this.disablePartyShield();

  for (var i = 0; i < playerIds.length; i++) {
    this.removePlayer_(playerIds[i]);
  }
};


/**
 * Removes enemy from the game.
 */
cast.games.spellcast.SpellcastGame.prototype.removeEnemy = function() {
  if (this.enemy_) {
    this.enemy_.deactivate();
  }
};


/**
 * Updates the game data persisted by the running game and broadcasts the
 * current status of the game to all players. Called by the state machine when
 * the current game state changes (e.g. from waiting for players screen to
 * player action phase screen).
 * @param {cast.games.spellcast.messages.GameStateId} gameStateId
 */
cast.games.spellcast.SpellcastGame.prototype.broadcastGameStatus =
    function(gameStateId) {
  this.gameData_.gameStateId = gameStateId;

  this.gameManager_.updateGameData(this.gameData_);
  this.gameManager_.broadcastGameManagerStatus(/* exceptSenderId */ null);
};


/**
 * Sets the game difficulty.
 * @param {cast.games.spellcast.messages.DifficultySetting} difficultySetting
 */
cast.games.spellcast.SpellcastGame.prototype.setDifficultySetting =
    function(difficultySetting) {
  this.gameDifficulty_ = difficultySetting;
};


/**
 * Return a random element.
 * @return {!cast.games.spellcast.messages.SpellElement}
 */
cast.games.spellcast.SpellcastGame.prototype.getRandomElement = function() {
  var randomElement = Math.floor(Math.random() *
      cast.games.spellcast.GameConstants.RANDOM_ELEMENTS.length);
  return cast.games.spellcast.GameConstants.RANDOM_ELEMENTS[randomElement];
};


/**
 * Return a random player bonus.
 * @return {!cast.games.spellcast.messages.PlayerBonus}
 */
cast.games.spellcast.SpellcastGame.prototype.getRandomPlayerBonus = function() {
  var i = Math.floor(Math.random() *
      cast.games.spellcast.GameConstants.RANDOM_PLAYER_BONUS.length);
  return cast.games.spellcast.GameConstants.RANDOM_PLAYER_BONUS[i];
};


/**
 * Fired when a player quits from the game.
 * @param {cast.receiver.games.Event} event
 * @private
 */
cast.games.spellcast.SpellcastGame.prototype.onPlayerQuit_ = function(event) {
  // Tear down the game if there are no more players. Might want to show a nice
  // UI with a countdown instead of tearing down instantly.
  var connectedPlayers = this.gameManager_.getConnectedPlayers();
  if (connectedPlayers.length == 0) {
    console.log('No more players connected. Tearing down game.');
    cast.receiver.CastReceiverManager.getInstance().stop();
    return;
  }

  if (event.statusCode != cast.receiver.games.StatusCode.SUCCESS) {
    console.log('Error: Event status code: ' + event.statusCode);
    console.log('Reason for error: ' + event.errorDescription);
    return;
  }

  var playerId = event.playerInfo.playerId;
  var player = this.playerMap_[playerId];
  if (!player) {
    return;
  }
  this.removePlayer_(playerId);
};


/**
 * Fired when a game message is received. This callback is only used for
 * toggling the debug UI from a game message from the game debugger sender.
 * @param {cast.receiver.games.Event} event
 * @private
 */
cast.games.spellcast.SpellcastGame.prototype.onGameMessageReceived_ =
    function(event) {
  if (!event.requestExtraMessageData ||
      !event.requestExtraMessageData.hasOwnProperty('debug')) {
    return;
  }

  if (event.requestExtraMessageData['debug']) {
    this.debugUi.open();
  } else {
    this.debugUi.close();
  }
};


/**
 * Creates a random spell for testing purposes.
 * @return {!cast.games.spellcast.messages.Spell}
 * @export
 */
cast.games.spellcast.SpellcastGame.prototype.createRandomTestSpell =
    function() {
  var spell = new cast.games.spellcast.messages.Spell();
  var r = Math.random();
  if (r < 0.50) {
    spell.spellType = cast.games.spellcast.messages.SpellType.BASIC_ATTACK;
  } else if (r < 0.80) {
    spell.spellType = cast.games.spellcast.messages.SpellType.HEAL;
  } else {
    spell.spellType = cast.games.spellcast.messages.SpellType.SHIELD;
  }

  r = Math.random();
  if (r < 0.25) {
    spell.spellElement = cast.games.spellcast.messages.SpellElement.FIRE;
  } else if (r < 0.50) {
    spell.spellElement = cast.games.spellcast.messages.SpellElement.AIR;
  } else if (r < 0.75) {
    spell.spellElement = cast.games.spellcast.messages.SpellElement.EARTH;
  } else {
    spell.spellElement = cast.games.spellcast.messages.SpellElement.WATER;
  }

  r = Math.random();
  if (r < 0.33) {
    spell.spellAccuracy = cast.games.spellcast.messages.SpellAccuracy.GOOD;
  } else if (r < 0.66) {
    spell.spellAccuracy = cast.games.spellcast.messages.SpellAccuracy.GREAT;
  } else {
    spell.spellAccuracy = cast.games.spellcast.messages.SpellAccuracy.PERFECT;
  }

  return spell;
};


/**
 * Creates a random spell message for testing purposes.
 * @return {!cast.games.spellcast.messages.SpellMessage}
 * @export
 */
cast.games.spellcast.SpellcastGame.prototype.createRandomTestSpellMessage =
    function() {
  var spellMessage = new cast.games.spellcast.messages.SpellMessage();
  var length = Math.random() * 5;
  for (var i = 0; i < length; i++) {
    spellMessage.spells.push(this.createRandomTestSpell());
  }
  return spellMessage;
};


/**
 * Creates test player ready data for testing purposes.
 * @return {!cast.games.spellcast.messages.PlayerReadyData}
 * @export
 */
cast.games.spellcast.SpellcastGame.prototype.createTestPlayerReadyData =
    function() {
  var playerReadyData = new cast.games.spellcast.messages.PlayerReadyData();
  playerReadyData.playerName = 'testPlayer' + Date.now();
  var avatarIndex = Math.floor(Math.random() * this.playerTextures_.length);
  playerReadyData.avatarIndex = avatarIndex;
  return playerReadyData;
};


/**
 * Sends a test player ready message to create a new test player or a re-used
 * available player, simulating what happens when this message arrives from a
 * client.
 * @export
 */
cast.games.spellcast.SpellcastGame.prototype.testCreatePlayer = function() {
  var playerReadyData = this.createTestPlayerReadyData();
  var availablePlayers = this.gameManager_.getPlayersInState(
      cast.receiver.games.PlayerState.AVAILABLE);
  var newPlayerId = null;
  if (availablePlayers.length > 0 &&
      !this.gameManager_.getSenderIdWithPlayerId(
          availablePlayers[0].playerId)) {
    newPlayerId = availablePlayers[0].playerId;
  } else {
    var result = this.gameManager_.updatePlayerState(/* playerId */ null,
        cast.receiver.games.PlayerState.AVAILABLE, /* extraMessageData */ null);
    newPlayerId = result.playerId;
  }
  this.gameManager_.updatePlayerState(newPlayerId,
      cast.receiver.games.PlayerState.READY, playerReadyData);
};


/**
 * Send random actions for all players for testing purposes, simulating what
 * happens when this message arrives from a client.
 * @export
 */
cast.games.spellcast.SpellcastGame.prototype.testCreatePlayerActions =
    function() {
  var players = this.gameManager_.getPlayers();
  for (var i = 0; i < players.length; i++) {
    this.gameManager_.simulateGameMessageFromPlayer(
        players[i].playerId, this.createRandomTestSpellMessage());
  }
};


/**
 * Sends a player playing message for testing purposes, simulating what happens
 * when this message arrives from a client.
 * @export
 */
cast.games.spellcast.SpellcastGame.prototype.testStartGame = function() {
  var playerPlayingData = new cast.games.spellcast.messages.PlayerPlayingData();
  playerPlayingData.difficultySetting =
      cast.games.spellcast.messages.DifficultySetting.EASY;
  var players = this.gameManager_.getPlayers();
  this.gameManager_.updatePlayerState(players[0].playerId,
      cast.receiver.games.PlayerState.PLAYING, playerPlayingData);
};


/**
 * Quits a random player for testing purposes.
 * @export
 */
cast.games.spellcast.SpellcastGame.prototype.testQuitPlayer = function() {
  var players = this.gameManager_.getPlayers();
  var quitPlayerIndex = Math.floor(Math.random() * players.length);
  var quitPlayerId = players[quitPlayerIndex].playerId;
  this.gameManager_.updatePlayerState(quitPlayerId,
      cast.receiver.games.PlayerState.QUIT, null);
};


/**
 * Sends a player idle message to test pausing and unpausing, simulating what
 * happens when this message arrives from a client.
 * @export
 */
cast.games.spellcast.SpellcastGame.prototype.testPause = function() {
  var players = this.gameManager_.getPlayers();
  var pausePlayerIndex = Math.floor(Math.random() * players.length);
  var pausePlayerId = players[pausePlayerIndex].playerId;
  this.gameManager_.updatePlayerState(pausePlayerId,
      cast.receiver.games.PlayerState.IDLE, null);

  setTimeout((function() {
    this.gameManager_.updatePlayerState(pausePlayerId,
        cast.receiver.games.PlayerState.PLAYING, null);
  }).bind(this), 5000);
};
