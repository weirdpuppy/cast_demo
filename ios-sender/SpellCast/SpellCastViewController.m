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

#import <Foundation/Foundation.h>

#import "AppDelegate.h"
#import "SpellCastViewController.h"

@interface SpellCastViewController() {
}

@property(nonatomic, readwrite) GCKGameManagerChannel *gameManagerChannel;

@end

@implementation SpellCastViewController

#pragma mark - SpellCastViewController

- (void)viewDidLoadWithNoGameManagerDelegation {
  [super viewDidLoad];

  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  delegate.chromecastDeviceController.delegate = self;

  NSLog(@"viewDidLoadWithNoGameManagerDelegation set up chromecast delegate");
}

- (void)setupGameManagerChannel {
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  _gameManagerChannel = delegate.gameManagerChannel = [[GCKGameManagerChannel alloc]
      initWithSessionID:delegate.chromecastDeviceController.sessionID];
  _gameManagerChannel.delegate = self;
  [delegate.chromecastDeviceController.deviceManager addChannel: delegate.gameManagerChannel];

  NSLog(@"setupGameManagerChannel set up game manager channel");
}

#pragma mark - UIViewController

- (void)viewDidLoad {
  [super viewDidLoad];

  // Become delegate for ChromecastDeviceController
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  delegate.chromecastDeviceController.delegate = self;

  // Become delegate for GCKGameManagerChannel
  _gameManagerChannel = delegate.gameManagerChannel;
  _gameManagerChannel.delegate = self;

  NSLog(@"viewDidLoad set up chromecast and game manager channel delegates");
}

- (void)viewWillAppear:(BOOL)animated {
  [super viewDidLoad];
}

- (void)viewDidAppear:(BOOL)animated {
}

- (void)didReceiveMemoryWarning {
  [super didReceiveMemoryWarning];
}

- (BOOL)prefersStatusBarHidden {
  return YES;
}

#pragma mark - ChromecastDeviceDelegate

- (void)willConnectToDevice:(GCKDevice *)device {
  NSLog(@"Will connect to device");
}

- (void)didConnectToDevice:(GCKDevice *)device {
  NSLog(@"Did connect to device");
  [self setupGameManagerChannel];
}

- (void)didDisconnect {
  NSLog(@"Did disconnect from device");
  [self.navigationController popToRootViewControllerAnimated:NO];
}

- (void)didFailToConnectToDevice:(GCKDevice *)device {
  NSLog(@"Did fail to connect to device");
}

#pragma mark - GCKGameManagerChannelDelegate

- (void)gameManagerChannelDidConnect:(GCKGameManagerChannel *)gameManagerChannel {
  GCKGameManagerState *currentState = gameManagerChannel.currentState;
  NSLog(@"gameManagerChannelDidConnect. applicationName:%@ maxPlayers:%ld",
        currentState.applicationName, (long)currentState.maxPlayers);

  // Always ensure there is an available player.
  [self.gameManagerChannel sendPlayerAvailableRequest:nil];
}

- (void)gameManagerChannel:(GCKGameManagerChannel *)gameManagerChannel
    didFailToConnectWithError:(NSError *)error {
  NSLog(@"didFailToConnectWithError:%@", error);

  // Disconnect and start all over again.
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  [delegate.chromecastDeviceController disconnectFromDevice];
  [self.navigationController popToRootViewControllerAnimated:NO];
}

- (void)gameManagerChannel:(GCKGameManagerChannel *)gameManagerChannel
   requestDidSucceedWithID:(NSInteger)requestID
                    result:(GCKGameManagerResult *)result {
  NSLog(@"requestDidSucceedWithID:%zd result:%@", requestID, result);
}

- (void)gameManagerChannel:(GCKGameManagerChannel *)gameManagerChannel
      requestDidFailWithID:(NSInteger)requestID
                     error:(NSError *)error {
  NSLog(@"requestDidFailWithID:%zd result:%@", requestID, error);
}

- (void)gameManagerChannel:(GCKGameManagerChannel *)gameManagerChannel
          stateDidChangeTo:(GCKGameManagerState *)currentState
                      from:(GCKGameManagerState *)previousState {
  if ([previousState connectedControllablePlayers].count > 0
      && [currentState connectedControllablePlayers].count == 0) {
    // When the player disconnects or drops, disconnect and start over again.
    AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
    [delegate.chromecastDeviceController disconnectFromDevice];
    [self.navigationController popToRootViewControllerAnimated:NO];
    return;
  }

  if ([currentState hasLobbyStateChanged:previousState]) {
      [self lobbyStateDidChangeTo:currentState.lobbyState
                             from:previousState.lobbyState];
  }
  if ([currentState hasGameStatusTextChanged:previousState]) {
      [self gameplayStateDidChangeTo:currentState.gameplayState
                                from:previousState.gameplayState];
  }
  if ([currentState hasGameDataChanged:previousState]) {
      [self gameDataDidChangeTo:currentState.gameData
                           from:previousState.gameData];
  }
  if ([currentState hasGameStatusTextChanged:previousState]) {
      [self gameStatusTextDidChangeTo:currentState.gameStatusText
                                 from:previousState.gameStatusText];
  }

  NSArray *changedPlayerIDs = [currentState getListOfChangedPlayers:previousState];
  for (NSString *changedPlayerID in changedPlayerIDs) {
    GCKPlayerInfo *currentPlayer = [currentState getPlayer:changedPlayerID];
    GCKPlayerInfo *previousPlayer = [previousState getPlayer:changedPlayerID];
    [self playerInfoDidChangeTo:currentPlayer
                           from:previousPlayer];
  }
}

- (void)gameManagerChannel:(GCKGameManagerChannel *)gameManagerChannel
     didReceiveGameMessage:(id)gameMessage
               forPlayerID:(NSString *)playerID {
  NSLog(@"didReceiveGameMessage:%@ forPlayerID:%@", gameMessage, playerID);
}

#pragma mark - Subclasses Can Override These

- (void)playerInfoDidChangeTo:(GCKPlayerInfo *)currentPlayer
                         from:(GCKPlayerInfo *)previousPlayer {
  NSLog(@"playerInfoDidChangeTo:%@ from:%@", currentPlayer, previousPlayer);
}

- (void)lobbyStateDidChangeTo:(GCKLobbyState)currentState
                         from:(GCKLobbyState)previousState {
  NSLog(@"lobbyStateDidChangeTo:%zd from:%zd", currentState, previousState);
}

- (void)gameplayStateDidChangeTo:(GCKGameplayState)currentState
                            from:(GCKGameplayState)previousState {
  NSLog(@"gameplayStateDidChangeTo:%zd from:%zd", currentState, previousState);
}

- (void)gameDataDidChangeTo:(id)currentGameData
                       from:(id)previousGameData {
  NSLog(@"gameDataDidChangeTo:%@ from:%@", currentGameData, previousGameData);
}

- (void)gameStatusTextDidChangeTo:(NSString *)currentGameStatusText
                             from:(NSString *)previousGameStatusText {
  NSLog(@"gameStatusTextDidChangeTo:%@ from:%@", currentGameStatusText, previousGameStatusText);
}

@end
