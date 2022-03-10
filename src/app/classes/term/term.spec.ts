import {Term} from './term';
import {Collection} from '../collection/collection';
import {Category} from '../../interfaces/category';

describe('Term', () => {

  let collection: Collection;
  let term: Term;

  beforeEach(() => {
    collection = new Collection('Spanish', 'ES', 'es');
    term = new Term(collection, 'Mano', 'Hand');
  });

  it('should create an instance', () => {
    expect(term).toBeTruthy();
  });

  it('should get undefined ID', () => {
    expect(term.getId()).toBeUndefined();
  });

  it('should set new id', () => {
    term.setId(5);
    expect(term.getId()).toBe(5);
  });

  it('should get originalTerm', () => {
    expect(term.getOriginalTerm()).toEqual('Mano');
  });

  it('should set originalTerm', () => {
    term.setOriginalTerm('Sample');
    expect(term.getOriginalTerm()).toEqual('Sample');
  });

  it('should get translated', () => {
    expect(term.getTranslatedTerm()).toEqual('Hand');
  });

  it('should set translatedTerm', () => {
    term.setTranslatedTerm('Sample');
    expect(term.getTranslatedTerm()).toEqual('Sample');
  });

  it('should get default notes', () => {
    expect(term.getNotes()).toBeFalsy();
  });

  it('should update notes', () => {
    const newNote = 'Esto es una nota';
    term.setNotes(newNote);
    expect(term.getNotes()).toEqual(newNote);
  });

  it('should get default Status', () => {
    expect(term.getStatus()).toBeTrue();
  });

  it('should change status', () => {
    term.setStatus(false);
    expect(term.getStatus()).toBeFalse();
  });

  it('should get collection', () => {
    expect(term.getCollection()).toEqual(collection);
  });

  it('should update collection', () => {
    const newCollection: Collection = new Collection('French', 'FR', 'fr');
    expect(term.getCollection()).toEqual(collection);
    term.setCollection(newCollection);
    expect(term.getCollection()).not.toEqual(collection);
    expect(term.getCollection()).toEqual(newCollection);
  });

  it('should get creation time', () => {
    expect(term.getCreationTime()).not.toBeNaN();
  });

  it('should get update time', () => {
    expect(term.getUpdatingTime()).not.toBeNaN();
  });

  it('should add gramaticalCategory', () => {
    const category: Category = {
      id: 1,
      name: 'cuerpo',
      status: true,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      type: undefined,
    };
    term.addGramaticalCategory(category);
    expect(term.getGramaticalCategories()).toContain(category);
  });

  it('should add thematicCategory', () => {
    const category: Category = {
      id: 1,
      name: 'cuerpo',
      status: true,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      type: undefined,
    };
    term.addThematicCategory(category);
    expect(term.getThematicCategories()).toContain(category);
  });

  it('should add multiple gramatical categories', () => {
    const category1: Category = {
      id: 1,
      name: 'cuerpo',
      status: true,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      type: undefined,
    };
    const category2: Category = {
      id: 2,
      name: 'infantil',
      status: true,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      type: undefined,
    };
    term.addGramaticalCategories([category1, category2]);
    expect(term.getGramaticalCategories()).toEqual([category1, category2]);
  });

  it('should add multiple thematic categories', () => {
    const category1: Category = {
      id: 1,
      name: 'cuerpo',
      status: true,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      type: undefined,
    };
    const category2: Category = {
      id: 2,
      name: 'infantil',
      status: true,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      type: undefined,
    };
    term.addThematicCategories([category1, category2]);
    expect(term.getThematicCategories()).toEqual([category1, category2]);
  });

  it('should remove gramatical categories', () => {
    const category: Category = {
      id: 1,
      name: 'cuerpo',
      status: true,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      type: undefined,
    };
    term.addGramaticalCategory(category);
    expect(term.removeGramaticalCategory(category.id)).toEqual(category);
    expect(term.getGramaticalCategories()).toEqual([]);
  });

  it('should remove thematic categories', () => {
    const category: Category = {
      id: 1,
      name: 'cuerpo',
      status: true,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      type: undefined,
    };
    term.addThematicCategory(category);
    expect(term.removeThematicCategory(category.id)).toEqual(category);
    expect(term.getThematicCategories()).toEqual([]);
  });
});
