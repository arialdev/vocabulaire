import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {NewCollectionPageRoutingModule} from './new-collection-routing.module';

import {NewCollectionPage} from './new-collection.page';
import {EmojiPickerComponent} from '../../../components/emoji-picker/emoji-picker.component';
import {TranslateModule} from '@ngx-translate/core';
import {EmojiPipeModule} from '../../../pipes/emoji-pipe/emoji-pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewCollectionPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    EmojiPipeModule
  ],
  declarations: [NewCollectionPage, EmojiPickerComponent]
})
export class NewCollectionPageModule {
}
