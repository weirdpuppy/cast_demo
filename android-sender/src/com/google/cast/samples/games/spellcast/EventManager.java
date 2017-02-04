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

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.Iterator;

/**
 * An class for registering listeners for events and also handles calling those listeners when an
 * event is triggered. Note: This class is meant to be used as a static manager, so all the
 * listeners are weak referenced -- the user must keep a reference to their listener and manage its
 * removal from the manager.
 */
public class EventManager {

    /**
     * Interface class that event listeners need to implement
     */
    public interface EventListener {
        void handleEvent(Events.EventType eventType, EventData eventData);
    }

    /**
     * Event data that is passed along with each event trigger.
     */
    public interface EventData {
    }

    private final EnumMap<Events.EventType, ArrayList<WeakReference<EventListener>>>
            mMessageListeners;

    public EventManager() {
        mMessageListeners = new EnumMap<>(Events.EventType.class);
    }

    public void addEventListener(Events.EventType eventType, EventListener eventListener) {
        ArrayList<WeakReference<EventListener>> listenerList = mMessageListeners.get(eventType);
        if (listenerList == null) {
            listenerList = new ArrayList<>();
            mMessageListeners.put(eventType, listenerList);
        }
        listenerList.add(new WeakReference<>(eventListener));
    }

    public void addEventListener(Events.EventType[] eventTypes, EventListener eventListener) {
        for (Events.EventType eventType : eventTypes) {
            addEventListener(eventType, eventListener);
        }
    }

    public void removeEventListener(Events.EventType eventType, EventListener eventListener) {
        ArrayList<WeakReference<EventListener>> listenerList = mMessageListeners.get(eventType);
        if (listenerList == null) {
            return;
        }

        Iterator<WeakReference<EventListener>> iterator = listenerList.iterator();
        while (iterator.hasNext()) {
            WeakReference<EventListener> weakReferenceListener = iterator.next();
            EventListener listener = weakReferenceListener.get();
            if (listener == null) {
                iterator.remove();
            } else if (listener.equals(eventListener)) {
                iterator.remove();
                return;
            }
        }
    }

    public void removeEventListener(Events.EventType[] eventTypes, EventListener eventListener) {
        for (Events.EventType eventType : eventTypes) {
            removeEventListener(eventType, eventListener);
        }
    }

    public void triggerEvent(Events.EventType eventType) {
        triggerEvent(eventType, null);
    }

    public void triggerEvent(Events.EventType eventType, EventData eventData) {
        ArrayList<WeakReference<EventListener>> listenerList = mMessageListeners.get(eventType);
        if (listenerList == null) {
            return;
        }
        ArrayList<EventListener> listenersToTrigger = new ArrayList<>();
        Iterator<WeakReference<EventListener>> iterator = listenerList.iterator();
        while (iterator.hasNext()) {
            WeakReference<EventListener> weakReferenceListener = iterator.next();
            EventListener listener = weakReferenceListener.get();
            if (listener == null) {
                iterator.remove();
            } else {
                listenersToTrigger.add(listener);
            }
        }

        for (EventListener listener : listenersToTrigger) {
            listener.handleEvent(eventType, eventData);
        }
    }
}
