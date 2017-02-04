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

import com.google.cast.samples.games.spellcast.messages.SpellCastMessage.PlayerBonus;

import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Represents the message that arrives at the start of every player turn, containing the player
 * bonus and round duration in milliseconds.
 */
public class PlayerRoundInfoMessage {

    private static final String KEY_PLAYER_BONUS = "playerBonus";
    private static final String KEY_CAST_SPELLS_DURATION = "castSpellsDurationMillis";

    private static final String TAG = "PlayerRoundInfoMessage";

    private PlayerBonus mPlayerBonus = PlayerBonus.NONE;
    private int mCastSpellsDurationMillis = 0;

    public PlayerRoundInfoMessage(JSONObject message) {
        try {
            mCastSpellsDurationMillis = message.getInt(KEY_CAST_SPELLS_DURATION);
            int playerBonusInt = message.getInt(KEY_PLAYER_BONUS);
            mPlayerBonus = getPlayerBonusFromInt(playerBonusInt);

        } catch (JSONException e) {
            Log.w(TAG, "JSONException parsing gameData: " + message, e);
        }
    }

    private PlayerBonus getPlayerBonusFromInt(int playerBonus) {
        switch (playerBonus) {
            case 1:
                return PlayerBonus.NONE;
            case 2:
                return PlayerBonus.ATTACK;
            case 3:
                return PlayerBonus.HEAL;
            case 4:
                return PlayerBonus.SHIELD;
            default:
                return PlayerBonus.NONE;
        }
    }

    public PlayerBonus getPlayerBonus() {
        return mPlayerBonus;
    }

    public int getCastSpellsDurationMillis() {
        return mCastSpellsDurationMillis;
    }

}
