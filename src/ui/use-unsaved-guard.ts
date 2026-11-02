import { usePreventRemove } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmation } from './confirmation-provider';

export function useUnsavedGuard(dirty: boolean, onKeepEditing?: () => void) {
  const { t } = useTranslation();
  const [discarding, setDiscarding] = useState(false);
  const confirm = useConfirmation();
  return usePreventRemove(dirty && !discarding, ({ repeat }) => {
    confirm({
      title: t('discardTitle'),
      message: t('discardMessage'),
      cancel: t('keepEditing'),
      confirm: t('discard'),
      destructive: true,
      onCancel: onKeepEditing,
      onConfirm: () => {
        setDiscarding(true);
        repeat();
      },
    });
  });
}
