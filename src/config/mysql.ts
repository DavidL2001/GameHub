/* mySQL Node connection*/

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

//pool sparar upp till 10 återanvändbara databas connection, detta gör det snabbare och mer stabilt
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST!,
  user: process.env.MYSQL_USER!,
  password: process.env.MYSQL_PASSWORD!,
  database: process.env.MYSQL_DB!,
  waitForConnections: true,
  connectionLimit: 10
});

export default pool;

// "!" (non null assertion operator), definerar att det kommer finnas data
/* Källa: https://www.mongodb.com/docs/manual/administration/connection-pool-overview/#std-label-connection-pool-overview */