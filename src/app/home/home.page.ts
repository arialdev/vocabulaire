import {Component, OnInit} from '@angular/core';
import {Term} from '../interfaces/term';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  terms: Term[] = [];

  constructor() {
  }

  ngOnInit() {
  }

}
