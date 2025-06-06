/* -------------------------------------------- */
/*  Custom Dice classes                         */
/* -------------------------------------------- */

/** @typedef {import('./constants').DieTypeString} DieTypeString */
/** @typedef {import('./constants').YearZeroDieTermResult} YearZeroDieTermResult */

/**
 * Custom Die class for Year Zero games.
 * @extends {foundry.dice.terms.Die} The Foundry Die class
 */
export class YearZeroDie extends foundry.dice.terms.Die {
  constructor(termData = {}) {
    termData.faces = Number.isInteger(termData.faces) ? termData.faces : 6;
    super(termData);

    if (this.maxPush == undefined) {
      this.maxPush = termData.maxPush ?? 1;
    }
  }

  /**
   * The denomination of the die.
   * @type {string}
   * @readonly
   */
  get denomination() {
    return this.constructor.DENOMINATION;
  }

  /**
   * The type of the die.
   * @type {DieTypeString}
   * @readonly
   */
  get type() {
    return this.constructor.TYPE;
  }

  /**
   * Whether the die can be pushed (according to its type).
   * @type {boolean}
   * @readonly
   */
  get pushable() {
    if (this.pushCount >= this.maxPush) return false;
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
    return this.results.reduce((c, r) => Math.max(c, r.indexPush || 0), 0);
  }

  /**
   * Whether this die has been pushed.
   * @type {boolean}
   * @readonly
   */
  get pushed() {
    return this.pushCount > 0;
  }

  /**
   * Tells if it's a YearZero Die.
   * @type {boolean}
   * @readonly
   */
  get isYearZeroDie() {
    // return this instanceof YearZeroDie;
    return true;
  }

  /**
   * Number of successes rolled.
   * @type {number}
   * @readonly
   */
  get success() {
    if (!this._evaluated) return undefined;
    const s = this.results.reduce((tot, r) => {
      if (!r.active) return tot;
      if (r.count !== undefined) return tot + r.count;
      if (this.constructor.SUCCESS_TABLE) {
        return tot + this.constructor.SUCCESS_TABLE[r.result];
      }
      return tot + (r.result >= 6 ? 1 : 0);
    }, 0);
    return this.type === 'neg' ? -s : s;
  }

  /**
   * Number of banes rolled.
   * @type {number}
   * @readonly
   */
  get failure() {
    if (!this._evaluated) return undefined;
    return this.results.reduce((tot, r) => {
      if (!r.active) return tot;
      return tot + (r.result <= 1);
    }, 0);
  }

  /* -------------------------------------------- */

  /** 
   * Rolls the DiceTerm by mapping a random uniform draw against the faces of the dice term.
   * @param {Object}  [options={}]             Options which modify how a random result is produced
   * @param {boolean} [options.minimize=false] Minimize the result, obtaining the smallest possible value
   * @param {boolean} [options.maximize=false] Maximize the result, obtaining the smallest possible value
   * @returns {Promise<YearZeroDieTermResult>} The produced result
   * @see (Foundry) {@link https://foundryvtt.com/api/DiceTerm.html#roll|DiceTerm.roll}
   * @override
   */
  async roll(options = {}) {
    // Modifies the result.
    const roll = await super.roll(options);

    // Stores indexes
    roll.indexResult = options.indexResult;
    if (roll.indexResult == undefined) {
      roll.indexResult = 1 + this.results.reduce((c, r) => {
        let i = r.indexResult;
        if (i == undefined) i = -1;
        return Math.max(c, i);
      }, -1);
    }
    roll.indexPush = options.indexPush ?? this.pushCount;

    // Overwrites the result.
    this.results[this.results.length - 1] = roll;
    return roll;
  }

  /* -------------------------------------------- */

  /**
   * Counts the number of times a single value appears.
   * @param {number} n The single value to count
   * @returns {number}
   */
  count(n) {
    return this.values.filter(v => v === n).length;
  }

  /* -------------------------------------------- */

