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

#import <UIKit/UIKit.h>

#import "ChromecastDeviceController.h"

static NSString *const kReceiverAppID = @"54E247D6";  //Replace with your app id

@interface ChromecastDeviceController () {
  UIImage *_btnImage;
  UIImage *_btnImageConnected;
}

@property GCKApplicationMetadata *applicationMetadata;
@property GCKDevice *selectedDevice;

@property bool deviceMuted;
@property bool isReconnecting;
@property(nonatomic) NSArray *idleStateToolbarButtons;
@property(nonatomic) NSArray *playStateToolbarButtons;
@property(nonatomic) NSArray *pauseStateToolbarButtons;
@property(nonatomic) UIImageView *toolbarThumbnailImage;
@property(nonatomic) NSURL *toolbarThumbnailURL;
@property(nonatomic) UILabel *toolbarTitleLabel;
@property(nonatomic) UILabel *toolbarSubTitleLabel;
@property(nonatomic) GCKMediaTextTrackStyle *textTrackStyle;
@property(nonatomic) NSString *sessionID;
@end

@implementation ChromecastDeviceController

- (id)init {
  self = [super init];
  if (self) {
    self.isReconnecting = NO;

    // Create filter criteria to only show devices that can run your app.
    GCKFilterCriteria *filterCriteria = [[GCKFilterCriteria alloc] init];
    filterCriteria = [GCKFilterCriteria criteriaForAvailableApplicationWithID:kReceiverAppID];

    // Initialize device scanner with filter criteria.
    self.deviceScanner = [[GCKDeviceScanner alloc] initWithFilterCriteria:filterCriteria];
  }
  return self;
}

- (BOOL)isConnected {
  return self.deviceManager.applicationConnectionState == GCKConnectionStateConnected;
}

- (void)toggleScan:(BOOL)start {
  if (start) {
    NSLog(@"Start Scan");

    // Let delegate know if we're try and reconnect to old device
    [self.deviceScanner addListener:self];
    [self.deviceScanner startScan];
  } else {
    NSLog(@"Stop Scan");
    [self.deviceScanner stopScan];
    [self.deviceScanner removeListener:self];
  }
}

- (void)connectToDevice:(GCKDevice *)device {
  NSLog(@"Device address: %@:%d", device.ipAddress, (unsigned int) device.servicePort);

  // Inform delegate that we will connect to device
  if ([self.delegate respondsToSelector:@selector(willConnectToDevice:)]) {
    [self.delegate willConnectToDevice:device];
  }

  self.selectedDevice = device;
  NSDictionary *info = [[NSBundle mainBundle] infoDictionary];
  NSString *appIdentifier = [info objectForKey:@"CFBundleIdentifier"];
  self.deviceManager =
      [[GCKDeviceManager alloc] initWithDevice:self.selectedDevice clientPackageName:appIdentifier];
  self.deviceManager.delegate = self;
  [self.deviceManager connect];
}

- (void)disconnectFromDevice {
  NSLog(@"Disconnecting device:%@", self.selectedDevice.friendlyName);
  // We're not going to stop the applicaton in case we're not the last client.
  [self.deviceManager leaveApplication];
  [self.deviceManager disconnect];

  // Clear the previous session. This prevents the app from auto reconnecting after disconnecting.
  [self clearPreviousSession];
}

- (void)stopAndDisconnectFromDevice {
  NSLog(@"Disconnecting and stopping receiver app on device:%@", self.selectedDevice.friendlyName);
  [self.deviceManager stopApplication];
  [self.deviceManager disconnect];

  // Clear the previous session. This prevents the app from auto reconnecting after disconnecting.
  [self clearPreviousSession];
}

- (void)updateToolbarForViewController:(UIViewController *)viewController {
  [self updateToolbarStateIn:viewController];
}

- (void)setDeviceVolume:(float)deviceVolume {
  [self.deviceManager setVolume:deviceVolume];
}

- (void)adjustVolume:(BOOL)goingUp {
  float idealVolume = self.deviceVolume + (goingUp ? 0.1 : -0.1);
  idealVolume = MIN(1.0, MAX(0.0, idealVolume));

  [self.deviceManager setVolume:idealVolume];
}

