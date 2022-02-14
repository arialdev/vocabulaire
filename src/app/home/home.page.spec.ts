import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';
import {By} from '@angular/platform-browser';

import {HomePage} from './home.page';
import {Term} from '../interfaces/term';
import {Category} from '../interfaces/category';
import {CategoryType} from '../interfaces/category-type';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  const categoryType1: CategoryType = {
    id: 1,
    name: 'gramatical',
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime()
  };

  const categoryType2: CategoryType = {
    id: 2,
    name: 'thematic',
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime()
  };

  const gramaticalCategory: Category = {
    createdAt: new Date().getTime(),
    id: 1,
    type: categoryType1,
    name: 'Sustantivo',
    updatedAt: new Date().getTime()
  };

  const thematicCategory: Category = {
    createdAt: new Date().getTime(),
    id: 2,
    type: categoryType2,
    name: 'Cuerpo',
    updatedAt: new Date().getTime()
  };

  const term1: Term = {
    collection: undefined,
    createdAt: new Date().getTime(),
    originalTerm: 'Mano',
    gramaticalCategories: [gramaticalCategory],
    id: 1,
    notes: 'No confundir con manecilla de reloj',
    thematicCategories: [thematicCategory],
    translatedTerm: 'Hand',
    updatedAt: new Date().getTime(),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display logo in header', () => {
    const logo = fixture.debugElement.query(By.css('.header .header-logo'));
    expect(logo.nativeElement.localName).toBe('ion-img');
  });

  it('should display menu in header', () => {
    expect(fixture.debugElement.query(By.css('.header ion-menu-button'))).toBeTruthy();
  });

  it('should display language icon', () => {
    const buttons = fixture.debugElement.query(By.css('.header ion-buttons[slot=end]'));
    expect(buttons).toBeTruthy();
    const buttonLink = buttons.query(By.css('ion-button'));
    expect(buttonLink.nativeElement.href).toBe('/folder/languages');
  });

  it('should contains searchbar', () => {
    expect(fixture.debugElement.query(By.css('ion-searchbar'))).toBeTruthy();
  });

  it('should contains book button', () => {
    expect(fixture.debugElement.query(By.css('.book-button'))).toBeTruthy();
  });

  describe('Search options', () => {
    it('should contains filter button', () => {
      expect(fixture.debugElement.query(By.css('.filter-button'))).toBeTruthy();
    });

    it('should contains sorting button', () => {
      expect(fixture.debugElement.query(By.css('.sort-button'))).toBeTruthy();
    });

    it('should contains details toggle', () => {
      const toggle = fixture.debugElement.query(By.css('.details-toggle ion-toggle'));
      expect(toggle).toBeTruthy();
      expect(toggle.attributes['aria-checked']).toBeTruthy();
    });
  });

  it('should contains add button', () => {
    expect(fixture.debugElement.query(By.css('.add-term'))).toBeTruthy();
  });

  it('should contains terms', () => {
    component.terms = [];
    expect(fixture.debugElement.queryAll(By.css('.term')).length).toBe(component.terms.length);
    expect(fixture.debugElement.query(By.css('.no-terms-message'))).toBeTruthy();
    component.terms = [term1, term1];
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.term')).length).toBe(component.terms.length);
    expect(fixture.debugElement.query(By.css('.no-terms-message'))).toBeFalsy();
  });
});
