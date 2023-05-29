#!/usr/bin/env node

import { transformAsync } from '@babel/core';
import * as fs from 'fs/promises';
import glob from 'tiny-glob';

import { modernSlotsStateCodemodPlugin } from './modernSlotsStateCodemodPlugin';
import { modernSlotsRenderFnCodemodPlugin } from './modernSlotsRenderFnCodemodPlugin';

async function main() {
  const files = await glob('**/{use,render}*.{ts,tsx}');

  let migratedCount = 0;
  let todoCount = 0;

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const result = await transformAsync(content, {
      filename: file,
      parserOpts: {
        plugins: ['jsx', 'typescript'],
      },
      retainLines: true,
      plugins: [modernSlotsStateCodemodPlugin, modernSlotsRenderFnCodemodPlugin],
    });

    if (result && (result.metadata as any).didChanges) {
      await fs.writeFile(file, result.code!);

      if ((result.metadata as any).containsTodo) {
        todoCount += 1;
        console.log('⚠️ Migrated with TODOs:' + file);
      } else {
        migratedCount += 1;
        console.log('✅ Migrated:' + file);
      }
    }
  }

  console.log('Migrated files: ' + migratedCount);
  console.log('Migrated files with TODOs: ' + todoCount);
}

await main();
