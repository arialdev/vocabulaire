import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

@Injectable({
  providedIn: 'root'
})
export class StorageServiceService {

  private myStorage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    await this.storage.defineDriver(CordovaSQLiteDriver);
    this.myStorage = await this.storage.create();
  }

  public set(key: string, value: any) {
    this.myStorage?.set(key, value);
  }

  public get(key: string) {
    return this.myStorage?.get(key);
  }
}
