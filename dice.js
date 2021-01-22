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
 * `base`, `skill`, `gear`, `neg`, `stress`, `artoD8`, `artoD10`, `artoD12`, `ammo`
 * @typedef {string} DieTypeString
 */

/* -------------------------------------------- */
/*  Custom Dice Registration                    */
/* -------------------------------------------- */

/**
 * Registers all the Year Zero Dice.
 * 
 * You must call this method in `Hooks.once('init')`.
 * 
 * @param {?DieTypeString} game The game used (for the choice of die types to register). If omitted, registers all the dice.
 */
export function registerDice(game) {
	// Registers all the dice if `game` is omitted.
	if (!game) {
		// CONFIG.Dice.terms.b = BaseDie;
		// CONFIG.Dice.terms.s = SkillDie;
		// CONFIG.Dice.terms.g = GearDie;
		// CONFIG.Dice.terms.n = NegativeDie;
		// CONFIG.Dice.terms.x = StressDie;
		// CONFIG.Dice.terms['8'] = D8ArtifactDie;
		// CONFIG.Dice.terms['10'] = D10ArtifactDie;
		// CONFIG.Dice.terms['12'] = D12ArtifactDie;

		for (const g of YZRoller.GAMES) {
			const diceTypes = YZRoller.DIE_TYPES_MAP[g];
			for (const type of diceTypes) _registerDie(type);
		}
	}

	// Checks the game validity.
	if (!YZRoller.GAMES.includes(game)) throw new GameTypeError(game);

	// Registers the game's dice.
	const diceTypes = YZRoller.DIE_TYPES_MAP[game];
	for (const type of diceTypes) _registerDie(type);

	// Finally, registers our custom Roll class for Year Zero games.
	CONFIG.Dice.rolls[0] = YearZeroRoll;
}

/**
 * Registers a die in Foundry.
 * @param {DieTypeString} type Type of dice to register
 * @private
 */
function _registerDie(type) {
	const cls = YZRoller.DIE_TYPES[type];
	if (!(cls instanceof YearZeroDie)) throw new DieTypeError(type);

	const deno = cls.DENOMINATION;
	if (!deno) {
		throw new SyntaxError(`Undefined DENOMINATION for "${cls.name}".`);
	}

	// Registers the die in the Foundry CONFIG.
	CONFIG.Dice.terms[deno] = cls;
}


/* -------------------------------------------- */
/*  Custom YZ Roller class                      */
/* -------------------------------------------- */

/**
 * Helper class for creating a Year Zero Roll.
 */
export class YZRoller {
	/**
	 * @param {GameTypeString} game      The game used
	 * @param {?Object} opts             The options for the roll
	 * @param {?number} opts.base        The quantity of base dice
	 * @param {?number} opts.skill       The quantity of skill dice
	 * @param {?number} opts.gear        The quantity of gear dice
	 * @param {?number} opts.neg         The quantity of negative dice
	 * @param {?number} opts.stress      The quantity of stress dice
	 * @param {?number} opts.ammo        The quantity of ammo dice
	 * @param {?number} opts.artoD8      The quantity of artoD8 dice
	 * @param {?number} opts.artoD10     The quantity of artoD10 dice
	 * @param {?number} opts.artoD12     The quantity of artoD12 dice
	 * @param {number} [opts.maxPush=1]  The maximum number of pushes
	 */
	constructor(game = 'myz', {
		base = 0,
		skill = 0,
		gear = 0,
		neg = 0,
		stress = 0,
		ammo = 0,
		artoD8 = 0,
		artoD10 = 0,
		artoD12 = 0,
		maxPush = 1,
	} = {}) {
		const games = this.constructor.GAMES;
		if (!games.includes(game)) {
			throw new GameTypeError(game);
		}

		/**
		 * The game used.
		 * @type {GameTypeString}
		 */
		this.game = game;

		/**
		 * Quantities of dice.
		 * @type {Object<DieTypeString, number>}
		 */
		this.diceQuantities = {
			base, skill, gear, neg,
			stress, ammo,
			artoD8, artoD10, artoD12,
		};

		/**
		 * The maximum number of pushes.
		 * @type {number}
		 */
		this.maxPush = +maxPush;

		/**
		 * The roll in this roller.
		 * @type {YearZeroRoll}
		 * @private
		 */
		this._roll = undefined;

		// Creates the roll inside the roller.
		this._create();
	}

	/**
	 * The formula of this roll, to pass into a Roll class.
	 * @type {string}
	 * @readonly
	 */
	get formula() {
		const out = [];
		for (const [type, n] of Object.entries(this.diceQuantities)) {
			const cls = YZRoller.DIE_TYPES[type];
			const deno = cls.DENOMINATION;
			const str = `${n}d${deno}`;
			out.push(str);
		}
		return out.join(' + ');
	}

	/**
	 * The roll in this roller.
	 * @returns {YearZeroRoll}
	 * @readonly
	 */
	get roll() {
		return this._roll;
	}

