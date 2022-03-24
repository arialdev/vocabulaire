import {Component, OnInit} from '@angular/core';
import {Term} from '../../classes/term/term';
import {CollectionService} from '../../services/collection/collection.service';
import {NavController} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  terms: Term[] = [];

  constructor(private collectionService: CollectionService, private navController: NavController) {
  }

  async ngOnInit() {
    const collection = await this.collectionService.getActiveCollection();
    this.terms = collection.getTerms();
  }

  async navigateToCollections(){
    await this.navController.navigateForward('collections');
  }

  async navigateToTerm(id?: number) {
    await this.navController.navigateForward(`term/${id ? id : 'new'}`);
  }
}
