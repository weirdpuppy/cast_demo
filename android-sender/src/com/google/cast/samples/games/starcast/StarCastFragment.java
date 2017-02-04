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

import android.app.Fragment;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.Button;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * The main activity for StarCast game.
 */
public class StarCastFragment extends Fragment {
    private static final String TAG = "StarCastFragment";

    public static final int MESSAGE_TYPE_STARCAST_FIRE = 1;
    public static final int MESSAGE_TYPE_STARCAST_MOVE = 2;
    private static final String MESSAGE_FIELD_STARCAST_FIRE = "fire";
    private static final String MESSAGE_FIELD_STARCAST_MOVE = "move";

    private TouchControllerView mTouchControllerView;
    private Button mFireButton;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
            Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.starcast_main, container, false);

        mTouchControllerView = (TouchControllerView) view.findViewById(R.id.touch_controller);

        mFireButton = (Button) view.findViewById(R.id.button_fire);
        mFireButton.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View view) {
                StarcastApplication.getInstance().getSendMessageHandler().enqueueMessage(
                        MESSAGE_TYPE_STARCAST_FIRE, createFireMessage());
            }

        });
        return view;
    }

    public static JSONObject createFireMessage() {
        JSONObject fireMessage = new JSONObject();
        try {
            fireMessage.put(MESSAGE_FIELD_STARCAST_FIRE, true);
        } catch (JSONException e) {
            Log.e(TAG, "Error creating JSON fire message", e);
        }
        return fireMessage;
    }

    public static JSONObject createMoveMessage(float move) {
        JSONObject moveMessage = new JSONObject();
        try {
            moveMessage.put(MESSAGE_FIELD_STARCAST_MOVE, move);
        } catch (JSONException e) {
            Log.e(TAG, "Error creating JSON move message", e);
        }
        return moveMessage;
    }
}
