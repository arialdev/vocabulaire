import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import {Collection} from '../interfaces/collection';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private myStorage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init().then(_ => this.initializeDB());
  }

  async init() {
    await this.storage.defineDriver(CordovaSQLiteDriver);
    this.myStorage = await this.storage.create();
  }

  public set(key: string, value: any): Promise<any> {
    return this.myStorage?.set(key, value);
  }

  public get(key: string): Promise<any> {
    return this.myStorage?.get(key);
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