  /**
   * Pushes the dice.
   * @returns {YearZeroDie} this dice, pushed
   */
  push() {
    if (!this.pushable) return this;
    const indexPush = this.pushCount + 1;
    const indexesResult = [];
    for (const r of this.results) {
      if (!r.active || r.locked) continue;
      if (!this.constructor.LOCKED_VALUES.includes(r.result)) {
        // Removes the die from the total score.
        r.active = false;
        // Greys-out the die in the chat tooltip.
        r.discarded = true;
        // Marks the die as pushed.
        r.pushed = true;
        // Hides the die for DsN.
        r.hidden = true;
        // Stores the die's index for the chat tooltip.
        indexesResult.push(r.indexResult);
      }
      else {
        // Hides the die for DsN.
        r.hidden = true;
      }
    }

    // Then, rolls a new die for each pushed die.
    // With the indexes as options.
    for (let i = 0; i < indexesResult.length; i++) {
      this.roll({
        indexResult: indexesResult[i],
        indexPush,
      });
    }
    return this;
  }

  /* -------------------------------------------- */
  /*  Term Modifiers                              */
  /* -------------------------------------------- */

  /**
   * Roll Modifier method that blocks pushes.
   */
  nopush() {
    this.maxPush = 0;
  }

  /**
   * Roll modifier method that sets the max number of pushes.
   * @param {string} modifier
   */
  setpush(modifier) {
    const rgx = /p([0-9]+)?/i;
    const match = modifier.match(rgx);
    if (!match) return false;
    let [, max] = match;
    max = parseInt(max) ?? 1;
    this.maxPush = max;
  }

  /* -------------------------------------------- */
  /*  Dice Term Methods                           */
  /* -------------------------------------------- */

  /** 
   * Returns a string used as the label for each rolled result.
   * @param {YearZeroDieTermResult} result The rolled result
   * @returns {string} The result label
   * @see (FoundryVTT) {@link https://foundryvtt.com/api/DiceTerm.html#getResultLabel|DiceTerm.getResultLabel}
   * @override
   */
  getResultLabel(result) {
    // Do not forget to stringify the label because
    // numbers return an error with DiceSoNice!
    return CONFIG.YZUR.Icons.getLabel(
      this.constructor.TYPE,
      result.result,
    );
  }

  /**
   * Gets the CSS classes that should be used to display each rolled result.
   * @param {YearZeroDieTermResult} result The rolled result
   * @returns {string[]} The desired classes
   * @see (FoundryVTT) {@link https://foundryvtt.com/api/DiceTerm.html#getResultCSS|DiceTerm.getResultCSS}
   * @override
   */
  getResultCSS(result) {
    // This is copy-pasted from the source code,
    // with modified parts between ==> arrows <==.
    const hasSuccess = result.success !== undefined;
    const hasFailure = result.failure !== undefined;
    //* Refactors the isMin & isMax for YZE dice.
    // const isMax = result.result === this.faces;
    // const isMin = result.result === 1;
    let isMax = false, isMin = false;
    if (this.type === 'neg') {
      isMax = false;
      isMin = result.result === 6;
    }
    else if (this instanceof YearZeroDie) {
      const noMin = ['skill', 'arto', 'loc'];
      isMax = result.result === this.faces || result.result >= 6;
      isMin = result.result === 1 && !noMin.includes(this.type);
    }
    else {
      isMax = result.result === this.faces;
      isMin = result.result === 1;
    }
    //* <==
    return [
      this.constructor.name.toLowerCase(),
      'd' + this.faces,
      //* ==>
      // result.success ? 'success' : null,
      // result.failure ? 'failure' : null,
      hasSuccess ? 'success' : null,
      hasFailure ? 'failure' : null,
      //* <==
      result.rerolled ? 'rerolled' : null,
      result.exploded ? 'exploded' : null,
      result.discarded ? 'discarded' : null,
      //* ==>
      //* Adds a CSS property for pushed dice.
      result.pushed ? 'pushed' : null,
      //* <==
      !(hasSuccess || hasFailure) && isMin ? 'min' : null,
      !(hasSuccess || hasFailure) && isMax ? 'max' : null,
    ];
  }

