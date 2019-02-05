import { changeLanguage } from '../support/app.po';
import { customCommand } from '../support/commands';

function expectItem(name: string, amount: number) {
  cy.get('.item-row').within(() => {
    cy.get('.item-name').contains(name).should('exist');
    cy.get('.amount-max').contains(amount).should('exist');
  });
}

describe('List tests', () => {
  before(() => {
    indexedDB.deleteDatabase('firebaseLocalStorageDb');
    cy.visit('/');
    changeLanguage('EN');
  });

  it('should be able to create a quick list', () => {
    customCommand('navigateTo')('/search');
    cy.get('.search-input').type('Susano');
    cy.get('.odd > .inputs-container > .actions > [ng-reflect-set-title="Create quick list (deleted onc"]').click();
    cy.wait(8000).then(() => {
      cy.get('.list-title > h2').contains('Susano');
    });
  });

  it('should contain proper ingredients', () => {
    expectItem('Rock Salt', 7);
    expectItem('Stiperstone', 1);
    expectItem('Raw Kyanite', 3);
    expectItem('Effervescent Water', 7);
    expectItem('Manzasiri Hair', 14);
    expectItem('Halgai Mane', 14);
    expectItem('Blade of Revelry', 1);
    expectItem('Blood Pepper', 1);
    expectItem('Natron', 7);
    expectItem('Kyanite', 1);
    expectItem('Worsted Yarn', 7);
    expectItem('Steppe Serge', 2);
    expectItem('Wind-up Susano', 1);
  });
});
