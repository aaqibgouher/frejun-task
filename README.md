# 🚀 Railway Ticket Reservation API

Create a RESTful API that manages railway ticket reservations

## System Requirements
Ensure your system meets the following requirements before proceeding:

- **Node.js**: v21.2.0 or higher
- **npm/yarn**: Latest version
- **Postgres**: for backend database

## Installation Instructions
In Github, client & server reside under the same directory, so just clone the parent one.
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo-url.git

2. Open project in any editor:
    ```bash
    cd repo

3. Install dependencies:
   ```bash
   npm install

4. Set up environment variables:
    - Copy ./env.example to ./.env
    - Update .env with appropriate values for your local setup.
    - Make sure, you add local psql creds & create db

5. Prisma ORM Setup:
   ```bash
   npx prisma generate
   npm run migrate

6. Start the backend server:
    ```bash
   npm run dev

Once server is started, if prisma initialisation, migration, db setup done correctly, we can able to see the log.

## DB Schema
![Image Alt Text](./fre_jun_db-Page-1.drawio.png)
