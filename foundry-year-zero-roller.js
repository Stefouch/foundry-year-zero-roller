// Imports Modules.
import * as YZDice from './yearzero-dice.js';

// Imports Entities.

// Imports Applications.

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once('init', function() {
  // CONFIG.debug.hooks = true;

  // Copy that in your Hooks.once(init)
  YZDice.YearZeroRollManager.register('myz', {
    'ROLL.chatTemplate': 'systems/foundry-year-zero-roller/templates/dice/roll.hbs',
    'ROLL.tooltipTemplate': 'systems/foundry-year-zero-roller/templates/dice/tooltip.hbs',
    'ROLL.infosTemplate': 'systems/foundry-year-zero-roller/templates/dice/infos.hbs',
  });
  game.yzdice = YZDice;
});

Hooks.once('ready', function() {
  console.warn('YZRoll | READY!');

  // Debugging
  if (CONFIG.debug.hooks === true) {
    try {
      // Renders a starting actor or item.
      /** @type {Actor} *
      const startingActor = game.actors.get('PD9O4dYhP1ED6Pmp');
      startingActor.sheet.render(true);//*/
      /** @type {Actor} *
      const startingVehicle = game.actors.get('PqpLwMzCw6WTmsHx');
      startingVehicle.sheet.render(true);//*/
      /** @type {Item} *
      const startingItem = game.items.get('63JHOmp3e1HLbdrL');
      startingItem.sheet.render(true);//*/
    }
    catch (error) {
      console.warn('YZRoll | DEBUG | Cannot find starting Entity.', error);
    }
  }
});
