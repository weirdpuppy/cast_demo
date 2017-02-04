// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#import <GoogleCast/GoogleCast.h>
#import <GoogleCastGames/GoogleCastGames.h>
#import <UIKit/UIKit.h>

#import "ChromecastDeviceController.h"

/**
 * Used by game-specific view controllers to automatically set up and handle chromecast and game
 * manager channel delegation. Subclasses should override to customize behavior.
 */
@interface SpellCastViewController :
    UIViewController <ChromecastControllerDelegate, GCKGameManagerChannelDelegate>

/**
 * The game manager channel. Set by viewDidLoad.
 */
@property(nonatomic, readonly) GCKGameManagerChannel *gameManagerChannel;

/**
 * Helper that loads the view with no game manager delegate setup. Used by HomeViewController to set
 * up the game manager channel for the first time.
 */
- (void)viewDidLoadWithNoGameManagerDelegation;

/**
 * Sets up game manger channel with delegation. Used by HomeViewController to set up the game
 * manager channel for the first time.
 */
- (void)setupGameManagerChannel;

/**
 * Override this to customize behavior when player information changes.
 */
- (void)playerInfoDidChangeTo:(GCKPlayerInfo *)currentPlayer
                         from:(GCKPlayerInfo *)previousPlayer;

/**
 * Override this to customize behavior when lobby state changes.
 */
- (void)lobbyStateDidChangeTo:(GCKLobbyState)currentState
                         from:(GCKLobbyState)previousState;

/**
 * Override this to customize behavior when gameplay state changes.
 */
- (void)gameplayStateDidChangeTo:(GCKGameplayState)currentState
                            from:(GCKGameplayState)previousState;

/**
 * Override this to customize behavior when game data changes.
 */
- (void)gameDataDidChangeTo:(id)currentGameData
                       from:(id)previousGameData;

/**
 * Override this to customize behavior when game status text changes.
 */
- (void)gameStatusTextDidChangeTo:(NSString *)currentGameStatusText
                             from:(NSString *)previousGameStatusText;

@end
