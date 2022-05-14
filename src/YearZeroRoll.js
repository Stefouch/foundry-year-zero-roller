/* -------------------------------------------- */
/*  Custom Roll Class                           */
/* -------------------------------------------- */

import YearZeroRollManager from './YearZeroRollManager.js';
import { YearZeroDie } from './YearZeroDice.js';
import YZUR from './constants.js';
import { GameTypeError } from './errors.js';

/**
 * Custom Roll class for Year Zero games.
 * @extends {Roll} The Foundry Roll class
 */
export default class YearZeroRoll extends Roll {
  /**
   * @param {string} formula  The string formula to parse
   * @param {Object} data     The data object against which to parse attributes within the formula
   * @param {string} data.game     The game used
   * @param {string} data.name     The name of the roll
   * @param {number} data.maxPush  The maximum number of times the roll can be pushed
   * @param {string} options.game     The game used
   * @param {string} options.name     The name of the roll
   * @param {number} options.maxPush  The maximum number of times the roll can be pushed
   */
  constructor(formula, data = {}, options = {}) {
    if (options.name == undefined) options.name = data.name;
    if (options.game == undefined) options.game = data.game;
    if (options.maxPush == undefined) options.maxPush = data.maxPush;

    super(formula, data, options);

    if (!this.game) this.game = CONFIG.YZUR.game ?? 'myz';
    if (options.maxPush != undefined) this.maxPush = options.maxPush;
  }

  /* -------------------------------------------- */

  /**
   * The game used.
   * @type {string}
   * @readonly
   */
  get game() { return this.options.game; }
  set game(yzGame) { this.options.game = yzGame; }

  /**
   * The name of the roll.
   * @type {string}
   * @readonly
   */
  get name() { return this.options.name; }
  set name(str) { this.options.name = str; }

  /**
   * The maximum number of pushes.
   * @type {number}
   */
  set maxPush(n) {
    this.options.maxPush = n;
    for (const t of this.terms) {
      if (t instanceof YearZeroDie) {
        t.maxPush = n;
      }
    }
  }
  get maxPush() {
    // Note: Math.max(null, n) returns a number between [0, n[.
    return this.terms.reduce((max, t) => t instanceof YearZeroDie ? Math.max(max, t.maxPush) : max, null);
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
  /*  Static Class Methods                        */
  /* -------------------------------------------- */

  /** @override */
  static create(formula, data = {}, options = {}) {
    return new YearZeroRoll(formula, data, options);
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
      console.warn(`${YearZeroRoll.name} | Invalid roll formula: "${formula}"`);
      formula = yzGame === 't2k' ? '1d6' : '1ds';
    }

    // Creates the roll.
    const roll = new YearZeroRoll(formula, { name: title, game: yzGame, maxPush });
    if (CONFIG.debug.dice) console.log(roll);
    return roll;
  }

  /* -------------------------------------------- */
  /*  YearZeroRoll Utility Methods                */
  /* -------------------------------------------- */

  /**
   * Gets all the dice terms of a certain type or that match an object of values.
   * @param {DieTypeString|{}} search Die type to search or an object with comparison values
   * @returns {YearZeroDie[]|DiceTerm[]}
   */
  getTerms(search) {
    if (typeof search === 'string') return this.terms.filter(t => t.type === search);
    return this.terms.filter(t => {
      let f = true;
      if (search.type != undefined) f = f && search.type === t.type;
      if (search.number != undefined) f = f && search.number === t.number;
      if (search.faces != undefined) f = f && search.faces === t.faces;
      if (search.options) {
        for (const key in search.options) {
          f = f && search.options[key] === t.options[key];
        }
      }
      if (search.results) {
        for (const key in search.results) {
          f = f && t.results.some(r => r[key] === search.results[key]);
        }
      }
      return f;
    });
  }

  /* -------------------------------------------- */

