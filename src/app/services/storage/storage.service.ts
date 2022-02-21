import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import {Collection} from '../../interfaces/collection';
import {Language} from '../../interfaces/language';
import {Term} from '../../interfaces/term';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private myStorage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  public set(key: string, value: any): Promise<any> {
    if (this.myStorage) {
      return this.myStorage.set(key, value);
    } else {
      return this.init().then(_ => this.set(key, value));
    }
  }

  public get(key: string): Promise<any> {
    if (this.myStorage) {
      return this.myStorage.get(key);
    } else {
      return this.init().then(_ => this.get(key));
    }
  }

  public async getNextFreeId(key: string): Promise<number> {
    if (!this.myStorage) {
      return this.init().then(_ => this.getNextFreeId(key));
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

  // private async mockCollection() {
  //   const spanish: Language = {
  //     id: 1,
  //     name: 'Spanish',
  //     icon: 'assets/img/emojis/es.png',
  //     status: true,
  //     createdAt: new Date().getTime(),
  //     updatedAt: new Date().getTime(),
  //     prefix: 'es'
  //   };
  //
  //   const term1: Term = {
  //     collection: undefined,
  //     createdAt: new Date().getTime(),
  //     originalTerm: 'Mano',
  //     gramaticalCategories: [],
  //     id: 1,
  //     notes: 'No confundir con manecilla de reloj',
  //     thematicCategories: [],
  //     translatedTerm: 'Hand',
  //     updatedAt: new Date().getTime(),
  //     status: true,
  //   };
  //
  //   const collection: Collection = {
  //     id: 1,
  //     status: true,
  //     createdAt: new Date().getTime(),
  //     gramaticalCategories: [],
  //     active: true,
  //     language: spanish,
  //     updatedAt: new Date().getTime(),
  //     tags: [],
  //     terms: [term1],
  //     thematicCategories: [],
  //   };
  //   const collections: Collection[] = [collection];
  //   await this.myStorage.set('collections', collections);
  // }
}