#pragma mark - GCKDeviceManagerDelegate

- (void)deviceManagerDidConnect:(GCKDeviceManager *)deviceManager {

  if (!self.isReconnecting) {
    [self.deviceManager launchApplication:kReceiverAppID];
  } else {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString* lastSessionID = [defaults valueForKey:@"lastSessionID"];
    [self.deviceManager joinApplication:kReceiverAppID sessionID:lastSessionID];
  }
  [self updateCastIconButtonStates];
}

- (void)deviceManager:(GCKDeviceManager *)deviceManager
    didConnectToCastApplication:(GCKApplicationMetadata *)applicationMetadata
                      sessionID:(NSString *)sessionID
            launchedApplication:(BOOL)launchedApplication {
  self.sessionID = sessionID;
  self.isReconnecting = NO;
  self.applicationMetadata = applicationMetadata;
  if ([self.delegate respondsToSelector:@selector(didConnectToDevice:)]) {
    [self.delegate didConnectToDevice:self.selectedDevice];
  }

  // Store sessionID in case of restart
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  [defaults setObject:sessionID forKey:@"lastSessionID"];
  [defaults setObject:[self.selectedDevice deviceID] forKey:@"lastDeviceID"];
  [defaults synchronize];
}

- (void)deviceManager:(GCKDeviceManager *)deviceManager
      didFailToConnectToApplicationWithError:(NSError *)error {
  if (self.isReconnecting && [error code] == GCKErrorCodeApplicationNotRunning) {
    // Expected error when unable to reconnect to previous session after another
    // application has been running
    self.isReconnecting = false;
    [self clearPreviousSession];
  } else {
    [self showError:error.description];
  }

  if ([self.delegate respondsToSelector:@selector(didFailToConnectToDevice:)]) {
    [self.delegate didFailToConnectToDevice:self.selectedDevice];
  }

  [self updateCastIconButtonStates];
}

- (void)deviceManager:(GCKDeviceManager *)deviceManager
    didFailToConnectWithError:(GCKError *)error {
  [self showError:error.description];

  [self deviceDisconnectedForgetDevice:YES];
  [self updateCastIconButtonStates];
}

- (void)deviceManager:(GCKDeviceManager *)deviceManager didDisconnectWithError:(GCKError *)error {
  NSLog(@"Received notification that device disconnected");

  // Network errors are displayed in the suspend code.
  if (error && (error.code != GCKErrorCodeNetworkError)) {
    [self showError:error.description];
  }

  // Forget the device except when the error is a connectivity related, such a WiFi problem.
  [self deviceDisconnectedForgetDevice:![self isRecoverableError:error]];
  [self updateCastIconButtonStates];
}

- (void)deviceManager:(GCKDeviceManager *)deviceManager
    didDisconnectFromApplicationWithError:(NSError *)error {
  NSLog(@"Received notification that app disconnected");
  self.sessionID = nil;
  if (error) {
    NSLog(@"Application disconnected with error: %@", error);
  }

  // Forget the device except when the error is a connectivity related, such a WiFi problem.
  [self deviceDisconnectedForgetDevice:![self isRecoverableError:error]];
  [self updateCastIconButtonStates];
}

- (BOOL)isRecoverableError:(NSError *)error {
  if (!error) {
    return NO;
  }

  return (error.code == GCKErrorCodeNetworkError ||
      error.code == GCKErrorCodeTimeout ||
      error.code == GCKErrorCodeAppDidEnterBackground);
}

- (void)deviceDisconnectedForgetDevice:(BOOL)clear {
  self.selectedDevice = nil;
  self.sessionID = nil;
  if ([self.delegate respondsToSelector:@selector(didDisconnect)]) {
    [self.delegate didDisconnect];
  }

  if (clear) {
    [self clearPreviousSession];
  }
}

- (void)clearPreviousSession {
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  [defaults removeObjectForKey:@"lastDeviceID"];
  [defaults synchronize];
}

- (void)deviceManager:(GCKDeviceManager *)deviceManager
    didReceiveApplicationMetadata:(GCKApplicationMetadata *)applicationMetadata {
  self.applicationMetadata = applicationMetadata;
}

