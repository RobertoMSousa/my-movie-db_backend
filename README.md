# README

## Table of Contents

- [Details](#details)
- [Requirements](#requirements)
- [Installation](#installation)
- [Build](#build)
- [Usage](#usage)
- [Testing](#testing)
- [Support](#support)
- [Contributing](#contributing)
- [Credits](#credits)
- [Suggestions](#suggestions)


## Details
### Name
My Movie DB backend

### Description
This is the backend that is used in the movie DB react app that can be found [here](https://github.com/RobertoMSousa/my-movie-db).
At this point, this is at very simple stage with new features coming up at a slow pace.
Please note that this project is part of my coding hobby and is not intended to be used as a commercial product. Please contact the author of the project for any further questions.
The website can be tested [here](https://my-movie-db-roberto.herokuapp.com/) but please notice that is stored on the [heroku](https://www.heroku.com/home) free tier that sleeps after 30 minutes of inactivity and can take some minutes to wake up.

### Author
Roberto Sousa <betos.sousa22@gmail.com>


## Requirements
- Install [Node.js](https://nodejs.org/en/)
- Install [MongoDB](https://docs.mongodb.com/manual/installation/)
- Install [VS Code](https://code.visualstudio.com/)


## Installation
- Install dependencies
```
yarn
```
- Start mongoDB locally
```
mongod
```
- Start the local project
```
yarn develop
```

Navigate to `http://localhost:8080`

##Build
| Yarn Script | Description |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `start`                   | Does the same as 'npm run serve'. Can be invoked with `npm start`                                 |
| `build`                   | Full build. Runs ALL build tasks (`build-sass`, `build-ts`, `tslint`, `copy-static-assets`)       |
| `serve`                   | Runs node on `dist/server.js` which is the apps entry point                                       |
| `watch`                   | Runs all watch tasks (TypeScript, Sass, Node). Use this if you're not touching static assets.     |
| `test`                    | Runs tests using Jest test runner                                                                 |
| `build-ts`                | Compiles all source `.ts` files to `.js` files in the `dist` folder                               |
| `watch-ts`                | Same as `build-ts` but continuously watches `.ts` files and re-compiles when needed               |
| `build-sass`              | Compiles all `.scss` files to `.css` files                                                        |
| `watch-sass`              | Same as `build-sass` but continuously watches `.scss` files and re-compiles when needed           |
| `tslint`                  | Runs TSLint on project files                                                                      |
| `copy-static-assets`      | Calls script that copies JS libs, fonts, and images to dist directory                             |
| `develop`                 | Start the project with the dev options on                                                         |


## Testing
To run the tests just run `yarn test` and it will run then and generate a report that can be checked here `my-movie-db_backend/coverage/lcov-report/index.html`

## Support
Please [open an issue](https://github.com/RobertoMSousa/my-movie-db_backend/issues) for support.

## Credits
This repository was created based on the Microsoft repository provided [here](https://github.com/Microsoft/TypeScript-Node-Starter).

## Suggestions
- [TSLint](https://marketplace.visualstudio.com/items?itemName=eg2.tslint)
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)