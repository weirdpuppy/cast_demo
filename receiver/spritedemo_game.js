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
goog.provide('cast.games.spritedemo.SpritedemoGame');

goog.require('cast.games.common.receiver.Game');
goog.require('cast.games.spritedemo.SpritedemoMessageType');



/**
 * Sprite Demo game.
 *
 * Adds a sprite from a pool of sprites when a sender sends a custom game
 * message. Automatically transitions AVAILABLE players to the PLAYING state.
 *
 * @param {!cast.receiver.games.GameManager} gameManager
 * @constructor
 * @implements {cast.games.common.receiver.Game}
 * @export
 */
cast.games.spritedemo.SpritedemoGame = function(gameManager) {
  /** @private {!cast.receiver.games.GameManager} */
  this.gameManager_ = gameManager;

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

  /** @private {Array} */
  this.sprites_ = [];

  /** @private {Array} */
  this.spriteVelocities_ = [];

  /** @private {number} */
  this.numberSpritesAdded_ = 0;

  /** @private {number} */
  this.backgroundPosition_ = 0;

  /** @private {PIXI.Sprite} */
  this.background_ = null;

  /**
   * Background wrap-around texture to fake a infinite scrolling effect.
   * @private {PIXI.Sprite}
   */
  this.backgroundWrap_ = null;

  /** @private {function(number)} Pre-bound call to #update. */
  this.boundUpdateFunction_ = this.update_.bind(this);

  /** @private {boolean} */
  this.isLoaded_ = false;

  /** @private {boolean} */
  this.isRunning_ = false;

  /** @private {!PIXI.Container} */
  this.container_ = new PIXI.Container();

  /** @private {!PIXI.WebGLRenderer} */
  this.renderer_ = new PIXI.WebGLRenderer(this.canvasWidth_,
      this.canvasHeight_);

  /** @private {!PIXI.loaders.Loader} */
  this.loader_ = new PIXI.loaders.Loader();
  this.loader_.add('assets/icon.png');
  this.loader_.add('assets/background.jpg');
  this.loader_.once('complete', this.onAssetsLoaded_.bind(this));

  /** @private {?function()} Callback used with #run. */
  this.loadedCallback_ = null;

  /**
   * Pre-bound custom message callback.
   * @private {function(cast.receiver.games.Event)}
   */
  this.boundGameMessageCallback_ = this.onGameMessage_.bind(this);

  /**
   * Pre-bound player connect callback.
   * @private {function(cast.receiver.games.Event)}
   */
  this.boundPlayerAvailableCallback_ = this.onPlayerAvailable_.bind(this);

  /**
   * Pre-bound player quit callback.
   * @private {function(cast.receiver.games.Event)}
   */
  this.boundPlayerQuitCallback_ = this.onPlayerQuit_.bind(this);
};


/**
 * Max number of sprites allowed on screen.
 * {number}
 */
cast.games.spritedemo.SpritedemoGame.MAX_NUM_SPRITES = 200;


/**
 * Default scale of sprites.
 * {number}
 */
cast.games.spritedemo.SpritedemoGame.SCALE = 1;


/**
 * @param {number} min
 * @param {number} max
 * @return {number} Returns a random integer between min and max.
 */
cast.games.spritedemo.SpritedemoGame.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


/**
 * Runs the game. Game should load if not loaded yet.
 * @param {function()} loadedCallback This function will be called when the game
 *     finishes loading or is already loaded and about to actually run.
 * @export
 */
cast.games.spritedemo.SpritedemoGame.prototype.run = function(loadedCallback) {
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
cast.games.spritedemo.SpritedemoGame.prototype.stop = function() {
  if (this.loadedCallback_ || !this.isRunning_) {
    this.loadedCallback_ = null;
    return;
  }

  this.isRunning_ = false;
  document.body.removeChild(this.renderer_.view);

  this.gameManager_.removeEventListener(
      cast.receiver.games.EventType.PLAYER_AVAILABLE,
      this.boundPlayerAvailableCallback_);
  this.gameManager_.removeEventListener(
      cast.receiver.games.EventType.GAME_MESSAGE_RECEIVED,
      this.boundGameMessageCallback_);
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
cast.games.spritedemo.SpritedemoGame.prototype.start_ = function() {
  // If callback is null, the game was stopped already.
  if (!this.loadedCallback_) {
    return;
  }

  document.body.appendChild(this.renderer_.view);
  this.isRunning_ = true;
  this.gameManager_.updateGameplayState(
      cast.receiver.games.GameplayState.RUNNING, null);
  requestAnimationFrame(this.boundUpdateFunction_);

  this.loadedCallback_();
  this.loadedCallback_ = null;

  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.PLAYER_AVAILABLE,
      this.boundPlayerAvailableCallback_);
  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.GAME_MESSAGE_RECEIVED,
      this.boundGameMessageCallback_);
  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.PLAYER_QUIT,
      this.boundPlayerQuitCallback_);
  this.gameManager_.addEventListener(
      cast.receiver.games.EventType.PLAYER_DROPPED,
      this.boundPlayerQuitCallback_);
};


/**
 * Called when all assets are loaded.
 * @private
 */
cast.games.spritedemo.SpritedemoGame.prototype.onAssetsLoaded_ = function() {
  this.background_ = PIXI.Sprite.fromImage('assets/background.jpg');
  this.background2_ = PIXI.Sprite.fromImage('assets/background.jpg');
  this.background_.position.x = this.background_.position.y = 0;
  this.background2_.position.x = this.background2_.position.y = 0;
  this.container_.addChild(this.background_);
  this.container_.addChild(this.background2_);

  for (var i = 0; i < cast.games.spritedemo.SpritedemoGame.MAX_NUM_SPRITES;
      i++) {
    var sprite = PIXI.Sprite.fromImage('assets/icon.png');
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    sprite.scale.x = sprite.scale.y =
        cast.games.spritedemo.SpritedemoGame.SCALE;
    this.sprites_[i] = sprite;

    this.spriteVelocities_[i] = { x: 0, y: 0 };
  }

  this.start_();
};


