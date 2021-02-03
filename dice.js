/*
 * ===============================================================================
 *  UNIVERSAL YEAR ZERO DICE ROLLER
 *   FOR THE FOUNDRY VTT
 * ===============================================================================
 * Author: @Stefouch
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
 * ===============================================================================
 */


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
 * @typedef {string} GameTypeString
 */

/**
 * Defines a type of a YZ die.
 * 
 * `base`, `skill`, `gear`, `neg`, `stress`, `artoD8`, `artoD10`, `artoD12`, `a`, `b`, `c`, `d`, `ammo`, `loc`
 * @typedef {string} DieTypeString
 */

/**
* An object with quantities of dice.
* @typedef {Object<DieTypeString, number>} DiceQuantities
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
 * import { YearZeroRollManager } from 'xxxx.js';
 * Hooks.once('init', function() {
 *   ...
 *   YearZeroRollManager.register('yourgame');
 * });
 * 
 */
export class YearZeroRollManager {
  /**
   * Registers the Year Zero dice for the specified game
   * and the cache for the pushable Roll objects.
   * 
   * You must call this method in `Hooks.once('init')`.
   * 
   * @param {GameTypeString} yzGame The game used (for the choice of die types to register). If omitted, registers all the dice.
   * @static
   */
  static register(yzGame) {
    // Registers the dice.
    YearZeroRollManager.registerDice(yzGame);
    // Registers the YZ game.
    YearZeroRollManager._initialize(yzGame);
    console.log(`${YearZeroRollManager.name} | Registration complete!`);
  }

  /**
   * Registers all the Year Zero Dice.
   * @param {?GameTypeString} yzGame The game used (for the choice of die types to register). If omitted, registers all the dice.
   * @static
   */
  static registerDice(yzGame) {
    // Registers all the dice if `game` is omitted.
    if (!yzGame) {
      for (const g of YearZeroRollManager.GAMES) {
        const diceTypes = YearZeroRollManager.DIE_TYPES_MAP[g];
        for (const type of diceTypes) YearZeroRollManager.registerDie(type);
      }
    }
    else {
      // Checks the game validity.
      if (!YearZeroRollManager.GAMES.includes(yzGame)) throw new GameTypeError(yzGame);

      // Registers the game's dice.
      const diceTypes = YearZeroRollManager.DIE_TYPES_MAP[yzGame];
      for (const type of diceTypes) YearZeroRollManager.registerDie(type);
    }

    // Finally, registers our custom Roll class for Year Zero games.
    CONFIG.Dice.rolls[0] = YearZeroRoll;
  }

  /**
   * Registers a die in Foundry.
   * @param {DieTypeString} type Type of die to register
   * @static
   */
  static registerDie(type) {
    const cls = YearZeroRollManager.DIE_TYPES[type];
    if (!cls) throw new DieTypeError(type);

    const deno = cls.DENOMINATION;
    if (!deno) {
      throw new SyntaxError(`Undefined DENOMINATION for "${cls.name}".`);
    }

    // Registers the die in the Foundry CONFIG.
    const reg = CONFIG.Dice.terms[deno];
    if (reg) {
      console.warn(`${YearZeroRollManager.name} | Die Registration: "${deno}" | Overwritting ${reg.name} with "${cls.name}".`);
    }
    else {
      console.log(`${YearZeroRollManager.name} | Die Registration: "${deno}" with ${cls.name}.`);
    }
    CONFIG.Dice.terms[deno] = cls;
  }

  /**
   * @param {GameTypeString} yzGame The game used (for the choice of die types to register)
   * @private
   * @static
   */
  static _initialize(yzGame) {
    if (game.yzrolls?.game) {
      console.warn(
        `${YearZeroRollManager.name} | Overwritting the default Year Zero game "${game.yzrolls.game}" with: "${yzGame}"`,
      );
    }
    game.yzrolls = { game: yzGame };
    console.log(`${YearZeroRollManager.name} | The name of the Year Zero game is: "${yzGame}".`);
  }

  /* -------------------------------------------- */

