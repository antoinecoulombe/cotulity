# Cotulity
**Cotulity is a work in progress and no release version have been released yet.** 

Cotulity is a web application to help students manage their day-to-day life with roommates.

## Installation
Before starting with the project, make sure to follow these steps to have the latest project on-hand:
1. Download and Install Node.js and npm
1. Make sure you have the latest version of npm downloaded:
```npm install npm@latest -g```
1. Install sequelize globally:
```npm install -g sequelize-cli```
1. Install all dependencies for the project, including Sequelize and MySql2, locally: 
```npm install```
1. Install Xampp (will be replaced by Docker in the near future)

## Database Setup
After the project is correctly installed, you must run the migrations and seeds to have a working project. Migrations and seeds can be run with the following commands:
1. `sequelize db:migrate`
1. `sequelize db:seed:all`

If the migration script fails to execute completely, the database linked to the project might not be empty. This problem can be solved by running the following command:
`sequelize db:migrate:undo:all` and then re-executing the previous two commands.

If the seed script fails to execute completely, there might be a problem with the auto-incrementing primary keys. This problem can be solved by undoing the migration (dropping the tables)
and running the migration and seed scripts again (first two commands of the "Database Setup" section).

## Compiling Less
If you have to modify less files to alter the styling of a web page, you should do so by modifing files in the `client\less` folder. 
Files present in the `client\css` should never be altered as they are the result of compiled less files. 
All `.css` files should be in the `client\css` folder and all `.less` files in the `client\less` folder.

If you are using Visual Studio Code, here are the instructions on how to compile `.less` into `.css`:
1. Install the `Easy Compile` extension from the marketplace
1. Click on the gear(setting) icon in the bottom left corner of the Visual Studio Code window and then click on `Settings`
1. Navigate to Extensions > Easy Compile configuration
1. Under `Easy Compile: Compile`, click `Edit in settings.json`
1. In the right window, copy the following after the existing options:
```javascript
"easycompile.compile": {
    "ignore" : [
        "**/_*.less"
    ],
    "minifyCssOnSave": true
},
"easycompile.less": { 
    "out": "../css/", 
    "compress": true 
}
```
6. Save and you're all set! When you save a `.less` file, a `.css` file will be created in the `client/css` folder.

\* Please note that files starting with `_` are considered partial files and will not be compiled in `.css` when saving.

## You're good to go!
After finishing the Installation and Database Setup, you should be good to go. Start a project and try it out.