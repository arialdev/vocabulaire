import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {NewTagPageRoutingModule} from './new-tag-routing.module';

import {NewTagPage} from './new-tag.page';
import {EmojiPipeModule} from '../../pipes/emoji-pipe/emoji-pipe.module';
import {EmojiPickerModule} from '../../components/emoji-picker/emoji-picker.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewTagPageRoutingModule,
    EmojiPipeModule,
    ReactiveFormsModule,
    EmojiPickerModule,
  ],
  declarations: [NewTagPage]
})
export class NewTagPageModule {
}
