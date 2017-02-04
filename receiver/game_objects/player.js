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
goog.provide('cast.games.spellcast.gameobjects.Player');

goog.require('cast.games.spellcast.GameConstants');
goog.require('cast.games.spellcast.gameobjects.GameObject');



/**
 * A reusable player in the game.
 * @param {!PIXI.Point} lobbyPosition Normalized lobby position.
 * @param {!PIXI.Point} battlePosition Normalized battle position.
 * @param {!PIXI.Sprite} sprite
 * @param {!PIXI.Container} container
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @constructor
 * @struct
 * @implements {cast.games.spellcast.gameobjects.GameObject}
 */
cast.games.spellcast.gameobjects.Player = function(lobbyPosition,
    battlePosition, sprite, container, canvasWidth, canvasHeight) {
  /** @public {boolean} */
  this.active = false;

  /** @public {!PIXI.Sprite} */
  this.sprite = sprite;

  /** @public {!PIXI.Container} */
  this.container = container;

  /** @public {number} */
  this.canvasWidth = canvasWidth;

  /** @public {number} */
  this.canvasHeight = canvasHeight;

  /** @public {?string} */
  this.playerId = null;

  /** @public {?string} */
  this.name = null;

  /** @public {!PIXI.Point} */
  this.lobbyPosition = lobbyPosition;

  /** @public {!PIXI.Point} */
  this.battlePosition = battlePosition;

  /** @public {number} */
  this.posX = lobbyPosition.x;

  /** @public {number} */
  this.posY = lobbyPosition.y;

  /** @public {!PIXI.Sprite} */
  this.shieldSprite = PIXI.Sprite.fromImage('assets/shield.png');

  /** @public {!PIXI.Sprite} */
  this.healSprite = PIXI.Sprite.fromImage('assets/heal.png');

  /** @public {!PIXI.Texture} */
  this.tilingTexture = PIXI.Texture.fromImage('assets/blank_tile.png');

  /** @public {!PIXI.extras.TilingSprite} */
  this.nameBackground = new PIXI.extras.TilingSprite(this.tilingTexture,
      canvasWidth * 0.1, 24);

  /** @public {!PIXI.Text} */
  this.nameText = new PIXI.Text('???', {font: '16px Arial', fill: 'white'});

  /** @private {boolean} */
  this.nameUpdated_ = false;

  /** @private {!Function} */
  this.updateTextFn_ = goog.bind(this.updateText_, this);

  this.shieldSprite.anchor.x = 0.7;
  this.shieldSprite.anchor.y = 1.1;
  this.shieldSprite.tint = 0xFFFF00;
  this.shieldSprite.position.x = 0;
  this.shieldSprite.position.y = 0;

  this.healSprite.alpha = 0.75;
  this.healSprite.anchor.x = 0.7;
  this.healSprite.anchor.y = 1.1;
  this.healSprite.position.x = 0;
  this.healSprite.position.y = 0;
  this.healSprite.scale.x = 0.5;
  this.healSprite.scale.y = 0.5;

  this.nameBackground.anchor.x = 0.5;
  this.nameBackground.anchor.y = 0;
  this.nameBackground.position.x = 0;
  this.nameBackground.position.y = 55;
  this.nameBackground.tint = 0x000000;
  this.nameBackground.alpha = 0.5;
  this.sprite.addChild(this.nameBackground);

  this.nameText.anchor.x = 0.5;
  this.nameText.anchor.y = 0;
  this.nameText.position.x = 0;
  this.nameText.position.y = 55;
  this.sprite.addChild(this.nameText);

  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 0.5;
  this.sprite.visible = false;
  this.container.addChild(this.sprite);
};


/**
 * Sets the player ID and the name.
 * @param {string} playerId Unique player ID.
 * @param {string} name Name to identify the player on the screen.
 */
cast.games.spellcast.gameobjects.Player.prototype.setPlayerIdAndName =
    function(playerId, name) {
  this.playerId = playerId;
  this.name = name;
  this.nameText.text = name;
  this.nameUpdated_ = true;
};


/**
 * Updates the width of the background text. Only called once.
 * @private
 */
cast.games.spellcast.gameobjects.Player.prototype.updateText_ = function() {
  this.nameBackground.width = this.nameText.width + 4;
  this.nameUpdated_ = false;
};


/** @override */
cast.games.spellcast.gameobjects.Player.prototype.activate =
    function(position, showNameText) {
  this.active = true;
  this.posX = position.x;
  this.posY = position.y;
  this.sprite.position.x = this.canvasWidth * position.x;
  this.sprite.position.y = this.canvasHeight * position.y;
  this.sprite.visible = true;
  this.nameText.visible = showNameText;
  this.nameBackground.visible = showNameText;
};


/** @override */
cast.games.spellcast.gameobjects.Player.prototype.deactivate = function() {
  this.active = false;
  this.sprite.visible = false;
  this.disableShield();
  this.disableHeal();
};


/** @override */
cast.games.spellcast.gameobjects.Player.prototype.update = function(deltaTime) {
  this.sprite.position.x = this.canvasWidth * this.posX;
  this.sprite.position.y = this.canvasHeight * this.posY;

  if (this.nameUpdated_) {
    requestAnimationFrame(this.updateTextFn_);
  }
};


/**
 * Enables shield for this player.
 * @param {number} alpha Alpha applied to player shield sprite.
 * @param {number} tint Tint applied to player shield sprite.
 */
cast.games.spellcast.gameobjects.Player.prototype.enableShield =
    function(alpha, tint) {
  if (this.shieldSprite.parent) {
    return;
  }

  this.shieldSprite.alpha = alpha;
  this.shieldSprite.tint = tint;
  this.sprite.addChild(this.shieldSprite);
};


/**
 * Disables shield for this player.
 */
cast.games.spellcast.gameobjects.Player.prototype.disableShield = function() {
  if (this.shieldSprite.parent != this.sprite) {
    return;
  }

  this.sprite.removeChild(this.shieldSprite);
};


/**
 * Enables heal effect on this player.
 * @param {number} scale X and Y scale applied on player heal sprite.
 */
cast.games.spellcast.gameobjects.Player.prototype.enableHeal = function(scale) {
  this.healSprite.scale.x = scale;
  this.healSprite.scale.y = scale;
  if (this.healSprite.parent) {
    return;
  }

  this.sprite.addChild(this.healSprite);
};


/**
 * Disables heal effect on this player.
 */
cast.games.spellcast.gameobjects.Player.prototype.disableHeal = function() {
  if (this.healSprite.parent != this.sprite) {
    return;
  }

  this.sprite.removeChild(this.healSprite);
};


/** Moves player forward. */
cast.games.spellcast.gameobjects.Player.prototype.moveForward = function() {
  this.posX += cast.games.spellcast.GameConstants.PLAYER_SPELL_X_OFFSET;
};


/** Moves player backward. */
cast.games.spellcast.gameobjects.Player.prototype.moveBackward = function() {
  this.posX -= cast.games.spellcast.GameConstants.PLAYER_SPELL_X_OFFSET;
};
