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

import com.google.cast.samples.games.spellcast.SpellcastGameModel;

import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * State of the Game
 */
public class SpellCastGameData {
    private static final String KEY_GAME_STATE_ID = "gameStateId";
    private static final String TAG = "SpellCastGameData";


    private SpellcastGameModel.ReceiverGameState mCurrentGameState =
            SpellcastGameModel.ReceiverGameState.UNKNOWN;

    public SpellCastGameData(JSONObject gameData) {
        if (gameData != null) {
            try {
                int receiverStateId = gameData.getInt(KEY_GAME_STATE_ID);
                mCurrentGameState = getGameStateFromId(receiverStateId);

            } catch (JSONException e) {
                Log.w(TAG, "JSONException parsing gameData", e);
            }
        }
    }

    private SpellcastGameModel.ReceiverGameState getGameStateFromId(int gameStateId) {
        switch (gameStateId) {
            case 0:
                return SpellcastGameModel.ReceiverGameState.UNKNOWN;
            case 1:
                return SpellcastGameModel.ReceiverGameState.WAITING_FOR_PLAYERS;
            case 2:
                return SpellcastGameModel.ReceiverGameState.INSTRUCTIONS;
            case 3:
                return SpellcastGameModel.ReceiverGameState.PLAYER_ACTION;
            case 4:
                return SpellcastGameModel.ReceiverGameState.PLAYER_RESOLUTION;
            case 5:
                return SpellcastGameModel.ReceiverGameState.ENEMY_RESOLUTION;
            case 6:
                return SpellcastGameModel.ReceiverGameState.PLAYER_VICTORY;
            case 7:
                return SpellcastGameModel.ReceiverGameState.ENEMY_VICTORY;
            case 8:
                return SpellcastGameModel.ReceiverGameState.PAUSED;
            default:
                return SpellcastGameModel.ReceiverGameState.UNKNOWN;
        }
    }

    public SpellcastGameModel.ReceiverGameState getGameState() {
        return mCurrentGameState;
    }
}
