import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {TermPageRoutingModule} from './term-routing.module';

import {TermPage} from './term.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [TermPage]
})
export class TermPageModule {
}
