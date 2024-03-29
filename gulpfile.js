const argv = require('yargs').argv;
const fs = require('fs-extra');
const chalk = require('chalk');
const gulp = require('gulp');
const { rollup } = require('rollup');
const rollupConfig = require('./rollup.config.js');
const semver = require('semver');

/* -------------------------------------------- */
/*  Configuration                               */
/* -------------------------------------------- */

const sourceDirectory = './src';
const sourceFileExtension = 'js';

// Loads environment variables
const stdio = 'inherit';

/* -------------------------------------------- */
/*  Build                                       */
/* -------------------------------------------- */

/**
 * Builds the distributable Javascript code.
 */
async function buildCode() {
  const build = await rollup({
    input: rollupConfig.input,
  });
  return build.write({
    ...rollupConfig.output,
  });
}

/**
 * Watches for changes.
 */
function buildWatch() {
  gulp.watch(
    `${sourceDirectory}/**/*.${sourceFileExtension}`,
    { ignoreInitial: false },
    buildCode,
  );
}

/* -------------------------------------------- */
/*  Versioning                                  */
/* -------------------------------------------- */

/**
 * Gets the contents of the manifest file as object.
 */
function getManifest() {
  const manifestPath = './system.json';
  if (fs.existsSync(manifestPath)) {
    return {
      file: fs.readJSONSync(manifestPath),
      name: 'system.json',
    };
  }
}

/**
 * Gets the target version based on the current version and the argument passed as release.
 */
function getTargetVersion(currentVersion, release) {
  const releaseTypes = ['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'];
  if (releaseTypes.includes(release)) {
    return semver.inc(currentVersion, release);
  }
  else {
    return semver.valid(release);
  }
}

/**
 * Commits and pushes release to Github.
 */
async function commitTagPush() {
  const { execa } = await import('execa');
  const { version } = fs.readJSONSync('package.json');
  const commitMsg = `chore: release v${version}`;
  await execa('git', ['add', '-A'], { stdio });
  await execa('git', ['commit', '--message', commitMsg], { stdio });
  await execa('git', ['tag', `v${version}`], { stdio });
  await execa('git', ['push'], { stdio });
  await execa('git', ['push', '--tag'], { stdio });
  return;
}

/**
 * Updates version.
 */
async function bumpVersion(cb) {
  const packageJson = fs.readJSONSync('package.json');
  const packageLockJson = fs.existsSync('package-lock.json') ? fs.readJSONSync('package-lock.json') : undefined;
  const manifest = getManifest();
  const changelog = fs.existsSync('CHANGELOG.md') ? fs.readFileSync('CHANGELOG.md', 'utf-8') : undefined;
  const mainJs = fs.readFileSync('./src/main.js', 'utf-8');

  if (!manifest) cb(Error(chalk.red('Manifest JSON not found')));

  try {
    const release = argv.release || argv.r;
    const currentVersion = packageJson.version;

    if (!release) return cb(Error(chalk.red('Missing release type')));

    const targetVersion = getTargetVersion(currentVersion, release);

    if (!targetVersion) return cb(Error(chalk.red('Incorrect version arguments')));
    if (targetVersion === currentVersion) return cb(Error(chalk.red('Target version is identical to current version')));

    console.log(`Updating version number to ${targetVersion}`);

    packageJson.version = targetVersion;
    fs.writeJSONSync('package.json', packageJson, { spaces: '  ' });
    console.log('  Updated: package.json');

    if (packageLockJson) {
      packageLockJson.version = targetVersion;
      fs.writeJSONSync('package-lock.json', packageLockJson, { spaces: '  ' });
      console.log('  Updated: package-lock.json');
    }

    manifest.file.version = targetVersion;
    fs.writeJSONSync(manifest.name, manifest.file, { spaces: '  ' });
    console.log(`  Updated: manifest ${manifest.name}`);

    if (changelog) {
      const pad = s => s < 10 ? '0' + s : s;
      const d = new Date(Date.now());
      const date = [pad(d.getFullYear()), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
      const rgx = /^## \[.*\].*$/m;
      const newChangelog = changelog.replace(rgx, `## [${targetVersion}] - ${date}`);
      if (newChangelog !== changelog) {
        fs.writeFileSync('CHANGELOG.md', newChangelog, 'utf-8');
        console.log(`  Updated: changelog with date ${date}`);
      }
      else {
        console.warn(chalk.yellow('  No change for the changelog'));
      }
    }

    if (mainJs) {
      const rgx = /(?<=^ \* Version: )(.+?)(?=\s{2,})/m;
      const newMainJs = mainJs.replace(rgx, targetVersion);
      if (newMainJs !== mainJs) {
        fs.writeFileSync('./src/main.js', newMainJs, 'utf-8');
        console.log('  Updated: src/main.js');
      }
      else {
        console.warn(chalk.yellow('  No change for main.js'));
      }
    }
  }
  catch (error) {
    cb(error);
  }
  return cb();
}

/* -------------------------------------------- */

exports.build = gulp.series(buildCode);
exports.watch = gulp.series(buildWatch);
exports.bump = gulp.series(bumpVersion, buildCode);
exports.release = commitTagPush;
