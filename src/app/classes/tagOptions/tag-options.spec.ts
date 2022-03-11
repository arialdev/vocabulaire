import {CategorySelection, TagOptions} from './tag-options';
import {Category} from '../category/category';

describe('TagOptions', () => {
  let tagOptions: TagOptions;

  beforeEach(() => {
    tagOptions = new TagOptions('hello');
  });

  it('should create an instance', () => {
    expect(tagOptions).toBeTruthy();
  });

  it('should get search text', () => {
    expect(tagOptions.getSearchText()).toEqual('hello');
  });

  it('should set search text', () => {
    spyOn(tagOptions, 'updateUpdatedTime');
    tagOptions.setSearchText('bye');
    expect(tagOptions.getSearchText()).toEqual('bye');
    expect(tagOptions.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should get default gramatical and thematic categories', () => {
    expect(tagOptions.getGramaticalCategories()).toEqual([]);
    expect(tagOptions.getThematicCategories()).toEqual([]);
  });

  it('should add gramatical category', () => {
    spyOn(tagOptions, 'updateUpdatedTime');
    const gramaticalCategory = new Category('body', undefined);
    tagOptions.addGramaticalCategory(gramaticalCategory, true);
    expect(tagOptions.getGramaticalCategories()).toEqual([gramaticalCategory]);
    expect(tagOptions.updateUpdatedTime).toHaveBeenCalled();
  });


  describe('Categories filtering', () => {
    let c1: Category;
    let c2: Category;
    let c3: Category;
    beforeEach(() => {
      c1 = new Category('c1', undefined);
      c1.setId(1);
      c2 = new Category('c1', undefined);
      c2.setId(2);
      c3 = new Category('c1', undefined);
      c3.setId(3);
      tagOptions.addGramaticalCategory(c1, false);
      tagOptions.addGramaticalCategory(c2, true);
      tagOptions.addGramaticalCategory(c3, false);
      tagOptions.addThematicCategory(c1, false);
      tagOptions.addThematicCategory(c2, true);
      tagOptions.addThematicCategory(c3, false);
    });

    it('should get all gramatical categories', () => {
      expect(tagOptions.getGramaticalCategories(CategorySelection.all)).toEqual([c1, c2, c3]);
      expect(tagOptions.getGramaticalCategories()).toEqual([c1, c2, c3]);
    });

    it('should get selected gramatical categories', () => {
      expect(tagOptions.getGramaticalCategories(CategorySelection.selected)).toEqual([c2]);
    });

    it('should get selected gramatical categories', () => {
      expect(tagOptions.getGramaticalCategories(CategorySelection.nonSelected)).toEqual([c1, c3]);
    });
    it('should get all thematic categories', () => {
      expect(tagOptions.getThematicCategories(CategorySelection.all)).toEqual([c1, c2, c3]);
      expect(tagOptions.getThematicCategories()).toEqual([c1, c2, c3]);
    });

    it('should get selected thematic categories', () => {
      expect(tagOptions.getThematicCategories(CategorySelection.selected)).toEqual([c2]);
    });

    it('should get selected thematic categories', () => {
      expect(tagOptions.getThematicCategories(CategorySelection.nonSelected)).toEqual([c1, c3]);
    });
  });

  it('should remove gramatical category', () => {
    spyOn(tagOptions, 'updateUpdatedTime');
    const category = new Category('body', undefined);
    category.setId(12);
    tagOptions.addGramaticalCategory(category, true);
    expect(tagOptions.getGramaticalCategories()).toContain(category);
    tagOptions.removeGramaticalCategory(category.getId());
    expect(tagOptions.getGramaticalCategories()).not.toContain(category);
    expect(tagOptions.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should remove thematic category', () => {
    spyOn(tagOptions, 'updateUpdatedTime');
    const category = new Category('body', undefined);
    category.setId(12);
    tagOptions.addThematicCategory(category, true);
    expect(tagOptions.getThematicCategories()).toContain(category);
    tagOptions.removeThematicCategory(category.getId());
    expect(tagOptions.getThematicCategories()).not.toContain(category);
    expect(tagOptions.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should update existing gramatical category with different selection', () => {
    spyOn(tagOptions, 'updateUpdatedTime');
    const category = new Category('body', undefined);
    category.setId(12);
    tagOptions.addGramaticalCategory(category, true);
    expect(tagOptions.getGramaticalCategories(CategorySelection.selected)).toContain(category);
    expect(tagOptions.getGramaticalCategories(CategorySelection.nonSelected)).not.toContain(category);
    tagOptions.addGramaticalCategory(category, false);
    expect(tagOptions.getGramaticalCategories(CategorySelection.nonSelected)).toContain(category);
    expect(tagOptions.getGramaticalCategories(CategorySelection.selected)).not.toContain(category);
    expect(tagOptions.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should update existing thematic category with different selection', () => {
    spyOn(tagOptions, 'updateUpdatedTime');
    const category = new Category('body', undefined);
    category.setId(12);
    tagOptions.addThematicCategory(category, true);
    expect(tagOptions.getThematicCategories(CategorySelection.selected)).toContain(category);
    expect(tagOptions.getThematicCategories(CategorySelection.nonSelected)).not.toContain(category);
    tagOptions.addThematicCategory(category, false);
    expect(tagOptions.getThematicCategories(CategorySelection.nonSelected)).toContain(category);
    expect(tagOptions.getThematicCategories(CategorySelection.selected)).not.toContain(category);
    expect(tagOptions.updateUpdatedTime).toHaveBeenCalled();
  });

});
