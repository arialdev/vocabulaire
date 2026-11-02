import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Database } from '../data/database';
import { createSnapshot, validateBackup, type Backup } from './backup';
import i18n from '../i18n';

export async function shareBackup(db: Database): Promise<void> {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error('Sharing is not available on this device.');
  const file = new File(Paths.cache, `vocabulaire-backup-${Date.now()}.json`);
  await file.write(JSON.stringify(createSnapshot(db), null, 2));
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: i18n.t('shareBackup'),
  });
}

export async function pickBackup(): Promise<Backup | undefined> {
  const selection = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (selection.canceled) return undefined;
  const file = new File(selection.assets[0].uri);
  if (file.size > 25 * 1024 * 1024) throw new Error('Backup exceeds the 25 MB import limit.');
  let value: unknown;
  try {
    value = JSON.parse(await file.text());
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  return validateBackup(value);
}
