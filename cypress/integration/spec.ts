describe('Vocabulaire e2e', () => {
  before(() => {
    cy.viewport('samsung-s10');
  });

  describe('Tutorial', () => {
    before(() => {
      indexedDB.deleteDatabase('_ionicstorage');
    });

    beforeEach(() => {
      cy.visit('/');
    });

    it('should redirect to tutorial', () => {
      cy.location('pathname').should('eq', '/tutorial');
    });

    it('should change language', () => {
      cy.contains('Welcome to Vocabulaire');
      cy.get('.language-selector').click({waitForAnimations: true});
      cy.get('.select-interface-option').eq(1).click({waitForAnimations: true});
      cy.contains('Bienvenido/a a Vocabulaire').then(() => {
        indexedDB.deleteDatabase('_ionicstorage');
      });
    });

    it('should swipe and create collection', () => {
      cy.get('.swiper-slide-active')
        .trigger('pointerdown', {which: 1})
        .trigger('pointermove', 'left')
        .trigger('pointerup', {force: true});
      cy.get('.text > h1').contains('Create your first collection');
      cy.get('.slide-2 input').eq(0).should('be.empty').type('French');
      cy.get('.slide-2 input').eq(1).should('have.value', 'FR');
      cy.get('.emoji-button').click({waitForAnimations: true});
      cy.get('.emoji-listed').eq(1).click({waitForAnimations: true}).then(e => {
        cy.get('.emoji-button').invoke('attr', 'src').should('eq', e.attr('src'));
      });
      cy.get('.submit-button').click({waitForAnimations: true});
      cy.location('pathname').should('eq', '/home');
    });
  });

  describe('Category', () => {
    describe('Grammatical Category', () => {
      before(() => {
        cy.visit('/categories/0');
      });

      it('should create grammatical category', () => {
        cy.get('.new-category').click({waitForAnimations: true});
        cy.get('ion-alert input').type('Noun');
        cy.wait(800);
        cy.get('ion-alert .alert-button').eq(1).click({waitForAnimations: true});
        cy.get('ion-list').contains('Noun');
      });
    });

    describe('Thematic Category', () => {
      before(() => {
        cy.visit('/categories/1');
      });

      it('should create thematic category', () => {
        cy.get('.new-category').click({waitForAnimations: true});
        cy.get('ion-alert input').type('Body');
        cy.wait(800);
        cy.get('ion-alert .alert-button').eq(1).click({waitForAnimations: true});
        cy.get('ion-list').contains('Body');

      });
    });
  });

  describe('New term', () => {
    beforeEach(() => {
      cy.visit('/home');
    });

    it('should add new term', () => {
      cy.get('.add-term').click({waitForAnimations: true});
      cy.location().should((loc) => expect(loc.pathname).to.eq('/term/new'));
      cy.get('form input').eq(0).should('be.empty').type('Main');
      cy.get('form input').eq(1).should('be.empty').type('Mano');
      cy.get('form textarea').should('be.empty').type('Nota de Mano');

      cy.get('.categories-box').eq(0).click({waitForAnimations: true});
      cy.get('.alert-checkbox').eq(0).click({waitForAnimations: true});
      cy.wait(400);
      cy.get('.alert-button').eq(1).click({waitForAnimations: true});
      cy.get('.categories-chips').eq(0).contains('Noun');

      cy.get('.categories-box').eq(1).click({waitForAnimations: true});
      cy.get('.alert-checkbox').eq(0).click({waitForAnimations: true});
      cy.wait(400);
      cy.get('.alert-button').eq(1).click({waitForAnimations: true});
      cy.get('.categories-chips').eq(1).contains('Body');

      cy.get('.submit-button').click({waitForAnimations: true});
      cy.location('pathname').should('eq', '/home');
    });
  });

  describe('New tag', () => {
    before(() => () => {
      cy.visit('/home');
    });

    it('should create tag', () => {
      cy.get('.add-term').click({waitForAnimations: true});
      cy.location().should((loc) => expect(loc.pathname).to.eq('/term/new'));
      cy.get('form input').eq(0).should('be.empty').type('ffff');
      cy.get('form input').eq(1).should('be.empty').type('gggg');
      cy.get('form textarea').should('be.empty').type('hhhh');

      cy.get('.categories-box').eq(0).click({waitForAnimations: true});
      cy.get('.alert-checkbox').eq(0).click({waitForAnimations: true});
      cy.get('.alert-button').eq(1).click({waitForAnimations: true});
      cy.get('.categories-chips').eq(0).contains('Noun');
      cy.get('.submit-button').click({waitForAnimations: true});
      cy.wait(1000);
      cy.location('pathname').should('eq', '/home');


      cy.get('.terms-list .term').should('have.length', 2);
      cy.get('.filter-button').click({waitForAnimations: true});
      cy.get('ion-popover ion-list ion-item').eq(1).click({waitForAnimations: true});
      cy.wait(1000);
      cy.get('ion-alert .alert-checkbox-group button').click({waitForAnimations: true});
      cy.get('ion-alert .alert-button-group button').eq(1).click({waitForAnimations: true});
      cy.wait(800);
      cy.get('ion-popover').eq(0).type('{esc}', {force: true});
      cy.get('.terms-list > .term').should('have.length', 1);

      cy.get('.book-button ion-button').click({waitForAnimations: true});
      cy.location('pathname').should('eq', '/tag/new');
      cy.get('form input').eq(0).type('nuevo tag');
      cy.get('.submit-button').click({waitForAnimations: true});
      cy.location('pathname').should('eq', '/home');
      cy.get('.book-button ion-icon').invoke('attr', 'name').should('eq', 'bookmark');
      cy.get('.terms-list .term').should('have.length', 1);
      cy.visit('/home');
      cy.get('.terms-list .term').should('have.length', 2);
      cy.get('ion-menu-button').click({waitForAnimations: true});
      cy.get('#tag-list ion-item').eq(0).click({waitForAnimations: true});
      cy.get('ion-menu')
        .trigger('pointerdown', {which: 1})
        .trigger('pointermove', 'left')
        .trigger('pointerup', {force: true});
      cy.get('.terms-list .term').should('have.length', 1);
    });
  });
});

