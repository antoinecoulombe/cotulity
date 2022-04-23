# Cotulity

**Cotulity is a work in progress and no release version has been released yet.**

Cotulity is a web application to help students manage their day-to-day life with roommates.

## Run with Docker

First, create a database provision file named `01-databases.sql` at `/docker/provision/mysql/init` containing all database users and passwords.

Then, to start Cotulity and all of its microservices containers, run the following command at the project's root:

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

To migrate or update the database, run the following command in a new terminal window at the location `/api/shared/`:

```bash
$ npm run migrate
```

To seed the database, run the following command in a new terminal window:

```bash
$ npm run seed
```

To rebuild the database, clear all data and insert all seeds, run the following command in a new terminal window:

```bash
$ npm run migrate:reset
```

If the migration script fails to execute completely, make sure to drop all tables previously created before running it again, using the following command: `npm run migrate:reset`.

If the seed script fails to execute completely, there might be a problem with the auto-incrementing primary keys. This problem can be solved by undoing the migration (dropping the tables) and running the migration and seed scripts again (first two commands of the "Database Setup" section after the initial Docker setup).

If you get an `Execution_Policy` error while running the migration or seed scripts, open Powershell as an Administrator and type in `Set-ExecutionPolicy RemoteSigned`, then confirm by pressing `Y`.

## Testing

To run tests, run the following command in a new terminal window at the project's root:

```bash
$ npm run test
```

\*This will create new test containers on different ports. Tests located in `/api/test/__tests__` will then be executed.

If one or more tests fails, `1` will be returned by the container, otherwise, `0` will be returned.

Since these tests are run on different ports than the development ones, they can be run while the development containers are up.

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
