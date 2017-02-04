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
package com.google.cast.samples.games.spellcast.messages;

import com.google.cast.samples.games.spellcast.EventManager;

import org.json.JSONObject;

/**
 * Base class for messages to be sent to the receiver as extra messages.
 */
public abstract class SpellCastMessage implements EventManager.EventData {

    private interface SpellCastEnum {
        int ordinal();
    }

    /**
     * Enumeration of the different difficulty settings available. Keep in sync with
     * {@code cast.games.spellcast.messages.DifficultySetting}
     */
    public enum DifficultySetting implements SpellCastEnum {
        EASY,
        NORMAL,
        HARD,
    }

    /**
     * Enumeration of the possible player bonuses that can be given each round. Keep in sync with
     * {@code cast.games.spellcast.messages.PlayerBonus}
     */
    public enum PlayerBonus implements SpellCastEnum {
        NONE,
        ATTACK,
        HEAL,
        SHIELD,
    }

    /**
     * Enumeration of the different spell types. Keep in sync with
     * {@code cast.games.spellcast.messages.SpellType}
     */
    public enum SpellType implements SpellCastEnum {
        BASIC_ATTACK,
        HEAL,
        SHIELD
    }

    /**
     * Enumeration of the different spell elements. Keep in sync with
     * {@code cast.games.spellcast.messages.SpellElement}
     */
    public enum SpellElement implements SpellCastEnum {
        NONE,
        AIR,
        WATER,
        FIRE,
        EARTH,
    }

    /**
     * Enumeration of the different spell accuracies. Accuracy is determined by how well the player
     * traced the spell's rune. Keep in sync with
     * {@code cast.games.spellcast.messages.SpellAccuracy}
     */
    public enum SpellAccuracy implements SpellCastEnum {
        PERFECT,
        GREAT,
        GOOD,
    }

    public static int spellCastEnumToInt(SpellCastEnum e) {
        return e.ordinal() + 1;
    }

    public abstract JSONObject toJSON();
}
