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

import com.google.android.gms.cast.games.GameManagerClient;
import com.google.android.gms.common.api.PendingResult;
import com.google.android.gms.common.api.ResultCallback;

import android.app.AlertDialog;
import android.app.Fragment;
import android.app.FragmentTransaction;
import android.content.DialogInterface;
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
public class MainActivity extends ActionBarActivity  implements Observer {
    private static final String TAG = "MainActivity";

    private CastConnectionFragment mCastConnectionFragment;
    private SpriteDemoFragment mSpriteDemoFragment;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main_activity);

        if (mCastConnectionFragment == null) {
            mCastConnectionFragment = new CastConnectionFragment();
        }
        if (mSpriteDemoFragment == null) {
            mSpriteDemoFragment = new SpriteDemoFragment();
        }

        updateFragments();
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
                SpritedemoApplication.getInstance().getCastConnectionManager();
        mediaRouteActionProvider.setRouteSelector(manager.getMediaRouteSelector());
        return true;
    }

    @Override
    protected void onResume() {
        super.onResume();
        CastConnectionManager manager =
                SpritedemoApplication.getInstance().getCastConnectionManager();
        manager.startScan();
        manager.addObserver(this);
        updateFragments();
    }

    @Override
    protected void onPause() {
        CastConnectionManager manager =
                SpritedemoApplication.getInstance().getCastConnectionManager();
        manager.stopScan();
        manager.deleteObserver(this);
        super.onPause();
    }

    /**
     * Called when the cast connection changes.
     */
    @Override
    public void update(Observable object, Object data) {
        CastConnectionManager manager =
                SpritedemoApplication.getInstance().getCastConnectionManager();
        GameManagerClient gameManagerClient = manager.getGameManagerClient();
        if (manager.isConnectedToReceiver()
            && gameManagerClient.getCurrentState().getConnectedControllablePlayers().size() == 0) {
            PendingResult<GameManagerClient.GameManagerResult> result =
                    gameManagerClient.sendPlayerAvailableRequest(null);
            result.setResultCallback(new ResultCallback<GameManagerClient.GameManagerResult>() {
                @Override
                public void onResult(final GameManagerClient.GameManagerResult gameManagerResult) {
                    if (!gameManagerResult.getStatus().isSuccess()) {
                        SpritedemoApplication.getInstance().getCastConnectionManager().
                                disconnectFromReceiver(false);
                        showErrorDialog(gameManagerResult.getStatus().getStatusMessage());
                    }
                    updateFragments();
                }
            });
        }
        updateFragments();
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

    private void updateFragments() {
        if (isChangingConfigurations() || isFinishing() || isDestroyed()) {
            return;
        }

        Fragment fragment;
        CastConnectionManager manager =
                SpritedemoApplication.getInstance().getCastConnectionManager();
        if (manager.isConnectedToReceiver()) {
            fragment = mSpriteDemoFragment;
        } else {
            fragment = mCastConnectionFragment;
        }
        getFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, fragment)
                .setTransition(FragmentTransaction.TRANSIT_FRAGMENT_OPEN)
                .commitAllowingStateLoss();
    }
}
