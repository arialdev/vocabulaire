import {Wod} from './wod';
import {Term} from '../term/term';

describe('Wod', () => {
  let term: Term;
  let wod: Wod;

  beforeEach(() => {
    term = new Term('Hello', 'Hola');
    wod = new Wod(term);
  });

  it('should create an instance', () => {
    expect(wod).toBeTruthy();
    expect(new Wod(JSON.parse(JSON.stringify(wod)))).toBeTruthy();
  });

  it('should get term', () => {
    expect(wod.getTerm()).toEqual(term);
  });

  it('should get date', () => {
    expect(wod.getRetrievedDate()).toBeTruthy();
  });
});
