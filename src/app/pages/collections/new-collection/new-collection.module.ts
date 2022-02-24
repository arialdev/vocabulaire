import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {NewCollectionPageRoutingModule} from './new-collection-routing.module';

import {NewCollectionPage} from './new-collection.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewCollectionPageRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [NewCollectionPage]
})
export class NewCollectionPageModule {
}
