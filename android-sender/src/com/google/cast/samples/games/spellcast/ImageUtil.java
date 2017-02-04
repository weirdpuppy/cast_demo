// Copyright 2015 Google Inc. All Rights Reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.cast.samples.games.spellcast;

import android.graphics.Bitmap;
import android.graphics.Color;

/**
 * Utility for bitmap operations.
 */
public class ImageUtil {

    // All images are converted to a byte array that is RESOLUTION x RESOLUTION
    public static final int RESOLUTION = 64;

    // Float threshold at which we count the image as having something at a particular pixel block.
    // This is compared against the average alpha of an image's pixels in a block.
    private static final float THRESHOLD = 0.001f;

    /**
     * @param bitmap The bitmap to use to convert to a byte array of data.
     * @return A byte array representing the bitmap converted to chunks of 0 and 1 where 1 means
     *         something is there in that pixel chunk and 0 means that pixel chunk is mostly empty.
     */
    public static byte[][] getPixelData(Bitmap bitmap) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        int[] pixels = new int[width * height];
        bitmap.getPixels(pixels, 0, height, 0, 0, width, height);

        int dataWidth = width / RESOLUTION;
        int dataHeight = height / RESOLUTION;

        byte[][] data = new byte[RESOLUTION][RESOLUTION];

        for (int i = 0; i < RESOLUTION; ++i) {
            for (int j = 0; j < RESOLUTION; ++j) {
                int pixelStartPoint = i * dataWidth * width + j * dataHeight;
                float average = getAverage(pixels, pixelStartPoint, dataWidth, dataHeight, width);
                data[i][j] = average > THRESHOLD ? (byte) 1 : (byte) 0;
            }
        }

        return data;
    }

    /**
     * @param drawn Byte array representing the image drawn by the user.
     * @param target Byte array representing the image the user is tracing.
     * @return The number of bytes that differ between drawn and target.
     */
    public static float comparePixelData(byte[][] drawn, byte[][] target) {
        int numFilledPixelsTarget = 0;
        int score = 0;

        for (int i = 0; i < drawn.length; ++i) {
            for (int j = 0; j < target.length; ++j) {

                if (target[i][j] != 0) {
                    numFilledPixelsTarget++;
                    if (drawn[i][j] != 0) {
                        score++;
                    }
                } else {
                    if (drawn[i][j] != 0) {
                        score--;
                    }
                }
            }
        }

        float percentage = score * 100 / (float) numFilledPixelsTarget;
        return percentage;
    }

    private static float getAverage(int[] pixels, int startPoint, int blockWidth, int blockHeight,
            int bitmapWidth) {
        float average = 0;
        for (int i = 0; i < blockWidth; ++i) {
            for (int j = 0; j < blockHeight; ++j) {
                int colorAtIJ = pixels[startPoint + i * bitmapWidth + j];
                average += getPixelFillValue(colorAtIJ);
            }
        }

        float pixelsPerBlock = blockWidth * blockHeight;
        average = average / pixelsPerBlock;

        return average;
    }

    /**
     * @param color Int color to analyze.
     * @return Either 1 or 0 depending on how we determine if the particular color has enough alpha
     *         to be considered filled.
     */
    private static int getPixelFillValue(int color) {
        if (Color.alpha(color) > 0) {
            return 1;
        }
        return 0;
    }
}
