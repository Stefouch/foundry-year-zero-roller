import { YearZeroRoll } from './YearZeroRoll.js';
import YZUR from './constants.js';
import { DieTypeError, GameTypeError } from './errors.js';

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
 * Defines a type of a YZ die.
 * - `base`: Base Die (locked on 1 and 6, trauma on 1)
 * - `skill`: Skill Die (locked on 6)
 * - `gear`: Gear Die (locked on 1 and 6, gear damage on 1)
 * - `neg`: Negative Die (locked on 6, negative success)
 * - `stress`: Stress Die (locked on 1 and 6, stress, panic)
 * - `artoD8`: D8 Artifact Die (locked on 6+, multiple successes)
 * - `artoD10`: D10 Artifact Die (locked on 6+, multiple successes)
 * - `artoD12`: D12 Artifact Die (locked on 6+, multiple successes)
 * - `a`: T2K/BR D12 Die (locked on 1 and 6+, multiple successes)
 * - `b`: T2K/BR D10 Die (locked on 1 and 6+, multiple successes)
 * - `c`: T2K/BR D8 Die (locked on 1 and 6+)
 * - `d`: T2K/BR D6 Die (locked on 1 and 6+)
 * - `ammo`: T2K Ammo Die (locked on 1 and 6, not success but hit)
 * - `loc`: Hit Location Die
 * @typedef {string} DieTypeString
 */

/**
 * Defines a YZ die's denomination.
 * @typedef {string} DieDeno
 */

/**
 * An object with quantities of dice.
 * @typedef {Object<DieTypeString, number>} DiceQuantities
 * @property {?number}  base     The quantity of base dice
 * @property {?number}  skill    The quantity of skill dice
 * @property {?number}  gear     The quantity of gear dice
 * @property {?number}  neg      The quantity of negative dice
 * @property {?number}  stress   The quantity of stress dice
 * @property {?number}  artoD8   The quantity of artoD8 dice
 * @property {?number}  artoD10  The quantity of artoD10 dice
 * @property {?number}  artoD12  The quantity of artoD12 dice
 * @property {?number}  a        The quantity of T2K/BR D12 dice
 * @property {?number}  b        The quantity of T2K/BR D10 dice
 * @property {?number}  c        The quantity of T2K/BR D8 dice
 * @property {?number}  d        The quantity of T2K/BR D6 dice
 * @property {?number}  ammo     The quantity of ammo dice
 * @property {?number}  loc      The quantity of location dice
 */


/* -------------------------------------------- */
/*  Custom Dice Registration                    */
/* -------------------------------------------- */

/**
 * Interface for registering Year Zero dice.
 * 
 * To register the game and its dice,
 * call the static `YearZeroRollManager.register()` method
 * at the start of the `init` Hooks.
 * 
 * @abstract
 * @interface
 * 
 * @example
 * import { YearZeroRollManager } from './lib/yzur.js';
 * Hooks.once('init', function() {
 *   YearZeroRollManager.register('yourgame', { options });
 *   ...
 * });
 * 
 */
export default class YearZeroRollManager {
  /**
   * Registers the Year Zero dice for the specified game.
   * 
   * You must call this method in `Hooks.once('init')`.
   * 
   * @param {GameTypeString}  yzGame  The game used (for the choice of die types to register).
   * @param {object}         [config] Custom config to merge with the initial config.
   * @static
   */
  static register(yzGame, config) {
    // Registers the config.
    YearZeroRollManager.registerConfig(config);
    // Registers the YZ game.
    YearZeroRollManager._initialize(yzGame);
    // Registers the dice.
    YearZeroRollManager.registerDice(yzGame);
    console.log('YZUR | Registration complete!');
  }

  /**
   * Registers the Year Zero Universal Roller config.
   * *(See the config details at the very bottom of this file.)*
   * @param {string} [config] Custom config to merge with the initial config.
   * @static
   */
  static registerConfig(config) {
    CONFIG.YZUR = foundry.utils.mergeObject(YZUR, config);
  }

