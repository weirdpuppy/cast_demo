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
#import "StartViewController.h"
#import "UIButton+Extensions.h"

@implementation StartViewController

#pragma mark - UIViewController
- (void)viewDidLoad {
  [super viewDidLoad];

  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  [self.wizardImageView setImage:[delegate getAvatarImage]];
  [self.nameLabel setText:delegate.gameInfo.playerName];
}

#pragma mark - SpellCastViewController

- (void)playerInfoDidChangeTo:(GCKPlayerInfo *)currentPlayer
                         from:(GCKPlayerInfo *)previousPlayer {
  [super playerInfoDidChangeTo:currentPlayer from:previousPlayer];

  // If the controllable player became available now (from reconnecting), update to ready state.
  if (currentPlayer && currentPlayer.isControllable
      && currentPlayer.playerState == GCKPlayerStateAvailable) {
    AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
    [self.gameManagerChannel sendPlayerReadyRequest:[delegate.gameInfo createPlayerReadyData]];
  }
}

#pragma mark - IBActions

- (IBAction)openCastMenu:(id)sender {
  UIStoryboard *storyboard = self.storyboard;
  DeviceTableViewController *dvc =
      [storyboard instantiateViewControllerWithIdentifier:@"DeviceTableView"];
  [self presentViewController:dvc animated:YES completion:nil];
}

- (IBAction)start:(id)sender {
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  id playingData = [SPCGameInfo
                    createPlayerPlayingDataWithDifficultySetting:SPCGameDifficultySettingEasy];
  [self.gameManagerChannel sendPlayerPlayingRequest:playingData];

  UIStoryboard *storyboard = self.storyboard;
  ProgressViewController *dvc = [storyboard
      instantiateViewControllerWithIdentifier:@"ProgressView"];
  [dvc updateDisplayMode:ProgressViewDisplayModeHostStarting];
  delegate.chromecastDeviceController.delegate = dvc;
  [self.navigationController pushViewController:dvc animated:YES];
}

@end
