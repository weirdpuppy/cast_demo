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

import com.google.cast.samples.games.spellcast.spells.Spell;

import android.app.Fragment;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.TextView;

/**
 * Fragment used to display the combat screen for spellcast, where the player gets to draw spells.
 */
public class CombatFragment extends Fragment implements EventManager.EventListener {

    private class CastSpellTimer extends CountDownTimer {
        private final float mTotalTimeMillis;

        public CastSpellTimer(int milliseconds) {
            super(milliseconds, TIMER_UPDATE_FREQUENCY_MILLIS);
            mTotalTimeMillis = milliseconds;
        }

        @Override
        public void onTick(long millisUntilFinished) {
            float completionFactor = millisUntilFinished / mTotalTimeMillis;
            mCountdownClock.updateArc(completionFactor);
        }

        @Override
        public void onFinish() {
            SpellcastApplication app = SpellcastApplication.getInstance();
            EventManager eventManager = app.getEventManager();
            eventManager.triggerEvent(Events.EventType.END_PLAYER_TURN);
        }
    }

    private static final String TAG = "CombatFragment";

    private static final Events.EventType[] HANDLED_EVENTS = {
            Events.EventType.START_PLAYER_TURN,
            Events.EventType.END_PLAYER_TURN,
            Events.EventType.RECEIVER_GAME_LOST,
            Events.EventType.RECEIVER_GAME_WON,
            Events.EventType.SPELL_CAST_SUCCESSFUL,
            Events.EventType.SPELL_CAST_FAIL,
            Events.EventType.SPELLS_SENT,
    };

    private static final long TIMER_UPDATE_FREQUENCY_MILLIS = 50;

