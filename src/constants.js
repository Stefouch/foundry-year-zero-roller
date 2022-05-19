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
 * @property {!string} game The identifier for the game
 * @property {Object}         Chat                 Options for the chat
 * @property {boolean}       [Chat.showInfos=true] Whether to show the additional information under the roll result
 * @property {DieTypeString} [Chat.diceSorting=['base', 'skill', 'neg', 'gear', 'arto', 'loc', 'ammo']]
 *   Defines the default order
 * @property {Object}  Roll                 Options for the YearZeroRoll class
 * @property {!string} Roll.chatTemplate    Path to the chat template
 * @property {!string} Roll.tooltipTemplate Path to the tooltip template
 * @property {!string} Roll.infosTemplate   Path to the infos template
 * @property {Object}   Dice   Options for the YearZeroDie class
 * @property {boolean} [Dice.localizeDieTypes=true]
 *   Whether to localize the type of the die
 * @property {Object.<DieTypeString, class>}  Dice.DIE_TYPES
 *   An enumeration of YearZeroDie classes
 * @property {Object.<string, DieTypeString>} Dice.DIE_TYPES_BY_CLASS
 *   An enumeration of YearZeroDie types sorted by their class names
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
    localizeDieTypes: true,
    DIE_TYPES: {
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

YZUR.Dice.DIE_TYPES_BY_CLASS = Object.entries(YZUR.Dice.DIE_TYPES).reduce((dieTypes, [type, cls]) => {
  dieTypes[cls.name] = type;
  return dieTypes;
}, {});

// For compatibility with version 4.0.0
// TODO remove at version 5.0
Object.defineProperties(YZUR, 'CHAT', { get: () => depreYZUR('Chat') });
Object.defineProperties(YZUR, 'ROLL', { get: () => depreYZUR('Roll') });
Object.defineProperties(YZUR, 'DICE', {
  get: () => {
    depreYZUR('Dice');
    return {
      get localizeDieTypes() { return YZUR.Dice.localizeDieTypes; },
      get DIE_TYPES() { return YZUR.Dice.DIE_TYPES; },
      get DIE_TYPES_BY_CLASS() { return YZUR.Dice.DIE_TYPES_BY_CLASS; },
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
