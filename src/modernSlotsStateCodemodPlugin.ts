import { NodePath, PluginObj, PluginPass, types as t } from '@babel/core';
import { cloneNode, addComment } from '@babel/types';
import { declare } from '@babel/helper-plugin-utils';
import { markFileAsChanged, markFileAsContainsTodo } from './utils';

type ModernSlotsStateCodemodPlugin = PluginPass & {
  components?: Record<string, t.Identifier | t.StringLiteral | t.Expression>;
};

function getElementType(
  state: ModernSlotsStateCodemodPlugin,
  path: NodePath<t.Identifier>,
): t.Identifier | t.StringLiteral | t.Expression {
  const objectPropertyPath = path.findParent(path => path.isObjectProperty()) as NodePath<t.ObjectProperty> | null;

  if (objectPropertyPath) {
    const objectKeyPath = objectPropertyPath.get('key');

    if (!objectKeyPath.isIdentifier()) {
      throw objectKeyPath.buildCodeFrameError('invalid slot name');
    }

    if (state.components![objectKeyPath.node.name]) {
      return cloneNode(state.components![objectKeyPath.node.name], true);
    }
  }

  if (path.parentPath.isCallExpression()) {
    const firstArgumentPath = path.parentPath.get('arguments.0') as NodePath<t.Node> | null;

    if (firstArgumentPath?.isMemberExpression()) {
      const objectPath = firstArgumentPath.get('object');
      const propertyPath = firstArgumentPath.get('property');

      if (objectPath.isIdentifier({ name: 'props' }) && propertyPath.isIdentifier()) {
        if (state.components![propertyPath.node.name]) {
          return cloneNode(state.components![propertyPath.node.name], true);
        }
      }
    }

    if (firstArgumentPath?.isIdentifier()) {
      if (state.components![firstArgumentPath.node.name]) {
        return cloneNode(state.components![firstArgumentPath.node.name], true);
      }
    }

    const calleePath = path.parentPath.get('callee');

    if (calleePath.isIdentifier({ name: 'getNativeElementProps' })) {
      return cloneNode(state.components!.root, true);
    }
  }

  markFileAsContainsTodo(state);

  return addComment(t.stringLiteral('div'), 'leading', ' * TODO FIXME: elementType ');
}

export const modernSlotsStateCodemodPlugin = declare<Partial<never>, PluginObj<ModernSlotsStateCodemodPlugin>>(api => {
  api.assertVersion(7);

  return {
    name: '@griffel/webpack-extraction-plugin/babel',

    visitor: {
      Program: {
        enter(programPath, state) {
          state.components = {};

          programPath.traverse({
            Identifier: {
              enter(path) {
                const name = path.node.name;

                if (name === 'components' && path.parentPath.isObjectProperty()) {
                  const objectExpressionPath = path.parentPath.get('value');

                  if (!objectExpressionPath) {
                    throw path.parentPath.buildCodeFrameError('invalid components');
                  }

                  if (!objectExpressionPath.isObjectExpression()) {
                    return;
                  }

                  state.components = Object.fromEntries(
                    objectExpressionPath.get('properties').map(propertyPath => {
                      if (propertyPath.isObjectProperty()) {
                        const keyPath = propertyPath.get('key');
                        let valuePath = propertyPath.get('value');

                        if (!keyPath.isIdentifier()) {
                          throw keyPath.buildCodeFrameError('invalid slot name');
                        }

                        if (valuePath.isTSAsExpression()) {
                          valuePath = valuePath.get('expression');
                        }

                        if (!valuePath.isStringLiteral() && !valuePath.isIdentifier() && !valuePath.isExpression()) {
                          throw valuePath.buildCodeFrameError('invalid slot value');
                        }

                        return [keyPath.node.name, valuePath.node];
                      }

                      return [];
                    }),
                  );
                }
              },
            },
          });
        },
        exit(programPath, state) {
          programPath.traverse({
            Identifier(path) {
              const name = path.node.name;

              if (name === 'resolveShorthand') {
                path.replaceWith(t.identifier('slot'));

                markFileAsChanged(state);
                state.usesSlot = true;

                if (path.parentPath.isCallExpression()) {
                  const argumentsPath = path.parentPath.get('arguments');

                  if (argumentsPath.length === 1) {
                    path.parentPath.pushContainer(
                      'arguments',
                      t.objectExpression([t.objectProperty(t.identifier('elementType'), getElementType(state, path))]),
                    );
                  } else if (argumentsPath.length === 2) {
                    if (argumentsPath[1].isObjectExpression()) {
                      argumentsPath[1].pushContainer(
                        'properties',
                        t.objectProperty(t.identifier('elementType'), getElementType(state, path)),
                      );
                    }
                  }
                }
              }

              if (name === 'getNativeElementProps') {
                if (path.parentPath.isCallExpression()) {
                  const replacement = t.callExpression(t.identifier('slot'), [
                    cloneNode(path.parentPath.node, true),
                    t.objectExpression([
                      t.objectProperty(t.identifier('required'), t.booleanLiteral(true)),
                      t.objectProperty(t.identifier('elementType'), getElementType(state, path)),
                    ]),
                  ]);

                  path.parentPath.replaceWith(replacement);
                  path.parentPath.skip();

                  state.usesSlot = true;
                  markFileAsChanged(state);
                }
              }
            },
          });

          programPath.traverse({
            ImportDeclaration(path) {
              if (!state.usesSlot) {
                return;
              }

              if (path.get('source').isStringLiteral({ value: '@fluentui/react-utilities' })) {
                const hasSpecifier = !!path.get('specifiers').find(specifierPath => {
                  return (
                    specifierPath.isImportSpecifier() && specifierPath.get('imported').isIdentifier({ name: 'slot' })
                  );
                });

                if (!hasSpecifier) {
                  path.pushContainer('specifiers', t.importSpecifier(t.identifier('slot'), t.identifier('slot')));
                  markFileAsChanged(state);
                }
              }
            },
          });
        },
      },
    },
  };
});
