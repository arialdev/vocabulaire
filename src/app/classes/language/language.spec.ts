import {Language} from './language';

describe('Language', () => {
  it('should create an instance', () => {
    const name = 'Sample';
    const prefix = 'SA';
    const icon = 'icon';
    expect(new Language(name, prefix, icon)).toBeTruthy();
  });
});
