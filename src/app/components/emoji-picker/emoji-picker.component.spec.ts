import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {EmojiPickerComponent} from './emoji-picker.component';

describe('EmojiPickerComponent', () => {
  let component: EmojiPickerComponent;
  let fixture: ComponentFixture<EmojiPickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EmojiPickerComponent],
      imports: [IonicModule.forRoot()]
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
    component.setEmoji('sample');
    expect(component.selectedEmoji).toBe('sample');
    expect(component.newEmojiEvent.emit).toHaveBeenCalledWith('sample');
  });

  it('should close modal', () => {
    spyOn(component.newEmojiEvent, 'emit');
    component.closeModal();
    expect(component.newEmojiEvent.emit).toHaveBeenCalledWith(undefined);
  });
});
