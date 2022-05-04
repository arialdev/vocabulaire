import {TestBed} from '@angular/core/testing';

import {StorageService} from './storage.service';
import {Drivers} from '@ionic/storage';
import {IonicStorageModule} from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FileService} from '../fileService/file.service';
import {MockFileService} from '../../../mocks';
import {Collection} from '../../classes/collection/collection';
import {Emoji} from '../../classes/emoji/emoji';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IonicStorageModule.forRoot({
        // eslint-disable-next-line no-underscore-dangle
        driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB],
      }),],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{provide: FileService, useClass: MockFileService}]
    });
    service = TestBed.inject(StorageService);
  });

  afterEach(async () => {
    await service.remove('settings');
    await service.remove('collections');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should get existing value', (done) => {
    service.get('settings').then(s => {
      expect(s).toEqual({darkMode: false, preferredLanguage: {prefix: 'en', name: 'English'}});
      done();
    });
  });

  it('should not get non existing vale', (done) => {
    service.get('null').then(item => {
      expect(item).toBeFalsy();
      done();
    });
  });

  it('should set new value', (done) => {
    service.set('key', 'value').then(res => {
      expect(res).toEqual('value');
      service.get('key').then(item => {
        expect(item).toEqual('value');
        done();
      });
    });
  });

  it('should remove existing element', (done) => {
    service.remove('sample').then(() => {
      service.get('sample').then(e => {
        expect(e).toBeNull();
        done();
      });
    });
  });

  it('should export data', async () => {
    const fileService = TestBed.inject(FileService);
    spyOn(fileService, 'saveFileInCache').and.callThrough();
    spyOn(fileService, 'shareFile').and.callThrough();
    await service.exportData();
    expect(fileService.saveFileInCache).toHaveBeenCalledBefore(fileService.shareFile);
  });

  it('should import data', async () => {
    const data = {
      collections: [new Collection('c', 'c', new Emoji('', ''))],
      settings: {darkMode: true, preferredLanguage: {prefix: 'en', name: 'English'}, initialized: true}
    };
    let res = await service.importData(new File([JSON.stringify(data)], 'data.json', {type: 'text/plain'}));
    expect(res).toBeTrue();

    res = await service.importData(new File([JSON.stringify({collections: [], settings: {}})],
      'data.json', {type: 'text/plain'}));
    expect(res).toBeTrue();
  });

  it('should return corrupted file error when importing wrong file', async () => {
    const file = new File(['file content'], 'data.json', {type: 'text/plain'});
    await expectAsync(service.importData(file)).toBeRejectedWithError('Corrupted file');
  });

  it('should return corrupted data error when importing file with ambiguous data', async () => {
    const data = {
      collections: ['fake data'],
      settings: {darkMode: true, preferredLanguage: {prefix: 'en', name: 'English'}, initialized: true}
    };
    const file = new File([JSON.stringify(data)], 'data.json', {type: 'text/plain'});
    await expectAsync(service.importData(file)).toBeRejectedWithError('File has corrupted data');
  });
});
