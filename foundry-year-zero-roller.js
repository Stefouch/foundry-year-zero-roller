// Imports Modules.
import * as YZUR from './dist/yzur.js';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // CONFIG.debug.hooks = true;

  // Copy this in your Hooks.once('init')
  YZUR.YearZeroRollManager.register('br', {
    'ROLL.chatTemplate': 'systems/foundry-year-zero-roller/templates/dice/roll.hbs',
    'ROLL.tooltipTemplate': 'systems/foundry-year-zero-roller/templates/dice/tooltip.hbs',
    'ROLL.infosTemplate': 'systems/foundry-year-zero-roller/templates/dice/infos.hbs',
  });

  // Easy access in the game variable
  game.yzur = YZUR;
});

Hooks.once('ready', function () {
  CONFIG.debug.dice = true;
  // CONFIG.debug.hook = true;
  console.warn('YZ Roller Tester | READY!');
});

Hooks.on('renderChatLog', (app, html, _data) => {
  html.on('click', '.dice-button.push', _onPush);
});

async function _onPush(event) {
  event.preventDefault();

  // Gets the message.
  const chatCard = event.currentTarget.closest('.chat-message');
  const messageId = chatCard.dataset.messageId;
  const message = game.messages.get(messageId);

  // Gets the roll.
  const roll = message.roll.duplicate();

  // Pushes the roll.
  if (roll.pushable) {
    await roll.push({ async: true });
    roll.toMessage();
  }
}
