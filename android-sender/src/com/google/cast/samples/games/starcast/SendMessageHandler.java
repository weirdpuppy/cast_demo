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
package com.google.cast.samples.games.starcast;

import com.google.android.gms.cast.games.GameManagerClient;
import com.google.android.gms.cast.games.GameManagerState;

import android.annotation.SuppressLint;
import android.os.Handler;

import org.json.JSONObject;

import java.util.HashMap;

/**
 * A handler class that sends messages at specified intervals. This allows throttling of messages so
 * they don't all get sent immediately.
 */
public class SendMessageHandler extends Handler {

    // The int used for the "what" field used when sending messages.
    private static final int MESSAGE_WHAT_VALUE = 0;

    private static final int SEND_MESSAGE_DELAY_MS = 50;

    private CastConnectionManager mCastConnectionManager;

    // Mapping of message type (an int) to message. Used for tracking only one message per type.
    // We don't want sparse arrays! We want to be able to get all the values in the map, and sparse
    // arrays don't let us do that!
    @SuppressLint("UseSparseArrays")
    private HashMap<Integer, JSONObject> mMessageMap = new HashMap<>();

    public SendMessageHandler(CastConnectionManager castConnectionManager) {
        mCastConnectionManager = castConnectionManager;
    }

    @Override
    public void handleMessage(android.os.Message unused) {
        processMessages();
        sendEmptyMessageDelayed(MESSAGE_WHAT_VALUE, SEND_MESSAGE_DELAY_MS);
    }

    private void processMessages() {
        if (!mCastConnectionManager.isConnectedToReceiver()) {
            return;
        }
        GameManagerClient gameManagerClient = mCastConnectionManager.getGameManagerClient();
        GameManagerState state = gameManagerClient.getCurrentState();
        if (state.getConnectedControllablePlayers().size() == 0) {
            return;
        }

        String playerId = state.getConnectedControllablePlayers().get(0).getPlayerId();
        for (JSONObject message : mMessageMap.values()) {
            gameManagerClient.sendGameMessage(playerId, message);
        }
        mMessageMap.clear();
    }

    /**
     * Sets a message of the specified messageType to be sent to the receiver. If this function is
     * called more than once with the same messageType, only the message from the last call will be
     * sent. This is so we only send one message per messageType every message cycle.
     *
     * @param messageType integer representing type of the message.
     * @param message the JSON message to be sent to the receiver.
     */
    public void enqueueMessage(int messageType, JSONObject message) {
        mMessageMap.put(messageType, message);
    }

    public void flushMessages() {
        processMessages();
        removeMessages(MESSAGE_WHAT_VALUE);
    }

    public void resumeSendingMessages() {
        sendEmptyMessageDelayed(MESSAGE_WHAT_VALUE, SEND_MESSAGE_DELAY_MS);
    }
}
