import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Database } from '../data/database';
import { BACKUP_SIZE_LIMIT, createSnapshot, validateBackup, type Backup } from './backup';
import i18n from '../i18n';

export type PreparedBackup = { uri: string; filename: string; snapshot: Backup };
export type SelectedBackup = { filename: string; backup: Backup };
export type BackupSelectionFailure = 'oversized' | 'read' | 'invalid' | 'unsupported';
export class BackupSelectionError extends Error {
  constructor(
    public readonly reason: BackupSelectionFailure,
    public readonly filename: string,
  ) {
    super(reason);
  }
}
export async function prepareBackup(db: Database): Promise<PreparedBackup> {
  const snapshot = createSnapshot(db);
  const content = JSON.stringify(snapshot, null, 2);
  let utf8Size = 0;
  for (const character of content) {
    const codePoint = character.codePointAt(0)!;
    utf8Size += codePoint < 0x80 ? 1 : codePoint < 0x800 ? 2 : codePoint < 0x10000 ? 3 : 4;
    if (utf8Size > BACKUP_SIZE_LIMIT) throw new Error('Backup too large');
  }
  const filename = `backup-${Date.now()}.json`;
  const file = new File(Paths.cache, filename);
  await file.write(content);
  return { uri: file.uri, filename, snapshot };
}
export async function sharePreparedBackup(file: PreparedBackup): Promise<void> {
  if (!new File(file.uri).exists) throw new Error('Prepared backup is no longer available.');
  if (!(await Sharing.isAvailableAsync()))
    throw new Error('Sharing is not available on this device.');
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: i18n.t('shareBackup'),
  });
}
export async function shareBackup(db: Database): Promise<void> {
  await sharePreparedBackup(await prepareBackup(db));
}
export async function selectBackup(): Promise<SelectedBackup | undefined> {
  const selection = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (selection.canceled) return undefined;
  const asset = selection.assets[0];
  const filename = asset.name;
  let file: File;
  try {
    file = new File(asset.uri);
  } catch {
    throw new BackupSelectionError('read', filename);
  }
  let size: number;
  try {
    size = Math.max(asset.size ?? 0, file.size);
  } catch {
    throw new BackupSelectionError('read', filename);
  }
  if (size > BACKUP_SIZE_LIMIT) throw new BackupSelectionError('oversized', filename);
  let text: string;
  try {
    text = await file.text();
  } catch {
    throw new BackupSelectionError('read', filename);
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new BackupSelectionError('invalid', filename);
  }
  try {
    return { filename, backup: validateBackup(value) };
  } catch (error) {
    const reason =
      error instanceof Error && error.message.startsWith('Unsupported backup format')
        ? 'unsupported'
        : 'invalid';
    throw new BackupSelectionError(reason, filename);
  }
}
export async function pickBackup(): Promise<Backup | undefined> {
  return (await selectBackup())?.backup;
}
