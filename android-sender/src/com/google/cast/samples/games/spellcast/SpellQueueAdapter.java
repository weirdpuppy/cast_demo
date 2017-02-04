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
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;

/**
 * An adapter for the Spell Queue used in combat.
 */
public class SpellQueueAdapter extends ArrayAdapter<Events.SpellEventData> {
    private LayoutInflater mLayoutInflater;

    public SpellQueueAdapter(Context context, int resource) {
        super(context, resource);
        mLayoutInflater = LayoutInflater.from(context);
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        View view = convertView;
        if (view == null) {
            view = mLayoutInflater.inflate(R.layout.spellcast_combat_spell_queue, parent,
                    false);
        }

        Events.SpellEventData spell = getItem(position);
        int backgroundResourceId = R.drawable.spell_queue_icon_background_good;
        switch (spell.getAccuracy()) {
            case GREAT:
                backgroundResourceId = R.drawable.spell_queue_icon_background_great;
                break;
            case PERFECT:
                backgroundResourceId = R.drawable.spell_queue_icon_background_perfect;
                break;
            default:
        }
        view.setBackgroundResource(backgroundResourceId);

        ImageView imageView = (ImageView) view.findViewById(R.id.spell_icon);
        imageView.setImageResource(spell.getSpell().getIconResourceId());
        return view;
    }
}