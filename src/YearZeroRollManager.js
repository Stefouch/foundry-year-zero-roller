import YearZeroRoll from './YearZeroRoll.js';
import YZUR from './constants.js';
import { DieTermError, GameTypeError } from './errors.js';

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
 *   YearZeroRollManager.register('yourgame', config, options);
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
   * @param {GameTypeString} yzGame  The game used (for the choice of die types to register)
   * @param {Object}        [config] Custom config to merge with the initial config
   * @param {Object} [options]       Additional options
   * @param {number} [options.index] Index of the registration
   * @static
   */
  static register(yzGame, config, options = {}) {
    // Registers the config.
    YearZeroRollManager.registerConfig(config);
    // Registers the YZ game.
    YearZeroRollManager._initialize(yzGame);
    // Registers the dice.
    YearZeroRollManager.registerDice(yzGame, options?.index);
    console.log('YZUR | Registration complete!');
  }

  /**
   * Registers the Year Zero Universal Roller config.
   * *(See the config details at the very bottom of this file.)*
   * @param {string} [config] Custom config to merge with the initial config
   * @static
   */
  static registerConfig(config) {
    CONFIG.YZUR = foundry.utils.mergeObject(YZUR, config);
  }

  /**
   * Registers all the Year Zero Dice.
   * @param {GameTypeString} [yzGame] The game used (for the choice of die types to register)
   * @param {number}         [i=0]    Index of the registration
   * @static
   */
  static registerDice(yzGame, i) {
    // Registers all the dice if `game` is omitted.
    if (!yzGame) {
      throw new SyntaxError('YZUR | A game must be specified for the registration.');
    }

    // Checks the game validity.
    if (!YearZeroRollManager.GAMES.includes(yzGame)) throw new GameTypeError(yzGame);

    // Registers the game's dice.
    const diceTypes = YearZeroRollManager.DIE_TERMS_MAP[yzGame];
    for (const type of diceTypes) YearZeroRollManager.registerDie(type);

    // Finally, registers our custom Roll class for Year Zero games.
    YearZeroRollManager.registerRoll(undefined, i);
  }

  /**
   * Registers the roll.
   * @param {class}  [cls] The roll class to register
   * @param {number} [i=0] Index of the registration
   * @static
   */
  static registerRoll(cls = YearZeroRoll, i = 0) {
    CONFIG.Dice.rolls[i] = cls;
    CONFIG.Dice.rolls[i].CHAT_TEMPLATE = CONFIG.YZUR.Roll.chatTemplate;
    CONFIG.Dice.rolls[i].TOOLTIP_TEMPLATE = CONFIG.YZUR.Roll.tooltipTemplate;
    CONFIG.YZUR.Roll.index = i;
    if (i > 0) YearZeroRollManager._overrideRollCreate(i);
  }

  /**
   * Registers a die in Foundry.
   * @param {DieTermString} term Type of die to register
   * @static
   */
  static registerDie(term) {
    const cls = CONFIG.YZUR.Dice.DIE_TERMS[term];
    if (!cls) throw new DieTermError(term);

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

  /**
   * Overrides the default Foundry Roll prototype to inject our own create() function. 
   * When creating a roll, the Roll prototype will now check if the formula has a YZE pattern. 
   * If so, it uses our method, otherwise it returns to the Foundry defaults.
   * @param {number} [index=1] What index of our own Roll class in the Foundry CONFIG.Dice.rolls array.
   * @returns {YearZerRoll|Roll}
   * @private
   * @static
   */
  static _overrideRollCreate(index = 1) {
    Roll.prototype.constructor.create = function (formula, data = {}, options = {}) {
      const isYZURFormula = data.game
        ?? data.maxPush
        ?? options.yzur
        ?? options.game
        ?? options.maxPush
        ?? formula.match(/\d*d(:?[bsngzml]|6|8|10|12)/i);
      const n = isYZURFormula ? index : 0;
      const cls = CONFIG.Dice.rolls[n];
      return new cls(formula, data, options);
    };
  }
}

/* -------------------------------------------- */

/**
 * Die Types mapped with Games.
 * Used by the register method to choose which dice to activate.
 * @enum {DieTermString[]}
 * @constant
 */
YearZeroRollManager.DIE_TERMS_MAP = {
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
  'br': ['brD12', 'brD10', 'brD8', 'brD6'],
};

/**
 * List of identifiers for the games.
 * @enum {GameTypeString}
 * @constant
 */
YearZeroRollManager.GAMES = Object.keys(YearZeroRollManager.DIE_TERMS_MAP);
