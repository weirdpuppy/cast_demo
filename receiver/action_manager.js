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
goog.provide('cast.games.spellcast.ActionManager');

goog.require('cast.games.common.receiver.ObjectPool');
goog.require('cast.games.spellcast.actions.CountdownAction');
goog.require('cast.games.spellcast.actions.EnemyAttackSpell');
goog.require('cast.games.spellcast.actions.EnemyDeathAction');
goog.require('cast.games.spellcast.actions.FullScreenDisplayAction');
goog.require('cast.games.spellcast.actions.PartyDeathAction');
goog.require('cast.games.spellcast.actions.PlayerAttackSpell');
goog.require('cast.games.spellcast.actions.PlayerHealSpell');
goog.require('cast.games.spellcast.actions.PlayerShieldSpell');



/**
 * Used to execute a sequence of {@link cast.games.spellcast.Action}
 * objects such as a list of game actions (attacks, spells, etc).
 * @param {!cast.games.spellcast.SpellcastGame} game
 * @constructor
 */
cast.games.spellcast.ActionManager = function(game) {
  /** @private {!cast.games.spellcast.SpellcastGame} */
  this.game_ = game;

  /** @private {Array.<!cast.games.spellcast.Action>} */
  this.actions_ = null;

  /**
   * True if actions are currently being executed.
   * @private {boolean}
   */
  this.executing_ = false;

  /**
   * The action we are currently executing.
   * @private {cast.games.spellcast.Action}
   */
  this.currentAction_ = null;

  /**
   * Time we started executing the current action.
   * @private {number}
   */
  this.currentActionStartTime_ = -1;

  /** @private {boolean} */
  this.isPaused_ = false;

  /** @private {number} Timestamp when game was paused. */
  this.pausedTime_ = 0;

  /**
   * @private {!cast.games.common.receiver.ObjectPool.<
   *     !cast.games.spellcast.actions.PlayerAttackSpell>}
   */
  this.playerAttackSpellPool_ = new cast.games.common.receiver.ObjectPool(
      'cast.games.spellcast.actions.PlayerAttackSpell', 100,
      function() {
        return new cast.games.spellcast.actions.PlayerAttackSpell();
      });

  /**
   * @private {!cast.games.common.receiver.ObjectPool.<
   *     !cast.games.spellcast.actions.PlayerHealSpell>}
   */
  this.playerHealSpellPool_ = new cast.games.common.receiver.ObjectPool(
      'cast.games.spellcast.actions.PlayerHealSpell', 100,
      function() {
        return new cast.games.spellcast.actions.PlayerHealSpell();
      });

  /**
   * @private {!cast.games.common.receiver.ObjectPool.<
   *     !cast.games.spellcast.actions.PlayerShieldSpell>}
   */
  this.playerShieldSpellPool_ = new cast.games.common.receiver.ObjectPool(
      'cast.games.spellcast.actions.PlayerShieldSpell', 100,
      function() {
        return new cast.games.spellcast.actions.PlayerShieldSpell();
      });

  /**
   * @private {!cast.games.common.receiver.ObjectPool.<
   *     !cast.games.spellcast.actions.CountdownAction>}
   */
  this.countdownPool_ = new cast.games.common.receiver.ObjectPool(
      'cast.games.spellcast.actions.CountdownAction', 10,
      function() {
        return new cast.games.spellcast.actions.CountdownAction();
      });

  /**
   * @private {!cast.games.common.receiver.ObjectPool.<
   *     !cast.games.spellcast.actions.EnemyAttackSpell>}
   */
  this.enemyAttackSpellPool_ = new cast.games.common.receiver.ObjectPool(
      'cast.games.spellcast.actions.EnemyAttackSpell', 10,
      function() {
        return new cast.games.spellcast.actions.EnemyAttackSpell();
      });

  /**
   * @private {!cast.games.common.receiver.ObjectPool.<
   *     !cast.games.spellcast.actions.EnemyDeathAction>}
   */
  this.enemyDeathPool_ = new cast.games.common.receiver.ObjectPool(
      'cast.games.spellcast.actions.EnemyDeathAction', 10,
      function() {
        return new cast.games.spellcast.actions.EnemyDeathAction();
      });

  /**
   * @private {!cast.games.common.receiver.ObjectPool.<
   *     !cast.games.spellcast.actions.PartyDeathAction>}
   */
  this.partyDeathPool_ = new cast.games.common.receiver.ObjectPool(
      'cast.games.spellcast.actions.PartyDeathAction', 10,
      function() {
        return new cast.games.spellcast.actions.PartyDeathAction();
      });

  /**
   * @private {!cast.games.common.receiver.ObjectPool.<
   *     !Array.<!cast.games.spellcast.Action>>}
   */
  this.actionListPool_ = new cast.games.common.receiver.ObjectPool(
      'Array.<cast.games.spellcast.Action>', 10,
      function() {
        return [];
      });

  /**
   * @private {!cast.games.common.receiver.ObjectPool.<
   *     !cast.games.spellcast.actions.FullScreenDisplayAction>}
   */
  this.fullScreenDisplayPool_ = new cast.games.common.receiver.ObjectPool(
      'cast.games.spellcast.actions.FullScreenDisplayAction', 10,
      function() {
        return new cast.games.spellcast.actions.FullScreenDisplayAction();
      });
};


