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
package com.google.cast.samples.games.spritedemo;

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
 * Fragment for sprite demo cast application.
 */
public class SpriteDemoFragment extends Fragment {
    private static final String TAG = "SpriteDemoFragment";

    private Button mAddSpriteButton;
    private JSONObject mJsonMessage;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setRetainInstance(true);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
            Bundle savedInstanceState) {
        mJsonMessage = new JSONObject();
        try {
            mJsonMessage.put("type", 1);
        } catch (JSONException e) {
            Log.e(TAG, "Error creating JSON message", e);
        }

        // Inflate the layout for this fragment.
        View view = inflater.inflate(R.layout.spritedemo_fragment, container, false);
        mAddSpriteButton = (Button) view.findViewById(R.id.button_add_sprite);
        mAddSpriteButton.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                CastConnectionManager manager =
                        SpritedemoApplication.getInstance().getCastConnectionManager();
                manager.getGameManagerClient().sendGameMessage(mJsonMessage);
            }
        });

        return view;
    }
}
