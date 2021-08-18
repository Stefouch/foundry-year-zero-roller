<h1 align="center">YZUR<br/>Year Zero Universal Roller</h1>
<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/dynamic/json?color=blue&label=version&query=version&url=https%3A%2F%2Fraw.githubusercontent.com%2FStefouch%2Ffoundry-year-zero-roller%2Fmaster%2Fsystem.json"/>
  <a href="https://foundryvtt.com" target="_blank">
    <img alt="Foundry Version" src="https://img.shields.io/badge/dynamic/json?color=blue&label=Foundry&query=compatibleCoreVersion&url=https%3A%2F%2Fraw.githubusercontent.com%2FStefouch%2Ffoundry-year-zero-roller%2Fmaster%2Fsystem.json"/>
  </a>
  <a href="https://github.com/Stefouch/foundry-year-zero-roller/releases">
    <img alt="Downloads" src="https://img.shields.io/github/downloads/Stefouch/foundry-year-zero-roller/latest/master.zip"/>
  </a>
  <a href="https://github.com/Stefouch/foundry-year-zero-roller/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg"/>
  </a>
  <a href="https://github.com/Stefouch/foundry-year-zero-roller/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/Stefouch/foundry-year-zero-roller"/>
  </a>
  <a href="https://www.patreon.com/Stefouch">
    <img src="https://img.shields.io/badge/donate-patreon-F96854.svg" alt="Patreon">
  </a>
  <a href="https://twitter.com/stefouch" target="_blank">
    <img alt="Twitter: stefouch" src="https://img.shields.io/twitter/follow/stefouch.svg?style=social"/>
  </a>
</p>

This is a collection of helper methods and classes for rolling **Year Zero Engine** dice in the Foundry VTT.

Features:

- Simple integration: add the `yzur.js` and the `/templates` in your project and initialize them in your main init script.
- Documented methods.
- Support for all Year Zero games.
- Custom Roll class with many extra getters for stunts, banes, traumas, gear damage, mishaps, ammo, etc.
- Custom DiceTerm classes for each Year Zero dice.
- Push support (except Alien atm).
- Custom roll template with push stack and push button.
- Customisable settings.
- Compatible with Foundry 0.8.8
- Compatible with Dice So Nice!

Not included:

- Roll dialog.
- Chat Message push button listener (you have to create one and call the roll.push() method, see example below).
- Dice So Nice configuration.

# How to Set Up

1. Copy the following files and folders in your Foundry system:

```css
lib/
  yzur.js
templates/
  dice/
    infos.hbs
    roll.hbs
    tooltip.hbs
```

2. In your main script, import the library:

```js
import { YearZeroRollManager } from './dist/yzur.js';
```

3. In your init hook, initialize the dice with the `.register()` method.<br/>
• Replace `'<your_game>'` with the code of the game to be used.<br/>
• The second argument is an object of options. Add there the paths to the three templates and your own custom settings.

```js
Hooks.once('init', function() {

  YearZeroRollManager.register('<your_game>', {
    'ROLL.chatTemplate': 'systems/your_system/templates/dice/roll.hbs',
    'ROLL.tooltipTemplate': 'systems/your_system/templates/dice/tooltip.hbs',
    'ROLL.infosTemplate': 'systems/your_system/templates/dice/infos.hbs',
  });

});
```

4. The settings are stored in the Foundry's `CONFIG.YZUR` global variable. For more details and how to customize them, see the constant `"YZUR"` in the `yzur.js` library.

# How to Use

## Roll

Use the `YearZeroRoll` class, which extends the default Foundry's Roll class.

Either create your own formula with it, or use the `.createFromDiceQuantities()` static method.

```js
import { YearZeroRoll } from './lib/yzur.js';

// Set the dice quantities.
let dice = {
  base: 5,
  skill: 3,
  gear: 2,
};

// Set options for the roll.
let options = {
  name: 'My Super Year Zero Roll',
  maxPush: 1,
};

// Create a roll. Use any of the following methods:
let roll;
roll = Roll.create('<my_formula>', { yzur: true });
roll = YearZeroRoll.create('<my_formula>');
roll = new YearZeroRoll('<my_formula>', data, options);
roll = YearZeroRoll.createFromDiceQuantities(dice);

// Roll the roll, same methods as usual
await roll.roll({ async: true });
await roll.toMessage();
```

## Modify

The `.modify(n)` method allows you to add a difficulty modifier to the roll.

```js
let roll = YearZeroRoll.createFromDiceQuantities(dice);

// Modify the roll.
let modifier = -1;
roll.modify(modifier);

// Roll and send.
await roll.roll({ async: true });
await roll.toMessage();
```