/**
 * Starts executing actions. There cannot be any actions left to execute from
 * by a previous call to #startExecuting.
 * @param {!Array.<!cast.games.spellcast.Action>} actions The list of
 *     action objects to execute obtained from #getActionList.
 */
cast.games.spellcast.ActionManager.prototype.startExecuting =
    function(actions) {
  if (this.actions_ && this.actions_.length) {
    console.log('ActionManager was started before reset() was called.');
    this.releaseActionList(this.actions_);
  }
  this.actions_ = actions;
  this.executing_ = true;
};


/**
 * Returns wheather there are actions left to execute (i.e. #reset was called).
 * @return {boolean}
 */
cast.games.spellcast.ActionManager.prototype.isDone = function() {
  return !this.actions_ || (!this.actions_.length && !this.executing_);
};


/**
 * Releases all actions passed in from #startExecuting using #releaseActionList,
 * without executing them.  Must be called before #startExecuting is called
 * again.
 */
cast.games.spellcast.ActionManager.prototype.reset = function() {
  if (this.actions_) {
    this.releaseActionList(this.actions_);
  }
  this.actions_ = null;
  this.executing_ = false;
};


/** Updates actions, if applicable. Should be called in game animation loop. */
cast.games.spellcast.ActionManager.prototype.update = function() {
  if (!this.executing_ || !this.actions_ || this.isPaused_) {
    return;
  }

  var currentTime = Date.now();
  if (this.currentAction_) {
    var elapsedTime = currentTime - this.currentActionStartTime_;

    // If we have an action, update and check if it's done.
    this.currentAction_.onUpdate(elapsedTime);
    if (this.currentAction_.getShouldFinishOnNextUpdate() ||
        elapsedTime > this.currentAction_.getExecutionTime()) {
      this.currentAction_.onFinish();
      this.releaseAction_(this.currentAction_);
      this.currentAction_ = null;
    }
  } else {
    // Otherwise, try to get one.
    if (this.actions_.length > 0) {
      this.currentAction_ = this.actions_.shift();
      this.currentAction_.onStart();
      this.currentActionStartTime_ = currentTime;
    } else {
      // We are done with all actions.
      this.reset();
    }
  }
};


/** Pauses actions. #update will not do anything until #resume is called. */
cast.games.spellcast.ActionManager.prototype.pause = function() {
  this.isPaused_ = true;
  this.pausedTime_ = Date.now();
};


/** Resumes actions that were paused by calling #pause. */
cast.games.spellcast.ActionManager.prototype.resume = function() {
  this.isPaused_ = false;

  // Shift the time used to check elapsed time of actions by the pause duration
  // to make sure action timing ignores the paused time.
  this.currentActionStartTime_ += Date.now() - this.pausedTime_;
};


/**
 * Creates an empty array that actions can be added to.
 * @return {!Array.<!cast.games.spellcast.Action>}
 */
cast.games.spellcast.ActionManager.prototype.getActionList = function() {
  var actionList = this.actionListPool_.getObject();
  actionList.length = 0;
  return actionList;
};


/**
 * Releases a list of actions created by #getEmptyActionList.
 * @param {!Array.<!cast.games.spellcast.Action>} actions
 * @param {boolean=} opt_releaseListOnly If true, only release the list and
 *     not the contents.
 */
cast.games.spellcast.ActionManager.prototype.releaseActionList =
    function(actions, opt_releaseListOnly) {
  // Release the actions in the list.
  for (var i = 0; i < actions.length && !opt_releaseListOnly; i++) {
    var action = actions[i];
    this.releaseAction_(action);
  }

  // Release the list itself.
  this.actionListPool_.releaseObject(actions);

  // Reset the array.
  actions.length = 0;
};


/**
 * Releases an action back to its pool.
 * @param {!cast.games.spellcast.Action} action
 * @private
 */
