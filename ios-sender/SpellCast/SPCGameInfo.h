// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#import <Foundation/Foundation.h>

#pragma mark Enums

/**
 * @enum SPCSpellCastDifficultySetting
 * An enum describing game difficulty settings.
 */
typedef NS_ENUM(NSInteger, SPCGameDifficultySetting) {
  SPCGameDifficultySettingUnknown = 0,
  SPCGameDifficultySettingEasy = 1,
  SPCGameDifficultySettingNormal = 2,
  SPCGameDifficultySettingHard = 3
};

/**
 * @enum SPCPlayerBonus
 * An enum describing the current spell bonus for the player.
 */
typedef NS_ENUM(NSInteger, SPCPlayerBonus) {
  SPCPlayerBonusUnknown = 0,
  SPCPlayerBonusNone = 1,
  SPCPlayerBonusAttack = 2,
  SPCPlayerBonusHeal = 3,
  SPCPlayerBonusShield = 4
};

/**
 * @enum SPCSpellType
 * An enum describing a type of spell.
 */
typedef NS_ENUM(NSInteger, SPCSpellType) {
  SPCSpellTypeUnknown = 0,
  SPCSpellTypeBasicAttack = 1,
  SPCSpellTypeHeal = 2,
  SPCSpellTypeShield = 3
};

/**
 * @enum SPCSpellElement
 * An enum describing the element used in a spell.
 */
typedef NS_ENUM(NSInteger, SPCSpellElement) {
  SPCSpellElementUnknown = 0,
  SPCSpellElementNone = 1,
  SPCSpellElementAir = 2,
  SPCSpellElementWater = 3,
  SPCSpellElementFire = 4,
  SPCSpellElementEarth = 5
};

/**
 * @enum SPCSpellAccuracy
 * An enum describing the accuracy of the player's spell.
 */
typedef NS_ENUM(NSInteger, SPCSpellAccuracy) {
  SPCSpellAccuracyUnknown = 0,
  SPCSpellAccuracyPerfect = 1,
  SPCSpellAccuracyGreat = 2,
  SPCSpellAccuracyGood = 3
};

/**
 * @enum SPCGameState
 * An enum describing game-specific game state identifiers.
 */
typedef NS_ENUM(NSInteger, SPCGameStateId) {
  SPCGameStateIdUnknown = 0,
  SPCGameStateIdWaitingForPlayers = 1,
  SPCGameStateIdInstructions = 2,
  SPCGameStateIdPlayerAction = 3,
  SPCGameStateIdPlayerResolution = 4,
  SPCGameStateIdEnemyResolution = 5,
  SPCGameStateIdPlayerVictory = 6,
  SPCGameStateIdEnemyVictory = 7,
  SPCGameStateIdPaused = 8
};

/**
 * Manages Spellcast game-specific information.
 */
@interface SPCGameInfo : NSObject

#pragma mark Properties

/**
 * The wizard avatar selected by the player.
 */
@property(nonatomic, readwrite) int avatarIndex;

/**
 * The wizard name entered by the player.
 */
@property(nonatomic, copy, readwrite) NSString *playerName;

/**
 * Game state identifier provided by updateGameStateIdFromGamedata.
 */
@property(nonatomic, readonly) SPCGameStateId gameStateId;

/**
 * Player bonus provided by updatePlayerBonusFromGameMessage.
 */
@property(nonatomic, readonly) SPCPlayerBonus playerBonus;

/**
 * Duration for casting spells provided by updateCastspellsDurationMillisFromGameMessage.
 */
@property(nonatomic, readonly) int castSpellsDurationMillis;

#pragma mark Update methods

/**
 * Update game state identifier using game data provided by GCKGameManagerChannel.
 * @param gameData The game data provided by GCKGameManagerChannel.getGameData.
 * @return The game-specific game state identifier.
 */
- (SPCGameStateId)updateGameStateIdFromGameData:(id)gameData;

/**
 * Update the player bonus from a game message sent to the player.
 * @param gameMessage The game message provided by a game message via GCKGameManagerChannel.
 * @return The player bonus.
 */
- (SPCPlayerBonus)updatePlayerBonusFromGameMessage:(id)gameMessage;

/**
 * Update the duration for casting spells from a game message sent to the player.
 * @param gameMessage The game message provided by a game message via GCKGameManagerChannel.
 * @return The duration for casting spells in milliseconds.
 */
- (int)updateCastSpellsDurationMillisFromGameMessage:(id)GameMessage;

#pragma mark Data/message helpers

/**
 * Creates an object to pass as extra data when changing player state to GCKPlayerStateReady.
 * @return The root object of the object hierarchy (NSDictionary) that represents the data.
 */
- (id)createPlayerReadyData;

/**
 * Creates an object to pass as extra data when changing player state to GCKPlayerStatePlaying.
 * @param difficultySetting The difficulty setting when playing the game.
 * @return The root object of the object hierarchy (NSDictionary) that represents the data.
 */
+ (id)createPlayerPlayingDataWithDifficultySetting:(SPCGameDifficultySetting)difficultySetting;

/**
 * Creates an object representing one spell cast by the player in the current game turn. Used with
 * createGameMessageWithSpells.
 * @param spellType The type of spell being cast.
 * @param spellElement The element of the spell being cast.
 * @param spellAccuracy The accuracy of the spell being cast.
 * @return The root object of the object hierarchy (NSDictionary) that represents the spell.
 */
+ (id)createSpellWithSpellType:(SPCSpellType)spellType
                  spellElement:(SPCSpellElement)spellElement
                 spellAccuracy:(SPCSpellAccuracy)spellAccuracy;

/**
 * Creates an object with the player's spells to send as a game-specific message.
 * @param spells An array of the player's spells. Each element should be created with
 *     createSpellWithSpellType:spellElement:spellAccuracy.
 * @return The root object of the object hierarchy (NSDictionary) that represents the message.
 */
+ (id)createGameMessageWithSpells:(NSArray *)spells;

@end