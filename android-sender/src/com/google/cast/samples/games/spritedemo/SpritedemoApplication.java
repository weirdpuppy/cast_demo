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

import android.app.Application;

/**
 * The application class.
 */
public class SpritedemoApplication extends Application
        implements CastConnectionManager.CastAppIdProvider {

    private static SpritedemoApplication sInstance;

    private CastConnectionManager mCastConnectionManager;

    @Override
    public void onCreate() {
        super.onCreate();
        sInstance = this;
        mCastConnectionManager = new CastConnectionManager(this, this);
    }

    public static SpritedemoApplication getInstance() {
        return sInstance;
    }

    public CastConnectionManager getCastConnectionManager() {
        return mCastConnectionManager;
    }

    @Override
    public String getCastAppId() {
        return getResources().getString(R.string.app_id);
    }
}