There are also two other methods to change the quantity of dice in the roll:

```js
// Add dice.
await roll.addDice(1, 'skill');

// Remove dice.
roll.removeDice(1, 'skill');
```

## Push

```js
let roll = YearZeroRoll.createFromDiceQuantities(dice);

// Push the roll.
await roll.push({ async: true });
```

### Push from the Chat

Add a listener to the button in the chat to get the roll and push it. See example below.

```js
Hooks.on('renderChatLog', (app, html, data) => {
  html.on('click', '.dice-button.push', _onPush);
});

async function _onPush(event) {
  event.preventDefault();

  // Get the message.
  let chatCard = event.currentTarget.closest('.chat-message');
  let messageId = chatCard.dataset.messageId;
  let message = game.messages.get(messageId);

  // Copy the roll.
  let roll = message.roll.duplicate();

  // Delete the previous message.
  await message.delete();

  // Push the roll and send it.
  await roll.push({ async: true });
  await roll.toMessage();
}
```

If you don't want to create a new message and instead edit the current message, you must call an update for the changes:

```js
// Update the message (it triggers its rendering).
await message.update({ roll: JSON.stringify(pushedRoll) });
```

## Custom Template

To dynamically use another template for the roll message, you can use this trick:

```js
let templateData = {
  template: "path_to_my_custom_template.hbs",
  flavor: "my_custom_roll_flavor",
  // ...more details see YearZeroRoll#render()...
};

let messageData = {
  content: await roll.render(templateData):,
  speaker: ChatMessage.getSpeaker({ actor });
};

let rollMode = game.settings.get('core', 'rollMode');

await roll.toMessage(messageData, { rollMode });
```

# Supported Games

| Game | Code | Dice & Denominations |
| :-- | :-- | :-- |
| Alien RPG | `alien` | `skill: s`<br/>`stress: z` |
| Coriolis: The Third Horizon | `cor` | `skill: s` |
| Forbidden Lands | `fbl` | `base: b`<br/>`skill: s`<br/>`gear: g`<br/>`neg: n`<br/>`artoD8: 8`<br/>`artoD10: 10`<br/>`artoD12: 12` |
| Mutant: Year Zero | `myz` | `base: b`<br/>`skill: s`<br/>`gear: g`<br/>`neg: n` |
| Tales From the Loop | `tales` | `skill: s` |
| Twilight 2000 (4th Edition) | `t2k` | `a: a`<br/>`b: b`<br/>`c: c`<br/>`d: d`<br/>`ammo: m`<br/>`loc: l` |
| Vaesen | `vae` | `skill: s` |

### Examples of commands in the chat

**FBL** — Roll 5 base dice, 3 skill dice, 2 gear dice and one D12 artifact die:

```
/roll 5db + 3ds + 2dg + 1d12
```

**Alien** — Roll 7 dice and 1 stress die:

```
/roll 7ds + 1dz
```

**Vaesen** — Roll 6 dice:

```
/roll 6ds
```

**Twilight 2000** — Roll a D10, a D8, 3 ammo dice and a location die:

```
/roll 1d10 + 1d8 + 3dm + 1dl
```

**Custom Pushes** — Set the max number of pushes:

```
/roll 5dbnp   5 base dice     (no push)
/roll 3dsp0   3 skill dice    (max 0 push)
/roll 3dgp3   3 gear dice     (max 3 pushes)
/roll 3dbp3 + 3dsp2 + 3dgnp   (can be combined)
```

<small><i>Note: For full-auto fire, you can add the modifier <code>p100</code>.</i></small>

# Dice So Nice

DsN is supported but not configured. See the [API](https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/wikis/API/Customization) for how to create a proper configuration for your custom dice.

# Author

<p align="center">
  <a href="https://stefouch.be" target="_blank">
    <img src="https://github.com/Stefouch/t2k4e/raw/master/assets/stefouch-banner.png" alt="Stefouch Gaming Lab" style="width: auto; height: auto; max-height: 100px;"/>
  </a>
</p>

### 👤 Stefouch

* **Twitter:** [@stefouch](https://twitter.com/stefouch)
* **Github:** [@Stefouch](https://github.com/Stefouch)
* **Discord:** Stefouch#5202
  * [Year Zero Worlds](https://discord.gg/RnaydHR)
  * [The Foundry](https://discord.gg/8yAKUHZZKE)

# 🙏 Show Your Support

Give a ⭐️ if this project helped you!

<a href="https://www.patreon.com/Stefouch">
  <img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
</a>

# 📝 License

[MIT](https://github.com/Stefouch/foundry-year-zero-roller/blob/master/LICENSE)