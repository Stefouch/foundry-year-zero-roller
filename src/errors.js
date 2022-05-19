/* -------------------------------------------- */
/*  Custom Errors                               */
/* -------------------------------------------- */

import YearZeroRollManager from './YearZeroRollManager.js';

export class GameTypeError extends TypeError {
  constructor(msg) {
    super(`Unknown game: "${msg}". Allowed games are: ${YearZeroRollManager.GAMES.join(', ')}.`);
    this.name = 'YZUR | GameType Error';
  }
}

export class DieTypeError extends TypeError {
  constructor(msg) {
    super(`Unknown die type: "${msg}". Allowed types are: ${Object.keys(CONFIG.YZUR.Dice.DIE_TYPES).join(', ')}.`);
    this.name = 'YZUR | DieType Error';
  }
}

// class RollError extends SyntaxError {
//   constructor(msg, obj) {
//     super(msg);
//     this.name = 'YZUR | Roll Error';
//     if (obj) console.error(obj);
//   }
// }
