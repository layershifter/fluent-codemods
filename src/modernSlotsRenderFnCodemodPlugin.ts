import { NodePath, PluginObj, types as t } from '@babel/core';
import { cloneNode } from '@babel/types';
import { declare } from '@babel/helper-plugin-utils';
import { markFileAsChanged } from './utils';

export const modernSlotsRenderFnCodemodPlugin = declare<Partial<never>, PluginObj>(api => {
  api.assertVersion(7);

  return {
    name: '@griffel/webpack-extraction-plugin/babel',

    visitor: {
      Identifier(path, state) {
        if (path.node.name === 'getSlotsNext') {
          path.replaceWith(t.identifier('assertSlots'));

          const variableDeclaration = path.findParent(path => path.isVariableDeclaration());

          if (variableDeclaration) {
            variableDeclaration.replaceWith(cloneNode(path.parentPath.node, true));
          }

          markFileAsChanged(state);
        }

        if (path.node.name === 'createElement') {
          const importDeclaration = path.findParent(path => path.isImportDeclaration());

          if (importDeclaration) {
            path.replaceWith(t.identifier('createElementNext'));
            markFileAsChanged(state);
          }
        }
      },

      Program: {
        exit(path, state) {
          state.file.ast.comments?.forEach(comment => {
            if (comment.value.includes('* @jsx createElement ')) {
              comment.value = '* @jsx createElementNext ';
            }
          });
        },
      },

      MemberExpression(path, state) {
        const objectPath = path.get('object');

        if (objectPath.isIdentifier({ name: 'slots' })) {
          objectPath.replaceWith(t.identifier('state'));
          markFileAsChanged(state);
        }

        if (objectPath.isIdentifier({ name: 'slotProps' })) {
          objectPath.replaceWith(t.identifier('state'));
          markFileAsChanged(state);
        }
      },

      JSXMemberExpression(path, state) {
        const objectPath = path.get('object');

        if (objectPath.isJSXIdentifier({ name: 'slots' })) {
          objectPath.replaceWith(t.jsxIdentifier('state'));
          const attributePath = path.parentPath;

          if (attributePath.isJSXOpeningElement()) {
            (attributePath.get('attributes') as NodePath<t.JSXAttribute>[]).forEach(attributePath => {
              attributePath.remove();
            });
          }

          markFileAsChanged(state);
        }
      },
    },
  };
});