  /** 
   * Renders the tooltip HTML for a Roll instance.
   * @returns {Object} The data object used to render the default tooltip template for this DiceTerm
   * @see (FoundryVTT) {@link https://foundryvtt.com/api/DiceTerm.html#getTooltipData|DiceTerm.getTooltipData}
   * @override
   */
  getTooltipData() {
    // This is copy-pasted from the source code,
    // with modified parts between ==> arrows <==.
    return {
      formula: this.expression,
      //* ==>
      // total: this.total,
      total: this.success,
      banes: this.failure,
      //* <==
      faces: this.faces,
      //* ==>
      //* Adds the number of dice, used in the chat for the pushed dice matrix.
      number: this.number,
      //* Adds the type, for sorting options.
      type: this.type,
      //* Adds whether its a YearZeroDie.
      isYearZeroDie: this.isYearZeroDie,
      //* Adds a default flavor for the die.
      // flavor: this.flavor,
      flavor: this.options.flavor ?? (
        CONFIG.YZUR?.Dice?.localizeDieTerms
          ? game.i18n.localize(`YZUR.DIETERMS.${this.constructor.name}`)
          : null
      ),
      //* <==
      rolls: this.results.map(r => {
        return {
          result: this.getResultLabel(r),
          classes: this.getResultCSS(r).filterJoin(' '),
          //* ==>
          //* Adds row and col indexes.
          row: r.indexPush,
          col: r.indexResult,
          //* <==
        };
      }),
    };
  }
}

/**
 * The type of the die.
 * @type {string}
 * @constant
 * @static
 */
YearZeroDie.TYPE = 'blank';

/**
 * An array of values that disallow the die to be pushed.
 * @type {number[]}
 * @constant
 * @static
 */
YearZeroDie.LOCKED_VALUES = [6];

/**
 * An array of additional attributes which should be retained when the term is serialized.
 * Addition: **maxPush**
 * @type {string[]}
 * @constant
 * @static
 * @inheritdoc
 */
YearZeroDie.SERIALIZE_ATTRIBUTES.push('maxPush');

/** @inheritdoc */
YearZeroDie.MODIFIERS = foundry.utils.mergeObject(
  {
    'p' : 'setpush',
    'np': 'nopush',
  },
  foundry.dice.terms.Die.MODIFIERS,
);

/* -------------------------------------------- */

/**
 * Base Die: 1 & 6 cannot be re-rolled.
 * @extends {YearZeroDie}
 * @category OTHER DICE
 */
export class BaseDie extends YearZeroDie {}
BaseDie.TYPE = 'base';
BaseDie.DENOMINATION = 'b';
BaseDie.LOCKED_VALUES = [1, 6];

/**
 * Skill Die: 6 cannot be re-rolled.
 * @extends {YearZeroDie}
 * @category OTHER DICE
 */
export class SkillDie extends YearZeroDie {}
SkillDie.TYPE = 'skill';
SkillDie.DENOMINATION = 's';

/**
 * Gear Die: 1 & 6 cannot be re-rolled.
 * @extends {YearZeroDie}
 * @category OTHER DICE
 */
export class GearDie extends YearZeroDie {}
GearDie.TYPE = 'gear';
GearDie.DENOMINATION = 'g';
GearDie.LOCKED_VALUES = [1, 6];

/**
 * Negative Die: 6 cannot be re-rolled.
 * @extends {SkillDie}
 * @category OTHER DICE
 */
export class NegativeDie extends SkillDie {}
NegativeDie.TYPE = 'neg';
NegativeDie.DENOMINATION = 'n';

/* -------------------------------------------- */

/**
 * Stress Die: 1 & 6 cannot be re-rolled.
 * @extends {YearZeroDie}
 * @category OTHER DICE
 */
export class StressDie extends YearZeroDie {}
StressDie.TYPE = 'stress';
StressDie.DENOMINATION = 'z';
StressDie.LOCKED_VALUES = [1, 6];

/* -------------------------------------------- */

/**
 * Artifact Die: 6+ cannot be re-rolled.
 * @extends {SkillDie}
 * @category OTHER DICE
 */
export class ArtifactDie extends SkillDie {
  /** @override */
  getResultLabel(result) {
    return CONFIG.YZUR.Icons.getLabel(
      `d${this.constructor.DENOMINATION}`,
      result.result,
    );
  }
}
ArtifactDie.TYPE = 'arto';
ArtifactDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4];
ArtifactDie.LOCKED_VALUES = [6, 7, 8, 9, 10, 11, 12];

export class D8ArtifactDie extends ArtifactDie {
  constructor(termData = {}) {
    termData.faces = 8;
    super(termData);
  }
}
D8ArtifactDie.DENOMINATION = '8';

export class D10ArtifactDie extends ArtifactDie {
  constructor(termData = {}) {
    termData.faces = 10;
    super(termData);
  }
}
D10ArtifactDie.DENOMINATION = '10';

export class D12ArtifactDie extends ArtifactDie {
  constructor(termData = {}) {
    termData.faces = 12;
    super(termData);
  }
}
D12ArtifactDie.DENOMINATION = '12';

