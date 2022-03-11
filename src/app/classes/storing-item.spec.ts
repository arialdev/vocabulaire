import {StoringItem} from './storing-item';
import {mockTimeLapse} from '../../mocks';

describe('StoringItem', () => {
  let storingItem: StoringItem;

  beforeEach(() => {
    storingItem = new StoringItem();
  });
  it('should create an instance', () => {
    expect(storingItem).toBeTruthy();
  });

  it('should get default id', () => {
    expect(storingItem.getId()).toBeUndefined();
  });

  it('should update id', () => {
    spyOn(storingItem, 'updateUpdatedTime');
    storingItem.setId(12);
    expect(storingItem.getId()).toBe(12);
    expect(storingItem.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should get default status', () => {
    expect(storingItem.getStatus()).toBeTrue();
  });

  it('should update status', () => {
    spyOn(storingItem, 'updateUpdatedTime');
    storingItem.setStatus(false);
    expect(storingItem.getStatus()).toBeFalse();
    expect(storingItem.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should get creation time', () => {
    expect(storingItem.getCreationTime()).toBeTruthy();
  });

  it('should update updating time', () => {
    mockTimeLapse(storingItem.getUpdatingTime(), (previousTime) => {
      storingItem.updateUpdatedTime();
      expect(previousTime).not.toBe(storingItem.getUpdatingTime());
    });
  });
});
