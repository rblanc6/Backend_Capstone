### RACipe Hub

<div align= "center">
  <img src="https://res.cloudinary.com/dyrhxocab/image/upload/v1741730364/logo_tuefhq.jpg" width=200px/>
</div>

A central space for all things food, offering the essence of a community-driven recipe platform.

### Developed By:

- Rebecca Blanchard
- Amy Benner
- Cory Snapp

### Built with:

- [![Visual Studio Code]][VSC-url]
- [![Prisma]][Prisma-url]
- [![Express.js]][Express-url]
- [![Node.js]][Node-url]
- [![Postgres]][Postgres-url]
- [![JavaScript]][JavaScript-url]

### Getting Started:

Prerequisites

- npm
  ```sh
  install npm@latest -g
  ```

Installation

1. Clone the repo
   ```sh
   git clone git@github.com:CLSnapp/Backend_Capstone.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create a new database
   ```sh
   psql -U postgres
   CREATE DATABASE racipe_hub;
   \q
   ```
4. Create a .env file with the following variables
   ```sh
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/racipe_hub?schema=public"
   JWT_SECRET=<your_jwt_secret>
   CLOUD_NAME=<your_cloud_name>
   API_KEY=<your_api_key>
   API_SECRET=<your_api_secret>
   ```
5. Run Migrations
   ```sh
   npx prisma migrate dev
   ```
6. Seed database
   ```sh
   npm run seed
   ```
7. Run the development environment
   ```sh
   npm run server:dev
   ```

<!-- Links -->

[Visual Studio Code]: https://custom-icon-badges.demolab.com/badge/Visual%20Studio%20Code-0078d7.svg?logo=vsc&logoColor=white
[VSC-url]: https://code.visualstudio.com/
[Prisma]: https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white
[Prisma-url]: https://www.prisma.io/
[Node.js]: https://img.shields.io/badge/Node.js-6DA55F?logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/en
[Express.js]: https://img.shields.io/badge/Express.js-%23404d59.svg?logo=express&logoColor=%2361DAFB
[Express-url]: https://expressjs.com/
[Postgres]: https://img.shields.io/badge/Postgres-%23316192.svg?logo=postgresql&logoColor=white
[Postgres-url]: https://www.postgresql.org/
[JavaScript]: https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000
[JavaScript-url]: https://www.javascript.com/
