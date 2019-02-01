import { changeLanguage } from '../support/app.po';
import { customCommand } from '../support/commands';

function expectItem(name:string, amount: number){
  cy.get(' nz-collapse > .ant-collapse > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box > [style=""] > :nth-child(1) > div > app-item-row.ng-star-inserted > .item-row').within(() => {
    cy.get('.item-name').contains(name);
    cy.get('.amount-max').contains(amount);
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
  });
});
