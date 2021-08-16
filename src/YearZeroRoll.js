/* -------------------------------------------- */
/*  Custom Roll Class                           */
/* -------------------------------------------- */

import YZUR from './constants.js';
import { GameTypeError } from './errors.js';
import { YearZeroDie } from './YearZeroDice.js';
import YearZeroRollManager from './YearZeroRollManager.js';

/**
 * Custom Roll class for Year Zero games.
 * @extends {Roll} The Foundry Roll class
 */
export class YearZeroRoll extends Roll {
  /**
   * @param {string} formula  The string formula to parse
   * @param {Object} data     The data object against which to parse attributes within the formula
   * @param {string} data.game     The game used
   * @param {string} data.name     The name of the roll
   * @param {number} data.maxPush  The maximum number of times the roll can be pushed
   */
  constructor(formula, data = {}, options = {}) {
    super(formula, data, options);
    if (!this.game) this.game = CONFIG.YZUR.game ?? 'myz';
    if (data.maxPush != undefined) this.maxPush = data.maxPush;
  }

  /* -------------------------------------------- */

  /**
   * The game used.
   * @type {string}
   * @readonly
   */
  get game() { return this.data.game; }
  set game(yzGame) { this.data.game = yzGame; }

  /**
   * The name of the roll.
   * @type {string}
   * @readonly
   */
  get name() { return this.data.name; }
  set name(str) { this.data.name = str; }

