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

#import "SpellCastViewController.h"

/**
 * Controls the UI asking the player to enter a name.
 */
@interface NameViewController : SpellCastViewController

@property(nonatomic, strong) IBOutlet UIButton *nextButton;
@property(weak, nonatomic) IBOutlet UIView *nameView;
@property(nonatomic, strong) IBOutlet UITextField *nameTextField;

/** Cast menu button **/
- (IBAction)openCastMenu:(id)sender;

/** Name text field editing **/
- (IBAction)nameTextFieldEditingFinished:(id)sender;

/** Go back button **/
- (IBAction)goBack:(id)sender;

/** Go next button **/
- (IBAction)goNext:(id)sender;

@end
