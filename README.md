# Cotulity

**Cotulity is a work in progress and no release version has been released yet.**

Cotulity is a web application to help students manage their day-to-day life with roommates.

## Run with Docker

To start Cotulity, and all of its microservices dockers, run the following command at the project's root:

```bash
$ npm run dev
```

Once started, initialize (migrate and seed) the database by running the following command at the root of the project:

```bash
$ npm run db:init
```

You can now run Cotulity! Just go to <http://localhost:5101/>.

## Run Locally

To start Cotulity locally, follow these steps:

1. Follow the steps below `Run with Docker`.
1. Shut down all containers except `frontend, db, phpmyadmin and nginx`.
1. Download and Install Node.js, npm and Docker.
1. Make sure you have the latest version of npm downloaded:
   `npm install npm@latest -g`
1. Install sequelize globally:
   `npm install -g sequelize-cli`
1. If you are not at the project's root, move to it.
1. Install node packages for the frontend and all microservices:
   `npm run install:all`
1. Once all packages are installed, run Cotulity:
   `npm run dev:local`

You can now run and debug Cotulity Locally! Just go to <http://localhost:5101/>.

## Database Setup

To migrate or update the database, run the following command in a new terminal window:

```bash
$ docker-compose exec api npm run migrate
```

To seed the database, run the following command in a new terminal window:

```bash
$ docker-compose exec api npm run seed
```

To rebuild the database, clear all data and insert all seeds, run the following command in a new terminal window:

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

1. Install `gulp` globally: `npm install -g gulp`.
1. Make sure the npm packages are installed at the root of the project.
1. In a terminal at the root of the project, run `gulp`.
1. You're all set! When you save a `.less` file, a `.css` file will be created in the appropriate folder.

\* To ignore compilation of a file, prefix them with an underscore (\_). These files will not be compiled in `.css` when saving.

For additional information, please consult [this help page](https://code.visualstudio.com/docs/languages/css).

## You're good to go!

After finishing the Installation and Database Setup, you should be good to go. Start a project and try it out.
