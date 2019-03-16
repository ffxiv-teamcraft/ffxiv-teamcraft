export const getPageTitle = () => cy.get('a.logo');

export const changeLanguage = (newLanguage: 'EN' | 'DE' | 'FR' | 'JA' | 'PT' | 'BR' | 'ES' | 'KO' | 'ZH') => {
  const index = ['EN', 'DE', 'FR', 'JA', 'PT', 'BR', 'ES', 'KO', 'ZH'].indexOf(newLanguage) + 1;
  cy.get('.language-swap > .ant-select-selection').click({ multiple: true, force: true });
  cy.get(`.ant-select-dropdown-menu > :nth-child(${index})`).click({ multiple: true, force: true });
};

export const toggleSider = () => cy.get('.ant-layout-sider-trigger').click();
