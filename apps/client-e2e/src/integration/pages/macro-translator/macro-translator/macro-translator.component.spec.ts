import { setLanguage, preventModals, loadRoute } from '../../../../support/app.po';

describe('Macro translator tests', () => {
  before(() => {
    indexedDB.deleteDatabase('firebaseLocalStorageDb');
    preventModals();
    setLanguage('EN');

    loadRoute('/macro-translator');
  });

  it('should be able to deal with normal quotes', () => {
    cy.get('label[ng-reflect-nz-value="en"]').should('be.visible');
    cy.get('label[ng-reflect-nz-value="en"]').click();
    cy.get('textarea.ant-input').should('be.visible');
    cy.get('textarea.ant-input').type('/ac "Inner quiet" <me><wait.2>');

    cy.get('button').should('be.visible').should('have.text', 'Translate !').first().click();

    cy.get('div.ant-tabs-tab').should('be.visible').contains('EN').click();
    cy.get('div.ant-tabs-content .ant-tabs-tabpane span').should('have.text', '/ac "Inner Quiet" <me><wait.2>');
  });

  it('should be able to deal with smart quotes', () => {
    cy.get('label[ng-reflect-nz-value="en"]').should('be.visible');
    cy.get('label[ng-reflect-nz-value="en"]').click();
    cy.get('textarea.ant-input').should('be.visible');
    cy.get('textarea.ant-input').clear().type('/ac “Inner quiet” <me><wait.2>');

    cy.get('button').should('be.visible').should('have.text', 'Translate !').first().click();

    cy.get('div.ant-tabs-tab').should('be.visible').contains('EN').click();
    cy.get('div.ant-tabs-content .ant-tabs-tabpane span').should('have.text', '/ac "Inner Quiet" <me><wait.2>');
  });
});
