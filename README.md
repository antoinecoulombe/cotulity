# Cotulity

**Cotulity is a work in progress and no release version has been released yet.**

Cotulity is a web application to help students manage their day-to-day life with roommates.

## Installation

Before starting with the project, make sure to follow these steps to have the latest project on-hand:

1. Download and Install Node.js and npm
1. Make sure you have the latest version of npm downloaded:
   `npm install npm@latest -g`
1. Install sequelize globally:
   `npm install -g sequelize-cli`
1. Install all dependencies for the project:
   `npm install`

## Run with Docker

To start the service using docker, run the following command:

```bash
$ docker-compose up --build
```

To migrate or update the database, run the following command in a new terminal window:

```bash
$ docker-compose exec api npm run migrate
```

To seed the database, run the following command in a new terminal window:

```bash
$ docker-compose exec api npm run seed
```

To rebuild the database and clear all data, run the following command in a new terminal window:

```bash
$ docker-compose exec api npm run migrate:reset
```

To run tests, run the following command in a new terminal window:

```bash
$ docker-compose exec api npm run test
```

\*This will create a new seeded database and run the tests present in the '\_\_tests\_\_' folder.

If the migration script fails to execute completely, make sure to drop all tables previously created before running it again, using the following command: `docker-compose exec api npm run migrate:reset`.

If the seed script fails to execute completely, there might be a problem with the auto-incrementing primary keys. This problem can be solved by undoing the migration (dropping the tables) and running the migration and seed scripts again (first two commands of the "Database Setup" section after the initial Docker setup).

If you get an `Execution_Policy` error while running the migration or seed scripts, open Powershell as an Administrator and type in `Set-ExecutionPolicy RemoteSigned`, then confirm by pressing `Y`.

## DEV environment

When developping, running the API locally might be less time-consuming than rebuilding Docker everytime a change is made. To do so, stop the execution of the Docker container named `api`, then:

1. Execute the following command in a terminal window, in the api folder: `npm run dev`. This will start a nodemon session, restarting the server after every change.
1. Press `Cmd+Shift+b` and select `tsc:watch - api/tsconfig.json` to detect changes in TypeScript files and compile them in the `dist` folder.

## DEBUG environment

When debugging, stop the execution of the Docker container named `api`, then:

1. Execute the following command in a terminal window, in the api folder: `npm run debug`. This will start a `ts-node-dev` instance with the `--inspect` flag.
1. Go to the `Run and Debug` tab of visual studio, select `Node: TypeScript` and then press the green play button (or F5).

\* `ts-node-dev` does not need to compile the TypeScript files to the `dist` folder as is the case for the `dev` environment. It acts as a replacement for `nodemon` and `ts-node`, to execute TypeScript without precompiling and restart the server after every change.

For additional information, please consult [the ts-node-dev npm Homepage](https://www.npmjs.com/package/ts-node-dev).

## Compiling Less

If you have to modify less files to alter the styling of a web page, you should do so by modifing files in the `public\less` folder.
Files present in the `public\css` should never be altered as they are the result of compiled less files.
All `.css` files should be in the `public\css` folder and all `.less` files in the `public\less` folder.

If you are using Visual Studio Code, here are the instructions on how to compile `.less` into `.css`:

1. Install the `Easy LESS` extension
1. Click on the gear (settings) icon located at the bottom left of Visual Studio Code and then click on `Settings`
1. Search for `Easy LESS`, select `Easy LESS configuration` and click `Edit in settings.json`
1. Add or modify the `less.compile` section so it looks like this:

```javascript
  "less.compile": {
    "out": "../../css/",
    "compress": true
  },
```

1. Save and you're all set! When you save a `.less` file, a `.css` file will be created in the appropriate folder.

\* To ignore compilation of a file, copy `// out: false` and paste it at the top of your file. These files will not be copiled in `.css` when saving.

For additional information, please consult [the Easy Less Marketplace Homepage](https://marketplace.visualstudio.com/items?itemName=mrcrowl.easy-less).

## You're good to go!

After finishing the Installation and Database Setup, you should be good to go. Start a project and try it out.
