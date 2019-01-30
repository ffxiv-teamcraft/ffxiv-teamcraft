export const getPageTitle = () => cy.get('a.logo');

export const changeLanguage = (newLanguage: string) => {
  cy.get('.language-swap > .ant-select-selection').click();
  const languages = ['EN', 'DE', 'FR', 'JA', 'PT', 'BR', 'ES', 'KO'];
  cy.get(`.ng-tns-c4-1 > .ant-select-dropdown-menu > :nth-child(${languages.indexOf(newLanguage.toUpperCase()) + 1})`).click();
};

export const toggleSider = () => cy.get('.ant-layout-sider-trigger').click();
