// import {TestBed} from '@angular/core/testing';
//
// import {StorageService} from './storage.service';
// import {Storage} from '@ionic/storage';
//
// describe('StorageService', () => {
//   let service: StorageService;
//
//   const storageIonicMock: any = {
//     defineDriver: () => undefined,
//     create: () => new Promise<any>((resolve, reject) => resolve(this)),
//     get: (key) => new Promise<any>((resolve, reject) => resolve({darkMode: false, language: 'en'})),
//     set: () => new Promise<any>((resolve, reject) => resolve('As2342fAfgsdr'))
//   };
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [],
//       providers: [
//         {
//           provide: Storage,
//           useValue: storageIonicMock
//         }
//       ]
//     });
//     service = TestBed.inject(StorageService);
//   });
//
//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });
//
//   it('should get settings', (done) => {
//     spyOn(service, 'get');
//     service.get('settings').then(item => {
//       expect(item).toEqual({darkMode: false, language: 'en'});
//       done();
//     });
//   });
// });
