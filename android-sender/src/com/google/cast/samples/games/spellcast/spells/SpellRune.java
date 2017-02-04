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
package com.google.cast.samples.games.spellcast.spells;

import com.google.cast.samples.games.spellcast.ImageUtil;

import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.util.Log;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

/**
 * A class representing the rune that a user must trace in order to cast a spell.
 */
public class SpellRune {
    public static final String ASSET_RUNE_PATH = "runes";
    public static final String ASSET_RUNE_TEMPLATE_PATH = "scoring_templates";
    private static final String TAG = "SpellRune";
    // All template images are converted to a byte array that is TEMPLATE_SIZE x TEMPLATE_SIZE.
    private static final int TEMPLATE_SIZE = ImageUtil.RESOLUTION;
    private static final byte SCORE_BLACK = 2;
    private static final byte SCORE_DARK_GRAY = 1;
    private static final byte SCORE_LIGHT_GRAY = 0;
    private static final byte SCORE_WHITE = -2;

    // Private member variables for a SpellRune.
    private final Bitmap mTracingBitmap;
    private final byte[][] mScoringTemplate;

    public static SpellRune loadRune(AssetManager assets, String runeTemplate, String runeFile) {
        InputStream bitmapStream = null;
        try {
            File runeDirectory = new File(ASSET_RUNE_PATH);
            File scoringTemplatePath = new File(runeDirectory, ASSET_RUNE_TEMPLATE_PATH);

            // Load Tracing Bitmap.
            bitmapStream = assets.open(new File(runeDirectory, runeFile).getPath());
            Bitmap runeBitmap = BitmapFactory.decodeStream(bitmapStream);
            bitmapStream.close();

            // Load Scoring Template.
            bitmapStream = assets.open(new File(scoringTemplatePath, runeTemplate).getPath());
            Bitmap scoringTemplateBitmap = BitmapFactory.decodeStream(bitmapStream);

            if ((scoringTemplateBitmap.getWidth() != TEMPLATE_SIZE)
                    || (scoringTemplateBitmap.getHeight() != TEMPLATE_SIZE)) {
                Log.w(TAG, "Template bitmap " + runeTemplate + " is not " + TEMPLATE_SIZE + "x"
                        + TEMPLATE_SIZE + ". Please fix!");
                return null;
            }

            SpellRune rune = new SpellRune(runeBitmap,
                    getScoringTemplateBitmap(scoringTemplateBitmap));
            scoringTemplateBitmap.recycle();

            return rune;

        } catch (IOException e) {
            Log.w(TAG, "IOException in loadRune: " + e);
        } finally {
            if (bitmapStream != null) {
                try {
                    bitmapStream.close();
                } catch (IOException e) {
                    Log.w(TAG, "IOException while trying to close bitmap Stream: " + e);
                }
            }
        }

        return null;
    }

    /**
     * @param bitmap A bitmap of size TEMPLATE_SIZE x TEMPLATE_SIZE.
     * @return A byte array representing the scoring template for the rune.
     */
    private static byte[][] getScoringTemplateBitmap(Bitmap bitmap) {
        byte[][] scoringTemplate = new byte[TEMPLATE_SIZE][TEMPLATE_SIZE];
        int[] pixels = new int[TEMPLATE_SIZE * TEMPLATE_SIZE];
        bitmap.getPixels(pixels, 0, bitmap.getWidth(), 0, 0, bitmap.getWidth(), bitmap.getHeight());
        int i = 0;
        int j = 0;
        for (int index = 0; index < pixels.length; ++index) {
            int c = Color.red(pixels[index]);
            if (c < 18) {
                scoringTemplate[i][j] = SCORE_BLACK;
            } else if (c < 110) {
                scoringTemplate[i][j] = SCORE_DARK_GRAY;
            } else if (c < 210) {
                scoringTemplate[i][j] = SCORE_LIGHT_GRAY;
            } else {
                scoringTemplate[i][j] = SCORE_WHITE;
            }

            j++;
            if (j >= TEMPLATE_SIZE) {
                i++;
                j = 0;
            }
        }

        return scoringTemplate;
    }

    /**
     * @param tracingBitmap Bitmap to be shown to the player when prompting player to trace.
     * @param scoringTemplate A byte array representing the scoring template for the rune. Templates
     *            images are png files with colors that correspond to the points that will be
     *            awarded to the player if they draw on that particular portion of the rune. The
     *            template images are converted to byte arrays with number in each cell
     *            corresponding to the points the player receives for drawing in that cell. The
     *            points are totaled to calculate the score that represents how accurately the
     *            player traced the rune.
     */
    public SpellRune(Bitmap tracingBitmap, byte[][] scoringTemplate) {
        mTracingBitmap = tracingBitmap;
        mScoringTemplate = scoringTemplate;
    }

    public Bitmap getTracingBitmap() {
        return mTracingBitmap;
    }

    /**
     * @param playerDrawnRune A bitmap representing the image that the player drew.
     * @return A float representing the score of the rune drawn by the player. This is a number that
     *         is roughly between 0 - 100, although the number can be greater than 100 if the player
     *         traced very well, and can be less than 0 if the player traced really badly. Treating
     *         the number as a percentage is a good rough estimate of how well the player did in
     *         tracing.
     */
    public float getRuneScore(Bitmap playerDrawnRune) {
        byte[][] drawnPixelData = ImageUtil.getPixelData(playerDrawnRune);

        int filledPixelsScore = 0;
        int score = 0;

        for (int i = 0; i < TEMPLATE_SIZE; ++i) {
            for (int j = 0; j < TEMPLATE_SIZE; ++j) {
                if (drawnPixelData[i][j] == 1) {
                    score += mScoringTemplate[i][j];
                }
                if (mScoringTemplate[i][j] == SCORE_BLACK) {
                    filledPixelsScore += SCORE_BLACK;
                }
            }
        }

        float percentage = score * 100.0f / filledPixelsScore;
        return percentage;
    }
}
