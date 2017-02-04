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

import com.google.cast.samples.games.spellcast.messages.SpellCastMessage;
import com.google.cast.samples.games.spellcast.spells.Spell;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.util.AttributeSet;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.ImageView;

/**
 * Custom View for rendering spell buttons in a circle.
 */
public class SpellCircleView extends FrameLayout {

    private static final int ATTACK_SPELL_SIZE_DEFAULT = 400;
    private static final int NON_ATTACK_SPELL_SIZE_DEFAULT = 300;

    private static final float SPELL_ICON_MARGIN_SMALL_WIDTH_PERCENTAGE = 0.14f;
    private static final float SPELL_ICON_MARGIN_WIDTH_PERCENTAGE = 0.145f;
    private static final float SPELL_ICON_FIRST_ROW_HEIGHT_PERCENTAGE = 0.2f;
    private static final float SPELL_ICON_SECOND_ROW_HEIGHT_PERCENTAGE = 0.5f;
    private static final float SPELL_ICON_THIRD_ROW_HEIGHT_PERCENTAGE = 0.8f;


    /**
     * Listener for when a spell is selected.
     */
    public interface OnSpellSelectListener {
        /**
         * Called when a spell is selected by the user.
         *
         * @param spell the spell that is selected.
         */
        void onSpellSelected(Spell spell);
    }

    private SpellButton mSelectedButton;

    public SpellCircleView(Context context, AttributeSet attrs) {
        super(context, attrs);
        TypedArray spellButtonType = context.obtainStyledAttributes(attrs,
                R.styleable.SpellButtonCircle, 0, 0);
        spellButtonType.recycle();
    }

    public void attachSpells(PlayableCharacter character, OnSpellSelectListener listener) {
        removeAllViews();
        OnSpellClickListener spellClickListener = new OnSpellClickListener(listener);
        for (Spell spell : character.getSpells()) {
            SpellButton spellButton = new SpellButton(getContext(), spell, spellClickListener);
            int size = NON_ATTACK_SPELL_SIZE_DEFAULT;
            if (spell.getType() == SpellCastMessage.SpellType.BASIC_ATTACK) {
                size = ATTACK_SPELL_SIZE_DEFAULT;
            }
            FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(size, size);
            spellButton.setLayoutParams(layoutParams);
            addView(spellButton);
        }
    }

    @Override
    protected void onSizeChanged(int width, int height, int oldWidth, int oldHeight) {
        super.onSizeChanged(width, height, oldWidth, oldHeight);

        int childCount = getChildCount();
        for (int i = 0; i < childCount; ++i) {
            int x = 0;
            int y = 0;
            SpellButton button = (SpellButton) getChildAt(i);
            Spell spell = button.getSpell();

            // Position the icons in their corresponding positions. Attack spells form a square
            // around the screen. The Shield and heal go in the middle row and a little bit further
            // away from the center of the screen.
            switch (spell.getType()) {
                case BASIC_ATTACK:
                    x = getXPositionForAttackSpell(width, spell.getElement());
                    y = getYPositionForAttackSpell(height, spell.getElement());
                    break;
                case SHIELD:
                    x = Math.round(width * SPELL_ICON_MARGIN_SMALL_WIDTH_PERCENTAGE);
                    y = Math.round(height * SPELL_ICON_SECOND_ROW_HEIGHT_PERCENTAGE);
                    break;
                case HEAL:
                    x = Math.round(width * (1 - SPELL_ICON_MARGIN_SMALL_WIDTH_PERCENTAGE));
                    y = Math.round(height * SPELL_ICON_SECOND_ROW_HEIGHT_PERCENTAGE);
                    break;
            }

            FrameLayout.LayoutParams layoutParams =
                    (FrameLayout.LayoutParams) button.getLayoutParams();
            layoutParams.setMargins(x - layoutParams.width / 2, y - layoutParams.height / 2, 0, 0);
        }
    }

    public void notifyDataSetChanged() {
        int childCount = getChildCount();
        for (int i = 0; i < childCount; ++i) {
            SpellButton spellButton = (SpellButton) getChildAt(i);
            spellButton.setSelected(spellButton == mSelectedButton);
            spellButton.setEnabled(isEnabled());
        }
    }

    @Override
    public void setEnabled(boolean enabled) {
        mSelectedButton = null;
        super.setEnabled(enabled);
        notifyDataSetChanged();
    }

    private int getXPositionForAttackSpell(int width, SpellCastMessage.SpellElement element) {
        switch (element) {
            case WATER:
            case EARTH:
                return Math.round(width * SPELL_ICON_MARGIN_WIDTH_PERCENTAGE);
            case FIRE:
            case AIR:
                return Math.round(width * (1 - SPELL_ICON_MARGIN_WIDTH_PERCENTAGE));
        }
        return 0;
    }

    private int getYPositionForAttackSpell(int height, SpellCastMessage.SpellElement element) {
        switch (element) {
            case WATER:
            case FIRE:
                return Math.round(height * SPELL_ICON_FIRST_ROW_HEIGHT_PERCENTAGE);
            case EARTH:
            case AIR:
                return Math.round(height * SPELL_ICON_THIRD_ROW_HEIGHT_PERCENTAGE);
        }
        return 0;
    }

    private class OnSpellClickListener implements OnClickListener {
        private final OnSpellSelectListener mListener;

        public OnSpellClickListener(OnSpellSelectListener listener) {
            mListener = listener;
        }

        @Override
        public void onClick(View view) {
            SpellButton spellButton = (SpellButton) view;
            mListener.onSpellSelected(spellButton.mSpell);
            if (mSelectedButton != spellButton) {
                if (mSelectedButton != null) {
                    mSelectedButton.setSelected(false);
                }
                mSelectedButton = spellButton;
                mSelectedButton.setSelected(true);
            }
        }
    }

    /**
     * Custom class for each button that can be clicked to cast the corresponding spell.
     */
    private static final class SpellButton extends ImageView {
        private Spell mSpell;
        private final ColorMatrixColorFilter mGrayScaleFilter;

        public SpellButton(Context context, Spell spell, OnSpellClickListener listener) {
            super(context);
            mSpell = spell;
            setImageResource(mSpell.getIconResourceId());
            setOnClickListener(listener);
            setFocusable(true);
            ColorMatrix matrix = new ColorMatrix();
            matrix.setSaturation(0);
            mGrayScaleFilter = new ColorMatrixColorFilter(matrix);
        }

        @Override
        public void setEnabled(boolean isEnabled) {
            if (isEnabled) {
                getDrawable().clearColorFilter();
            } else {
                getDrawable().setColorFilter(mGrayScaleFilter);
                setBackgroundResource(0);
            }
            super.setEnabled(isEnabled);
        }

        @Override
        public void setSelected(boolean isSelected) {
            setImageResource(
                    isSelected ? mSpell.getIconSelectedResourceId() : mSpell.getIconResourceId());
            super.setSelected(isSelected);
        }

        public Spell getSpell() {
            return mSpell;
        }
    }
}
