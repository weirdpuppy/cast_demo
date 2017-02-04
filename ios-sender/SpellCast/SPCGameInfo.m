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

#include "SPCGameInfo.h"

@interface SPCGameInfo() {
}

@property(nonatomic, readwrite) SPCGameStateId gameStateId;
@property(nonatomic, readwrite) SPCPlayerBonus playerBonus;
@property(nonatomic, readwrite) int castSpellsDurationMillis;

@end

@implementation SPCGameInfo

#pragma mark Update methods

- (SPCGameStateId)updateGameStateIdFromGameData:(id)gameData {
  if (!gameData) {
    _gameStateId = SPCGameStateIdUnknown;
  }
  NSDictionary *gameDataDictionary = (NSDictionary *)gameData;
  _gameStateId = [[gameDataDictionary valueForKey:@"gameStateId"] intValue];
  return _gameStateId;
}

- (SPCPlayerBonus)updatePlayerBonusFromGameMessage:(id)gameMessage {
  NSDictionary *gameMessageDictionary = (NSDictionary *)gameMessage;
  _playerBonus = [[gameMessageDictionary valueForKey:@"playerBonus"] intValue];
  return _playerBonus;
}

- (int)updateCastSpellsDurationMillisFromGameMessage:(id)gameMessage {
  NSDictionary *gameMessageDictionary = (NSDictionary *)gameMessage;
  _castSpellsDurationMillis =
      [[gameMessageDictionary valueForKey:@"castSpellsDurationMillis"] intValue];
  return _castSpellsDurationMillis;
}

#pragma mark Data/message helpers

- (id)createPlayerReadyData {
  return @{
    @"avatarIndex": @(_avatarIndex),
    @"playerName": _playerName
  };
}

+ (id)createPlayerPlayingDataWithDifficultySetting:(SPCGameDifficultySetting)difficultySetting {
  return @{
    @"difficultySetting": @(difficultySetting)
  };
}

+ (id)createSpellWithSpellType:(SPCSpellType)spellType
                  spellElement:(SPCSpellElement)spellElement
                 spellAccuracy:(SPCSpellAccuracy)spellAccuracy {
  return @{
    @"spellType": @(spellType),
    @"spellElement": @(spellElement),
    @"spellAccuracy": @(spellAccuracy)
  };
}

+ (id)createGameMessageWithSpells:(NSArray *)spells {
  return @{
    @"spells": spells
  };
}

@end