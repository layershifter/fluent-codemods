import * as React from 'react';
import {
  getNativeElementProps,
  slot,
  useEventCallback,
  useMergedRefs,
  isResolvedShorthand,
} from '@fluentui/react-utilities';
import type { DialogSurfaceElement, DialogSurfaceProps, DialogSurfaceState } from './DialogSurface.types';

export const useDialogSurface_unstable = (
  props: DialogSurfaceProps,
  ref: React.Ref<DialogSurfaceElement>,
): DialogSurfaceState => {
  const { backdrop, as } = props;

  return {
    components: {
      backdrop: 'span',
      root: 'h1',
    },

    backdrop: slot(backdrop, {
      required: open && modalType !== 'non-modal',
      elementType: 'span',
    }),

    root: slot(
      getNativeElementProps(as ?? 'div', {
        ...modalAttributes,

        tabIndex: -1, // https://github.com/microsoft/fluentui/issues/25150
        'aria-modal': modalType !== 'non-modal',
        role: modalType === 'alert' ? 'alertdialog' : 'dialog',
        'aria-labelledby': props['aria-label'] ? undefined : dialogTitleID,

        ...props,

        onKeyDown: handleKeyDown,
        ref: useMergedRefs(ref, dialogRef),
      }),
      { required: true, elementType: 'h1' },
    ),
  };
};
