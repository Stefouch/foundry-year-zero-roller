# Changelog
All notable changes to this project will be documented in this file.
<br />The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
<br />and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
> :warning: **BREAKING CHANGE**
> The YZUR library is now compiled with rollup. Accessing the classes might have changed.

```js
before: import * as YZUR from './lib/yzur.js';
after:  import YZUR      from './dist/yzur.js';
```

### Added
- `YearZeroRoll#addDice(qty, type, options)`: Adds a number of dice to the roll.
- `YearZeroRoll#removeDice(qty, type)`: Removes a number of dice from the roll.
- `YearZeroRoll#create()`: Overrides the default Foundry's Roll method.
- "chatOptions" in `YearZeroRoll#render(chatOptions)` is passed to the renderTemplate with property "options".

### Changed
- Rollup: the compiled `yzur.js` libraries are now artifacts in Github releases.
- `YearZeroRoll#count(type, seed, comparison)` is a bit refactored so it counts empty DiceTerms.
- `YearZeroRoll#modify(n)` is refactored and now modifies the roll instead of a copy of it. The old (fixed) modify method is still accessible with `_modify()`.
- `YearZeroRoll#getTerms(search)` now accepts also an object of comparaison values as an argument.

### Deprecated
- `YearZeroRoll#getDiceQuantities()` is now useless and will be removed in a future release.

### Removed
- Dropped `YearZeroRoll#data` in place of `YearZeroRoll#options`.
- Custom toJSON and fromData methods have therefore been dropped too.

### Fixed
- `YearZeroRoll#modify(n)` now retains all data/options set before.

## [2.1.1] - 2021-08-09
### Fixed
- A bug where setting the maxPush in the YearZeroRoll constructor was not working.

## [2.1.0] - 2021-08-02
### Added
- New properties on the Term level: `YearZeroDie#maxPush`: Max number of pushes for this term.
- New modifier for roll formulae: `np` (set maxPush to 0).
- New modifier for roll formulae: `pX` (set maxPush to X).
- `banes: this.failure` property in `YearZeroDie#getTooltipData()`.

### Changed
- `YearZeroRoll#maxPush` now acts on the Term level.

### Fixed
- A bug where it was not possible to set `maxPush = 0`.

## [2.0.0] - 2021-07-19
> :warning: **Breaking Change**
> Use `roll.successCount` instead of `roll.total`.

### Added
- The roll object is entirely passed to the chat template, for better access to its getters.
- Two new getters for the `YearZeroDie` class:
  - `.success`: Number of successes rolled by this Year Zero DieTerm
  - `.failure`: Number of banes rolled
- Placeholder for a future `YearZeroDie#nopush()` method.

### Changed
- Total number of success is returned by `YearZeroRoll#successCount`. *(Thus, the deprecation of this property is reverted.)*
- Total sum of the dice's values is returned by `YearZeroRoll#total`. *(Back to default behavior.)*

### Removed
- The DieTerm classes `NegativeDie` and `ArtifactDie` (which includes T2K dice) won't override the `.roll()` method anymore. No more `result.count` value for these dice. The calculation of successes is instead obtained with the `YearZeroDie#success` getter.

## [1.2.2] - 2021-07-17
### Added
- New getter for all `YearZeroDie` classes `.isYearZeroDie`: Tells whether it's a Year Zero Die. This property is also passed to the templates.

### Fixed
- Errors throwed when rolling unregistered dice that are still common like d4, d20 or d100.

## [1.2.1] - 2021-07-12
### Added
- New data option "title" (the name of the roll) for `YearZeroRoll#createFromDiceQuantities(dice, data)`.

### Fixed
- A bug where a modified roll would not keep its name.

## [1.2.0] - 2021-07-11
### Added
- New getters for the `YearZeroRoll`, mostly used by T2K:
  - `baseSuccessQty`: he total successes produced by base dice.
  - `hitLocations `: The rolled hit locations.
  - `bestHitLocation `: The best rolled hit location.
- Tooltip dice parts in the chat are now sorted.
- The sort order is stored in `YZUR.CHAT.diceSorting`.
- Plenty of CSS classes in the templates.

### Changed
- `YearZeroRoll#jamCount` now returns 0 if there are no bane on ammo dice.

### Fixed
- A bug where a modifier to a T2K roll could lead to an infinite loop.

## [1.1.1] - 2021-07-05
### Fixed
- Correct rendering of result labels.
- Ensure that `YZUR.DICE.ICONS.getLabel()` returns a string.
- A bug causing numerical result labels to throw an error in Dice So Nice!

## [1.1.0] - 2021-07-04
Last minute changes for T2K.

### Added
- New getters for the `YearZeroRoll`, mostly used by T2K:
  - `.jamCount`: The quantity of ones (banes) on base dice and ammo dice.
  - `.jammed`: Tells if the roll caused a weapon jam.
- Missing locked values for Ammo dice.
- Setting the global "`CONFIG.debug.dice = true`" will log the roll objects in the console.

### Changed
- Updated `infos.hbs` template with correct T2K weapon-related infos.

### Deprecated
- `YearZeroRoll.mishap` is deprecated (useless for now).

### Removed
- The two getters previously added. They were useless in fact:
  - `YearZeroRoll.baseBaneCount`
  - `YearZeroRoll.ammoBaneCount`

### Fixed
- `YearZeroRoll.ammoSpent` is now correctly returning the sum of the active values on ammo dice.
- Modifiers for T2K rolls now properly work as detailed in the rules.

## [1.0.0] - 2021-07-04
Update for Foundry V8.

### Added
- This changelog.
- Full compatibility with Dice So Nice.
- New `YearZeroRoll` function: `.duplicate()` – Creates a copy of the roll.
- New getters for the `YearZeroRoll`, mostly used by T2K:
  - `baseBaneCount`: The quantity of ones (banes) on base dice.
  - `ammoBaneCount`: The quantity of ones (banes) on ammo dice.

### Changed
- Compatibility with latest Foundry v0.8.x:
  - `YearZeroRoll`
    - `.push()` has been revamped and is now asynchronous.
    - New function `.getTooltipData()`
    - Updated function `.getTooltip()`
  - `YearZeroDie`
    - New function `.getResultCSS()`
    - New function `.getTooltipData()`
- Use of JavaScript's *nullish coalescing operator* `??` in place of the *logical operator* `||` (ES2020 feature).
- Use of Twilight 2000 final rules.

### Fixed
- No more too many dice rolled with Dice So Nice.

## [0.9.0-beta] - 2020
First release.