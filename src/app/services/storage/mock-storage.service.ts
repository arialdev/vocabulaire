import {Injectable} from '@angular/core';
import {AbstractStorageService} from './abstract-storage-service';

@Injectable({
  providedIn: 'root'
})
export class MockStorageService implements AbstractStorageService {
  private storage: Map<string, any>;

  constructor() {
    this.storage = new Map<string, any>();
    this.storage.set('settings', {darkMode: false, language: 'en'});
    this.storage.set('collections', []);
  }

  get(key: string): Promise<any> {
    return Promise.resolve(this.storage.get(key) ?? null);
  }

  set(key: string, value: any): Promise<any> {
    this.storage.set(key, value);
    return Promise.resolve(value);
  }

  remove(key: string): Promise<any> {
    return Promise.resolve(this.storage.delete(key));
  }
}