  /**
   * Die Types and their classes.
   * @type {Object<DieTypeString, YearZeroDie>}
   * @constant
   * @readonly
   * @static
   */
  static get DIE_TYPES() {
    // Wrapped like this because of class declarations issues.
    return {
      'base': BaseDie,
      'skill': SkillDie,
      'neg': NegativeDie,
      'gear': GearDie,
      'stress': StressDie,
      'arto': ArtifactDie,
      'artoD8': D8ArtifactDie,
      'artoD10': D10ArtifactDie,
      'artoD12': D12ArtifactDie,
      'a': D12TwilightDie,
      'b': D10TwilightDie,
      'c': D8TwilightDie,
      'd': D6TwilightDie,
      'ammo': AmmoDie,
      'loc': LocationDie,
    };
  }

  /**
   * Die Types mapped with Games.
   * @type {Object<GameTypeString, DieTypeString[]>}
   * @constant
   * @static
   */
  static get DIE_TYPES_MAP() {
    return {
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
    };
  }

  static get DIE_TYPES_SWAP() {
    return {
      'alien': { base: 'skill', gear: 'skill' },
      'tales': { base: 'skill', gear: 'skill' },
      'cor': { base: 'skill', gear: 'skill' },
      'vae': { base: 'skill', gear: 'skill' },
      't2k': { base: 'b', skill: 'd', gear: 'ammo' },
    };
  }

  /**
   * @type {GameTypeString[]}
   * @constant
   * @static
   */
  static get GAMES() {
    return Object.keys(YearZeroRollManager.DIE_TYPES_MAP);
  }
}

/* -------------------------------------------- */
/*  Custom Roll Class                           */
/* -------------------------------------------- */

/**
 * Custom Roll class for Year Zero games.
 * @extends {Roll} The Foundry Roll class
 */
export class YearZeroRoll extends Roll {
  /**
   * @param {string} formula  The string formula to parse
   * @param {Object} data     The data object against which to parse attributes within the formula
   * @param {string} data.game     The game used
   * @param {number} data.maxPush  The maximum number of times the roll can be pushed
   */
  constructor(formula, data = {}) {
    super(formula, data);
    if (!this.data.maxPush) data.maxPush = 1;
  }

  /* -------------------------------------------- */

  /**
   * The game used.
   * @type {string}
   * @readonly
   */
  get game() {
    if (!this.data.game) return YearZeroRollManager.GAMES[0];
    return this.data.game;
  }
  set game(yzGame) {
    this.data.game = yzGame;
  }

  /**
   * The maximum number of pushes.
   * @type {number}
   * @readonly
   */
  get maxPush() {
    return this.data.maxPush;
  }
  set maxPush(n) {
    this.data.maxPush = n;
  }

  /**
   * The total number of dice in the roll.
   * @type {number}
   * @readonly
   */
  get size() {
    return this.terms.reduce((s, t) => t instanceof YearZeroDie ? s + t.number : s, 0);
  }

  /**
   * The number of times this roll has been pushed.
   * @type {number}
   * @readonly
   */
  get pushCount() {
    return this.terms.reduce((c, t) => Math.max(c, t.pushCount || 0), 0);
  }

  /**
   * Whether the roll was pushed or not.
   * @type {boolean}
   * @readonly
   */
  get pushed() {
    return this.pushCount > 0;
  }

  /**
   * Tells if the roll is pushable.
   * @type {boolean}
   * @readonly
   */
  get pushable() {
    return (
      this.pushCount < this.maxPush
      && this.terms.some(t => t.pushable)
      && !this.mishap
    );
  }

  /**
   * The quantity of successes.
   * @type {number}
   * @readonly
   * @deprecated
   */
  get successCount() {
    console.warn('YZRoll | YearZeroRoll#successCount is deprecated. Use #total instead.');
    return this.total;
  }

  /**
   * The quantity of ones (banes).
   * @type {number}
   * @readonly
   */
  get baneCount() {
    const banableTypes = ['base', 'gear', 'stress', 'ammo'];
    let count = 0;
    for (const bt of banableTypes) {
      count += this.count(bt, 1);
    }
    return count;
  }

