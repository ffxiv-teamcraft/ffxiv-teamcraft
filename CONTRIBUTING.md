### Prepare your environment
* Install [Node.js](http://nodejs.org/) (>10.9) and NPM (>=5.3)
* Install local dev dependencies: `npm install` while current directory is this repo

### Live Development Server

Simply run `npm start` to start a live server with file watcher.

## Contributing

### Branch names

When contributing to main repository, you'll notice that branch names follow a given pattern,
this pattern is the following: `<branch-type>/<short-description>`.

Example: `feat/commission-history-tab` would be a branch that adds a commission history tab.

We're using gitflow for this, more information on [https://github.com/nvie/gitflow](https://github.com/nvie/gitflow)

### Commit Messages
 The commit messages are checked by a pre-commit git hook, meaning that if they don't meet the requirements, 
 your commit will not be created.
 
 A commit message should follow this structure:
 ```
    <type>(<optional context>): <subject>
    <BLANK LINE>
    <body>
    <BLANK LINE>
    <footer>
 ```
 
 Only the first line is mandatory, the rest is optional.
 
 Types are the ones used by [standard-version](https://github.com/conventional-changelog/standard-version):
 
 - **feat** - New feature
 - **fix** - Bug fix
 - **docs** - Documentation-related
 - **style** - Style-related
 - **refactor** - Refactoring of a code piece/feature
 - **perf** - Performance optimization
 - **test** - Tests-related
 - **build** - Build-related
 - **ci** - Continuous Integration-related
 - **chore** - Changes that are not needed to be displayed in the changelog
 - **revert** - Commit reverts
 
 The optional context parameter (the part between parenthesis) is used to provide context
 easily inside the changelog, to avoid having to append "inside page blabla" at the end of the message.
 
 Context values can be any of the major features:
 
  - simulator
  - profile
  - search
  - alarms
  - gathering-location
  - list-details
  - crafting-log
  - pricing
  - desktop
  - favorites
  - gearsets
  - inventory
  - db
  - lists
  - list-overlay
  - fishing-reporter
  - teams
  - workshop
  - rotations
  - log-tracker
  - macro-translator
  - core
  - comments
  - layouts
  - list-picker
  - rotation-picker
  - 
 
 Examples:
 
 `fix(simulator): byregots blessing now working as intended`
 
 ```
 fix: need latest rxjs
 
 For our http calls, rxjs can make us save a lot of time, it had to be updated.
 ```

## Tests

Teamcraft has some tests to ensure non regression, you might want to implement more tests instead of creating some features, to help with application reliability, to make sure nothing breaks with a given update.

Tests are separated into two categories, Unit and End-to-End.

### Unit tests

Unit tests are used to test the simulator, as the `Simulation` class is pure typescript, with no Angular stuff at all. 

The tests are using karma runner and [jasmine](https://jasmine.github.io/) for specs and can be found [here](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/tree/staging/apps/client/src/app/pages/simulator/test) with the mock file.

To run unit tests, use `npm test`.

### End-to-end tests

End-to-end tests (e2e) are here to make sure that the end user integration is good, they are here to reproduce user behavior and expect given results.

They are pretty much used as integration tests in our case, because implementing them properly is easier than doing integration tests using karma runner.

E2e tests are using [cypress](https://www.cypress.io/), a nice library that has some features such as time travelling for debugging purpose, video recording, selector generator (to find quickly how to match a given element) and is way faster than most of the selenium wrappers.

You can start e2e tests with a watcher to debug and create them easily, just run `npm run e2e:watch`.
