import * as React from 'react';
import { resolveShorthand } from '@fluentui/react-utilities';
import type { SkeletonProps, SkeletonState } from './Skeleton.types';

export const useSkeleton_unstable = (props: SkeletonProps, ref: React.Ref<HTMLElement>): SkeletonState => {
  const root = resolveShorthand({}, { required: true });

  return {
    components: {
      root: 'span',
    },
  };
};
