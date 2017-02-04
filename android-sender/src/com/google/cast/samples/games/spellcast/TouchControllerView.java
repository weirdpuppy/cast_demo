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

import com.google.cast.samples.games.spellcast.Events.EventType;
import com.google.cast.samples.games.spellcast.messages.SpellCastMessage.DifficultySetting;
import com.google.cast.samples.games.spellcast.messages.SpellCastMessage.SpellAccuracy;
import com.google.cast.samples.games.spellcast.spells.Spell;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PorterDuff.Mode;
import android.graphics.drawable.BitmapDrawable;
import android.util.AttributeSet;
import android.util.TypedValue;
import android.view.MotionEvent;
import android.view.View;

/**
 * Custom class for a view that will register touch/gestures from the user.
 */
public class TouchControllerView extends View {

    // Due to Api 17 not knowing how to deal with both adding a margin and custom measuring of the
    // view, this number will scale down the touch controller view's measured height before
    // making the entire thing square and a multiple of resolution.
    private static final float WIDTH_SCALE = 0.52f;

    // The background runes are a bit too black, set their alpha values to this value between 0-255.
    private static final int BACKGROUND_ALPHA = 180;

    // These arrays contain the minimum score the player must get in order to be scored as PERFECT,
    // GREAT and GOOD, in that order. If the player scores lower than the third value of the array,
    // it will be considered as a failure to cast the spell.
    private static float[] sDrawAccuracyThresholdsHard = { 100, 80, 50 };
    private static float[] sDrawAccuracyThresholdsNormal = { 80, 70, 40 };
    private static float[] sDrawAccuracyThresholdsEasy = { 50, 40, 20 };

    private Path mCurrentPath;
    private Paint mDrawPaint;
    private int mPaintColor = Color.WHITE;

    private float mCurrentBrushSize = 30.0f;
    private boolean mCanvasInitialized = false;

    private int mNumStrokes = 0;
    private Spell mSpell;

    private Bitmap mBitmap;
    private Canvas mBitmapCanvas;
    private DifficultySetting mDifficulty = DifficultySetting.EASY;

    public TouchControllerView(Context context, AttributeSet attributes) {
        super(context, attributes);
        float pixelAmount = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP,
                getResources().getInteger(R.integer.spellcast_touch_controller_brush_size),
                getResources().getDisplayMetrics());
        mCurrentBrushSize = pixelAmount;
    }

    public void setSpell(Spell spell, DifficultySetting difficulty) {
        mSpell = spell;
        mDifficulty = difficulty;
        clearCanvas();
        BitmapDrawable drawable = null;
        if (mSpell != null) {
            drawable = new BitmapDrawable(getResources(), mSpell.getRuneBitmap());
            drawable.setAlpha(BACKGROUND_ALPHA);
        }
        setBackground(drawable);
    }

    /**
     * Creates a drawing helper that will be used to draw to a view with dimensions width x height.
     *
     * @param width - The width of the view this drawing helper will draw to.
     * @param height - The height of the view this drawing helper will draw to.
     */
    private void init(int width, int height) {
        mCurrentPath = new Path();
        mDrawPaint = new Paint();
        mDrawPaint.setColor(mPaintColor);

        mDrawPaint.setAntiAlias(true);
        mDrawPaint.setStrokeWidth(mCurrentBrushSize);
        mDrawPaint.setStyle(Paint.Style.STROKE);
        mDrawPaint.setStrokeJoin(Paint.Join.ROUND);
        mDrawPaint.setStrokeCap(Paint.Cap.ROUND);

        mCanvasInitialized = true;
        mBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        mBitmapCanvas = new Canvas(mBitmap);
    }

    @Override
    protected void onSizeChanged(int width, int height, int oldWidth, int oldHeight) {
        super.onSizeChanged(width, height, oldWidth, oldHeight);

        init(width, height);
    }

    public void clearCanvas() {
        if (mCanvasInitialized) {
            mNumStrokes = 0;
            mCurrentPath.reset();
            mBitmapCanvas.drawColor(Color.TRANSPARENT, Mode.CLEAR);
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        if (!mCanvasInitialized) {
            return false;
        }

        if (mSpell == null) {
            return false;
        }

        float x = event.getX();
        float y = event.getY();

        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                mCurrentPath.moveTo(x, y);

                break;
            case MotionEvent.ACTION_MOVE:
                mCurrentPath.lineTo(x, y);

                break;
            case MotionEvent.ACTION_UP:
                mNumStrokes++;
                mBitmapCanvas.drawPath(mCurrentPath, mDrawPaint);
                mCurrentPath.reset();

                if (mNumStrokes >= mSpell.getNumDrawStrokes()) {
                    analyzeSpell();
                    setSpell(null, null);
                }
                break;
            default:
                return false;
        }
        invalidate();
        return true;
    }

    public void analyzeSpellOnEndTurn() {
        if (mSpell != null) {
            mBitmapCanvas.drawPath(mCurrentPath, mDrawPaint);
            analyzeSpell();
        }
    }

    private float[] getAccuracyThresholdTuning() {
        if (mDifficulty == null) {
            return sDrawAccuracyThresholdsEasy;
        }
        switch(mDifficulty) {
            case HARD:
                return sDrawAccuracyThresholdsHard;
            case NORMAL:
                return sDrawAccuracyThresholdsNormal;
            case EASY:
            default:
                return sDrawAccuracyThresholdsEasy;
        }
    }

    private void analyzeSpell() {
        // Image Compare.
        float percentageScore = mSpell.getRuneScore(mBitmap);

        SpellAccuracy accuracy = null;
        float[] accuracyThresholds = getAccuracyThresholdTuning();
        if (percentageScore > accuracyThresholds[0]) {
            accuracy = SpellAccuracy.PERFECT;
        } else if (percentageScore > accuracyThresholds[1]) {
            accuracy = SpellAccuracy.GREAT;
        } else if (percentageScore > accuracyThresholds[2]) {
            accuracy = SpellAccuracy.GOOD;
        }
        Events.SpellEventData eventData = new Events.SpellEventData(mSpell, accuracy);

        EventManager eventManager = SpellcastApplication.getInstance().getEventManager();
        eventManager.triggerEvent(
                accuracy != null ? EventType.SPELL_CAST_SUCCESSFUL
                : EventType.SPELL_CAST_FAIL, eventData);
    }

    /**
     * Override on measure so we can control the touch controller view's width. The drawing space
     * should be a square, but we want the height to stretch to the height of the screen and then
     * set the width = height.
     */
    @Override
    public void onMeasure(int widthSpec, int heightSpec) {
        super.onMeasure(widthSpec, heightSpec);
        int size = (int) (getMeasuredHeight() * WIDTH_SCALE);
        // Force the size of touch controller view to be a multiple of ImageUtil.RESOLUTION.
        int mod = size % ImageUtil.RESOLUTION;
        if (mod != 0) {
            size = size - mod;
        }
        setMeasuredDimension(size, size);
    }

    @Override
    public void onDraw(Canvas canvas) {
        if (!mCanvasInitialized) {
            return;
        }
        canvas.drawBitmap(mBitmap, 0, 0, null);
        canvas.drawPath(mCurrentPath, mDrawPaint);
    }

}
