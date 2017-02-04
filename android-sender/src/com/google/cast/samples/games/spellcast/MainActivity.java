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

import android.app.AlertDialog;
import android.app.Fragment;
import android.app.FragmentTransaction;
import android.content.DialogInterface;
import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.support.v4.view.MenuItemCompat;
import android.support.v7.app.ActionBarActivity;
import android.support.v7.app.MediaRouteActionProvider;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;

import java.util.Observable;
import java.util.Observer;

/**
 * The main activity.
 */
public class MainActivity extends ActionBarActivity implements
        Observer, EventManager.EventListener {
    private static final String TAG = "MainActivity";

    private static final Events.EventType[] HANDLED_EVENTS = {
            Events.EventType.RECEIVER_BATTLE_START,
            Events.EventType.RECEIVER_WAITING_FOR_PLAYERS,
            Events.EventType.ON_PLAYER_CONNECTION_ERROR,
    };

    private CastConnectionManager mCastConnectionManager;
    private CastConnectionFragment mCastConnectionFragment;
    private LobbyFragment mLobbyFragment;
    private CombatFragment mCombatFragment;

    private Fragment mNextFragment;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main_activity);

        mCastConnectionManager = SpellcastApplication.getInstance().getCastConnectionManager();
        mCastConnectionFragment = new CastConnectionFragment();
        mLobbyFragment = new LobbyFragment();
        mCombatFragment = new CombatFragment();
    }

    /**
     * Called when the options menu is first created.
     */
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        super.onCreateOptionsMenu(menu);
        getMenuInflater().inflate(R.menu.main, menu);
        MenuItem mediaRouteMenuItem = menu.findItem(R.id.media_route_menu_item);
        MediaRouteActionProvider mediaRouteActionProvider =
                (MediaRouteActionProvider) MenuItemCompat.getActionProvider(mediaRouteMenuItem);
        if (mediaRouteActionProvider == null) {
            Log.w(TAG, "mediaRouteActionProvider is null!");
            return false;
        }
        CastConnectionManager manager =
                SpellcastApplication.getInstance().getCastConnectionManager();
        mediaRouteActionProvider.setRouteSelector(manager.getMediaRouteSelector());
        return true;
    }

    @Override
    protected void onResume() {
        super.onResume();
        mCastConnectionManager.addObserver(this);
        mCastConnectionManager.startScan();
        EventManager eventManager = SpellcastApplication.getInstance().getEventManager();
        eventManager.addEventListener(HANDLED_EVENTS, this);
        if (mNextFragment != null) {
            showFragment(mNextFragment);
        } else {
            update(null, null);
        }
    }

    @Override
    protected void onPause() {
        EventManager eventManager = SpellcastApplication.getInstance().getEventManager();
        eventManager.removeEventListener(HANDLED_EVENTS, this);
        mCastConnectionManager.stopScan();
        mCastConnectionManager.deleteObserver(this);
        super.onPause();
    }

    public void showFragment(Fragment fragment) {
        Fragment currentFragment = getFragmentManager().findFragmentById(R.id.fragment_container);
        mNextFragment = null;
        if (currentFragment == fragment) {
            return;
        }
        if (isChangingConfigurations() || isFinishing() || isDestroyed()) {
            mNextFragment = fragment;
        } else {
            // We need to request the orientation change before we perform the fragment transition,
            // otherwise the fragment would start in the wrong orientation.
            if (fragment == mCombatFragment) {
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
            } else {
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR);
            }
            getFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, fragment)
                    .setTransition(FragmentTransaction.TRANSIT_FRAGMENT_OPEN)
                    .commit();
        }
    }

    @Override
    public void handleEvent(Events.EventType eventType, EventManager.EventData eventData) {
        if (mCastConnectionManager.isConnectedToReceiver()) {
            switch (eventType) {
                case RECEIVER_WAITING_FOR_PLAYERS:
                    showFragment(mLobbyFragment);
                    break;
                case RECEIVER_BATTLE_START:
                    showFragment(mCombatFragment);
                    break;
                default:
                    Log.w(TAG, "Unhandled event type: " + eventType);
            }
        }
        if (eventType == Events.EventType.ON_PLAYER_CONNECTION_ERROR){
            Events.OnPlayerConnectionErrorData playerConnectionErrorData =
                    (Events.OnPlayerConnectionErrorData) eventData;
            showErrorDialog(playerConnectionErrorData.getErrorMessage());
        }
    }

    /**
     * Called when the cast connection changes.
     */
    @Override
    public void update(Observable object, Object data) {
        SpellcastGameModel model = SpellcastApplication.getInstance().getGameModel();
        if (!mCastConnectionManager.isConnectedToReceiver() || !model.isInitialized()) {
            showFragment(mCastConnectionFragment);
        } else {
            int playerState = model.getControlledCharacter().getPlayerState();
            if (playerState == GameManagerClient.PLAYER_STATE_PLAYING && model.isInCombat()) {
                showFragment(mCombatFragment);
            } else {
                showFragment(mLobbyFragment);
            }
        }
    }

    @Override
    public void onBackPressed() {
        // Do not pop any fragments, just act like the home button.
        moveTaskToBack(true);
    }

    /**
     * Shows an error dialog.
     *
     * @param errorMessage The message to show in the dialog.
     */
    private void showErrorDialog(final String errorMessage){
        if (!isDestroyed()) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    // Show a error dialog along with error messages.
                    AlertDialog alertDialog =
                            new AlertDialog.Builder(MainActivity.this).create();
                    alertDialog.setTitle(getString(R.string.game_connection_error_message));
                    alertDialog.setMessage(errorMessage);
                    alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL,
                            getString(R.string.game_dialog_ok_button_text),
                            new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog,
                                                    int which) {
                                    dialog.dismiss();
                                }
                            });
                    alertDialog.show();
                }
            });
        }
    }
}