	/**
	 * Creates a YearYearRoll object.
	 * @returns {YearZeroRoll}
	 * @private
	 */
	_create() {
		this._roll = new YearZeroRoll(this.formula, {
			game: this.game,
			maxPush: this.maxPush,
		});
		return this._roll;
	}

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
			'gear': GearDie,
			'neg': NegativeDie,
			'stress': StressDie,
			'arto': ArtifactDie,
			'artoD8': D8ArtifactDie,
			'artoD10': D10ArtifactDie,
			'artoD12': D12ArtifactDie,
		};
	}

	/**
	 * Die Types mapped with Games.
	 * @type {Object<GameTypeString, DieTypeString[]>}
	 * @constant
	 * @readonly
	 * @static
	 */
	static DIE_TYPES_MAP = {
		// Mutant Year Zero
		'myz': ['base', 'skill', 'gear'],
		// Forbidden Lands
		'fbl': ['base', 'skill', 'gear', 'artoD8', 'artoD10', 'artoD12'],
		// Alien RPG
		'alien': ['skill', 'stress'],
		// Tales From the Loop
		'tales': ['skill'],
		// Coriolis
		'cor': ['skill'],
		// Vaesen
		'vae': ['skill'],
		// Twilight 2000 //TODO
		't2k': [null, 'ammo'],
	};

	/**
	 * @type {GameTypeString[]}
	 * @constant
	 * @readonly
	 * @static
	 */
	static GAMES = Object.keys(YZRoller.DIE_TYPES_MAP);
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
	 * @param {string} data._id      The ID of the roll
	 * @param {string} data.game     The game used
	 * @param {number} data.maxPush  The maximum number of times the roll can be pushed
	 */
	constructor(formula, data = {}) {
		super(formula, data);

		if (!this.data._id) {
			Object.defineProperty(this.data, '_id', {
				value: randomID(6),
				enumerable: false,
				configurable: false,
				writable: false,
			});
		}

		console.warn(this);
	}

	/**
	 * The ID number of the roll.
	 * @type {string}
	 * @readonly
	 * @private
	 */
	get _id() {
		return this.data._id;
	}

	/**
	 * The game used.
	 * @type {string}
	 * @readonly
	 */
	get game() {
		if (!this.data.game) return YZRoller.GAMES[0];
		return this.data.game;
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
	 * Whether the roll was pushed or not.
	 * @type {boolean}
	 * @readonly
	 */
	get pushed() {
		return this.data.pushCount > 0;
	}

	/**
	 * Tells if the roll is pushable.
	 * @type {boolean}
	 * @readonly
	 */
	get pushable() {
		return (
			this.data.pushCount < this.data.maxPush
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
		console.warn('YZRoll | YearZeroRoll#successCount is deprecated. Use #total instead.')
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

	/**
	 * Pushes the roll, following the YZ rules.
	 * @returns {YearZeroRoll} This roll, pushed
	 */
	push() {
		// TODO
		console.error('Unfinished');
		if (!this.pushable) return this;
		// this.terms.forEach(t => t.push());
		// this.evaluate();
	}

	/**
	 * Gets all the dice terms of a certain type.
	 * @param {DieTypeString} type Die type to search
	 * @returns {DiceTerm[]}
	 */
	getTerms(type) {
		// const cls = DIE_TYPES[type];
		// if (!cls) throw new TypeError(`Year Zero Roll | Die type unknown: "${type}".`);
		return this.terms.filter(t => t.type === type);
	}

	/**
	 * Counts the values of a certain type in the roll.
	 * If `seed` is omitted, counts all the dice of a certain type.
	 * @param {DieTypeString} type The type of the die
	 * @param {number} seed The number to search, if any
	 * @returns {number} Total count
	 */
	count(type, seed) {
		if (seed != null) {
			return this.terms.reduce((c, t) => {
				if (t.type !== type) return c;
				for (const r of t.results) {
					if (!r.active) continue;
					if (r.result === seed) c++;
				}
				return c;
			}, 0);

		}
		return this.terms.reduce((c, t) => t.type === type ? c + t.number : c, 0);
		// return this.getTerms(type).reduce((c, t) => c + t.number, 0);
	}

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
				// const isMax = r.result === d.faces;
				// const isMin = r.result === 1;
				let isMax = false, isMin = false;
				if (d instanceof NegativeDie) {
					isMax = false;
					isMin = r.result === 6;
				}
				else {
					isMax = r.result === d.faces || r.count >= 6;
					isMin = r.result === 1 && !(d instanceof SkillDie);
				}
				// <== END MODIFIED PART
				return {
				result: cls.getResultLabel(r.result),
				classes: [
					cls.name.toLowerCase(),
					"d" + d.faces,
					r.success ? "success" : null,
					r.failure ? "failure" : null,
					r.rerolled ? "rerolled" : null,
					r.exploded ? "exploded" : null,
					r.discarded ? "discarded" : null,
					!(hasSuccess || hasFailure) && isMin ? "min" : null,
					!(hasSuccess || hasFailure) && isMax ? "max" : null
				].filter(c => c).join(" ")
				}
			})
			};
		});
		return renderTemplate(this.constructor.TOOLTIP_TEMPLATE, { parts });
	}
}

/* -------------------------------------------- */
/*  Custom Dice Classes                         */
/* -------------------------------------------- */

