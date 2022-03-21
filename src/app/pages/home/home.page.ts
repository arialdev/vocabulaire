import {Component, OnInit} from '@angular/core';
import {Term} from '../../classes/term/term';
import {CollectionService} from '../../services/collection/collection.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  terms: Term[] = [];

  constructor(private collectionService: CollectionService) {
  }

  async ngOnInit() {
    const collection = await this.collectionService.getActiveCollection();
    this.terms = collection.getTerms();
  }

}
