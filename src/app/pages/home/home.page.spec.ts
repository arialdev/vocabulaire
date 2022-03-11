import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {HomePage} from './home.page';
import {Term} from '../../classes/term/term';
import {Category} from '../../classes/category/category';
import {CategoryType} from '../../classes/categoryType/category-type';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../services/storage/mock-storage.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  const categoryType1: CategoryType = new CategoryType('gramatical');
  categoryType1.setId(1);

  const categoryType2: CategoryType = new CategoryType('thematic');
  categoryType1.setId(2);

  const gramaticalCategory: Category = new Category('Sustantivo', categoryType1);
  gramaticalCategory.setId(1);

  const thematicCategory: Category = new Category('Cuerpo', categoryType2);
  thematicCategory.setId(1);

  const term1: Term = new Term('Mano', 'Hand', 'No confundir con manecilla de reloj');
  term1.addGramaticalCategory(gramaticalCategory);
  term1.addThematicCategory(thematicCategory);
  term1.setId(1);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomePage],
      providers: [{provide: AbstractStorageService, useClass: MockStorageService}],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
    expect(buttonLink.nativeElement.attributes.href.value).toBe('/collections');
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
      // expect(toggle.attributes['aria-checked']).toBeTruthy();
    });
  });

  it('should contains add button', () => {
    expect(fixture.debugElement.query(By.css('.add-term'))).toBeTruthy();
  });

  it('should contains terms', () => {
    component.terms = [];
    expect(fixture.debugElement.queryAll(By.css('.term')).length).toBe(component.terms.length);
    expect(fixture.debugElement.query(By.css('.no-terms-message'))).toBeTruthy();
    component.terms = [term1];
    fixture.detectChanges();
    const DOM_TERMS = fixture.debugElement.queryAll(By.css('.term'));
    expect(DOM_TERMS.length).toBe(component.terms.length);
    expect(fixture.debugElement.query(By.css('.no-terms-message'))).toBeFalsy();
    expect(DOM_TERMS[0].query(By.css('.term-name')).nativeElement.innerText).toBe(term1.getOriginalTerm());
    expect(DOM_TERMS[0].query(By.css('.translated-term')).nativeElement.innerText).toBe(term1.getTranslatedTerm());
    expect(DOM_TERMS[0].query(By.css('.term-note')).nativeElement.innerText).toBe(term1.getNotes());
    expect(DOM_TERMS[0].queryAll(By.css('.categories .gramatical-category')).length).toBe(term1.getGramaticalCategories().length);
    expect(DOM_TERMS[0].queryAll(By.css('.categories .thematic-category')).length).toBe(term1.getThematicCategories().length);
  });
});
