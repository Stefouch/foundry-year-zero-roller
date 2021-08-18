# YZUR Documentation

- [YearZeroRoll](#yearzeroroll)
  - [createFromDiceQuantities](#yearzerorollcreatefromdicequantities)
  - [getTerms](#yearzerorollgetterms)
  - [count](#yearzerorollcount)
  - [addDice](#yearzerorolladddice)
  - [removeDice](#yearzerorollremovedice)
  - [push](#yearzerorollpush)
  - [modify](#yearzerorollmodify)
  - [getRollInfos](#yearzerorollgetrollinfos)
  - [duplicate](#yearzerorollduplicate)
- [YearZeroDie](#yearzerodie)
  - [count](#yearzerodiecount)
  - [push](#yearzerodiepush)
  - Roll modifiers:
    - [nopush](#yearzerodienopush)
    - [setpush](#yearzerodiesetpush)
  - Constants:
    - [TYPE](#yearzerodietype)
    - [LOCKED_VALUES](#yearzerodielocked_values)
    - [DENOMINATION](#yearzerodiedenomination)
    - [SERIALIZE_ATTRIBUTES](#yearzerodieserialize_attributes)
    - [MODIFIERS](#yearzerodiemodifiers)

# YearZeroRoll

```js
class YearZeroRoll extends Roll
```

Custom Roll class for Year Zero games.

## Constructor

```js
new YearZeroRoll(formula, data, options)
```

### Parameters

| Name | Type | Default | Description |
| :-- | :-- | :--: | :-- |
| formula | string | | The string formula to parse |
| data | object | `{}` | The data object against which to parse attributes within the formula |
| options | object | `{}` | Additional data which is preserved in the database |
| options.game | string | *default* | The game used |
| options.name | string | | The name of the roll |
| options.maxPush | number | `1` | The maximum number of times the roll can be pushed |


## Additional Getters & Setters

The new `YearZeroRoll` class offers the following additional getters and setters.

### Configurable

| Name | Type | Default | Description |
| :-- | :-- | :--: | :-- |
| game | string | *default* | The code of the current game used. |
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

If you need to count another specific result, use the `count(type, seed, comparison)` method.

Read more about the new methods and their documentation in the source code of the `yzur.js` library.

## YearZeroRoll.createFromDiceQuantities

```js
(static) createFromDiceQuantities(dice, options): YearZeroRoll
```

Generates a roll based on the number of dice.

### Parameters

| Name | Type | Default | Description |
| :-- | :-- | :--: | :-- |
| dice | DiceQuantities (object) | `{}` | An object with quantities of dice |
| options | object | `{}` | Additional options which configure the roll |
| options.title | string | | The name of the roll |
| options.yzGame | GameTypeString (string) | *default* | The game used |
| options.maxPush | number | `1` | The maximum number of pushes |
| options.push | boolean | `false` | Whether to add a push modifier to the roll |

## YearZeroRoll.getTerms

```js
getTerms(search): YearZeroDie[] | DiceTerm[]
```

Gets all the dice terms of a certain type or that match an object of values.

### Parameters

| Name | Type | Default | Description |
| :-- | :-- | :--: | :-- |
| search | DieTypeString (string) \|&nbsp;object | | Die type to search or an object with comparison values |

### Example of Comparison

```js
// Gets all terms with the type "skill".
let terms = getTerms('skill');

// Gets all terms that have exactly these specifications (it follows the structure of a DiceTerm).
let terms = getTerms({
  type: 'skill',
  number: 1,
  faces: 6
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

| Name | Type | Default | Description |
| :-- | :-- | :--: | :-- |
| type | DieTypeString (string) | | The type of the die |
| seed | number | `null` | The value to search, if any |
| comparison | string | `"="` | The comparison to use against the seed: `>`, `>=`, `<`, `<=` or `=` |

## YearZeroRoll.addDice

```js
(async) addDice(qty, type, data): Promise<YearZeroRoll>
```

Adds a number of dice to the roll.<br/>
Note: If a negative quantity is passed, instead it removes that many dice.

### Parameters

| Name | Type | Default | Description |
| :-- | :-- | :--: | :-- |
| qty | number | | The quantity to add |
| type | DieTypeString (string) | | The type of dice to add |
| data | object | `{}` | Additional data which defines the new dice |
| data.range | number | `6` | The number of faces of the die |
| data.value | number | | The predefined value for the new dice |
| data.options | object | | Additional options that modify the term |

## YearZeroRoll.removeDice

```js
removeDice(qty, search, options): YearZeroRoll
```

Removes a number of dice from the roll.

### Parameters

| Name | Type | Default | Description |
| :-- | :-- | :--: | :-- |
| qty | number | | The quantity to remove |
| search | DieTypeString (string) \|&nbsp;object | | The type of dice to remove, or an object of values for comparison, see [YearZeroRoll#getTerms](#yearzerorollgetterms) |
| options | object | `{}` | Additional options for the dice removal |
| options.discard | boolean | `false` | Whether the term should be marked as "discarded" instead of removed |
| options.disable | boolean | `false` | Whether the term should be marked as "active: false" instead of removed |

## YearZeroRoll.push

```js
(async) push(options): Promise<YearZeroRoll>
```

Pushes the roll, following the YZ rules.

### Parameters

| Name | Type | Default | Description |
| :-- | :-- | :--: | :-- |
| options | object | `{}` | Options which inform how the Roll is evaluated |
| options.minimize | boolean | `false` | Minimize the result, obtaining the smallest possible value |
| options.maximize | boolean | `false` | Maximize the result, obtaining the largest possible value |
| options.async | boolean | `false` | Evaluate the roll asynchronously, receiving a Promise as the returned value |

## YearZeroRoll.modify

```js
(async) modify(mod): Promise<YearZeroRoll>
```

Applies a difficulty modifier to the roll.

### Parameters

| Name | Type | Default | Description |
| :-- | :-- | :--: | :-- |
| mod | number | `0` | Difficulty modifier (bonus or malus) |

## YearZeroRoll.getRollInfos

```js
(async) getRollInfos(template): Promise<string>
```

Renders the infos of a Year Zero roll.

| Name | Type | Default | Description |
| :-- | :-- | :--: | :-- |
| template | string | *default* | The path to the template |

## YearZeroRoll.duplicate

```js
duplicate(): YearZeroRoll
```

Creates a deep clone copy of the roll.

<p>&nbsp;</p>
<hr/>
<p>&nbsp;</p>

# YearZeroDie

```js
class YearZeroDie extends Die
```

## Constructor

```js
new YearZeroDie(termData)
```

### Parameters

| Name | Type | Default | Description |
| :-- | :-- | :--: | :-- |
| termData | object | `{}` | Data used to create the Dice Term |
| termData.number | number | `1` | The number of dice of this term to roll, before modifiers are applied |
| termData.faces | number | `6` | The number of faces on each die of this type |
| termData.maxPush | number | `1` | The maximum number of times this term can be pushed |
| termData.modifiers | string[] | |  An array of modifiers applied to the results |
| termData.results | DiceTermResult[] (object[]) | | An optional array of pre-cast results for the term |
| termData.options | object | `{}` | Additional options that modify the term |
| termData.options .flavor | string | | Optional flavor text which modifies and describes this term |

## Additional Getters & Setters

The new `YearZeroDie` class offers the following additional getters and setters.

### Configurable

| Name | Type | Default | Description |
| :-- | :-- | :--: | :-- |
| maxPush | number | `1` | The maximum number of pushes. |

### Read-only

| Name | Type | Description |
| :-- | :-- | :-- |
| type | DieTypeString (string) | The type of the die. |
| pushable | boolean | Whether the die can be pushed (according to its type). |
| pushCount | number | Number of times this die has been pushed. |
| pushed | boolean | Whether this die has been pushed. |
| isYearZeroDie | boolean | Tells if it's a YearZero Die. |
| success | number | Number of successes rolled. |
| failure | number | Number of banes rolled. |

## YearZeroDie.count

```js
count(n): number
```

Counts the number of times a single value appears.

### Parameters

| Name | Type | Default | Description |
| :-- | :-- | :--: | :-- |
| n | number | | The single value to count |

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

| Name | Type | Default | Description |
| :-- | :-- | :--: | :-- |
| modifier | string | | The matched modifier query: `pX` |

## YearZeroDie.TYPE

A DieTypeString that defines the type of the die.

## YearZeroDie.LOCKED_VALUES

An array of numbers that tells which roll results cannot be rerolled.

## YearZeroDie.DENOMINATION

A single character that defines the denomination used to register this DiceTerm type in `CONFIG.Dice.terms`.

## YearZeroDie.SERIALIZE_ATTRIBUTES

An array of additional attributes which should be retained when the term is serialized. The `YearZeroDie` class adds the property `maxPush` to the list.

## YearZeroDie.MODIFIERS

An object of key-pairs that defines the named modifiers that can be applied for this particular DiceTerm type.