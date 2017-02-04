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

#import <math.h>

#import "AppDelegate.h"
#import "DeviceTableViewController.h"
#import "GameViewController.h"
#import "ProgressViewController.h"
#import "StartViewController.h"
#import "UIButton+Extensions.h"

@interface ProgressViewController() {
  ProgressViewDisplayMode _displayMode;
}

@end

@implementation ProgressViewController

#pragma mark - UIViewController

- (void)viewDidLoad {
  [super viewDidLoad];

  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  [self.wizardImageView setImage:[delegate getAvatarImage]];
  [self.nameLabel setText:[delegate.gameInfo playerName]];
  [self updateProgress];
}

#pragma mark - SpellCastViewController

- (void)playerInfoDidChangeTo:(GCKPlayerInfo *)currentPlayer
                         from:(GCKPlayerInfo *)previousPlayer {
  // Ignore player info changes without player data or for players not controlled by this sender or
  // the lobby is closed.
  if (!currentPlayer.playerData
      || currentPlayer.playerData == [NSNull null]
      || !currentPlayer.isControllable
      || self.gameManagerChannel.currentState.lobbyState == GCKLobbyStateClosed) {
    return;
  }

  // Check if current player is not the host or is already the host since previous state change.
  BOOL isHost = [currentPlayer.playerData gck_boolForKey:@"host" withDefaultValue:NO];
  BOOL wasHost = previousPlayer.playerData && previousPlayer.playerData != [NSNull null] ?
      [previousPlayer.playerData gck_boolForKey:@"host" withDefaultValue:NO] : NO;
  if (!isHost || isHost == wasHost) {
    return;
  }

  // The current player became the host (because previous host dropped) and the lobby is open.
  // Transition to screen to let current player to start the game as the host.
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  UIStoryboard *storyboard = self.storyboard;
  StartViewController *dvc = [storyboard instantiateViewControllerWithIdentifier:@"StartView"];
  delegate.chromecastDeviceController.delegate = dvc;
  [self.navigationController popViewControllerAnimated:NO];
  [self.navigationController pushViewController:dvc animated:YES];
}

- (void)lobbyStateDidChangeTo:(GCKLobbyState)currentState
                         from:(GCKLobbyState)previousState {
  [super lobbyStateDidChangeTo:currentState from:previousState];

  if (currentState == GCKLobbyStateOpen && previousState == GCKLobbyStateClosed) {
    // Disconnect and start over if the game transitioned back to the lobby screen.
    // Might want to change this to pop to a different view instead of disconnecting and restarting.
    AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
    [delegate.chromecastDeviceController disconnectFromDevice];
    [self.navigationController popToRootViewControllerAnimated:NO];
  } else {
    // Update progress text.
    [self updateProgress];
  }
}

- (void)gameDataDidChangeTo:(id)currentGameData
                       from:(id)previousGameData {
  [super gameDataDidChangeTo:currentGameData from:previousGameData];

  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  SPCGameStateId gameStateId = [delegate.gameInfo updateGameStateIdFromGameData:currentGameData];

  if (gameStateId == SPCGameStateIdEnemyVictory || gameStateId == SPCGameStateIdPlayerVictory) {
    // Update progress text if the game determined the enemy or player won.
    [self updateDisplayMode:ProgressViewDisplayModeGameEnding];
  }
}

- (void)gameManagerChannel:(GCKGameManagerChannel *)gameManagerChannel
     didReceiveGameMessage:(id)gameMessage
               forPlayerID:(NSString *)playerID {
  [super gameManagerChannel:gameManagerChannel
      didReceiveGameMessage:gameMessage
                forPlayerID:playerID];

  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  [delegate.gameInfo updatePlayerBonusFromGameMessage:gameMessage];
  [delegate.gameInfo updateCastSpellsDurationMillisFromGameMessage:gameMessage];

  if (_displayMode == ProgressViewDisplayModeHostStarting
      || _displayMode == ProgressViewDisplayModeWaitingForPlayers) {
    // Transition to the game view if received game messsage while waiting to start the game.
    UIStoryboard *storyboard = self.storyboard;
    GameViewController *dvc = [storyboard instantiateViewControllerWithIdentifier:@"GameView"];
    delegate.chromecastDeviceController.delegate = dvc;
    [self.navigationController pushViewController:dvc animated:YES];
  } else if (_displayMode == ProgressViewDisplayModeResolveActions){
    // Pop this view if received game message while waiting for game to resolve actions.
    [self.navigationController popViewControllerAnimated:YES];
  }
}

#pragma mark - IBActions

- (IBAction)openCastMenu:(id)sender {
  UIStoryboard *storyboard = self.storyboard;
  DeviceTableViewController *dvc =
      [storyboard instantiateViewControllerWithIdentifier:@"DeviceTableView"];
  [self presentViewController:dvc animated:YES completion:nil];
}

#pragma mark - Progress UI

- (void)updateDisplayMode:(ProgressViewDisplayMode)displayMode {
  _displayMode = displayMode;
  [self updateProgress];
}

- (void)updateProgress {
  GCKGameManagerState *currentState = self.gameManagerChannel.currentState;
  switch (_displayMode) {
    case ProgressViewDisplayModeHostStarting:
      [self.progressTextLabel setText:@"Starting game"];
      break;
    case ProgressViewDisplayModeResolveActions:
      [self.progressTextLabel setText:@"Resolving battle!"];
      break;
    case ProgressViewDisplayModeGameEnding:
      [self.progressTextLabel setText:@"Game over. Restarting..."];
      break;
    default:
      if (currentState.lobbyState == GCKLobbyStateOpen) {
        [self.progressTextLabel setText:@"Waiting for host to start game"];
      } else {
        [self.progressTextLabel setText:@"Waiting for game to start"];
      }
  }
}

@end
