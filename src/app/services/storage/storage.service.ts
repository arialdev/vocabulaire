import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import {Collection} from '../../classes/collection/collection';
import {AbstractStorageService} from './abstract-storage-service';
import {Encoding} from '@capacitor/filesystem';
import {FileService} from '../fileService/file.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService implements AbstractStorageService {

  private myStorage: Storage | null = null;

  constructor(private storage: Storage, private fileService: FileService) {
    this.init();
  }

  public async set(key: string, value: any): Promise<any> {
    if (!this.myStorage) {
      await this.init();
    }
    return this.myStorage.set(key, value);
  }

  public async get(key: string): Promise<any> {
    if (!this.myStorage) {
      await this.init();
    }
    return this.myStorage.get(key);
  }

  public async remove(key: string) {
    if (!this.myStorage) {
      await this.init();
    }
    return this.myStorage.remove(key);
  }

  public async exportData() {
    const res = await this.getAllData();
    const path = `vocabulaire_data_${new Date().getTime()}.json`;
    const savedFile = await this.fileService.saveFileInCache(path, JSON.stringify(res), Encoding.UTF8);
    await this.fileService.shareFile(savedFile.uri, 'Export your data file');
  }

  public async importData(file: File): Promise<boolean> {
    const oldData = await this.getAllData();
    let content;
    let keys: string[];
    try {
      content = JSON.parse(await file.text());
      keys = Object.keys(content);
    } catch (_) {
      throw new Error('Corrupted file');
    }
    try {
      content.settings.darkMode ??= false;
      content.settings.preferredLanguage ??= {prefix: 'en', name: 'English'};
      content.settings.initialized ??= true;
      for (const k of keys) {
        await this.set(k, content[k]);
      }
      (await this.get('collections')).map(c => new Collection(c));
    } catch (_) {
      await this.storage.clear();
      const oldKeys = Object.keys(oldData);
      for (const k of oldKeys) {
        await this.set(k, oldData[k]);
      }
      throw new Error('File has corrupted data');
    }
    return true;
  }

  private async getAllData() {
    if (!this.myStorage) {
      await this.init();
    }
    const res = {};
    const keys = await this.myStorage.keys();
    for (const k of keys) {
      res[k] = await this.myStorage.get(k);
    }
    return res;
  }

  private async init() {
    await this.storage.defineDriver(CordovaSQLiteDriver);
    this.myStorage = await this.storage.create();
    await this.initializeDB();
  }

  private async initializeDB() {
    await Promise.all([this.initializeSettings(), this.initializeCollections()]);
  }

  private async initializeSettings() {
    const settings = await this.get('settings');
    const defaultSettings = {darkMode: false, preferredLanguage: {prefix: 'en', name: 'English'}};
    await this.set('settings', {...defaultSettings, ...settings});
  }

  private async initializeCollections() {
    if (await this.get('collections')) {
      return;
    }
    const collections: Collection[] = [];
    await this.set('collections', collections);
  }
}
