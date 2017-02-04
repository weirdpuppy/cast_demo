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
'use strict';

/** @suppress {extraRequire} Needed to set up global command docs. */
goog.require('cast.games.common.sender.CommandDocs');
goog.require('cast.games.common.sender.debugGameManagerClient');
goog.require('cast.games.common.sender.setup');
goog.require('cast.games.spellcast.messages.DifficultySetting');
goog.require('cast.games.spellcast.messages.PlayerBonus');
goog.require('cast.games.spellcast.messages.PlayerPlayingData');
goog.require('cast.games.spellcast.messages.PlayerReadyData');
goog.require('cast.games.spellcast.messages.Spell');
goog.require('cast.games.spellcast.messages.SpellAccuracy');
goog.require('cast.games.spellcast.messages.SpellElement');
goog.require('cast.games.spellcast.messages.SpellMessage');
goog.require('cast.games.spellcast.messages.SpellType');


/** @define {string} Application ID used when running the sender. */
var APP_ID = 'E92ACE28';

// Global reference to game session manager for console debugging.
var gameManagerClient = null;

// Makes it easier to specify spellcast difficulty setting in the console.
var DifficultySetting = cast.games.spellcast.messages.DifficultySetting;

// Makes it easier to specify spellcast player bonus in the console.
var PlayerBonus = cast.games.spellcast.messages.PlayerBonus;

// Makes it easier to specify spellcast spell accuracy in the console.
var SpellAccuracy = cast.games.spellcast.messages.SpellAccuracy;

// Makes it easier to specify spellcast spell element in the console.
var SpellElement = cast.games.spellcast.messages.SpellElement;

// Makes it easier to specify spellcast spell type in the console.
var SpellType = cast.games.spellcast.messages.SpellType;


/**
 * Request a cast session when Cast Sender API loads.
 * @param {boolean} loaded
 * @param {Object} errorInfo
 */
window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
  if (!loaded) {
    console.error('### Cast Sender SDK failed to load:');
    console.dir(errorInfo);
    return;
  }

  cast.games.common.sender.setup(APP_ID, onSessionReady_);
};


/**
 * Callback when a cast session is ready. Connects the game manager.
 * @param {!chrome.cast.Session} session
 * @private
 */
var onSessionReady_ = function(session) {
  console.log('### Creating game manager client.');
  chrome.cast.games.GameManagerClient.getInstanceFor(session,
      function(result) {
        gameManagerClient = result.gameManagerClient;
        cast.games.common.sender.debugGameManagerClient(gameManagerClient);
        console.log('### Game manager client initialized!');
        help();
      },
      function(error) {
        console.error('### Error initializing the game manager client: ' +
            error.errorDescription + ' ' +
            'Error code: ' + error.errorCode);
      });
};


/**
 * @return {!cast.games.spellcast.messages.PlayerReadyData} Returns a new
 *     spellcast player ready extra message data object.
 * @export
 */
var createSpellcastPlayerReadyData = function() {
  return new cast.games.spellcast.messages.PlayerReadyData();
};
commandDocs.add('createSpellcastPlayerReadyData() - create spellcast player ' +
    'ready data');


/**
 * @return {!cast.games.spellcast.messages.PlayerPlayingData} Returns a new
 *     spellcast player playing extra message data object.
 * @export
 */
var createSpellcastPlayerPlayingData = function() {
  return new cast.games.spellcast.messages.PlayerPlayingData();
};
commandDocs.add('createSpellcastPlayerPlayingData() - create spellcast ' +
    'player playing data');


/**
 * @return {!cast.games.spellcast.messages.Spell} Returns a new spellcast spell.
 * @export
 */
var createSpellcastSpell = function() {
  return new cast.games.spellcast.messages.Spell();
};
commandDocs.add('createSpellcastSpell() - create spellcast spell');


/**
 * @param {!Array.<!cast.games.spellcast.messages.Spell>} spells
 * @return {!cast.games.spellcast.messages.SpellMessage} Return a new spellcast
 *     spell message.
 * @export
 */
var createSpellcastSpellMessage = function(spells) {
  var spellMessage = new cast.games.spellcast.messages.SpellMessage();
  spellMessage.spells = spells;
  return spellMessage;
};
commandDocs.add('createSpellcastSpellMessage(spells) - create spellcast ' +
    'game message');
