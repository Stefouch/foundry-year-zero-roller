/* -------------------------------------------- */
/*  Custom Config                               */
/*                                              */
/*  To change dice labels, you just need to     */
/*  edit CONFIG.YZUR.Icons.<your game>     */
/* -------------------------------------------- */

import * as YearZeroDice from './YearZeroDice.js';

/**
 * All constants used by YZUR which are stored in Foundry's `CONFIG.YZUR`.
 * @constant
 * @global
 * @property {!string} game The identifier for the game
 * @property {Object}           Chat                 Options for the chat
 * @property {boolean}         [Chat.showInfos=true] Whether to show the additional information under the roll result
 * @property {DieTypeString[]} [Chat.diceSorting=['base', 'skill', 'neg', 'gear', 'arto', 'loc', 'ammo']]
 *   Defines the default order
 * @property {Object}  Roll                 Options for the YearZeroRoll class
 * @property {!string} Roll.chatTemplate    Path to the chat template
 * @property {!string} Roll.tooltipTemplate Path to the tooltip template
 * @property {!string} Roll.infosTemplate   Path to the infos template
 * @property {Object}          Dice     Options for the YearZeroDie class
 * @property {boolean}        [Dice.localizeDieTypes=true]
 *   Whether to localize the type of the die
 * @property {DieTypeString[]} Dice.DIE_TYPES
 *   An array of YearZeroDie types
 * @property {Object.<DieTermString, class>}  Dice.DIE_TERMS
 *   An enumeration of YearZeroDie classes
 * @property {Object}    Icons    Options for the icons and what's on the die faces
 * @property {function} [Icons.getLabel=getLabel( type: DieTypeString, result: number )] 
 *   A customizable helper function for creating the labels of the die.
 *   Note: You must return a string or DsN will throw an error.
 * @property {Object.<DieTypeString, Object.<string, string|number>>} Icons.yzGame
 *   Defines the labels for your dice. Change `yzGame` with the game identifier
 */
const YZUR = {
  game: '',
  Chat: {
    showInfos: true,
    diceSorting: ['base', 'skill', 'neg', 'gear', 'arto', 'loc', 'ammo'],
  },
  Roll: {
    chatTemplate: 'templates/dice/roll.html',
    tooltipTemplate: 'templates/dice/tooltip.html',
    infosTemplate: 'templates/dice/infos.hbs',
  },
  Dice: {
    localizeDieTerms: true,
    DIE_TYPES: ['base', 'skill', 'neg', 'gear', 'stress', 'arto', 'ammo', 'loc'],
    DIE_TERMS: {
      'base': YearZeroDice.BaseDie,
      'skill': YearZeroDice.SkillDie,
      'neg': YearZeroDice.NegativeDie,
      'gear': YearZeroDice.GearDie,
      'stress': YearZeroDice.StressDie,
      'artoD8': YearZeroDice.D8ArtifactDie,
      'artoD10': YearZeroDice.D10ArtifactDie,
      'artoD12': YearZeroDice.D12ArtifactDie,
      'a': YearZeroDice.D12TwilightDie,
      'b': YearZeroDice.D10TwilightDie,
      'c': YearZeroDice.D8TwilightDie,
      'd': YearZeroDice.D6TwilightDie,
      'ammo': YearZeroDice.AmmoDie,
      'loc': YearZeroDice.LocationDie,
      'brD12': YearZeroDice.D12BladeRunnerDie,
      'brD10': YearZeroDice.D10BladeRunnerDie,
      'brD8': YearZeroDice.D8BladeRunnerDie,
      'brD6': YearZeroDice.D6BladeRunnerDie,
    },
  },
  Icons: {
    /**
     * A customizable helper function for creating the labels of the die.
     * Note: You must return a string or DsN will throw an error.
     * @param {DieTypeString} type
     * @param {number} result
     * @returns {string}
     */
    getLabel: function (type, result) {
      const arto = ['d8', 'd10', 'd12'];
      if (arto.includes(type)) type = 'arto';
      return String(CONFIG.YZUR.Icons[CONFIG.YZUR.game][type][result]);
    },
    myz: {
      base: {
        '1': '☣',
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': '☢',
      },
      skill: {
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': '☢',
      },
      neg: {
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': '➖',
      },
      gear: {
        '1': '💥',
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': '☢',
      },
    },
    fbl: {
      base: {
        '1': '☠',
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': '⚔️',
      },
      skill: {
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': '⚔️',
      },
      neg: {
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': '➖',
      },
      gear: {
        '1': '💥',
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': '⚔️',
      },
      arto: {
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
        '11': 11,
        '12': 12,
      },
    },
    alien: {
      skill: {
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': '💠', // '❇',
      },
      stress: {
        '1': '😱', // '⚠',
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': '💠',
      },
    },
    tales: {
      skill: {
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': '⚛️', // '👑',
      },
    },
    cor: {
      skill: {
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': '🐞',
      },
    },
    vae: {
      skill: {
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': '🦋',
      },
    },
    t2k: {
      base: {
        '1': '💥',
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
        '11': 11,
        '12': 12,
      },
      ammo: {
        '1': '💥',
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': '🎯',
      },
      loc: {
        '1': 'L',
        '2': 'T',
        '3': 'T',
        '4': 'T',
        '5': 'A',
        '6': 'H',
      },
    },
    br: {
      base: {
        '1': '🦄',
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
        '11': 11,
        '12': 12,
      },
    },
  },
};

// TODO clean
// YZUR.Dice.DIE_TYPES_BY_CLASS = Object.entries(YZUR.Dice.DIE_TERMS).reduce((dieTypes, [type, cls]) => {
//   dieTypes[cls.name] = type;
//   return dieTypes;
// }, {});

