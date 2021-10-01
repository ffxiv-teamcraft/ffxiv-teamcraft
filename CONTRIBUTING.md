# How to contribute

## Summary
* [Prepare your environment](#prepare-your-environment)
* [Live Development Server](#live-development-server)
- [Contributing](#contributing)
  * [Branch names](#branch-names)
  * [Commit Messages](#commit-messages)
- [The desktop app](#the-desktop-app)
  * [How to start desktop app](#how-to-start-desktop-app)
- [Important note: fishing data and allagan reports](#important-note--fishing-data-and-allagan-reports)



### Prepare your environment
* Install [Node.js](http://nodejs.org/) (>=14.17) and Yarn (`npm i -g yarn`)
* Install local dev dependencies: `yarn` while current directory is this repo

### Live Development Server

Simply run `yarn start` to start a live server with file watcher.

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
  - etc...
 
 Examples:
 
 `fix(simulator): byregots blessing now working as intended`
 
 ```
 fix: need latest rxjs
 
 For our http calls, rxjs can make us save a lot of time, it had to be updated.
 ```


## The desktop app

Teamcraft is available as a desktop app using electron, and you might want to use it locally to implement or debug features that are specific to it (overlays, packet capture, file watchers).

The source files for the desktop app are located in `apps/electron`, entry point being `main.ts`.

### How to start desktop app

For this you'll need two terminals opened, bash, cmd, ps, as you want.

 - In the first terminal, run `yarn build:watch` and wait for it to produce at least one set of output files
 - In the second terminal, run `yarn electron:start` to start electron using the built files.
 - If you're modifying the electron files or the angular files and you want to see the result in the app, simply close the app or kill the `electron:start` process and restart it.

## Important note: fishing data and allagan reports

Fishing data and allagan reports won't work in a dev env, this is due to the fact that dev env uses a separate firebase instance, which isn't able to produce the same oauth token that's used in production to communicate with the graphql API. 

In order to use fishing data, you'll have to edit the `environment.ts` (or `environment.beta.ts` if you're using desktop app) file to replace the content of the `firebase` key by the content of the `firebase` key in the `environment.prod.ts` file.
