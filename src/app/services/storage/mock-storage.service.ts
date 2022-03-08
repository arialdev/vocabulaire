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

  getNextFreeId(key: string): Promise<any> {
    const values = this.storage.get(key);
    if (!values) {
      console.error('Error when getting collections from storage');
      return Promise.resolve();
    } else if (!Array.isArray(values)) {
      console.error('Value is not an array!');
      return Promise.resolve();
    }
    if (values.every(v => v.id)) {
      return Promise.resolve((values[values.length - 1]?.id ?? 0) + 1);
    }
    return Promise.resolve();
  }

}
