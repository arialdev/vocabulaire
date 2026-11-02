import { usePreventRemove } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

export function useUnsavedGuard(dirty: boolean) {
  const { t } = useTranslation();
  const [discarding, setDiscarding] = useState(false);
  return usePreventRemove(dirty && !discarding, ({ repeat }) => {
    Alert.alert(t('discardTitle'), t('discardMessage'), [
      { text: t('keepEditing'), style: 'cancel' },
      {
        text: t('discard'),
        style: 'destructive',
        onPress: () => {
          setDiscarding(true);
          repeat();
        },
      },
    ]);
  });
}
