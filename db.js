const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',          // your Postgres username
    host: 'localhost',
    database: 'BlogDatabase',        // the name of your database
    password: 'Zack1Mac',
});

module.exports = pool;