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

#import <CoreImage/CoreImage.h>
#import <Foundation/Foundation.h>

#include "ImageUtils.h"

@implementation ImageUtils

#pragma mark Constants

// All images are converted to a byte array that is kCompareSize x kCompareSize.
static const size_t kCompareSize = 64;

static const CGFloat kInputRVector[] = {0.5, 0.0, 0.0, 0.0};
static const CGFloat kInputGVector[] = {0.0, 0.5, 0.0, 0.0};
static const CGFloat kInputBVector[] = {0.0, 0.0, 0.5, 0.0};
static const CGFloat kInputAVector[] = {0.0, 0.0, 0.0, 1.0};
static const CGFloat kInputBiasVector[] = {-0.25, -0.25, -0.25, 0.0};


#pragma mark Public methods

+ (double)comparePixelData:(UIImage *)drawnImage withTargetImage:(UIImage *)targetImage {
  CIContext *context = [CIContext contextWithOptions:nil];
  CIImage *drawnCIImage = [self createImage:drawnImage withContext:context withAddable:YES];
  CIImage *targetCIImage = [self createImage:targetImage withContext:context withAddable:YES];
  CIImage *minusCITargetImage = [self createImage:targetImage withContext:context withAddable:NO];

  // Add images and return a score between 0 and 1 to determine how well they align.
  double alignScore = [self compareImage:drawnCIImage withImage:targetCIImage withContext:context];

  // Subtract images and return a score between 0 and 1 to determine how well they misalign.
  double missedScore = [self compareImage:drawnCIImage
                                withImage:minusCITargetImage
                              withContext:context];

  return MAX(alignScore - missedScore, 0);
}

#pragma mark Internal methods

/**
 * Create a downscaled, black and white image for comparison. Use addable=YES parameter for images
 * intended for addition. Use addable=NO parameter to images intended for subtraction.
 */
+ (CIImage *)createImage:(UIImage *)image
             withContext:(CIContext *)context
             withAddable:(BOOL)addable {
  CIImage *inputImage = [image CIImage];
  if (!inputImage) {
    inputImage = [[CIImage alloc] initWithImage:image];
  }
  CGRect inputImageExtent = [inputImage extent];

  // Blur the image to get an average pixel value over a region based on our downscaling.
  CIFilter *blurFilter = [CIFilter filterWithName:@"CIGaussianBlur"];
  CGFloat inputSize = inputImageExtent.size.width;
  NSNumber *blurSize = [NSNumber numberWithDouble:inputSize / kCompareSize];
  [blurFilter setValue:inputImage forKey:kCIInputImageKey];
  [blurFilter setValue:blurSize forKey:kCIInputRadiusKey];
  CIImage *blurredImage = [blurFilter valueForKey:kCIOutputImageKey];

  // Downscale the blurred image to get a kCompareSize sized image.
  CIFilter *scaleFilter = [CIFilter filterWithName:@"CILanczosScaleTransform"];
  [scaleFilter setValue:blurredImage forKey:kCIInputImageKey];
  [scaleFilter setValue:@(kCompareSize / inputSize) forKey:kCIInputScaleKey];
  CIImage *scaledImage = [scaleFilter valueForKey:kCIOutputImageKey];

  // Make this a black and white image.
  CIFilter *bwFilter = [CIFilter filterWithName:@"CIColorMonochrome"];
  [bwFilter setValue:scaledImage forKey:kCIInputImageKey];
  [bwFilter setValue:[CIColor colorWithRed:1.0 green:1.0 blue:1.0] forKey:kCIInputColorKey];
  CIImage *bwImage = [bwFilter valueForKey:kCIOutputImageKey];

  // Invert addable image because drawings and templates are dark colored.
  CIImage *invertedImage = addable ? [self invertImage:bwImage] : bwImage;

  // Multiply color by 0.5 to let us add or subtract colors without going over bounds.
  CIFilter *multiplyFilter = [CIFilter filterWithName:@"CIColorMatrix"];
  [multiplyFilter setValue:invertedImage forKey:kCIInputImageKey];
  [multiplyFilter setValue:[CIVector vectorWithValues:kInputRVector count:4]
                    forKey:@"inputRVector"];
  [multiplyFilter setValue:[CIVector vectorWithValues:kInputGVector count:4]
                    forKey:@"inputGVector"];
  [multiplyFilter setValue:[CIVector vectorWithValues:kInputBVector count:4]
                    forKey:@"inputBVector"];
  [multiplyFilter setValue:[CIVector vectorWithValues:kInputAVector count:4]
                    forKey:@"inputAVector"];
  CIImage *multipliedImage = [multiplyFilter valueForKey:kCIOutputImageKey];

  return multipliedImage;
}

