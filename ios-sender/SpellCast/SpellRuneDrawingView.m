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

#import <Foundation/Foundation.h>

#import "ImageUtils.h"
#import "SpellRuneDrawingView.h"

/**
 * Internal helper to keep track of settings needed for a spell rune.
 */
@interface SpellRuneSetting : NSObject

@property(nonatomic, readwrite) UIImage *targetRune;
@property(nonatomic, readwrite) UIImage *backgroundRune;
@property(nonatomic, readwrite) uint numberRequiredStrokes;

- (id)initWithTargetRune:(UIImage *)targetRune
          backgroundRune:(UIImage *)backgroundRune
   numberRequiredStrokes:(uint)numberRequiredStrokes;

/**
 * Returns a dictionary that maps SpellRuneDrawingTarget to SpellRuneSetting objects.
 */
+ (NSDictionary *)createSpellRuneSettingDictionary;

@end

@interface SpellRuneDrawingView() {
  NSDictionary *_spellRuneSettings;
  SpellRuneDrawingTarget _spellRuneDrawingTarget;
  SpellRuneSetting *_currentSpellRuneSetting;
  uint _numberStrokes;

  UIBezierPath *_currentPath;
  UIImage *_currentImage;
  CGPoint _points[5];
  uint _numberPoints;
  UIColor *_strokeColor;

  UIImageView *_runeResultImageView;
}

@property(nonatomic, readwrite) CountdownClockLayer *countdownClockLayer;

@end

#pragma mark Constants

static const CGFloat kDrawingLineWidth = 12.0;
static const CGFloat kStrokeColor[] = {0.0, 0.0, 0.0, 1.0};
static const CGFloat kBackgroundRuneAlpha = 0.5;

#pragma mark SpellRuneSetting implementation

@implementation SpellRuneSetting

- (id)initWithTargetRune:(UIImage *)targetRune
          backgroundRune:(UIImage *)backgroundRune
   numberRequiredStrokes:(uint)numberRequiredStrokes {
  if (self = [super init]) {
    self.targetRune = targetRune;
    self.backgroundRune = backgroundRune;
    self.numberRequiredStrokes = numberRequiredStrokes;
  }

  return self;
}

+ (NSDictionary *)createSpellRuneSettingDictionary {
  return @{
    @(SpellRuneDrawingTargetAir): [[SpellRuneSetting alloc]
                                   initWithTargetRune:[UIImage imageNamed:@"rune_air_target"]
                                   backgroundRune:[UIImage imageNamed:@"rune_air"]
                                   numberRequiredStrokes:3],
    @(SpellRuneDrawingTargetEarth): [[SpellRuneSetting alloc]
                                     initWithTargetRune:[UIImage imageNamed:@"rune_earth_target"]
                                     backgroundRune:[UIImage imageNamed:@"rune_earth"]
                                     numberRequiredStrokes:4],
    @(SpellRuneDrawingTargetFire): [[SpellRuneSetting alloc]
                                    initWithTargetRune:[UIImage imageNamed:@"rune_fire_target"]
                                    backgroundRune:[UIImage imageNamed:@"rune_fire"]
                                    numberRequiredStrokes:2],
    @(SpellRuneDrawingTargetWater): [[SpellRuneSetting alloc]
                                     initWithTargetRune:[UIImage imageNamed:@"rune_water_target"]
                                     backgroundRune:[UIImage imageNamed:@"rune_water"]
                                     numberRequiredStrokes:4],
    @(SpellRuneDrawingTargetHeal): [[SpellRuneSetting alloc]
                                    initWithTargetRune:[UIImage imageNamed:@"rune_heal_target"]
                                    backgroundRune:[UIImage imageNamed:@"rune_heal"]
                                    numberRequiredStrokes:4],
    @(SpellRuneDrawingTargetShield): [[SpellRuneSetting alloc]
                                      initWithTargetRune:[UIImage imageNamed:@"rune_shield_target"]
                                      backgroundRune:[UIImage imageNamed:@"rune_shield"]
                                      numberRequiredStrokes:2]
  };
}

@end

#pragma mark SpellRuneDrawingView Implementation

@implementation SpellRuneDrawingView

- (id)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    _spellRuneSettings = [SpellRuneSetting createSpellRuneSettingDictionary];

    CALayer *layer = [self layer];

    // Set a repeating background texture.
    self.backgroundColor = [UIColor colorWithPatternImage:[UIImage imageNamed:@"spell_rune_bg"]];

    // Make this view circular bound by the height.
    self.layer.cornerRadius = frame.size.height / 2;
    self.layer.masksToBounds = YES;

    // Add the countdown clock layer.
    _countdownClockLayer = [[CountdownClockLayer alloc] init];
    _countdownClockLayer.frame = CGRectMake(0, 0, frame.size.width, frame.size.height);
    [layer addSublayer:_countdownClockLayer];

    // Set up touch drawing support.
    [self setMultipleTouchEnabled:NO];
    _currentPath = [UIBezierPath bezierPath];
    _currentPath.lineWidth = kDrawingLineWidth;
    _strokeColor = [UIColor colorWithRed:kStrokeColor[0]
                                   green:kStrokeColor[1]
                                    blue:kStrokeColor[2]
                                   alpha:kStrokeColor[3]];

    // Create the result image that will be animated after drawing. Align with countdown clock.
    _runeResultImageView = [[UIImageView alloc] initWithFrame:_countdownClockLayer.frame];
    _runeResultImageView.backgroundColor = [UIColor clearColor];
    _runeResultImageView.hidden = YES;
    [self addSubview:_runeResultImageView];
  }
  return self;
}

