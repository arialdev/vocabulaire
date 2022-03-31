import {Category} from './category';
import {CategoryType} from '../../enums/enums';

describe('Category', () => {

  let category: Category;
  let type: CategoryType;

  beforeEach(() => {
    type = CategoryType.thematic;
    category = new Category('body', type);
    spyOn(category, 'updateUpdatedTime');
  });

  it('should create an instance', () => {
    expect(category).toBeTruthy();
    category = new Category('body', type);
    expect(new Category(JSON.parse(JSON.stringify(category)))).toEqual(category);
  });

  it('should get name', () => {
    expect(category.getName()).toEqual('body');
  });

  it('should update name', () => {
    category.setName('swear');
    expect(category.getName()).toEqual('swear');
    expect(category.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should get category type', () => {
    expect(category.getType()).toEqual(type);
  });

  it('should update type', () => {
    const newType = CategoryType.gramatical;
    category.setType(newType);
    expect(category.getType()).toEqual(newType);
    expect(category.updateUpdatedTime).toHaveBeenCalled();
  });
});
