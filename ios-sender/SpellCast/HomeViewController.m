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
#import "ChromecastDeviceController.h"
#import "DeviceTableViewController.h"
#import "HomeViewController.h"
#import "UINavigationController+CompletionHandler.h"
#import "WizardViewController.h"

@interface HomeViewController () {
  BOOL _isConnecting;
}
@end

@implementation HomeViewController

#pragma mark - UIViewController

- (void)viewDidLoad {
  [super viewDidLoadWithNoGameManagerDelegation];
  [self selectCastDevice];
  _isConnecting = NO;
}

- (void)viewWillAppear:(BOOL)animated {
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  delegate.chromecastDeviceController.delegate = self;
}

#pragma mark - IBActions

- (IBAction)connect:(id)sender {
  NSLog(@"Connect pressed");
  self.loadingText.text = [NSString stringWithFormat:@"Searching for Cast devices"];
  [self selectCastDevice];
}

/** Retry button **/
- (IBAction)retryConnect:(id)sender {
  NSLog(@"Retry pressed");
  self.loadingText.text = [NSString stringWithFormat:@"Trying to reconnect you now..."];
  [self.castDeviceController toggleScan:YES];
  [self selectCastDevice];
}

/** Learn more link **/
- (IBAction)learnMore:(id)sender {
  NSLog(@"Learn more pressed");
  // Might want to replace this URL with a game-specific help page or remove the learn more link.
  [[UIApplication sharedApplication]
      openURL:[NSURL URLWithString:@"https://www.google.com/chromecast/"]];
}

#pragma mark - ChromecastDeviceDelegate

- (void)willConnectToDevice:(GCKDevice *)device {
  [super willConnectToDevice:device];

  _isConnecting = YES;

  self.connectButton.hidden = YES;
  self.loadingText.text = [NSString stringWithFormat:@"Connecting to %@...", [device friendlyName]];
  self.loadingText.hidden = NO;
  self.loadingAnimation.hidden = NO;
}

- (void)didConnectToDevice:(GCKDevice *)device {
  [super didConnectToDevice:device];
  [self maybeTransitionView];
}

- (void)didFailToConnectToDevice:(GCKDevice *)device {
  [super didFailToConnectToDevice:device];

  self.loadingText.hidden = YES;
  self.loadingAnimation.hidden = YES;
  self.connectButton.hidden = NO;
}

- (void)didDisconnect {
  [super didDisconnect];

  self.loadingText.hidden = YES;
  self.loadingAnimation.hidden = YES;
  self.connectButton.hidden = NO;
}

#pragma mark - SpellCastViewController

- (void)gameManagerChannel:(GCKGameManagerChannel *)gameManagerChannel
   requestDidSucceedWithID:(NSInteger)requestID
                    result:(GCKGameManagerResult *)result {
  [super gameManagerChannel:gameManagerChannel requestDidSucceedWithID:requestID result:result];
  [self maybeTransitionView];
}

- (void)gameplayStateDidChangeTo:(GCKGameplayState)currentState
                            from:(GCKGameplayState)previousState {
  [super gameplayStateDidChangeTo:currentState from:previousState];
  [self maybeTransitionView];
}

- (void)gameManagerChannel:(GCKGameManagerChannel *)gameManagerChannel
      requestDidFailWithID:(NSInteger)requestID error:(NSError *)error {
  if (error.code == GCKGameStatusCodeTooManyPlayers) {
    // An example of showing a game manager error in the home view screen.
    self.loadingText.hidden = YES;
    self.loadingAnimation.hidden = YES;
    [self showErrorWithTitle:@"Game is full!"
                 description:@"Looks like this game has all the players it can handle.\n"
                              "Wait for this game to finish and try to join again."];
    // Disconnect to let the user tap retry to reconnect again.
    [self.castDeviceController disconnectFromDevice];
  } else {
    // The default is to log the error to the console.
    [super gameManagerChannel:gameManagerChannel requestDidFailWithID:requestID error:error];
  }
}

#pragma mark - ErrorView

- (void)showErrorWithTitle:(NSString *)title description:(NSString *)description {
  self.errorTitleLabel.text = title;
  self.errorDescriptionLabel.text = description;
  self.errorView.hidden = NO;
}

#pragma mark - Implementation

- (ChromecastDeviceController *)castDeviceController {
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  return delegate.chromecastDeviceController;
}

- (void)selectCastDevice {
  self.connectButton.hidden = YES;
  self.errorView.hidden = YES;
  self.loadingText.hidden = NO;
  self.loadingAnimation.hidden = NO;
  _isConnecting = NO;

  // Allow three additional seconds for search
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 3 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
    if (_isConnecting) {
      // Reconnection is taking place
      return;
    }
    if (![self.castDeviceController.deviceScanner hasDiscoveredDevices]) {
      self.loadingText.hidden = YES;
      self.loadingAnimation.hidden = YES;
      [self showErrorWithTitle:@"No Cast devices found"
                 description:@"This app requires a Google Cast device.\n"
                              "Make sure you're on the same Wifi network"];
    } else {
      UIStoryboard *storyboard = self.storyboard;
      DeviceTableViewController *dvc =
          [storyboard instantiateViewControllerWithIdentifier:@"DeviceTableView"];
      [self presentViewController:dvc animated:YES completion:^ {
        self.loadingText.hidden = YES;
        self.loadingAnimation.hidden = YES;
        self.connectButton.hidden = NO;
      }];
    }
  });
}

- (void)maybeTransitionView {
  if (![self.gameManagerChannel isInitialConnectionEstablished]) {
    NSLog(@"Cannot transition view yet - initial connection not yet established.");
    return;
  }
  GCKGameManagerState *currentState = self.gameManagerChannel.currentState;

  // Need a connected controllable player ID to transition.
  NSArray *controllableConnectedPlayers = [currentState connectedControllablePlayers];
  if (!controllableConnectedPlayers || !controllableConnectedPlayers.count) {
    NSLog(@"Cannot transition view yet - no controllable players yet.");
    return;
  }

  // Should no longer be in unknown or loading state to transition.
  GCKGameplayState gameplayState = currentState.gameplayState;
  if (gameplayState == GCKGameplayStateUnknown || gameplayState == GCKGameplayStateLoading) {
    NSLog(@"Cannot transition view yet - gameplay state is unknown or loading.");
    return;
  }

  // Let the user know if the lobby is closed.
  if (currentState.lobbyState == GCKLobbyStateClosed) {
    NSLog(@"Cannot transition view - the lobby is closed.");
    self.loadingText.hidden = YES;
    self.loadingAnimation.hidden = YES;
    [self showErrorWithTitle:@"Game is progress!"
                 description:@"Looks like there are wizards in battle already.\n"
                              "Wait for this game to finish and try to join again."];
    // Disconnect to let the user tap retry to reconnect again.
    [self.castDeviceController disconnectFromDevice];
    return;
  }

  UIStoryboard *storyboard = self.storyboard;
  WizardViewController *dvc =
      [storyboard instantiateViewControllerWithIdentifier:@"WizardView"];
  self.castDeviceController.delegate = dvc;

  [self.navigationController pushViewController:dvc animated:YES completion:^ {
    self.loadingText.hidden = YES;
    self.loadingAnimation.hidden = YES;
    self.connectButton.hidden = NO;
  }];
}

@end
