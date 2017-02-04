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

import com.google.cast.samples.games.spellcast.PlayableCharacter;
import com.google.cast.samples.games.spellcast.SpellcastApplication;
import com.google.cast.samples.games.spellcast.messages.SpellCastMessage.PlayerBonus;
import com.google.cast.samples.games.spellcast.messages.SpellCastMessage.SpellElement;
import com.google.cast.samples.games.spellcast.messages.SpellCastMessage.SpellType;

import android.graphics.Bitmap;
import android.util.Log;

/**
 * Implementation of a spell that can be cast by the user.
 */
public class Spell {
    private static final String TAG = "Spell";

    private final int mNameResourceId;
    private final int mIconResourceId;
    private final int mIconSelectedResourceId;
    private final SpellElement mSpellElement;
    private final SpellType mSpellType;
    private final String mRuneScoreTemplate;
    private final String mRuneAssetFile;
    private final int mNumberOfStrokes;

    private SpellRune mSpellRune = null;

    private boolean mIsLoaded = false;

    public Spell(final int spellNameResourceId, final int iconResourceId,
            final int iconSelectedResourceId, final SpellElement spellElement,
            final SpellType spellType, final String runeScoreTemplate,
            final String runeAssetFile, final int numberOfStrokes) {
        mNameResourceId = spellNameResourceId;
        mIconResourceId = iconResourceId;
        mIconSelectedResourceId = iconSelectedResourceId;
        mSpellElement = spellElement;
        mSpellType = spellType;
        mRuneScoreTemplate = runeScoreTemplate;
        mRuneAssetFile = runeAssetFile;
        mNumberOfStrokes = numberOfStrokes;
        mIsLoaded = false;
    }

    /**
     * @return True if loading occurred, false otherwise.
     */
    public boolean loadSpell() {
        if (isLoaded()) {
            return false;
        }

        Log.d(TAG, "Loading rune: " + mRuneScoreTemplate + " --- " + mRuneAssetFile);
        mSpellRune = SpellRune.loadRune(SpellcastApplication.getInstance().getAssets(),
                mRuneScoreTemplate, mRuneAssetFile);
        mIsLoaded = true;
        return mIsLoaded;
    }

    public SpellElement getElement() {
        return mSpellElement;
    }

    public int getIconResourceId() {
        return mIconResourceId;
    }

    public int getIconSelectedResourceId() {
        return mIconSelectedResourceId;
    }

    public SpellType getType() {
        return mSpellType;
    }

    public boolean canCast(PlayableCharacter user) {
        return true;
    }

    public boolean cast(PlayableCharacter user) {
        return true;
    }

    public boolean isLoaded() {
        return mIsLoaded;
    }

    /**
     * @return The number of strokes it takes to draw the spell.
     */
    public int getNumDrawStrokes() {
        return mNumberOfStrokes;
    }

    public Bitmap getRuneBitmap() {
        if (!isLoaded()) {
            return null;
        }
        return mSpellRune.getTracingBitmap();
    }

    public float getRuneScore(Bitmap playerDrawnRune) {
        return mSpellRune.getRuneScore(playerDrawnRune);
    }

    /**
     * Returns true if this spell will increased effected based on the PlayerBonus passed in.
     */
    public boolean isAffectedByBonus(PlayerBonus bonus) {
        if (bonus == null) {
            return false;
        }
        switch (bonus) {
            case ATTACK:
                return getType() == SpellType.BASIC_ATTACK;
            case HEAL:
                return getType() == SpellType.HEAL;
            case SHIELD:
                return getType() == SpellType.SHIELD;
            default:
                return false;
        }
    }
}