- (void)deviceManager:(GCKDeviceManager *)deviceManager
    volumeDidChangeToLevel:(float)volumeLevel
                   isMuted:(BOOL)isMuted {
  _deviceVolume = volumeLevel;
  self.deviceMuted = isMuted;

  // Fire off a notification, so no matter what controller we are in, we can show the volume
  // slider
  [[NSNotificationCenter defaultCenter] postNotificationName:@"Volume changed" object:self];
}

- (void)deviceManager:(GCKDeviceManager *)deviceManager
    didSuspendConnectionWithReason:(GCKConnectionSuspendReason)reason {
  if (reason == GCKConnectionSuspendReasonAppBackgrounded) {
    NSLog(@"Connection Suspended: App Backgrounded");
  } else {
    [self showError:@"Connection Suspended: Network"];
    [self deviceDisconnectedForgetDevice:YES];
    // Update cast icons on next runloop so all cast objects have time to update.
    [self performSelector:@selector(updateCastIconButtonStates) withObject:nil afterDelay:0];
  }
}

- (void)deviceManagerDidResumeConnection:(GCKDeviceManager *)deviceManager
                     rejoinedApplication:(BOOL)rejoinedApplication {
  NSLog(@"Connection Resumed. App Rejoined: %@", rejoinedApplication ? @"YES" : @"NO");
}

#pragma mark - GCKDeviceScannerListener

- (void)deviceDidComeOnline:(GCKDevice *)device {
  NSLog(@"Device found - %@", device.friendlyName);

  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  NSString* lastDeviceID = [defaults objectForKey:@"lastDeviceID"];

  if (lastDeviceID && [[device deviceID] isEqualToString:lastDeviceID]){
    self.isReconnecting = true;
    [self connectToDevice:device];
  }

  // Trigger an update in the next run loop so we pick up the updated devices array.
  if ([self.delegate respondsToSelector:@selector(didDiscoverDeviceOnNetwork)]) {
    [self.delegate didDiscoverDeviceOnNetwork];
  }
}

- (void)deviceDidGoOffline:(GCKDevice *)device {
  NSLog(@"Device went offline - %@", device.friendlyName);
  // Trigger an update in the next run loop so we pick up the updated devices array.
  [self performSelector:@selector(updateCastIconButtonStates) withObject:nil afterDelay:0];
}

#pragma mark - implementation

- (void)showError:(NSString *)errorDescription {
  NSLog(@"Received error: %@", errorDescription);
  NSString *errorTitle = @"Cast Error";
  // Might be better to replace errorDescription in this alert with less programmer-centric text
  // since errorDescription was obtained from an NSError object.
  UIAlertView *alert = [[UIAlertView alloc] initWithTitle:NSLocalizedString(errorTitle, nil)
                                                  message:NSLocalizedString(errorDescription, nil)
                                                 delegate:nil
                                        cancelButtonTitle:NSLocalizedString(@"OK", nil)
                                        otherButtonTitles:nil];
  [alert show];
}

- (NSString *)getDeviceName {
  return self.selectedDevice ? self.selectedDevice.friendlyName : @"";
}

- (void)updateCastIconButtonStates {
  // Hide the button if there are no devices found.
  UIButton *chromecastButton = (UIButton *)self.chromecastBarButton.customView;
  if (self.deviceScanner.devices.count == 0) {
    chromecastButton.hidden = YES;
  } else {
    chromecastButton.hidden = NO;
    if (self.deviceManager &&
        self.deviceManager.applicationConnectionState == GCKConnectionStateConnected) {
      [chromecastButton.imageView stopAnimating];
      // Hilight with yellow tint color.
      [chromecastButton setTintColor:[UIColor yellowColor]];
      [chromecastButton setImage:_btnImageConnected forState:UIControlStateNormal];
    } else {
      // Remove the highlight.
      [chromecastButton setTintColor:nil];
      [chromecastButton setImage:_btnImage forState:UIControlStateNormal];
    }
  }
}

- (void)updateToolbarStateIn:(UIViewController *)viewController {
  // Ignore this view controller if it is not visible.
  if (!(viewController.isViewLoaded && viewController.view.window)) {
    return;
  }
}

@end
