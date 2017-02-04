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
 * @enum ProgressViewDisplayMode
 * An enum describing what to display in the progress view.
 */
typedef NS_ENUM(NSInteger, ProgressViewDisplayMode) {
  ProgressViewDisplayModeWaitingForPlayers = 0,
  ProgressViewDisplayModeHostStarting = 1,
  ProgressViewDisplayModeResolveActions = 2,
  ProgressViewDisplayModeGameEnding = 3,
};

/**
 * Controls the UI showing the progress of connecting, starting game, resolving player actions, etc.
 */
@interface ProgressViewController : SpellCastViewController

@property(weak, nonatomic) IBOutlet UIImageView *wizardImageView;
@property(weak, nonatomic) IBOutlet UILabel *nameLabel;
@property(weak, nonatomic) IBOutlet UILabel *progressTextLabel;

/** Cast menu button **/
- (IBAction)openCastMenu:(id)sender;

/** Updates what to display in the progress view */
- (void)updateDisplayMode:(ProgressViewDisplayMode)displayMode;

@end