/**
 * Handles when a player becomes available to the game manager.
 * @param {cast.receiver.games.Event} event
 * @private
 */
cast.games.spritedemo.SpritedemoGame.prototype.onPlayerAvailable_ =
    function(event) {
  if (event.statusCode != cast.receiver.games.StatusCode.SUCCESS) {
    console.log('Error: Event status code: ' + event.statusCode);
    console.log('Reason for error: ' + event.errorDescription);
    return;
  }
  var playerId = /** @type {string} */ (event.playerInfo.playerId);
  // Automatically transition available players to playing state.
  this.gameManager_.updatePlayerState(playerId,
      cast.receiver.games.PlayerState.PLAYING, null);
};


/**
 * Handles when a player disconnects from the game manager.
 * @param {cast.receiver.games.Event} event
 * @private
 */
cast.games.spritedemo.SpritedemoGame.prototype.onPlayerQuit_ =
    function(event) {
  if (event.statusCode != cast.receiver.games.StatusCode.SUCCESS) {
    console.log('Error: Event status code: ' + event.statusCode);
    console.log('Reason for error: ' + event.errorDescription);
    return;
  }
  // Tear down the game if there are no more players. Might want to show a nice
  // UI with a countdown instead of tearing down instantly.
  var connectedPlayers = this.gameManager_.getConnectedPlayers();
  if (connectedPlayers.length == 0) {
    console.log('No more players connected. Tearing down game.');
    cast.receiver.CastReceiverManager.getInstance().stop();
  }
};


/**
 * Callback for game message sent via game manager.
 * @param {cast.receiver.games.Event} event
 * @private
 */
cast.games.spritedemo.SpritedemoGame.prototype.onGameMessage_ =
    function(event) {
  if (event.statusCode != cast.receiver.games.StatusCode.SUCCESS) {
    console.log('Error: Event status code: ' + event.statusCode);
    console.log('Reason for error: ' + event.errorDescription);
    return;
  }
  var message = /** @type {!cast.games.spritedemo.SpritedemoMessage} */ (
      event.requestExtraMessageData);
  var SpritedemoMessageType = cast.games.spritedemo.SpritedemoMessageType;

  if (message.type == SpritedemoMessageType.SPRITE) {
    if (this.numberSpritesAdded_ <
        cast.games.spritedemo.SpritedemoGame.MAX_NUM_SPRITES) {
      var sprite = this.sprites_[this.numberSpritesAdded_];
      sprite.position.x = cast.games.spritedemo.SpritedemoGame.getRandomInt(
          sprite.width / 2, this.canvasWidth_ - sprite.width / 2);
      sprite.position.y = cast.games.spritedemo.SpritedemoGame.getRandomInt(
          sprite.height / 2, this.canvasHeight_ - sprite.height / 2);
      this.numberSpritesAdded_ = this.numberSpritesAdded_ + 1;
      this.container_.addChild(sprite);
    } else {
      console.log('Maximum number of sprites added. Not adding a new one');
    }
  }
};


/**
 * Updates the game on each animation frame.
 * @param {number} timestamp
 * @private
 */
cast.games.spritedemo.SpritedemoGame.prototype.update_ = function(timestamp) {
  if (!this.isRunning_) {
    return;
  }

  requestAnimationFrame(this.boundUpdateFunction_);

  for (var i = 0; i < this.numberSpritesAdded_; i++) {
    this.sprites_[i].rotation += 0.1;

    // Make it steer in random direction.
    this.spriteVelocities_[i].x +=
        cast.games.spritedemo.SpritedemoGame.getRandomInt(-2, 2);
    this.spriteVelocities_[i].y +=
        cast.games.spritedemo.SpritedemoGame.getRandomInt(-2, 2);

    if (Math.abs(this.spriteVelocities_[i].x) > 10) {
      this.spriteVelocities_[i].x *= 0.8;
    }

    if (Math.abs(this.spriteVelocities_[i].y) > 10) {
      this.spriteVelocities_[i].y *= 0.8;
    }

    // Move the sprite according to it's velocity.
    this.sprites_[i].position.x += this.spriteVelocities_[i].x;
    this.sprites_[i].position.y += this.spriteVelocities_[i].y;

    // Make sure the sprites don't fly off the screen.
    var spriteX = this.sprites_[i].position.x;
    var spriteY = this.sprites_[i].position.y;

    if (spriteX <= 0) {
      this.spriteVelocities_[i].x *= -1;
      this.sprites_[i].position.x = 0;
    } else if (spriteX >= this.canvasWidth_) {
      this.spriteVelocities_[i].x *= -1;
      this.sprites_[i].position.x = this.canvasWidth_;
    }

    if (spriteY <= 0) {
      this.spriteVelocities_[i].y *= -1;
      this.sprites_[i].position.y = 0;
    } else if (spriteY >= this.canvasHeight_) {
      this.spriteVelocities_[i].y *= -1;
      this.sprites_[i].position.y = this.canvasHeight_;
    }

  }

  this.backgroundPosition_++;

  this.background_.position.x = this.backgroundPosition_;
  this.background_.position.x %= this.background_.texture.width;

  this.background2_.position.x = this.background_.position.x;
  this.background2_.position.x -= this.background_.texture.width;

  this.renderer_.render(this.container_);
};

