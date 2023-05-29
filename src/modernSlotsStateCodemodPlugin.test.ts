import { pluginTester, prettierFormatter } from 'babel-plugin-tester';
import { modernSlotsStateCodemodPlugin } from './modernSlotsStateCodemodPlugin';
import * as path from 'path';
import * as fs from 'fs';

const fixturesDir = path.join(__dirname, '..', '__fixtures__');
const prettierConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../.prettierrc'), {
    encoding: 'utf-8',
  }),
);

pluginTester({
  plugin: modernSlotsStateCodemodPlugin,

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
      title: 'state modifications',
      fixture: path.resolve(fixturesDir, 'state', 'input.tsx'),
      outputFixture: path.resolve(fixturesDir, 'state', 'output.tsx'),
    },

    {
      title: 'state modifications (identifies on state)',
      fixture: path.resolve(fixturesDir, 'state-identifiers', 'input.tsx'),
      outputFixture: path.resolve(fixturesDir, 'state-identifiers', 'output.tsx'),
    },

    {
      title: 'state modifications (components destruction)',
      fixture: path.resolve(fixturesDir, 'state-components', 'input.tsx'),
      outputFixture: path.resolve(fixturesDir, 'state-components', 'output.tsx'),
    },

    {
      title: 'state modifications (getNativeElementProps)',
      fixture: path.resolve(fixturesDir, 'state-root', 'input.tsx'),
      outputFixture: path.resolve(fixturesDir, 'state-root', 'output.tsx'),
    },

    {
      title: 'state modifications (resolveShorthand without arguments)',
      fixture: path.resolve(fixturesDir, 'state-no-arguments', 'input.tsx'),
      outputFixture: path.resolve(fixturesDir, 'state-no-arguments', 'output.tsx'),
    },

    {
      title: 'state modifications (TODO)',
      fixture: path.resolve(fixturesDir, 'state-todo', 'input.tsx'),
      outputFixture: path.resolve(fixturesDir, 'state-todo', 'output.tsx'),
    },
  ],
});
