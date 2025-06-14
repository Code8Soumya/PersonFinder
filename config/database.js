import "dotenv/config";
import { createPool } from "mysql2/promise";

function initializeDatabasePool() {
    console.log("[DB] Attempting to configure database connection pool...");
    try {
        const pool = createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 5,
        });
        console.log("[DB] Database connection pool configured successfully.");
        return pool;
    } catch (error) {
        console.error("[DB] Error during database pool configuration:");
        console.error(error);
        return null;
    }
}

const db = initializeDatabasePool();

export { db };
