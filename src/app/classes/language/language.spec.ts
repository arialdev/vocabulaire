import {Language} from './language';
import {Emoji} from '../emoji/emoji';

describe('Language', () => {
  let language: Language;
  let emoji: Emoji;
  beforeEach(() => {
    emoji = new Emoji('uk', 'flags');
    language = new Language('french', 'fr', emoji);
  });
  it('should create an instance', () => {
    expect(language).toBeTruthy();
    expect(new Language(JSON.parse(JSON.stringify(language)))).toEqual(language);
  });

  it('should get name', () => {
    expect(language.getName()).toEqual('french');
  });

  it('should set name', () => {
    spyOn(language, 'updateUpdatedTime');
    language.setName('italian');
    expect(language.getName()).toEqual('italian');
    expect(language.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should get prefix', () => {
    expect(language.getPrefix()).toEqual('FR');
  });

  it('should set prefix', () => {
    spyOn(language, 'updateUpdatedTime');
    language.setPrefix('it');
    expect(language.getPrefix()).toEqual('IT');
    expect(language.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should get icon', () => {
    expect(language.getIcon()).toEqual(emoji);
  });

  it('should set icon', () => {
    spyOn(language, 'updateUpdatedTime');
    const newEmoji = new Emoji('es', 'flags');
    language.setIcon(newEmoji);
    expect(language.getIcon()).toEqual(newEmoji);
    expect(language.updateUpdatedTime).toHaveBeenCalled();
  });
});
