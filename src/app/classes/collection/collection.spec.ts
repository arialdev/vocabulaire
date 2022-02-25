import {Collection} from './collection';

describe('Collection', () => {
  it('should create an instance', () => {
    expect(new Collection('Sample', 'SL', 'icon')).toBeTruthy();
  });
});
