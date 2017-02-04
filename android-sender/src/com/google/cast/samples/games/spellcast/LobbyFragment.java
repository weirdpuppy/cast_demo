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

import android.app.Fragment;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.TypedArray;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;

/**
 * Fragment used to display the lobby for spellcast.
 */
public class LobbyFragment extends Fragment implements EventManager.EventListener {

    private TextView mCharacterNameTextView;
    private ImageView mAvatarImageView;
    private Button mSetupCharacterButton;
    private Button mJoinStartButton;
    private ProgressBar mSpinner;

    private static final Events.EventType[] HANDLED_EVENTS = {
            Events.EventType.GAME_MODEL_UPDATED,
    };

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
            Bundle savedInstanceState) {
        return inflater.inflate(R.layout.lobby_fragment, container, false);
    }

    @Override
    public void onResume() {
        super.onResume();
        updateView();
        EventManager eventManager = SpellcastApplication.getInstance().getEventManager();
        eventManager.addEventListener(HANDLED_EVENTS, this);
    }

    @Override
    public void onPause() {
        super.onPause();
        EventManager eventManager = SpellcastApplication.getInstance().getEventManager();
        eventManager.removeEventListener(HANDLED_EVENTS, this);
    }

    @Override
    public void handleEvent(Events.EventType eventType, EventManager.EventData eventData) {
        switch (eventType) {
            case GAME_MODEL_UPDATED:
                updateView();
                break;
        }
    }

    private void updateView() {
        SharedPreferences preferences =
                PreferenceManager.getDefaultSharedPreferences(getActivity());
        String characterName = preferences.getString(
                (String) getText(R.string.pref_character_name_key),
                (String) getText(R.string.pref_character_name_default));

        mAvatarImageView = (ImageView) getView().findViewById(R.id.avatar);
        mAvatarImageView.setImageResource(getAvatarResourceId());
        mCharacterNameTextView = (TextView) getView().findViewById(R.id.character_name);
        mCharacterNameTextView.setText(characterName);

        mSetupCharacterButton = (Button) getView().findViewById(R.id.button_setup_character);
        mSetupCharacterButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(getActivity(), CharacterSetupActivity.class);
                startActivity(intent);
            }
        });

        mSpinner = (ProgressBar) getView().findViewById(R.id.spinner);
        mJoinStartButton = (Button) getView().findViewById(R.id.button_join_start);
        mJoinStartButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                onJoinReadyClicked();
            }
        });

        SpellcastGameModel model = SpellcastApplication.getInstance().getGameModel();
        PlayableCharacter player = model.getControlledCharacter();

        if (player.getPlayerState() == GameManagerClient.PLAYER_STATE_AVAILABLE) {
            mSetupCharacterButton.setVisibility(View.VISIBLE);
        } else {
            mSetupCharacterButton.setVisibility(View.INVISIBLE);
        }

        if (model.isGameJoinable() && !player.isPlayerRequestInProgress()) {
            mJoinStartButton.setVisibility(View.VISIBLE);
            mSpinner.setVisibility(View.GONE);
            if (player.getPlayerState() == GameManagerClient.PLAYER_STATE_AVAILABLE) {
                mJoinStartButton.setText(R.string.button_join_battle);
            } else if (player.getPlayerState() == GameManagerClient.PLAYER_STATE_READY) {
                mJoinStartButton.setText(R.string.button_start_battle);
            }
        } else {
            mJoinStartButton.setVisibility(View.GONE);
            mSpinner.setVisibility(View.VISIBLE);
        }
    }

    private void onJoinReadyClicked() {
        SpellcastGameModel model = SpellcastApplication.getInstance().getGameModel();
        int playerState = model.getControlledCharacter().getPlayerState();
        if (model.isInitialized()) {
            if (playerState == GameManagerClient.PLAYER_STATE_AVAILABLE
                    || playerState == GameManagerClient.PLAYER_STATE_PLAYING) {
                model.getControlledCharacter().sendPlayerReadyMessage();
            } else if (playerState == GameManagerClient.PLAYER_STATE_READY) {
                model.getControlledCharacter().sendPlayerPlayingMessage();
            }
        }
        updateView();
    }

    private int getAvatarResourceId() {
        SharedPreferences preferences =
                PreferenceManager.getDefaultSharedPreferences(getActivity());
        TypedArray imageValuesArray = getActivity().getResources().obtainTypedArray(
                R.array.spellcast_character_images);
        // This index starts at one so we have to do -1.
        int index = preferences.getInt((String) getText(R.string.pref_avatar_key), 1) - 1;
        return imageValuesArray.getResourceId(index, 0);
    }
}