export class YearZeroDie extends Die {
	constructor(termData) {
		termData.faces = termData.faces || 6;
		super(termData);

		if (!this.options.flavor) {
			const cls = this.constructor.name;
			this.options.flavor = game.i18n.localize(`YZDIE.${cls}`);
		}
	}

	/**
	 * The type of the die.
	 * @type {DieTypeString}
	 * @readonly
	 */
	get type() {
		return undefined;
	}

	/**
	 * Whether the die can be pushed (according to its type).
	 * @type {boolean}
	 * @readonly
	 */
	get pushable() {
		for (const r of this.results) {
			if (!r.active || r.discarded) continue;
			if (!this.constructor.LOCKED_VALUES.includes(r.result)) {
				return true;
			}
		}
		return true;
	}

	/**
	 * Number of times this die has been pushed.
	 * @type {number}
	 * @readonly
	 */
	get pushCount() {
		return this.results.reduce((c, r) => c + (r.pushed ? 1 : 0), 0);
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

	push() {
		let count = 0;
		for (const r of this.results) {
			if (!r.active) continue;
			if (!this.constructor.LOCKED_VALUES.includes(r.result)) {
				r.active = false;
				r.discarded = true;
				r.pushed = true;
				count++;
			}
		}
		for (; count > 0; count--) this.roll();
		return this;
	}

	count(n) {
		return this.values.filter(v => v === n).length;
	}

	/** @override */
	static getResultLabel(result) {
		if (result === 6) return '☢';
		if (result === 1) return '☣';
		return result;
	}

	static LOCKED_VALUES = [6];
	static MODIFIERS = mergeObject(
		{ 'p' : 'push' },
		Die.MODIFIERS,
	);
}

export class BaseDie extends YearZeroDie {
	get type() { return 'base'; }
	static DENOMINATION = 'b';
	static LOCKED_VALUES = [1, 6];
}

export class SkillDie extends YearZeroDie {
	get type() { return 'skill'; }
	static DENOMINATION = 's';
	/** @override */
	static getResultLabel(result) {
		return result >= 6 ? '☢' : result;
	}
}

export class GearDie extends YearZeroDie {
	get type() { return 'gear'; }
	static DENOMINATION = 'g';
	static LOCKED_VALUES = [1, 6];
}

export class NegativeDie extends SkillDie {
	get type() { return 'neg'; }
	/** @override */
	roll(options) {
		const roll = super.roll(options);
		roll.count = roll.result >= 6 ? -1 : 0;
		this.results[this.results.length - 1] = roll;
		return roll;
	}
	static DENOMINATION = 'n';
}

export class StressDie extends YearZeroDie {
	get type() { return 'stress'; }
	static DENOMINATION = 'x';
	static LOCKED_VALUES = [1, 6];
	/** @override */
	static getResultLabel(result) {
		if (result >= 6) return '☢';
		if (result === 1) return '⚠️';
		return result;
	}
}

/* -------------------------------------------- */

export class ArtifactDie extends SkillDie {
	get type() { return 'arto'; }
	/** @override */
	roll(options) {
		const roll = super.roll(options);
		if (roll.result < ArtifactDie.SUCCESS_TABLE.length) {
			roll.count = ArtifactDie.SUCCESS_TABLE[roll.result];
		}
		this.results[this.results.length - 1] = roll;
		return roll;
	}
	/** @override */
	static getResultLabel(result) {
		if (result >= 6 && result < ArtifactDie.SUCCESS_TABLE.length) {
			const n = ArtifactDie.SUCCESS_TABLE[result];
			return '•'.repeat(n); //⚔️
		}
		return result;
	}
	static SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4];
	static LOCKED_VALUES = [6, 7, 8, 9, 10, 11, 12];
}

export class D8ArtifactDie extends ArtifactDie {
	constructor(termData) {
		termData.faces = 8;
		super(termData);
	}
	static DENOMINATION = '8';
}

export class D10ArtifactDie extends ArtifactDie {
	constructor(termData) {
		termData.faces = 10;
		super(termData);
	}
	static DENOMINATION = '10';
}

export class D12ArtifactDie extends ArtifactDie {
	constructor(termData) {
		termData.faces = 12;
		super(termData);
	}
	static DENOMINATION = '12';
}

/* -------------------------------------------- */
/*  Custom Errors                               */
/* -------------------------------------------- */

class GameTypeError extends TypeError {
	constructor(msg) {
		super(`Unknown game: "${msg}". Allowed games are: ${YZRoller.GAMES.join(', ')}.`);
		this.name = 'YZ GameType Error';
	}
}

class DieTypeError extends TypeError {
	constructor(msg) {
		super(`Unknown die type: "${msg}". Allowed types are: ${Object.keys(YZRoller.DIE_TYPES).join(', ')}.`);
		this.name = 'YZ DieType Error';
	}
}

/* -------------------------------------------- */
/*  Util Methods                                */
/* -------------------------------------------- */

/**
 * Generates a string of random alphanumeric characters.
 * @param {number} [length=4] Number of characters to return
 */
function randomID(length = 4) {
	return Math.random().toString(36).substr(2, (length || 4));
}