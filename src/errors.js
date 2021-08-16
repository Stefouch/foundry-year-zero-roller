/* -------------------------------------------- */
/*  Custom Errors                               */
/* -------------------------------------------- */

import YearZeroRollManager from './YearZeroRollManager.js';

export class GameTypeError extends TypeError {
  constructor(msg) {
    super(`Unknown game: "${msg}". Allowed games are: ${YearZeroRollManager.GAMES.join(', ')}.`);
    this.name = 'YZ GameType Error';
  }
}

export class DieTypeError extends TypeError {
  constructor(msg) {
    super(`Unknown die type: "${msg}". Allowed types are: ${Object.keys(CONFIG.YZUR.DICE.DIE_TYPES).join(', ')}.`);
    this.name = 'YZ DieType Error';
  }
}

// class RollError extends SyntaxError {
//   constructor(msg, obj) {
//     super(msg);
//     this.name = 'YZ Roll Error';
//     if (obj) console.error(obj);
//   }
// }