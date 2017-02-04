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
import com.google.android.gms.cast.games.GameManagerState;
import com.google.cast.samples.games.spellcast.messages.PlayerRoundInfoMessage;
import com.google.cast.samples.games.spellcast.messages.SpellCastGameData;
import com.google.cast.samples.games.spellcast.spells.Spell;

import android.preference.PreferenceManager;
import android.util.Log;

import org.json.JSONObject;

import java.util.Observable;
import java.util.Observer;

/**
 * Manages game state and fires events as we receive updates from the receiver device. This is
 * managed by the Application class, and it is effectively a singleton.
 */
public class SpellcastGameModel implements Observer, GameManagerClient.Listener {

    private static final String TAG = "SpellcastGameModel";

    private PlayableCharacter mControlledCharacter;
    private SpellCastGameData mGameData;

    private final CastConnectionManager mCastConnectionManager;
    private final EventManager mEventManager;

    private Events.StartTurnData mTurnData;

    /**
     * Enum representing the different states of the spell cast receiver.
     */
    public enum ReceiverGameState {
        UNKNOWN,
        WAITING_FOR_PLAYERS,
        INSTRUCTIONS,
        PLAYER_ACTION,
        PLAYER_RESOLUTION,
        ENEMY_RESOLUTION,
        PLAYER_VICTORY,
        ENEMY_VICTORY,
        PAUSED
    }

    public SpellcastGameModel(CastConnectionManager castConnectionManager,
            EventManager eventManager) {
        mControlledCharacter = new PlayableCharacter(castConnectionManager, eventManager);
        mCastConnectionManager = castConnectionManager;
        mEventManager = eventManager;
        mCastConnectionManager.addObserver(this);
    }

    /**
     * Starts the initialization process, registering a player with the receiver and loading spells.
     * This is an async operation.
     */
    private void initialize() {
        getControlledCharacter().sendPlayerAvailableMessage(true);
    }

    public boolean isInitialized() {
        return mGameData != null;
    }

    public PlayableCharacter getControlledCharacter() {
        return mControlledCharacter;
    }

    public boolean isGameJoinable() {
        return isInitialized() && mGameData.getGameState() == ReceiverGameState.WAITING_FOR_PLAYERS;
    }

    public boolean isInCombat() {
        ReceiverGameState state = mGameData.getGameState();
        return isInitialized() && (state == ReceiverGameState.PLAYER_ACTION
            || state == ReceiverGameState.PLAYER_RESOLUTION
            || state == ReceiverGameState.ENEMY_RESOLUTION);
    }

    public void setTurnData(Events.StartTurnData turnData) {
        mTurnData = turnData;
    }

    @Override
    public void onStateChanged(GameManagerState newState, GameManagerState oldState) {
        // The player for this sender just registered.
        if (oldState.getConnectedControllablePlayers().size() == 0
                && newState.getConnectedControllablePlayers().size() > 0) {
            mGameData = new SpellCastGameData(newState.getGameData());
            PlayableCharacter character = getControlledCharacter();
            SpellcastApplication app = SpellcastApplication.getInstance();
            character.loadFromSettings(PreferenceManager.getDefaultSharedPreferences(app));
            for (Spell spell : character.getSpells()) {
                spell.loadSpell();
            }
            mEventManager.triggerEvent(Events.EventType.GAME_MODEL_UPDATED);
        }

        // Receiver state has changed.
        if (newState.hasGameDataChanged(oldState)) {
            Log.d(TAG, "Game data state update " + newState.getGameData().toString());
            mGameData = new SpellCastGameData(newState.getGameData());
            mEventManager.triggerEvent(Events.EventType.GAME_MODEL_UPDATED);
            switch (mGameData.getGameState()) {
                case PLAYER_ACTION:
                    mEventManager.triggerEvent(Events.EventType.RECEIVER_BATTLE_START);
                    break;
                case WAITING_FOR_PLAYERS:
                    mEventManager.triggerEvent(Events.EventType.RECEIVER_WAITING_FOR_PLAYERS);
                    break;
                case INSTRUCTIONS:
                    Log.v(TAG, "Instructions on the TV.");
                    break;
                case ENEMY_RESOLUTION:
                    mEventManager.triggerEvent(Events.EventType.RECEIVER_BATTLE_START);
                    break;
                case PLAYER_RESOLUTION:
                    Log.v(TAG, "Game in progress.");
                    mEventManager.triggerEvent(Events.EventType.RECEIVER_STATUS_GAME_IN_PROGRESS);
                    break;
                case ENEMY_VICTORY:
                    mControlledCharacter.sendPlayerAvailableMessage(false);
                    mEventManager.triggerEvent(Events.EventType.RECEIVER_GAME_LOST);
                    break;
                case PLAYER_VICTORY:
                    mControlledCharacter.sendPlayerAvailableMessage(false);
                    mEventManager.triggerEvent(Events.EventType.RECEIVER_GAME_WON);
                    break;
                case PAUSED:
                    Log.v(TAG, "Game paused.");
                    break;
                default:
            }
        }
    }

    @Override
    public void onGameMessageReceived(String playerId, JSONObject message) {
        EventManager eventManager = SpellcastApplication.getInstance().getEventManager();
        PlayerRoundInfoMessage playerRoundInfoMessage = new PlayerRoundInfoMessage(message);
        Events.StartTurnData startTurnData = new Events.StartTurnData(
                playerRoundInfoMessage.getCastSpellsDurationMillis(),
                playerRoundInfoMessage.getPlayerBonus());
        eventManager.triggerEvent(Events.EventType.START_PLAYER_TURN, startTurnData);
    }

    /**
     * Called when the cast connection changes.
     */
    @Override
    public void update(Observable object, Object data) {
        if (mCastConnectionManager.isConnectedToReceiver()) {
            if (!isInitialized()) {
                mCastConnectionManager.getGameManagerClient().setListener(this);
                this.initialize();
            }
        } else {
            mGameData = null;
        }
    }

}