+ (CIImage *)invertImage:(CIImage *)inputImage {
  CIFilter *invertFilter = [CIFilter filterWithName:@"CIColorInvert"];
  [invertFilter setValue:inputImage forKey:kCIInputImageKey];
  return [invertFilter valueForKey:kCIOutputImageKey];
}

+ (CIImage *)addImage:(CIImage *)inputImage1 withImage:(CIImage *)inputImage2 {
  CIFilter *addFilter = [CIFilter filterWithName:@"CIAdditionCompositing"];
  [addFilter setValue:inputImage1 forKey:kCIInputImageKey];
  [addFilter setValue:inputImage2 forKey:kCIInputBackgroundImageKey];
  CIImage *addedImage = [addFilter valueForKey:kCIOutputImageKey];

  // Shift bias to allow subtraction to remove colors.
  CIFilter *biasFilter = [CIFilter filterWithName:@"CIColorMatrix"];
  [biasFilter setValue:addedImage forKey:kCIInputImageKey];
  [biasFilter setValue:[CIVector vectorWithValues:kInputBiasVector count:4]
                forKey:@"inputBiasVector"];
  CIImage *biasedImage = [biasFilter valueForKey:kCIOutputImageKey];
  return biasedImage;
}

+ (double)computeScoreFromImage:(CIImage *)inputImage withContext:(CIContext *)context {
  CGRect extent = [inputImage extent];
  CGImageRef imageRef = [context createCGImage:inputImage fromRect:extent];

  // Get the general bitmap information.
  size_t width = CGImageGetWidth(imageRef);
  size_t height = CGImageGetHeight(imageRef);
  size_t bytesPerRow = CGImageGetBytesPerRow(imageRef);
  size_t bitsPerPixel = CGImageGetBitsPerPixel(imageRef);
  size_t bitsPerComponent = CGImageGetBitsPerComponent(imageRef);
  size_t bytePerPixel = bitsPerPixel / bitsPerComponent;

  // Get the pixel data.
  uint8_t *pixels = (uint8_t *)calloc(width * height * bytePerPixel, sizeof(uint8_t));
  CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
  CGContextRef pixelContext = CGBitmapContextCreate(pixels, width, height, bitsPerComponent,
      bytesPerRow, colorSpace, (CGBitmapInfo)kCGImageAlphaPremultipliedLast);
  CGContextDrawImage(pixelContext, CGRectMake(0, 0, width, height), imageRef);

  // Instead of reading all RGBA values, add up alpha values for scoring like on Android sender.
  double total = 0;
  double maxPixelVal = 1 << bitsPerComponent;
  int bytePtr = 0;
  uint8_t *pixel = pixels;
  while (bytePtr < width * height * bytePerPixel) {
    total += pixel[4] / maxPixelVal;
    pixel += bytePerPixel;
    bytePtr += bytePerPixel;
  }

  // Release allocated resources.
  CGColorSpaceRelease(colorSpace);
  CGContextRelease(pixelContext);
  free(pixels);

  return total / (width * height);
}

+ (double)compareImage:(CIImage *)inputImage1
             withImage:(CIImage *)inputImage2
           withContext:(CIContext *)context {
  CIImage *addedImage = [self addImage:inputImage1 withImage:inputImage2];
  return [self computeScoreFromImage:addedImage withContext:context];
}

@end