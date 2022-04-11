import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {TermPageRoutingModule} from './term-routing.module';

import {TermPage} from './term.page';

import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [TermPage]
})
export class TermPageModule {
}