  /**
   * The quantity of traumas ("1" on base dice).
   * @type {number}
   * @readonly
   */
  get attributeTrauma() {
    return this.count('base', 1);
  }

  /**
   * The quantity of gear damage ("1" on gear dice).
   * @type {number}
   * @readonly
   */
  get gearDamage() {
    return this.count('gear', 1);
  }

  /**
   * The quantity of stress dice.
   * @type {number}
   * @readonly
   */
  get stress() {
    return this.count('stress');
  }

  /**
   * The quantity of panic ("1" on stress dice).
   * @type {number}
   * @readonly
   */
  get panic() {
    return this.count('stress', 1);
  }

  /**
   * Tells if the roll is a mishap (double 1's).
   * @type {boolean}
   * @readonly
   */
  get mishap() {
    if (this.game !== 't2k') return false;
    return this.baneCount >= 2 || this.baneCount >= this.size;
  }

  /* -------------------------------------------- */

  /**
   * Generates a roll based on the number of dice.
   * @param {GameTypeString} [yzGame]     The game used
   * @param {number}         [maxPush=1]  The maximum number of pushes
   * @param {boolean}        [push=false] Whether to add a push modifier to the roll
   * @param {DiceQuantities}  dice  An object with quantities of dice
   * @param {?number}  dice.base     The quantity of base dice
   * @param {?number}  dice.skill    The quantity of skill dice
   * @param {?number}  dice.gear     The quantity of gear dice
   * @param {?number}  dice.neg      The quantity of negative dice
   * @param {?number}  dice.stress   The quantity of stress dice
   * @param {?number}  dice.ammo     The quantity of ammo dice
   * @param {?number}  dice.loc      The quantity of location dice
   * @param {?number}  dice.artoD8   The quantity of artoD8 dice
   * @param {?number}  dice.artoD10  The quantity of artoD10 dice
   * @param {?number}  dice.artoD12  The quantity of artoD12 dice
   * @param {?number}  dice.a        The quantity of T2K D12 dice
   * @param {?number}  dice.b        The quantity of T2K D10 dice
   * @param {?number}  dice.c        The quantity of T2K D8 dice
   * @param {?number}  dice.d        The quantity of T2K D6 dice
   * @override
   */
  static createFromDiceQuantities({
    yzGame = null, maxPush = 1, push = false,
    dice = {
      base: 0,
      skill: 0,
      neg: 0,
      gear: 0,
      stress: 0,
      artoD8: 0,
      artoD10: 0,
      artoD12: 0,
      a: 0,
      b: 0,
      c: 0,
      d: 0,
      ammo: 0,
      loc: 0,
    },
  } = {}) {
    // Checks the game.
    yzGame = yzGame || game.yzrolls?.game;
    if (!YearZeroRollManager.GAMES.includes(yzGame)) throw new GameTypeError(yzGame);

    // Builds the formula.
    const out = [];
    for (const [type, n] of Object.entries(dice)) {
      if (n <= 0) continue;
      const cls = YearZeroRollManager.DIE_TYPES[type];
      const deno = cls.DENOMINATION;
      const str = `${n}d${deno}${push ? 'p' : ''}`;
      out.push(str);
    }
    const formula = out.join(' + ');

    if (!YearZeroRoll.validate(formula)) throw new RollError(formula);

    // Creates the roll.
    const roll = new YearZeroRoll(formula, { game: yzGame, maxPush });
    console.warn(roll);
    return roll;
  }

