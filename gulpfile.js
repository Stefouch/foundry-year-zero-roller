const dotenv = require('dotenv');
const execa = require('execa');
const fs = require('fs-extra');
const gulp = require('gulp');
const path = require('path');
const { rollup } = require('rollup');
const rollupConfig = require('./rollup.config.js');
const semver = require('semver');
const { argv } = require('process');

/* -------------------------------------------- */
/*  Configuration                               */
/* -------------------------------------------- */

const repoName = path.basename(path.resolve('.'));
const sourceDirectory = './src';
const distDirectory = './dist';
const sourceFileExtension = 'js';

// Loads environment variables
const result = dotenv.config();
if (result.error) throw result.error;
const env = process.env.NODE_ENV || 'development';
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
  const { version } = fs.readJSONSync('package.json');
  const commitMsg = `chore: release v${version}`;
  await execa('git', ['add', '-A'], { stdio });
  await execa('git', ['commit', '--message', commitMsg], { stdio });
  await execa('git', ['tag', `${version}`], { stdio });
  await execa('git', ['push', 'upstream'], { stdio });
  await execa('git', ['push', 'upstream', '--tag'], { stdio });
  return;
}

/**
 * Updates dependencies
 */
async function update() {
  await execa('npm', ['outdated'], { stdio });
  await execa('npm', ['update'], { stdio });
  return;
}

/**
 * Updates version.
 */
async function bumpVersion(cb) {
  const packageJson = fs.readJSONSync('package.json');
  const packageLockJson = fs.existsSync('package-lock.json') ? fs.readJSONSync('package-lock.json') : undefined;
  const manifest = getManifest();
  let changelog = fs.existsSync('CHANGELOG.md') ? fs.readFileSync('CHANGELOG.md') : undefined;

  if (!manifest) cb(Error('Manifest JSON not found'));

  try {
    const release = argv.release || argv.r;
    const currentVersion = packageJson.version;

    if (!release) return cb(Error('Missing release type'));

    const targetVersion = getTargetVersion(currentVersion, release);

    if (!targetVersion) return cb(Error('Incorrect version arguments'));
    if (targetVersion === currentVersion) return cb(Error('Target version is identical to current version'));

    console.log(`Updating version number to ${targetVersion}`);

    packageJson.version = targetVersion;
    fs.writeJSONSync('package.json', packageJson, { spaces: '  ' });

    if (packageLockJson) {
      packageLockJson.version = targetVersion;
      fs.writeJSONSync('package-lock.json', packageLockJson, { spaces: '  ' });
    }

    manifest.file.version = targetVersion;
    fs.writeJSONSync(manifest.name, manifest.file, { spaces: '  ' });

    if (changelog) {
      const pad = (s) => s < 10 ? '0' + s : s;
      const d = new Date(Date.now());
      const date = [pad(d.getFullYear), pad(d.getMonth + 1), pad(d.getDate)].join('-');
      const rgx = /^## \[(.*)\] - (.+)$/;
      changelog = changelog.replace(rgx, `## [${targetVersion}] - ${date}`);
      console.warn(changelog);
    }
  }
  catch (error) {
    cb(error);
  }
  return cb();
}

exports.build = gulp.series(buildCode);
exports.watch = gulp.series(buildWatch);
exports.bump = gulp.series(bumpVersion, update, buildCode);
exports.release = commitTagPush;