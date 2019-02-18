import { changeLanguage, getPageTitle, toggleSider } from '../support/app.po';
import { getIntro } from '../support/search.po';

describe('Basic UI tests', () => {
  before(() => {
    indexedDB.deleteDatabase('firebaseLocalStorageDb');
    cy.visit('/');
    // Let's wait for the anonymous warning to hide.
    cy.wait(20000);
    changeLanguage('EN');
  });

  it('should display title', () => {
    getPageTitle().contains('FFXIV Teamcraft');
  });

  it('should display search intro', () => {
    getIntro().contains('Community lists');
  });

  it('should be able to swap language', () => {
    changeLanguage('FR');
    getIntro().contains('Listes communautaires');
    changeLanguage('EN');
    getIntro().contains('Community lists');
  });

  it('should be able to toggle left sidebar', () => {
    cy.get('[routerlink="/lists"]').contains('Lists');
    toggleSider();
    cy.get('[routerlink="/lists"]').contains('Lists').should('not.be.visible');
  })
});
