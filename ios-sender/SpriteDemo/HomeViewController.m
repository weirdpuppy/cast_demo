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
#import "SpriteDemoViewController.h"
#import "UINavigationController+CompletionHandler.h"

@interface HomeViewController () {
  BOOL _isConnecting;
}
@end

@implementation HomeViewController

#pragma mark - UIViewController

- (void)viewDidLoad {
  [super viewDidLoad];
  [self selectCastDevice];
  _isConnecting = NO;
}

- (void)viewWillAppear:(BOOL)animated {
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  delegate.chromecastDeviceController.delegate = self;
}

- (void)didReceiveMemoryWarning {
  [super didReceiveMemoryWarning];
  // Dispose of any resources that can be recreated.
}

- (BOOL)prefersStatusBarHidden {
  return YES;
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
  NSLog(@"Will connect to device");
  _isConnecting = YES;

  [[self connectButton] setHidden:YES];
  self.loadingText.text = [NSString stringWithFormat:@"Connecting to %@...", [device friendlyName]];
  self.loadingText.hidden = NO;
  self.loadingAnimation.hidden = NO;
}

- (void)didConnectToDevice:(GCKDevice *)device {
  NSLog(@"Have connected to device");

  // Transition to next view and add it as delegate
  UIStoryboard *storyboard = self.storyboard;
  SpriteDemoViewController *dvc =
      [storyboard instantiateViewControllerWithIdentifier:@"SpriteDemoView"];
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  delegate.chromecastDeviceController.delegate = dvc;

  [self.navigationController pushViewController:dvc animated:YES completion:^ {
    self.loadingText.hidden = YES;
    self.loadingAnimation.hidden = YES;
    self.connectButton.hidden = NO;
  }];
}

- (void)didFailToConnectToDevice:(GCKDevice *)device {
  self.loadingText.hidden = YES;
  self.loadingAnimation.hidden = YES;
  self.connectButton.hidden = NO;
}

- (void)didDisconnect {
  self.loadingText.hidden = YES;
  self.loadingAnimation.hidden = YES;
  self.connectButton.hidden = NO;
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

@end
