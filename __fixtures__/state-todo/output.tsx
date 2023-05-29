import * as React from 'react';
import { slot } from '@fluentui/react-utilities';
import type { SkeletonProps, SkeletonState } from './Skeleton.types';

export const useSkeleton_unstable = (props: SkeletonProps, ref: React.Ref<HTMLElement>): SkeletonState => {
  const root = slot({}, { required: true, elementType: /* * TODO FIXME: elementType */ 'div' });

  return {
    components: {
      root: 'span',
    },
  };
};
