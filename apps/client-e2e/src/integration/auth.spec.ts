import { changeLanguage } from '../support/app.po';
import { fixtures } from '../fixtures/fixtures';


describe('Auth tests', () => {
  before(() => {
    indexedDB.deleteDatabase('firebaseLocalStorageDb');
    cy.visit('/');
    changeLanguage('EN');
  });

  it('should be able to register', () => {
    cy.get('.ant-menu-submenu-title').trigger('mouseenter');
    cy.get('i.anticon.anticon-form').click();
    cy.get('#email').type(`${Date.now()}-${fixtures.email}`);
    cy.get('#password').type(fixtures.password);
    cy.get('#confirmPassword').type(fixtures.password);
    cy.get('.ant-form-item-children > .ant-btn').click();
    cy.wait(5000);
    cy.get(':nth-child(4) > .ant-btn').click();
  });
});
