// https://www.npmjs.com/package/rollup-plugin-license
const license = require('rollup-plugin-license');
const { compatibleCoreVersion } = require('./system.json');

module.exports = {
  input: './src/main.js',
  output: {
    file: './dist/yzur.js',
    format: 'es',
    plugins: [
      license({
        // sourcemap: true,
        // cwd: '.',
        banner: {
          commentStyle: 'regular',
          content: {
            file: './src/LICENCE_BANNER',
            encoding: 'utf-8',
          },
          data() {
            return {
              foundryVersion: compatibleCoreVersion,
            };
          },
        },
      }),
    ],
  },
};