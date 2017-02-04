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

#import "AppDelegate.h"
#import "DeviceTableViewController.h"
#import "SpriteDemoViewController.h"
#import "UIButton+Extensions.h"

@interface SpriteDemoViewController() {
  GCKGameManagerChannel *_gameManagerChannel;
}

@end

@implementation SpriteDemoViewController

#pragma mark - UIViewController

- (void)viewDidLoad {
  [super viewDidLoad];

  // Disable add sprite button until we are connected and a player is available from this device.
  [self.addSpriteButton setEnabled:NO];

  // Become delegate for ChromecastDeviceController
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  delegate.chromecastDeviceController.delegate = self;

  // Become delegate for GCKGameManagerChannel
  _gameManagerChannel = [[GCKGameManagerChannel alloc]
                         initWithSessionID:delegate.chromecastDeviceController.sessionID];
  _gameManagerChannel.delegate = self;
  [delegate.chromecastDeviceController.deviceManager addChannel:_gameManagerChannel];
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
  NSLog(@"Have connected to device");
}

- (void)didDisconnect {
  NSLog(@"Did disconnect from device");
  [self.navigationController popViewControllerAnimated:YES];
}

#pragma mark - GCKGameManagerChannelDelegate Methods

- (void)gameManagerChannelDidConnect:(GCKGameManagerChannel *)gameManagerChannel {
  GCKGameManagerState *currentState = gameManagerChannel.currentState;
  NSLog(@"gameManagerChannelDidConnect. applicationName:%@ maxPlayers:%ld",
        currentState.applicationName, (long)currentState.maxPlayers);

  // Once connected, add a player who can send messages.
  [_gameManagerChannel sendPlayerAvailableRequest:nil];
}

- (void)gameManagerChannel:(GCKGameManagerChannel *)gameManagerChannel
 didFailToConnectWithError:(NSError *)error {
  NSLog(@"didFailToConnectWithError:%@", error);
  NSString *errorTitle = @"GCKGameManagerChannel Error";
  UIAlertView *alert = [[UIAlertView alloc] initWithTitle:NSLocalizedString(errorTitle, nil)
                                                  message:NSLocalizedString(error.description, nil)
                                                 delegate:nil
                                        cancelButtonTitle:NSLocalizedString(@"OK", nil)
                                        otherButtonTitles:nil];
  [alert show];
}

- (void)gameManagerChannel:(GCKGameManagerChannel *)gameManagerChannel
   requestDidSucceedWithID:(NSInteger)requestID
                    result:(GCKGameManagerResult *)result {
  NSLog(@"requestDidSucceedWithID:%zd result:%@", requestID, result);

  // Enable the "add sprite" button after the player request succeeds.
  [self.addSpriteButton setEnabled:YES];
}

- (void)gameManagerChannel:(GCKGameManagerChannel *)gameManagerChannel
          stateDidChangeTo:(GCKGameManagerState *)currentState
                      from:(GCKGameManagerState *)previousState {
  NSLog(@"game state changed!");
}

- (void)gameManagerChannel:(GCKGameManagerChannel *)gameManagerChannel
    didReceiveGameMessage:(id)gameMessage
               forPlayerID:(NSString *)playerID {
  NSLog(@"didReceiveGameMessage:%@ forPlayerID:%@", gameMessage, playerID);
}

- (void)gameManagerChannel:(GCKGameManagerChannel *)gameManagerChannel
      requestDidFailWithID:(NSInteger)requestID
                     error:(NSError *)error {
  NSLog(@"requestDidFailWithID:%zd result:%@", requestID, error);
  NSString *errorTitle = @"GCKGameManagerChannel Error";
  UIAlertView *alert = [[UIAlertView alloc] initWithTitle:NSLocalizedString(errorTitle, nil)
                                                  message:NSLocalizedString(error.description, nil)
                                                 delegate:nil
                                        cancelButtonTitle:NSLocalizedString(@"OK", nil)
                                        otherButtonTitles:nil];
  [alert show];
}

#pragma mark - IBActions

- (IBAction)openCastMenu:(id)sender {
  UIStoryboard *storyboard = self.storyboard;
  DeviceTableViewController *dvc =
      [storyboard instantiateViewControllerWithIdentifier:@"DeviceTableView"];
  [self presentViewController:dvc animated:YES completion:nil];
}

- (IBAction)addSprite:(id)sender {
  if (![_gameManagerChannel isInitialConnectionEstablished]) {
    return;
  }

  // Send a JSON message with type = 1, which the receiver will interpret as creating a sprite.
  NSDictionary *SpriteDemoMessage = @{
    @"type": @(1),
  };
  NSLog(@"Sending JSON message: %@", [GCKJSONUtils writeJSON:SpriteDemoMessage]);
  [_gameManagerChannel sendGameMessage:SpriteDemoMessage];
}

@end
