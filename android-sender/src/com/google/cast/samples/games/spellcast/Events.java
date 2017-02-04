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
import com.google.cast.samples.games.spellcast.messages.SpellCastMessage.PlayerBonus;
import com.google.cast.samples.games.spellcast.messages.SpellCastMessage.SpellAccuracy;
import com.google.cast.samples.games.spellcast.spells.Spell;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Class that holds an enum of events that can be thrown in the game and a static event manager.
 */
public class Events {

    /**
     * The different events that can exist in the game.
     */
    public enum EventType {
        SPELL_CAST_SUCCESSFUL,
        SPELL_CAST_FAIL,
        SPELLS_SENT,
        START_PLAYER_TURN,
        END_PLAYER_TURN,
        RECEIVER_WAITING_FOR_PLAYERS,
        RECEIVER_BATTLE_START,
        RECEIVER_STATUS_GAME_IN_PROGRESS,
        RECEIVER_GAME_WON,
        RECEIVER_GAME_LOST,
        GAME_MODEL_UPDATED,
        ON_PLAYER_CONNECTION_ERROR,
    }

    /**
     * Event Data used to pass a spell as data.
     */
    public static class SpellEventData implements EventManager.EventData {
        private final Spell mSpell;
        private final SpellAccuracy mAccuracy;

        private static final String KEY_SPELL_TYPE = "spellType";
        private static final String KEY_SPELL_ELEMENT = "spellElement";
        private static final String KEY_SPELL_ACCURACY = "spellAccuracy";

        public SpellEventData(Spell spell, SpellAccuracy accuracy) {
            mSpell = spell;
            mAccuracy = accuracy;
        }

        public Spell getSpell() {
            return mSpell;
        }

        public SpellAccuracy getAccuracy() {
            return mAccuracy;
        }

        public JSONObject toJSON() {
            JSONObject serialized = new JSONObject();
            try {
                serialized.put(KEY_SPELL_TYPE,
                        SpellCastMessage.spellCastEnumToInt(mSpell.getType()));
                serialized.put(KEY_SPELL_ELEMENT,
                        SpellCastMessage.spellCastEnumToInt(mSpell.getElement()));
                serialized.put(KEY_SPELL_ACCURACY,
                        SpellCastMessage.spellCastEnumToInt(mAccuracy));
            } catch (JSONException e) {
                e.printStackTrace();
            }

            return serialized;
        }
    }

    /**
     * Event Data used to pass data when we trigger a Start Player Turn Event.
     */
    public static class StartTurnData implements EventManager.EventData {
        private final int mTurnMilliseconds;
        private final PlayerBonus mPlayerBonus;

        public StartTurnData(int turnMilliseconds, PlayerBonus playerBonus) {
            mTurnMilliseconds = turnMilliseconds;
            mPlayerBonus = playerBonus;
        }

        public int getTurnMilliseconds() {
            return mTurnMilliseconds;
        }

        public PlayerBonus getPlayerBonus() {
            return mPlayerBonus;
        }
    }

    /**
     * Event Data used to pass error message when we trigger a show error dialog event.
     */
    public static class OnPlayerConnectionErrorData implements EventManager.EventData {
        private final String mErrorMessage;

        public OnPlayerConnectionErrorData(String errorMessage) {
            mErrorMessage = errorMessage;
        }

        public String getErrorMessage() {
            return mErrorMessage;
        }
    }
}