- (void)setSpellRuneDrawingTarget:(SpellRuneDrawingTarget)spellRuneDrawingTarget {
  [self clearImageAndPath];
  _numberStrokes = 0;

  _spellRuneDrawingTarget = spellRuneDrawingTarget;
  _currentSpellRuneSetting =
      (SpellRuneSetting *)[_spellRuneSettings objectForKey:@(_spellRuneDrawingTarget)];

  [self setNeedsDisplay];
}

- (void)animateSpellRuneDrawingResult:(SpellRuneDrawingResult)spellRuneDrawingResult {
  switch (spellRuneDrawingResult) {
    case SpellRuneDrawingResultFail:
      _runeResultImageView.image = [UIImage imageNamed:@"fail"];
      break;
    case SpellRuneDrawingResultGood:
      _runeResultImageView.image = [UIImage imageNamed:@"success_good"];
      break;
    case SpellRuneDrawingResultGreat:
      _runeResultImageView.image = [UIImage imageNamed:@"success_great"];
      break;
    case SpellRuneDrawingResultPerfect:
      _runeResultImageView.image = [UIImage imageNamed:@"success_perfect"];
      break;
    default:
      NSLog(@"Error in spellRuneDrawingResult - unexpected enum value.");
      return;
      break;
  }

  // Animate the rune result view by growing it and fading it out.
  _runeResultImageView.transform = CGAffineTransformMakeScale(0.01, 0.01);
  _runeResultImageView.hidden = NO;
  _runeResultImageView.alpha = 1.0;
  [UIView animateWithDuration:0.5
                        delay:0
                      options:UIViewAnimationOptionCurveEaseIn
                   animations:^{
                     _runeResultImageView.transform = CGAffineTransformIdentity;
                   }
                   completion:^(BOOL finished) {
                     _runeResultImageView.alpha = 1.0;
                     [UIView animateWithDuration:0.2
                                           delay:0
                                         options:UIViewAnimationOptionCurveEaseIn
                                      animations:^{
                                        _runeResultImageView.alpha = 0.0;
                                      }
                                      completion:^(BOOL finished) {
                                        _runeResultImageView.hidden = YES;
                                      }];
                   }];
}

#pragma mark Drawing

- (void)drawRect:(CGRect)rect {
  if (_currentSpellRuneSetting) {
    [_currentSpellRuneSetting.backgroundRune drawInRect:rect
                                              blendMode:kCGBlendModeNormal
                                                  alpha:kBackgroundRuneAlpha];
  }
  [_currentImage drawInRect:rect];
  [_strokeColor setStroke];
  [_currentPath stroke];
}

- (void)updateCurrentImage {
  // Update current image with strokes so we no longer need to draw individual paths.
  UIGraphicsBeginImageContext(self.bounds.size);
  [_currentImage drawAtPoint:CGPointZero];
  [_strokeColor setStroke];
  [_currentPath stroke];
  _currentImage = UIGraphicsGetImageFromCurrentImageContext();
  UIGraphicsEndImageContext();
  [self setNeedsDisplay];

  // Clear the path and points.
  [_currentPath removeAllPoints];
  _numberPoints = 0;
}

- (void)clearImageAndPath {
  // Clear the current path.
  [_currentPath removeAllPoints];
  _numberPoints = 0;

  // Clear the current image.
  UIGraphicsBeginImageContext(self.bounds.size);
  UIBezierPath *rectpath = [UIBezierPath bezierPathWithRect:self.bounds];
  [[UIColor clearColor] setFill];
  [rectpath fill];
  _currentImage = UIGraphicsGetImageFromCurrentImageContext();
  UIGraphicsEndImageContext();
}

#pragma mark Touch handling

- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event {
  _numberPoints = 0;
  UITouch *touch = [touches anyObject];
  _points[0] = [touch locationInView:self];
}

- (void)touchesMoved:(NSSet *)touches withEvent:(UIEvent *)event {
  // If there is no current spell rune, do not process touches.
  if (!_currentSpellRuneSetting) {
    return;
  }

  UITouch *touch = [touches anyObject];
  CGPoint point = [touch locationInView:self];
  _numberPoints++;
  _points[_numberPoints] = point;
  if (_numberPoints < 4) {
    return;
  }

  // Draw a smooth bezier path.
  CGFloat x = (_points[2].x + _points[4].x) / 2.0;
  CGFloat y = (_points[2].y + _points[4].y) / 2.0;
  _points[3] = CGPointMake(x, y);
  [_currentPath moveToPoint:_points[0]];
  [_currentPath addCurveToPoint:_points[3]
                  controlPoint1:_points[1]
                  controlPoint2:_points[2]];
  [self setNeedsDisplay];

  // Update points to prepare for the next path.
  _points[0] = _points[3];
  _points[1] = _points[4];
  _numberPoints = 1;
}

- (void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event {
  // If there is no current spell rune, do not process touches.
  if (!_currentSpellRuneSetting) {
    return;
  }

  // Update image and stroke path.
  [self updateCurrentImage];

  // Check if we have the required number of strokes.
  _numberStrokes++;
  if (_numberStrokes != _currentSpellRuneSetting.numberRequiredStrokes) {
    return;
  }

  // Compute a score and notify delegate.
  id<SpellRuneDrawingDelegate> delegate = self.delegate;
  if (delegate) {
    double score = [ImageUtils comparePixelData:_currentImage
                                withTargetImage:_currentSpellRuneSetting.targetRune];
    [delegate spellRuneDrawnWithScore:score];
  }

  // Reset the spell rune background and tracking of number of strokes.
  [self setSpellRuneDrawingTarget:SpellRuneDrawingTargetNone];
}

- (void)touchesCancelled:(NSSet *)touches withEvent:(UIEvent *)event {
  [self touchesEnded:touches withEvent:event];
}

@end
