import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {CollectionViewPageRoutingModule} from './collection-view-routing.module';

import {CollectionViewPage} from './collection-view-page.component';
import {TranslateModule} from '@ngx-translate/core';
import {EmojiPipeModule} from '../../../pipes/emoji-pipe/emoji-pipe.module';
import {EmojiPickerModule} from '../../../components/emoji-picker/emoji-picker.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    CollectionViewPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    EmojiPipeModule,
    EmojiPickerModule,
  ],
  declarations: [CollectionViewPage]
})
export class CollectionViewPageModule {
}
