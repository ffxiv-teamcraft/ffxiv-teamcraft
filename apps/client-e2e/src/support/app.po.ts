export const getPageTitle = () => cy.get('a.logo');

// Loads a given route, waits for necessary routes to be loaded first though
export const loadRoute = (route: string) => {
  cy.server();
  cy.route('assets/**').as('assets');
  cy.route('servers/dc').as('servers');
  cy.route('patchlist').as('patchlist');
  cy.route('db/**').as('database');
  cy.route('sockjs-node/**').as('nodejs');
  cy.route({
    method: 'POST',
    url: 'identitytoolkit/**'
  }).as('toolkit');

  cy.visit(route);
  cy.wait(['@assets', '@servers', '@patchlist', '@database', '@nodejs', '@toolkit']);
  cy.wait(2000);
};

// Manual click way to change the language, must be executed **after** `cy.visit`
export const changeLanguage = (newLanguage: 'EN' | 'DE' | 'FR' | 'JA' | 'PT' | 'BR' | 'ES' | 'KO' | 'ZH') => {
  const index = ['EN', 'DE', 'FR', 'JA', 'PT', 'BR', 'ES', 'KO', 'ZH'].indexOf(newLanguage) + 1;
  cy.get('.language-swap > .ant-select-selection').click({ multiple: true, force: true });
  cy.get(`.ant-select-dropdown-menu > :nth-child(${index})`).click({ multiple: true, force: true });
};

export const toggleSider = () => cy.get('.ant-layout-sider-trigger').click();

export const preventModals = () => window.localStorage.setItem('settings', '{"last-changes-seen":"99.9.9"}');

// Changes language via localStorage, must be executed **before** `cy.visit`
export const setLanguage = (newLanguage: 'EN' | 'DE' | 'FR' | 'JA' | 'PT' | 'BR' | 'ES' | 'KO' | 'ZH') => {
  window.localStorage.setItem('locale', newLanguage.toLowerCase());
};
