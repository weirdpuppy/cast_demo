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
#import "ProgressViewController.h"
#import "ReadyViewController.h"
#import "StartViewController.h"
#import "UIButton+Extensions.h"

@implementation ReadyViewController

#pragma mark - UIViewController
- (void)viewDidLoad {
  [super viewDidLoad];

  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  [self.wizardImageView setImage:[delegate getAvatarImage]];
  [self.nameLabel setText:delegate.gameInfo.playerName];
}

#pragma mark - IBActions

- (IBAction)openCastMenu:(id)sender {
  UIStoryboard *storyboard = self.storyboard;
  DeviceTableViewController *dvc =
      [storyboard instantiateViewControllerWithIdentifier:@"DeviceTableView"];
  [self presentViewController:dvc animated:YES completion:nil];
}

- (IBAction)goBack:(id)sender {
  [self.navigationController popViewControllerAnimated:NO];
}

- (IBAction)goNext:(id)sender {
  GCKGameManagerChannel *gameManagerChannel = self.gameManagerChannel;
  GCKGameManagerState *currentState = gameManagerChannel.currentState;
  GCKPlayerInfo *playerInfo = currentState.connectedControllablePlayers[0];
  BOOL isHost = NO;
  if (playerInfo.playerData && playerInfo.playerData != [NSNull null]) {
    isHost = [playerInfo.playerData gck_boolForKey:@"host" withDefaultValue:NO];
  }

  // Update this player to ready state.
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  [gameManagerChannel sendPlayerReadyRequest:[delegate.gameInfo createPlayerReadyData]];

  UIStoryboard *storyboard = self.storyboard;
  if (isHost) {
    StartViewController *dvc = [storyboard instantiateViewControllerWithIdentifier:@"StartView"];
    delegate.chromecastDeviceController.delegate = dvc;
    [self.navigationController pushViewController:dvc animated:YES];
  } else {
    ProgressViewController *dvc = [storyboard
        instantiateViewControllerWithIdentifier:@"ProgressView"];
    [dvc updateDisplayMode:ProgressViewDisplayModeWaitingForPlayers];
    delegate.chromecastDeviceController.delegate = dvc;
    [self.navigationController pushViewController:dvc animated:YES];
  }
}

@end
