import {Language} from './language';

describe('Language', () => {
  let language: Language;

  beforeEach(() => {
    language = new Language('french', 'fr', 'icon');
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
    expect(language.getIcon()).toEqual('icon');
  });

  it('should set icon', () => {
    spyOn(language, 'updateUpdatedTime');
    language.setIcon('it');
    expect(language.getIcon()).toEqual('it');
    expect(language.updateUpdatedTime).toHaveBeenCalled();
  });
});
