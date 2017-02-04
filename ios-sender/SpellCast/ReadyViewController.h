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
 * Controls the UI asking if the player is ready to play with the given avatar and name.
 */
@interface ReadyViewController : SpellCastViewController

@property(weak, nonatomic) IBOutlet UIImageView *wizardImageView;
@property(weak, nonatomic) IBOutlet UILabel *nameLabel;

/** Cast menu button **/
- (IBAction)openCastMenu:(id)sender;

/** Go back button **/
- (IBAction)goBack:(id)sender;

/** Go next button **/
- (IBAction)goNext:(id)sender;

@end
