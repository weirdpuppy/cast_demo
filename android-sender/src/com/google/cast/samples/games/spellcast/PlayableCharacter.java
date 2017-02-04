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

import com.google.android.gms.cast.games.GameManagerClient;
import com.google.android.gms.common.api.PendingResult;
import com.google.android.gms.common.api.ResultCallback;
import com.google.cast.samples.games.spellcast.Events.EventType;
import com.google.cast.samples.games.spellcast.Events.SpellEventData;
import com.google.cast.samples.games.spellcast.messages.CastSpellsMessage;
import com.google.cast.samples.games.spellcast.messages.PlayerPlayingMessage;
import com.google.cast.samples.games.spellcast.messages.PlayerReadyMessage;
import com.google.cast.samples.games.spellcast.messages.SpellCastMessage.DifficultySetting;
import com.google.cast.samples.games.spellcast.spells.Spell;
import com.google.cast.samples.games.spellcast.spells.SpellDeclarations;

import android.content.SharedPreferences;
import android.util.Log;

import java.util.ArrayList;
import java.util.List;

/**
 * A wizard controlled by a player.
 */
public class PlayableCharacter {

    private static final String TAG = "PlayableCharacter";

    private final CastConnectionManager mCastConnectionManager;
    private final EventManager mEventManager;

    private String mName = null;
    private int mCharacterAvatarIndex = PickCharacterAvatarPreference.DEFAULT_VALUE;
    private DifficultySetting mDifficulty = DifficultySetting.EASY;

    private ArrayList<Spell> mSpells = new ArrayList<>();

    private CastSpellsMessage mCastSpellsMessage;

    private int mPlayerState = GameManagerClient.PLAYER_STATE_UNKNOWN;

    private PendingResult<GameManagerClient.GameManagerResult> mPlayerRequestPendingResult;

    public PlayableCharacter(CastConnectionManager castConnectionManager,
            EventManager eventManager) {
        mCastConnectionManager = castConnectionManager;
        mEventManager = eventManager;

        mCastSpellsMessage = new CastSpellsMessage();
        mSpells.add(SpellDeclarations.sFireAttackSpell);
        mSpells.add(SpellDeclarations.sEarthAttackSpell);
        mSpells.add(SpellDeclarations.sHealSpell);
        mSpells.add(SpellDeclarations.sWaterAttackSpell);
        mSpells.add(SpellDeclarations.sShieldSpell);
        mSpells.add(SpellDeclarations.sAirAttackSpell);
    }

    public void setName(String name) {
        mName = name;
    }

    public List<Spell> getSpells() {
        return mSpells;
    }

    public void enqueueSpell(SpellEventData spellEventData) {
        mCastSpellsMessage.addSpell(spellEventData);
    }

    public void sendSpells() {
        Log.i(TAG, "Sending game message : " + mCastSpellsMessage.toJSON());
        final GameManagerClient gameManagerClient =
                mCastConnectionManager.getGameManagerClient();
        gameManagerClient.sendGameRequest(mCastSpellsMessage.toJSON());
        mCastSpellsMessage.clear();
        EventManager eventManager = SpellcastApplication.getInstance().getEventManager();
        eventManager.triggerEvent(EventType.SPELLS_SENT);
    }

    public DifficultySetting getDifficultySetting() {
        return mDifficulty;
    }

    public int getPlayerState() {
        return mPlayerState;
    }

    public boolean isPlayerRequestInProgress() {
        return mPlayerRequestPendingResult != null;
    }

    /**
     * Load data specific to this character from the passed in shared preferences.
     */
    public void loadFromSettings(SharedPreferences preferences) {
        SpellcastApplication app = SpellcastApplication.getInstance();
        mCharacterAvatarIndex =
                preferences.getInt((String) app.getText(R.string.pref_avatar_key), 1) - 1;
        mName = preferences.getString(
                (String) app.getText(R.string.pref_character_name_key),
                (String) app.getText(R.string.pref_character_name_default));

        // Note: There's currently a bug where list preference values are always strings, so in
        // order to get the integer value back out, we have to parse the saved string.
        String difficultyValue = preferences.getString(
                (String) app.getText(R.string.pref_difficulty_key),
                (String) app.getText(R.string.pref_difficulty_default));
        int parsedDifficulty = Integer.parseInt(difficultyValue);
        mDifficulty = DifficultySetting.values()[parsedDifficulty - 1];
    }

