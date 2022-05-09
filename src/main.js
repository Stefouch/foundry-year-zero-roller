/*
 * ===============================================================================
 *  YZUR
 *    YEAR ZERO UNIVERSAL DICE ROLLER FOR THE FOUNDRY VTT
 * ===============================================================================
 * Author: @Stefouch
 * Version: 3.0.0     for:     Foundry VTT V8 (0.8.8)
 * Licence: MIT
 * ===============================================================================
 * Content:
 * 
 * - YearZeroRollManager: Interface for registering dice.
 * 
 * - YearZeroRoll: Custom implementation of the default Foundry Roll class,
 *     with many extra getters and utility functions.
 * 
 * - YearZeroDie: Custom implementation of the default Foundry DieTerm class,
 *     also with many extra getters.
 * 
 * - (Base/Skill/Gear/etc..)Die: Extends of the YearZeroDie class with specific
 *     DENOMINATION and LOCKED_VALUE constants.
 * 
 * - CONFIG.YZUR.game: The name of the game stored in the Foundry config.
 * 
 * - CONFIG.YZUR.DICE.ICONS.{..}: The dice labels stored in the Foundry config.
 * 
 * ===============================================================================
 */

import YearZeroRollManager from './YearZeroRollManager.js';
import YearZeroRoll from './YearZeroRoll.js';
import * as YearZeroDice from './YearZeroDice.js';
import YZUR from './constants.js';
import * as YzurErrors from './errors.js';

// DO NOT ADD "default"
// Here is why: https://stackoverflow.com/questions/43814830/destructuring-a-default-export-object
export {
  YearZeroRollManager,
  YearZeroRoll,
  YearZeroDice,
  YZUR,
  YzurErrors,
};