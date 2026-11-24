# Backend Setup

## Database Setup

1. Create a database named `notes_app` in MySQL.
2. Open MySQL Workbench and connect to your server.
3. Select `notes_app` from the SCHEMAS panel.
4. Open the `database/schema.sql` file.
5. Run the SQL script to create the required tables.

## Run Backend

1. Open the backend folder in the terminal.
2. Install the required packages:

   ```
   npm install
   ```

3. Create a `.env` file and add your database and JWT settings.
4. Start the backend:

   ```
   npm run dev
   ```

The backend runs at `http://localhost:5000`.