/* -------------------------------------------- */

/**
 * Twilight Die: 1 & 6+ cannot be re-rolled.
 * @extends {ArtifactDie} But LOCKED_VALUES are not the same
 * @category OTHER DICE
 */
export class TwilightDie extends ArtifactDie {
  /** @override */
  getResultLabel(result) {
    return CONFIG.YZUR.Icons.getLabel('base', result.result);
  }
}
TwilightDie.TYPE = 'base';
TwilightDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2];
TwilightDie.LOCKED_VALUES = [1, 6, 7, 8, 9, 10, 11, 12];

export class D6TwilightDie extends TwilightDie {
  constructor(termData = {}) {
    termData.faces = 6;
    super(termData);
  }
}
D6TwilightDie.DENOMINATION = '6';

export class D8TwilightDie extends TwilightDie {
  constructor(termData = {}) {
    termData.faces = 8;
    super(termData);
  }
}
D8TwilightDie.DENOMINATION = '8';

export class D10TwilightDie extends TwilightDie {
  constructor(termData = {}) {
    termData.faces = 10;
    super(termData);
  }
}
D10TwilightDie.DENOMINATION = '10';

export class D12TwilightDie extends TwilightDie {
  constructor(termData = {}) {
    termData.faces = 12;
    super(termData);
  }
}
D12TwilightDie.DENOMINATION = '12';

/* -------------------------------------------- */

/**
 * Ammunition Die for Twilight 2000.
 * @extends {YearZeroDie}
 * @category OTHER DICE
 */
export class AmmoDie extends YearZeroDie {
  constructor(termData = {}) {
    termData.faces = 6;
    super(termData);
  }
}
AmmoDie.TYPE = 'ammo';
AmmoDie.DENOMINATION = 'm';
AmmoDie.LOCKED_VALUES = [1, 6];

/* -------------------------------------------- */

/**
 * Location/Hit Die for Twilight 2000.
 * @extends {YearZeroDie}
 * @category OTHER DICE
 */
export class LocationDie extends YearZeroDie {
  constructor(termData = {}) {
    termData.faces = 6;
    super(termData);
  }
  /** @override */
  get pushable() { return false; }

  /** @override */
  roll(options) {
    const roll = super.roll(options);
    roll.count = 0;
    this.results[this.results.length - 1] = roll;
    return roll;
  }
}
LocationDie.TYPE = 'loc';
LocationDie.DENOMINATION = 'l';
LocationDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 0];
LocationDie.LOCKED_VALUES = [1, 2, 3, 4, 5, 6];

/* -------------------------------------------- */

/**
 * BladeRunner Die: 1 cannot be re-rolled.
 * @extends {ArtifactDie} But LOCKED_VALUES are not the same
 * @category OTHER DICE
 */
export class BladeRunnerDie extends ArtifactDie {
  /** @override */
  getResultLabel(result) {
    return CONFIG.YZUR.Icons.getLabel('base', result.result);
  }
}
BladeRunnerDie.TYPE = 'base';
BladeRunnerDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2];
BladeRunnerDie.LOCKED_VALUES = [1];

export class D6BladeRunnerDie extends BladeRunnerDie {
  constructor(termData = {}) {
    termData.faces = 6;
    super(termData);
  }
}
D6BladeRunnerDie.DENOMINATION = '6';
D6BladeRunnerDie.LOCKED_VALUES = [1, 6];

export class D8BladeRunnerDie extends BladeRunnerDie {
  constructor(termData = {}) {
    termData.faces = 8;
    super(termData);
  }
}
D8BladeRunnerDie.DENOMINATION = '8';
D8BladeRunnerDie.LOCKED_VALUES = [1, 6, 7, 8];

export class D10BladeRunnerDie extends BladeRunnerDie {
  constructor(termData = {}) {
    termData.faces = 10;
    super(termData);
  }
}
D10BladeRunnerDie.DENOMINATION = '10';
D10BladeRunnerDie.LOCKED_VALUES = [1, 10];

export class D12BladeRunnerDie extends BladeRunnerDie {
  constructor(termData = {}) {
    termData.faces = 12;
    super(termData);
  }
}
D12BladeRunnerDie.DENOMINATION = '12';
D12BladeRunnerDie.LOCKED_VALUES = [1, 10, 11, 12];
