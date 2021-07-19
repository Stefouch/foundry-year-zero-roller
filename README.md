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
- Custom DieTerm classes for each Year Zero dice.
- Push support (except Alien atm).
- Custom roll template with push stack and push button.
- Customisable settings.
- Compatible with Foundry 0.8.8
- Compatible with Dice So Nice!

Not included:

- Roll dialog.
- Push button listener (you have to create one and call the roll.push() method, see example below).
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
import { YearZeroRollManager } from './lib/yzur.js';
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

// Sets the dice quantities.
let dice = {
  base: 5,
  skill: 3,
  gear: 2,
};

// Creates a roll.
let roll = YearZeroRoll.createFromDiceQuantities(dice);

// Rolls the roll, same methods as usual.
await roll.roll({ async: true });
roll.toMessage();
```

## Modify

```js
let roll = YearZeroRoll.createFromDiceQuantities(dice);

// Modifies the roll (returns a new unrolled non-evaluated instance).
let modifier = -1;
let modifiedRoll = roll.modify(modifier);

// Rolls and sends.
await modifiedRoll.roll({ async: true });
modifiedRoll.toMessage();
```

## Push
```js
let roll = YearZeroRoll.createFromDiceQuantities(dice);

// Pushes the roll (to call before rolling).
roll.push();
```

### Push from the Chat

Add a listener to the button in the chat to get the roll and push it. See example below.

```js
Hooks.on('renderChatLog', (app, html, data) => {
  html.on('click', '.dice-button.push', _onPush);
});

async function _onPush(event) {
  event.preventDefault();

  // Gets the message.
  let chatCard = event.currentTarget.closest('.chat-message');
  let messageId = chatCard.dataset.messageId;
  let message = game.messages.get(messageId);

  // Copies the roll.
  let roll = message.roll.duplicate();

  // Pushes the roll.
  if (roll.pushable) {
    await roll.push({ async: true });
    roll.toMessage();
  }
}
```

# Additional Getters & Setters

The new `YearZeroRoll` class offers the following additional getters and setters.

### Configurable

| Name | Type | Default Value | Description |
| :-- | :-- | :--: | :-- |
| game | string | `'myz'` | The code of the current game used. |
| name | string | `null` | The name of the roll. |
| maxPush | number | `1` | The maximum number of pushes. |

### Read-only

| Name | Type | Description |
| :-- | :-- | :-- |
| size | number | The total number of dice in the roll. |
| pushCount | number | The number of times the roll has been pushed. |
| pushed | boolean | Whether the roll was pushed or not. |
| pushable | boolean | Tells if the roll is pushable. |
| successCount | number | The total quantity of successes. |
| baneCount | number | The total quantity of ones (banes). |
| attributeTrauma | number | The quantity of traumas ("1" on base dice). |
| gearDamage | number | The quantity of gear damage ("1" on gear dice). |
| stress | number | The quantity of stress dice. |
| panic | number | The quantity of panic ("1" on stress dice). |
| ~~mishap~~ | boolean | **Deprecated**. Tells if the roll is a mishap (double 1's). |
| ammoSpent | number | The quantity of ammo spent. Equal to the sum of the ammo dice. |
| hitCount | number | The quantity of successes on ammo dice. |
| jamCount | number | The quantity of ones (banes) on base dice and ammo dice. |
| jammed | boolean | Tells if the roll caused a weapon jam. |
| baseSuccessQty | number | The total successes produced by base dice. |
| hitLocations | number[] | The rolled hit locations. |
| bestHitLocation | number | The best rolled hit location. |

If you need to count another specific result, use the `count(type, seed)` method.

Read more about the new methods and their documentation in the source code of the `yzur.js` library.

# Supported Games

| Game | Code | Dice & Denominations |
| :-- | :-- | :-- |
| Alien RPG *(except pushing)* | `alien` | `skill: s`<br/>`stress: z` |
| Coriolis: The Third Horizon | `cor` | `skill: s` |
| Forbidden Lands | `fbl` | `base: b`<br/>`skill: s`<br/>`gear: g`<br/>`neg: n`<br/>`artoD8: 8`<br/>`artoD10: 10`<br/>`artoD12: 12` |
| Mutant: Year Zero | `myz` | `base: b`<br/>`skill: s`<br/>`gear: g`<br/>`neg: n` |
| Tales From the Loop | `tales` | `skill: s` |
| Twilight 2000 4E | `t2k` | `a: a`<br/>`b: b`<br/>`c: c`<br/>`d: d`<br/>`ammo: m`<br/>`loc: l` |
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