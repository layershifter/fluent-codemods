import { pluginTester, prettierFormatter } from 'babel-plugin-tester';
import * as path from 'path';
import * as fs from 'fs';

import { modernSlotsRenderFnCodemodPlugin } from './modernSlotsRenderFnCodemodPlugin';

const fixturesDir = path.join(__dirname, '..', '__fixtures__');
const prettierConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../.prettierrc'), {
    encoding: 'utf-8',
  }),
);

pluginTester({
  plugin: modernSlotsRenderFnCodemodPlugin,

  babelOptions: {
    parserOpts: {
      plugins: ['jsx', 'typescript'],
    },
    retainLines: true,
  },

  endOfLine: 'lf',
  formatResult: code =>
    prettierFormatter(code, {
      prettierOptions: {
        ...prettierConfig,
        parser: 'typescript',
      },
    }),

  tests: [
    {
      title: 'render function modifications',
      fixture: path.resolve(fixturesDir, 'render', 'input.tsx'),
      outputFixture: path.resolve(fixturesDir, 'render', 'output.tsx'),
    },

    {
      title: 'render function modifications (slotProps)',
      fixture: path.resolve(fixturesDir, 'render-slotProps', 'input.tsx'),
      outputFixture: path.resolve(fixturesDir, 'render-slotProps', 'output.tsx'),
    },
  ],
});
