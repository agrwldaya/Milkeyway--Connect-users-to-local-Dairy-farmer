import { pool } from "./database.js";

const connectToDb = async()=>{
    try {
        const client = await pool.connect();
        console.log("Database connected successfully");
        client.release();

        return pool
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1);
    }
}
    
const closeDb = async()=>{
    try {
        await pool.end();
        console.log("Database connection closed");
    } catch (error) {
        console.error("Error closing the database connection:", error);
        throw error;
    }
}

export { connectToDb, closeDb,pool}; 