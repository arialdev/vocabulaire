import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {NewCollectionPageRoutingModule} from './new-collection-routing.module';

import {NewCollectionPage} from './new-collection.page';
import {TranslateModule} from '@ngx-translate/core';
import {EmojiPipeModule} from '../../../pipes/emoji-pipe/emoji-pipe.module';
import {EmojiPickerModule} from '../../../components/emoji-picker/emoji-picker.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    NewCollectionPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    EmojiPipeModule,
    EmojiPickerModule
  ],
  declarations: [NewCollectionPage]
})
export class NewCollectionPageModule {
}