  /**
   * Counts the values of a certain type in the roll.
   * If `seed` is omitted, counts all the dice of a certain type.
   * @param {DieTypeString} type  The type of the die
   * @param {number}       [seed] The value to search, if any
   * @param {string}       [comparison='='] The comparison to use against the seed: `>`, `>=`, `<`, `<=` or `=`
   * @returns {number} Total count
   */
  count(type, seed = null, comparison = '=') {
    return this.terms.reduce((c, t) => {
      if (t.type === type) {
        if (t.results.length) {
          for (const r of t.results) {
            if (!r.active) continue;
            if (seed != null) {
              if (comparison === '>') { if (r.result > seed) c++; }
              else if (comparison === '>=') { if (r.result >= seed) c++; }
              else if (comparison === '<') { if (r.result < seed) c++; }
              else if (comparison === '<=') { if (r.result <= seed) c++; }
              else if (r.result === seed) { c++; }
            }
            else {
              c++;
            }
          }
        }
        else if (seed != null) {
          c += 0;
        }
        else {
          c += t.number;
        }
      }
      return c;
    }, 0);
  }

  /* -------------------------------------------- */

  /**
   * Adds a number of dice to the roll.
   * Note: If a negative quantity is passed, instead it removes that many dice.
   * @param {number}        qty      The quantity to add
   * @param {DieTypeString} type     The type of dice to add
   * @param {number}       [range=6] The number of faces of the die
   * @param {number}       [value]   The predefined value for the new dice
   * @param {object}       [options] Additional options that modify the term
   * @returns {YearZeroRoll} This roll
   * @async
   */
  async addDice(qty, type, { range = 6, value = null, options } = {}) {
    if (!qty) return this;
    const search = { type, faces: range, options };
    if (qty < 0) return this.removeDice(-qty, search);
    if (value != undefined && !this._evaluated) await this.roll({ async: true });

    let term = this.getTerms(search)[0];
    if (term) {
      for (; qty > 0; qty--) {
        term.number++;
        if (this._evaluated) {
          term.roll();
          // TODO missing term._evaluateModifiers() for this new result only
          if (value != undefined) {
            term.results[term.results.length - 1].result = value;
          }
        }
      }
    }
    // If the DieTerm doesn't exist, creates it.
    else {
      const cls = CONFIG.YZUR.DICE.DIE_TYPES[type];
      term = new cls({
        number: qty,
        faces: range,
        maxPush: this.maxPush ?? 1,
        options,
      });
      if (this._evaluated) {
        await term.evaluate({ async: true });
        if (value != undefined) {
          term.results.forEach(r => r.result = value);
        }
      }
      if (this.terms.length > 0) {
        // eslint-disable-next-line no-undef
        this.terms.push(new OperatorTerm({ operator: type === 'neg' ? '-' : '+' }));
      }
      this.terms.push(term);
    }
    // Updates the cache of the Roll.
    this._formula = this.constructor.getFormula(this.terms);
    if (this._evaluated) this._total = this._evaluateTotal();

    return this;
  }

  /* -------------------------------------------- */

  /**
   * Removes a number of dice from the roll.
   * @param {number}           qty      The quantity to remove
   * @param {DieTypeString|{}} search   The type of dice to remove, or an object of values for comparison
   * @param {boolean}         [discard] Whether the term should be marked as "discarded" instead of removed
   * @param {boolean}         [disable] Whether the term should be marked as "active: false" instead of removed
   * @returns {YearZeroRoll} This roll
   */
  removeDice(qty, search, { discard = false, disable = false } = {}) {
    if (!qty) return this;

    for (; qty > 0; qty--) {
      const term = this.getTerms(search)[0];
      if (term) {
        term.number--;
        if (term.number <= 0) {
          const type = search.type ?? search;
          const index = this.terms.findIndex(t => t.type === type && t.number === 0);
          this.terms.splice(index, 1);
          if (this.terms[index - 1]?.operator) {
            this.terms.splice(index - 1, 1);
          }
        }
        else if (this._evaluated) {
          const index = term.results.findIndex(r => r.active);
          if (index < 0) break;
          if (discard || disable) {
            if (discard) term.results[index].discarded = discard;
            if (disable) term.results[index].active = !disable;
          }
          else {
            term.results.splice(index, 1);
          }
        }
      }
      else { break; }
    }
    // Updates the cache of the Roll.
    this._formula = this.constructor.getFormula(this.terms);
    if (this._evaluated) {
      if (this.terms.length) this._total = this._evaluateTotal();
      else this._total = 0;
    }

    return this;
  }

  /* -------------------------------------------- */

