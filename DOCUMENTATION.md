# YZUR Documentation

<table>
  <tr>
    <th><a href="#yearzeroroll">YearZeroRoll</a></th>
    <th><a href="#yearzerodie">YearZeroDie</a></th>
    <th><a href="#yearzerorollmanager">YearZeroRollManager</a></th>
  </tr>
  <tr>
    <td>
      <ul>
        <li><a href="#yearzerorollforge">forge</a></li>
        <li><a href="#yearzerorollgeneratetermformula">generateTermFormula</a></li>
        <li><a href="#yearzerorollgetterms">getTerms</a></li>
        <li><a href="#yearzerorollcount">count</a></li>
        <li><a href="#yearzerorolladddice">addDice</a></li>
        <li><a href="#yearzerorollremovedice">removeDice</a></li>
        <li><a href="#yearzerorollmodify">modify</a></li>
        <li><a href="#yearzerorollpush">push</a></li>
        <li><a href="#yearzerorollgetrollinfos">getRollInfos</a></li>
        <li><a href="#yearzerorollduplicate">duplicate</a></li>
        <li>Overridden methods:</li>
        <ul>
          <li><a href="#yearzerorollcreate">create</a></li>
          <li><a href="#yearzerorollrender">render</a></li>
          <li><a href="#yearzerorolltomessage">toMessage</a></li>
        </ul>
      </ul>
    </td>
    <td>
      <ul>
        <li><a href="#yearzerodiecount">count</a></li>
        <li><a href="#yearzerodiepush">push</a></li>
        <li>Roll modifiers:</li>
        <ul>
          <li><a href="#yearzerodienopush">nopush</a></li>
          <li><a href="#yearzerodiesetpush">setpush</a></li>
        </ul>
        <li>Constants:</li>
        <ul>
          <li><a href="#yearzerodietype">TYPE</a></li>
          <li><a href="#yearzerodielocked_values">LOCKED_VALUES</a></li>
          <li><a href="#yearzerodiedenomination">DENOMINATION</a></li>
          <li><a href="#yearzerodieserialize_attributes">SERIALIZE_ATTRIBUTES</a></li>
          <li><a href="#yearzerodiemodifiers">MODIFIERS</a></li>
        </ul>
      </ul>
    </td>
    <td>
      <ul>
        <li><a href="#yearzerorollmanagerregister">register</a></li>
        <li><a href="#yearzerorollmanagerregisterconfig">registerConfig</a></li>
        <li><a href="#yearzerorollmanagerregisterroll">registerRoll</a></li>
        <li><a href="#yearzerorollmanagerregisterdice">registerDice</a></li>
        <li><a href="#yearzerorollmanagerregisterdie">registerDie</a></li>
        <li><a href="#yearzerorollmanager_initialize">_initialize</a></li>
        <li><a href="#yearzerorollmanager_overriderollcreate">_overrideRollCreate</a></li>
        <li>Constants:</li>
        <ul>
          <li><a href="#yearzerorollmanagerdie_types_map">DIE_TYPES_MAP</a></li>
          <li><a href="#yearzerorollmanagergames">GAMES</a></li>
        </ul>
      </ul>
    </td>
  </tr>
</table>

### Global Constants (YZUR Configuration)

<ul>
  <li><a href="#config-constants">Config Constants</a></li>
</ul>

# YearZeroRoll

```js
class YearZeroRoll extends Roll
```

Custom Roll class for Year Zero games.

## Constructor

```js
new YearZeroRoll(formula, data, options);
```

### Parameters

| Name               | Type   |               Default               | Description                                                          |
| :----------------- | :----- | :---------------------------------: | :------------------------------------------------------------------- |
| formula            | string |                                     | The string formula to parse                                          |
| data               | Object |                `{}`                 | The data object against which to parse attributes within the formula |
| options            | Object |                `{}`                 | Additional data which is preserved in the database                   |
| ✨ options.game    | string | `CONFIG .YZUR.game` \|&nbsp;`"myz"` | The game used                                                        |
| ✨ options.name    | string |                                     | The name of the roll                                                 |
| ✨ options.maxPush | number |                 `1`                 | The maximum number of times the roll can be pushed                   |
| ✨ options.yzur    | number |                                     | Specify this one if you have issues to recognize a YearZeroRoll      |