cast.games.spellcast.ActionManager.prototype.releaseAction_ = function(action) {
  if (action instanceof cast.games.spellcast.actions.PlayerAttackSpell) {
    this.playerAttackSpellPool_.releaseObject(action);
  } else if (action instanceof cast.games.spellcast.actions.PlayerHealSpell) {
    this.playerHealSpellPool_.releaseObject(action);
  } else if (action instanceof
      cast.games.spellcast.actions.PlayerShieldSpell) {
    this.playerShieldSpellPool_.releaseObject(action);
  } else if (action instanceof
      cast.games.spellcast.actions.CountdownAction) {
    this.countdownPool_.releaseObject(action);
  } else if (action instanceof
      cast.games.spellcast.actions.EnemyAttackSpell) {
    this.enemyAttackSpellPool_.releaseObject(action);
  } else if (action instanceof
      cast.games.spellcast.actions.EnemyDeathAction) {
    this.enemyDeathPool_.releaseObject(action);
  } else if (action instanceof
      cast.games.spellcast.actions.PartyDeathAction) {
    this.partyDeathPool_.releaseObject(action);
  } else if (action instanceof
      cast.games.spellcast.actions.FullScreenDisplayAction) {
    this.fullScreenDisplayPool_.releaseObject(action);
  } else {
    throw Error('Unsupported player action found in action list : ' + action);
  }
};


/**
 * Creates a player basic attack action.
 * @param {!cast.games.spellcast.gameobjects.Player} caster The player who
 *     casted this.
 * @param {!cast.games.spellcast.gameobjects.Enemy} enemy The enemy of this
 *     encounter.
 * @param {!cast.games.spellcast.messages.Spell} spell
 * @return {!cast.games.spellcast.Action}
 */
cast.games.spellcast.ActionManager.prototype.getPlayerBasicAttackAction =
    function(caster, enemy, spell) {
  var element = spell.spellElement;
  var accuracy = spell.spellAccuracy;
  var action = this.playerAttackSpellPool_.getObject();
  action.init(this.game_, caster, enemy, element, accuracy);
  return action;
};


/**
 * Creates a player heal action.
 * @param {!cast.games.spellcast.gameobjects.Player} caster The player who
 *     casted this.
 * @param {!cast.games.spellcast.messages.Spell} spell
 * @return {!cast.games.spellcast.Action}
 */
cast.games.spellcast.ActionManager.prototype.getPlayerHealAction =
    function(caster, spell) {
  var accuracy = spell.spellAccuracy;
  var action = this.playerHealSpellPool_.getObject();
  action.init(this.game_, caster, accuracy);
  return action;
};


/**
 * Creates a player shield action.
 * @param {!cast.games.spellcast.gameobjects.Player} caster The player who
 *     who casted this.
 * @param {!cast.games.spellcast.messages.Spell} spell
 * @return {!cast.games.spellcast.Action}
 */
cast.games.spellcast.ActionManager.prototype.getPlayerShieldAction =
    function(caster, spell) {
  var accuracy = spell.spellAccuracy;
  var action = this.playerShieldSpellPool_.getObject();
  action.init(this.game_, caster, accuracy);
  return action;
};


/**
 * Creates a countdown action.
 * @return {!cast.games.spellcast.Action}
 */
cast.games.spellcast.ActionManager.prototype.getCountdownAction = function() {
  var action = this.countdownPool_.getObject();
  action.init(this.game_);
  return action;
};


/**
 * Creates an enemy attack spell action.
 * @param {!cast.games.spellcast.gameobjects.Enemy} caster
 * @param {!cast.games.spellcast.gameobjects.Player} target
 * @param {!cast.games.spellcast.messages.SpellElement} element
 * @param {number} strength One of the constants defined in
 *     {@link cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH}
 * @return {!cast.games.spellcast.Action}
 */
cast.games.spellcast.ActionManager.prototype.getEnemyAttackAction =
    function(caster, target, element, strength) {
  var action = this.enemyAttackSpellPool_.getObject();
  action.init(this.game_, caster, target, element, strength);
  return action;
};


/**
 * Creates an enemy death action.
 * @param {!cast.games.spellcast.gameobjects.Enemy} enemy
 * @return {!cast.games.spellcast.Action}
 */
cast.games.spellcast.ActionManager.prototype.getEnemyDeathAction =
    function(enemy) {
  var action = this.enemyDeathPool_.getObject();
  action.init(enemy);
  return action;
};


/**
 * Creates a party death action.
 * @return {!cast.games.spellcast.Action}
 */
cast.games.spellcast.ActionManager.prototype.getPartyDeathAction = function() {
  var action = this.partyDeathPool_.getObject();
  action.init(this.game_);
  return action;
};


/**
 * Creates a full screen display action.
 * @param {!cast.games.spellcast.gameobjects.FullScreenDisplay}
 *     fullScreenDisplay
 * @param {number} displayDuration
 * @return {!cast.games.spellcast.Action}
 */
cast.games.spellcast.ActionManager.prototype.getFullScreenDisplayAction =
    function(fullScreenDisplay, displayDuration) {
  var action = this.fullScreenDisplayPool_.getObject();
  action.init(this.game_, fullScreenDisplay, displayDuration);
  return action;
};