    /**
     * Send a player ready message to the receiver with data specific to this player.
     */
    public void sendPlayerAvailableMessage(boolean registerNewPlayer) {
        if (mCastConnectionManager.isConnectedToReceiver() && mPlayerRequestPendingResult == null) {
            Log.i(TAG, "Sending player available message : ");
            final GameManagerClient gameManagerClient =
                    mCastConnectionManager.getGameManagerClient();
            String playerId = null;
            if (!registerNewPlayer) {
                playerId = gameManagerClient.getLastUsedPlayerId();
            }
            mPlayerRequestPendingResult = gameManagerClient.sendPlayerAvailableRequest(
                    playerId, null);
            mPlayerRequestPendingResult.setResultCallback(
                    new ResultCallback<GameManagerClient.GameManagerResult>() {
                        @Override
                        public void onResult(GameManagerClient.GameManagerResult result) {
                            mPlayerRequestPendingResult = null;
                            if (result.getStatus().isSuccess()) {
                                mPlayerState = gameManagerClient.getCurrentState().getPlayer(
                                        result.getPlayerId()).getPlayerState();
                                mEventManager.triggerEvent(EventType.GAME_MODEL_UPDATED);
                            } else {
                                Log.w(TAG, "Player available request failed");
                                SpellcastApplication app = SpellcastApplication.getInstance();
                                app.getCastConnectionManager().disconnectFromReceiver(false);
                                Events.OnPlayerConnectionErrorData eventData =
                                        new Events.OnPlayerConnectionErrorData(
                                                result.getStatus().getStatusMessage());
                                mEventManager.triggerEvent(EventType.ON_PLAYER_CONNECTION_ERROR,
                                        eventData);
                            }
                        }
                    });
        }
    }

    /**
     * Send a player ready message to the receiver with data specific to this player.
     */
    public void sendPlayerReadyMessage() {
        PlayerReadyMessage playerReadyMessage = new PlayerReadyMessage(mName,
                mCharacterAvatarIndex);

        if (mCastConnectionManager.isConnectedToReceiver() && mPlayerRequestPendingResult == null) {
            Log.i(TAG, "Sending player ready message : " + playerReadyMessage.toJSON());
            final GameManagerClient gameManagerClient =
                    mCastConnectionManager.getGameManagerClient();
            mPlayerRequestPendingResult =
                    gameManagerClient.sendPlayerReadyRequest(playerReadyMessage.toJSON());
            mPlayerRequestPendingResult.setResultCallback(
                    new ResultCallback<GameManagerClient.GameManagerResult>() {
                @Override
                public void onResult(GameManagerClient.GameManagerResult result) {
                    mPlayerRequestPendingResult = null;
                    if (result.getStatus().isSuccess()) {
                        mPlayerState = gameManagerClient.getCurrentState().getPlayer(
                                result.getPlayerId()).getPlayerState();
                        mEventManager.triggerEvent(Events.EventType.GAME_MODEL_UPDATED);
                    }
                }
            });
        }
    }

    /**
     * Send a player ready message to the receiver with data specific to this player.
     */
    public void sendPlayerPlayingMessage() {
        PlayerPlayingMessage startGameMessage = new PlayerPlayingMessage(getDifficultySetting());

        if (mCastConnectionManager.isConnectedToReceiver() && mPlayerRequestPendingResult == null) {
            Log.i(TAG, "Sending player playing message : " + startGameMessage.toJSON());
            final GameManagerClient gameManagerClient =
                    mCastConnectionManager.getGameManagerClient();
            mPlayerRequestPendingResult =
                    gameManagerClient.sendPlayerPlayingRequest(startGameMessage.toJSON());
            mPlayerRequestPendingResult.setResultCallback(
                    new ResultCallback<GameManagerClient.GameManagerResult>() {
                        @Override
                        public void onResult(GameManagerClient.GameManagerResult result) {
                            mPlayerRequestPendingResult = null;
                            if (result.getStatus().isSuccess()) {
                                mPlayerState = gameManagerClient.getCurrentState().getPlayer(
                                        result.getPlayerId()).getPlayerState();
                                mEventManager.triggerEvent(Events.EventType.GAME_MODEL_UPDATED);
                            }
                        }
                    });
        }
    }
}
