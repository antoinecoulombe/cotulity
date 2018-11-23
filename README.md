# Cotulity
**Cotulity is a work in progress and no release version have been released yet.** 

Cotulity is a web application to help students manage their day-to-day life with roommates.

## Installation
Before starting with the project, make sure to follow these steps to have the latest project on-hand:
1. Download and Install Node.js and npm
1. Make sure you have the latest version of npm downloaded:
`npm install npm@latest -g`
1. Install sequelize globally:
`npm install -g sequelize-cli`
1. Install all dependencies for the project, including Sequelize and MySql2, locally: 
`npm install`
1. Install Xampp (will be replaced by Docker in the near future)

## Database Setup
After the project is correctly installed, you must run the migrations and seeds to have a working project. Migrations and seeds can be run with the following commands:
1. `sequelize db:migrate`
1. `sequelize db:seed:all`

If the migration script fails to execute completely, the database linked to the project might not be empty. This problem can be solved by running the following command:
`sequelize db:migrate:undo:all` and then re-execute the previous two commands.

## You're good to go!
After finishing the Installation and Database Setup, you should be good to go. Start a project and try it out.