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
goog.provide('cast.games.spellcast.gameobjects.TextDisplay');

goog.require('cast.games.spellcast.gameobjects.GameObject');



/**
 * Represents a text pop up message near the bottom of the screen to inform
 * players about something (e.g. start drawing spells now). Call #setText to
 * set actual text displayed. Uses HTML instead of PIXI because rendering text
 * is slow.
 * @constructor
 * @struct
 * @implements {cast.games.spellcast.gameobjects.GameObject}
 */
cast.games.spellcast.gameobjects.TextDisplay = function() {
  /** @public {boolean} */
  this.active = false;

  /** @private {!Element} */
  this.textElement_ = document.createElement('div');
  this.textElement_.style.background = 'yellow';
  this.textElement_.style.bottom = '20px';
  this.textElement_.style.color = 'black';
  this.textElement_.style.fontFamily = 'Arial';
  this.textElement_.style.fontSize = '24px';
  this.textElement_.style.padding = '0.5em';
  this.textElement_.style.position = 'absolute';
  this.textElement_.style.textAlign = 'center';
  this.textElement_.style.visibility = 'hidden';
  this.textElement_.style.width = '100%';
  this.textElement_.style.zIndex = '1000';
  document.body.appendChild(this.textElement_);
};


/**
 * Sets the text displayed.
 * @param {string} text
 */
cast.games.spellcast.gameobjects.TextDisplay.prototype.setText =
    function(text) {
  this.textElement_.innerText = text;
};


/** @override */
cast.games.spellcast.gameobjects.TextDisplay.prototype.activate =
    function(position) {
  this.active = true;
  this.textElement_.style.visibility = 'visible';
};


/** @override */
cast.games.spellcast.gameobjects.TextDisplay.prototype.deactivate =
    function() {
  this.active = false;
  this.textElement_.style.visibility = 'hidden';
};


/** @override */
cast.games.spellcast.gameobjects.TextDisplay.prototype.update =
    function(deltaTime) {
};
