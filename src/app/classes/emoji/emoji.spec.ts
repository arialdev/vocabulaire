import {Emoji} from './emoji';

describe('Emoji', () => {

  let emoji: Emoji;

  beforeEach(() => {
    emoji = new Emoji('smile', 'people');
  });

  it('should create an instance', () => {
    expect(emoji).toBeTruthy();
  });

  it('should get name', () => {
    expect(emoji.getName()).toEqual('smile');
  });

  it('should set name', () => {
    emoji.setName('angry');
    expect(emoji.getName()).toEqual('angry');
  });

  it('should get category', () => {
    expect(emoji.getCategory()).toEqual('people');
  });

  it('should set category', () => {
    emoji.setCategory('activities');
    expect(emoji.getCategory()).toEqual('activities');
  });
});