<small><i>✨ Extra options not in the core Foundry's `Roll` class and added by the extend.</i></small>

## Additional Getters & Setters

The new `YearZeroRoll` class offers the following additional getters and setters.

### Configurable

| Name    | Type   | Default | Description                        |
| :------ | :----- | :-----: | :--------------------------------- |
| game    | string |         | The code of the current game used. |
| name    | string |         | The name of the roll.              |
| maxPush | number |   `1`   | The maximum number of pushes.      |

### Read-only

| Name            | Type     | Description                                                    |
| :-------------- | :------- | :------------------------------------------------------------- |
| size            | number   | The total number of dice in the roll.                          |
| pushCount       | number   | The number of times the roll has been pushed.                  |
| pushed          | boolean  | Whether the roll was pushed or not.                            |
| pushable        | boolean  | Tells if the roll is pushable.                                 |
| successCount    | number   | The total quantity of successes.                               |
| baneCount       | number   | The total quantity of ones (banes).                            |
| attributeTrauma | number   | The quantity of traumas ("1" on base dice).                    |
| gearDamage      | number   | The quantity of gear damage ("1" on gear dice).                |
| stress          | number   | The quantity of stress dice.                                   |
| panic           | number   | The quantity of panic ("1" on stress dice).                    |
| ~~mishap~~      | boolean  | **Deprecated**. Tells if the roll is a mishap (double 1's).    |
| ammoSpent       | number   | The quantity of ammo spent. Equal to the sum of the ammo dice. |
| hitCount        | number   | The quantity of successes on ammo dice.                        |
| jamCount        | number   | The quantity of ones (banes) on base dice and ammo dice.       |
| jammed          | boolean  | Tells if the roll caused a weapon jam.                         |
| baseSuccessQty  | number   | The total successes produced by base dice.                     |
| hitLocations    | number[] | The rolled hit locations.                                      |
| bestHitLocation | number   | The best rolled hit location.                                  |

If you need to count another specific result, use the `count(type, seed, comparison)` method.

Read more about the new methods and their documentation in the source code of the `yzur.js` library.

## YearZeroRoll.create

```js
/** @override */
(static) create(formula, data, options): YearZeroRoll
```

Creates a YearZeroRoll. Same as [`new YearZeroRoll(formula, data, options)`](#yearzeroroll).

Note: This is a core method from Foundry's `Roll` class that is overridden by the `YearZeroRoll` class to always return a YearZeroRoll object, instead of using the first element found in `CONFIG.Dice.rolls[]`.

## YearZeroRoll.forge

```js
(static) forge(dice, data, options): YearZeroRoll
```

Generates a roll based on the number of dice.

### Parameters

| Name         | Type                          |       Default       | Description                                        |
| :----------- | :---------------------------- | :-----------------: | :------------------------------------------------- |
| dice         | TermBlok\|TermBlok[] (Object) |        `[]`         | An array of objects that define the dice           |
| data         | Object                        |        `{}`         | Additional data which configures the roll          |
| data.title   | string                        |                     | The name of the roll                               |
| data.yzGame  | GameTypeString (string)       | `CONFIG .YZUR.game` | The game used                                      |
| data.maxPush | number                        |         `1`         | The maximum number of pushes                       |
| options      | Object                        |        `{}`         | Additional data which is preserved in the database |

### Structure of a TermBlok

```js
{
  term: String,
  number: Number,
  flavor: String, // Optional
  maxPush: Number // Optional
}
```

## YearZeroRoll.generateTermFormula

```js
(static) generateTermFormula(number, term, flavor, maxPush): string
```

Creates a roll formula based on number of dice.

### Parameters

| Name    | Type             | Default | Description                                                     |
| :------ | :--------------- | :-----: | :-------------------------------------------------------------- |
| term    | DieDeno (string) |         | The denomination of the dice to create                          |
| number  | number           |         | The quantity of those dice                                      |
| flavor  | string           |         | (optional) Any flavor tied to those dice                        |
| maxPush | number           | `null`  | (optional) Special maxPush modifier but only for the those dice |

## YearZeroRoll.getTerms

```js
getTerms(search): YearZeroDie[] | DiceTerm[]
```

Gets all the dice terms of a certain type or that match an object of values.

### Parameters

| Name   | Type                                  | Default | Description                                            |
| :----- | :------------------------------------ | :-----: | :----------------------------------------------------- |
| search | DieTypeString (string) \|&nbsp;Object |         | Die type to search or an object with comparison values |

### Example of Comparison

```js
// Gets all terms with the type "skill".
let terms = getTerms('skill');

// Gets all terms that have exactly these specifications (it follows the structure of a DiceTerm).
let terms = getTerms({
  type: 'skill',
  number: 1,
  faces: 6,
  options: {
    flavor: 'Attack',
    // ...etc...
  },
  results: {
    result: 3,
    active: true,
    // ...etc...
  },
});
```

## YearZeroRoll.count

```js
count(type, seed, comparison): number
```

Counts the values of a certain type in the roll.<br/>
If `seed` is omitted, counts all the dice of a certain type.

### Parameters

| Name       | Type                   | Default | Description                                                         |
| :--------- | :--------------------- | :-----: | :------------------------------------------------------------------ |
| type       | DieTypeString (string) |         | The type of the die                                                 |
| seed       | number                 | `null`  | The value to search, if any                                         |
| comparison | string                 |  `"="`  | The comparison to use against the seed: `>`, `>=`, `<`, `<=` or `=` |

## YearZeroRoll.addDice

```js
(async) addDice(qty, type, data): Promise<YearZeroRoll>
```

Adds a number of dice to the roll.

Note: If a negative quantity is passed, instead it removes that many dice.

### Parameters

| Name         | Type                   | Default | Description                                |
| :----------- | :--------------------- | :-----: | :----------------------------------------- |
| qty          | number                 |         | The quantity to add                        |
| type         | DieTypeString (string) |         | The type of dice to add                    |
| data         | Object                 |  `{}`   | Additional data which defines the new dice |
| data.range   | number                 |   `6`   | The number of faces of the die             |
| data.value   | number                 |         | The predefined value for the new dice      |
| data.options | Object                 |         | Additional options that modify the term    |

## YearZeroRoll.removeDice

```js
removeDice(qty, search, options): YearZeroRoll
```

Removes a number of dice from the roll.

### Parameters

| Name            | Type                                  | Default | Description                                                                                                              |
| :-------------- | :------------------------------------ | :-----: | :----------------------------------------------------------------------------------------------------------------------- |
| qty             | number                                |         | The quantity to remove                                                                                                   |
| search          | DieTypeString (string) \|&nbsp;Object |         | The type of dice to remove, or an object of values for comparison<br/>See [YearZeroRoll#getTerms](#yearzerorollgetterms) |
| options         | Object                                |  `{}`   | Additional options for the dice removal                                                                                  |
| options.discard | boolean                               | `false` | Whether the term should be marked as "discarded" instead of removed                                                      |
| options.disable | boolean                               | `false` | Whether the term should be marked as "active: false" instead of removed                                                  |

## YearZeroRoll.modify

```js
(async) modify(mod): Promise<YearZeroRoll>
```

Applies a difficulty modifier to the roll.

### Parameters

| Name | Type   | Default | Description                          |
| :--- | :----- | :-----: | :----------------------------------- |
| mod  | number |   `0`   | Difficulty modifier (bonus or malus) |

## YearZeroRoll.push

```js
(async) push(options): Promise<YearZeroRoll>
```

Pushes the roll, following the YZ rules.

### Parameters

| Name             | Type    | Default | Description                                                                 |
| :--------------- | :------ | :-----: | :-------------------------------------------------------------------------- |
| options          | Object  |  `{}`   | Options which inform how the Roll is evaluated                              |
| options.minimize | boolean | `false` | Minimize the result, obtaining the smallest possible value                  |
| options.maximize | boolean | `false` | Maximize the result, obtaining the largest possible value                   |
| options.async    | boolean | `false` | Evaluate the roll asynchronously, receiving a Promise as the returned value |

## YearZeroRoll.getRollInfos

```js
(async) getRollInfos(template): Promise<string>
```

Renders the infos of a Year Zero roll.

### Parameters

| Name     | Type   |              Default              | Description              |
| :------- | :----- | :-------------------------------: | :----------------------- |
| template | string | `CONFIG.YZUR .ROLL.infosTemplate` | The path to the template |

## YearZeroRoll.duplicate

```js
duplicate(): YearZeroRoll
```

Creates a deep clone copy of the roll.

## YearZeroRoll.render

```js
/** @override */
(async) render(chatOptions): Promise<string>
```

Renders a Roll instance to HTML.

Note: This is a core method from Foundry's `Roll` class that is overridden by the `YearZeroRoll` class with extra features.

### Parameters

| Name                         | Type    |              Default               | Description                                                                                            |
| :--------------------------- | :------ | :--------------------------------: | :----------------------------------------------------------------------------------------------------- |
| chatOptions                  | Object  |                `{}`                | An object configuring the behavior of the resulting chat message, which is also passed to the template |
| chatOptions.user             | string  |           `game.user.id`           | The ID of the user that renders the roll                                                               |
| chatOptions.flavor           | string  |               `null`               | The flavor of the message                                                                              |
| chatOptions.template         | string  |   `YearZeroRoll .CHAT_TEMPLATE`    | The path to the template that renders the roll                                                         |
| ✨ chatOptions.infosTemplate | string  | `CONFIG.YZUR .ROLL .infosTemplate` | The path to the template that renders the infos box under the roll tooltip                             |
| chatOptions.blind            | boolean |              `false`               | Whether this is a blind roll                                                                           |
| chatOptions.isPrivate        | boolean |              `false`               | Whether this roll is private (displays sensitive infos with `???` instead)                             |

<small><i>✨ Extra feature added by the override.</i></small>

## YearZeroRoll.toMessage

```js
/** @override */
(async) toMessage(messageData, options): Promise<ChatMessage | ChatMessageData>
```

Transforms a Roll instance into a ChatMessage, displaying the roll result.

This function can either create the ChatMessage directly, or return the data object that will be used to create.

Note: This is a core method from Foundry's `Roll` class that is overridden by the `YearZeroRoll` class with a single extra feature: a default speaker is defined.

### Parameters

| Name                | Type    |              Default              | Description                                                                                             |
| :------------------ | :------ | :-------------------------------: | :------------------------------------------------------------------------------------------------------ |
| messageData         | Object  |               `{}`                | The data object to use when creating the message                                                        |
| messageData.user    | string  |          `game.user.id`           | The ID of the user that sends the message                                                               |
| messageData.speaker | Object  |  ✨ `ChatMessage .getSpeaker()`   | The identified speaker data                                                                             |
| messageData.content | string  |           `this.total`            | The HTML content of the message, overridden by the `roll.render()`'s returned content if left unchanged |
| messageData.type    | number  | `CONST .CHAT_MESSAGE_TYPES .ROLL` | The type to use for the message from `CONST.CHAT_MESSAGE_TYPES`                                         |
| messageData.sound   | string  |       `CONFIG .sounds.dice`       | The path to the sound played with the message (WAV format)                                              |
| options             | Object  |               `{}`                | Additional options which modify the created message                                                     |
| options.rollMode    | string  |       _default_<sup>1</sup>       | The template roll mode to use for the message from `CONFIG.Dice.rollModes`                              |
| options.create      | boolean |              `true`               | Whether to automatically create the chat message, or only return the prepared chatData object           |

<small><i>✨ Extra feature added by the override.</i><br/><i>1: `options.rollMode`'s default is `game.settings.get('core', 'rollMode')`</i>.</small>

<p>&nbsp;</p>
<hr/>
<p>&nbsp;</p>

# YearZeroDie

```js
class YearZeroDie extends Die
```

## Constructor

```js
new YearZeroDie(termData);
```

### Parameters

| Name                     | Type                        | Default | Description                                                           |
| :----------------------- | :-------------------------- | :-----: | :-------------------------------------------------------------------- |
| termData                 | Object                      |  `{}`   | Data used to create the Dice Term                                     |
| termData.number          | number                      |   `1`   | The number of dice of this term to roll, before modifiers are applied |
| termData.faces           | number                      |   `6`   | The number of faces on each die of this type                          |
| ✨ termData.maxPush      | number                      |   `1`   | The maximum number of times this term can be pushed                   |
| termData.modifiers       | string[]                    |         | An array of modifiers applied to the results                          |
| termData.results         | DiceTermResult[] (Object[]) |         | An optional array of pre-cast results for the term                    |
| termData.options         | Object                      |  `{}`   | Additional options that modify the term                               |
| termData.options .flavor | string                      |         | Optional flavor text which modifies and describes this term           |

<small><i>✨ Extra parameter not in the core Foundry's `Roll` class and added by the extend.</i></small>

## Additional Getters & Setters

The new `YearZeroDie` class offers the following additional getters and setters.

### Configurable

| Name    | Type   | Default | Description                   |
| :------ | :----- | :-----: | :---------------------------- |
| maxPush | number |   `1`   | The maximum number of pushes. |

### Read-only

| Name          | Type                   | Description                                            |
| :------------ | :--------------------- | :----------------------------------------------------- |
| type          | DieTypeString (string) | The type of the die.                                   |
| pushable      | boolean                | Whether the die can be pushed (according to its type). |
| pushCount     | number                 | Number of times this die has been pushed.              |
| pushed        | boolean                | Whether this die has been pushed.                      |
| isYearZeroDie | boolean                | Tells if it's a YearZero Die.                          |
| success       | number                 | Number of successes rolled.                            |
| failure       | number                 | Number of banes rolled.                                |

## YearZeroDie.count

```js
count(n): number
```

Counts the number of times a single value appears.

### Parameters

| Name | Type   | Default | Description               |
| :--- | :----- | :-----: | :------------------------ |
| n    | number |         | The single value to count |

## YearZeroDie.push

```js
push(): YearZeroDie
```

Pushes the dice.

## YearZeroDie.nopush

```js
nopush(): void
```

Roll Modifier method that blocks pushes.

## YearZeroDie.setpush

```js
setpush(modifier): void
```

Roll modifier method that sets the max number of pushes.

### Parameters

| Name     | Type   | Default | Description                      |
| :------- | :----- | :-----: | :------------------------------- |
| modifier | string |         | The matched modifier query: `pX` |

## YearZeroDie.TYPE

```js
TYPE: string;
```

A DieTypeString that defines the type of the die.

## YearZeroDie.LOCKED_VALUES

```js
LOCKED_VALUES: number[]
```

An array of numbers that tells which roll results cannot be rerolled.

## YearZeroDie.DENOMINATION

```js
DENOMINATION: string;
```

A single character that defines the denomination used to register this DiceTerm type in `CONFIG.Dice.terms`.

## YearZeroDie.SERIALIZE_ATTRIBUTES

```js
SERIALIZE_ATTRIBUTES: string[]
```

An array of additional attributes which should be retained when the term is serialized. The `YearZeroDie` class adds the property `maxPush` to the list.

## YearZeroDie.MODIFIERS

```js
MODIFIERS: Object.<string, (string|function)>
```

An object of key-pairs that defines the named modifiers that can be applied for this particular DiceTerm type.

<p>&nbsp;</p>
<hr/>
<p>&nbsp;</p>

# YearZeroRollManager

```js
class YearZeroRollManager extends Die
```

Interface for registering Year Zero dice.

To register the game and its dice, call the static `YearZeroRollManager.register()` method at the start of the `init` Hooks.

### Example

```js
import { YearZeroRollManager } from './lib/yzur.js';
Hooks.once('init', function() {
  YearZeroRollManager.register('yourgame', config, options);
  ...
});
```

## YearZeroRollManager.register

```js
(static) register(yzGame, config, options): void
```

Registers the Year Zero dice for the specified game. You must call this method in `Hooks.once('init')`.

### Parameters

| Name          | Type                    | Default | Description                                             |
| :------------ | :---------------------- | :-----: | :------------------------------------------------------ |
| yzGame        | GameTypeString (string) |         | The game used (for the choice of die types to register) |
| config        | Object                  |         | Custom config to merge with the initial config          |
| options       | Object                  |         | Additional options                                      |
| options.index | number                  |    0    | Index of the registration                               |

## YearZeroRollManager.registerConfig

```js
(static) registerConfig(config): void
```

Registers the Year Zero Universal Roller config. See [Config](#config-constants).

### Parameters

| Name   | Type   | Default | Description                                    |
| :----- | :----- | :-----: | :--------------------------------------------- |
| config | Object |         | Custom config to merge with the initial config |

## YearZeroRollManager.registerRoll

```js
(static) registerRoll(cls, i): void
```

Registers the roll.

### Parameters

| Name | Type   |    Default     | Description                |
| :--- | :----- | :------------: | :------------------------- |
| cls  | class  | `YearZeroRoll` | The roll class to register |
| i    | number |      `0`       | Index of the registration  |

## YearZeroRollManager.registerDice

```js
(static) registerDice(yzGame): void
```

Registers all the Year Zero Dice.

### Parameters

| Name   | Type                    | Default | Description                                             |
| :----- | :---------------------- | :-----: | :------------------------------------------------------ |
| yzGame | GameTypeString (string) |         | The game used (for the choice of die types to register) |

## YearZeroRollManager.registerDie

```js
(static) registerDie(type): void
```

Registers a die in Foundry.

### Parameters

| Name | Type                   | Default | Description             |
| :--- | :--------------------- | :-----: | :---------------------- |
| type | DieTypeString (string) |         | Type of die to register |

## YearZeroRollManager.registerDie

```js
(static) _initialize(yzGame): void
```

### Parameters

| Name   | Type                    | Default | Description                                             |
| :----- | :---------------------- | :-----: | :------------------------------------------------------ |
| yzGame | GameTypeString (string) |         | The game used (for the choice of die types to register) |

## YearZeroRollManager.\_overrideRollCreate

```js
(static) _overrideRollCreate(index): void
```

### Parameters

| Name  | Type   | Default | Description               |
| :---- | :----- | :-----: | :------------------------ |
| index | number |   `1`   | Index of the registration |

## YearZeroRollManager.DIE_TYPES_MAP

```js
DIE_TYPES_MAP: Object.<GameTypeString, DieTypeString[]>
```

Die Types mapped with Games. Used by the register method to choose which dice to activate.

## YearZeroRollManager.GAMES

```js
GAMES: GameTypeString[]
```

List of GameTypeStrings.

<p>&nbsp;</p>
<hr/>
<p>&nbsp;</p>

# Config Constants

| Name                         | Type                       |  Default  | Description                                                                                                                   |
| :--------------------------- | :------------------------- | :-------: | :---------------------------------------------------------------------------------------------------------------------------- |
| YZUR.game                    | GameTypeString (string)    |   `""`    | The name of the game used                                                                                                     |
| YZUR.CHAT.showInfos          | boolean                    |  `true`   | Whether to show the roll infos template beneath the roll tooltip                                                              |
| YZUR.CHAT.diceSorting        | DieTypeString[] (string[]) | _default_ | Defines the dice tooltips sorting order                                                                                       |
| YZUR.ROLL.chatTemplate       | string                     | _default_ | The path to the roll message template                                                                                         |
| YZUR.ROLL.tooltipTemplate    | string                     | _default_ | The path to the roll tooltip template                                                                                         |
| YZUR.ROLL.infosTemplate      | string                     | _default_ | The path to the roll infos template                                                                                           |
| YZUR.DICE.localizeDieTypes   | boolean                    |  `true`   | Whether to localize the default die type flavor                                                                               |
| YZUR.DICE.DIE_TYPES          | Object                     | _default_ | Map of `{ DieTypeString: class }` pairs                                                                                       |
| YZUR.DICE.DIE_TYPES_BY_CLASS | Object                     | _default_ | Map of `{ string: DieTypeString }` pairs                                                                                      |
| YZUR.DICE.ICONS.getLabel     | function                   | _default_ | A customizable helper function for creating the labels of the die. Note: You must return a string or DsN will throw an error. |
| YZUR.DICE.ICONS.{{yzGame}}   | Object                     | _default_ | Icons labels                                                                                                                  |
