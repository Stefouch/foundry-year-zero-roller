# Changelog
All notable changes to this project will be documented in this file.
<br />The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
<br />and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2021-07-05
### Fixed
- Correct rendering of result labels.
- Ensure that `YZUR.DICE.ICONS.getLabel()` returns a string.
- A bug causing numerical result labels to throw an error in Dice So Nice!

## [1.1.0] - 2021-07-04
Last minute changes for T2K.

### Changed
- Updated `infos.hbs` template with correct T2K weapon-related infos.

### Added
- New getters for the `YearZeroRoll`, mostly used by T2K:
  - `.jamCount`: The quantity of ones (banes) on base dice and ammo dice.
  - `.jammed`: Tells if the roll caused a weapon jam.
- Missing locked values for Ammo dice.
- Setting the global "`CONFIG.debug.dice = true`" will log the roll objects in the console.

### Removed
- The two getters previously added. They were useless in fact:
  - `YearZeroRoll.baseBaneCount`
  - `YearZeroRoll.ammoBaneCount`

### Fixed
- `YearZeroRoll.ammoSpent` is now correctly returning the sum of the active values on ammo dice.
- Modifiers for T2K rolls now properly work as detailed in the rules.

### Deprecated
- `YearZeroRoll.mishap` is deprecated (useless for now).

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