interface CustomCommands {
  navigateTo: (url: string) => void;
  login: (user: string, password: string) => void;
  logout: () => void;
}

const customCommands: CustomCommands = {
  navigateTo: (url: string) => {
    cy.get(`[routerlink="${url}"]`).click();
  },
  login: (email: string, password: string) => {
    cy.get('.ant-menu-submenu-title').trigger('mouseenter');
    cy.get('i.anticon.anticon-login').click();
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get(':nth-child(3) > .ant-col-14 > .ant-form-item-control > .ant-form-item-children > .ant-btn').click();
  },
  logout: () => {
    cy.get('.ant-menu-submenu-title').trigger('mouseenter');
    cy.get('i.anticon.anticon-logout').click();
  }
};

Object.keys(customCommands).forEach(commandName => {
  Cypress.Commands.add(commandName, customCommands[commandName]);
});

export function customCommand<T extends keyof CustomCommands>(name: T): CustomCommands[T] {
  return (<any>cy)[name];
}
