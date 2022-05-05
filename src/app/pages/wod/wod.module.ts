import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {WodPageRoutingModule} from './wod-routing.module';

import {WodPage} from './wod.page';
import {HeaderModule} from '../../components/header/header.module';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WodPageRoutingModule,
    HeaderModule,
    TranslateModule
  ],
  declarations: [WodPage]
})
export class WodPageModule {
}