  /**
   * Gets the quantities of each die type.
   * @returns {DiceQuantities}
   * @deprecated Useless now
   */
  // TODO Why did I put a todo tag here?
  // TODO remove
  getDiceQuantities() {
    console.warn('YZUR | getDiceQuantities() is deprecated and will be removed in a future release.');
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
  /*  Push                                        */
  /* -------------------------------------------- */

  /**
   * Pushes the roll, following the YZ rules.
   * @param {object} [options={}] Options which inform how the Roll is evaluated
   * @param {boolean} [options.async=false] Evaluate the roll asynchronously, receiving a Promise as the returned value
   * @returns {YearZeroRoll} The roll instance, pushed
   */
  async push({ async } = {}) {
    if (!this._evaluated) await this.evaluate({ async });
    if (!this.pushable) return this;

    // Step 1 — Pushes the terms.
    this.terms.forEach(t => t instanceof YearZeroDie ? t.push() : t);

    // Step 2 — Re-evaluates all pushed terms.
    //   The evaluate() method iterates each terms and runs only
    //   the term's own evaluate() method on new (pushed) dice.
    this._evaluated = false;
    await this.evaluate({ async });

    return this;
  }

  /* -------------------------------------------- */
  /*  Modify                                      */
  /* -------------------------------------------- */

  /**
   * Applies a difficulty modifier to the roll.
   * @param {number} mod Difficulty modifier (bonus or malus)
   * @returns {YearZeroRoll} This roll, modified
   */
  async modify(mod = 0) {
    if (!mod) return this;

    // TWILIGHT 2000 & BLADE RUNNER
    // --------------------------------------------
    else if (this.game === 't2k' || this.game === 'br') {
      const diceMap = [null, 6, 8, 10, 12, Infinity];
      const typesMap = ['d', 'd', 'c', 'b', 'a', 'a'];
      const refactorRange = (range, n) => diceMap[diceMap.indexOf(range) + n];
      const getTypeFromRange = (range) => typesMap[diceMap.indexOf(range)];

      const _terms = this.getTerms('base');
      const dice = _terms.flatMap(t => new Array(t.number).fill(t.faces));

      // BLADE RUNNER
      if (this.game === 'br') {
        // Gets the lowest term.
        const lowest = Math.min(...dice);

        // A positive modifier means advantage.
        // An advantage adds a third base die, same value as lowest.
        if (mod > 0) {
          dice.push(lowest);
        }
        // A negative modifier means disadvantage.
        // A disadvantage removes the lowest die.
        else if (mod < 0) {
          const i = dice.indexOf(lowest);
          dice.splice(i, 1);
        }
        mod = 0;
      }

      // TWILIGHT 2000
      else {
        // 1 — Modifies the dice ranges.
        while (mod !== 0) {
          let i;
          // 1.1.1 — A positive modifier increases the lowest term.
          if (mod > 0) {
            i = dice.indexOf(Math.min(...dice));
            dice[i] = refactorRange(dice[i], 1);
            mod--;
          }
          // 1.1.2 — A negative modifier decreases the highest term.
          else {
            i = dice.indexOf(Math.max(...dice));
            dice[i] = refactorRange(dice[i], -1);
            mod++;
          }
          // 1.2 — Readjusts term faces.
          if (dice[i] === Infinity) {
            dice[i] = refactorRange(dice[i], -1);
            if (dice.length < 2) {
              dice.push(diceMap[1]);
            }
          }
          else if (dice[i] === null) {
            if (dice.length > 1) {
              dice.splice(i, 1);
            }
            else {
              dice[i] = refactorRange(dice[i], 1);
            }
          }
          else if (dice[i] === undefined) {
            throw new Error(`YZUR | YearZeroRoll#modify<T2K> | dice[${i}] is out of bounds (mod: ${mod})`);
          }
        }
      }
      // 2 — Filters out all the base terms.
      //       This way, it will also remove leading operator terms.
      this.removeDice(100, 'base');

      // 3 — Reconstructs the base terms.
      const skilled = _terms.length > 1 && dice.length > 1;
      for (let index = 0; index < dice.length; index++) {
        const ti = Math.min(index, skilled ? 1 : 0);
        await this.addDice(1, getTypeFromRange(dice[index]), {
          range: dice[index],
          options: foundry.utils.deepClone(_terms[ti].options),
        });
      }
      // Note: reconstructed terms are evaluated
      // at the end of this method.
    }
    // MUTANT YEAR ZERO & FORBIDDEN LANDS
    // --------------------------------------------
    else if (['myz', 'fbl'].includes(this.game)) {
      // Modifies skill & neg dice.
      const skill = this.count('skill');
      const neg = Math.max(0, -mod - skill);
      await this.addDice(mod, 'skill');
      if (neg > 0) await this.addDice(neg, 'neg');

      // Balances skill & neg dice.
      while (this.count('skill') > 0 && this.count('neg') > 0) {
        this.removeDice(1, 'skill');
        this.removeDice(1, 'neg');
      }
    }
    // ALL OTHER GAMES (ALIEN RPG, CORIOLIS, VAESEN, TFTL, etc.)
    // --------------------------------------------
    else {
      const skill = this.count('skill');
      if (mod < 0) mod = Math.max(-skill + 1, mod); // Minimum of 1 skill die
      await this.addDice(mod, 'skill');
    }

    // --------------------------------------------

    // Re-evaluates all terms that were left unevaluated.
    if (this._evaluated) {
      for (const t of this.terms) {
        if (!t._evaluated) await t.evaluate();
      }
    }

    return this;
  }

  /* -------------------------------------------- */
  /*  Templating                                  */
  /* -------------------------------------------- */

  /** @override */
  async getTooltip() {
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
   * @returns {Promise<string>}
   * @async
   */
  async getRollInfos(template = null) {
    template = template ?? CONFIG.YZUR?.ROLL?.infosTemplate;
    const context = { roll: this };
    return renderTemplate(template, context);
  }

  /* -------------------------------------------- */

  /**
   * Renders a Roll instance to HTML.
   * @param {object}  [chatOptions]               An object configuring the behavior of the resulting chat message,
   *   which is also passed to the template
   * @param {string}  [chatOptions.user]          The ID of the user that renders the roll
   * @param {string}  [chatOptions.flavor]        The flavor of the message
   * @param {string}  [chatOptions.template]      The path to the template
   *   that renders the roll
   * @param {string}  [chatOptions.infosTemplate] The path to the template
   *   that renders the infos box under the roll tooltip
   * @param {boolean} [chatOptions.blind]         Whether this is a blind roll
   * @param {boolean} [chatOptions.isPrivate]     Whether this roll is private
   *   (displays sensitive infos with `???` instead)
   * @returns {Promise<string>}
   * @async
   * @override
   */
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
    if (!this._evaluated) await this.evaluate({ async: true });

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
      isPrivate,
      roll: this,
    };

    // Renders the roll display template.
    return renderTemplate(chatOptions.template, chatData);
  }

