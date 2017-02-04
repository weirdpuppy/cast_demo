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
#import <GoogleCast/GoogleCast.h>
#import <GoogleCastGames/GoogleCastGames.h>

#import "ChromecastDeviceController.h"
#import "SPCGameInfo.h"

@interface AppDelegate : UIResponder <UIApplicationDelegate, GCKLoggerDelegate>

@property(nonatomic) UIWindow *window;

/**
 * Chromecast device controller UI shared across view controllers.
 */
@property(nonatomic) ChromecastDeviceController *chromecastDeviceController;

/**
 * Game manager channel shared across view controllers. Only initialized by HomeViewController upon
 * successful connection.
 */
@property(nonatomic) GCKGameManagerChannel *gameManagerChannel;

/**
 * Spellcast game specific information shared across view controllers.
 */
@property(nonatomic) SPCGameInfo *gameInfo;

/**
 * Helper that returns UIImage resource for current avatar index.
 */
- (UIImage *)getAvatarImage;

@end

