import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EmojiPickerComponent} from './emoji-picker.component';


@NgModule({
  declarations: [EmojiPickerComponent],
  imports: [
    CommonModule
  ],
  exports: [EmojiPickerComponent]
})
export class EmojiPickerModule {
}
