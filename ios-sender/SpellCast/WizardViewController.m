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
#import "NameViewController.h"
#import "UIButton+Extensions.h"
#import "WizardViewController.h"

@implementation WizardViewController

#pragma mark - UIViewController

- (void)viewDidLoad {
  [super viewDidLoad];

  [self updateWizards];
}

#pragma mark - IBActions

- (IBAction)openCastMenu:(id)sender {
  UIStoryboard *storyboard = self.storyboard;
  DeviceTableViewController *dvc =
      [storyboard instantiateViewControllerWithIdentifier:@"DeviceTableView"];
  [self presentViewController:dvc animated:YES completion:nil];
}

- (IBAction)selectWizard:(id)sender {
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  if (sender == self.wizardButton1) {
    delegate.gameInfo.avatarIndex = 0;
  } else if (sender == self.wizardButton2) {
    delegate.gameInfo.avatarIndex = 1;
  } else if (sender == self.wizardButton3) {
    delegate.gameInfo.avatarIndex = 2;
  } else if (sender == self.wizardButton4) {
    delegate.gameInfo.avatarIndex = 3;
  }
  [self updateWizards];
}

- (IBAction)goNext:(id)sender {
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  NSLog(@"Player wizard set to %d", delegate.gameInfo.avatarIndex);

  UIStoryboard *storyboard = self.storyboard;
  NameViewController *dvc =
      [storyboard instantiateViewControllerWithIdentifier:@"NameView"];
  delegate.chromecastDeviceController.delegate = dvc;

  [self.navigationController pushViewController:dvc animated:YES];
}

#pragma mark - Wizard Selection

- (void)updateWizards {
  UIColor *wizardColor1 = self.unselectedColor;
  UIColor *wizardColor2 = self.unselectedColor;
  UIColor *wizardColor3 = self.unselectedColor;
  UIColor *wizardColor4 = self.unselectedColor;
  BOOL enableNextButton = NO;

  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  switch (delegate.gameInfo.avatarIndex) {
    case 0:
      wizardColor1 = self.selectedColor;
      enableNextButton = YES;
      break;
    case 1:
      wizardColor2 = self.selectedColor;
      enableNextButton = YES;
      break;
    case 2:
      wizardColor3 = self.selectedColor;
      enableNextButton = YES;
      break;
    case 3:
      wizardColor4 = self.selectedColor;
      enableNextButton = YES;
      break;
  }

  [self.wizardButton1 setBackgroundColor:wizardColor1];
  [self.wizardButton2 setBackgroundColor:wizardColor2];
  [self.wizardButton3 setBackgroundColor:wizardColor3];
  [self.wizardButton4 setBackgroundColor:wizardColor4];
  [self.nextButton setEnabled:enableNextButton];
}

- (UIColor*)selectedColor {
  return [UIColor whiteColor];
}

- (UIColor*)unselectedColor {
  return [UIColor blueColor];
}

@end
