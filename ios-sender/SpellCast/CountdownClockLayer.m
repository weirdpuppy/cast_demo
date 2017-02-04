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
// limitations under the License.Copyright (c) 2015 Google. All rights reserved.

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#import "CountdownClockLayer.h"

@implementation CountdownClockLayer

#pragma mark Constants

static const CGFloat kStartAngle = M_PI * 1.5;
static const CGFloat kProgressAngle = M_PI * 2 / 100.0;
static const CGFloat kBorderColor[] = { 0.4, 0.3, 0.2, 1.0 };
static const CGFloat kBorderWidth = 3.0;
static const CGFloat kCountdownColor[] = { 0.0, 0.0, 1.0, 0.5 };
static const CGFloat kCountdownWidth = 10.0;

#pragma mark Implementation

- (void)drawInContext:(CGContextRef)ctx {
  CGRect bounds = [self bounds];
  CGFloat halfWidth = bounds.size.width / 2;
  CGFloat halfHeight = bounds.size.height / 2;

  // Draw the border circle.
  CGContextBeginPath(ctx);
  CGContextAddArc(ctx,
                  /* center x */ halfWidth,
                  /* center y */ halfHeight,
                  /* radius */ MIN(halfWidth - kBorderWidth, halfHeight - kBorderWidth),
                  /* start arc angle */ 0,
                  /* end arc angle */ M_PI * 2,
                  /* clockwise? */ NO);
  UIColor *borderStrokeColor = [UIColor colorWithRed:kBorderColor[0]
                                               green:kBorderColor[1]
                                                blue:kBorderColor[2]
                                               alpha:kBorderColor[3]];
  CGContextSetStrokeColorWithColor(ctx, [borderStrokeColor CGColor]);
  CGContextSetLineWidth(ctx, kBorderWidth);
  CGContextStrokePath(ctx);

  // Draw the countdown circle in progress.
  CGContextBeginPath(ctx);
  CGContextAddArc(ctx,
                  /* center x */ halfWidth,
                  /* center y */ halfHeight,
                  /* radius */ MIN(halfWidth - kCountdownWidth, halfHeight - kCountdownWidth),
                  /* start arc angle */ kStartAngle,
                  /* end arc angle */ kStartAngle + kProgressAngle * _progress,
                  /* clockwise? */ NO);
  UIColor *countdownStrokeColor = [UIColor colorWithRed:kCountdownColor[0]
                                                  green:kCountdownColor[1]
                                                   blue:kCountdownColor[2]
                                                  alpha:kCountdownColor[3]];
  CGContextSetStrokeColorWithColor(ctx, [countdownStrokeColor CGColor]);
  CGContextSetLineWidth(ctx, kCountdownWidth);
  CGContextStrokePath(ctx);
}

@end
