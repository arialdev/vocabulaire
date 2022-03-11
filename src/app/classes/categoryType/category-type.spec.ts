import {CategoryType} from './category-type';

describe('CategoryType', () => {

  let categoryType: CategoryType;

  beforeEach(() => {
    categoryType = new CategoryType('thematic');
  });

  it('should create an instance', () => {
    expect(categoryType).toBeTruthy();
  });

  it('should get name', () => {
    expect(categoryType.getName()).toEqual('thematic');
  });

  it('should update name', () => {
    spyOn(categoryType, 'updateUpdatedTime');
    categoryType.setName('gramatical');
    expect(categoryType.getName()).not.toEqual('thematic');
    expect(categoryType.getName()).toEqual('gramatical');
    expect(categoryType.updateUpdatedTime).toHaveBeenCalled();
  });
});
