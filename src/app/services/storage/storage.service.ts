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
    if (!this.myStorage) {
      await this.init();
    }
    const res = {};
    const keys = await this.myStorage.keys();
    for (const k of keys) {
      res[k] = await this.myStorage.get(k);
    }
    const path = `vocabulaire_data_${new Date().getTime()}.json`;
    const savedFile = await this.fileService.saveFileInCache(path, JSON.stringify(res), Encoding.UTF8);
    await this.fileService.shareFile(savedFile.uri, 'Export your data file');
  }

  public async importData(file: File) {
    const content: any = JSON.parse(await file.text());
    const keys = Object.keys(content);
    for (const k of keys) {
      await this.set(k, content[k]);
    }
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
