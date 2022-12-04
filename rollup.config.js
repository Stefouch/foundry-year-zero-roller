const eslint = require('@rollup/plugin-eslint');
const license = require('rollup-plugin-license');
const { readFileSync, writeFileSync } = require('fs');
const { compatibility } = require('./system.json');

module.exports = {
  input: './src/main.js',
  output: {
    file: './dist/yzur.js',
    format: 'es',
    // https://github.com/rollup/plugins
    plugins: [
      eslint({
        throwOnError: true,
      }),
      // Inline plugin
      {
        name: 'rollup-plugin-remove-inline-typedef',
        writeBundle(options) {
          const date = new Date().toISOString().split('T')[1].split('.')[0];
          console.log(`[${date}] Starting 'rollup-plugin-remove-inline-typedef'...`);
          const data = readFileSync(options.file, { encoding: 'utf-8' })
            .replace(/$\n^\/\*\* @typedef.*$/gm, match => {
              console.log(`Remove line: ${match.replace('\n', '')}`);
              return '';
            })
            .replace(/\n\n\n/gm, '\n\n');
          writeFileSync(options.file, data, { encoding: 'utf-8' });
        },
      },
      // https://www.npmjs.com/package/rollup-plugin-license
      license({
        // sourcemap: true,
        // cwd: '.',
        banner: {
          commentStyle: 'regular',
          content: {
            file: './src/LICENSE_BANNER',
            encoding: 'utf-8',
          },
          data() {
            return {
              foundryVersion: compatibility.minimum,
            };
          },
        },
      }),
    ],
  },
};
