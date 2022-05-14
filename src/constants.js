/* -------------------------------------------- */
/*  Custom Config                               */
/*                                              */
/*  To change dice labels, you just need to     */
/*  edit CONFIG.YZUR.DICE.ICONS.<your game>     */
/* -------------------------------------------- */

import * as YearZeroDice from './YearZeroDice.js';

const YZUR = {
  game: '',
  CHAT: {
    showInfos: true,
    diceSorting: ['base', 'skill', 'neg', 'gear', 'arto', 'loc', 'ammo'],
  },
  ROLL: {
    chatTemplate: 'templates/dice/roll.html',
    tooltipTemplate: 'templates/dice/tooltip.html',
    infosTemplate: 'templates/dice/infos.hbs',
  },
  DICE: {
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
    ICONS: {
      /**
       * A customizable helper function for creating the labels of the die.
       * Note: You must return a string or DsN will throw an error.
       * @param {DieTypeString} type
       * @param {number} result
       * @returns {string}
       */
      getLabel: function(type, result) {
        const arto = ['d8', 'd10', 'd12'];
        if (arto.includes(type)) type = 'arto';
        return String(this[CONFIG.YZUR.game][type][result]);
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
  },
};

YZUR.DICE.DIE_TYPES_BY_CLASS = Object.entries(YZUR.DICE.DIE_TYPES).reduce((dieTypes, [type, cls]) => {
  dieTypes[cls.name] = type;
  return dieTypes;
}, {});

export default YZUR;