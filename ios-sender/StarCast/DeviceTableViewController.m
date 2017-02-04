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

@implementation DeviceTableViewController {
  BOOL _isManualVolumeChange;
  UISlider *_volumeSlider;
}

- (ChromecastDeviceController *)castDeviceController {
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  return delegate.chromecastDeviceController;
}

- (void)viewDidLoad {
  [super viewDidLoad];
}

- (void)viewWillAppear:(BOOL)animated {
  [super viewDidLoad];
  // Do any additional setup after loading the view, typically from a nib.

  if (self.castDeviceController.isConnected == YES) {
    [[self castIconView] setImage:[UIImage imageNamed:@"icon_cast_on_filled"]];
  }
  else {
    [[self castIconView] setImage:[UIImage imageNamed:@"icon_cast_off"]];
  }
}

- (BOOL)prefersStatusBarHidden {
  return YES;
}

#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
  // Return the number of sections.
  return 2;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
  if (section == 1) {
    return 1;
  }
  // Return the number of rows in the section.
  if (self.castDeviceController.isConnected == NO) {
    self.title = @"Connect to";
    return self.castDeviceController.deviceScanner.devices.count;
  } else {
    self.title = self.castDeviceController.deviceName;
    return 2;
  }
}

- (UITableViewCell *)tableView:(UITableView *)tableView
         cellForRowAtIndexPath:(NSIndexPath *)indexPath {
  static NSString *CellIdForDeviceName = @"deviceName";
  static NSString *CellIdForDisconnectButton = @"disconnectButton";
  static NSString *CellIdForVolumeControl = @"volumeController";
  static NSString *CellIdForVersion = @"version";
  static int TagForVolumeSlider = 201;

  UITableViewCell *cell;

  if (indexPath.section == 1) {
    cell = [tableView dequeueReusableCellWithIdentifier:CellIdForVersion forIndexPath:indexPath];
    NSString *ver =
        [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"];
    [cell.textLabel setText:[NSString stringWithFormat:@"StarCast-iOS version %@", ver]];
    cell.userInteractionEnabled = NO;
    return cell;
  }

  if (self.castDeviceController.isConnected == NO) {
    cell = [tableView dequeueReusableCellWithIdentifier:CellIdForDeviceName forIndexPath:indexPath];

    // Configure the cell...
    GCKDevice *device =
        [self.castDeviceController.deviceScanner.devices objectAtIndex:indexPath.row];
    cell.textLabel.text = device.friendlyName;
    cell.detailTextLabel.text = device.statusText ? device.statusText : device.modelName;
  } else {
    if (indexPath.row == 0) {
      // Display volume control as first cell.
      cell = [tableView dequeueReusableCellWithIdentifier:CellIdForVolumeControl
                                             forIndexPath:indexPath];

      _volumeSlider = (UISlider *)[cell.contentView viewWithTag:TagForVolumeSlider];
      _volumeSlider.minimumValue = 0;
      _volumeSlider.maximumValue = 1.0;
      _volumeSlider.value = [self castDeviceController].deviceVolume;
      _volumeSlider.continuous = NO;
      [_volumeSlider addTarget:self
                        action:@selector(sliderValueChanged:)
              forControlEvents:UIControlEventValueChanged];
      [[NSNotificationCenter defaultCenter]
          addObserver:self
             selector:@selector(receivedVolumeChangedNotification:)
                 name:@"Volume changed"
               object:[self castDeviceController]];
      [cell setSelectionStyle:UITableViewCellSelectionStyleNone];
    } else {
      // Display disconnect control as last cell.
      cell = [tableView dequeueReusableCellWithIdentifier:CellIdForDisconnectButton
                                             forIndexPath:indexPath];
    }
  }

  return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
  if (self.castDeviceController.isConnected == NO) {
    if (indexPath.section == 0) {
      GCKDevice *device =
          [self.castDeviceController.deviceScanner.devices objectAtIndex:indexPath.row];
      NSLog(@"Selecting device:%@", device.friendlyName);
      [self.castDeviceController connectToDevice:device];

      // Dismiss the view.
      [self dismissViewControllerAnimated:YES completion:nil];
    } else {
      [tableView deselectRowAtIndexPath:indexPath animated:YES];
    }
  } else {
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
  }
}

- (void)tableView:(UITableView *)tableView
    accessoryButtonTappedForRowWithIndexPath:(NSIndexPath *)indexPath {
  NSLog(@"Accesory button tapped");
}

- (IBAction)disconnectDevice:(id)sender {
  [self.castDeviceController disconnectFromDevice];

  // Dismiss the view.
  [self dismissViewControllerAnimated:YES completion:nil];
}

- (IBAction)dismissView:(id)sender {
  [self dismissViewControllerAnimated:YES completion:nil];
}

# pragma mark - volume
- (void)receivedVolumeChangedNotification:(NSNotification *) notification {
  if (!_isManualVolumeChange) {
    ChromecastDeviceController *deviceController =
        (ChromecastDeviceController *) notification.object;
    _volumeSlider.value = deviceController.deviceVolume;
  }
}

- (IBAction)sliderValueChanged:(id)sender {
  UISlider *slider = (UISlider *) sender;
  _isManualVolumeChange = YES;
  NSLog(@"Got new slider value: %.2f", slider.value);
  [self castDeviceController].deviceVolume = slider.value;
  _isManualVolumeChange = NO;
}

@end
