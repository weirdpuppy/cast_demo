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
goog.provide('cast.games.common.receiver.PhaserSpritePool');

goog.require('goog.array');



/**
 * A object pool used for Phaser.Sprite objects. Used instead of
 * {@code goog.structs.Pool} and {@code goog.structs.SimplePool} because of
 * simplicity. Objects pooled here ust extend Phaser.Sprite. The pool will kill
 * them and automatically move them to an alive pool when they are revived.
 * Call #get() to get a new object ready to be revived.
 * @param {string} name The name for this pool.
 * @param {number} size The initial size of the pool.
 * @param {boolean} isFixedSize True if this pool is not allowed to grow.
 * @param {Phaser.Group} container The phaser group where to place the objects,
 *     or null if the objects are to be added manually.
 * @param {boolean} isSharedContainer True if the container is shared with other
 *     objects or pools. False if this pool should own the container, attempt
 *     reuse pre-existing sprite elements from it (assumed to be the correct
 *     type), and destroy it when no longer in use. Ignored if container is
 *     null.
 * @param {!function():!T} factory A function used to construct new objects
 *     extend Phaser.Sprite.
 * @constructor
 * @template T
 */
cast.games.common.receiver.PhaserSpritePool =
    function(name, size, isFixedSize, container, isSharedContainer, factory) {

  /** @private {string} */
  this.name_ = name;

  /** @private {boolean} */
  this.isFixedSize_ = isFixedSize;

  /** @private {Phaser.Group} */
  this.container_ = container;

  /** @private {boolean} */
  this.isSharedContainer_ = isSharedContainer;

  /** @private {function():!T} */
  this.factory_ = factory;

  /** @private {!Array.<!T>} */
  this.alive_ = [];

  /** @private {!Array.<!T>} */
  this.dead_ = [];

  /** @private {!Array.<!T>} */
  this.all_ = [];

  if (container && !isSharedContainer) {
    while (isFixedSize && container.children.length > size) {
      container.children[0].destroy();
      console.log('Number of children in the container is larger than the ' +
          'pool size. Destroying object in pool: ' + this.name_);
    }

    // Add the objects already in the container.
    for (var i = 0; i < container.children.length; i++) {
      this.add_(container.children[i]);
    }
  }

  // Add any new objects needed.
  while (this.all_.length < size) {
    this.add_();
  }
};


/**
 * Gets an object from the pool. If no more objects are available, a new one
 * will be created, unless #fixedSize was set to true, in which case null will
 * be returned.
 * @return {T} An object from the pool.
 */
cast.games.common.receiver.PhaserSpritePool.prototype.get = function() {
  var object = null;
  if (this.dead_.length > 0) {
    object = this.dead_[0];
  } else if (!this.isFixedSize_) {
    object = this.add_();
  }
  return object;
};


/**
 * @return {!Array.<!T>} Alive objects in the pool.
 */
cast.games.common.receiver.PhaserSpritePool.prototype.getAliveObjects =
    function() {
  return this.alive_;
};


/**
 * @return {!Array.<!T>} Dead objects in the pool.
 */
cast.games.common.receiver.PhaserSpritePool.prototype.getDeadObjects =
    function() {
  return this.dead_;
};


/**
 * @return {!Array.<!T>} Dead objects in the pool.
 */
cast.games.common.receiver.PhaserSpritePool.prototype.getAllObjects =
    function() {
  return this.all_;
};


/**
 * Kills all the alive objects in the pool.
 */
cast.games.common.receiver.PhaserSpritePool.prototype.killAll = function() {
  while (this.alive_.length > 0) {
    this.alive_[0].kill();
  }
};


/**
 * Kills all the alive objects in the pool and destroys the container.
 */
cast.games.common.receiver.PhaserSpritePool.prototype.destroy = function() {
  if (this.container_ && !this.isSharedContainer_) {
    // This will destroy all children as well.
    this.container_.destroy();
  } else {
    for (var i = 0; i < this.all_.length; i++) {
      this.all_[i].destroy();
    }
  }
  // Free all references.
  this.all_.length = 0;
  this.dead_.length = 0;
  this.alive_.length = 0;
  this.factory_.length = 0;
};


/**
 * Constructs a new object and adds it to the pool, or, adds a provided object
 * to the pool.
 * @param {T=} opt_object An optional object, if not provided a new one will be
 *     created using the factory function.
 * @return {!T} The created object.
 * @private
 */
cast.games.common.receiver.PhaserSpritePool.prototype.add_ =
    function(opt_object) {
  var object =   /** @type {!Phaser.Sprite} */ (opt_object);
  if (!object) {
    object = this.factory_();
  }
  this.dead_.push(object);
  this.all_.push(object);
  if (this.container_) {
    this.container_.add(object);
  }
  object.kill();
  object.events.onKilled.add(this.onKilled_, this);
  object.events.onRevived.add(this.onRevived_, this);
  return object;
};


/**
 * Event handler for when an entity dies.
 * @param {!T} object The object being killed.
 * @private
 */
cast.games.common.receiver.PhaserSpritePool.prototype.onKilled_ =
    function(object) {
  goog.array.remove(this.alive_, object);
  this.dead_.push(object);
};


/**
 * Event handler for when an entity is revived.
 * @param {!T} object The object being revived.
 * @private
 */
cast.games.common.receiver.PhaserSpritePool.prototype.onRevived_ =
    function(object) {
  goog.array.remove(this.dead_, object);
  this.alive_.push(object);
};