// For compatibility with version 4.0.0
// TODO remove at version 6.0
Object.defineProperties(YZUR, 'CHAT', { get: () => depreYZUR('Chat') });
Object.defineProperties(YZUR, 'ROLL', { get: () => depreYZUR('Roll') });
Object.defineProperties(YZUR, 'DICE', {
  get: () => {
    depreYZUR('Dice');
    return {
      get localizeDieTypes() { return YZUR.Dice.localizeDieTerms; },
      get DIE_TYPES() { return YZUR.Dice.DIE_TERMS; },
      // get DIE_TYPES_BY_CLASS() { return YZUR.Dice.DIE_TYPES_BY_CLASS; },
      get ICONS() { return depreYZUR('Icons', 'DICE.ICONS'); },
    };
  },
});

const depreYZUR = (key, text) => {
  console.error(`YZUR | "YZUR.${text ?? key.toUpperCase()}" is deprecated. Use "YZUR.${key}" instead.`);
  if (key in YZUR) return YZUR[key];
  return null;
};

export default YZUR;

/* -------------------------------------------- */
/*  Definitions                                 */
/* -------------------------------------------- */

/**
 * Defines a Year Zero game.
 * - `myz`: Mutant Year Zero
 * - `fbl`: Forbidden Lands
 * - `alien`: Alien RPG
 * - `cor`: Coriolis The Third Horizon
 * - `tales`: Tales From the Loop & Things From the Flood
 * - `vae`: Vaesen
 * - `t2k`: Twilight 2000
 * - `br`: Blade Runner RPG
 * @typedef {string} GameTypeString
 */

/**
 * Defines a term of a YZ die. It's a shortcut to its class.
 * - `base`: Base Die (locked on 1 and 6, trauma on 1)
 * - `skill`: Skill Die (locked on 6)
 * - `gear`: Gear Die (locked on 1 and 6, gear damage on 1)
 * - `neg`: Negative Die (locked on 6, negative success)
 * - `stress`: Stress Die (locked on 1 and 6, stress, panic)
 * - `artoD8`: D8 Artifact Die (locked on 6+, multiple successes)
 * - `artoD10`: D10 Artifact Die (locked on 6+, multiple successes)
 * - `artoD12`: D12 Artifact Die (locked on 6+, multiple successes)
 * - `a`: Twilight 2000's D12 Die (locked on 1 and 6+, multiple successes)
 * - `b`: Twilight 2000's D10 Die (locked on 1 and 6+, multiple successes)
 * - `c`: Twilight 2000's D8 Die (locked on 1 and 6+)
 * - `d`: Twilight 2000's D6 Die (locked on 1 and 6+)
 * - `ammo`: Twilight 2000's Ammo Die (locked on 1 and 6, not success but hit)
 * - `loc`: Twilight 2000's Location Die
 * - `brD12`: Blade Runner's D12 Die (locked on 1 and 10+)
 * - `brD10`: Blade Runner's D10 Die (locked on 1 and 10)
 * - `brD8`: Blade Runner's D8 Die (locked on 1 and 6+)
 * - `brD6`: Blade Runner's D6 Die (locked on 1 and 6)
 * @typedef {string} DieTermString
 */

/**
 * Defines a type of a YZ die, its generic role and function.
 * - `base`: Base Die
 * - `skill`: Skill Die
 * - `gear`: Gear Die
 * - `neg`: Negative Die
 * - `stress`: Stress Die
 * - `arto`: Artifact Die
 * - `ammo`: Ammo Die
 * - `loc`: Location Die
 * @typedef {string} DieTypeString
 */

/**
 * Defines a YZ die's denomination.
 * @typedef {string} DieDeno
 */

/**
 * An object that is used to build a new class that extends the YearZeroDie class.
 * @typedef {Object} DieClassData
 * @property {!string}        name          The name of the new Die class
 * @property {!DieDeno}       denomination  The denomination of the new Die class
 * @property {DieTypeString} [type]         The type of the new Die class
 * @property {number[]}      [lockedValues] An array of values that disallow the die to be pushed
 */

/**
 * An object that is used to define a YearZero DieTerm.
 * @typedef  {Object}   TermBlok
 * @property {!DieDeno} term     The denomination of the dice to create
 * @property {!number}  number   The quantity of those dice
 * @property {string}  [flavor]  (optional) Any flavor tied to those dice
 * @property {number}  [maxPush] (optional) Special maxPush modifier but only for the those dice
 */

/**
 * Result of a rolled YearZero DieTerm.
 * @typedef {Object} YearZeroDieTermResult
 * @property {!number} result      The numeric result
 * @property {boolean} active      Is this result active, contributing to the total?
 * @property {number}  count       A value that the result counts as, otherwise the result is not used directly as
 * @property {boolean} success     Does this result denote a success?
 * @property {boolean} failure     Does this result denote a failure?
 * @property {boolean} discarded   Was this result discarded?
 * @property {boolean} rerolled    Was this result rerolled?
 * @property {boolean} exploded    Was this result exploded?
 * @property {boolean} pushed      ✨ Was this result pushed?
 * @property {boolean} hidden      ✨ Hides the die for DsN
 * @property {number}  indexResult ✨ Index of the result, and column position in the chat tooltip
 * @property {number}  indexPush   ✨ Index of the push, and row position in the chat tooltip
 * @see ✨ Extra features added by the override.
 * @see (FoundryVTT) {@link https://foundryvtt.com/api/global.html#DiceTermResult|DieTermResult} 
 */
