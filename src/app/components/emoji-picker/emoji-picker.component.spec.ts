import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {EmojiPickerComponent} from './emoji-picker.component';
import {Emoji} from '../../classes/emoji/emoji';
import {EmojisMap} from '../../services/emoji/emojisMap';

describe('EmojiPickerComponent', () => {
  let component: EmojiPickerComponent;
  let fixture: ComponentFixture<EmojiPickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EmojiPickerComponent],
      imports: [IonicModule.forRoot()],
      providers: [{provide: EmojisMap}]
    }).compileComponents();

    fixture = TestBed.createComponent(EmojiPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select category', () => {
    component.selectCategory('sample');
    expect(component.selectedCategory).toBe('sample');
  });

  it('should set emoji', () => {
    spyOn(component.newEmojiEvent, 'emit');
    const emoji = new Emoji('uk', 'flags');
    component.setEmoji(emoji);
    expect(component.selectedEmoji).toEqual(emoji);
    expect(component.newEmojiEvent.emit).toHaveBeenCalledWith(emoji);
  });

  it('should close modal', () => {
    spyOn(component.newEmojiEvent, 'emit');
    component.closeModal();
    expect(component.newEmojiEvent.emit).toHaveBeenCalledWith(undefined);
  });
});