  /**
   * Registers all the Year Zero Dice.
   * @param {?GameTypeString} yzGame The game used (for the choice of die types to register)
   * @static
   */
  static registerDice(yzGame) {
    // Registers all the dice if `game` is omitted.
    if (!yzGame) {
      throw new SyntaxError('YZUR | A game must be specified for the registration.');
    }

    // Checks the game validity.
    if (!YearZeroRollManager.GAMES.includes(yzGame)) throw new GameTypeError(yzGame);

    // Registers the game's dice.
    const diceTypes = YearZeroRollManager.DIE_TYPES_MAP[yzGame];
    for (const type of diceTypes) YearZeroRollManager.registerDie(type);

    // Finally, registers our custom Roll class for Year Zero games.
    YearZeroRollManager.registerRoll();
  }

  /**
   * Registers the roll.
   * @param {class}  [cls] The roll class to register
   * @param {number} [i=0] Index of the registration
   * @static
   */
  static registerRoll(cls = YearZeroRoll, i = 0) {
    CONFIG.Dice.rolls[i] = cls;
    CONFIG.Dice.rolls[i].CHAT_TEMPLATE = CONFIG.YZUR.ROLL.chatTemplate;
    CONFIG.Dice.rolls[i].TOOLTIP_TEMPLATE = CONFIG.YZUR.ROLL.tooltipTemplate;
    CONFIG.YZUR.ROLL.index = i;
    if (i > 0) YearZeroRollManager._overrideRollCreate(i);
  }

  /**
   * Registers a die in Foundry.
   * @param {DieTypeString} type Type of die to register
   * @static
   */
  static registerDie(type) {
    const cls = CONFIG.YZUR.DICE.DIE_TYPES[type];
    if (!cls) throw new DieTypeError(type);

    const deno = cls.DENOMINATION;
    if (!deno) {
      throw new SyntaxError(`YZUR | Undefined DENOMINATION for "${cls.name}".`);
    }

    // Registers the die in the Foundry CONFIG.
    const reg = CONFIG.Dice.terms[deno];
    if (reg) {
      console.warn(
        `YZUR | Die Registration: "${deno}" | Overwritting ${reg.name} with "${cls.name}".`,
      );
    }
    else {
      console.log(`YZUR | Die Registration: "${deno}" with ${cls.name}.`);
    }
    CONFIG.Dice.terms[deno] = cls;
  }

  /**
   * @param {GameTypeString} yzGame The game used (for the choice of die types to register)
   * @private
   * @static
   */
  static _initialize(yzGame) {
    if (!CONFIG.YZUR) throw new ReferenceError('YZUR | CONFIG.YZUR does not exists!');
    if (CONFIG.YZUR.game) {
      console.warn(
        `YZUR | Overwritting the default Year Zero game "${CONFIG.YZUR.game}" with: "${yzGame}"`,
      );
    }
    CONFIG.YZUR.game = yzGame;
    console.log(`YZUR | The name of the Year Zero game is: "${yzGame}".`);
  }

  static _overrideRollCreate(index = 1) {
    Roll.prototype.constructor.create = function(formula, data = {}, options = {}) {
      const YZURFormula = data.yzur
        ?? data.game
        ?? data.maxPush
        ?? formula.match(/\d*d(:?[bsngzml]|6|8|10|12)/i);
      const n = YZURFormula ? index : 0;
      const cls = CONFIG.Dice.rolls[n];
      return new cls(formula, data, options);
    };
  }
}

/* -------------------------------------------- */

/**
 * Die Types mapped with Games.
 * Used by the register method to choose which dice to activate.
 * @type {Object<GameTypeString, DieTypeString[]>}
 * @constant
 */
YearZeroRollManager.DIE_TYPES_MAP = {
  // Mutant Year Zero
  'myz': ['base', 'skill', 'gear', 'neg'],
  // Forbidden Lands
  'fbl': ['base', 'skill', 'gear', 'neg', 'artoD8', 'artoD10', 'artoD12'],
  // Alien RPG
  'alien': ['skill', 'stress'],
  // Tales From the Loop
  'tales': ['skill'],
  // Coriolis
  'cor': ['skill'],
  // Vaesen
  'vae': ['skill'],
  // Twilight 2000
  't2k': ['a', 'b', 'c', 'd', 'ammo', 'loc'],
  // Blade Runner
  'br': ['a', 'b', 'c', 'd'],
};

/** @type {GameTypeString[]} */
YearZeroRollManager.GAMES = Object.keys(YearZeroRollManager.DIE_TYPES_MAP);