  /**
   * Pushes the roll, following the YZ rules.
   * @returns {YearZeroRoll} This roll, pushed
   */
  push() {
    if (!this.pushable) return this;

    // Step 1 — Pushes the terms.
    this.terms.forEach(t => t.pushable ? t.push() : t);

    // Step 2 — Evaluates terms.
    // Note: t.evaluate() = term, otherwise = operation sign
    this.results = this.terms.map(t => t.evaluate ? t.total : t);

    // Step 3 — Safely evaluates the final total.
    let total = this._safeEval(this.results.join(' '));
    if (total === null) total = 0;
    if (!Number.isNumeric(total)) {
      throw new Error(game.i18n.format('DICE.ErrorNonNumeric', { formula: this.formula }));
    }

    // Stores the final output.
    this._dice = []; // TODO
    this._total = total;
    console.warn(this);
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Gets all the dice terms of a certain type.
   * @param {DieTypeString} type Die type to search
   * @returns {DiceTerm[]}
   */
  getTerms(type) {
    return this.terms.filter(t => t.type === type);
  }

  /**
   * Counts the values of a certain type in the roll.
   * If `seed` is omitted, counts all the dice of a certain type.
   * @param {DieTypeString} type  The type of the die
   * @param {number}       [seed] The number to search, if any
   * @returns {number} Total count
   */
  count(type, seed) {
    return this.terms.reduce((c, t) => {
      if (t.type === type) {
        for (const r of t.results) {
          if (!r.active) continue;
          if (seed != null) {
            if (r.result === seed) c++;
          }
          else {
            c += t.number;
          }
        }
      }
      return c;
    }, 0);
  }

  /**
   * Gets the quantities of each die type.
   * @returns {DiceQuantities}
   */
  getDiceQuantities() {
    const dice = {};
    for (const type of Object.keys(YearZeroRollManager.DIE_TYPES)) {
      const qty = this.count(type);
      if (qty > 0) dice[type] = qty;
    }
    return dice;
  }

  /* -------------------------------------------- */

  /**
   * Applies a difficulty modifier to a quantity of dice.
   * @param {number} mod Difficulty modifier (bonus or malus)
   * @returns {YearZeroRoll} A new roll instance, modified
   */
  modify(mod) {
    // Gets the dice quantities.
    const dice = this.getDiceQuantities();

    let occurenceNb = 0;
    while (mod !== 0 && occurenceNb < 100) {
      // Watches the number of occurences to avoid infinite loops.
      occurenceNb++;
      if (occurenceNb >= 100) throw new Error(`${this.constructor.name} | Infinite modify loop!`);

      // Twilight 2000
      if (this.game === 't2k') {
        const dieTypes = ['d', 'c', 'b', 'a'];

        // Creates a dice pool array and finds the total quantities of each die.
        const pool = Object.entries(dice).reduce((arr, [k, v]) => {
          if (dieTypes.includes(k)) {
            for (; v > 0; v--) arr.push(k);
          }
          return arr;
        }, []);
        const n = pool.length;

        // Exits early on 3+ dice.
        if (n > 2) break;
        if (n <= 1 && pool.includes('d')) break;

        // Initializes null dice.
        for (const type of dieTypes) if (!dice[type]) dice[type] = 0;

        // Gets the die to modify.
        const die = pool.reduce((a, b) => {
          if (mod > 0) {
            if (b === 'a') return a;
            return a < b ? a : b;
          }
          return a > b ? a : b;
        }, '');

        // Exits early if we didn't find a die to change.
        if (!die) break;

        // Modifies the range.
        const currentRangeIndex = dieTypes.indexOf(die);
        if (currentRangeIndex >= 0) {
          const maxRangeIndex = dieTypes.length - 1;
          const newRangeIndex = currentRangeIndex + mod;
          const rangeIndex = clampNumber(newRangeIndex, 0, maxRangeIndex);
          const newDie = dieTypes[rangeIndex];
          mod -= (rangeIndex - currentRangeIndex);

          // Positive excess mod means adding an extra die.
          // Note: the pool can only have a maximum of 2 dice.
          if (mod > 0) {
            dice[die] -= 1;
            dice[newDie] += 1;

            if (n < 2) {
              const ex = Math.min(dieTypes.length, mod);
              const extraDie = dieTypes[ex - 1];
              dice[extraDie] += 1;
              if (mod > ex) mod -= ex;
            }
          }
          // Negative excess mod means removing the die and decreasing another one.
          // Note: The pool has always 1 die.
          else if (mod < 0 && n > 1) {
            dice[die] -= 1;
            // We add 1 because we removed one die (which is 1 step).
            mod += 1;
          }
          else {
            dice[die] -= 1;
            dice[newDie] += 1;
          }
        }
      }
      // Mutant Year Zero & Forbidden Lands
      else if (this.game === 'myz' || this.game === 'fbl') {
        if (!dice.skill) dice.skill = 0;
        const neg = Math.max(-mod - dice.skill, 0);
        dice.skill += mod;
        if (neg > 0) {
          if (!dice.neg) dice.neg = 0;
          dice.neg += neg;
        }
        mod = 0;
      }
      // All other games
      else {
        if (!dice.skill) dice.skill = 0;
        dice.skill += mod;
        mod = 0;
      }
    }

    // Builds the new roll instance.
    return this.constructor.createFromDiceQuantities({
      yzGame: this.game,
      maxPush: this.maxPush,
      dice,
    });
  }

  /* -------------------------------------------- */

  /**
   * Renders the tooltip HTML for a Roll instance.
   * @return {Promise<HTMLElement>}
   * @override
   * @async
   */
  getTooltip() {
    const parts = this.dice.map(d => {
      const cls = d.constructor;
      return {
        formula: d.formula,
        total: d.total,
        faces: d.faces,
        flavor: d.options.flavor,
        rolls: d.results.map(r => {
          const hasSuccess = r.success !== undefined;
          const hasFailure = r.failure !== undefined;
          // START MODIFIED PART ==>
          // // const isMax = r.result === d.faces;
          // // const isMin = r.result === 1;
          let isMax = false, isMin = false;
          if (d.type === 'neg') {
            isMax = false;
            isMin = r.result === 6;
          }
          else {
            isMax = r.result === d.faces || r.count >= 1;
            isMin = r.result === 1 && d.type !== 'skill' && d.type !== 'loc';
          }
          // <== END MODIFIED PART
          return {
            result: cls.getResultLabel(r.result),
            classes: [
              cls.name.toLowerCase(),
              'd' + d.faces,
              r.success ? 'success' : null,
              r.failure ? 'failure' : null,
              r.rerolled ? 'rerolled' : null,
              r.exploded ? 'exploded' : null,
              r.discarded ? 'discarded' : null,
              !(hasSuccess || hasFailure) && isMin ? 'min' : null,
              !(hasSuccess || hasFailure) && isMax ? 'max' : null,
            ].filter(c => c).join(' '),
          };
        }),
      };
    });
    return renderTemplate(this.constructor.TOOLTIP_TEMPLATE, { parts });
  }

  /* -------------------------------------------- */

  /** @override */
  toMessage(messageData = {}, { rollMode = null, create = true } = {}) {
    messageData = mergeObject({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: this.total,
      roll: this,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      sound: CONFIG.sounds.dice,
    }, messageData);
    return super.toMessage(messageData, { rollMode, create });
  }

  /* -------------------------------------------- */

  /** @override */
  static fromData(data) {
    const roll = super.fromData(data);
    roll.data = data.data || {};
    return roll;
  }

  /** @override */
  toJSON() {
    return {
      ...super.toJSON(),
      data: this.data,
    };
  }
}

/* -------------------------------------------- */
/*  Custom Dice classes                         */
/* -------------------------------------------- */

export class YearZeroDie extends Die {
  constructor(termData) {
    if (!termData) termData = {};
    termData.faces = termData.faces || 6;
    super(termData);

    // if (!this.options.maxPush) {
    //   this.options.maxPush = 1;
    // }
    // TODO
    // if (!this.options.flavor) {
    //   const clsName = this.constructor.name;
    //   this.options.flavor = game.i18n.localize(`YZDIE.${clsName}`);
    // }
  }

