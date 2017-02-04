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
#import "ReadyViewController.h"
#import "UIButton+Extensions.h"

@implementation NameViewController

#pragma mark - UIViewController

- (void)viewDidLoad {
  [super viewDidLoad];

  // Setup keyboard handling.
  [self registerForKeyboardNotifications];

  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  NSString *playerName = delegate.gameInfo.playerName;

  if (playerName && playerName.length > 0) {
    [self.nameTextField setText:playerName];
    [self.nextButton setEnabled:YES];
  } else {
    // Disable next button until a name is entered.
    [self.nextButton setEnabled:NO];
  }
}

#pragma mark - IBActions

- (IBAction)openCastMenu:(id)sender {
  UIStoryboard *storyboard = self.storyboard;
  DeviceTableViewController *dvc =
      [storyboard instantiateViewControllerWithIdentifier:@"DeviceTableView"];
  [self presentViewController:dvc animated:YES completion:nil];
}

- (IBAction)nameTextFieldEditingFinished:(id)sender {
  NSString *text = self.nameTextField.text;
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  delegate.gameInfo.playerName = text;
  [self.nextButton setEnabled:[text length] > 0];
  [self.nameTextField resignFirstResponder];
}

- (IBAction)goBack:(id)sender {
  [self.navigationController popViewControllerAnimated:NO];
}

- (IBAction)goNext:(id)sender {
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  UIStoryboard *storyboard = self.storyboard;
  ReadyViewController *dvc =
      [storyboard instantiateViewControllerWithIdentifier:@"ReadyView"];
  delegate.chromecastDeviceController.delegate = dvc;

  [self.navigationController pushViewController:dvc animated:YES];
}

# pragma mark - Keyboard handling

- (void)registerForKeyboardNotifications {
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(keyboardWasShown:)
                                               name:UIKeyboardDidShowNotification
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(keyboardWillBeHidden:)
                                               name:UIKeyboardWillHideNotification
                                             object:nil];
}

- (void)keyboardWasShown:(NSNotification*)notification {
  NSDictionary* info = notification.userInfo;
  CGSize kbSize = [[info objectForKey:UIKeyboardFrameBeginUserInfoKey] CGRectValue].size;

  CGRect nameViewFrame = self.nameView.frame;
  nameViewFrame.origin.y -= kbSize.height - (nameViewFrame.size.height / 2);
  [self.nameView setFrame:nameViewFrame];
}

- (void)keyboardWillBeHidden:(NSNotification*)notification {
  NSDictionary* info = notification.userInfo;
  CGSize kbSize = [[info objectForKey:UIKeyboardFrameBeginUserInfoKey] CGRectValue].size;

  CGRect nameViewFrame = self.nameView.frame;
  nameViewFrame.origin.y += kbSize.height - (nameViewFrame.size.height / 2);
  [self.nameView setFrame:nameViewFrame];
}

@end
