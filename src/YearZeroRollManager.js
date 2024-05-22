import YearZeroRoll from './YearZeroRoll.js';
import YZUR from './constants.js';
import { YearZeroDie } from './YearZeroDice.js';
import { DieTermError, GameTypeError } from './errors.js';

/** @typedef {import('./constants').GameTypeString} GameTypeString */
/** @typedef {import('./constants').DieTermString} DieTermString */
/** @typedef {import('./constants').DieClassData} DieClassData */

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
 * 
 * @throws {SyntaxError} When instanciated
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
  constructor() {
    throw new SyntaxError(`YZUR | ${this.constructor.name} cannot be instanciated!`);
  }

  /**
   * Registers the Year Zero dice for the specified game.
   * 
   * You must call this method in `Hooks.once('init')`.
   * 
   * @param {GameTypeString} yzGame  The game used (for the choice of die types to register)
   * @param {Object}        [config] Custom config to merge with the initial config
   * @param {Object} [options]       Additional options
   * @param {number} [options.index] Index of the registration
   * @see YearZeroRollManager.registerConfig
   * @see YearZeroRollManager.registerDice
   * @see YearZeroRollManager.registerDie
   * @static
   */
  static register(yzGame, config, options = {}) {
    // Override DiceTerm.fromData until we have a better solution.
    YearZeroRollManager._overrideDiceTermFromData();
    // Registers the config.
    YearZeroRollManager.registerConfig(config);
    // Registers the YZ game.
    YearZeroRollManager._initialize(yzGame);
    // Registers the dice.
    YearZeroRollManager.registerDice(yzGame, options?.index);
    console.log('YZUR | Registration complete!');
  }

  /* -------------------------------------------- */

  /**
   * Registers the Year Zero Universal Roller config.
   * *(See the config details at the very bottom of this file.)*
   * @param {string} [config] Custom config to merge with the initial config
   * @static
   */
  static registerConfig(config) {
    CONFIG.YZUR = foundry.utils.mergeObject(YZUR, config);
  }

  /* -------------------------------------------- */

  /**
   * Registers all the Year Zero Dice of the chosen game.
   * @param {GameTypeString} [yzGame] The game used (for the choice of die types to register)
   * @param {number}         [i=0]    Index of the registration
   * @see YearZeroRollManager.registerDie
   * @static
   */
  static registerDice(yzGame, i) {
    // Exists early if `game` is omitted.
    if (!yzGame || typeof yzGame !== 'string') {
      throw new SyntaxError('YZUR | A game must be specified for the registration.');
    }

    // Checks the game validity.
    if (!YearZeroRollManager.GAMES.includes(yzGame)) {
      console.warn(`YZUR | Unsupported game identifier "${yzGame}"`);
      if (!YearZeroRollManager.DIE_TERMS_MAP[yzGame]) {
        YearZeroRollManager.DIE_TERMS_MAP[yzGame] = [];
      }
    }

    // Registers the game's dice.
    const diceTypes = YearZeroRollManager.DIE_TERMS_MAP[yzGame];
    for (const type of diceTypes) YearZeroRollManager.registerDie(type);

    // Finally, registers our custom Roll class for Year Zero games.
    YearZeroRollManager.registerRoll(undefined, i);
  }

  /* -------------------------------------------- */

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

  /* -------------------------------------------- */

  /**
   * Registers a die in Foundry.
   * @param {DieTermString} term Class identifier of the die to register
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

  /* -------------------------------------------- */

  /**
   * Registers a custom die in Foundry.
   * @param {DieTermString} term Class identifier of the die to register
   * @param {DieClassData}  data Data for creating the custom die class
   * @see YearZeroRollManager.createDieClass
   * @see YearZeroRollManager.registerDie
   */
  static registerCustomDie(term, data) {
    if (!YearZeroRollManager.GAMES.includes(CONFIG.YZUR.game)) {
      throw new GameTypeError('YZUR | Unregistered game. Please register a game before registering a custom die.');
    }

    const cls = YearZeroRollManager.createDieClass(data);

    if (CONFIG.YZUR.Dice.DIE_TERMS[term]) {
      console.warn(`YZUR | Overwriting an existing die "${CONFIG.YZUR.Dice.DIE_TERMS[term]}" with: "${term}"`);
    }
    CONFIG.YZUR.Dice.DIE_TERMS[term] = cls;

    YearZeroRollManager.DIE_TERMS_MAP[CONFIG.YZUR.game].push(term);
    YearZeroRollManager.registerDie(term);
  }
  /* -------------------------------------------- */

  /**
   * @param {GameTypeString} yzGame The game used (for the choice of die types to register)
   * @private
   * @static
   */
  static _initialize(yzGame) {
    if (!CONFIG.YZUR) throw new ReferenceError('YZUR | CONFIG.YZUR does not exists!');
    if (CONFIG.YZUR.game) {
      console.warn(
        `YZUR | Overwriting the default Year Zero game "${CONFIG.YZUR.game}" with: "${yzGame}"`,
      );
    }
    CONFIG.YZUR.game = yzGame;
    console.log(`YZUR | The name of the Year Zero game is: "${yzGame}".`);
  }

  /* -------------------------------------------- */

  /**
   * Overrides the default Foundry DiceTerm prototype to inject our own fromData() function.
   * When creating a dice term, the DiceTerm prototype will now check if the term has a YZE pattern.
   * If so, it uses our method, otherwise it returns to the Foundry defaults.
   * @private
   * @static
   * @see DiceTerm.fromData
  */
  static _overrideDiceTermFromData() {
    DiceTerm.prototype.constructor.fromData = function (data) {
      let cls = CONFIG.Dice.termTypes[data.class];
      if (!cls) {
        const termkeys = Object.keys(CONFIG.Dice.terms);
        const stringifiedFaces = String(data.faces);
        if (data.class === 'Die' && termkeys.includes(stringifiedFaces)) {
          cls = CONFIG.Dice.terms[stringifiedFaces];
          data.class = cls.name;
        }
        else
          cls = Object.values(CONFIG.Dice.terms).find(c => c.name === data.class) || foundry.dice.terms.Die;
      }

      return cls._fromData(data);
    }
  };

  /* -------------------------------------------- */

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
      const isYZURFormula = options.yzur ?? (
        'game' in data ||
        'maxPush' in data ||
        'game' in options ||
        'maxPush' in options ||
        formula.match(/\d*d(:?[bsngzml]|6|8|10|12)/i)
      );
      const n = isYZURFormula ? index : 0;
      const cls = CONFIG.Dice.rolls[n];
      return new cls(formula, data, options);
    };
  }

  /* -------------------------------------------- */

  /**
   * Creates a new custom Die class that extends the {@link YearZeroDie} class.
   * @param {DieClassData} data An object with
   * @returns {class}
   * @see YearZeroDie
   * @static
   * 
   * @example
   * YZUR.YearZeroRollManager.createDieClass({
   *   name: 'D6SpecialDie',
   *   denomination: 's',
   *   faces: 6,
   *   type: 'gear',
   *   lockedValues: [4, 5, 6],
   * });
   */
  static createDieClass(data) {
    if (!data || typeof data !== 'object') {
      throw new SyntaxError('YZUR | To create a Die class, you must pass a DieClassData object!');
    }

    // eslint-disable-next-line no-shadow
    const { name, denomination: deno, faces, type, lockedValues } = data;

    if (typeof faces !== 'number' || faces <= 0) {
      throw new DieTermError(`YZUR | Invalid die class faces "${faces}"`);
    }

    const YearZeroCustomDie = class extends YearZeroDie {
      constructor(termData = {}) {
        termData.faces = faces;
        super(termData);
      }
    };

    // Defines the name of the new die class.
    if (!name | typeof name !== 'string') {
      throw new DieTermError(`YZUR | Invalid die class name "${name}"`);
    }
    Object.defineProperty(YearZeroCustomDie, 'name', { value: name });

    // Defines the denomination of the new die class.
    if (!deno || typeof deno !== 'string') {
      throw new DieTermError(`YZUR | Invalid die class denomination "${deno}"`);
    }
    YearZeroCustomDie.DENOMINATION = deno;

    // Defines the type of the new die class, if any.
    if (type != undefined) {
      if (typeof type !== 'string') {
        throw new DieTermError(`YZUR | Invalid die class type "${type}"`);
      }
      if (!CONFIG.YZUR.Dice.DIE_TYPES.includes(type)) {
        console.warn(`YZUR | Unsupported DieTypeString: "${type}"`);
      }
      if (!CONFIG.YZUR.Icons[CONFIG.YZUR.game][type]) {
        console.warn(`YZUR | No icons defined for type "${type}"`);
      }
      YearZeroCustomDie.TYPE = type;
    }

    // Defines the locked values of the new die class, if any.
    if (lockedValues != undefined) {
      if (!Array.isArray(lockedValues)) {
        throw new DieTermError(`YZUR | Invalid die class locked values "${lockedValues}" (Not an Array)`);
      }
      for (const [i, v] of lockedValues.entries()) {
        if (typeof v !== 'number') {
          throw new DieTermError(`YZUR | Invalid die class locked value "${v}" at [${i}] (Not a Number)`);
        }
      }
      YearZeroCustomDie.LOCKED_VALUES = lockedValues;
    }
    return YearZeroCustomDie;
  }
}

/* -------------------------------------------- */
/*  Members                                     */
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
 * @readonly
 */
YearZeroRollManager.GAMES;
Object.defineProperty(YearZeroRollManager, 'GAMES', {
  get: () => Object.keys(YearZeroRollManager.DIE_TERMS_MAP),
});
// YearZeroRollManager.GAMES = Object.keys(YearZeroRollManager.DIE_TERMS_MAP);