  /**
   * The type of the die.
   * //@abstract Must be implemented by other dice.
   * @type {DieTypeString}
   * @readonly
   */
  get type() {
    // return undefined;
    return invertObject(YearZeroRollManager.DIE_TYPES)[this.constructor.name];
  }

  /**
   * The maximum number of pushes.
   * @type {number}
   * @readonly
   *
  get maxPush() {
    return this.options.maxPush;
  }//*/

  /**
   * Whether the die can be pushed (according to its type).
   * @type {boolean}
   * @readonly
   */
  get pushable() {
    // if (this.pushCount >= this.maxPush) return false;
    for (const r of this.results) {
      if (!r.active || r.discarded) continue;
      if (!this.constructor.LOCKED_VALUES.includes(r.result)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Number of times this die has been pushed.
   * @type {number}
   * @readonly
   */
  get pushCount() {
    return this.results.reduce((c, r) => Math.max(c, r.push || 0), 0);
  }

  /**
   * Whether this die has been pushed.
   * @type {boolean}
   * @readonly
   */
  get pushed() {
    return this.pushCount > 0;
  }

  /** @override */
  roll(options) {
    const roll = super.roll(options);
    roll.count = roll.result >= 6 ? 1 : 0;
    this.results[this.results.length - 1] = roll;
    return roll;
  }

  count(n) {
    return this.values.filter(v => v === n).length;
  }

  push() {
    const _push = 1 + (this.pushCount || 0);
    let count = 0;
    for (const r of this.results) {
      if (!r.active) continue;
      if (!this.constructor.LOCKED_VALUES.includes(r.result)) {
        r.active = false;
        r.discarded = true;
        r.pushed = true;
        r.push = _push;
        count++;
      }
    }
    for (; count > 0; count--) this.roll();
    return this;
  }

  /** @override */
  static getResultLabel(result) {
    if (result === 1) return '☣';
    if (result === 6) return '☢';
    return result;
  }
}

YearZeroDie.LOCKED_VALUES = [6];
YearZeroDie.MODIFIERS = mergeObject(
  { 'p' : 'push' },
  Die.MODIFIERS,
);

/**
 * Base Die: 1 & 6 cannot be re-rolled.
 * @extends {YearZeroDie}
 */
export class BaseDie extends YearZeroDie {
  // get type() { return 'base'; }
}
BaseDie.DENOMINATION = 'b';
BaseDie.LOCKED_VALUES = [1, 6];

/**
 * Skill Die: 6 cannot be re-rolled.
 * @extends {YearZeroDie}
 */
export class SkillDie extends YearZeroDie {
  // get type() { return 'skill'; }
  /** @override */
  static getResultLabel(result) {
    return result >= 6 ? '☢' : result;
  }
}
SkillDie.DENOMINATION = 's';

/**
 * Gear Die: 1 & 6 cannot be re-rolled.
 * @extends {YearZeroDie}
 */
export class GearDie extends YearZeroDie {
  // get type() { return 'gear'; }
  /** @override */
  static getResultLabel(result) {
    if (result === 1) return '💥';
    if (result === 6) return '☢';
    return result;
  }
}
GearDie.DENOMINATION = 'g';
GearDie.LOCKED_VALUES = [1, 6];

/**
 * Negative Die: 6 cannot be re-rolled.
 * @extends {SkillDie}
 */
export class NegativeDie extends SkillDie {
  // get type() { return 'neg'; }
  /** @override */
  roll(options) {
    const roll = super.roll(options);
    roll.count = roll.result >= 6 ? -1 : 0;
    this.results[this.results.length - 1] = roll;
    return roll;
  }
}
NegativeDie.DENOMINATION = 'n';

/* -------------------------------------------- */

/**
 * Stress Die: 1 & 6 cannot be re-rolled.
 * @extends {YearZeroDie}
 */
export class StressDie extends YearZeroDie {
  // get type() { return 'stress'; }
  /** @override */
  static getResultLabel(result) {
    if (result >= 6) return '✔️';
    if (result === 1) return '⚠️';
    return result;
  }
}
StressDie.DENOMINATION = 's';
StressDie.LOCKED_VALUES = [1, 6];

/* -------------------------------------------- */

/**
 * Artifact Die: 6+ cannot be re-rolled.
 * @extends {SkillDie}
 */
export class ArtifactDie extends SkillDie {
  // get type() { return 'arto'; }
  /** @override */
  roll(options) {
    const roll = super.roll(options);
    if (roll.result < this.constructor.SUCCESS_TABLE.length) {
      roll.count = this.constructor.SUCCESS_TABLE[roll.result];
    }
    this.results[this.results.length - 1] = roll;
    return roll;
  }
  /** @override */
  static getResultLabel(result) {
    // Must be overriden because it extends SkillDie.
    return result;
  }
}
ArtifactDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4];
ArtifactDie.LOCKED_VALUES = [6, 7, 8, 9, 10, 11, 12];

export class D8ArtifactDie extends ArtifactDie {
  constructor(termData) {
    termData.faces = 8;
    super(termData);
  }
}
D8ArtifactDie.DENOMINATION = '8';

export class D10ArtifactDie extends ArtifactDie {
  constructor(termData) {
    termData.faces = 10;
    super(termData);
  }
}
D10ArtifactDie.DENOMINATION = '10';

export class D12ArtifactDie extends ArtifactDie {
  constructor(termData) {
    termData.faces = 12;
    super(termData);
  }
}
D12ArtifactDie.DENOMINATION = '12';

/* -------------------------------------------- */

/**
 * Twilight Die: 1 & 6+ cannot be re-rolled.
 * @extends {ArtifactDie} But LOCKED_VALUES are not the same
 */
export class TwilightDie extends ArtifactDie {
  // get type() { return 'base'; }
  /** @override */
  static getResultLabel(result) {
    if (result === 1) return '•';
    return result;
  }
}
TwilightDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2];
TwilightDie.LOCKED_VALUES = [1, 6, 7, 8, 9, 10, 11, 12];

export class D6TwilightDie extends TwilightDie {
  constructor(termData) {
    termData.faces = 6;
    super(termData);
  }
}
D6TwilightDie.DENOMINATION = 'd';

export class D8TwilightDie extends TwilightDie {
  constructor(termData) {
    termData.faces = 8;
    super(termData);
  }
}
D8TwilightDie.DENOMINATION = 'c';

export class D10TwilightDie extends TwilightDie {
  constructor(termData) {
    termData.faces = 10;
    super(termData);
  }
}
D10TwilightDie.DENOMINATION = 'b';

export class D12TwilightDie extends TwilightDie {
  constructor(termData) {
    termData.faces = 12;
    super(termData);
  }
}
D12TwilightDie.DENOMINATION = 'a';

/* -------------------------------------------- */

export class AmmoDie extends YearZeroDie {
  constructor(termData) {
    termData.faces = 6;
    super(termData);
  }
  // get type() { return 'ammo'; }
  get hit() { return this.count(6);}
  /** @override */
  static getResultLabel(result) {
    if (result === 1) return '•';
    if (result >= 6) return '🎯';
    return result;
  }
}
AmmoDie.DENOMINATION = 'm';
AmmoDie.LOCKED_VALUES = [];

export class LocationDie extends Die {
  constructor(termData) {
    termData.faces = 6;
    super(termData);
  }
  // get type() { return 'loc'; }
  /** @override */
  roll(options) {
    const roll = super.roll(options);
    roll.count = 0;
    this.results[this.results.length - 1] = roll;
    return roll;
  }
  /** @override */
  static getResultLabel(result) {
    return {
      '1': 'L',
      '2': 'T', '3': 'T', '4': 'T',
      '5': 'A',
      '6': 'H',
    }[result];
  }
}
LocationDie.DENOMINATION = 'l';

/* -------------------------------------------- */
/*  Custom Dialog                               */
/* -------------------------------------------- */

export class YZRollDialog extends Dialog {
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find('input').focus(ev => ev.currentTarget.select());
  }
}

/* -------------------------------------------- */
/*  Custom Errors                               */
/* -------------------------------------------- */

class GameTypeError extends TypeError {
  constructor(msg) {
    super(`Unknown game: "${msg}". Allowed games are: ${YearZeroRollManager.GAMES.join(', ')}.`);
    this.name = 'YZ GameType Error';
  }
}

class DieTypeError extends TypeError {
  constructor(msg) {
    super(`Unknown die type: "${msg}". Allowed types are: ${Object.keys(YearZeroRollManager.DIE_TYPES).join(', ')}.`);
    this.name = 'YZ DieType Error';
  }
}

class RollError extends SyntaxError {
  constructor(msg) {
    super(`Invalid roll formula: "${msg}"`);
    this.name = 'YZ Roll Error';
  }
}