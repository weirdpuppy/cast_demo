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
goog.provide('cast.games.spellcast.AudioManager');



/**
 * Manages audio for spellcast.
 * @constructor
 */
cast.games.spellcast.AudioManager = function() {
  /** @private {Howl} */
  this.backgroundMusic_ = null;

  /** @private {Howl} */
  this.explosionSound_ = null;

  /** @private {Howl} */
  this.healSound_ = null;

  /** @private {Howl} */
  this.shieldSound_ = null;

  /** @private {Howl} */
  this.shieldDisruptSound_ = null;

  /** @private {Howl} */
  this.attackSound_ = null;
};


/** Loads all audio assets. */
cast.games.spellcast.AudioManager.prototype.loadAllAudio = function() {
  this.healSound_ = new Howl({
    urls: ['assets/heal.ogg']
  }).load();
  this.shieldSound_ = new Howl({
    urls: ['assets/shield.ogg']
  }).load();
  this.shieldDisruptSound_ = new Howl({
    urls: ['assets/shield_disrupt.ogg']
  }).load();
  this.attackSound_ = new Howl({
    urls: ['assets/attack.ogg']
  }).load();
  this.explosionSound_ = new Howl({
    urls: ['assets/explosion.ogg']
  }).load();
  this.backgroundMusic_ = new Howl({
    loop: true,
    urls: ['assets/music.ogg'],
  }).load();
};


/** Plays heal sound. */
cast.games.spellcast.AudioManager.prototype.playHeal = function() {
  this.healSound_.play();
};


/** Plays shield sound. */
cast.games.spellcast.AudioManager.prototype.playShield = function() {
  this.shieldSound_.play();
};


/** Plays shield disrupt sound. */
cast.games.spellcast.AudioManager.prototype.playShieldDisrupt = function() {
  this.shieldDisruptSound_.play();
};


/** Plays attack sound. */
cast.games.spellcast.AudioManager.prototype.playAttackSound = function() {
  this.attackSound_.play();
};


/** Plays explosion sound. */
cast.games.spellcast.AudioManager.prototype.playExplosionSound = function() {
  this.explosionSound_.play();
};


/** Plays background music. */
cast.games.spellcast.AudioManager.prototype.playBackgroundMusic = function() {
  this.backgroundMusic_.play();
};


/** Pauses background music. */
cast.games.spellcast.AudioManager.prototype.pauseBackgroundMusic = function() {
  this.backgroundMusic_.pause();
};
