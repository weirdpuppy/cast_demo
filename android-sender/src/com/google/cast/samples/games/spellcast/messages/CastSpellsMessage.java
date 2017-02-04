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
package com.google.cast.samples.games.spellcast.messages;

import com.google.cast.samples.games.spellcast.Events.SpellEventData;

import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Class that converts list of spells into a JSON string message sent to the receiver.
 */
public class CastSpellsMessage extends SpellCastMessage {
    private static final String KEY_SPELLS = "spells";
    private static final String TAG = "CastSpellsMessage";

    private ArrayList<SpellEventData> mSpells = new ArrayList<>();


    public void addSpell(SpellEventData spellEventData) {
        mSpells.add(spellEventData);
    }

    public void clear() {
        mSpells.clear();
    }

    public List<SpellEventData> getSpellList() {
        return mSpells;
    }

    @Override
    public JSONObject toJSON() {
        JSONObject serialized = new JSONObject();
        JSONArray array = new JSONArray();
        for (SpellEventData spell : mSpells) {
            array.put(spell.toJSON());
        }
        try {
            serialized.put(KEY_SPELLS, array);
        } catch (JSONException e) {
            Log.w(TAG, "JSONException converting spell list to JSON.", e);
        }

        return serialized;
    }
}
