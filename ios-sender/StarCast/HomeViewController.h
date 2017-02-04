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

@interface HomeViewController : UIViewController <ChromecastControllerDelegate>

@property(nonatomic) IBOutlet UIView *errorView;
@property(nonatomic) IBOutlet UILabel *errorTitleLabel;
@property(nonatomic) IBOutlet UILabel *errorDescriptionLabel;
@property(nonatomic) IBOutlet UIButton *connectButton;
@property(nonatomic) IBOutlet UILabel *loadingText;
@property(nonatomic) IBOutlet UIActivityIndicatorView *loadingAnimation;

/** Connect button **/
- (IBAction)connect:(id)sender;
/** Retry button **/
- (IBAction)retryConnect:(id)sender;
/** Learn more link **/
- (IBAction)learnMore:(id)sender;

@end

