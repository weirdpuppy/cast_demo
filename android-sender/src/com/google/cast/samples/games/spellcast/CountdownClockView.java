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

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.util.AttributeSet;
import android.widget.TextView;

/**
 * Custom image view that draws an arc to show the amount of time remaining.
 */
public class CountdownClockView extends TextView {
    private static final float START_ANGLE = 270f;
    private static final float WIDTH_MULTIPLIER = .3f;
    private static final int FULL_ARC = 360;
    private RectF mArcRect;
    private Paint mArcPaint = new Paint();
    private int mCurrentSweep = FULL_ARC;

    public CountdownClockView(Context context, AttributeSet attrs) {
        super(context, attrs);
        mArcPaint.setAntiAlias(true);
        mArcPaint.setColor(
                context.getResources().getColor(R.color.spellcast_spell_background_arc_color));
        mArcPaint.setStyle(Paint.Style.STROKE);
        mArcPaint.setStrokeWidth(30.0f);
    }

    @Override
    protected void onSizeChanged(int width, int height, int oldWidth, int oldHeight) {
        super.onSizeChanged(width, height, oldWidth, oldHeight);
        float arcWidth = height * WIDTH_MULTIPLIER;

        mArcRect = new RectF(width / 2f - arcWidth, height / 2 - arcWidth, width / 2f + arcWidth,
                height / 2 + arcWidth);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        canvas.drawArc(mArcRect, START_ANGLE, mCurrentSweep, false, mArcPaint);
        super.onDraw(canvas);

    }

    /**
     * @param completionFactor Value must be in [0, 1].
     */
    public void updateArc(float completionFactor) {
        mCurrentSweep = (int) (FULL_ARC * completionFactor);
        invalidate();
    }
}
