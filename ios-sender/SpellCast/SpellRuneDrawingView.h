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

#import "CountdownClockLayer.h"

/**
 * @enum SpellRuneDrawingTarget
 * An enum describing spell rune targets to draw against.
 */
typedef NS_ENUM(NSInteger, SpellRuneDrawingTarget) {
  SpellRuneDrawingTargetNone = 0,
  SpellRuneDrawingTargetAir = 1,
  SpellRuneDrawingTargetEarth = 2,
  SpellRuneDrawingTargetFire = 3,
  SpellRuneDrawingTargetWater = 4,
  SpellRuneDrawingTargetHeal = 5,
  SpellRuneDrawingTargetShield = 6
};

/**
 * @enum SpellRuneDrawingResult
 * An enum describing the result of drawing a spell rune.
 */
typedef NS_ENUM(NSInteger, SpellRuneDrawingResult) {
  SpellRuneDrawingResultUnknown = 0,
  SpellRuneDrawingResultFail = 1,
  SpellRuneDrawingResultGood = 2,
  SpellRuneDrawingResultGreat = 3,
  SpellRuneDrawingResultPerfect = 4
};

@protocol SpellRuneDrawingDelegate;

/**
 * View with the countdown clock, spell rune target, and touch drawing UI.
 */
@interface SpellRuneDrawingView : UIView

/**
 * The delegate for receiving notifications from this view.
 */
@property(nonatomic, weak) id<SpellRuneDrawingDelegate> delegate;

/**
 * Used to show how much time is left to draw spell runes.
 */
@property(nonatomic, readonly) CountdownClockLayer *countdownClockLayer;

/**
 * Sets the target spell rune to display in the view.
 * @param spellRuneDrawingTarget The spell rune target to display. Using SpellRuneDrawingTargetNone
 *     will clear the displayed spell rune.
 */
- (void)setSpellRuneDrawingTarget:(SpellRuneDrawingTarget)spellRuneDrawingTarget;

/**
 * Animates the result from drawing a spell rune.
 * @param spellRuneDrawingResult The result of drawing a spell rune.
 */
- (void)animateSpellRuneDrawingResult:(SpellRuneDrawingResult)spellRuneDrawingResult;

@end

/**
 * Delegate for spell rune drawing view notifications.
 */
@protocol SpellRuneDrawingDelegate

/**
 * A spell rune was drawn with a given score between 0 and 1, where 1 is the best match.
 */
- (void)spellRuneDrawnWithScore:(double)score;

@end