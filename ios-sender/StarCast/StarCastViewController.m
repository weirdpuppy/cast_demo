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
#import "StarCastViewController.h"
#import "UIButton+Extensions.h"

@interface StarCastViewController() {
  GCKGameManagerChannel *_gameManagerChannel;
  NSTimer *_repeatingTimer;
  BOOL _hasMoved;
  BOOL _hasFired;
  float _movePosition;
}

@end

@implementation StarCastViewController

#pragma mark - Constants

#pragma mark - UIViewController

- (void)viewDidLoad {
  [super viewDidLoad];

  _hasMoved = NO;
  _hasFired = NO;
  _movePosition = 0.5;

  // Disable fire and move buttons until we're connected and a player is available from this device.
  [self.fireButton setEnabled:NO];
  [self.moveButton setEnabled:NO];

  // Become delegate for ChromecastDeviceController
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  delegate.chromecastDeviceController.delegate = self;

  // Become delegate for GCKGameManagerChannel
  _gameManagerChannel = [[GCKGameManagerChannel alloc]
                         initWithSessionID:delegate.chromecastDeviceController.sessionID];
  _gameManagerChannel.delegate = self;
  [delegate.chromecastDeviceController.deviceManager addChannel:_gameManagerChannel];

  // Run a timer that will send messages to the receiver at a fixed rate.
  if (_repeatingTimer) {
    [_repeatingTimer invalidate];
  }
  _repeatingTimer = [NSTimer scheduledTimerWithTimeInterval:0.05
                                                     target:self
                                                   selector:@selector(handleTimer:)
                                                   userInfo:nil
                                                    repeats:YES];
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

  // Enable the fire and move buttons after the player request succeeds.
  [self.fireButton setEnabled:YES];
  [self.moveButton setEnabled:YES];
}

- (void)gameManagerChannel:(GCKGameManagerChannel *)gameManagerChannel
          stateDidChangeTo:(GCKGameManagerState *)currentState
                      from:(GCKGameManagerState *)previousState {
  NSLog(@"game state changed!");

  if (currentState.connectedControllablePlayers.count == 0
      && previousState.connectedControllablePlayers.count > 0) {
    NSLog(@"This sender no longer has connected controllable players. "
          "Automatically reconnecting last player...");
    [_gameManagerChannel sendPlayerAvailableRequest:nil];
  }
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

/** Pan to move recognizer **/
- (IBAction)moveForPanRecognizer:(UIPanGestureRecognizer *)recognizer {
  if (![_gameManagerChannel isInitialConnectionEstablished]) {
    return;
  }

  CGRect moveButtonFrame = [self.moveButton frame];
  CGPoint translationInView = [recognizer translationInView:self.moveButton];
  _movePosition = 0.5 + translationInView.y / moveButtonFrame.size.height;
  if (_movePosition < 0.0) {
    _movePosition = 0.0;
  } else if (_movePosition > 1.0) {
    _movePosition = 1.0;
  }
  _hasMoved = YES;
}


- (IBAction)fire:(id)sender {
  if (![_gameManagerChannel isInitialConnectionEstablished]) {
    return;
  }
  _hasFired = YES;
}

#pragma mark - Timer

- (void)handleTimer:(NSTimer *)timer {
  if (![_gameManagerChannel isInitialConnectionEstablished] || (!_hasMoved && !_hasFired)) {
    return;
  }

  NSDictionary *StarCastMessage = @{
    @"move": @(_movePosition),
    @"fire": @(_hasFired)
  };

  [_gameManagerChannel sendGameMessage:StarCastMessage];
  _hasMoved = NO;
  _hasFired = NO;
}

@end
