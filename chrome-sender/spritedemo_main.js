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
goog.require('cast.games.spritedemo.SpritedemoMessage');
goog.require('cast.games.spritedemo.SpritedemoMessageType');


/** @define {string} Application ID used when running the sender. */
var APP_ID = 'D6120C32';

// Global reference to game session manager for console debugging.
var gameManagerClient = null;

// Makes it easier to specify a SpritedemoMessageType in the console.
var SpritedemoMessageType = cast.games.spritedemo.SpritedemoMessageType;


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
        console.log('### Game manager client initialized!');
        gameManagerClient = result.gameManagerClient;
        cast.games.common.sender.debugGameManagerClient(gameManagerClient);

        console.log('### Sending AVAILABLE message.');
        gameManagerClient.sendPlayerAvailableRequest(null, null, null);
        help();
      },
      function(error) {
        console.error('### Error initializing the game manager client: ' +
            error.errorDescription + ' ' +
            'Error code: ' + error.errorCode);
      });
};


/**
 * Sends a sprite message to the receiver. The receiver will add a sprite to the
 * screen when received.
 * @export
 */
var sendSpritedemoMessage = function() {
  if (!gameManagerClient) {
    return;
  }
  var message = new cast.games.spritedemo.SpritedemoMessage();
  message.type = cast.games.spritedemo.SpritedemoMessageType.SPRITE;

  gameManagerClient.sendGameMessage(message);
};
commandDocs.add('sendSpritedemoMessage() - This function creates a new ' +
    'cast.games.spritedemo.SpritedemoMessage(), which is a container created ' +
    'specifically for the needs of this cast application. It then ' +
    ' sends the message to the receiver using the ' +
    ' sendGameMessageWithPlayerId function in GameManagerClient.');
