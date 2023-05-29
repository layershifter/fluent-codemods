import * as React from 'react';

import { Avatar } from '@fluentui/react-avatar';
import { Button } from '@fluentui/react-button';
import { CheckmarkCircleFilled, DismissCircleFilled, InfoFilled, WarningFilled } from '@fluentui/react-icons';
import { getNativeElementProps, slot } from '@fluentui/react-utilities';

import type { AlertProps, AlertState } from './Alert.types';

export const useAlert_unstable = (props: AlertProps, ref: React.Ref<HTMLElement>): AlertState => {
  const { appearance = 'primary', intent } = props;

  /** Determine the role and icon to render based on the intent */
  let defaultIcon;
  let defaultRole = 'status';
  switch (intent) {
    case 'success':
      defaultIcon = <CheckmarkCircleFilled />;
      break;
    case 'error':
      defaultIcon = <DismissCircleFilled />;
      defaultRole = 'alert';
      break;
    case 'warning':
      defaultIcon = <WarningFilled />;
      defaultRole = 'alert';
      break;
    case 'info':
      defaultIcon = <InfoFilled />;
      break;
  }

  const action = slot(props.action, { defaultProps: { appearance: 'transparent' }, elementType: Button });
  const avatar = slot(props.avatar, { elementType: Avatar });
  let icon;
  if (!avatar) {
    icon = slot(props.icon, { defaultProps: { children: defaultIcon }, required: !!props.intent, elementType: 'span' });
  }
  return {
    action,
    appearance,
    avatar,
    components: { root: 'div', icon: 'span', action: Button, avatar: Avatar },
    icon,
    intent,
    root: slot(
      getNativeElementProps('div', {
        ref,
        role: defaultRole,
        children: props.children,
        ...props,
      }),
      { required: true, elementType: 'div' },
    ),
  };
};
