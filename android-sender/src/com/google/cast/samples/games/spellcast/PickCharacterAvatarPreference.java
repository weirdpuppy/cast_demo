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

import android.content.Context;
import android.content.res.TypedArray;
import android.preference.Preference;
import android.util.AttributeSet;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup.LayoutParams;
import android.widget.Button;
import android.widget.ImageSwitcher;
import android.widget.ImageView;
import android.widget.ViewSwitcher.ViewFactory;

/**
 * Custom class to allow players to pick a character image.
 */
public class PickCharacterAvatarPreference extends Preference {

    public static final int DEFAULT_VALUE = 1;
    private Integer mTunedDefault;
    private int mCurrentIndex;
    private int mInitialValue;

    private ImageSwitcher mImageSwitcher;
    private Button mForwardButton;
    private Button mBackwardButton;
    private int[] mCharacterImages;

    public PickCharacterAvatarPreference(Context context, AttributeSet attrs) {
        super(context, attrs);

        TypedArray images = context.getResources().obtainTypedArray(
                R.array.spellcast_character_images);
        mCharacterImages = new int[images.length()];
        for (int i = 0; i < mCharacterImages.length; ++i) {
            mCharacterImages[i] = images.getResourceId(i, 0);
        }
        images.recycle();
        setLayoutResource(R.layout.spellcast_character_avatar_preference);
    }

    @Override
    protected void onSetInitialValue(boolean restorePersistedValue, Object defaultValueObject) {
        Integer defaultValue = (Integer) defaultValueObject;
        if (restorePersistedValue) {
            // Restore existing state
            int defaultInt = mTunedDefault != null ? mTunedDefault : DEFAULT_VALUE;
            mInitialValue = this.getPersistedInt(defaultInt);
        } else {
            // Set default state from the XML attribute
            mInitialValue = defaultValue;
            persistInt(mInitialValue);
        }
        mCurrentIndex = Math.abs((mInitialValue - 1) % mCharacterImages.length);
    }

    @Override
    protected Object onGetDefaultValue(TypedArray a, int index) {
        mTunedDefault = a.getInteger(index, DEFAULT_VALUE);
        return mTunedDefault;
    }

    @Override
    protected void onBindView(View view) {
        super.onBindView(view);
        mImageSwitcher = (ImageSwitcher) view.findViewById(R.id.image_switcher_character_image);
        mImageSwitcher.setFactory(new ViewFactory() {

            @Override
            public View makeView() {
                ImageView imageView = new ImageView(getContext());
                imageView.setScaleType(ImageView.ScaleType.CENTER_CROP);
                imageView.setLayoutParams(new ImageSwitcher.LayoutParams(LayoutParams.MATCH_PARENT,
                        LayoutParams.MATCH_PARENT));
                return imageView;
            }

        });
        mImageSwitcher.setImageResource(mCharacterImages[mCurrentIndex]);

        mForwardButton = (Button) view.findViewById(R.id.button_forward);
        mForwardButton.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                mCurrentIndex = (mCurrentIndex + 1) % mCharacterImages.length;
                mImageSwitcher.setImageResource(mCharacterImages[mCurrentIndex]);
                persistInt(mCurrentIndex + 1);
            }

        });
        mBackwardButton = (Button) view.findViewById(R.id.button_back);
        mBackwardButton.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                mCurrentIndex = (mCurrentIndex + mCharacterImages.length - 1)
                        % mCharacterImages.length;
                mImageSwitcher.setImageResource(mCharacterImages[mCurrentIndex]);
                persistInt(mCurrentIndex + 1);
            }

        });
    }
}
