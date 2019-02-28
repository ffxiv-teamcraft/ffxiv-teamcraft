export const getPageTitle = () => cy.get('a.logo');

export const changeLanguage = (newLanguage: 'EN' | 'DE' | 'FR' | 'JA' | 'PT' | 'BR' | 'ES' | 'KO' | 'ZH') => {
  cy.get('.language-swap > .ant-select-selection').click();
  cy.get('.ant-select-dropdown-menu-item').contains(` ${newLanguage} `).click();
};

export const toggleSider = () => cy.get('.ant-layout-sider-trigger').click();
