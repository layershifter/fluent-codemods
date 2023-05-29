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
    },

    backdrop: slot(backdrop, { elementType: 'span' }),
  };
};
