import {Term} from './term';
import {Collection} from '../collection/collection';
import {Category} from '../category/category';
import {CategoryType} from '../../enums/enums';
import {Emoji} from '../emoji/emoji';

describe('Term', () => {

  let collection: Collection;
  let term: Term;

  beforeEach(() => {
    collection = new Collection('Spanish', 'ES', new Emoji('es', 'flags'));
    term = new Term('Mano', 'Hand');
  });

  it('should create an instance', () => {
    expect(term).toBeTruthy();
    expect(new Term('a', 'b', 'c')).toBeTruthy();
    expect(new Term(JSON.parse(JSON.stringify(term)))).toEqual(term);
    expect(new Term({
      ...JSON.parse(JSON.stringify(term)),
      gramaticalCategories: [new Category('noun', CategoryType.thematic)],
      thematicCategories: [new Category('body', CategoryType.gramatical)],
    })).toBeTruthy();
  });

  it('should get originalTerm', () => {
    expect(term.getOriginalTerm()).toEqual('Mano');
  });

  it('should set originalTerm', () => {
    spyOn(term, 'updateUpdatedTime');
    term.setOriginalTerm('Sample');
    expect(term.getOriginalTerm()).toEqual('Sample');
    expect(term.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should get translated', () => {
    expect(term.getTranslatedTerm()).toEqual('Hand');
  });

  it('should set translatedTerm', () => {
    spyOn(term, 'updateUpdatedTime');
    term.setTranslatedTerm('Sample');
    expect(term.getTranslatedTerm()).toEqual('Sample');
    expect(term.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should get default notes', () => {
    expect(term.getNotes()).toEqual('');
    expect(new Term('a', 'b', 'c').getNotes()).toEqual('c');
  });

  it('should update notes', () => {
    spyOn(term, 'updateUpdatedTime');
    const newNote = 'Esto es una nota';
    term.setNotes(newNote);
    expect(term.getNotes()).toEqual(newNote);
    expect(term.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should get default Status', () => {
    expect(term.getStatus()).toBeTrue();
  });

  it('should change status', () => {
    spyOn(term, 'updateUpdatedTime');
    term.setStatus(false);
    expect(term.getStatus()).toBeFalse();
    expect(term.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should add gramaticalCategory', () => {
    spyOn(term, 'updateUpdatedTime');
    const category: Category = new Category('Cuerpo', undefined);
    term.addGramaticalCategory(category);
    expect(term.getGramaticalCategories()).toContain(category);
    expect(term.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should add thematicCategory', () => {
    spyOn(term, 'updateUpdatedTime');
    const category: Category = new Category('Cuerpo', undefined);
    term.addThematicCategory(category);
    expect(term.getThematicCategories()).toContain(category);
    expect(term.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should add multiple gramatical categories', () => {
    spyOn(term, 'updateUpdatedTime');
    const category1: Category = new Category('Cuerpo', undefined);
    const category2: Category = new Category('Infantil', undefined);
    term.addGramaticalCategories([category1, category2]);
    expect(term.getGramaticalCategories()).toEqual([category1, category2]);
    expect(term.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should add multiple thematic categories', () => {
    spyOn(term, 'updateUpdatedTime');
    const category1: Category = new Category('Cuerpo', undefined);
    const category2: Category = new Category('Infantil', undefined);
    term.addThematicCategories([category1, category2]);
    expect(term.getThematicCategories()).toEqual([category1, category2]);
    expect(term.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should remove gramatical categories', () => {
    spyOn(term, 'updateUpdatedTime');
    const category: Category = new Category('Cuerpo', undefined);
    term.addGramaticalCategory(category);
    expect(term.removeGramaticalCategory(category.getId())).toEqual(category);
    expect(term.getGramaticalCategories()).toEqual([]);
    expect(term.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should remove thematic categories', () => {
    spyOn(term, 'updateUpdatedTime');
    const category: Category = new Category('Cuerpo', undefined);
    term.addThematicCategory(category);
    expect(term.removeThematicCategory(category.getId())).toEqual(category);
    expect(term.getThematicCategories()).toEqual([]);
    expect(term.updateUpdatedTime).toHaveBeenCalled();
  });
});
