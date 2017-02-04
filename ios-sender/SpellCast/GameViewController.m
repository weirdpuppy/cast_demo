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
#import "GameViewController.h"
#import "ProgressViewController.h"
#import "UIButton+Extensions.h"

@interface GameViewController() {
  NSMutableArray *_spells;
  CADisplayLink *_displayLink;
  CFTimeInterval _startTime;
  CFTimeInterval _timerDuration;
  SpellRuneDrawingView *_spellRuneDrawingView;
  SpellRuneDrawingTarget _spellRuneDrawingTarget;
}

@end

@implementation GameViewController

#pragma mark - Constants

static const int kDrawingOffset = 37;

static const double kSpellRuneScoreGood = 0.051;
static const double kSpellRuneScoreGreat = 0.059;
static const double kSpellRuneScorePerfect = 0.062;

#pragma mark - UIViewController

- (void)viewDidLoad {
  [super viewDidLoad];

  _spells = [[NSMutableArray alloc] init];

  // Set up SpellRuneDrawingView slightly smaller than gameUIImageView, centered on the main view.
  CGFloat frameHeight = self.view.frame.size.height;
  CGFloat spellRuneDrawingSize = frameHeight - kDrawingOffset;
  CGRect spellRuneDrawingFrame = CGRectMake(0, 0, spellRuneDrawingSize, spellRuneDrawingSize);
  _spellRuneDrawingView = [[SpellRuneDrawingView alloc] initWithFrame:spellRuneDrawingFrame];
  _spellRuneDrawingView.center = [self.view convertPoint:[self view].center
                                                fromView:[self view].superview];
  [self.view addSubview:_spellRuneDrawingView];

  // Receive notifications from SpellRuneDrawingView.
  _spellRuneDrawingView.delegate = self;
}

- (void)viewDidAppear:(BOOL)animated {
  [super viewDidAppear:animated];

  [_spells removeAllObjects];

  if (_displayLink) {
    [_displayLink invalidate];
  }

  // Clear the spell rune drawing view.
  _spellRuneDrawingTarget = SpellRuneDrawingTargetNone;
  [_spellRuneDrawingView setSpellRuneDrawingTarget:_spellRuneDrawingTarget];

  // Set up a circular progress timer.
  _spellRuneDrawingView.countdownClockLayer.progress = 0;
  [_spellRuneDrawingView.countdownClockLayer setNeedsDisplay];
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  _timerDuration = delegate.gameInfo.castSpellsDurationMillis / 1000.0;
  _startTime = CACurrentMediaTime();
  _displayLink = [CADisplayLink displayLinkWithTarget:self
                                             selector:@selector(updateCountdownClock)];
  [_displayLink addToRunLoop:[NSRunLoop mainRunLoop] forMode:NSRunLoopCommonModes];
}

- (void)viewWillDisappear:(BOOL)animated {
  [super viewWillDisappear:animated];
  [_displayLink invalidate];
}

#pragma mark - IBActions

- (IBAction)castSpell:(id)sender {
  if (sender == self.airButton) {
    _spellRuneDrawingTarget = SpellRuneDrawingTargetAir;
  } else if (sender == self.earthButton) {
    _spellRuneDrawingTarget = SpellRuneDrawingTargetEarth;
  } else if (sender == self.fireButton) {
    _spellRuneDrawingTarget = SpellRuneDrawingTargetFire;
  } else if (sender == self.waterButton) {
    _spellRuneDrawingTarget = SpellRuneDrawingTargetWater;
  } else if (sender == self.healButton) {
    _spellRuneDrawingTarget = SpellRuneDrawingTargetHeal;
  } else if (sender == self.shieldButton) {
    _spellRuneDrawingTarget = SpellRuneDrawingTargetShield;
  } else {
    NSLog(@"castSpell called with an unknown button.");
    return;
  }

  [_spellRuneDrawingView setSpellRuneDrawingTarget:_spellRuneDrawingTarget];
}

#pragma mark - SpellRuneDrawingDelegate

- (void)spellRuneDrawnWithScore:(double)score {
  if (score >= kSpellRuneScorePerfect) {
    [_spellRuneDrawingView animateSpellRuneDrawingResult:SpellRuneDrawingResultPerfect];
  } else if (score >= kSpellRuneScoreGreat) {
    [_spellRuneDrawingView animateSpellRuneDrawingResult:SpellRuneDrawingResultGreat];
  } else if (score >= kSpellRuneScoreGood) {
    [_spellRuneDrawingView animateSpellRuneDrawingResult:SpellRuneDrawingResultGood];
  } else {
    [_spellRuneDrawingView animateSpellRuneDrawingResult:SpellRuneDrawingResultFail];
    return;
  }

  SPCSpellType spellType = SPCSpellTypeUnknown;
  SPCSpellElement spellElement = SPCSpellElementUnknown;
  SPCSpellAccuracy spellAccuracy = SPCSpellAccuracyPerfect;

  switch (_spellRuneDrawingTarget) {
    case SpellRuneDrawingTargetAir:
      spellType = SPCSpellTypeBasicAttack;
      spellElement = SPCSpellElementAir;
      break;
    case SpellRuneDrawingTargetEarth:
      spellType = SPCSpellTypeBasicAttack;
      spellElement = SPCSpellElementEarth;
      break;
    case SpellRuneDrawingTargetFire:
      spellType = SPCSpellTypeBasicAttack;
      spellElement = SPCSpellElementFire;
      break;
    case SpellRuneDrawingTargetWater:
      spellType = SPCSpellTypeBasicAttack;
      spellElement = SPCSpellElementWater;
      break;
    case SpellRuneDrawingTargetShield:
      spellType = SPCSpellTypeShield;
      spellElement = SPCSpellElementNone;
      break;
    case SpellRuneDrawingTargetHeal:
      spellType = SPCSpellTypeHeal;
      spellElement = SPCSpellElementNone;
      break;
    default:
      NSLog(@"Unknown spell rune drawing target type: %ld", (long)_spellRuneDrawingTarget);
      return;
  }

  id spell = [SPCGameInfo createSpellWithSpellType:spellType
                                      spellElement:spellElement
                                     spellAccuracy:spellAccuracy];
  [_spells addObject:spell];
}

#pragma mark - Game messages

- (void)castAllSpellsAndExit {
  // Clear the spell rune drawing view.
  [_spellRuneDrawingView setSpellRuneDrawingTarget:SpellRuneDrawingTargetNone];

  id gameMessage = [SPCGameInfo createGameMessageWithSpells:_spells];
  [self.gameManagerChannel sendGameMessage:gameMessage];

  // Update this player to ready state.
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  UIStoryboard *storyboard = self.storyboard;
  ProgressViewController *dvc = [storyboard
                                 instantiateViewControllerWithIdentifier:@"ProgressView"];
  [dvc updateDisplayMode:ProgressViewDisplayModeResolveActions];
  delegate.chromecastDeviceController.delegate = dvc;
  [self.navigationController pushViewController:dvc animated:YES];
}

#pragma mark - CountdownClock

- (void)updateCountdownClock {
  CFTimeInterval elapsedTime = CACurrentMediaTime() - _startTime;

  // Update countdown clock layer in the UI thread.
  dispatch_async(dispatch_get_main_queue(), ^{
    _spellRuneDrawingView.countdownClockLayer.progress = elapsedTime * 100 / _timerDuration;
    [_spellRuneDrawingView.countdownClockLayer setNeedsDisplay];
  });

  if (elapsedTime >= _timerDuration) {
    [self castAllSpellsAndExit];
    [_displayLink invalidate];
  }
}

@end
