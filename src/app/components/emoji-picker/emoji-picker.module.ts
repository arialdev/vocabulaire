import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EmojiPickerComponent} from './emoji-picker.component';
import {IonicModule} from '@ionic/angular';


@NgModule({
  declarations: [EmojiPickerComponent],
    imports: [
        CommonModule,
        IonicModule
    ],
  exports: [EmojiPickerComponent]
})
export class EmojiPickerModule {
}
