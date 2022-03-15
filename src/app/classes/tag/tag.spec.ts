import {Tag} from './tag';
import {TagOptions} from '../tagOptions/tag-options';
import {Emoji} from '../emoji/emoji';

describe('Tag', () => {

  let tag: Tag;
  let tagOptions: TagOptions;
  let emoji: Emoji;
  beforeEach(() => {
    emoji = new Emoji('smile', 'people');
    tagOptions = new TagOptions('');
    tag = new Tag('Body nouns', emoji, tagOptions);
  });

  it('should create an instance', () => {
    expect(tag).toBeTruthy();
    expect(new Tag(JSON.parse(JSON.stringify(tag)))).toEqual(tag);
  });

  it('should get name', () => {
    expect(tag.getName()).toEqual('Body nouns');
  });

  it('should set name', () => {
    spyOn(tag, 'updateUpdatedTime');
    tag.setName('sample');
    expect(tag.getName()).toEqual('sample');
    expect(tag.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should get icon', () => {
    expect(tag.getIcon()).toEqual(emoji);
  });

  it('should set icon', () => {
    spyOn(tag, 'updateUpdatedTime');
    const newIcon = new Emoji('cn', 'flags');
    tag.setIcon(newIcon);
    expect(tag.getIcon()).toEqual(newIcon);
    expect(tag.updateUpdatedTime).toHaveBeenCalled();
  });

  it('should get options', () => {
    expect(tag.getOptions()).toEqual(tagOptions);
  });

  it('should set options', () => {
    spyOn(tag, 'updateUpdatedTime');
    const newOptions = new TagOptions('sample');
    tag.setOptions(newOptions);
    expect(tag.getOptions()).toEqual(newOptions);
    expect(tag.updateUpdatedTime).toHaveBeenCalled();
  });
});
