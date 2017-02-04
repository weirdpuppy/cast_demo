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

import android.app.Application;

/**
 * The application class.
 */
public class StarcastApplication extends Application
        implements CastConnectionManager.CastAppIdProvider {

    private static StarcastApplication sInstance;

    private CastConnectionManager mCastConnectionManager;
    private SendMessageHandler mSendMessageHandler;

    @Override
    public void onCreate() {
        super.onCreate();
        sInstance = this;
        mCastConnectionManager = new CastConnectionManager(this, this);
        mSendMessageHandler = new SendMessageHandler(mCastConnectionManager);
    }

    public static StarcastApplication getInstance() {
        return sInstance;
    }

    public CastConnectionManager getCastConnectionManager() {
        return mCastConnectionManager;
    }

    public SendMessageHandler getSendMessageHandler() {
        return mSendMessageHandler;
    }

    @Override
    public String getCastAppId() {
        return getResources().getString(R.string.app_id);
    }
}
