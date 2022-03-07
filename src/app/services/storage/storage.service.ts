import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import {Collection} from '../../interfaces/collection';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private myStorage: Storage | null = null;

  constructor(private storage: Storage) {
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

  public async getNextFreeId(key: string): Promise<number> {
    if (!this.myStorage) {
      await this.init();
    }

    const values = await this.myStorage.get(key);
    if (!values) {
      console.error('Error when getting collections from storage');
      return;
    } else if (!Array.isArray(values)) {
      console.error('Value is not an array!');
      return;
    }
    if (values.every(v => v.id)) {
      return (values[values.length - 1]?.id ?? 0) + 1;
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
    const defaultSettings = {darkMode: false, language: 'en'};
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