  /* -------------------------------------------- */

  /**
   * Transform a Roll instance into a ChatMessage, displaying the roll result.
   * This function can either create the ChatMessage directly, or return the data object that will be used to create.
   * @param {object}  [messageData]         The data object to use when creating the message
   * @param {string}  [messageData.user]    The ID of the user that sends the message
   * @param {object}  [messageData.speaker] The identified speaker data
   * @param {string}  [messageData.content] The HTML content of the message,
   *   overriden by the `roll.render()`'s returned content if left unchanged
   * @param {number}  [messageData.type=5]    The type to use for the message from `CONST.CHAT_MESSAGE_TYPES`
   * @param {string}  [messageData.sound]   The path to the sound played with the message (WAV format)
   * @param {options} [options]             Additional options which modify the created message.
   * @param {string}  [options.rollMode]    The template roll mode to use for the message from CONFIG.Dice.rollModes
   * @param {boolean} [options.create=true] Whether to automatically create the chat message,
   *   or only return the prepared chatData object.
   * @return {Promise<ChatMessage|ChatMessageData>} A promise which resolves to the created ChatMessage entity
   *   if create is true
   *   or the Object of prepared chatData otherwise.
   * @async
   * @override
   */
  async toMessage(messageData = {}, { rollMode = null, create = true } = {}) {
    messageData = foundry.utils.mergeObject({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker(),
      // "content" is overwritten by ChatMessage.create() (called in super)
      // with the HTML returned by roll.render(), but only if content is left unchanged.
      // So you can overwrite it here with a custom content in messageData.
      content: this.total,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      // sound: CONFIG.sounds.dice, // Already added in super.
    }, messageData);
    // messageData.roll = this; // Already added in super.
    return await super.toMessage(messageData, { rollMode, create });
  }

  /* -------------------------------------------- */
  /*  JSON                                        */
  /* -------------------------------------------- */

  /**
   * Creates a deep clone copy of the roll.
   * @returns {YearZeroRoll} A copy of this roll instance
   */
  duplicate() {
    return this.constructor.fromData(this.toJSON());
  }
}