    private SpellCircleView mSpellButtonView;
    private TouchControllerView mSpellDrawingView;
    private SpellQueueAdapter mSpellQueueAdapter;
    private CountdownClockView mCountdownClock;
    private ImageView mSuccessFailImage;
    private Animation mSuccessFailAnimation;
    private TextView mMainText;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
            Bundle savedInstanceState) {

        ActionBarActivity activity = (ActionBarActivity) getActivity();
        activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        activity.getSupportActionBar().hide();

        EventManager eventManager = SpellcastApplication.getInstance().getEventManager();
        eventManager.addEventListener(HANDLED_EVENTS, this);

        SpellcastApplication app = SpellcastApplication.getInstance();
        View view = inflater.inflate(R.layout.combat_fragment, container, false);
        mSpellButtonView = (SpellCircleView) view.findViewById(R.id.spell_button_view);
        mSpellButtonView.attachSpells(app.getGameModel().getControlledCharacter(),
                new SpellCircleView.OnSpellSelectListener() {
                    @Override
                    public void onSpellSelected(Spell spell) {
                        SpellcastApplication app = SpellcastApplication.getInstance();
                        PlayableCharacter user = app.getGameModel().getControlledCharacter();
                        if (spell.canCast(user)) {
                            mSpellDrawingView.setSpell(spell, user.getDifficultySetting());
                        }
                    }
                });

        mSpellDrawingView = (TouchControllerView) view.findViewById(R.id.touch_controller);

        mSuccessFailImage = (ImageView) view.findViewById(R.id.success_fail_image);
        mSuccessFailAnimation = AnimationUtils.loadAnimation(getActivity(),
                R.anim.spellcast_spell_success_animation);
        mSuccessFailAnimation.setAnimationListener(new Animation.AnimationListener() {
            @Override
            public void onAnimationStart(Animation animation) {
            }

            @Override
            public void onAnimationEnd(Animation animation) {
                mSuccessFailImage.setVisibility(View.INVISIBLE);
            }

            @Override
            public void onAnimationRepeat(Animation animation) {
            }

        });
        mSpellQueueAdapter = new SpellQueueAdapter(view.getContext(),
                R.layout.spellcast_combat_spell_queue);

        mMainText = (TextView) view.findViewById(R.id.main_text);
        mMainText.setVisibility(View.GONE);

        mSuccessFailImage.setVisibility(View.INVISIBLE);
        mCountdownClock = (CountdownClockView) view.findViewById(R.id.countdown_stroke);
        mCountdownClock.setVisibility(View.GONE);
        mSpellButtonView.setEnabled(false);
        return view;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();

        ActionBarActivity activity = (ActionBarActivity) getActivity();
        activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        activity.getSupportActionBar().show();

        EventManager eventManager = SpellcastApplication.getInstance().getEventManager();
        eventManager.removeEventListener(HANDLED_EVENTS, this);
    }

    @Override
    public void handleEvent(Events.EventType eventType, EventManager.EventData eventData) {
        SpellcastApplication app = SpellcastApplication.getInstance();
        switch (eventType) {
            case START_PLAYER_TURN:
                startPlayerTurn((Events.StartTurnData) eventData);
                break;
            case END_PLAYER_TURN:
                endPlayerTurn();
                break;
            case SPELLS_SENT:
                onSpellsSent();
                break;
            case SPELL_CAST_FAIL:
                onSpellCastFail();
                break;
            case SPELL_CAST_SUCCESSFUL:
                onSpellCastSuccessful((Events.SpellEventData) eventData);
                break;
            case RECEIVER_GAME_LOST:
                showGameOverScreen((String) getText(R.string.defeat));
                break;
            case RECEIVER_GAME_WON:
                showGameOverScreen((String) getText(R.string.victory));
                break;
            default:
                Log.w(TAG, "Unhandled event Type " + eventType);
        }
    }

    private void startPlayerTurn(Events.StartTurnData turnData) {
        SpellcastApplication app = SpellcastApplication.getInstance();
        SpellcastGameModel model = app.getGameModel();
        mMainText.setVisibility(View.GONE);
        mCountdownClock.setVisibility(View.VISIBLE);
        mSpellButtonView.setEnabled(true);
        model.setTurnData(turnData);
        CastSpellTimer timer = new CastSpellTimer(turnData.getTurnMilliseconds());
        timer.start();
    }

    private void endPlayerTurn() {
        SpellcastApplication app = SpellcastApplication.getInstance();
        SpellcastGameModel model = app.getGameModel();
        mMainText.setVisibility(View.VISIBLE);
        mMainText.setText(getText(R.string.resolving_battle));
        mSpellButtonView.setEnabled(false);
        mSpellDrawingView.analyzeSpellOnEndTurn();
        mSpellDrawingView.setSpell(null, null);
        mCountdownClock.updateArc(0);
        mCountdownClock.setVisibility(View.GONE);
        model.getControlledCharacter().sendSpells();
    }

    private void onSpellsSent() {
        mSpellQueueAdapter.clear();
        mSpellQueueAdapter.notifyDataSetChanged();
        mSpellButtonView.notifyDataSetChanged();
    }

    private void onSpellCastFail() {
        mSuccessFailImage.setImageResource(R.drawable.fail);
        mSuccessFailImage.setBackgroundResource(0);
        mSuccessFailImage.clearAnimation();
        mSuccessFailImage.startAnimation(mSuccessFailAnimation);
        mSuccessFailImage.setVisibility(View.VISIBLE);
    }

    private void onSpellCastSuccessful(Events.SpellEventData spellEventData) {
        SpellcastApplication app = SpellcastApplication.getInstance();
        SpellcastGameModel model = app.getGameModel();
        Spell spell = spellEventData.getSpell();
        if (!spell.cast(model.getControlledCharacter())) {
            return;
        }
        model.getControlledCharacter().enqueueSpell(spellEventData);

        mSpellQueueAdapter.add(spellEventData);
        mSpellQueueAdapter.notifyDataSetChanged();
        mSpellButtonView.notifyDataSetChanged();
        mSuccessFailImage.setImageResource(R.drawable.success_good);
        int backgroundResouceId = R.drawable.spell_queue_icon_background_good;
        switch (spellEventData.getAccuracy()) {
            case GREAT:
                backgroundResouceId = R.drawable.spell_queue_icon_background_great;
                break;
            case PERFECT:
                backgroundResouceId = R.drawable.spell_queue_icon_background_perfect;
                break;
            default:
        }
        mSuccessFailImage.setBackgroundResource(backgroundResouceId);
        mSuccessFailImage.clearAnimation();
        mSuccessFailImage.startAnimation(mSuccessFailAnimation);
        mSuccessFailImage.setVisibility(View.VISIBLE);
    }

    private void showGameOverScreen(String message) {
        mMainText.setVisibility(View.VISIBLE);
        mMainText.setText(message);
        mSpellButtonView.setEnabled(false);
        mSpellDrawingView.setSpell(null, null);
        mCountdownClock.updateArc(0);
        mCountdownClock.setVisibility(View.GONE);
    }
}