  /**
   * The maximum number of pushes.
   * @type {number}
   */
  set maxPush(n) {
    this.data.maxPush = n;
    for (const t of this.terms) {
      if (t instanceof YearZeroDie) {
        t.maxPush = n;
      }
    }
  }
  // TODO clean
  // get maxPush() { return this.data.maxPush; }
  get maxPush() {
    return this.terms.reduce((max, t) => t instanceof YearZeroDie ? Math.max(max, t.maxPush) : max, 0);
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
   * The number of times the roll has been pushed.
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
      // && !this.mishap
    );
  }

  /**
   * The quantity of successes.
   * @type {number}
   * @readonly
   */
  get successCount() {
    return this.terms.reduce((sc, t) => sc + (t.success ?? 0), 0);
  }

  /**
   * The quantity of ones (banes).
   * @type {number}
   * @readonly
   */
  get baneCount() {
    // return this.terms.reduce((bc, t) => bc + t.failure, 0);
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
    // if (this.game !== 't2k') return false;
    // return this.baneCount >= 2 || this.baneCount >= this.size;
    console.warn('YZRoll | YearZeroRoll#mishap is deprecated.');
    return false;
  }

  /**
   * The quantity of ammo spent. Equal to the sum of the ammo dice.
   * @type {number}
   * @readonly
   */
  get ammoSpent() {
    const mt = this.getTerms('ammo');
    if (!mt.length) return 0;
    return mt.reduce((tot, t) => tot + t.values.reduce((a, b) => a + b, 0), 0);
  }

  /**
   * The quantity of successes on ammo dice.
   * @type {number}
   * @readonly
   */
  get hitCount() {
    return this.count('ammo', 6);
  }

  /**
   * The quantity of ones (banes) on base dice and ammo dice.
   * @type {number}
   * @readonly
   */
  get jamCount() {
    const n = this.count('ammo', 1);
    return n > 0 ? n + this.attributeTrauma : 0;
  }

  /**
   * Tells if the roll caused a weapon jam.
   * @type {boolean}
   * @readonly
   */
  get jammed() {
    return this.pushed ? (this.jamCount >= 2) : false;
  }

  /**
   * The total successes produced by base dice.
   * @type {number}
   * @readonly
   */
  get baseSuccessQty() {
    return this.successCount - this.hitCount;
  }

  /**
   * The rolled hit locations.
   * @type {number[]}
   * @readonly
   */
  get hitLocations() {
    const lt = this.getTerms('loc');
    if (!lt.length) return [];
    return lt.reduce((tot, t) => tot.concat(t.values), []);
  }

  /**
   * The best rolled hit location.
   * @type {number}
   * @readonly
   */
  get bestHitLocation() {
    if (!this.hitLocations.length) return undefined;
    return Math.max(...this.hitLocations);
  }

  /* -------------------------------------------- */

  /**
   * Generates a roll based on the number of dice.
   * @param {DiceQuantities}  dice        An object with quantities of dice
   * @param {string}         [title]      The name of the roll
   * @param {GameTypeString} [yzGame]     The game used
   * @param {number}         [maxPush=1]  The maximum number of pushes
   * @param {boolean}        [push=false] Whether to add a push modifier to the roll
   * @override
   */
  static createFromDiceQuantities(dice = {}, { title, yzGame = null, maxPush = 1, push = false } = {}) {
    // Checks the game.
    yzGame = yzGame ?? CONFIG.YZUR?.game;
    if (!YearZeroRollManager.GAMES.includes(yzGame)) throw new GameTypeError(yzGame);

    // Builds the formula.
    const out = [];
    for (const [type, n] of Object.entries(dice)) {
      if (n <= 0) continue;
      let deno = CONFIG.YZUR.DICE.DIE_TYPES[type].DENOMINATION;
      const cls = CONFIG.Dice.terms[deno];
      deno = cls.DENOMINATION;
      const str = `${n}d${deno}${push ? 'p' : ''}`;
      out.push(str);
    }
    let formula = out.join(' + ');

    if (!YearZeroRoll.validate(formula)) {
      // throw new RollError(`Invalid roll formula: "${formula}"`, dice);
      console.warn(`${YearZeroRoll.name} | Invalid roll formula: "${formula}"`);
      formula = yzGame === 't2k' ? '1d6' : '1ds';
    }

    // Creates the roll.
    const roll = new YearZeroRoll(formula, { name: title, game: yzGame, maxPush });
    if (CONFIG.debug.dice) console.log(roll);
    return roll;
  }

  /* -------------------------------------------- */

  /**
   * Pushes the roll, following the YZ rules.
   * @param {DiceQuantities} extraDice
   * @param {object} [options={}] Options which inform how the Roll is evaluated
   * @param {boolean} [options.async=false] Evaluate the roll asynchronously, receiving a Promise as the returned value.
   * @returns {YearZeroRoll} The roll instance, pushed
   */
  // TODO support for additional dice when pushing
  push2(extraDice = {}, { async } = {}) {
    // // Step 0 — Prepares extra dice.
    // const extraRoll = YearZeroRoll.createFromDiceQuantities(extraDice);
    // extraRoll.roll();
    // // Step
    // if (!this._evaluated) this.evaluate();
    // if (!this.pushable) return this;
  }
  async push({ async } = {}) {
    if (!this._evaluated) await this.evaluate({ async });
    if (!this.pushable) return this;

    // Step 1 — Pushes the terms.
    this.terms.forEach(t => t instanceof YearZeroDie ? t.push() : t);

    // Step 2 — Re-evaluates all pushed terms.
    //   The evaluate() method iterates each terms and runs only
    //   the die's own evaluate() method on new (pushed) dice.
    this._evaluated = false;
    await this.evaluate({ async });

    return this;
  }

  /* -------------------------------------------- */

  /**
   * Gets all the dice terms of a certain type.
   * @param {DieTypeString} type Die type to search
   * @returns {YearZeroDie[]|DiceTerm[]}
   */
  getTerms(type) {
    return this.terms.filter(t => t.type === type);
  }

  /**
   * Counts the values of a certain type in the roll.
   * If `seed` is omitted, counts all the dice of a certain type.
   * @param {DieTypeString} type  The type of the die
   * @param {number}       [seed] The number to search, if any
   * @param {string}       [comparison='='] The comparison to use against the seed: `>`, `<`, or `=`
   * @returns {number} Total count
   */
  count(type, seed, comparison = '=') {
    return this.terms.reduce((c, t) => {
      if (t.type === type) {
        for (const r of t.results) {
          if (!r.active) continue;
          if (seed != null) {
            if (comparison === '>') {
              if (r.result > seed) c++;
            }
            else if (comparison === '<') {
              if (r.result < seed) c++;
            }
            else if (r.result === seed) {
              c++;
            }
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
  // TODO Why did I put a todo tag here?
  getDiceQuantities() {
    return this.terms.reduce((dice, t) => {
      if (t instanceof YearZeroDie) {
        const clsName = t.constructor.name;
        const type = CONFIG.YZUR.DICE.DIE_TYPES_BY_CLASS[clsName];
        if (type) dice[type] = t.number;
      }
      return dice;
    }, {});
  }

  /* -------------------------------------------- */

  /**
   * Applies a difficulty modifier to the roll.
   * @param {number} mod Difficulty modifier (bonus or malus)
   * @returns {YearZeroRoll} A new roll instance, modified
   */
  modify(mod) {
    // Exits early if no modifier.
    if (!mod) return this.duplicate();

    // Gets the dice quantities.
    const dice = this.getDiceQuantities();

    let occurenceNb = 0;
    while (mod !== 0) {
      // Failsafe – Watches the number of occurences to avoid infinite loops.
      occurenceNb++;
      if (occurenceNb >= 100) throw new RangeError(`${this.constructor.name} | Infinite modify loop!`);

      // TWILIGHT 2000
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

        // Early exits.
        if (mod > 0) {
          if (n > 2) break;
          if (pool.filter(t => t === 'a').length >= 2) break;
        }
        else if (n === 0) {
          dice.d = 1;
          break;
        }
        else if (n === 1 && pool.includes('d')) {
          break;
        }

        // Initializes null dice.
        for (const type of dieTypes) if (!dice[type]) dice[type] = 0;

        // Gets the die to modify.
        // For a positive modifier, we take the lowest die.
        // For a negative modifier, we take the highest one.
        const die = pool.reduce((a, b) => {
          if (mod > 0) {
            if (b === 'a') return a;
            return a > b ? a : b;
          }
          return a < b ? a : b;
        }, undefined);

        // Modifies the range.
        const currentRangeIndex = dieTypes.indexOf(die);
        let newDie;
        if (currentRangeIndex >= 0) {
          const maxRangeIndex = dieTypes.length - 1;
          const rangeIndex = currentRangeIndex + mod;
          const newRangeIndex = Math.clamped(rangeIndex, 0, maxRangeIndex);
          newDie = dieTypes[newRangeIndex];
          mod -= (newRangeIndex - currentRangeIndex);
          dice[die]--;
          dice[newDie]++;
        }

        // Positive excess mod means adding an extra die.
        // Note: the pool can only have a maximum of 2 dice.
        if (mod > 0) {
          if (n < 2) {
            const ex = Math.min(dieTypes.length, mod);
            dice[dieTypes[ex - 1]]++;
            if (mod > ex) mod -= ex;
            else break;
          }
          else {
            const diceBelowMaxRange = Object.entries(dice).filter(([k, v]) => v > 0 && k > 'a').length;
            if (diceBelowMaxRange <= 0) break;
          }
        }
        // Negative excess mod means removing the die and decreasing another one.
        // Note: The pool has always 1 die.
        else if (mod < 0 && n > 1) {
          dice[newDie]--;
          // We add 1 because we removed one die (which is 1 step).
          mod++;
        }
      }
      // MUTANT YEAR ZERO & FORBIDDEN LANDS
      else if (this.game === 'myz' || this.game === 'fbl') {
        // Balances skill & neg dice.
        if (dice.skill > 0 && dice.neg > 0) {
          while (dice.skill > 0 && dice.neg > 0) {
            dice.skill--;
            dice.neg--;
          }
        }
        if (!dice.skill) dice.skill = 0;
        const neg = Math.max(0, -mod - dice.skill);
        dice.skill = Math.max(0, dice.skill + mod);
        if (neg > 0) {
          if (!dice.neg) dice.neg = 0;
          dice.neg += neg;
        }
        mod = 0;
      }
      // ALL OTHER GAMES
      else {
        if (!dice.skill) dice.skill = 0;
        dice.skill = Math.max(1, dice.skill + mod);
        mod = 0;
      }
    }

    // Builds the new roll instance.
    const _roll = YearZeroRoll.createFromDiceQuantities(dice);
    const _data = _roll.toJSON();
    const data = this.toJSON();
    data.terms = _data.terms;
    data.formula = _data.formula;
    return this.constructor.fromData(data);
    // return YearZeroRoll.createFromDiceQuantities(dice, {
    //   yzGame: this.game,
    //   maxPush: this.maxPush,
    //   title: this.name,
    // });
  }

  /* -------------------------------------------- */

  /** @override */
  getTooltip() {
    const parts = this.dice.map(d => d.getTooltipData())
    // ==>
      .sort((a, b) => {
        const sorts = CONFIG?.YZUR?.CHAT?.diceSorting
          || YZUR.CHAT.diceSorting
          || [];
        if (!sorts.length) return 0;
        const at = sorts.indexOf(a.type);
        const bt = sorts.indexOf(b.type);
        return at - bt;
      });
    // <==
    // TODO clean this commented-out code at next Foundry version.
    // const parts = this.dice.map(d => {
    //   const cls = d.constructor;
    //   return {
    //     formula: d.formula,
    //     total: d.total,
    //     faces: d.faces,
    //     // ==>
    //     // // flavor: d.options.flavor,
    //     flavor: d.options.flavor || (
    //       CONFIG.YZUR?.DICE?.localizeDieTypes
    //         ? game.i18n.localize(`YZUR.DIETYPES.${cls.name}`)
    //         : null
    //     ),
    //     number: d.number,
    //     // // rolls: d.results.map(r => {
    //     rolls: d.results.map((r, i) => {
    //       // <==
    //       const hasSuccess = r.success !== undefined;
    //       const hasFailure = r.failure !== undefined;
    //       // ==>
    //       // // const isMax = r.result === d.faces;
    //       // // const isMin = r.result === 1;
    //       let isMax = false, isMin = false;
    //       if (d.type === 'neg') {
    //         isMax = false;
    //         isMin = r.result === 6;
    //       }
    //       else {
    //         isMax = r.result === d.faces || r.count >= 1;
    //         isMin = r.result === 1 && d.type !== 'skill' && d.type !== 'loc';
    //       }
    //       // <==
    //       return {
    //         result: cls.getResultLabel(r.result),
    //         // ==>
    //         row: r.indexPush,
    //         col: r.indexResult,
    //         // <==
    //         classes: [
    //           cls.name.toLowerCase(),
    //           'd' + d.faces,
    //           r.success ? 'success' : null,
    //           r.failure ? 'failure' : null,
    //           r.rerolled ? 'rerolled' : null,
    //           r.exploded ? 'exploded' : null,
    //           r.discarded ? 'discarded' : null,
    //           // ==>
    //           r.pushed ? 'pushed' : null,
    //           // <==
    //           !(hasSuccess || hasFailure) && isMin ? 'min' : null,
    //           !(hasSuccess || hasFailure) && isMax ? 'max' : null,
    //         ].filter(c => c).join(' '),
    //       };
    //     }),
    //   };
    // });
    // START MODIFIED PART ==>
    if (this.pushed) {
      // Converts "parts.rolls" into a matrix.
      for (const part of parts) {
        // Builds the matrix;
        const matrix = [];
        const n = part.number;
        let p = this.pushCount;
        for (; p >= 0; p--) matrix[p] = new Array(n).fill(undefined);

        // Fills the matrix.
        for (const r of part.rolls) {
          const row = r.row || 0;
          const col = r.col || 0;
          matrix[row][col] = r;
        }
        part.rolls = matrix;
      }
    }
    // // return renderTemplate(this.constructor.TOOLTIP_TEMPLATE, { parts });
    return renderTemplate(this.constructor.TOOLTIP_TEMPLATE, {
      parts,
      pushed: this.pushed,
      pushCounts: this.pushed
        ? [...Array(this.pushCount + 1).keys()].sort((a, b) => b - a)
        : undefined,
      config: CONFIG.YZUR ?? {},
    });
    // <== END MODIFIED PART
  }

  /* -------------------------------------------- */

  /**
   * Renders the infos of a Year Zero roll.
   * @param {string} [template] The path to the template
   * @returns {Promise<HTMLElement>}
   */
  getRollInfos(template = null) {
    template = template ?? CONFIG.YZUR?.ROLL?.infosTemplate;
    const context = { roll: this };
    return renderTemplate(template, context);
  }

  /* -------------------------------------------- */

  /** @override */
  async render(chatOptions = {}) {
    if (CONFIG.debug.dice) console.warn(this);

    chatOptions = foundry.utils.mergeObject({
      user: game.user.id,
      flavor: this.name,
      template: this.constructor.CHAT_TEMPLATE,
      blind: false,
    }, chatOptions);
    const isPrivate = chatOptions.isPrivate;

    // Executes the roll, if needed.
    if (!this._evaluated) await this.evaluate();

    // Defines chat data.
    const chatData = {
      formula: isPrivate ? '???' : this._formula,
      flavor: isPrivate ? null : chatOptions.flavor,
      user: chatOptions.user,
      tooltip: isPrivate ? '' : await this.getTooltip(),
      total: isPrivate ? '?' : Math.round(this.total * 100) / 100,
      success: isPrivate ? '?' : this.successCount,
      showInfos: isPrivate ? false : CONFIG.YZUR?.CHAT?.showInfos,
      infos: isPrivate ? null : await this.getRollInfos(chatOptions.infosTemplate),
      pushable: isPrivate ? false : this.pushable,
      options: chatOptions,
      roll: this,
    };

    // Renders the roll display template.
    return renderTemplate(chatOptions.template, chatData);
  }

  /* -------------------------------------------- */

  /** @override */
  async toMessage(messageData = {}, { rollMode = null, create = true } = {}) {
    messageData = foundry.utils.mergeObject({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker(),
      // "content" is overwritten by ChatMessage.create() (called in super)
      // with the HTML returned by roll.render(), but only if different of `this.total`.
      // So you can overwrite it here with a custom content in messageData.
      content: this.total,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      // sound: CONFIG.sounds.dice, // Already added in super.
    }, messageData);
    // messageData.roll = this; // Already added in super.
    return await super.toMessage(messageData, { rollMode, create });
  }

  /* -------------------------------------------- */

  /** @override */
  static fromData(data) {
    const roll = super.fromData(data);
    roll.data = data.data ?? {};
    return roll;
  }

  /** @override */
  toJSON() {
    return {
      ...super.toJSON(),
      data: this.data,
    };
  }

  /**
   * Creates a copy of the roll.
   * @returns {YearZeroRoll} A copy of this roll instance
   */
  duplicate() {
    return this.constructor.fromData(this.toJSON());
  }
}